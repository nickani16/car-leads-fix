import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BatteryCharging,
  Building2,
  CarFront,
  Check,
  FileCheck2,
  Gauge,
  Globe2,
  Gavel,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import BrandLogo from '@/app/components/BrandLogo'
import {
  euBuyerMarkets,
  getEuBuyerCopy,
  getEuBuyerMarket,
  getEuBuyerPath,
} from '@/lib/eu-buyer-markets'

type RouteProps = {
  params: Promise<{ market: string; city: string }>
}

const processIcons = [Building2, ScanSearch, Gavel, Truck]
const standardIcons = [CarFront, Gauge, FileCheck2, BatteryCharging]
const host = 'https://www.autorell.com'

function trimMeta(value: string, maxLength: number) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).replace(/\s+\S*$/, '')}…`
}

export const dynamicParams = false

export function generateStaticParams() {
  return euBuyerMarkets.flatMap((market) => [
    { market: market.code, city: 'index' },
    ...market.cities.map((city) => ({
      market: market.code,
      city: city.slug,
    })),
  ])
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { market: marketCode, city: citySlug } = await params
  const market = getEuBuyerMarket(marketCode)
  const city =
    citySlug === 'index'
      ? null
      : market?.cities.find((item) => item.slug === citySlug)

  if (!market || (citySlug !== 'index' && !city)) return {}

  const copy = getEuBuyerCopy(market.language)
  const title = city
    ? `${copy.dealerAccess}: ${city.name}`
    : `${copy.dealerAccess}: ${market.countryLocal}`
  const description = trimMeta(
    city
      ? `${copy.cityTitle(city.name)}. ${copy.intro}`
      : `${copy.countryTitle(market.countryLocal)}. ${copy.intro}`,
    158,
  )
  const path = getEuBuyerPath(market, city?.slug)
  const canonical = `${host}${path}`

  return {
    title: { absolute: trimMeta(`${title} | Autorell`, 68) },
    description,
    keywords: [
      `${copy.dealerAccess} ${city?.name ?? market.countryLocal}`,
      `B2B vehicle marketplace ${market.country}`,
      `Swedish cars for dealers ${market.country}`,
      'European car dealer auctions',
      'vehicle sourcing Europe',
    ],
    alternates: {
      canonical,
      languages: {
        [market.language]: canonical,
        'x-default': `${host}/dealers`,
      },
    },
    openGraph: {
      title: trimMeta(title, 65),
      description,
      url: canonical,
      siteName: 'Autorell',
      type: 'website',
    },
  }
}

export default async function EuBuyerPage({ params }: RouteProps) {
  const { market: marketCode, city: citySlug } = await params
  const market = getEuBuyerMarket(marketCode)
  if (!market) notFound()

  const city =
    citySlug === 'index'
      ? null
      : market.cities.find((item) => item.slug === citySlug)
  if (citySlug !== 'index' && !city) notFound()

  const copy = getEuBuyerCopy(market.language)
  const place = city?.name ?? market.countryLocal
  const path = getEuBuyerPath(market, city?.slug)
  const heading = city
    ? copy.cityTitle(city.name)
    : copy.countryTitle(market.countryLocal)
  const demandValues = [86, 74, 67]
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: heading,
        serviceType: 'B2B vehicle sourcing and dealer marketplace',
        provider: {
          '@type': 'Organization',
          name: 'Autorell AB',
          url: host,
        },
        areaServed: {
          '@type': city ? 'City' : 'Country',
          name: place,
        },
        url: `${host}${path}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: copy.allMarkets,
            item: `${host}/dealers`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: market.countryLocal,
            item: `${host}${getEuBuyerPath(market)}`,
          },
          ...(city
            ? [
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: city.name,
                  item: `${host}${path}`,
                },
              ]
            : []),
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: copy.faq.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  }

  return (
    <main className="overflow-hidden bg-[#f7f6f2] text-[#202124]">
      <header className="relative z-30 border-b border-[#deddd7] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[78px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label="Autorell home">
            <BrandLogo />
          </Link>
          <nav
            aria-label="Dealer navigation"
            className="flex items-center gap-2 sm:gap-4"
          >
            <Link
              href="/dealer"
              className="hidden text-sm font-medium text-[#4f6168] transition hover:text-black sm:block"
            >
              {copy.login}
            </Link>
            <Link
              href="/dealer-apply"
              aria-label={copy.apply}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#242424] px-4 text-sm font-medium text-white transition hover:-translate-y-0.5 sm:px-5"
            >
              <span className="hidden sm:inline">{copy.apply}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-[#d9ddd9]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_25%,rgba(180,217,239,.68),transparent_28%),linear-gradient(135deg,#fcfaf5_0%,#f2f0e9_54%,#e7f2f6_100%)]" />
        <div className="dealer-seo-orbit absolute -right-56 -top-64 h-[760px] w-[760px] rounded-full border-[105px] border-white/45" />
        <div className="relative mx-auto grid min-h-[700px] max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:px-12">
          <div className="relative z-10 min-w-0 max-w-[760px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c7d7dc] bg-white/78 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4f7181]">
                <MapPin className="h-4 w-4" />
                {market.flag} {place}
              </span>
              <span className="rounded-full border border-white bg-white/65 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#647a84]">
                {copy.dealerAccess}
              </span>
            </div>
            <h1 className="mt-8 max-w-[820px] break-words text-[45px] leading-[.96] tracking-[-0.06em] sm:text-7xl lg:text-[78px]">
              {heading}
            </h1>
            <p className="mt-7 max-w-[700px] text-[17px] leading-8 text-[#536b76] sm:text-xl sm:leading-9">
              {copy.intro}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dealer-apply"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] pl-7 pr-3 text-sm font-medium text-white shadow-[0_18px_40px_rgba(32,33,36,.2)] transition hover:-translate-y-0.5"
              >
                {copy.apply}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#b4d9ef] text-[#242424]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <a
                href="#process"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#c9cbc6] bg-white/72 px-7 text-sm font-medium backdrop-blur transition hover:bg-white"
              >
                {copy.howItWorks}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {[copy.verified, copy.dealerOnly, copy.inspected].map((fact) => (
                <span
                  key={fact}
                  className="inline-flex items-center gap-2 rounded-full border border-white bg-white/72 px-4 py-2 text-xs text-[#556d78]"
                >
                  <Check className="h-3.5 w-3.5 text-[#4c8299]" />
                  {fact}
                </span>
              ))}
            </div>
          </div>

          <div className="dealer-seo-console relative z-10 mx-auto w-full max-w-[520px] rounded-[30px] border border-white/65 bg-[#202427] p-5 text-white shadow-[0_35px_90px_rgba(32,36,39,.22)] sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
                  Autorell Market Signal
                </p>
                <h2 className="mt-3 text-2xl tracking-[-0.04em]">
                  {copy.dealerDemand}
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[10px] text-white/70">
                <span className="dealer-seo-live h-2 w-2 rounded-full bg-[#8ed1a8]" />
                {copy.liveMarket}
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {market.demand.map((label, index) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-white/10 bg-white/[.065] p-4"
                >
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span>{label}</span>
                    <span className="text-white/55">
                      {demandValues[index]}%
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="dealer-seo-bar block h-full origin-left rounded-full bg-[#b4d9ef]"
                      style={{
                        width: `${demandValues[index]}%`,
                        animationDelay: `${index * 180}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dfdfda] bg-white">
        <div className="mx-auto grid max-w-[1320px] gap-px bg-[#dfdfda] sm:grid-cols-3">
          {[
            [Globe2, copy.dealerOnly],
            [ShieldCheck, copy.inspected],
            [BarChart3, copy.verified],
          ].map(([Icon, label]) => {
            const ItemIcon = Icon as typeof Globe2
            return (
              <article key={String(label)} className="bg-white p-7 sm:p-9">
                <ItemIcon className="h-5 w-5 text-[#4e8197]" />
                <strong className="mt-6 block text-lg font-medium">
                  {String(label)}
                </strong>
              </article>
            )
          })}
        </div>
      </section>

      {city && (
        <section className="border-b border-[#deddd8] bg-[#eef4f5]">
          <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[.35fr_.65fr] lg:px-12">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#66808c]">
                {city.region}
              </p>
              <h2 className="mt-3 text-3xl tracking-[-0.045em]">
                {city.name}
              </h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-[#61737a]">
              {copy.cityTitle(city.name)}. {copy.whyText}
            </p>
          </div>
        </section>
      )}

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:px-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66808c]">
              Autorell B2B
            </p>
            <h2 className="mt-5 text-[40px] leading-[1.02] tracking-[-0.055em] sm:text-6xl">
              {copy.whyTitle}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#66767c]">
              {copy.whyText}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.standards.map((standard, index) => {
              const Icon = standardIcons[index]
              return (
                <article
                  key={standard}
                  className={`relative min-h-[220px] overflow-hidden rounded-[25px] border p-7 ${
                    index === 0
                      ? 'border-[#b9d7e6] bg-[#dfeff7]'
                      : 'border-[#deddd7] bg-white'
                  }`}
                >
                  <span className="absolute -right-12 -top-12 h-32 w-32 rounded-full border-[20px] border-[#b4d9ef]/20" />
                  <Icon className="h-6 w-6 text-[#4e7f94]" />
                  <h3 className="mt-16 text-2xl tracking-[-0.04em]">
                    {standard}
                  </h3>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="process" className="bg-[#202427] py-20 text-white sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
            Autorell transaction flow
          </p>
          <h2 className="mt-5 max-w-4xl text-[40px] leading-[1.02] tracking-[-0.055em] sm:text-6xl">
            {copy.processTitle}
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {copy.stepTitles.map((title, index) => {
              const Icon = processIcons[index]
              return (
                <article
                  key={title}
                  className="group relative min-h-[250px] bg-[#202427] p-7 transition hover:bg-[#272d30]"
                >
                  <span className="absolute left-0 top-0 h-1 w-0 bg-[#b4d9ef] transition-all duration-500 group-hover:w-full" />
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-[#b4d9ef]" />
                    <span className="text-[10px] tracking-[0.18em] text-white/35">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="absolute bottom-8 left-7 right-7 text-xl tracking-[-0.035em]">
                    {title}
                  </h3>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#eef4f5] py-20 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66808c]">
              Autorell vehicle standard
            </p>
            <h2 className="mt-5 text-[40px] leading-[1.02] tracking-[-0.055em] sm:text-6xl">
              {copy.vehicleTitle}
            </h2>
            <p className="mt-6 text-base leading-8 text-[#65767c]">
              {copy.vehicleText}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66808c]">
                {market.flag} {market.countryLocal}
              </p>
              <h2 className="mt-4 text-[38px] tracking-[-0.05em] sm:text-5xl">
                {copy.locationsTitle}
              </h2>
            </div>
            {city && (
              <Link
                href={getEuBuyerPath(market)}
                className="inline-flex items-center gap-2 text-sm font-medium"
              >
                {market.countryLocal}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {market.cities
              .filter((item) => item.slug !== city?.slug)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={getEuBuyerPath(market, item.slug)}
                  className="group flex min-h-24 items-center justify-between rounded-[20px] border border-[#deddd7] bg-white px-6 py-5 transition hover:-translate-y-0.5 hover:border-[#b4d9ef] hover:shadow-[0_16px_40px_rgba(32,33,36,.06)]"
                >
                  <span>
                    <strong className="block text-lg font-medium">
                      {item.name}
                    </strong>
                    <span className="mt-1 block text-xs text-[#849096]">
                      {item.region}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#62879a] transition group-hover:translate-x-1" />
                </Link>
              ))}
          </div>
          <div className="mt-14 border-t border-[#deddd8] pt-10">
            <div className="flex items-center gap-3">
              <Globe2 className="h-5 w-5 text-[#4e8197]" />
              <h3 className="text-2xl tracking-[-0.04em]">
                {copy.allMarkets}
              </h3>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {euBuyerMarkets
                .filter((item) => item.code !== market.code)
                .map((item) => (
                  <Link
                    key={item.code}
                    href={getEuBuyerPath(item)}
                    hrefLang={item.language}
                    className="rounded-full border border-[#d8d8d2] bg-white px-4 py-2 text-sm text-[#5f7077] transition hover:border-[#9ecce2] hover:text-[#202124]"
                  >
                    {item.flag} {item.countryLocal}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#deddd8] bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-[1040px] px-5 sm:px-8">
          <h2 className="text-center text-[38px] tracking-[-0.05em] sm:text-5xl">
            {copy.faqTitle}
          </h2>
          <div className="mt-10 grid gap-3">
            {copy.faq.map(([question, answer]) => (
              <details
                key={question}
                className="group rounded-[20px] border border-[#deddd7] bg-[#faf9f6] p-6 open:bg-white open:shadow-[0_16px_45px_rgba(32,33,36,.05)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-medium">
                  {question}
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dceef7] text-[#365c6f] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-[#68777c]">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[30px] bg-[#b4d9ef] px-7 py-14 text-center sm:px-12 sm:py-20">
          <span className="absolute -right-24 -top-28 h-72 w-72 rounded-full border-[46px] border-white/28" />
          <BadgeCheck className="relative z-10 mx-auto h-7 w-7" />
          <h2 className="relative z-10 mx-auto mt-5 max-w-4xl text-[38px] leading-[1.04] tracking-[-0.055em] sm:text-6xl">
            {copy.whyTitle}
          </h2>
          <Link
            href="/dealer-apply"
            className="relative z-10 mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] px-8 text-sm font-medium text-white"
          >
            {copy.apply}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#deddd8] bg-[#202427] text-white">
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-8 px-5 py-10 sm:flex-row sm:items-center sm:px-8 lg:px-12">
          <div>
            <BrandLogo inverted />
            <p className="mt-4 text-sm text-white/55">{copy.footer}</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            <Link href="/dealers" className="text-white/65 hover:text-white">
              {copy.allMarkets}
            </Link>
            <Link
              href="/dealer-apply"
              className="text-white/65 hover:text-white"
            >
              {copy.apply}
            </Link>
            <Link href="/dealer" className="text-white/65 hover:text-white">
              {copy.login}
            </Link>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  )
}
