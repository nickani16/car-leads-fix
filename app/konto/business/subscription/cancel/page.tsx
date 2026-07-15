import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, AlertTriangle, FileText } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import { formatMoneyMinor, normalizeBillingMarket, type BillingCurrency, type BillingMarket } from '@/lib/billing/product-catalog'
import { localizePublicHref, translatePublicObject, translationLocale, type PublicLocale } from '@/lib/public-i18n'
import CancelSubscriptionClient from './CancelSubscriptionClient'

const baseCopy = {
  back: 'Plan',
  eyebrow: 'Cancel subscription',
  title: 'End company plan',
  intro:
    'The subscription stays active until the current paid period ends. Issued invoices and the final invoice must still be paid before the account can be fully closed.',
  currentPlan: 'Current plan',
  status: 'Status',
  activeUntil: 'Active until',
  alreadyScheduled: 'Cancellation is already scheduled',
  invoiceTitle: 'Final payment rule',
  invoiceText:
    'Monthly plans have one billing period notice. Annual plans stay active until the annual period ends. Autorell documents the request automatically and Stripe continues to handle open invoices.',
  latestInvoices: 'Latest invoices',
  noInvoices: 'No invoices yet',
  openPayments: 'Open payments',
}

type InvoiceRow = {
  id: string
  invoice_number: string | null
  hosted_invoice_url: string | null
  amount_minor: number
  currency: string
  status: string
  created_at: string
}

export default async function BusinessSubscriptionCancelPage({
  localeOverride,
  marketOverride,
}: {
  localeOverride?: PublicLocale
  marketOverride?: BillingMarket
} = {}) {
  const locale = localeOverride || await getRequestLocale()
  const market = marketOverride || normalizeBillingMarket(locale === 'sv' ? 'se' : locale === 'da' ? 'dk' : locale)
  const copy = translatePublicObject(locale, baseCopy)
  const localeTag = localeToIntl(locale)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/login'))

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('account_type')
    .eq('user_id', user.id)
    .maybeSingle()
  if (profile?.account_type !== 'business') redirect(localizePublicHref(locale, '/account'))

  const [{ data: subscription }, { data: invoices }] = await Promise.all([
    admin
      .from('business_subscriptions')
      .select('id,plan_key,product_key,status,payment_status,current_period_end,next_billing_at,cancel_at_period_end,cancellation_effective_at')
      .eq('user_id', user.id)
      .neq('plan_key', 'free')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from('business_invoices')
      .select('id,invoice_number,hosted_invoice_url,amount_minor,currency,status,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  if (!subscription) redirect(localizePublicHref(locale, '/account/business/subscription'))
  const endDate = subscription.cancellation_effective_at || subscription.current_period_end || subscription.next_billing_at
  const invoiceRows = (invoices || []) as InvoiceRow[]

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-[980px]">
        <Link href={localizePublicHref(locale, '/account/business/subscription')} className="inline-flex items-center gap-2 text-sm font-bold text-[#475467] transition hover:text-[#0866ff]">
          <ArrowLeft className="h-4 w-4" />
          {copy.back}
        </Link>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0866ff]">{copy.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] text-[#101828] sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5f6b7a]">{copy.intro}</p>
          </div>
          <aside className="rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.055)]">
            <Summary label={copy.currentPlan} value={capitalize(subscription.plan_key || '')} />
            <Summary label={copy.status} value={subscription.cancel_at_period_end ? copy.alreadyScheduled : paymentText(subscription.payment_status || subscription.status || '', locale)} />
            <Summary label={copy.activeUntil} value={endDate ? new Intl.DateTimeFormat(localeTag, { dateStyle: 'medium' }).format(new Date(endDate)) : '-'} />
          </aside>
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-[1fr_340px]">
          <CancelSubscriptionClient locale={locale} />
          <aside className="space-y-4">
            <div className="rounded-[16px] border border-[#f4d6a3] bg-[#fff8eb] p-5 text-[#7a4b00]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <h2 className="font-semibold tracking-[-.02em]">{copy.invoiceTitle}</h2>
                  <p className="mt-2 text-sm leading-6">{copy.invoiceText}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[16px] border border-[#d9e2ef] bg-white p-5">
              <h2 className="font-semibold tracking-[-.02em] text-[#101828]">{copy.latestInvoices}</h2>
              {invoiceRows.length ? (
                <div className="mt-4 space-y-3">
                  {invoiceRows.map((invoice) => (
                    <a key={invoice.id} href={invoice.hosted_invoice_url || localizePublicHref(locale, '/account/payments')} className="flex items-center justify-between gap-3 rounded-[12px] border border-[#edf1f7] px-3 py-3 text-sm hover:border-[#0866ff]">
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-[#101828]">{invoice.invoice_number || invoice.id.slice(0, 8)}</span>
                        <span className="block text-xs text-[#667085]">{invoice.status}</span>
                      </span>
                      <span className="shrink-0 font-bold text-[#0866ff]">{formatMoneyMinor(invoice.amount_minor, invoice.currency.toLowerCase() as BillingCurrency, localeTag)}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#667085]">{copy.noInvoices}</p>
              )}
              <Link href={localizePublicHref(locale, '/account/payments')} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-[10px] bg-[#0866ff] px-3 text-sm font-bold text-white">
                <FileText className="h-4 w-4" />
                {copy.openPayments}
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#edf1f7] py-3 last:border-b-0">
      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#667085]">{label}</p>
      <p className="mt-1 text-base font-semibold text-[#101828]">{value}</p>
    </div>
  )
}

function paymentText(status: string, locale: PublicLocale) {
  const copy = translatePublicObject(locale, {
    paid: 'Paid',
    pending: 'Awaiting payment',
    failed: 'Payment failed',
    active: 'Active',
    pastDue: 'Overdue',
    waiting: 'Waiting',
  })
  if (status === 'paid') return copy.paid
  if (status === 'pending') return copy.pending
  if (status === 'failed') return copy.failed
  if (status === 'active') return copy.active
  if (status === 'past_due') return copy.pastDue
  return copy.waiting
}

function localeToIntl(locale: PublicLocale) {
  const translated = translationLocale(locale)
  if (translated === 'sv') return 'sv-SE'
  if (translated === 'de') return 'de-DE'
  if (translated === 'da') return 'da-DK'
  if (translated === 'fi') return 'fi-FI'
  if (translated === 'fr') return 'fr-FR'
  if (translated === 'it') return 'it-IT'
  if (translated === 'es') return 'es-ES'
  if (translated === 'nl') return 'nl-NL'
  if (translated === 'pl') return 'pl-PL'
  return 'en-GB'
}

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
}
