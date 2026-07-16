'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { ArrowRight, BadgeCheck, BarChart3, Check, Info, RefreshCw, Rocket, Star, X } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import PricingAnchorScroll from '@/app/components/PricingAnchorScroll'
import {
  billingProductCatalog,
  currencyForMarket,
  formatMoneyMinor,
  getProductAmount,
  listingCategoryLabels,
  type BillingMarket,
  type BillingProduct,
  type ListingCategory,
} from '@/lib/billing/product-catalog'
import {
  businessSubscriptionCopy,
  businessSubscriptionPlans,
  getBusinessPlanProduct,
  localeToIntl,
  type BillingPeriod,
  type BusinessSubscriptionPlan,
} from '@/lib/business-subscription-plans'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

type PricingPageProps = {
  locale: PublicLocale
  market: BillingMarket
  marketCode?: string
}

const localeMap: Record<PublicLocale, string> = {
  sv: 'sv-SE',
  en: 'en-GB',
  de: 'de-DE',
  at: 'de-AT',
  be: 'nl-BE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  pl: 'pl-PL',
  nl: 'nl-NL',
  fi: 'fi-FI',
  da: 'da-DK',
}

const copyByLocale: Partial<Record<PublicLocale, typeof copyByLocaleBase>> = {
  sv: {
    title: 'Annonspriser',
    intro: 'Fasta lokala priser. Samma belopp visas i Checkout.',
    privateHeading: 'Privatannonser',
    addonsHeading: 'Synlighetstjänster',
    businessHeading: 'Företagsabonnemang',
    category: 'Kategori',
    start: 'Start',
    standard: 'Standard',
    premium: 'Premium',
    free: 'Gratis',
    days: 'dagar',
    perMonth: 'per månad',
    included: 'Ingår',
    recommended: 'Rekommenderad',
    startText: '7 dagar, standardplacering.',
    standardText: '15 dagar och utökad annonsstatistik.',
    premiumText: '30 dagar, Premium-badge och 7 dagars toppplacering.',
    topPlacement: 'Toppplacering',
    topPlacementText: 'Sponsrad placering i relevanta sökresultat.',
    featured: 'Utvald annons',
    featuredText: 'Visas i särskilda moduler och rekommendationer.',
    refresh: 'Förnyelse',
    refreshText: 'Flyttar upp annonsen bland vanliga annonser utan att ändra skapandedatum.',
    activeListings: 'aktiva annonser',
    contactUs: 'Kontakta oss',
    enterprise: 'Enterprise',
    sellCta: 'Skapa annons',
  },
  da: {
    title: 'Annoncepriser',
    intro: 'Faste lokale priser. Samme beløb vises i Checkout.',
    privateHeading: 'Private annoncer',
    addonsHeading: 'Synlighedstjenester',
    businessHeading: 'Virksomhedsabonnementer',
    category: 'Kategori',
    start: 'Start',
    standard: 'Standard',
    premium: 'Premium',
    free: 'Gratis',
    days: 'dage',
    perMonth: 'pr. måned',
    included: 'Inkluderet',
    recommended: 'Anbefalet',
    startText: '7 dage, standardplacering.',
    standardText: '15 dage og udvidet annoncestatistik.',
    premiumText: '30 dage, Premium-badge og 7 dages topplacering.',
    topPlacement: 'Topplacering',
    topPlacementText: 'Sponsoreret placering i relevante søgeresultater.',
    featured: 'Udvalgt annonce',
    featuredText: 'Vises i særlige moduler og anbefalinger.',
    refresh: 'Fornyelse',
    refreshText: 'Flytter annoncen op blandt almindelige annoncer uden at ændre oprettelsesdatoen.',
    activeListings: 'aktive annoncer',
    contactUs: 'Kontakt os',
    enterprise: 'Enterprise',
    sellCta: 'Opret annonce',
  },
  pl: {
    title: 'Cennik',
    intro: 'Stale lokalne ceny. Ta sama kwota jest widoczna w Checkout.',
    privateHeading: 'Ogloszenia prywatne',
    addonsHeading: 'Uslugi widocznosci',
    businessHeading: 'Abonamenty firmowe',
    category: 'Kategoria',
    start: 'Start',
    standard: 'Standard',
    premium: 'Premium',
    free: 'Bezpłatnie',
    days: 'dni',
    perMonth: 'miesiecznie',
    included: 'W cenie',
    recommended: 'Polecane',
    startText: '7 dni, standardowa pozycja.',
    standardText: '15 dni i rozszerzone statystyki ogloszenia.',
    premiumText: '30 dni, odznaka Premium i 7 dni topowej pozycji.',
    topPlacement: 'Topowa pozycja',
    topPlacementText: 'Sponsorowana pozycja w trafnych wynikach wyszukiwania.',
    featured: 'Wyroznione ogloszenie',
    featuredText: 'Widoczne w specjalnych modulach i rekomendacjach.',
    refresh: 'Odnowienie',
    refreshText: 'Przesuwa ogloszenie wyzej wsrod zwyklych ogloszen bez zmiany daty utworzenia.',
    activeListings: 'aktywnych ogloszen',
    contactUs: 'Skontaktuj sie',
    enterprise: 'Enterprise',
    sellCta: 'Dodaj ogloszenie',
  },
}

