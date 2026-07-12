import Link from 'next/link'
import { ArrowRight, BadgeCheck, BarChart3, RefreshCw, Rocket, Star } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
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
    intro: 'Fasta lokala priser. Samma belopp visas i Stripe Checkout.',
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
    intro: 'Faste lokale priser. Samme beløb vises i Stripe Checkout.',
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
    intro: 'Stale lokalne ceny. Ta sama kwota jest widoczna w Stripe Checkout.',
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
  intro: 'Fixed local prices. The same amount is shown in Stripe Checkout.',
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
  const currency = currencyForMarket(market).toUpperCase()
  const categoryEntries = Object.entries(listingCategoryLabels) as Array<[ListingCategory, string]>

  return (
    <main className="overflow-x-hidden bg-white text-[#101828] [&_*]:min-w-0">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="border-b border-[#e5eaf2] bg-white">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-12 sm:px-8 lg:py-18">
          <p className="text-xs font-medium uppercase tracking-[.16em] text-[#0866ff]">{currency}</p>
          <div className="mt-4 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div className="min-w-0">
              <h1 className="max-w-full break-words text-[38px] font-semibold leading-[1.05] tracking-[-.04em] [overflow-wrap:anywhere] sm:max-w-4xl sm:text-[62px]">
                {copy.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#596579] sm:text-lg sm:leading-8">
                {copy.intro}
              </p>
            </div>
            <Link
              href={localizePublicHref(locale, '/konto/annonser/ny')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#0866ff] px-5 text-sm font-medium text-white shadow-[0_14px_34px_rgba(8,102,255,.20)] transition hover:bg-[#075ce5]"
            >
              {copy.sellCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-10 sm:px-8">
        <h2 className="text-2xl font-semibold tracking-[-.02em]">{copy.privateHeading}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {packageCards.map(({ key, icon: Icon, recommended }) => (
            <article key={key} className="rounded-[12px] border border-[#d9e2ef] bg-white p-5 shadow-[0_10px_28px_rgba(16,24,40,.05)]">
              <div className="flex items-center justify-between gap-3">
                <Icon className="h-5 w-5 text-[#0866ff]" />
                {recommended ? (
                  <span className="hidden rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-medium text-[#0866ff] sm:inline-flex">
                    {copy.recommended}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-2xl font-semibold">{copy[key]}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5f6b7a]">{copy[`${key}Text` as keyof typeof copy]}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto rounded-[12px] border border-[#d9e2ef] bg-white shadow-[0_12px_34px_rgba(16,24,40,.05)]">
          <table className="min-w-[720px] w-full border-collapse text-left text-sm">
            <thead className="bg-[#f7f9fc] text-xs uppercase tracking-[.12em] text-[#667085]">
              <tr>
                <th className="px-4 py-3 font-semibold">{copy.category}</th>
                <th className="px-4 py-3 font-semibold">{copy.start}</th>
                <th className="px-4 py-3 font-semibold">{copy.standard}</th>
                <th className="px-4 py-3 font-semibold">{copy.premium}</th>
              </tr>
            </thead>
            <tbody>
              {categoryEntries.map(([category, label]) => (
                <tr key={category} className="border-t border-[#edf1f7]">
                  <th className="px-4 py-3 font-medium">{label}</th>
                  <td className="px-4 py-3 text-[#667085]">{copy.free}</td>
                  <td className="px-4 py-3">{formatProduct(`listing.${category}.standard`, market, numberLocale)}</td>
                  <td className="px-4 py-3 font-medium">{formatProduct(`listing.${category}.premium`, market, numberLocale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-6 sm:px-8">
        <h2 className="text-2xl font-semibold tracking-[-.02em]">{copy.addonsHeading}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {addOnKeys.map((productKey) => {
            const product = findProduct(productKey)
            return (
              <article key={productKey} className="rounded-[12px] border border-[#d9e2ef] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  {product?.addon?.startsWith('featured') ? <Star className="h-5 w-5 text-[#0866ff]" /> : <RefreshCw className="h-5 w-5 text-[#0866ff]" />}
                  <span className="text-sm font-semibold">{formatProduct(productKey, market, numberLocale)}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold">{addOnTitle(product, copy)}</h3>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{addOnDescription(product, copy)}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-10 sm:px-8">
        <h2 className="text-2xl font-semibold tracking-[-.02em]">{copy.businessHeading}</h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          {businessKeys.map((productKey) => {
            const product = findProduct(productKey)
            const enterprise = product?.businessPlan === 'enterprise'
            return (
              <article key={productKey} className="rounded-[12px] border border-[#d9e2ef] bg-white p-5 shadow-[0_10px_28px_rgba(16,24,40,.04)]">
                <h3 className="text-xl font-semibold capitalize">{enterprise ? copy.enterprise : product?.businessPlan}</h3>
                <p className="mt-3 text-3xl font-semibold tracking-[-.03em]">
                  {enterprise ? copy.contactUs : formatProduct(productKey, market, numberLocale)}
                </p>
                {!enterprise ? <p className="mt-1 text-sm text-[#667085]">{copy.perMonth}</p> : null}
                <div className="mt-5 border-t border-[#edf1f7] pt-4 text-sm leading-6 text-[#4b5565]">
                  {enterprise
                    ? copy.contactUs
                    : `${product?.activeListingLimit || 0} ${copy.activeListings}`}
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
