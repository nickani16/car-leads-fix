import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'

export const listingPackages = {
  extended_7d: {
    name: '5 dagars budgivning',
    description: 'Fortsatt synlighet för verifierade bilhandlare i 5 dagar.',
    amountCents: 10000,
    durationDays: 5,
    priority: 0,
  },
  premium_30d: {
    name: 'Premium 15 dagar',
    description:
      'Prioriterad placering och utökad synlighet för verifierade bilhandlare i 15 dagar.',
    amountCents: 29000,
    durationDays: 15,
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

  if (order.status === 'paid' || order.status === 'refunded') return true

  const listingPackage = listingPackages[packageId]
  const { data: lead, error: leadReadError } = await supabase
    .from('leads')
    .select('status')
    .eq('id', leadId)
    .single()

  if (leadReadError || !lead) {
    throw new Error('Vehicle lead was not found')
  }

  if (lead.status === 'Rejected' || lead.status === 'Cancelled') {
    const paymentIntent =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null

    if (paymentIntent) {
      await getStripe().refunds.create(
        {
          payment_intent: paymentIntent,
          metadata: {
            leadId,
            reason: 'vehicle_not_approved',
          },
        },
        { idempotencyKey: `rejected-listing-${session.id}` }
      )
    }

    await supabase
      .from('seller_listing_orders')
      .update({
        status: 'refunded',
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntent,
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return true
  }

  const shouldActivateNow = lead.status === 'Active'
  const activatedAt = shouldActivateNow ? new Date() : null
  const expiresAt = activatedAt
    ? new Date(
        activatedAt.getTime() +
          listingPackage.durationDays * 24 * 60 * 60 * 1000
      )
    : null

  const { count: dealerReach } = await supabase
    .from('dealers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { error: leadError } = await supabase
    .from('leads')
    .update({
      auction_starts_at: activatedAt?.toISOString() || null,
      auction_ends_at: expiresAt?.toISOString() || null,
      ...(shouldActivateNow
        ? { auction_closed_at: null, auction_outcome: null }
        : {}),
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
      paid_at: new Date().toISOString(),
      activated_at: activatedAt?.toISOString() || null,
      expires_at: expiresAt?.toISOString() || null,
    })
    .eq('id', orderId)
    .eq('status', 'pending')

  if (orderUpdateError) throw orderUpdateError
  return true
}
