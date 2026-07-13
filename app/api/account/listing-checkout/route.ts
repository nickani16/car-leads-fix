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
  const checkoutBranding = createCheckoutBranding()
  const checkoutProduct = createCheckoutProductCopy(product.productKey, listing?.title)
  const metadata = {
    user_id: user.id,
    business_id: body.businessId || '',
    listing_id: listing?.id || '',
    product_key: product.productKey,
    market,
    internal_order_id: order.id,
  }
  let session
  try {
    session = await getStripe().checkout.sessions.create({
      mode: product.billingType,
      branding_settings: checkoutBranding,
      locale: stripeLocaleForMarket(market),
      submit_type: 'pay',
      customer_email: profile.email,
      client_reference_id: order.id,
      line_items: [
        {
          price_data: {
            currency: price.currency,
            unit_amount: price.amountMinor,
            recurring:
              product.billingType === 'subscription'
                ? { interval: product.billingInterval || 'month' }
                : undefined,
            product_data: {
              name: checkoutProduct.name,
              description: checkoutProduct.description,
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
      custom_text: {
        submit: {
          message: checkoutProduct.submitText,
        },
        after_submit: {
          message: 'Säker betalning via Stripe. Du skickas tillbaka till Autorell efter genomfört köp.',
        },
      },
      success_url: `${origin}/account/listings?payment=processing&order=${order.id}`,
      cancel_url: `${origin}/account/listings?payment=cancelled&order=${order.id}`,
    })
  } catch (error) {
    console.error('[listing-checkout] Could not create Stripe checkout session', {
      orderId: order.id,
      productKey: product.productKey,
      market,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === 'Missing STRIPE_SECRET_KEY'
            ? 'Stripe checkout is not configured for this environment.'
            : 'Stripe checkout could not be started.',
      },
      { status: 503 },
    )
  }

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

function createCheckoutBranding() {
  return {
    display_name: 'Autorell',
    background_color: '#ffffff',
    button_color: '#0866ff',
    border_style: 'rounded' as const,
    font_family: 'inter' as const,
    logo: {
      type: 'url' as const,
      url: 'https://www.autorell.com/autorell-logo-primary.png',
    },
  }
}

function createCheckoutProductCopy(productKey: string, listingTitle?: string | null) {
  const listingContext = listingTitle ? `${listingTitle} · ` : ''

  if (productKey.startsWith('listing.')) {
    const [, category, packageName] = productKey.split('.')
    const categoryLabel = checkoutCategoryLabel(category)
    const packageLabel = packageName === 'premium' ? 'Premiumannons' : 'Standardannons'
    const duration = packageName === 'premium' ? '30 dagar' : '15 dagar'
    return {
      name: `${packageLabel} · ${categoryLabel}`,
      description:
        packageName === 'premium'
          ? `${listingContext}${duration} publicering med extra synlighet och inkluderad toppplacering.`
          : `${listingContext}${duration} publicering på Autorells europeiska fordonsmarknad.`,
      submitText:
        packageName === 'premium'
          ? 'Annonsen får högre synlighet automatiskt när betalningen har bekräftats.'
          : 'Annonsen publiceras automatiskt när betalningen har bekräftats.',
    }
  }

  if (productKey.startsWith('addon.top_placement')) {
    const days = productKey.includes('14') ? '14 dagar' : productKey.includes('7') ? '7 dagar' : '3 dagar'
    return {
      name: `Topplacering · ${days}`,
      description: `${listingContext}Lyft annonsen högre i listningen under ${days}.`,
      submitText: 'Topplaceringen aktiveras automatiskt när betalningen har bekräftats.',
    }
  }

  if (productKey.startsWith('addon.featured')) {
    const days = productKey.includes('30') ? '30 dagar' : '7 dagar'
    return {
      name: `Utvald annons · ${days}`,
      description: `${listingContext}Visa annonsen som utvald på Autorell under ${days}.`,
      submitText: 'Utvald synlighet aktiveras automatiskt när betalningen har bekräftats.',
    }
  }

  if (productKey.startsWith('addon.refresh')) {
    return {
      name: 'Annonsförnyelse',
      description: `${listingContext}Förnya annonsens sorteringsdatum och få ny synlighet.`,
      submitText: 'Förnyelsen aktiveras automatiskt när betalningen har bekräftats.',
    }
  }

  if (productKey.startsWith('subscription.business.')) {
    const plan = productKey.split('.')[2] || 'business'
    return {
      name: `Företag · ${capitalize(plan)}`,
      description: 'Månadsabonnemang för företag som säljer fordon på Autorell.',
      submitText: 'Företagsabonnemanget aktiveras automatiskt när betalningen har bekräftats.',
    }
  }

  return {
    name: 'Köp på Autorell',
    description: `${listingContext}Betalning för Autorells fordonsmarknad.`,
    submitText: 'Köpet aktiveras automatiskt när betalningen har bekräftats.',
  }
}

function checkoutCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    cars: 'Bil',
    vans: 'Transportbil',
    motorcycles: 'Motorcykel',
    motorhomes: 'Husbil',
    caravans: 'Husvagn',
    trucks: 'Lastbil',
    agriculture: 'Lantbruksmaskin',
    construction: 'Entreprenadmaskin',
    'electric-bikes': 'Cykel',
    'e-scooters': 'Elsparkcykel',
  }
  return labels[category] || capitalize(category.replace(/-/g, ' '))
}

function stripeLocaleForMarket(market: string) {
  const locales: Record<string, 'sv' | 'da' | 'de' | 'fr' | 'it' | 'es' | 'nl' | 'pl' | 'fi'> = {
    se: 'sv',
    dk: 'da',
    de: 'de',
    fr: 'fr',
    it: 'it',
    es: 'es',
    nl: 'nl',
    be: 'nl',
    at: 'de',
    pl: 'pl',
    fi: 'fi',
  }
  return locales[market] || 'sv'
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
