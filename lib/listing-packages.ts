import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { listingPackageDetails } from '@/lib/marketplace-pricing'

export const listingPackages = listingPackageDetails
export type ListingPackage = keyof typeof listingPackages

export function isListingPackage(value: unknown): value is ListingPackage {
  return typeof value === 'string' && value in listingPackages
}

export async function fulfillListingCheckout(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return false

  const orderId = session.metadata?.orderId
  const listingId = session.metadata?.listingId
  const packageId = session.metadata?.package
  if (
    !orderId ||
    !listingId ||
    !isListingPackage(packageId) ||
    packageId === 'free_7d'
  ) {
    throw new Error('Stripe session is missing marketplace listing metadata')
  }

  const supabase = createAdminClient()
  const { data: order, error: orderError } = await supabase
    .from('marketplace_listing_orders')
    .select('id,status')
    .eq('id', orderId)
    .eq('listing_id', listingId)
    .single()
  if (orderError || !order) {
    throw new Error('Marketplace listing order was not found')
  }
  if (order.status === 'paid' || order.status === 'refunded') return true

  const now = new Date()
  const details = listingPackages[packageId]
  const expiresAt = new Date(now.getTime() + details.durationDays * 86_400_000)
  const paymentIntent =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null

  const { error: listingError } = await supabase
    .from('marketplace_listings')
    .update({
      status: 'pending_review',
      package_id: packageId,
      priority: details.priority,
      expires_at: expiresAt.toISOString(),
    })
    .eq('id', listingId)
    .eq('status', 'pending_payment')
  if (listingError) throw listingError

  const { error: updateError } = await supabase
    .from('marketplace_listing_orders')
    .update({
      status: 'paid',
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntent,
      paid_at: now.toISOString(),
    })
    .eq('id', orderId)
    .eq('status', 'pending')
  if (updateError) throw updateError

  return true
}
