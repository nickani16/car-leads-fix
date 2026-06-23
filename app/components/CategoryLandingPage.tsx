import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronDown,
  CircleHelp,
  Compass,
  Gauge,
  Globe2,
  Layers3,
  MessagesSquare,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import {
  categoryLandingCopy,
  getCategoryLanding,
  localizedCategorySearchLabel,
  localizeCategoryLanding,
} from '@/lib/category-landings'
import { getRequestLocale } from '@/lib/request-locale'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import type { PublicLocale } from '@/lib/public-i18n'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'

export async function generateCategoryLandingMetadata(
  slug: MarketplaceCategorySlug,
): Promise<Metadata> {
  const [locale, requestHeaders] = await Promise.all([
    getRequestLocale(),
    headers(),
  ])
  const config = getCategoryLanding(slug)
  const localized = localizeCategoryLanding(config, locale)
  const hostname = (
    requestHeaders.get('x-forwarded-host') ||
    requestHeaders.get('host') ||
    ''
  ).toLowerCase()
  const origin = hostname.includes('autorell.de')
    ? 'https://www.autorell.de'
    : hostname.includes('autorell.com')
      ? 'https://www.autorell.com'
      : 'https://www.autorell.se'
  const canonical = `${origin}${config.path}`
  const title = `${localized.label} | Autorell`

  return {
    title: { absolute: title },
    description: localized.intro,
    alternates: { canonical },
    openGraph: {
      title,
      description: localized.intro,
      url: canonical,
      siteName: 'Autorell',
      type: 'website',
      images: [{ url: config.heroImage }],
    },
  }
}

