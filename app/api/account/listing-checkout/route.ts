import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import {
  getListingPrice,
  type MarketplacePackage,
} from '@/lib/marketplace-pricing'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const { listingId, packageId } = (await request.json()) as {
    listingId?: string
    packageId?: MarketplacePackage
  }
  if (!listingId || !packageId || packageId === 'free_7d') {
    return NextResponse.json({ error: 'Invalid checkout.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const [{ data: profile }, { data: listing }] = await Promise.all([
    admin
      .from('marketplace_profiles')
      .select('account_type,email')
      .eq('user_id', user.id)
      .maybeSingle(),
    admin
      .from('marketplace_listings')
      .select('id,seller_user_id,category,title')
      .eq('id', listingId)
      .maybeSingle(),
  ])
  if (!profile || !listing || listing.seller_user_id !== user.id) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  const price = getListingPrice(listing.category, packageId, profile.account_type)
  const { data: order, error } = await admin
    .from('marketplace_listing_orders')
    .insert({
      listing_id: listing.id,
      seller_user_id: user.id,
      package_id: packageId,
      amount_minor: price * 100,
      currency: 'SEK',
    })
    .select('id')
    .single()
  if (error || !order) {
    return NextResponse.json({ error: error?.message }, { status: 400 })
  }

  const origin = new URL(request.url).origin
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    customer_email: profile.email,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'sek',
          unit_amount: price * 100,
          product_data: {
            name: `${packageId === 'standard_15d' ? '15 dagar' : 'Premium 30 dagar'} – ${listing.title}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: order.id,
      listingId: listing.id,
      package: packageId,
    },
    success_url: `${origin}/konto/annonser?payment=success`,
    cancel_url: `${origin}/konto/annonser?payment=cancelled`,
  })

  await admin
    .from('marketplace_listing_orders')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', order.id)

  return NextResponse.json({ url: session.url })
}
