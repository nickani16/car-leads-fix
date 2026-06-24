import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import {
  ArrowRight,
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

      <section className="relative pb-14 pt-0 sm:pb-16 lg:pb-12 lg:pt-6">
        <div className="market-blob pointer-events-none absolute -left-24 top-8 hidden h-64 w-64 bg-[#0866ff]/10 sm:block" aria-hidden="true" />
        <div className="market-blob pointer-events-none absolute -right-28 bottom-0 hidden h-72 w-72 bg-[#e8f4ef] lg:block" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1600px] px-0 lg:px-7">
          <div className="relative h-[330px] overflow-hidden sm:h-[360px] lg:h-[300px] lg:rounded-[28px] xl:h-[320px]">
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(8,102,255,.16),transparent_34%)]" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#071522]/42 via-[#071522]/10 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center lg:inset-auto lg:left-14 lg:top-11 lg:block lg:max-w-[600px] lg:px-0 lg:text-left">
              <div>
              <p className="inline-flex rounded-full bg-white/92 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0866ff] shadow-sm backdrop-blur-sm sm:text-xs">
                {localized.eyebrow}
              </p>
              <h1 className="mt-4 text-[34px] leading-[.96] tracking-[-0.04em] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,.28)] [overflow-wrap:anywhere] sm:text-[50px] lg:text-[52px] xl:text-[56px]">
                {localized.label}
              </h1>
              <p className="mx-auto mt-4 max-w-[520px] text-sm leading-6 text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,.25)] sm:text-base sm:leading-7 lg:mx-0">
                {localized.intro}
              </p>
              </div>
            </div>
          </div>

          <form
            action={`/marketplace/${slug}`}
            method="get"
            className="relative z-10 mx-4 -mt-12 grid min-w-0 gap-2 rounded-[24px] border border-white/80 bg-white/97 p-3 shadow-[0_20px_50px_rgba(16,24,40,.16)] backdrop-blur-xl sm:mx-8 sm:-mt-10 sm:grid-cols-2 sm:gap-3 sm:p-5 lg:mx-auto lg:-mt-10 lg:max-w-[1280px] lg:grid-cols-[1fr_1fr_1.25fr_auto_auto] lg:items-center lg:gap-0 lg:rounded-full lg:px-5 lg:py-4"
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
              href={`/marketplace/${slug}#marketplace-results`}
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

      <section id="guides" className="relative scroll-mt-28 overflow-hidden border-y border-[#e5e7eb] bg-[#f8f8f6] py-14 sm:py-20">
        <div className="market-blob pointer-events-none absolute -right-24 top-10 h-72 w-72 bg-[#0866ff]/8" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="grid gap-6 border-b border-[#d7e0eb] pb-9 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#0866ff]">{copy.guideEyebrow}</p>
              <h2 className="mt-4 max-w-2xl text-[36px] leading-[1.03] tracking-[-0.05em] sm:text-[48px]">{copy.guideTitle}</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#667085] lg:justify-self-end">{copy.guideText}</p>
          </div>

          <div className="mt-8 divide-y divide-[#dbe3ed] rounded-[26px] border border-[#dbe3ed] bg-white px-5 shadow-[0_18px_50px_rgba(16,24,40,.06)] sm:px-8">
            {localized.guideTopics.map((topic, index) => {
              const Icon = guideIcon(slug, index)
              return (
                <Link
                  key={topic}
                  href={`/marketplace/${slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-7 sm:py-8"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#edf4ff] text-[#0866ff]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#0866ff]">Guide 0{index + 1}</span>
                    <strong className="mt-1 block text-lg tracking-[-0.03em] sm:text-xl">{topic}</strong>
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
          <div className="relative overflow-hidden rounded-[28px] border border-[#d7dde8] bg-[linear-gradient(125deg,#ffffff_0%,#f8fbff_52%,#f4f8f5_100%)]">
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

              <div className="border-t border-[#d7dde8] bg-white/72 p-7 backdrop-blur-sm sm:p-10 lg:border-l lg:border-t-0">
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
        <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#0866ff] lg:text-xs lg:normal-case lg:tracking-normal lg:text-[#101828]">{label}</span>
        <span className="relative block">{children}</span>
      </span>
    </label>
  )
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
