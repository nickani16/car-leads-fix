'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Check, Info, X } from 'lucide-react'
import {
  currencyForMarket,
  formatMoneyMinor,
  type BillingMarket,
} from '@/lib/billing/product-catalog'
import {
  businessSubscriptionCopy,
  businessSubscriptionPlans,
  getBusinessPlanProduct,
  localeToIntl,
  type BillingPeriod,
  type BusinessSubscriptionPlan,
} from '@/lib/business-subscription-plans'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

type BillingMethod = 'card' | 'invoice'

const baseCopy = {
  eyebrow: 'Business subscription',
  title: 'Choose a plan for the company',
  intro:
    'The current plan is marked with a blue border. Choose monthly or annual billing, and use 30-day invoice when the customer should be invoiced via Stripe.',
  currentPlan: 'Current plan',
  noActivePlan: 'No active plan',
  activeListings: 'active listings',
  nextBilling: 'Next billing',
  cancellationScheduled: 'Cancellation scheduled',
  ...businessSubscriptionCopy,
  openInvoice: 'Open invoice',
  activateFree: 'Activate Free',
  activating: 'Activating...',
  payCard: 'Pay by card',
  openingStripe: 'Opening Stripe...',
  invoice30: 'Invoice 30 days',
  sendingInvoice: 'Sending invoice...',
  cancelPlan: 'Cancel plan',
  freeActivated: 'Free is activated. You can now use your 5 listing slots.',
  invoiceCreated: 'The invoice has been created and sent to',
  companyEmail: 'the company email address',
  paymentTerms: 'Payment terms: 30 days.',
  paymentError: 'Could not start the payment.',
}

