import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const listingPackages = {
  extended_7d: {
    name: '7 dagars budgivning',
    description: 'Fortsatt synlighet för verifierade bilhandlare i 7 dagar.',
    amountCents: 10000,
    durationDays: 7,
    priority: 0,
  },
  premium_30d: {
    name: 'Premium 30 dagar',
    description:
      'Prioriterad placering och utökad synlighet för verifierade bilhandlare i 30 dagar.',
    amountCents: 29000,
    durationDays: 30,
    priority: 100,
  },
} as const

export type ListingPackage = keyof typeof listingPackages

export function isListingPackage(value: unknown): value is ListingPackage {
  return typeof value === 'string' && value in listingPackages
}

export async function fulfillListingCheckout(
  session: Stripe.Checkout.Session
) {
  if (session.payment_status !== 'paid') return false

  const orderId = session.metadata?.orderId
  const leadId = session.metadata?.leadId
  const packageId = session.metadata?.package

  if (!orderId || !leadId || !isListingPackage(packageId)) {
    throw new Error('Stripe session is missing listing metadata')
  }

  const supabase = createAdminClient()
  const { data: order, error: orderError } = await supabase
    .from('seller_listing_orders')
    .select('id,status')
    .eq('id', orderId)
    .eq('lead_id', leadId)
    .single()

  if (orderError || !order) {
    throw new Error('Listing order was not found')
  }

  if (order.status === 'paid') return true

  const listingPackage = listingPackages[packageId]
  const activatedAt = new Date()
  const expiresAt = new Date(
    activatedAt.getTime() +
      listingPackage.durationDays * 24 * 60 * 60 * 1000
  )

  const { count: dealerReach } = await supabase
    .from('dealers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { error: leadError } = await supabase
    .from('leads')
    .update({
      auction_starts_at: activatedAt.toISOString(),
      auction_ends_at: expiresAt.toISOString(),
      auction_closed_at: null,
      auction_outcome: null,
      listing_plan: packageId,
      listing_priority: listingPackage.priority,
      dealer_reach_snapshot: dealerReach || 0,
    })
    .eq('id', leadId)

  if (leadError) throw leadError

  const paymentIntent =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null

  const { error: orderUpdateError } = await supabase
    .from('seller_listing_orders')
    .update({
      status: 'paid',
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntent,
      dealer_reach_snapshot: dealerReach || 0,
      paid_at: activatedAt.toISOString(),
      activated_at: activatedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq('id', orderId)
    .eq('status', 'pending')

  if (orderUpdateError) throw orderUpdateError
  return true
}
