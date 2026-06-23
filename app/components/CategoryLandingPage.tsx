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
import {
  categoryLandingCopy,
  getCategoryLanding,
  localizedCategorySearchLabel,
  localizeCategoryLanding,
} from '@/lib/category-landings'
import { getRequestLocale } from '@/lib/request-locale'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import type { PublicLocale } from '@/lib/public-i18n'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'
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
  const countries = euCountries
    .map(([code]) => code)
    .map((code) => ({
      code: code.toUpperCase(),
      label: getEuCountryName(code, locale),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, locale))

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-[#101828]">
      <PublicHeader
        locale={locale}
        marketplaceChannel={{ label: localized.label, slug }}
      />

      <section className="relative pb-20 pt-5 sm:pb-24 sm:pt-7 lg:pb-28">
        <div className="market-blob pointer-events-none absolute -left-24 top-8 hidden h-64 w-64 bg-[#e5efff] sm:block" aria-hidden="true" />
        <div className="market-blob pointer-events-none absolute -right-28 bottom-0 hidden h-72 w-72 bg-[#e8f4ef] lg:block" aria-hidden="true" />
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
              <div className="mt-6 flex flex-wrap gap-2">
                {categoryHeroSignals(locale).map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full border border-white/25 bg-white/12 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur-md sm:text-xs"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <form
            action={`/marketplace/${slug}`}
            method="get"
            className="relative z-10 mx-4 -mt-20 grid min-w-0 gap-2 rounded-[24px] border border-white/80 bg-white/97 p-3 shadow-[0_24px_65px_rgba(16,24,40,.18)] backdrop-blur-xl sm:mx-8 sm:-mt-14 sm:grid-cols-2 sm:gap-3 sm:p-5 lg:mx-auto lg:max-w-[1320px] lg:grid-cols-[1fr_1fr_1.25fr_auto_auto] lg:items-center lg:gap-0 lg:rounded-full lg:px-5 lg:py-4"
          >
            <SearchField label={copy.allEurope} icon={Globe2}>
              <select name="country" defaultValue="" aria-label={copy.allEurope} className="h-11 w-full appearance-none bg-transparent pr-8 text-[15px] font-medium outline-none">
                <option value="">{copy.allEurope}</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2 text-[#475467]" />
            </SearchField>

            <SearchField label={copy.allMakes} icon={Layers3}>
              <input name="make" placeholder={copy.allMakes} aria-label={copy.allMakes} className="h-11 w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-[#475467]" />
            </SearchField>

            <SearchField label={localized.searchHint} icon={Search}>
              <input name="q" placeholder={localized.searchHint} className="h-11 w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-[#475467]" />
            </SearchField>

            <Link
              href={`/marketplace/${slug}#marketplace-search`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#d8e4f6] bg-[#f4f8ff] px-3 text-sm font-semibold text-[#0866ff] sm:col-span-2 lg:col-span-1 lg:mx-2 lg:border-0 lg:bg-transparent lg:underline lg:decoration-2 lg:underline-offset-8"
            >
              <SlidersHorizontal className="h-4 w-4 lg:hidden" />
              {locale === 'sv' ? 'Fler val' : locale === 'de' ? 'Mehr Optionen' : 'More options'}
            </Link>

            <button type="submit" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[16px] bg-[#0866ff] px-7 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,102,255,.22)] transition hover:bg-[#075bd8] lg:min-h-14 lg:rounded-full">
              <Search className="h-5 w-5" />
              {searchLabel}
            </button>
          </form>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-16 sm:py-24">
        <div className="market-blob pointer-events-none absolute -left-36 top-16 h-80 w-80 bg-[#e5efff]" aria-hidden="true" />
        <div className="market-blob pointer-events-none absolute -right-40 bottom-0 h-96 w-96 bg-[#e8f5ef]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1280px] gap-10 px-5 sm:px-8 lg:grid-cols-[.88fr_1.12fr] lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0866ff]">
              {locale === 'sv' ? 'Byggd för fordonsaffärer' : locale === 'de' ? 'Für Fahrzeuggeschäfte gebaut' : 'Built for vehicle trading'}
            </p>
            <h2 className="mt-5 max-w-xl break-words text-[36px] leading-[1.01] tracking-[-0.055em] sm:text-[54px]">
              {trustHeading(locale, localized.label)}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#5d6b7d]">
              {trustIntro(locale)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/marketplace/${slug}`} className="inline-flex min-h-12 items-center gap-2 rounded-[14px] bg-[#0866ff] px-5 text-sm font-bold text-white">
                {copy.browseCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/salj-fordon?category=${slug}`} className="inline-flex min-h-12 items-center gap-2 rounded-[14px] border border-[#c8d4e5] bg-white px-5 text-sm font-bold text-[#24344a]">
                {copy.sellCta}
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-[#273b58] bg-[#0d1d32] text-white shadow-[0_30px_80px_rgba(13,29,50,.2)]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#80c5ff]">Autorell marketplace</p>
                <p className="mt-1 text-sm text-white/62">{localized.label} · Europe</p>
              </div>
              <span className="hidden items-center gap-2 rounded-full bg-[#14355d] px-3 py-2 text-[11px] font-semibold text-[#9dd7ff] sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-[#54d59b]" />
                {locale === 'sv' ? 'Öppen marknad' : locale === 'de' ? 'Aktiver Markt' : 'Live market'}
              </span>
            </div>
            <div className="divide-y divide-white/10">
              {trustFeatures(locale).map(({ title, text, icon: Icon }, index) => (
                <div key={title} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-6 sm:px-8">
                  <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-white/8 text-[#81c7ff]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-base">{title}</strong>
                    <span className="mt-1 block text-sm leading-6 text-white/58">{text}</span>
                  </span>
                  <span className="font-mono text-xs text-white/35">0{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="guides" className="relative scroll-mt-28 overflow-hidden border-y border-[#dfe6ef] bg-[#f4f7fb] py-16 sm:py-24">
        <div className="market-blob pointer-events-none absolute -right-24 top-10 h-72 w-72 bg-[#dfeaff]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1280px] gap-8 px-5 sm:px-8 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative min-h-[430px] overflow-hidden rounded-[30px] bg-[#dce8f6]">
            <Image
              src={config.heroImage}
              alt={localized.label}
              fill
              sizes="(min-width: 1024px) 650px, 100vw"
              className="object-cover"
              style={{ objectPosition: config.heroPosition }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08182d]/85 via-[#08182d]/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ed8ff]">{copy.guideEyebrow}</p>
              <h2 className="mt-3 max-w-xl text-[34px] leading-[1.02] tracking-[-0.05em] sm:text-[46px]">{copy.guideTitle}</h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/72">{copy.guideText}</p>
            </div>
          </div>

          <div className="flex flex-col rounded-[30px] border border-[#dbe3ef] bg-white px-6 py-4 shadow-[0_20px_60px_rgba(16,24,40,.07)] sm:px-8">
            {localized.guideTopics.map((topic, index) => {
              const Icon = guideIcon(slug, index)
              return (
                <Link
                  key={topic}
                  href={`/marketplace/${slug}`}
                  className="group grid flex-1 grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-[#e5eaf1] py-7 last:border-0"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#edf4ff] text-[#0866ff]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a96a8]">Guide 0{index + 1}</span>
                    <strong className="mt-1 block text-xl tracking-[-0.03em]">{topic}</strong>
                  </span>
                  <ArrowRight className="h-5 w-5 text-[#0866ff] transition group-hover:translate-x-1" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-[32px] border border-[#c9daf5] bg-[linear-gradient(125deg,#e8f2ff_0%,#f7faff_52%,#eaf7f1_100%)]">
            <div className="market-blob pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 bg-white/70" aria-hidden="true" />
            <div className="relative grid lg:grid-cols-[1.02fr_.98fr]">
              <div className="p-7 sm:p-11 lg:p-14">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
                  {copy.sellPrefix} {localized.singular}
                </p>
                <h2 className="mt-4 max-w-xl text-[38px] leading-[1.02] tracking-[-0.055em] sm:text-[50px]">
                  {copy.sellPrefix} {localized.singular} {copy.sellSuffix}
                </h2>
                <p className="mt-5 max-w-xl leading-8 text-[#5d6b7d]">{copy.sellText}</p>
                <Link href={`/salj-fordon?category=${slug}`} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[14px] bg-[#0866ff] px-6 text-sm font-bold text-white">
                  {copy.sellCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="border-t border-[#c9daf5] bg-white/62 p-7 backdrop-blur-sm sm:p-10 lg:border-l lg:border-t-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">{copy.faqEyebrow}</p>
                <h3 className="mt-3 text-3xl leading-[1.05] tracking-[-0.045em]">{copy.faqTitle}</h3>
                <div className="mt-7 divide-y divide-[#dbe3ed] border-y border-[#dbe3ed]">
                  {[
                    [copy.faqSearchQuestion, copy.faqSearchAnswer],
                    [copy.faqSellQuestion, copy.faqSellAnswer],
                  ].map(([question, answer]) => (
                    <details key={question} className="group py-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
                        {question}
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#0866ff] shadow-sm transition group-open:rotate-45">+</span>
                      </summary>
                      <p className="max-w-xl pt-4 text-sm leading-7 text-[#667085]">{answer}</p>
                    </details>
                  ))}
                </div>
              </div>
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
  icon: Icon,
  children,
}: {
  label: string
  icon: typeof Search
  children: React.ReactNode
}) {
  return (
    <label className="relative flex min-w-0 items-center gap-3 rounded-[15px] border border-[#e1e7f0] bg-[#f8fafc] px-3 py-2 transition focus-within:border-[#9bbdf0] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0866ff]/8 lg:rounded-none lg:border-0 lg:border-r lg:bg-transparent lg:px-6 lg:py-0 lg:focus-within:ring-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#eaf2ff] text-[#0866ff] lg:hidden">
        <Icon className="h-[17px] w-[17px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#667085] lg:text-xs lg:normal-case lg:tracking-normal lg:text-[#101828]">{label}</span>
        <span className="relative block">{children}</span>
      </span>
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

function categoryHeroSignals(locale: PublicLocale) {
  if (locale === 'sv') return ['Privat & företag', 'Hela Europa', 'Smarta filter']
  if (locale === 'de') return ['Privat & Gewerbe', 'Europaweit', 'Intelligente Filter']
  return ['Private & business', 'Across Europe', 'Smart filters']
}
