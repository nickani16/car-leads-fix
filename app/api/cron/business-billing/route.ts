import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendBusinessBillingEmail } from '@/lib/email/business-billing'

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
  plan_key: string | null
  active_listing_limit: number | null
  status: string | null
  market: string | null
  currency: string | null
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
  const windowStart = startOfDay(addDays(now, -2)).toISOString()
  const windowEnd = endOfDay(addDays(now, 2)).toISOString()
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
  for (const invoice of (invoices || []) as InvoiceRow[]) {
    if (!invoice.due_at || !invoice.stripe_invoice_id) continue
    const subscription = await getSubscription(admin, invoice.subscription_id, invoice.user_id)
    if (!subscription) continue

    const daysLeft = calendarDayDiff(now, new Date(invoice.due_at))
    if (daysLeft === 2 || daysLeft === 1) {
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
      await admin
        .from('marketplace_profiles')
        .update({
          business_onboarding_status: 'suspended',
          verification_updated_at: new Date().toISOString(),
        })
        .eq('user_id', invoice.user_id)
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
      if (sent.delivered) blocked += 1
    }
  }

  return NextResponse.json({ ok: true, checked: invoices?.length || 0, reminders, blocked })
}

async function getSubscription(admin: ReturnType<typeof createAdminClient>, subscriptionId: string | null, userId: string): Promise<SubscriptionRow | null> {
  const query = admin
    .from('business_subscriptions')
    .select('id,user_id,plan_key,active_listing_limit,status,market,currency')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
  const { data } = subscriptionId
    ? await query.eq('id', subscriptionId).maybeSingle()
    : await query.maybeSingle()
  return data
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
