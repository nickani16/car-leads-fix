import Link from 'next/link'
import { ArrowRight, BadgeCheck, BarChart3, RefreshCw, Rocket, Star } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import PricingAnchorScroll from '@/app/components/PricingAnchorScroll'
import {
  billingProductCatalog,
  formatMoneyMinor,
  getProductAmount,
  listingCategoryLabels,
  type BillingMarket,
  type BillingProduct,
  type ListingCategory,
} from '@/lib/billing/product-catalog'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

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

const businessKeys = [
  'subscription.business.starter.monthly',
  'subscription.business.growth.monthly',
  'subscription.business.professional.monthly',
  'subscription.business.enterprise.monthly',
] as const

export default function PricingPage({ locale, market, marketCode }: PricingPageProps) {
  const copy = copyByLocale[locale] || copyByLocaleBase
  const numberLocale = localeMap[locale] || 'en-GB'
  const categoryEntries = Object.entries(listingCategoryLabels) as Array<[ListingCategory, string]>

  return (
    <main className="overflow-x-hidden bg-white text-[#101828] [&_*]:min-w-0">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <PricingAnchorScroll />
      <section className="border-b border-[#e7ecf3] bg-[#fbfcfe]">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
            <div className="min-w-0">
              <h1 className="max-w-full break-words text-[40px] font-semibold leading-[1.02] tracking-[-.045em] [overflow-wrap:anywhere] sm:max-w-4xl sm:text-[64px]">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] leading-7 text-[#596579] sm:text-[18px] sm:leading-8">
                {copy.intro}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="#private" className="rounded-full border border-[#d8e0ec] bg-white px-4 py-2 text-sm font-medium text-[#101828] transition hover:border-[#b8c4d6]">
                  {copy.privateHeading}
                </Link>
                <Link href="#business" className="rounded-full border border-[#d8e0ec] bg-white px-4 py-2 text-sm font-medium text-[#101828] transition hover:border-[#b8c4d6]">
                  {copy.businessHeading}
                </Link>
              </div>
            </div>
            <Link
              href={localizePublicHref(locale, '/konto/annonser/ny')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#0866ff] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(8,102,255,.16)] transition hover:bg-[#075ce5]"
            >
              {copy.sellCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
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

      <section id="business" className="scroll-mt-28 mx-auto max-w-[var(--autorell-page-max)] px-5 py-14 sm:px-8 sm:py-20">
        <h2 className="text-[28px] font-semibold leading-tight tracking-[-.03em] sm:text-[36px]">{copy.businessHeading}</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {businessKeys.map((productKey) => {
            const product = findProduct(productKey)
            const enterprise = product?.businessPlan === 'enterprise'
            return (
              <article
                key={productKey}
                className={`rounded-[14px] border p-6 shadow-[0_18px_44px_rgba(16,24,40,.04)] transition hover:shadow-[0_22px_54px_rgba(16,24,40,.06)] ${
                  enterprise
                    ? 'border-[#bfd0ea] bg-[#f7faff] hover:border-[#9fb7dd]'
                    : 'border-[#d9e2ef] bg-white hover:border-[#c8d4e5]'
                }`}
              >
                <h3 className="text-[19px] font-semibold capitalize tracking-[-.015em]">{enterprise ? copy.enterprise : product?.businessPlan}</h3>
                <p className="mt-5 text-[32px] font-semibold tracking-[-.04em]">
                  {enterprise ? copy.contactUs : formatProduct(productKey, market, numberLocale)}
                </p>
                {!enterprise ? <p className="mt-1 text-sm text-[#667085]">{copy.perMonth}</p> : null}
                <div className="mt-7 border-t border-[#edf1f7] pt-5 text-sm leading-6 text-[#4b5565]">
                  {enterprise ? (
                    <Link
                      href={localizePublicHref(locale, '/contact')}
                      className="inline-flex items-center gap-2 font-semibold text-[#0866ff] transition hover:text-[#075ce5]"
                    >
                      {copy.contactUs}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    `${product?.activeListingLimit || 0} ${copy.activeListings}`
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
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