const copyByLocaleBase = {
  title: 'Pricing',
  intro: 'Fixed local prices. The same amount is shown in Checkout.',
  privateHeading: 'Private listings',
  addonsHeading: 'Visibility services',
  businessHeading: 'Business subscriptions',
  category: 'Category',
  start: 'Start',
  standard: 'Standard',
  premium: 'Premium',
  free: 'Free',
  days: 'days',
  perMonth: 'per month',
  included: 'Included',
  recommended: 'Recommended',
  startText: '7 days, standard placement.',
  standardText: '15 days and extended listing statistics.',
  premiumText: '30 days, Premium badge and 7 days of top placement.',
  topPlacement: 'Top placement',
  topPlacementText: 'Sponsored placement in relevant search results.',
  featured: 'Featured listing',
  featuredText: 'Shown in special modules and recommendation sections.',
  refresh: 'Refresh',
  refreshText: 'Moves the listing up among regular listings without changing its creation date.',
  activeListings: 'active listings',
  contactUs: 'Contact us',
  enterprise: 'Enterprise',
  sellCta: 'Create listing',
}

const packageCards = [
  { key: 'start', icon: BadgeCheck, recommended: false },
  { key: 'standard', icon: BarChart3, recommended: false },
  { key: 'premium', icon: Rocket, recommended: true },
] as const

const addOnKeys = [
  'addon.top_placement.3_days',
  'addon.top_placement.7_days',
  'addon.top_placement.14_days',
  'addon.featured.7_days',
  'addon.featured.30_days',
  'addon.refresh.single',
  'addon.refresh.pack_5',
  'addon.refresh.pack_10',
] as const

