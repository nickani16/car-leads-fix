import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getBillingProduct,
  productToLegacyListingPackage,
  type BillingProduct,
} from '@/lib/billing/product-catalog'

type PaymentOrderRow = {
  id: string
  user_id: string
  business_id: string | null
  listing_id: string | null
  product_key: string
  market: string
  currency: string
  amount_minor: number
  status: string
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid' && session.mode !== 'subscription') return false

  const orderId = session.metadata?.internal_order_id || session.metadata?.orderId
  if (!orderId) throw new Error('Stripe session missing internal order id')

  const admin = createAdminClient()
  const { data: order, error } = await admin
    .from('payment_orders')
    .select('id,user_id,business_id,listing_id,product_key,market,currency,amount_minor,status')
    .eq('id', orderId)
    .maybeSingle()

  if (error) throw error
  if (!order) throw new Error('Payment order not found')
  if (order.status === 'fulfilled' || order.status === 'refunded') return true

  const paymentIntent =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null
  const subscription =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id || null

  const now = new Date().toISOString()
  const { error: paidError } = await admin
    .from('payment_orders')
    .update({
      status: 'paid',
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntent,
      stripe_subscription_id: subscription,
      paid_at: now,
      updated_at: now,
    })
    .eq('id', order.id)
    .in('status', ['created', 'checkout_created', 'pending', 'failed'])
  if (paidError) throw paidError

  const product = getBillingProduct(order.product_key)
  if (!product) throw new Error(`Unknown billing product: ${order.product_key}`)

  if (product.kind === 'listing_package') {
    return fulfillListingPackage(order, product)
  }
  if (product.kind === 'addon') {
    return fulfillAddOn(order, product)
  }
  if (product.kind === 'subscription') {
    return fulfillBusinessSubscription(order, product, session)
  }
  return false
}

export async function markCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.internal_order_id || session.metadata?.orderId
  if (!orderId) return
  await createAdminClient()
    .from('payment_orders')
    .update({
      status: 'expired',
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .in('status', ['created', 'checkout_created', 'pending'])
}

export async function markOrderFailedByPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.internal_order_id
  const admin = createAdminClient()
  const match = orderId
    ? admin.from('payment_orders').update({
        status: 'failed',
        failure_reason: paymentIntent.last_payment_error?.message || 'payment_failed',
        updated_at: new Date().toISOString(),
      }).eq('id', orderId)
    : admin.from('payment_orders').update({
        status: 'failed',
        failure_reason: paymentIntent.last_payment_error?.message || 'payment_failed',
        updated_at: new Date().toISOString(),
      }).eq('stripe_payment_intent_id', paymentIntent.id)
  await match
}

export async function markOrderRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
  if (!paymentIntentId) return
  await createAdminClient()
    .from('payment_orders')
    .update({
      status: charge.amount_refunded >= charge.amount ? 'refunded' : 'partially_refunded',
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntentId)
}

async function fulfillListingPackage(order: PaymentOrderRow, product: BillingProduct) {
  if (!order.listing_id || !product.durationDays) throw new Error('Listing package order missing listing or duration')
  const admin = createAdminClient()
  const { data: listing, error: listingError } = await admin
    .from('marketplace_listings')
    .select('id,status,review_status')
    .eq('id', order.listing_id)
    .eq('seller_user_id', order.user_id)
    .maybeSingle()
  if (listingError) throw listingError
  if (!listing) throw new Error('Listing not found for paid package')

  const legacyPackage = productToLegacyListingPackage(product)
  if (!legacyPackage) throw new Error('Paid product is not a listing package')

  const now = new Date()
  const expiresAt = new Date(now.getTime() + product.durationDays * 86_400_000)
  const canPublishNow =
    listing.review_status === 'approved' &&
    (listing.status === 'pending_payment' || listing.status === 'draft')
  const updates: Record<string, unknown> = {
    package_id: legacyPackage,
    priority: 0,
  }

  if (product.package === 'premium') {
    updates.premium_badge_expires_at = canPublishNow ? expiresAt.toISOString() : null
    updates.boost_status = canPublishNow ? 'active' : 'pending'
    updates.boost_started_at = canPublishNow ? now.toISOString() : null
    updates.boost_expires_at =
      canPublishNow && product.includedBoostDays
        ? new Date(now.getTime() + product.includedBoostDays * 86_400_000).toISOString()
        : null
    updates.boost_purchase_id = order.id
  }

  if (canPublishNow) {
    updates.status = 'published'
    updates.published_at = now.toISOString()
    updates.expires_at = expiresAt.toISOString()
  } else {
    updates.status = 'pending_review'
    updates.published_at = null
    updates.expires_at = null
  }

  const { error: updateError } = await admin
    .from('marketplace_listings')
    .update(updates)
    .eq('id', order.listing_id)
  if (updateError) throw updateError

  await finishOrder(order, canPublishNow ? 'fulfilled' : 'paid', {
    fulfillment: canPublishNow ? 'listing_published' : 'awaiting_review',
  })
  return true
}

