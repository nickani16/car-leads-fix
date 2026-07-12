import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  fulfillCheckoutSession,
  markCheckoutExpired,
  markOrderFailedByPaymentIntent,
  markOrderRefunded,
} from '@/lib/billing/fulfillment'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook is not configured.' },
      { status: 400 },
    )
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    )
  } catch (error) {
    console.error('Invalid Stripe webhook signature:', error)
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error: insertError } = await admin.from('stripe_webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    processing_status: 'processing',
  })
  if (insertError) {
    const duplicate =
      insertError.code === '23505' ||
      insertError.message?.toLowerCase().includes('duplicate')
    if (duplicate) return NextResponse.json({ received: true, duplicate: true })
    console.error('Stripe webhook event tracking failed:', insertError)
    return NextResponse.json({ error: 'Webhook event tracking failed.' }, { status: 500 })
  }

  try {
    await handleStripeEvent(event)
    await admin
      .from('stripe_webhook_events')
      .update({
        processing_status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('stripe_event_id', event.id)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook fulfillment error:', error)
    await admin
      .from('stripe_webhook_events')
      .update({
        processing_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown webhook error',
      })
      .eq('stripe_event_id', event.id)
    return NextResponse.json(
      { error: 'Webhook fulfillment failed.' },
      { status: 500 },
    )
  }
}

async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await fulfillCheckoutSession(event.data.object as Stripe.Checkout.Session)
      return
    case 'checkout.session.expired':
      await markCheckoutExpired(event.data.object as Stripe.Checkout.Session)
      return
    case 'payment_intent.payment_failed':
      await markOrderFailedByPaymentIntent(event.data.object as Stripe.PaymentIntent)
      return
    case 'charge.refunded':
      await markOrderRefunded(event.data.object as Stripe.Charge)
      return
    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed':
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncSubscriptionEvent(event)
      return
    default:
      return
  }
}

async function syncSubscriptionEvent(event: Stripe.Event) {
  const admin = createAdminClient()
  const object = event.data.object as {
    id?: string
    subscription?: string
    status?: string
    current_period_start?: number
    current_period_end?: number
    cancel_at_period_end?: boolean
  }
  const subscriptionId =
    event.type.startsWith('invoice.')
      ? typeof object.subscription === 'string'
        ? object.subscription
        : undefined
      : object.id
  if (!subscriptionId) return

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (object.status) updates.status = object.status
  if (typeof object.current_period_start === 'number') {
    updates.current_period_start = new Date(object.current_period_start * 1000).toISOString()
  }
  if (typeof object.current_period_end === 'number') {
    updates.current_period_end = new Date(object.current_period_end * 1000).toISOString()
  }
  if (typeof object.cancel_at_period_end === 'boolean') {
    updates.cancel_at_period_end = object.cancel_at_period_end
  }
  if (event.type === 'invoice.payment_failed') {
    const now = new Date()
    const graceDays = Number(process.env.SUBSCRIPTION_PAYMENT_GRACE_DAYS || 7)
    updates.status = 'past_due'
    updates.payment_warning_at = now.toISOString()
    updates.grace_period_ends_at = new Date(now.getTime() + Math.max(0, graceDays) * 86_400_000).toISOString()
  }
  if (event.type === 'invoice.payment_succeeded') {
    updates.status = 'active'
    updates.payment_warning_at = null
    updates.grace_period_ends_at = null
  }

  await admin
    .from('business_subscriptions')
    .update(updates)
    .eq('stripe_subscription_id', subscriptionId)
}