export default function PricingPage({ locale, market, marketCode }: PricingPageProps) {
  const copy = copyByLocale[locale] || copyByLocaleBase
  const numberLocale = localeMap[locale] || 'en-GB'
  const categoryEntries = Object.entries(listingCategoryLabels) as Array<[ListingCategory, string]>
  const businessCopy = useMemo(() => translatePublicObject(locale, {
    ...businessSubscriptionCopy,
    eyebrow: 'Business subscriptions',
    heading: 'Choose a plan for the company',
    intro: 'Compare what is included in each company plan. Switch between monthly and annual pricing to see the yearly discount.',
    adsOnly: 'Ads only',
    noCheckout: 'Create a business account to activate a plan.',
  }), [locale])
  const businessPlans = useMemo(() => translatePublicObject(locale, businessSubscriptionPlans), [locale])
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const businessLocaleTag = localeToIntl(locale)

  return (
    <main className="overflow-x-hidden bg-white text-[#101828] [&_*]:min-w-0">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <PricingAnchorScroll />
      <section className="relative min-h-[360px] overflow-hidden border-b border-[#d8e0ec] bg-[#101828] sm:min-h-[430px] lg:min-h-[460px]">
        <Image
          src="/autorell-pricing-mobile-hero.jpg"
          alt="Autorell mobile listing form"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,12,24,.48)_0%,rgba(7,12,24,.30)_42%,rgba(7,12,24,.08)_76%,rgba(7,12,24,.02)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,12,24,.14)_0%,rgba(7,12,24,0)_42%)]" />
        <div className="relative z-10 mx-auto flex min-h-[360px] max-w-[var(--autorell-page-max)] items-end px-5 py-9 sm:min-h-[430px] sm:px-8 sm:py-12 lg:min-h-[460px] lg:py-14">
          <div className="min-w-0">
              <h1 className="max-w-full break-words text-[40px] font-semibold leading-[1.02] tracking-[-.045em] text-white [overflow-wrap:anywhere] sm:max-w-4xl sm:text-[64px]">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] leading-7 text-white/82 sm:text-[18px] sm:leading-8">
                {copy.intro}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="#private" className="rounded-full border border-white/55 bg-white px-4 py-2 text-sm font-medium text-[#101828] shadow-[0_12px_30px_rgba(7,12,24,.18)] transition hover:bg-[#f7faff]">
                  {copy.privateHeading}
                </Link>
                <Link href="#business" className="rounded-full border border-white/45 bg-white/12 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/18">
                  {copy.businessHeading}
                </Link>
              </div>
            </div>
        </div>
      </section>

      <section id="private" className="scroll-mt-28 mx-auto max-w-[var(--autorell-page-max)] px-5 py-14 sm:px-8 sm:py-20">
        <h2 className="text-[28px] font-semibold leading-tight tracking-[-.03em] sm:text-[36px]">{copy.privateHeading}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {packageCards.map(({ key, icon: Icon, recommended }) => (
            <article key={key} className={`rounded-[14px] border bg-white p-6 shadow-[0_18px_44px_rgba(16,24,40,.045)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(16,24,40,.07)] sm:p-7 ${recommended ? 'border-[#aebed3]' : 'border-[#d9e2ef]'}`}>
              <div className="flex items-center justify-between gap-3">
                <Icon className="h-4 w-4 text-[#0866ff]" />
                {recommended ? (
                  <span className="rounded-full border border-[#c9d8ef] bg-[#f7faff] px-3 py-1 text-[11px] font-semibold text-[#0756cf]">
                    {copy.recommended}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-7 text-[26px] font-semibold tracking-[-.025em]">{copy[key]}</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#5f6b7a]">{copy[`${key}Text` as keyof typeof copy]}</p>
            </article>
          ))}
        </div>

        <div className="mt-9 overflow-x-auto rounded-[14px] border border-[#d9e2ef] bg-white shadow-[0_18px_46px_rgba(16,24,40,.045)]">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4 font-semibold sm:px-6">{copy.category}</th>
                <th className="px-5 py-4 font-semibold sm:px-6">{copy.start}</th>
                <th className="px-5 py-4 font-semibold sm:px-6">{copy.standard}</th>
                <th className="px-5 py-4 font-semibold sm:px-6">{copy.premium}</th>
              </tr>
            </thead>
            <tbody>
              {categoryEntries.map(([category, label]) => (
                <tr key={category} className="border-t border-[#edf1f7] transition hover:bg-[#fbfcff]">
                  <th className="px-5 py-4 font-medium sm:px-6">{label}</th>
                  <td className="px-5 py-4 font-semibold text-[#15803d] sm:px-6">{copy.free}</td>
                  <td className="px-5 py-4 sm:px-6">{formatProduct(`listing.${category}.standard`, market, numberLocale)}</td>
                  <td className="px-5 py-4 font-semibold sm:px-6">{formatProduct(`listing.${category}.premium`, market, numberLocale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-8 sm:px-8 sm:py-12">
        <h2 className="text-[26px] font-semibold tracking-[-.025em] sm:text-[32px]">{copy.addonsHeading}</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {addOnKeys.map((productKey) => {
            const product = findProduct(productKey)
            return (
              <article key={productKey} className="rounded-[14px] border border-[#d9e2ef] bg-white p-5 transition hover:border-[#c8d4e5] hover:shadow-[0_16px_38px_rgba(16,24,40,.045)]">
                <div className="flex items-center justify-between gap-3">
                  {product?.addon?.startsWith('featured') ? <Star className="h-4 w-4 text-[#0866ff]" /> : <RefreshCw className="h-4 w-4 text-[#0866ff]" />}
                  <span className="text-[15px] font-semibold tracking-[-.01em]">{formatProduct(productKey, market, numberLocale)}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold">{addOnTitle(product, copy)}</h3>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{addOnDescription(product, copy)}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section id="business" className="scroll-mt-28 bg-[#f5f7fb] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1380px]">
          <div className="grid gap-6 border-b border-[#dde6f2] pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0866ff]">{businessCopy.eyebrow}</p>
              <h2 className="mt-3 text-[34px] font-semibold leading-tight tracking-[-.04em] text-[#101828] sm:text-[48px]">
                {businessCopy.heading}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f6b7a]">{businessCopy.intro}</p>
            </div>
            <div className="w-full rounded-[14px] border border-[#d8e2f0] bg-white p-2 shadow-[0_18px_46px_rgba(16,24,40,.06)] lg:w-[430px]">
              <div className="grid grid-cols-2 rounded-[10px] bg-[#eef3f9] p-1">
                <button
                  type="button"
                  onClick={() => setBillingPeriod('monthly')}
                  className={`min-h-11 rounded-[8px] text-sm font-bold transition ${
                    billingPeriod === 'monthly' ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]'
                  }`}
                >
                  {businessCopy.monthly}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod('annual')}
                  className={`min-h-11 rounded-[8px] text-sm font-bold transition ${
                    billingPeriod === 'annual' ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]'
                  }`}
                >
                  {businessCopy.annual}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-5">
            {businessPlans.map((plan) => (
              <PublicBusinessPlanCard
                key={plan.key}
                plan={plan}
                billingPeriod={billingPeriod}
                market={market}
                localeTag={businessLocaleTag}
                copy={businessCopy}
              />
            ))}
          </div>
          <p className="mt-6 text-sm font-medium text-[#667085]">{businessCopy.noCheckout}</p>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function PublicBusinessPlanCard({
  plan,
  billingPeriod,
  market,
  localeTag,
  copy,
}: {
  plan: BusinessSubscriptionPlan
  billingPeriod: BillingPeriod
  market: BillingMarket
  localeTag: string
  copy: typeof businessSubscriptionCopy & {
    adsOnly: string
    noCheckout: string
    eyebrow: string
    heading: string
    intro: string
  }
}) {
  const product = getBusinessPlanProduct(plan.key, billingPeriod)
  const annualProduct = getBusinessPlanProduct(plan.key, 'annual')
  const currency = currencyForMarket(market)
  const price = product?.amountMinor[currency] ?? null
  const annualPrice = annualProduct?.amountMinor[currency] ?? null
  const monthlyEquivalent = annualPrice ? Math.round(annualPrice / 12) : null
  const showAnnualBadge = billingPeriod === 'annual' && !plan.enterprise && plan.key !== 'free'

  return (
    <article
      className={`relative flex min-h-[590px] flex-col rounded-[12px] border bg-white shadow-[0_18px_50px_rgba(16,24,40,.055)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(16,24,40,.08)] ${
        plan.recommended ? 'border-[#0866ff] ring-2 ring-[#0866ff]/10' : 'border-[#d9e2ef]'
      }`}
    >
      <div className="flex min-h-[250px] flex-col border-b border-[#edf1f7] p-5">
        <div className="flex min-h-12 flex-col items-start gap-2">
          <p className="min-w-0 text-[11px] font-bold uppercase leading-4 tracking-[.14em] text-[#667085]">{plan.audience}</p>
          {plan.recommended ? (
            <span className="shrink-0 whitespace-nowrap rounded-full border border-[#0866ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.06em] text-[#0866ff]">
              {copy.recommended}
            </span>
          ) : showAnnualBadge ? (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#eef5ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.06em] text-[#0866ff]">
              {copy.annualBadge}
            </span>
          ) : null}
        </div>

        <h3 className="mt-4 text-2xl font-semibold tracking-[-.035em] text-[#101828]">{plan.name}</h3>
        <div className="mt-5">
          {plan.enterprise ? (
            <p className="text-[28px] font-semibold tracking-[-.045em] text-[#101828]">{copy.contactUs}</p>
          ) : (
            <>
              <p className="text-[30px] font-semibold tracking-[-.05em] text-[#101828]">
                {formatBusinessPrice(price || 0, currency, localeTag)}
                <span className="text-sm font-semibold tracking-normal text-[#667085]">
                  {billingPeriod === 'annual' && plan.key !== 'free' ? copy.perYear : copy.perMonth}
                </span>
              </p>
              {billingPeriod === 'annual' && plan.key !== 'free' && monthlyEquivalent ? (
                <p className="mt-1 text-xs font-semibold text-[#667085]">
                  {copy.annualEquivalent} {formatBusinessPrice(monthlyEquivalent, currency, localeTag)}{copy.perMonth}
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
                  <span className="pointer-events-none fixed bottom-6 left-4 right-4 z-50 hidden rounded-[8px] border border-[#dbe4f0] bg-white p-3 text-left text-xs leading-5 text-[#475467] shadow-[0_18px_44px_rgba(16,24,40,.16)] group-focus-within:block group-hover:block sm:absolute sm:bottom-full sm:left-auto sm:right-0 sm:mb-2 sm:w-64 sm:translate-x-0">
                    {feature.description}
                  </span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

function findProduct(productKey: string) {
  return billingProductCatalog.find((product) => product.productKey === productKey) || null
}

function formatProduct(productKey: string, market: BillingMarket, locale: string) {
  const product = findProduct(productKey)
  if (!product) return ''
  const amount = getProductAmount(product, market)
  if (!amount) return ''
  if (amount.amountMinor === 0) return '0'
  return formatMoneyMinor(amount.amountMinor, amount.currency, locale)
}

function formatBusinessPrice(amountMinor: number, currency: ReturnType<typeof currencyForMarket>, locale: string) {
  return formatMoneyMinor(amountMinor, currency, locale).replace(/\s+/g, ' ')
}

function addOnTitle(product: BillingProduct | null, copy: typeof copyByLocaleBase) {
  if (!product) return ''
  if (product.addon?.startsWith('top_placement')) return `${copy.topPlacement} ${product.durationDays} ${copy.days}`
  if (product.addon?.startsWith('featured')) return `${copy.featured} ${product.durationDays} ${copy.days}`
  return product.refreshCredits === 1 ? copy.refresh : `${copy.refresh} x ${product.refreshCredits}`
}

function addOnDescription(product: BillingProduct | null, copy: typeof copyByLocaleBase) {
  if (!product) return ''
  if (product.addon?.startsWith('top_placement')) return copy.topPlacementText
  if (product.addon?.startsWith('featured')) return copy.featuredText
  return copy.refreshText
}