export default function BusinessPlanChooser({
  locale,
  market,
  subscriptionId,
  currentPlan,
  currentStatus,
  paymentStatus,
  currentProductKey,
  activeListingLimit,
  nextBillingAt,
  cancelAtPeriodEnd,
  cancellationRequestedAt,
  cancellationEffectiveAt,
}: {
  locale: PublicLocale
  market: BillingMarket
  subscriptionId: string | null
  currentPlan: string | null
  currentStatus: string | null
  paymentStatus: string | null
  currentProductKey?: string | null
  activeListingLimit?: number | null
  nextBillingAt?: string | null
  cancelAtPeriodEnd?: boolean
  cancellationRequestedAt?: string | null
  cancellationEffectiveAt?: string | null
}) {
  const copy = useMemo(() => translatePublicObject(locale, baseCopy), [locale])
  const plans = useMemo(() => translatePublicObject(locale, businessSubscriptionPlans), [locale])
  const currentPeriod = currentProductKey?.endsWith('.annual') ? 'annual' : 'monthly'
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(currentPeriod)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ message: string; invoiceUrl?: string | null } | null>(null)
  const [loading, setLoading] = useState('')

  const currentPlanName = useMemo(() => plans.find((plan) => plan.key === currentPlan)?.name || null, [currentPlan, plans])
  const currentStatusText = planStatusText(currentStatus, paymentStatus, locale)
  const localeTag = localeToIntl(locale)

  async function choose(key: BusinessSubscriptionPlan['key'], billingMethod: BillingMethod = 'card') {
    setLoading(`${key}:${billingMethod}:${billingPeriod}`)
    setError('')
    setSuccess(null)
    const productPeriod = key === 'free' ? 'monthly' : billingPeriod
    const response = await fetch('/api/account/listing-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productKey: `subscription.business.${key}.${productPeriod}`,
        market,
        billingMethod,
      }),
    })
    const result = await response.json().catch(() => ({}))
    if (result.activated) {
      setSuccess({ message: copy.freeActivated })
      setLoading('')
      return
    }
    if (result.invoice) {
      setSuccess({
        message: `${copy.invoiceCreated} ${result.invoiceEmail || copy.companyEmail}. ${copy.paymentTerms}`,
        invoiceUrl: result.invoiceUrl || null,
      })
      setLoading('')
      return
    }
    if (result.url) {
      window.location.assign(result.url)
      return
    }
    setError(result.error || copy.paymentError)
    setLoading('')
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-[1380px]">
        <section className="grid gap-6 border-b border-[#dde6f2] pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0866ff]">{copy.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] text-[#101828] sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f6b7a]">{copy.intro}</p>
          </div>

          <div className="w-full rounded-[14px] border border-[#d8e2f0] bg-white p-2 shadow-[0_18px_46px_rgba(16,24,40,.06)] lg:w-[450px]">
            <div className="rounded-[10px] border border-[#edf1f7] bg-[#f8fafc] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#667085]">{copy.currentPlan}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#475467]">
                <strong className="text-base text-[#101828]">{currentPlanName || copy.noActivePlan}</strong>
                {activeListingLimit ? <span>{activeListingLimit} {copy.activeListings}</span> : null}
                <span>{currentStatusText}</span>
              </div>
              {nextBillingAt ? <p className="mt-1 text-xs text-[#667085]">{copy.nextBilling}: {formatDate(nextBillingAt, localeTag)}</p> : null}
              {cancelAtPeriodEnd || cancellationRequestedAt ? (
                <p className="mt-1 text-xs font-bold text-[#b42318]">
                  {copy.cancellationScheduled}{cancellationEffectiveAt ? `: ${formatDate(cancellationEffectiveAt, localeTag)}` : ''}
                </p>
              ) : null}
            </div>
            <div className="mt-2 grid grid-cols-2 rounded-[10px] bg-[#eef3f9] p-1">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`min-h-10 rounded-[8px] text-sm font-bold transition ${
                  billingPeriod === 'monthly' ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                {copy.monthly}
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                className={`min-h-10 rounded-[8px] text-sm font-bold transition ${
                  billingPeriod === 'annual' ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                {copy.annual}
              </button>
            </div>
          </div>
        </section>

        {success ? (
          <div className="mt-5 flex flex-col gap-3 rounded-[12px] border border-[#b8cff8] bg-[#eef5ff] p-4 text-sm text-[#18478f] sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">{success.message}</p>
            {success.invoiceUrl ? (
              <a href={success.invoiceUrl} className="inline-flex min-h-10 items-center justify-center rounded-[8px] bg-[#0866ff] px-4 text-sm font-bold text-white">
                {copy.openInvoice}
              </a>
            ) : null}
          </div>
        ) : null}

        {error ? <p className="mt-5 rounded-[12px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-8 grid gap-4 xl:grid-cols-5">
          {plans.map((plan) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              current={currentPlan === plan.key}
              billingPeriod={billingPeriod}
              loading={loading}
              onChoose={choose}
              market={market}
              localeTag={localeTag}
              copy={copy}
            />
          ))}
        </div>

        {subscriptionId && currentPlan && currentPlan !== 'free' ? (
          <div className="mt-6 flex justify-end">
            <Link
              href={localizePublicHref(locale, '/account/business/subscription/cancel')}
              className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[#d0d8e6] bg-white px-4 text-sm font-bold text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff]"
            >
              {copy.cancelPlan}
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  )
}

function PlanCard({
  plan,
  current,
  billingPeriod,
  loading,
  onChoose,
  market,
  localeTag,
  copy,
}: {
  plan: BusinessSubscriptionPlan
  current: boolean
  billingPeriod: BillingPeriod
  loading: string
  onChoose: (key: BusinessSubscriptionPlan['key'], billingMethod?: BillingMethod) => void
  market: BillingMarket
  localeTag: string
  copy: typeof baseCopy
}) {
  const product = getBusinessPlanProduct(plan.key, billingPeriod)
  const price = product?.amountMinor[currencyForMarket(market)] ?? null
  const annualProduct = getBusinessPlanProduct(plan.key, 'annual')
  const annualPrice = annualProduct?.amountMinor[currencyForMarket(market)] ?? null
  const monthlyEquivalent = annualPrice ? Math.round(annualPrice / 12) : null
  const showAnnualBadge = billingPeriod === 'annual' && !plan.enterprise && plan.key !== 'free'

  return (
    <article
      className={`relative flex min-h-[620px] flex-col rounded-[12px] border bg-white shadow-[0_18px_50px_rgba(16,24,40,.055)] transition ${
        current
          ? 'border-[#0866ff] ring-2 ring-[#0866ff]/15'
          : plan.recommended
            ? 'border-[#9cbdf8]'
            : 'border-[#d9e2ef]'
      }`}
    >
      <div className="flex min-h-[258px] flex-col border-b border-[#edf1f7] p-5">
        <div className="flex min-h-8 items-start justify-between gap-3">
          <p className="min-w-0 max-w-[135px] text-[11px] font-bold uppercase leading-4 tracking-[.14em] text-[#667085]">{plan.audience}</p>
          {current ? (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#0866ff] px-3 py-1 text-[10px] font-black uppercase tracking-[.06em] text-white">
              {copy.yourPlan}
            </span>
          ) : plan.recommended ? (
            <span className="shrink-0 whitespace-nowrap rounded-full border border-[#0866ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.06em] text-[#0866ff]">
              {copy.recommended}
            </span>
          ) : showAnnualBadge ? (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#eef5ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.06em] text-[#0866ff]">
              {copy.annualBadge}
            </span>
          ) : null}
        </div>

        <h2 className="mt-4 text-2xl font-semibold tracking-[-.035em] text-[#101828]">{plan.name}</h2>
        <div className="mt-5">
          {plan.enterprise ? (
            <p className="text-[28px] font-semibold tracking-[-.045em] text-[#101828]">{copy.contactUs}</p>
          ) : (
            <>
              <p className="text-[30px] font-semibold tracking-[-.05em] text-[#101828]">
                {formatPrice(price || 0, currencyForMarket(market), localeTag)}
                <span className="text-sm font-semibold tracking-normal text-[#667085]">
                  {billingPeriod === 'annual' && plan.key !== 'free' ? copy.perYear : copy.perMonth}
                </span>
              </p>
              {billingPeriod === 'annual' && plan.key !== 'free' && monthlyEquivalent ? (
                <p className="mt-1 text-xs font-semibold text-[#667085]">
                  {copy.annualEquivalent} {formatPrice(monthlyEquivalent, currencyForMarket(market), localeTag)}{copy.perMonth}
                </p>
              ) : (
                <p className="mt-1 text-xs text-[#667085]">{copy.exclVat}</p>
              )}
            </>
          )}
        </div>
        <p className="mt-4 rounded-[8px] border border-[#dfe6f1] bg-[#f8fafc] px-3 py-2 text-sm font-bold text-[#344054]">
          {plan.limit}
        </p>
        <p className="mt-4 text-sm leading-6 text-[#5f6b7a]">{plan.summary}</p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-black uppercase tracking-[.14em] text-[#101828]">{copy.included}</p>
        <ul className="mt-4 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature.label} className="flex items-start gap-2 text-sm">
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${feature.included ? 'bg-[#eef5ff] text-[#0866ff]' : 'bg-[#f2f4f7] text-[#98a2b3]'}`}>
                {feature.included ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </span>
              <span className={feature.included ? 'text-[#344054]' : 'text-[#98a2b3]'}>
                {feature.label}
                <span className="group relative ml-1 inline-flex align-middle">
                  <button
                    type="button"
                    aria-label={feature.description}
                    className="inline-grid h-4 w-4 place-items-center rounded-full text-[#98a2b3] outline-none transition hover:bg-[#eef5ff] hover:text-[#0866ff] focus:bg-[#eef5ff] focus:text-[#0866ff]"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 rounded-[8px] border border-[#dbe4f0] bg-white p-3 text-xs leading-5 text-[#475467] shadow-[0_18px_44px_rgba(16,24,40,.16)] group-focus-within:block group-hover:block">
                    {feature.description}
                  </span>
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          {current ? (
            <button disabled className="min-h-11 w-full rounded-[8px] bg-[#e8f1ff] px-4 text-sm font-bold text-[#0866ff]">
              {copy.currentPlanButton}
            </button>
          ) : plan.enterprise ? (
            <a href="mailto:info@autorell.com?subject=Autorell Enterprise" className="flex min-h-11 w-full items-center justify-center rounded-[8px] bg-[#101828] px-4 text-sm font-bold text-white transition hover:bg-[#0866ff]">
              {copy.contactUs}
            </a>
          ) : plan.key === 'free' ? (
            <button onClick={() => onChoose(plan.key)} disabled={!!loading} className="min-h-11 w-full rounded-[8px] bg-[#0866ff] px-4 text-sm font-bold text-white transition hover:bg-[#075ce5] disabled:opacity-50">
              {loading.startsWith(`${plan.key}:card`) ? copy.activating : copy.activateFree}
            </button>
          ) : (
            <div className="space-y-2">
              <button onClick={() => onChoose(plan.key, 'card')} disabled={!!loading} className="min-h-11 w-full rounded-[8px] bg-[#0866ff] px-4 text-sm font-bold text-white transition hover:bg-[#075ce5] disabled:opacity-50">
                {loading.startsWith(`${plan.key}:card`) ? copy.openingStripe : copy.payCard}
              </button>
              <button onClick={() => onChoose(plan.key, 'invoice')} disabled={!!loading} className="min-h-11 w-full rounded-[8px] border border-[#0866ff] bg-white px-4 text-sm font-bold text-[#0866ff] transition hover:bg-[#eef5ff] disabled:opacity-50">
                {loading.startsWith(`${plan.key}:invoice`) ? copy.sendingInvoice : copy.invoice30}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function planStatusText(status: string | null | undefined, paymentStatus: string | null | undefined, locale: PublicLocale) {
  const copy = translatePublicObject(locale, {
    pending: 'Invoice sent, awaiting payment',
    failed: 'Payment failed',
    paid: 'Paid and active',
    notRequired: 'No payment required',
    active: 'Active',
    pastDue: 'Payment overdue',
    trialing: 'Trial period',
    waiting: 'Awaiting activation',
  })
  if (paymentStatus === 'pending') return copy.pending
  if (paymentStatus === 'failed') return copy.failed
  if (paymentStatus === 'paid') return copy.paid
  if (paymentStatus === 'not_required') return copy.notRequired
  if (status === 'active') return copy.active
  if (status === 'past_due') return copy.pastDue
  if (status === 'trialing') return copy.trialing
  return copy.waiting
}

function formatPrice(amountMinor: number, currency: string, localeTag: string) {
  return formatMoneyMinor(amountMinor, currency.toLowerCase() as Parameters<typeof formatMoneyMinor>[1], localeTag).replace(/\s+/g, ' ')
}

function formatDate(value: string, localeTag: string) {
  return new Intl.DateTimeFormat(localeTag, { dateStyle: 'medium' }).format(new Date(value))
}
