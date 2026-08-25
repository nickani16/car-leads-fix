import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendBusinessBillingEmail } from '@/lib/email/business-billing'
import { getStripe } from '@/lib/stripe'

type InvoiceRow = {
  stripe_invoice_id: string | null
  invoice_number: string | null
  hosted_invoice_url: string | null
  pdf_url: string | null
  amount_minor: number
  currency: string
  status: string
  due_at: string | null
  subscription_id: string | null
  user_id: string
}

type SubscriptionRow = {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  plan_key: string | null
  active_listing_limit: number | null
  status: string | null
  market: string | null
  currency: string | null
  manually_activated: boolean | null
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron is not configured.' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date()
  const windowStart = startOfDay(addDays(now, -30)).toISOString()
  const windowEnd = endOfDay(addDays(now, 7)).toISOString()
  const { data: invoices, error } = await admin
    .from('business_invoices')
    .select('stripe_invoice_id,invoice_number,hosted_invoice_url,pdf_url,amount_minor,currency,status,due_at,subscription_id,user_id')
    .not('due_at', 'is', null)
    .gte('due_at', windowStart)
    .lte('due_at', windowEnd)
    .in('status', ['open', 'draft', 'uncollectible'])
    .limit(250)

  if (error) {
    console.error('[business-billing-cron] invoice lookup failed', error)
    return NextResponse.json({ error: 'invoice lookup failed' }, { status: 500 })
  }

  let reminders = 0
  let blocked = 0
  let reconciledPaid = 0
  for (const invoice of (invoices || []) as InvoiceRow[]) {
    if (!invoice.due_at || !invoice.stripe_invoice_id) continue
    const subscription = await getSubscription(admin, invoice.subscription_id, invoice.user_id)
    if (!subscription) continue
    const stripeInvoice = await refreshInvoiceFromStripe(admin, invoice.stripe_invoice_id, subscription)
    if (!stripeInvoice) continue
    if (stripeInvoice.status === 'paid') {
      await markInvoicePaid(admin, stripeInvoice, subscription)
      reconciledPaid += 1
      continue
    }
    if (stripeInvoice.status === 'void') continue

    const daysLeft = calendarDayDiff(now, new Date(invoice.due_at))
    if ([7, 5, 3, 2, 1].includes(daysLeft)) {
      const sent = await sendBusinessBillingEmail(admin, {
        deliveryKey: `business-invoice-reminder-${daysLeft}-${invoice.stripe_invoice_id}`,
        kind: 'invoice_reminder',
        userId: invoice.user_id,
        subscriptionId: subscription.id,
        invoiceId: invoice.stripe_invoice_id,
        planKey: subscription.plan_key,
        activeListingLimit: subscription.active_listing_limit,
        market: subscription.market,
        amountMinor: invoice.amount_minor,
        currency: invoice.currency,
        invoiceNumber: invoice.invoice_number,
        invoiceUrl: invoice.hosted_invoice_url,
        pdfUrl: invoice.pdf_url,
        dueAt: invoice.due_at,
        daysLeft,
      })
      if (sent.delivered) reminders += 1
    }

    if (daysLeft < 0 && subscription.manually_activated) {
      continue
    }

    if (daysLeft < 0 && subscription.status !== 'unpaid') {
      await admin
        .from('business_subscriptions')
        .update({
          status: 'unpaid',
          payment_status: 'failed',
          payment_warning_at: new Date().toISOString(),
          grace_period_ends_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id)
      const sent = await sendBusinessBillingEmail(admin, {
        deliveryKey: `business-account-blocked-${invoice.stripe_invoice_id}`,
        kind: 'account_blocked',
        userId: invoice.user_id,
        subscriptionId: subscription.id,
        invoiceId: invoice.stripe_invoice_id,
        planKey: subscription.plan_key,
        activeListingLimit: subscription.active_listing_limit,
        market: subscription.market,
        amountMinor: invoice.amount_minor,
        currency: invoice.currency,
        invoiceNumber: invoice.invoice_number,
        invoiceUrl: invoice.hosted_invoice_url,
        pdfUrl: invoice.pdf_url,
        dueAt: invoice.due_at,
      })
      await createAdminBillingNotification(admin, {
        createdByEvent: `business-billing-cron-blocked-${invoice.stripe_invoice_id}`,
        type: 'business_invoice_overdue',
        title: 'Business listing creation restricted for overdue invoice',
        body: `${invoice.invoice_number || invoice.stripe_invoice_id} is overdue. Listing creation and publication were restricted, but the company account data remains available.`,
        priority: 'critical',
        resourceId: invoice.stripe_invoice_id,
        actionUrl: '/admin/payments',
        metadata: {
          subscription_id: subscription.id,
          stripe_subscription_id: subscription.stripe_subscription_id,
          user_id: invoice.user_id,
          plan_key: subscription.plan_key,
          amount_minor: invoice.amount_minor,
          currency: invoice.currency,
          due_at: invoice.due_at,
        },
      })
      if (sent.delivered) blocked += 1
    }
  }

  return NextResponse.json({ ok: true, checked: invoices?.length || 0, reminders, blocked, reconciledPaid })
}

async function getSubscription(admin: ReturnType<typeof createAdminClient>, subscriptionId: string | null, userId: string): Promise<SubscriptionRow | null> {
  const query = admin
    .from('business_subscriptions')
    .select('id,user_id,stripe_subscription_id,plan_key,active_listing_limit,status,market,currency,manually_activated')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
  const { data } = subscriptionId
    ? await query.eq('id', subscriptionId).maybeSingle()
    : await query.maybeSingle()
  return data
}

async function refreshInvoiceFromStripe(
  admin: ReturnType<typeof createAdminClient>,
  stripeInvoiceId: string,
  subscription: SubscriptionRow,
) {
  try {
    const invoice = await getStripe().invoices.retrieve(stripeInvoiceId)
    await upsertBusinessInvoice(admin, invoice, subscription)
    return invoice
  } catch (error) {
    console.error('[business-billing-cron] stripe invoice refresh failed', {
      stripeInvoiceId,
      subscriptionId: subscription.id,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

async function markInvoicePaid(
  admin: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice,
  subscription: SubscriptionRow,
) {
  const now = new Date().toISOString()
  await admin
    .from('business_subscriptions')
    .update({
      status: 'active',
      payment_status: 'paid',
      payment_warning_at: null,
      grace_period_ends_at: null,
      updated_at: now,
    })
    .eq('id', subscription.id)

  await admin
    .from('marketplace_profiles')
    .update({
      business_onboarding_status: 'active',
      verification_updated_at: now,
    })
    .eq('user_id', subscription.user_id)

  if (subscription.stripe_subscription_id) {
    await admin
      .from('payment_orders')
      .update({
        status: 'paid',
        paid_at: now,
        updated_at: now,
      })
      .eq('stripe_subscription_id', subscription.stripe_subscription_id)
      .in('status', ['created', 'pending', 'checkout_created'])
  }

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

  await createAdminBillingNotification(admin, {
    createdByEvent: `business-billing-cron-paid-${invoice.id}`,
    type: 'business_invoice_paid',
    title: 'Business invoice paid',
    body: `${invoice.number || invoice.id} has been paid and the account is active.`,
    priority: 'normal',
    resourceId: invoice.id,
    actionUrl: '/admin/payments',
    metadata: {
      subscription_id: subscription.id,
      stripe_subscription_id: subscription.stripe_subscription_id,
      user_id: subscription.user_id,
      plan_key: subscription.plan_key,
      amount_minor: invoice.amount_paid || invoice.amount_due || invoice.total || null,
      currency: invoice.currency,
    },
  })
}

async function upsertBusinessInvoice(
  admin: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice,
  subscription: SubscriptionRow,
) {
  await admin.from('business_invoices').upsert({
    subscription_id: subscription.id,
    user_id: subscription.user_id,
    stripe_invoice_id: invoice.id,
    invoice_number: invoice.number || null,
    hosted_invoice_url: invoice.hosted_invoice_url || null,
    pdf_url: invoice.invoice_pdf || null,
    amount_minor: invoice.amount_due || invoice.amount_paid || invoice.total || 0,
    currency: invoice.currency || subscription.currency || 'sek',
    status: invoice.status || 'open',
    issued_at: stripeTimestampToIso(invoice.created),
    paid_at: stripeTimestampToIso(invoice.status_transitions?.paid_at || null),
    due_at: stripeTimestampToIso(invoice.due_date || null),
    metadata: {
      collection_method: invoice.collection_method || null,
      amount_remaining: invoice.amount_remaining || 0,
      refreshed_by_cron_at: new Date().toISOString(),
    },
  }, { onConflict: 'stripe_invoice_id' })
}

async function createAdminBillingNotification(
  admin: ReturnType<typeof createAdminClient>,
  input: {
    createdByEvent: string
    type: string
    title: string
    body: string
    priority: 'low' | 'normal' | 'high' | 'critical'
    resourceId: string
    actionUrl: string
    metadata: Record<string, unknown>
  },
) {
  const { data: existing } = await admin
    .from('admin_notifications')
    .select('id')
    .eq('created_by_event', input.createdByEvent)
    .maybeSingle()
  if (existing) return

  await admin.from('admin_notifications').insert({
    notification_type: input.type,
    title: input.title,
    body: input.body,
    priority: input.priority,
    resource_type: 'business_invoice',
    resource_id: input.resourceId,
    action_url: input.actionUrl,
    created_by_event: input.createdByEvent,
    metadata: input.metadata,
  })
}

function stripeTimestampToIso(value?: number | null) {
  return typeof value === 'number' ? new Date(value * 1000).toISOString() : null
}

function calendarDayDiff(from: Date, to: Date) {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000)
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86_400_000)
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}
