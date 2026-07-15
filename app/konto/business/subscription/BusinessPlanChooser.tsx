'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Check,
  FileDown,
  Info,
  Megaphone,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'

type BillingMethod = 'card' | 'invoice'

type Feature = {
  label: string
  description: string
  included: boolean
}

type Plan = {
  key: string
  name: string
  eyebrow: string
  price: string
  limit: string
  summary: string
  icon: LucideIcon
  recommended?: boolean
  enterprise?: boolean
  features: Feature[]
}

const plans: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    eyebrow: 'Kom igång',
    price: '0 SEK/månad',
    limit: '5 aktiva annonser',
    summary: 'Endast annonser. Ingen företagsprofil, inga teamverktyg och ingen extra synlighet.',
    icon: Megaphone,
    features: [
      { label: '5 aktiva annonser', description: 'Publicera upp till fem aktiva annonser samtidigt.', included: true },
      { label: 'Grundläggande annonslista', description: 'Skapa, pausa och hantera egna annonser.', included: true },
      { label: 'Företagssida', description: 'Publik företagssida, profilering och samlad lagerpresentation ingår inte i Free.', included: false },
      { label: 'Team och roller', description: 'Flera användare och rollstyrning börjar på högre paket.', included: false },
      { label: 'Rapporter och export', description: 'Analys, export och rapporter ingår inte i Free.', included: false },
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    eyebrow: 'Små handlare',
    price: '499 SEK/månad',
    limit: '25 aktiva annonser',
    summary: 'För företag som vill ha ett enkelt lagerflöde och bättre presentation än Free.',
    icon: ShieldCheck,
    features: [
      { label: '25 aktiva annonser', description: 'Passar mindre lager eller säsongsvis försäljning.', included: true },
      { label: 'Företagssida Basic', description: 'Företagsnamn, logotyp och kontaktväg samlas på en enklare profilsida.', included: true },
      { label: 'Standardförfrågningar', description: 'Samla leads via Autorells meddelande- och kontaktflöden.', included: true },
      { label: 'Teamkonto', description: 'Extra användare och rollhantering ingår från Growth.', included: false },
      { label: 'Marknadsinsikter', description: 'Rapporter och export ingår från Growth och uppåt.', included: false },
    ],
  },
  {
    key: 'growth',
    name: 'Growth',
    eyebrow: 'Växande lager',
    price: '999 SEK/månad',
    limit: '100 aktiva annonser',
    summary: 'Mer kapacitet, teamfunktioner och bättre kontroll för företag som arbetar löpande.',
    icon: UsersRound,
    recommended: true,
    features: [
      { label: '100 aktiva annonser', description: 'Byggt för ett större och mer aktivt fordonslager.', included: true },
      { label: 'Företagssida Plus', description: 'Utökad presentation med lageröversikt, logotyp och förtroendesign.', included: true },
      { label: 'Upp till 3 teammedlemmar', description: 'Låt fler på företaget hantera annonser och meddelanden.', included: true },
      { label: 'Grundrapportering', description: 'Se enkel statistik över annonser, kontaktintresse och aktivitet.', included: true },
      { label: 'Prioriterad support', description: 'Snabbare support och rådgivning ingår i Professional.', included: false },
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    eyebrow: 'Hög volym',
    price: '1 999 SEK/månad',
    limit: '500 aktiva annonser',
    summary: 'För större handlare som behöver synlighet, export, team och mer professionella arbetsflöden.',
    icon: BarChart3,
    features: [
      { label: '500 aktiva annonser', description: 'För stora lager och hög publiceringstakt.', included: true },
      { label: 'Företagssida Pro', description: 'Bästa publika företagspresentationen med starkare förtroendesign.', included: true },
      { label: 'Upp till 10 teammedlemmar', description: 'Mer plats för säljare, administratörer och supportroller.', included: true },
      { label: 'Rapporter och export', description: 'Exportera lagerdata och följ resultat över tid.', included: true },
      { label: 'Prioriterad support', description: 'Snabbare hjälp vid publicering, betalningar och kontoärenden.', included: true },
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    eyebrow: 'Skräddarsytt',
    price: 'Kontakta oss',
    limit: 'Individuell kvot',
    summary: 'För importörer, kedjor och större aktörer med egna krav på volym och process.',
    icon: FileDown,
    enterprise: true,
    features: [
      { label: 'Skräddarsydd annonskvot', description: 'Vi sätter kvot och upplägg efter faktisk volym.', included: true },
      { label: 'Avancerad företagssida', description: 'Anpassad presentation för större varumärken och flera lager.', included: true },
      { label: 'Fler team och roller', description: 'Roller, processer och support anpassas efter organisationen.', included: true },
      { label: 'Dataexport och rådgivning', description: 'Djupare uppföljning, export och praktisk onboarding.', included: true },
      { label: 'Enterprise-support', description: 'Direktkontakt och manuell hjälp för större flöden.', included: true },
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
  const [loading, setLoading] = useState('')
  const router = useRouter()

  async function choose(key: string, billingMethod: BillingMethod = 'card') {
    setLoading(`${key}:${billingMethod}`)
    setError('')
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
      router.push('/konto')
      return
    }
    if (result.invoice) {
      if (result.invoiceUrl) window.location.assign(result.invoiceUrl)
      else router.push('/konto?subscription=invoice_sent')
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
    <main className="min-h-screen bg-[#f7f9fc] px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-[1480px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#0866ff]">Plan</p>
            <h1 className="mt-3 text-4xl font-semibold text-[#101828] sm:text-5xl">Välj företagsabonnemang</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667085] sm:text-base">
              Välj kapacitet och verktyg efter hur företaget arbetar. Free är en ren annonspott, medan de betalda paketen öppnar mer företagspresentation, team och uppföljning.
            </p>
          </div>
          {currentPlan && (
            <div className="rounded-[16px] border border-[#dbe4f0] bg-white px-5 py-4 text-sm shadow-sm">
              Nuvarande: <strong className="capitalize">{currentPlan}</strong>
              <span className="mx-2 text-[#98a2b3]">·</span>
              status {currentStatus || 'pending'}
              <span className="mx-2 text-[#98a2b3]">·</span>
              betalning {paymentStatus || 'pending'}
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-5">
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

        {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
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
  const Icon = plan.icon
  return (
    <article
      className={`relative flex min-h-[620px] flex-col rounded-[18px] border bg-white p-5 shadow-[0_18px_48px_rgba(16,24,40,.055)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgba(16,24,40,.08)] ${
        plan.recommended ? 'border-[#0866ff] ring-2 ring-[#d7e7ff]' : 'border-[#dbe4f0]'
      }`}
    >
      {plan.recommended ? (
        <span className="absolute right-4 top-4 rounded-full bg-[#0866ff] px-3 py-1 text-[11px] font-black uppercase tracking-[.12em] text-white">
          Populär
        </span>
      ) : null}

      <div className="flex items-start gap-3 pr-16">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#eef5ff] text-[#0866ff]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#667085]">{plan.eyebrow}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-.035em] text-[#101828]">{plan.name}</h2>
        </div>
      </div>

      <p className="mt-6 text-3xl font-semibold tracking-[-.045em] text-[#101828]">{plan.price}</p>
      {!plan.enterprise ? <p className="mt-1 text-xs font-semibold text-[#667085]">exkl. moms</p> : null}
      <p className="mt-4 rounded-[12px] border border-[#e4eaf3] bg-[#f8fbff] px-3 py-2 text-sm font-bold text-[#344054]">
        {plan.limit}
      </p>
      <p className="mt-4 min-h-[72px] text-sm leading-6 text-[#667085]">{plan.summary}</p>

      <div className="mt-5 border-t border-[#edf1f7] pt-5">
        <p className="text-sm font-bold text-[#101828]">Ingår</p>
        <ul className="mt-4 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature.label} className="flex items-start gap-2 text-sm text-[#344054]">
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                  feature.included ? 'bg-[#eef5ff] text-[#0866ff]' : 'bg-[#f2f4f7] text-[#98a2b3]'
                }`}
              >
                {feature.included ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </span>
              <span className={feature.included ? '' : 'text-[#98a2b3]'}>
                {feature.label}
                <span className="group relative ml-1 inline-flex align-middle">
                  <button
                    type="button"
                    aria-label={`Mer information om ${feature.label}`}
                    className="inline-grid h-4 w-4 place-items-center rounded-full text-[#98a2b3] outline-none transition hover:bg-[#eef5ff] hover:text-[#0866ff] focus:bg-[#eef5ff] focus:text-[#0866ff]"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 rounded-[12px] border border-[#dbe4f0] bg-white p-3 text-xs leading-5 text-[#475467] shadow-[0_18px_44px_rgba(16,24,40,.16)] group-focus-within:block group-hover:block">
                    {feature.description}
                  </span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-6">
        {plan.enterprise ? (
          <a
            href="mailto:nikolai.parkkila@hotmail.com?subject=Autorell Enterprise"
            className="flex min-h-12 w-full items-center justify-center rounded-[14px] bg-[#101828] px-4 text-sm font-bold text-white transition hover:bg-[#0866ff]"
          >
            Kontakta oss
          </a>
        ) : plan.key === 'free' ? (
          <button
            onClick={() => onChoose(plan.key)}
            disabled={!!loading || current}
            className="min-h-12 w-full rounded-[14px] bg-[#0866ff] px-4 text-sm font-bold text-white transition hover:bg-[#075ce5] disabled:bg-[#e4eaf3] disabled:text-[#667085]"
          >
            {current ? 'Nuvarande plan' : loading === `${plan.key}:card` ? 'Aktiverar...' : 'Aktivera Free'}
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => onChoose(plan.key, 'card')}
              disabled={!!loading || current}
              className="min-h-12 w-full rounded-[14px] bg-[#0866ff] px-4 text-sm font-bold text-white transition hover:bg-[#075ce5] disabled:bg-[#e4eaf3] disabled:text-[#667085]"
            >
              {current ? 'Nuvarande plan' : loading === `${plan.key}:card` ? 'Öppnar betalning...' : 'Betala med kort'}
            </button>
            <button
              onClick={() => onChoose(plan.key, 'invoice')}
              disabled={!!loading || current}
              className="min-h-12 w-full rounded-[14px] border border-[#0866ff] bg-white px-4 text-sm font-bold text-[#0866ff] transition hover:bg-[#eef5ff] disabled:border-[#d0d5dd] disabled:text-[#98a2b3]"
            >
              {current ? 'Vald' : loading === `${plan.key}:invoice` ? 'Skapar faktura...' : 'Faktura 30 dagar'}
            </button>
          </div>
        )}
      </div>

      <Sparkles className="pointer-events-none absolute bottom-5 right-5 h-5 w-5 text-[#d6e6ff]" />
    </article>
  )
}
