'use client'

import { useMemo, useState } from 'react'
import { Check, Info, X } from 'lucide-react'

type BillingMethod = 'card' | 'invoice'
type BillingPeriod = 'monthly' | 'annual'

type Feature = {
  label: string
  description: string
  included: boolean
}

type Plan = {
  key: 'free' | 'starter' | 'growth' | 'professional' | 'enterprise'
  name: string
  audience: string
  monthlyPrice: number | null
  annualPrice: number | null
  limit: string
  summary: string
  recommended?: boolean
  enterprise?: boolean
  features: Feature[]
}

const annualDiscount = 15

const plans: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    audience: 'Start',
    monthlyPrice: 0,
    annualPrice: 0,
    limit: '5 aktiva annonser',
    summary: 'Endast en enkel annonspott. Ingen företagssida, inga teamkonton och inga rapporter.',
    features: [
      { label: '5 aktiva annonser', description: 'Publicera upp till fem aktiva annonser samtidigt.', included: true },
      { label: 'Egen annonshantering', description: 'Skapa, pausa och uppdatera dina egna annonser.', included: true },
      { label: 'Företagssida', description: 'Ingår inte. Free visar inte en separat publik företagssida.', included: false },
      { label: 'Teamkonton', description: 'Ingår inte. Endast kontots ägare kan arbeta i Free.', included: false },
      { label: 'Rapporter och export', description: 'Ingår inte i Free.', included: false },
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    audience: 'Mindre handlare',
    monthlyPrice: 499,
    annualPrice: 5090,
    limit: '25 aktiva annonser',
    summary: 'För mindre lager som behöver företagssida och ett mer professionellt säljflöde.',
    features: [
      { label: '25 aktiva annonser', description: 'För mindre lager med återkommande publicering.', included: true },
      { label: 'Företagssida Basic', description: 'Företagsnamn, logotyp och kontaktväg samlas tydligare.', included: true },
      { label: 'Standardförfrågningar', description: 'Leads och meddelanden hanteras via Autorells vanliga flöde.', included: true },
      { label: 'Teamkonton', description: 'Teamkonton börjar på Growth.', included: false },
      { label: 'Rapporter och export', description: 'Rapporter och export börjar på Professional.', included: false },
    ],
  },
  {
    key: 'growth',
    name: 'Growth',
    audience: 'Växande team',
    monthlyPrice: 999,
    annualPrice: 10190,
    limit: '100 aktiva annonser',
    summary: 'För företag där flera personer ska arbeta i samma konto och publicera annonser löpande.',
    recommended: true,
    features: [
      { label: '100 aktiva annonser', description: 'För ett större aktivt lager.', included: true },
      { label: 'Företagssida Plus', description: 'Utökad företagspresentation med samlad lageröversikt.', included: true },
      { label: '10 teamkonton', description: 'Bjud in upp till 10 personer som kan arbeta i samma företagskonto och lägga upp annonser.', included: true },
      { label: 'Roller för personal', description: 'Personal kan kopplas till företagets annonsflöde.', included: true },
      { label: 'Prioriterad support', description: 'Ingår från Professional.', included: false },
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    audience: 'Hög volym',
    monthlyPrice: 1999,
    annualPrice: 20390,
    limit: '500 aktiva annonser',
    summary: 'För större organisationer med många säljare, hög volym och bättre uppföljning.',
    features: [
      { label: '500 aktiva annonser', description: 'För stora lager och hög publiceringstakt.', included: true },
      { label: 'Företagssida Pro', description: 'Bästa standardpresentationen för företaget och lagret.', included: true },
      { label: '50+ teamkonton', description: 'Byggt för större team där många kan publicera och hantera annonser.', included: true },
      { label: 'Rapporter och export', description: 'Exportera lagerdata och följ aktivitet över tid.', included: true },
      { label: 'Prioriterad support', description: 'Snabbare hjälp vid publicering, betalning och kontoärenden.', included: true },
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    audience: 'Skräddarsytt',
    monthlyPrice: null,
    annualPrice: null,
    limit: 'Individuell kvot',
    summary: 'För importörer, kedjor och aktörer med egna krav på volym, team och process.',
    enterprise: true,
    features: [
      { label: 'Skräddarsydd annonskvot', description: 'Kvot och upplägg sätts efter företagets faktiska behov.', included: true },
      { label: 'Avancerad företagssida', description: 'Anpassad presentation för större varumärken eller flera lager.', included: true },
      { label: 'Utökat team', description: 'Team, roller och behörigheter anpassas efter organisationen.', included: true },
      { label: 'Dataexport och rådgivning', description: 'Djupare uppföljning, onboarding och praktisk hjälp.', included: true },
      { label: 'Enterprise-support', description: 'Direktkontakt för större flöden och affärskritiska ärenden.', included: true },
    ],
  },
]

export default function BusinessPlanChooser({
  currentPlan,
  currentStatus,
  paymentStatus,
  currentProductKey,
  activeListingLimit,
  nextBillingAt,
}: {
  currentPlan: string | null
  currentStatus: string | null
  paymentStatus: string | null
  currentProductKey?: string | null
  activeListingLimit?: number | null
  nextBillingAt?: string | null
}) {
  const currentPeriod = currentProductKey?.endsWith('.annual') ? 'annual' : 'monthly'
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(currentPeriod)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ message: string; invoiceUrl?: string | null } | null>(null)
  const [loading, setLoading] = useState('')

  const currentPlanName = useMemo(() => plans.find((plan) => plan.key === currentPlan)?.name || null, [currentPlan])
  const currentStatusText = planStatusText(currentStatus, paymentStatus)

  async function choose(key: Plan['key'], billingMethod: BillingMethod = 'card') {
    setLoading(`${key}:${billingMethod}:${billingPeriod}`)
    setError('')
    setSuccess(null)
    const productPeriod = key === 'free' ? 'monthly' : billingPeriod
    const response = await fetch('/api/account/listing-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productKey: `subscription.business.${key}.${productPeriod}`,
        market: 'se',
        billingMethod,
      }),
    })
    const result = await response.json().catch(() => ({}))
    if (result.activated) {
      setSuccess({ message: 'Free är aktiverat. Du kan nu använda dina 5 annonsplatser.' })
      setLoading('')
      return
    }
    if (result.invoice) {
      setSuccess({
        message: `Fakturan är skapad och skickad till ${result.invoiceEmail || 'företagets e-postadress'}. Betalvillkor: 30 dagar.`,
        invoiceUrl: result.invoiceUrl || null,
      })
      setLoading('')
      return
    }
    if (result.url) {
      window.location.assign(result.url)
      return
    }
    setError(result.error || 'Kunde inte starta betalningen.')
    setLoading('')
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-[1380px]">
        <section className="grid gap-6 border-b border-[#dde6f2] pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0866ff]">Företagsabonnemang</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] text-[#101828] sm:text-5xl">
              Välj plan för företaget
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f6b7a]">
              Aktuell plan är markerad med blå ram. Välj månadsvis eller årsvis betalning, och använd faktura 30 dagar när kunden ska faktureras via Stripe.
            </p>
          </div>

          <div className="w-full rounded-[14px] border border-[#d8e2f0] bg-white p-2 shadow-[0_18px_46px_rgba(16,24,40,.06)] lg:w-[430px]">
            <div className="rounded-[10px] border border-[#edf1f7] bg-[#f8fafc] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#667085]">Nuvarande plan</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#475467]">
                <strong className="text-base text-[#101828]">{currentPlanName || 'Ingen aktiv plan'}</strong>
                {activeListingLimit ? <span>{activeListingLimit} aktiva annonser</span> : null}
                <span>{currentStatusText}</span>
              </div>
              {nextBillingAt ? <p className="mt-1 text-xs text-[#667085]">Nästa debitering: {formatDate(nextBillingAt)}</p> : null}
            </div>
            <div className="mt-2 grid grid-cols-2 rounded-[10px] bg-[#eef3f9] p-1">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`min-h-10 rounded-[8px] text-sm font-bold transition ${
                  billingPeriod === 'monthly' ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                Månadsvis
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                className={`min-h-10 rounded-[8px] text-sm font-bold transition ${
                  billingPeriod === 'annual' ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                Årsvis - spara {annualDiscount}%
              </button>
            </div>
          </div>
        </section>

        {success ? (
          <div className="mt-5 flex flex-col gap-3 rounded-[12px] border border-[#b8cff8] bg-[#eef5ff] p-4 text-sm text-[#18478f] sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">{success.message}</p>
            {success.invoiceUrl ? (
              <a
                href={success.invoiceUrl}
                className="inline-flex min-h-10 items-center justify-center rounded-[8px] bg-[#0866ff] px-4 text-sm font-bold text-white"
              >
                Öppna faktura
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
            />
          ))}
        </div>
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
}: {
  plan: Plan
  current: boolean
  billingPeriod: BillingPeriod
  loading: string
  onChoose: (key: Plan['key'], billingMethod?: BillingMethod) => void
}) {
  const price = billingPeriod === 'annual' ? plan.annualPrice : plan.monthlyPrice
  const monthlyEquivalent = plan.annualPrice ? Math.round(plan.annualPrice / 12) : null
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
        <div className="flex min-h-7 items-start justify-between gap-3">
          <p className="min-w-0 truncate whitespace-nowrap text-[11px] font-bold uppercase tracking-[.14em] text-[#667085]">{plan.audience}</p>
          {current ? (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#0866ff] px-3 py-1 text-[10px] font-black uppercase tracking-[.06em] text-white">
              Din plan
            </span>
          ) : plan.recommended ? (
            <span className="shrink-0 whitespace-nowrap rounded-full border border-[#0866ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.06em] text-[#0866ff]">
              Rekommenderad
            </span>
          ) : showAnnualBadge ? (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#eef5ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.06em] text-[#0866ff]">
              -{annualDiscount}%
            </span>
          ) : null}
        </div>

        <h2 className="mt-4 text-2xl font-semibold tracking-[-.035em] text-[#101828]">{plan.name}</h2>
        <div className="mt-5">
          {plan.enterprise ? (
            <p className="text-[28px] font-semibold tracking-[-.045em] text-[#101828]">Kontakta oss</p>
          ) : (
            <>
              <p className="text-[30px] font-semibold tracking-[-.05em] text-[#101828]">
                {formatSek(price || 0)}
                <span className="text-sm font-semibold tracking-normal text-[#667085]">
                  {billingPeriod === 'annual' && plan.key !== 'free' ? '/år' : '/månad'}
                </span>
              </p>
              {billingPeriod === 'annual' && plan.key !== 'free' && monthlyEquivalent ? (
                <p className="mt-1 text-xs font-semibold text-[#667085]">motsvarar ca {formatSek(monthlyEquivalent)}/månad</p>
              ) : (
                <p className="mt-1 text-xs text-[#667085]">exkl. moms</p>
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
        <p className="text-xs font-black uppercase tracking-[.14em] text-[#101828]">Ingår</p>
        <ul className="mt-4 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature.label} className="flex items-start gap-2 text-sm">
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                  feature.included ? 'bg-[#eef5ff] text-[#0866ff]' : 'bg-[#f2f4f7] text-[#98a2b3]'
                }`}
              >
                {feature.included ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </span>
              <span className={feature.included ? 'text-[#344054]' : 'text-[#98a2b3]'}>
                {feature.label}
                <span className="group relative ml-1 inline-flex align-middle">
                  <button
                    type="button"
                    aria-label={`Mer information om ${feature.label}`}
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
              Nuvarande plan
            </button>
          ) : plan.enterprise ? (
            <a
              href="mailto:nikolai.parkkila@hotmail.com?subject=Autorell Enterprise"
              className="flex min-h-11 w-full items-center justify-center rounded-[8px] bg-[#101828] px-4 text-sm font-bold text-white transition hover:bg-[#0866ff]"
            >
              Kontakta oss
            </a>
          ) : plan.key === 'free' ? (
            <button
              onClick={() => onChoose(plan.key)}
              disabled={!!loading}
              className="min-h-11 w-full rounded-[8px] bg-[#0866ff] px-4 text-sm font-bold text-white transition hover:bg-[#075ce5] disabled:opacity-50"
            >
              {loading.startsWith(`${plan.key}:card`) ? 'Aktiverar...' : 'Aktivera Free'}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => onChoose(plan.key, 'card')}
                disabled={!!loading}
                className="min-h-11 w-full rounded-[8px] bg-[#0866ff] px-4 text-sm font-bold text-white transition hover:bg-[#075ce5] disabled:opacity-50"
              >
                {loading.startsWith(`${plan.key}:card`) ? 'Öppnar Stripe...' : 'Betala med kort'}
              </button>
              <button
                onClick={() => onChoose(plan.key, 'invoice')}
                disabled={!!loading}
                className="min-h-11 w-full rounded-[8px] border border-[#0866ff] bg-white px-4 text-sm font-bold text-[#0866ff] transition hover:bg-[#eef5ff] disabled:opacity-50"
              >
                {loading.startsWith(`${plan.key}:invoice`) ? 'Skickar faktura...' : 'Faktura 30 dagar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function planStatusText(status?: string | null, paymentStatus?: string | null) {
  if (paymentStatus === 'pending') return 'Faktura skickad, inväntar betalning'
  if (paymentStatus === 'failed') return 'Betalning misslyckades'
  if (paymentStatus === 'paid') return 'Betald och aktiv'
  if (paymentStatus === 'not_required') return 'Ingen betalning krävs'
  if (status === 'active') return 'Aktiv'
  if (status === 'past_due') return 'Förfallen betalning'
  if (status === 'trialing') return 'Testperiod'
  return 'Väntar på aktivering'
}

function formatSek(amount: number) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(amount) + ' SEK'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium' }).format(new Date(value))
}
