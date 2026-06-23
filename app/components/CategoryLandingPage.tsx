import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import {
  categoryLandingCopy,
  categoryLandingMenuHref,
  getCategoryLanding,
  localizedCategorySearchLabel,
  localizeCategoryLanding,
} from '@/lib/category-landings'
import { getRequestLocale } from '@/lib/request-locale'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
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
  const [locale, requestHeaders] = await Promise.all([
    getRequestLocale(),
    headers(),
  ])
  const config = getCategoryLanding(slug)
  const localized = localizeCategoryLanding(config, locale)
  const copy = categoryLandingCopy(locale)
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const searchLabel = localizedCategorySearchLabel(locale, localized.label)
  const countries = [...new Set(['SE', ...euBuyerMarkets.map((market) => market.code)])]
    .map((code) => ({
      code,
      label: countryName(code, locale),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, locale))

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fa] text-[#101828]">
      <PublicHeader
        locale={locale}
        marketCode={marketCode}
        marketplaceChannel={{ label: localized.label, slug }}
      />

      <div className="hidden border-b border-[#e2e6ec] bg-white min-[1120px]:block">
        <nav className="mx-auto flex h-[54px] max-w-[1440px] items-center gap-7 overflow-x-auto px-10 text-[13px] font-semibold text-[#344054] xl:px-14">
          <Link href={config.path} className="flex h-full shrink-0 items-center border-b-2 border-[#0866ff] text-[#101828]">
            {localized.label}
          </Link>
          {localized.menu.map((item, index) => (
            <Link
              key={item}
              href={categoryLandingMenuHref(config, item, index)}
              className="flex h-full shrink-0 items-center border-b-2 border-transparent transition hover:border-[#0866ff] hover:text-[#0866ff]"
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>

      <section className="relative min-h-[620px] overflow-hidden bg-[#0d1b2b] lg:min-h-[680px]">
        <Image
          src={config.heroImage}
          alt={localized.label}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: config.heroPosition }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,31,.96)_0%,rgba(7,18,31,.87)_35%,rgba(7,18,31,.28)_68%,rgba(7,18,31,.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,18,31,.55)_0%,transparent_45%)]" />

        <div className="relative mx-auto flex min-h-[620px] max-w-[1440px] items-center px-5 py-16 sm:px-8 lg:min-h-[680px] lg:px-12">
          <div className="min-w-0 w-full max-w-[760px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9ddcff]">
              {localized.eyebrow}
            </p>
            <h1 className="mt-4 max-w-[660px] break-words text-[42px] leading-[0.98] tracking-[-0.055em] text-white sm:text-[72px] lg:text-[88px]">
              {localized.label}
            </h1>
            <p className="mt-6 max-w-[610px] text-base leading-7 text-white/78 sm:text-lg">
              {localized.intro}
            </p>

            <form
              action={`/marketplace/${slug}`}
              method="get"
              className="mt-9 grid min-w-0 gap-2 rounded-[22px] border border-white/20 bg-white p-3 shadow-[0_26px_70px_rgba(0,0,0,.28)] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.35fr_auto]"
            >
              <label className="relative min-w-0">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                <select
                  name="country"
                  defaultValue=""
                  aria-label={copy.allEurope}
                  className="h-13 min-w-0 w-full appearance-none rounded-[13px] border border-[#d8dde6] bg-white pl-10 pr-9 text-sm font-semibold outline-none focus:border-[#0866ff]"
                >
                  <option value="">{copy.allEurope}</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              </label>

              <label className="relative min-w-0">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                <input
                  name="make"
                  placeholder={copy.allMakes}
                  aria-label={copy.allMakes}
                  className="h-13 min-w-0 w-full rounded-[13px] border border-[#d8dde6] bg-white pl-10 pr-4 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#8a94a6] focus:border-[#0866ff]"
                />
              </label>

              <label className="relative min-w-0 sm:col-span-2 lg:col-span-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                <input
                  name="q"
                  placeholder={localized.searchHint}
                  className="h-13 min-w-0 w-full rounded-[13px] border border-[#d8dde6] bg-white pl-10 pr-4 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#8a94a6] focus:border-[#0866ff]"
                />
              </label>

              <button
                type="submit"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-[13px] bg-[#0866ff] px-6 text-sm font-bold text-white transition hover:bg-[#075bd8] sm:col-span-2 lg:col-span-1"
              >
                {searchLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 grid min-w-0 gap-3 text-xs font-semibold text-white/88 sm:flex sm:flex-wrap sm:gap-x-6 sm:text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#8be0b0]" />
                {copy.allEurope}
              </span>
              <span className="flex min-w-0 items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#8be0b0]" />
                {locale === 'sv' ? 'Privata och professionella säljare' : locale === 'de' ? 'Private und gewerbliche Verkäufer' : 'Private and business sellers'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e3e7ed] bg-white py-7 min-[1120px]:hidden">
        <div className="mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-5 sm:px-8">
          {localized.menu.map((item, index) => (
            <Link
              key={item}
              href={categoryLandingMenuHref(config, item, index)}
              className="shrink-0 rounded-full border border-[#d8dde6] bg-white px-4 py-2.5 text-xs font-semibold text-[#344054]"
            >
              {item}
            </Link>
          ))}
        </div>
      </section>

      <section id="guides" className="scroll-mt-28 bg-[#f5f7fa] py-16 sm:py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#0866ff]">
              {copy.guideEyebrow}
            </p>
            <h2 className="mt-4 break-words text-[34px] leading-[1.05] tracking-[-0.05em] sm:text-5xl">
              {copy.guideTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[#667085]">{copy.guideText}</p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {localized.guideTopics.map((topic, index) => (
              <article
                key={topic}
                className="group rounded-[24px] border border-[#dfe5ee] bg-white p-6 shadow-[0_15px_45px_rgba(16,24,40,.045)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(16,24,40,.08)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#eef4ff] text-[#0866ff]">
                  {index === 0 ? <Sparkles className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                </span>
                <h3 className="mt-6 text-xl tracking-[-0.03em]">{topic}</h3>
                <Link
                  href={`/marketplace/${slug}`}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#0866ff]"
                >
                  {copy.readGuide}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-5 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
          <div className="rounded-[28px] bg-[#101828] p-7 text-white sm:p-10">
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

          <div>
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

function countryName(code: string, locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) || code
  } catch {
    return code
  }
}
