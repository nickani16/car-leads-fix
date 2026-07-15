import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'
import { sendBusinessBillingEmail } from '@/lib/email/business-billing'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const limit = checkRateLimit({
    key: `business-subscription-cancel:${user.id}:${getClientIp(request)}`,
    limit: 4,
    windowMs: 10 * 60 * 1000,
  })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  const body = (await request.json().catch(() => ({}))) as { reason?: string }
  const reason = String(body.reason || '').trim().slice(0, 1200)
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('account_type')
    .eq('user_id', user.id)
    .maybeSingle()
  if (profile?.account_type !== 'business') {
    return NextResponse.json({ error: 'Business account required.' }, { status: 403 })
  }

  const { data: subscription, error } = await admin
    .from('business_subscriptions')
    .select('id,plan_key,product_key,active_listing_limit,market,currency,status,stripe_subscription_id,current_period_end,next_billing_at,cancel_at_period_end')
    .eq('user_id', user.id)
    .neq('plan_key', 'free')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) return NextResponse.json({ error: 'Could not load subscription.' }, { status: 500 })
  if (!subscription) return NextResponse.json({ error: 'No paid subscription found.' }, { status: 404 })
  if (subscription.cancel_at_period_end) {
    return NextResponse.json({ success: true, alreadyScheduled: true })
  }

  const now = new Date().toISOString()
  let effectiveAt = subscription.current_period_end || subscription.next_billing_at || null
  let stripeStatus = subscription.status
  if (subscription.stripe_subscription_id) {
    const updated = await getStripe().subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
      metadata: {
        cancellation_requested_by: user.id,
        cancellation_requested_at: now,
      },
    })
    const periodEnd = subscriptionPeriodEnd(updated)
    effectiveAt = periodEnd || effectiveAt
    stripeStatus = updated.status || stripeStatus
  }

  const { error: updateError } = await admin
    .from('business_subscriptions')
    .update({
      cancel_at_period_end: true,
      cancellation_requested_at: now,
      cancellation_effective_at: effectiveAt,
      cancellation_reason: reason || null,
      status: stripeStatus,
      updated_at: now,
    })
    .eq('id', subscription.id)
    .eq('user_id', user.id)
  if (updateError) {
    return NextResponse.json({ error: 'Could not save cancellation.' }, { status: 500 })
  }

  await admin.from('business_subscription_events').insert({
    subscription_id: subscription.id,
    user_id: user.id,
    event_type: 'cancellation_scheduled',
    from_plan: subscription.plan_key,
    metadata: {
      reason: reason || null,
      effective_at: effectiveAt,
      stripe_subscription_id: subscription.stripe_subscription_id || null,
    },
  })

  await sendBusinessBillingEmail(admin, {
    deliveryKey: `business-cancellation-scheduled-${subscription.id}-${Date.now()}`,
    kind: 'cancellation_scheduled',
    userId: user.id,
    subscriptionId: subscription.id,
    planKey: subscription.plan_key,
    activeListingLimit: subscription.active_listing_limit,
    dueAt: effectiveAt,
    market: subscription.market,
    currency: subscription.currency,
  })

  return NextResponse.json({ success: true, effectiveAt })
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const value = (subscription as Stripe.Subscription & { current_period_end?: number | null }).current_period_end
  return typeof value === 'number' ? new Date(value * 1000).toISOString() : null
}
