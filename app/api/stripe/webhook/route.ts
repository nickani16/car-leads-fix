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
import { sendBusinessBillingEmail } from '@/lib/email/business-billing'

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
    if (duplicate) {
      const { data: existingEvent, error: lookupError } = await admin
        .from('stripe_webhook_events')
        .select('processing_status')
        .eq('stripe_event_id', event.id)
        .maybeSingle()
      if (lookupError) {
        console.error('Stripe webhook event lookup failed:', lookupError)
        return NextResponse.json({ error: 'Webhook event lookup failed.' }, { status: 500 })
      }
      if (existingEvent?.processing_status !== 'failed') {
        return NextResponse.json({ received: true, duplicate: true })
      }
      const { error: retryError } = await admin
        .from('stripe_webhook_events')
        .update({
          processing_status: 'processing',
          error_message: null,
          received_at: new Date().toISOString(),
          processed_at: null,
        })
        .eq('stripe_event_id', event.id)
        .eq('processing_status', 'failed')
      if (retryError) {
        console.error('Stripe webhook event retry tracking failed:', retryError)
        return NextResponse.json({ error: 'Webhook event retry tracking failed.' }, { status: 500 })
      }
    } else {
      console.error('Stripe webhook event tracking failed:', insertError)
      return NextResponse.json({ error: 'Webhook event tracking failed.' }, { status: 500 })
    }
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
    case 'invoice.created':
    case 'invoice.finalized':
    case 'invoice.sent':
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
  const isInvoiceEvent = event.type.startsWith('invoice.')
  const object = event.data.object as {
    id?: string
    subscription?: string | { id?: string } | null
    status?: string
    current_period_start?: number
    current_period_end?: number
    cancel_at_period_end?: boolean
  }
  const subscriptionId =
    isInvoiceEvent
      ? typeof object.subscription === 'string'
        ? object.subscription
        : object.subscription?.id
      : object.id
  if (!subscriptionId) return

  const invoice = isInvoiceEvent ? event.data.object as Stripe.Invoice : null
  if (invoice) {
    await upsertBusinessInvoice(admin, invoice, subscriptionId)
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (!isInvoiceEvent && object.status) updates.status = object.status
  if (typeof object.current_period_start === 'number') {
    updates.current_period_start = new Date(object.current_period_start * 1000).toISOString()
  }
  if (typeof object.current_period_end === 'number') {
    updates.current_period_end = new Date(object.current_period_end * 1000).toISOString()
  }
  if (typeof object.cancel_at_period_end === 'boolean') {
    updates.cancel_at_period_end = object.cancel_at_period_end
    if (object.cancel_at_period_end) {
      updates.cancellation_requested_at = new Date().toISOString()
    }
  }
  if (typeof object.current_period_end === 'number' && object.cancel_at_period_end) {
    updates.cancellation_effective_at = new Date(object.current_period_end * 1000).toISOString()
  }
  if (event.type === 'invoice.payment_failed') {
    const now = new Date()
    const graceDays = Number(process.env.SUBSCRIPTION_PAYMENT_GRACE_DAYS || 7)
    updates.status = 'past_due'
    updates.payment_status = 'failed'
    updates.payment_warning_at = now.toISOString()
    updates.grace_period_ends_at = new Date(now.getTime() + Math.max(0, graceDays) * 86_400_000).toISOString()
  }
  if (event.type === 'invoice.payment_succeeded') {
    updates.status = 'active'
    updates.payment_status = 'paid'
    updates.payment_warning_at = null
    updates.grace_period_ends_at = null
  }
  if (['invoice.created', 'invoice.finalized', 'invoice.sent'].includes(event.type)) {
    updates.payment_status = 'pending'
  }
  if (event.type === 'customer.subscription.deleted') {
    updates.status = 'canceled'
    updates.cancelled_at = new Date().toISOString()
    updates.cancellation_effective_at ||= new Date().toISOString()
  }

  await admin
    .from('business_subscriptions')
    .update(updates)
    .eq('stripe_subscription_id', subscriptionId)

  const subscription = await getBusinessSubscriptionByStripeId(admin, subscriptionId)
  if (subscription && invoice) {
    if (event.type === 'invoice.sent' || event.type === 'invoice.finalized') {
      await sendBusinessBillingEmail(admin, {
        deliveryKey: `business-invoice-ready-${invoice.id}`,
        kind: 'invoice_ready',
        userId: subscription.user_id,
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        planKey: subscription.plan_key,
        activeListingLimit: subscription.active_listing_limit,
        market: subscription.market,
        amountMinor: invoice.amount_due || invoice.total || null,
        currency: invoice.currency,
        invoiceNumber: invoice.number || null,
        invoiceUrl: invoice.hosted_invoice_url || null,
        pdfUrl: invoice.invoice_pdf || null,
        dueAt: stripeTimestampToIso(invoice.due_date || null),
      })
    }
    if (event.type === 'invoice.payment_succeeded') {
      await sendBusinessBillingEmail(admin, {
        deliveryKey: `business-payment-receipt-${invoice.id}`,
        kind: 'payment_receipt',
        userId: subscription.user_id,
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        planKey: subscription.plan_key,
        activeListingLimit: subscription.active_listing_limit,
        market: subscription.market,
        amountMinor: invoice.amount_paid || invoice.amount_due || invoice.total || null,
        currency: invoice.currency,
        invoiceNumber: invoice.number || null,
        invoiceUrl: invoice.hosted_invoice_url || null,
        pdfUrl: invoice.invoice_pdf || null,
        dueAt: stripeTimestampToIso(invoice.due_date || null),
      })
    }
    if (event.type === 'invoice.payment_failed') {
      await sendBusinessBillingEmail(admin, {
        deliveryKey: `business-payment-failed-${invoice.id}`,
        kind: 'payment_failed',
        userId: subscription.user_id,
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        planKey: subscription.plan_key,
        activeListingLimit: subscription.active_listing_limit,
        market: subscription.market,
        amountMinor: invoice.amount_remaining || invoice.amount_due || invoice.total || null,
        currency: invoice.currency,
        invoiceNumber: invoice.number || null,
        invoiceUrl: invoice.hosted_invoice_url || null,
        pdfUrl: invoice.invoice_pdf || null,
        dueAt: stripeTimestampToIso(invoice.due_date || null),
      })
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    await admin
      .from('payment_orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId)
      .in('status', ['created', 'pending', 'checkout_created'])
    if (subscription) {
      await admin
        .from('marketplace_profiles')
        .update({
          business_onboarding_status: 'active',
          verification_updated_at: new Date().toISOString(),
        })
        .eq('user_id', subscription.user_id)
    }
  }
  if (event.type === 'invoice.payment_failed') {
    await admin
      .from('payment_orders')
      .update({
        status: 'failed',
        failure_reason: 'Stripe invoice payment failed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId)
      .in('status', ['created', 'pending', 'checkout_created'])
  }
  if (event.type === 'customer.subscription.deleted' && subscription) {
    await admin
      .from('marketplace_profiles')
      .update({
        business_onboarding_status: 'cancelled',
        verification_updated_at: new Date().toISOString(),
      })
      .eq('user_id', subscription.user_id)
  }
}

async function upsertBusinessInvoice(
  admin: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice,
  stripeSubscriptionId: string,
) {
  const { data: subscription } = await admin
    .from('business_subscriptions')
    .select('id,user_id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle()
  if (!subscription) return null

  await admin.from('business_invoices').upsert({
    subscription_id: subscription.id,
    user_id: subscription.user_id,
    stripe_invoice_id: invoice.id,
    invoice_number: invoice.number || null,
    hosted_invoice_url: invoice.hosted_invoice_url || null,
    pdf_url: invoice.invoice_pdf || null,
    amount_minor: invoice.amount_due || 0,
    currency: invoice.currency || 'sek',
    status: invoice.status || 'open',
    issued_at: stripeTimestampToIso(invoice.created),
    paid_at: stripeTimestampToIso(invoice.status_transitions?.paid_at || null),
    due_at: stripeTimestampToIso(invoice.due_date || null),
    metadata: {
      collection_method: invoice.collection_method || null,
      amount_remaining: invoice.amount_remaining || 0,
    },
  }, { onConflict: 'stripe_invoice_id' })

  return {
    stripeInvoiceId: invoice.id,
    userId: subscription.user_id,
  }
}

async function getBusinessSubscriptionByStripeId(admin: ReturnType<typeof createAdminClient>, stripeSubscriptionId: string) {
  const { data } = await admin
    .from('business_subscriptions')
    .select('id,user_id,plan_key,active_listing_limit,market,currency')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle()
  return data
}

function stripeTimestampToIso(value?: number | null) {
  return typeof value === 'number' ? new Date(value * 1000).toISOString() : null
}
