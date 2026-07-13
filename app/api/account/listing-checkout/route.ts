import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'
import {
  getBillingProduct,
  legacyListingPackageToProductKey,
  normalizeBillingMarket,
  normalizeListingCategory,
} from '@/lib/billing/product-catalog'
import { resolveBillingPrice } from '@/lib/billing/price-lookup'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const limit = checkRateLimit({
    key: `listing-checkout:${user.id}:${getClientIp(request)}`,
    limit: 12,
    windowMs: 10 * 60 * 1000,
  })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  const body = (await request.json()) as {
    listingId?: string
    businessId?: string
    productKey?: string
    packageId?: string
    market?: string
  }

  const admin = createAdminClient()
  const market = normalizeBillingMarket(body.market)

  const [{ data: profile }, { data: listing }] = await Promise.all([
    admin
      .from('marketplace_profiles')
      .select('user_id,account_type,email,company_name')
      .eq('user_id', user.id)
      .maybeSingle(),
    body.listingId
      ? admin
          .from('marketplace_listings')
          .select('id,seller_user_id,category,title,status,country_code')
          .eq('id', body.listingId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  if (!profile) {
    return NextResponse.json({ error: 'Account profile not found.' }, { status: 403 })
  }

  const productKey =
    body.productKey ||
    (listing && body.packageId
      ? legacyListingPackageToProductKey(listing.category, body.packageId)
      : null)
  if (!productKey) {
    return NextResponse.json({ error: 'Invalid product.' }, { status: 400 })
  }

  const product = getBillingProduct(productKey)
  if (!product || product.amountMinor === undefined) {
    return NextResponse.json({ error: 'Unknown product.' }, { status: 400 })
  }

  if (product.kind === 'listing_package' || product.kind === 'addon') {
    if (!listing || listing.seller_user_id !== user.id) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }
    const listingCategory = normalizeListingCategory(listing.category)
    if (product.category && product.category !== listingCategory) {
      return NextResponse.json({ error: 'Product does not match listing category.' }, { status: 400 })
    }
    if (product.kind === 'addon' && listing.status !== 'published') {
      return NextResponse.json({ error: 'Add-ons can only be bought for published listings.' }, { status: 400 })
    }
  }

  if (product.package === 'start') {
    return NextResponse.json({ error: 'Free listings do not use Stripe checkout.' }, { status: 400 })
  }

  if (product.kind === 'subscription' && profile.account_type !== 'business') {
    return NextResponse.json({ error: 'Business subscription requires a business account.' }, { status: 403 })
  }

  const price = await resolveBillingPrice(product, market)
  if (!price || price.amountMinor <= 0) {
    return NextResponse.json({ error: 'Product is not payable for this market.' }, { status: 400 })
  }

  const stripePriceId = price.stripePriceId

  const { data: order, error: orderError } = await admin
    .from('payment_orders')
    .insert({
      user_id: user.id,
      business_id: body.businessId || null,
      listing_id: listing?.id || null,
      product_key: product.productKey,
      market,
      currency: price.currency,
      amount_minor: price.amountMinor,
      status: 'created',
      metadata: {
        legacy_package_id: body.packageId || null,
      },
    })
    .select('id')
    .single()
  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message || 'Could not create order.' }, { status: 400 })
  }

  const origin = new URL(request.url).origin
  const metadata = {
    user_id: user.id,
    business_id: body.businessId || '',
    listing_id: listing?.id || '',
    product_key: product.productKey,
    market,
    internal_order_id: order.id,
  }
  const session = await getStripe().checkout.sessions.create({
    mode: product.billingType,
    customer_email: profile.email,
    line_items: [
      stripePriceId
        ? { price: stripePriceId, quantity: 1 }
        : {
            price_data: {
              currency: price.currency,
              unit_amount: price.amountMinor,
              product_data: {
                name: checkoutProductName(product.productKey, listing?.title),
                metadata: {
                  product_key: product.productKey,
                  source: price.source,
                  required_env: price.requiredEnv || '',
                },
              },
            },
            quantity: 1,
          },
    ],
    metadata,
    payment_intent_data:
      product.billingType === 'payment'
        ? { metadata }
        : undefined,
    subscription_data:
      product.billingType === 'subscription'
        ? { metadata }
        : undefined,
    success_url: `${origin}/account/listings?payment=processing&order=${order.id}`,
    cancel_url: `${origin}/account/listings?payment=cancelled&order=${order.id}`,
  })

  await admin
    .from('payment_orders')
    .update({
      status: 'checkout_created',
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  return NextResponse.json({ url: session.url, orderId: order.id })
}

function checkoutProductName(productKey: string, listingTitle?: string | null) {
  const label = productKey
    .split('.')
    .map((part) => part.replace(/_/g, ' '))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' · ')
  return listingTitle ? `${label}: ${listingTitle}` : label
}