async function fulfillAddOn(order: PaymentOrderRow, product: BillingProduct) {
  if (product.addon?.startsWith('refresh')) {
    const credits = product.refreshCredits || 0
    if (!credits) throw new Error('Refresh product missing credits')
    const { error: creditError } = await createAdminClient().rpc('increment_refresh_credits', {
      p_owner_type: 'user',
      p_owner_id: order.user_id,
      p_credits: credits,
      p_payment_order_id: order.id,
    })
    if (creditError) throw creditError
    await finishOrder(order, 'fulfilled', { fulfillment: 'refresh_credits_added', credits })
    return true
  }

  if (!order.listing_id || !product.durationDays) throw new Error('Add-on order missing listing or duration')
  const admin = createAdminClient()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + product.durationDays * 86_400_000)
  const updates =
    product.addon?.startsWith('top_placement')
      ? {
          boost_status: 'active',
          boost_started_at: now.toISOString(),
          boost_expires_at: expiresAt.toISOString(),
          boost_purchase_id: order.id,
        }
      : {
          featured_status: 'active',
          featured_started_at: now.toISOString(),
          featured_expires_at: expiresAt.toISOString(),
          featured_purchase_id: order.id,
        }
  const { error } = await admin
    .from('marketplace_listings')
    .update(updates)
    .eq('id', order.listing_id)
    .eq('seller_user_id', order.user_id)
    .eq('status', 'published')
  if (error) throw error
  await finishOrder(order, 'fulfilled', { fulfillment: product.addon })
  return true
}

async function fulfillBusinessSubscription(
  order: PaymentOrderRow,
  product: BillingProduct,
  session: Stripe.Checkout.Session,
) {
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id || null
  if (!subscriptionId || !product.businessPlan) {
    throw new Error('Subscription order missing Stripe subscription or business plan')
  }
  await createAdminClient().from('business_subscriptions').upsert({
    user_id: order.user_id,
    business_id: order.business_id,
    product_key: product.productKey,
    market: order.market,
    currency: order.currency,
    plan_key: product.businessPlan,
    active_listing_limit: product.activeListingLimit || null,
    stripe_customer_id:
      typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
    stripe_subscription_id: subscriptionId,
    status: 'active',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'stripe_subscription_id' })
  await finishOrder(order, 'fulfilled', { fulfillment: 'business_subscription_active' })
  return true
}

async function finishOrder(order: PaymentOrderRow, status: 'paid' | 'fulfilled', metadata: Record<string, unknown>) {
  const now = new Date().toISOString()
  const admin = createAdminClient()
  await admin
    .from('payment_orders')
    .update({
      status,
      fulfilled_at: status === 'fulfilled' ? now : null,
      updated_at: now,
      metadata,
    })
    .eq('id', order.id)
    .in('status', ['paid', 'checkout_created', 'pending'])
  await admin.from('payment_audit_log').insert({
    payment_order_id: order.id,
    user_id: order.user_id,
    listing_id: order.listing_id,
    action: status,
    metadata,
  })
}
