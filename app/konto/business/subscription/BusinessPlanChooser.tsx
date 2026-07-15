'use client'

import { useState } from 'react'
import { Check, Info, X } from 'lucide-react'

type BillingMethod = 'card' | 'invoice'

type Feature = {
  label: string
  description: string
  included: boolean
}

type Plan = {
  key: string
  name: string
  audience: string
  price: string
  limit: string
  summary: string
  recommended?: boolean
  enterprise?: boolean
  features: Feature[]
}

const plans: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    audience: 'För att testa annonsering',
    price: '0 SEK/månad',
    limit: '5 aktiva annonser',
    summary: 'En ren annonspott. Ingen företagssida, inga teamkonton och inga rapporter.',
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
    audience: 'För mindre handlare',
    price: '499 SEK/månad',
    limit: '25 aktiva annonser',
    summary: 'Mer seriös företagspresentation och bättre struktur för ett mindre lager.',
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
    audience: 'För växande bilhandlare',
    price: '999 SEK/månad',
    limit: '100 aktiva annonser',
    summary: 'För företag som vill låta personal arbeta i samma företagskonto.',
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
    audience: 'För hög volym',
    price: '1 999 SEK/månad',
    limit: '500 aktiva annonser',
    summary: 'För större organisationer med många säljare, hög volym och behov av bättre uppföljning.',
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
    audience: 'För kedjor och importörer',
    price: 'Kontakta oss',
    limit: 'Individuell kvot',
    summary: 'Skräddarsytt upplägg för större aktörer med egna processer, flera lager eller särskilda krav.',
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
}: {
  currentPlan: string | null
  currentStatus: string | null
  paymentStatus: string | null
}) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ message: string; invoiceUrl?: string | null } | null>(null)
  const [loading, setLoading] = useState('')

  async function choose(key: string, billingMethod: BillingMethod = 'card') {
    setLoading(`${key}:${billingMethod}`)
    setError('')
    setSuccess(null)
    const response = await fetch('/api/account/listing-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productKey: `subscription.business.${key}.monthly`,
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
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-[1360px]">
        <div className="border-b border-[#dfe6f1] pb-7">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0866ff]">Företagsplan</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-.035em] text-[#101828] sm:text-4xl">
                Välj abonnemang för företaget
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667085]">
                Free är endast annonser. Betalda planer öppnar företagssida, teamkonton och mer kontroll steg för steg.
              </p>
            </div>
            {currentPlan ? (
              <div className="rounded-[10px] border border-[#cfd9e8] bg-white px-4 py-3 text-sm shadow-sm">
                Nuvarande plan: <strong className="capitalize">{currentPlan}</strong>
                <span className="mx-2 text-[#98a2b3]">/</span>
                {currentStatus || 'pending'}
                <span className="mx-2 text-[#98a2b3]">/</span>
                betalning {paymentStatus || 'pending'}
              </div>
            ) : null}
          </div>
        </div>

        {success ? (
          <div className="mt-5 flex flex-col gap-3 rounded-[10px] border border-[#b8cff8] bg-[#eef5ff] p-4 text-sm text-[#18478f] sm:flex-row sm:items-center sm:justify-between">
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

        {error ? <p className="mt-5 rounded-[10px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-7 grid gap-4 xl:grid-cols-5">
          {plans.map((plan) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              current={currentPlan === plan.key}
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
  loading,
  onChoose,
}: {
  plan: Plan
  current: boolean
  loading: string
  onChoose: (key: string, billingMethod?: BillingMethod) => void
}) {
  return (
    <article
      className={`flex min-h-[590px] flex-col rounded-[10px] border bg-white shadow-[0_14px_36px_rgba(16,24,40,.045)] ${
        plan.recommended ? 'border-[#0866ff]' : 'border-[#d9e2ef]'
      }`}
    >
      <div className="border-b border-[#edf1f7] p-5">
        <div className="flex min-h-8 items-start justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#667085]">{plan.audience}</p>
          {plan.recommended ? (
            <span className="rounded-full border border-[#0866ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] text-[#0866ff]">
              Rekommenderad
            </span>
          ) : null}
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-.03em] text-[#101828]">{plan.name}</h2>
        <p className="mt-5 text-[26px] font-semibold tracking-[-.04em] text-[#101828]">{plan.price}</p>
        {!plan.enterprise ? <p className="mt-1 text-xs text-[#667085]">exkl. moms</p> : null}
        <p className="mt-4 rounded-[8px] border border-[#dfe6f1] bg-[#f8fafc] px-3 py-2 text-sm font-bold text-[#344054]">
          {plan.limit}
        </p>
        <p className="mt-4 min-h-[78px] text-sm leading-6 text-[#5f6b7a]">{plan.summary}</p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-black uppercase tracking-[.14em] text-[#101828]">Funktioner</p>
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
            <button
              disabled
              className="min-h-11 w-full rounded-[8px] bg-[#e9eef6] px-4 text-sm font-bold text-[#667085]"
            >
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
              {loading === `${plan.key}:card` ? 'Aktiverar...' : 'Aktivera Free'}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => onChoose(plan.key, 'card')}
                disabled={!!loading}
                className="min-h-11 w-full rounded-[8px] bg-[#0866ff] px-4 text-sm font-bold text-white transition hover:bg-[#075ce5] disabled:opacity-50"
              >
                {loading === `${plan.key}:card` ? 'Öppnar Stripe...' : 'Betala med kort'}
              </button>
              <button
                onClick={() => onChoose(plan.key, 'invoice')}
                disabled={!!loading}
                className="min-h-11 w-full rounded-[8px] border border-[#0866ff] bg-white px-4 text-sm font-bold text-[#0866ff] transition hover:bg-[#eef5ff] disabled:opacity-50"
              >
                {loading === `${plan.key}:invoice` ? 'Skickar faktura...' : 'Faktura 30 dagar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