export default async function CategoryLandingPage({
  slug,
}: {
  slug: MarketplaceCategorySlug
}) {
  const locale = await getRequestLocale()
  const config = getCategoryLanding(slug)
  const localized = localizeCategoryLanding(config, locale)
  const copy = categoryLandingCopy(locale)
  const searchLabel = localizedCategorySearchLabel(locale, localized.label)
  const countries = [...new Set(['SE', ...euBuyerMarkets.map((market) => market.code)])]
    .map((code) => ({
      code,
      label: countryName(code, locale),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, locale))

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-[#101828]">
      <PublicHeader
        locale={locale}
        marketplaceChannel={{ label: localized.label, slug }}
      />

      <section className="relative pb-20 pt-5 sm:pb-24 sm:pt-7 lg:pb-28">
        <div className="market-blob pointer-events-none absolute -left-24 top-8 h-64 w-64 bg-[#e5efff]" aria-hidden="true" />
        <div className="market-blob pointer-events-none absolute -right-28 bottom-0 h-72 w-72 bg-[#e8f4ef]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1600px] px-0 sm:px-6 lg:px-7">
          <div className="relative h-[410px] overflow-hidden sm:h-[490px] sm:rounded-[28px] lg:h-[520px]">
            <Image
              src={config.heroImage}
              alt={localized.label}
              fill
              priority
              sizes="(min-width: 1600px) 1544px, 100vw"
              className="object-cover brightness-[1.07] saturate-[.95] contrast-[1.02]"
              style={{ objectPosition: config.heroPosition }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,20,34,.72)_0%,rgba(7,20,34,.48)_28%,rgba(7,20,34,.12)_58%,transparent_82%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(70,151,255,.22),transparent_34%)]" />
            <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#071522]/45 via-[#071522]/10 to-transparent" />
            <div className="absolute left-6 top-8 max-w-[600px] sm:left-10 sm:top-11 lg:left-14 lg:top-14">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ed8ff] drop-shadow-sm sm:text-xs">
                {localized.eyebrow}
              </p>
              <h1 className="mt-3 break-words text-[42px] leading-[.96] tracking-[-0.055em] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,.28)] sm:text-[62px] lg:text-[72px]">
                {localized.label}
              </h1>
              <p className="mt-5 max-w-[520px] text-sm leading-6 text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,.25)] sm:text-base sm:leading-7">
                {localized.intro}
              </p>
            </div>
          </div>

          <form
            action={`/marketplace/${slug}`}
            method="get"
            className="relative z-10 mx-5 -mt-16 grid min-w-0 gap-0 rounded-[24px] bg-white p-4 shadow-[0_22px_55px_rgba(16,24,40,.16)] sm:mx-8 sm:-mt-14 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3 sm:p-5 lg:mx-auto lg:max-w-[1320px] lg:grid-cols-[1fr_1fr_1.25fr_auto_auto] lg:items-center lg:gap-0 lg:rounded-full lg:px-5 lg:py-4"
          >
            <SearchField label={copy.allEurope}>
              <select name="country" defaultValue="" aria-label={copy.allEurope} className="h-11 w-full appearance-none bg-transparent pr-8 text-[15px] font-medium outline-none">
                <option value="">{copy.allEurope}</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2 text-[#475467]" />
            </SearchField>

            <SearchField label={copy.allMakes}>
              <input name="make" placeholder={copy.allMakes} aria-label={copy.allMakes} className="h-11 w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-[#475467]" />
            </SearchField>

            <SearchField label={localized.searchHint}>
              <input name="q" placeholder={localized.searchHint} className="h-11 w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-[#475467]" />
            </SearchField>

            <Link
              href={`/marketplace/${slug}#marketplace-search`}
              className="my-2 inline-flex min-h-11 items-center justify-center gap-2 border-b border-[#c8d6f0] px-3 text-sm font-semibold text-[#0866ff] sm:col-span-2 lg:col-span-1 lg:my-0 lg:border-b-0 lg:underline lg:decoration-2 lg:underline-offset-8"
            >
              <SlidersHorizontal className="h-4 w-4 lg:hidden" />
              {locale === 'sv' ? 'Fler val' : locale === 'de' ? 'Mehr Optionen' : 'More options'}
            </Link>

            <button type="submit" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#0866ff] px-7 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,102,255,.22)] transition hover:bg-[#075bd8]">
              <Search className="h-5 w-5" />
              {searchLabel}
            </button>
          </form>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-16 sm:py-20">
        <div className="market-blob pointer-events-none absolute -right-28 -top-28 h-72 w-72 bg-[#edf3ff]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#0866ff]">
                {locale === 'sv' ? 'En bättre marknadsplats' : locale === 'de' ? 'Ein besserer Marktplatz' : 'A better marketplace'}
              </p>
              <h2 className="mt-4 text-[38px] leading-[1.02] tracking-[-0.05em] sm:text-5xl">
                {trustHeading(locale, localized.label)}
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#667085] lg:justify-self-end">
              {trustIntro(locale)}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {trustFeatures(locale).map(({ title, text, icon: Icon }, index) => (
              <article key={title} className="relative overflow-hidden rounded-[26px] border border-[#e1e6ee] bg-[#fbfcfe] p-6 sm:p-7">
                <div className={`market-blob pointer-events-none absolute -right-12 -top-12 h-32 w-32 ${index === 1 ? 'bg-[#e7f4ef]' : 'bg-[#e8f0ff]'}`} aria-hidden="true" />
                <span className="relative grid h-14 w-14 place-items-center rounded-[17px] border border-white bg-[linear-gradient(145deg,#ffffff,#eaf2ff)] text-[#0866ff] shadow-[0_12px_28px_rgba(8,102,255,.12)]">
                  <Icon className="h-6 w-6" strokeWidth={1.7} />
                </span>
                <h3 className="relative mt-6 text-xl tracking-[-0.035em]">{title}</h3>
                <p className="relative mt-3 text-sm leading-6 text-[#667085]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="guides" className="relative scroll-mt-28 overflow-hidden bg-[#f3f6fb] py-16 sm:py-20">
        <div className="market-blob pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 bg-[#dfeaff]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#0866ff]">{copy.guideEyebrow}</p>
            <h2 className="mt-4 break-words text-[36px] leading-[1.04] tracking-[-0.05em] sm:text-5xl">{copy.guideTitle}</h2>
            <p className="mt-4 text-base leading-7 text-[#667085]">{copy.guideText}</p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {localized.guideTopics.map((topic, index) => {
              const Icon = guideIcon(slug, index)
              return (
                <article key={topic} className="group rounded-[26px] border border-[#dce4f0] bg-white p-6 shadow-[0_16px_42px_rgba(16,24,40,.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(16,24,40,.1)] sm:p-7">
                  <span className="grid h-14 w-14 place-items-center rounded-[17px] bg-[#101828] text-white shadow-[0_12px_28px_rgba(16,24,40,.16)]">
                    <Icon className="h-6 w-6" strokeWidth={1.65} />
                  </span>
                  <h3 className="mt-7 text-xl tracking-[-0.035em]">{topic}</h3>
                  <Link href={`/marketplace/${slug}`} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#0866ff]">
                    {copy.readGuide}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-16 sm:py-20">
        <div className="market-blob pointer-events-none absolute -right-24 bottom-8 h-64 w-64 bg-[#e5f2ed]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1280px] gap-8 px-5 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
          <div className="relative overflow-hidden rounded-[30px] bg-[#101828] p-7 text-white shadow-[0_24px_65px_rgba(16,24,40,.17)] sm:p-10">
            <div className="market-blob pointer-events-none absolute -right-16 -top-20 h-56 w-56 bg-[#1e62c9]" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9ddcff]">
              {copy.sellPrefix} {localized.singular}
            </p>
            <h2 className="mt-4 text-4xl leading-[1.02] tracking-[-0.05em]">
              {copy.sellPrefix} {localized.singular} {copy.sellSuffix}
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-white/68">{copy.sellText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/salj-fordon?category=${slug}`}
                className="inline-flex min-h-12 items-center gap-2 rounded-[14px] bg-[#0866ff] px-5 text-sm font-bold text-white"
              >
                {copy.sellCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/marketplace/${slug}`}
                className="inline-flex min-h-12 items-center rounded-[14px] border border-white/25 px-5 text-sm font-bold text-white"
              >
                {copy.browseCta}
              </Link>
            </div>
          </div>

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#0866ff]">
              {copy.faqEyebrow}
            </p>
            <h2 className="mt-4 text-4xl leading-[1.05] tracking-[-0.05em]">
              {copy.faqTitle}
            </h2>
            <div className="mt-7 divide-y divide-[#e4e7ec] border-y border-[#e4e7ec]">
              {[
                [copy.faqSearchQuestion, copy.faqSearchAnswer],
                [copy.faqSellQuestion, copy.faqSellAnswer],
              ].map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
                    {question}
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f0f4fa] text-[#0866ff] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pt-4 text-sm leading-7 text-[#667085]">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function SearchField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="relative min-w-0 border-b border-[#d8dde6] px-3 py-2 lg:border-b-0 lg:border-r lg:px-6 lg:py-0">
      <span className="block text-xs font-bold text-[#101828]">{label}</span>
      <span className="relative block">{children}</span>
    </label>
  )
}

function trustHeading(locale: PublicLocale, label: string) {
  if (locale === 'sv') return `Din trygga marknadsplats för ${label.toLowerCase()}.`
  if (locale === 'de') return `Ihr verlässlicher Marktplatz für ${label}.`
  return `Your trusted marketplace for ${label.toLowerCase()}.`
}

function trustIntro(locale: PublicLocale) {
  if (locale === 'sv') return 'Sök, jämför och sälj med tydlig information och verktyg anpassade för en europeisk fordonsmarknad.'
  if (locale === 'de') return 'Suchen, vergleichen und verkaufen Sie mit klaren Informationen und Werkzeugen für den europäischen Fahrzeugmarkt.'
  return 'Search, compare and sell with clear information and tools designed for a European vehicle marketplace.'
}

function trustFeatures(locale: PublicLocale) {
  if (locale === 'sv') {
    return [
      { title: 'Sök konkret', text: 'Filtrera på plats, märke och relevant fordonsdata utan onödiga steg.', icon: Compass },
      { title: 'Jämför i Europa', text: 'Se privat- och företagsannonser från flera europeiska marknader på ett ställe.', icon: Globe2 },
      { title: 'Trygg kontakt', text: 'Hantera annons, sparade objekt och meddelanden genom ditt Autorell-konto.', icon: BadgeCheck },
    ]
  }
  if (locale === 'de') {
    return [
      { title: 'Gezielt suchen', text: 'Filtern Sie nach Ort, Marke und relevanten Fahrzeugdaten ohne unnötige Schritte.', icon: Compass },
      { title: 'Europaweit vergleichen', text: 'Private und gewerbliche Angebote aus mehreren Märkten an einem Ort.', icon: Globe2 },
      { title: 'Sicher kontaktieren', text: 'Verwalten Sie Anzeigen, Favoriten und Nachrichten über Ihr Autorell-Konto.', icon: BadgeCheck },
    ]
  }
  return [
    { title: 'Search with purpose', text: 'Filter by location, make and relevant vehicle data without unnecessary steps.', icon: Compass },
    { title: 'Compare across Europe', text: 'See private and business listings from multiple European markets in one place.', icon: Globe2 },
    { title: 'Connect confidently', text: 'Manage listings, saved vehicles and messages through your Autorell account.', icon: BadgeCheck },
  ]
}

function guideIcon(slug: MarketplaceCategorySlug, index: number) {
  const profiles = {
    cars: [Gauge, BarChart3, Sparkles],
    vans: [Layers3, BarChart3, Wrench],
    motorcycles: [Gauge, ShieldCheck, Compass],
    motorhomes: [Layers3, Gauge, Compass],
    caravans: [Layers3, ShieldCheck, Wrench],
    trucks: [Layers3, BarChart3, Wrench],
    agriculture: [Gauge, Wrench, Globe2],
    construction: [Layers3, Wrench, ShieldCheck],
    'electric-bikes': [Gauge, BarChart3, ShieldCheck],
    'e-scooters': [Gauge, Wrench, CircleHelp],
  } as const
  return profiles[slug][index] || MessagesSquare
}

function countryName(code: string, locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) || code
  } catch {
    return code
  }
}
