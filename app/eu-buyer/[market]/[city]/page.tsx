import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  BatteryCharging,
  Building2,
  CarFront,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  FileCheck2,
  Gauge,
  Globe2,
  Gavel,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Truck,
  UsersRound,
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
const valueIcons = [UsersRound, ShieldCheck, ClipboardCheck, CircleDollarSign]
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
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/35 bg-white/74 backdrop-blur-xl">
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

      <section className="relative isolate overflow-hidden border-b border-[#d9ddd9] bg-[#f6f5f1] pt-[78px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(180,217,239,.62),transparent_25%),radial-gradient(circle_at_46%_82%,rgba(255,255,255,.95),transparent_30%),linear-gradient(135deg,#fbfaf7_0%,#f0efea_55%,#e7f1f4_100%)]" />
        <div className="absolute inset-0 opacity-[.24] [background-image:radial-gradient(#71858e_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="dealer-seo-orbit absolute -right-60 -top-56 h-[760px] w-[760px] rounded-full border-[105px] border-white/30" />
        <div className="relative mx-auto grid min-h-[720px] max-w-[1440px] items-center gap-12 px-5 pb-14 pt-14 sm:px-8 lg:grid-cols-[.95fr_1.05fr] lg:px-12">
          <div className="relative z-10 min-w-0 max-w-[740px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c7d7dc] bg-white/82 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4f7181] shadow-[0_12px_35px_rgba(32,33,36,.07)] backdrop-blur">
                <MapPin className="h-4 w-4" />
                {market.flag} {place}
              </span>
              <span className="rounded-full border border-white/70 bg-white/62 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#647a84] backdrop-blur">
                {copy.dealerAccess}
              </span>
            </div>
            <h1 className="mt-8 max-w-[820px] break-words text-[44px] leading-[.94] tracking-[-0.064em] sm:text-7xl lg:text-[80px]">
              {heading}
            </h1>
            <p className="mt-7 max-w-[680px] [overflow-wrap:anywhere] text-[17px] leading-8 text-[#536b76] sm:text-xl sm:leading-9">
              {copy.intro}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dealer-apply"
                className="group inline-flex min-h-14 w-full min-w-0 items-center justify-center gap-3 rounded-full bg-[#242424] pl-6 pr-3 text-sm font-medium text-white shadow-[0_18px_40px_rgba(32,33,36,.2)] transition hover:-translate-y-0.5 sm:w-auto sm:pl-7"
              >
                <span className="min-w-0 [overflow-wrap:anywhere] text-center">
                  {copy.apply}
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#b4d9ef] text-[#242424]">
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
                  className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-4 py-2 text-xs text-[#556d78] shadow-[0_10px_30px_rgba(32,33,36,.05)] backdrop-blur"
                >
                  <Check className="h-3.5 w-3.5 text-[#4c8299]" />
                  {fact}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 mx-auto min-h-[570px] w-full min-w-0 max-w-[640px]">
            <div className="absolute left-1/2 top-1/2 h-[490px] w-[490px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8299a2]/25 sm:h-[540px] sm:w-[540px]" />
            <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8299a2]/30 sm:h-[390px] sm:w-[390px]" />
            <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8299a2]/35 sm:h-[245px] sm:w-[245px]" />

            <div className="dealer-seo-console absolute left-1/2 top-1/2 z-20 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/75 bg-[#b4d9ef] shadow-[0_28px_70px_rgba(63,91,103,.24)] sm:h-40 sm:w-40">
              <div className="text-center">
                <Globe2 className="mx-auto h-7 w-7 text-[#294a59]" />
                <strong className="mt-3 block text-xl tracking-[-0.04em]">
                  Autorell
                </strong>
              </div>
            </div>

            <div className="absolute left-0 top-[14%] z-10 w-[185px] rounded-[22px] border border-white/75 bg-white/78 p-5 shadow-[0_20px_55px_rgba(43,57,63,.11)] backdrop-blur-xl sm:left-[2%] sm:w-[215px]">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#edf4f6] text-lg">
                  🇸🇪
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.17em] text-[#82939a]">
                    {copy.inspected}
                  </p>
                  <strong className="mt-1 block text-base">Autorell</strong>
                </div>
              </div>
              <span className="dealer-seo-live absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#8ed1a8]" />
            </div>

            <div className="absolute right-0 top-[18%] z-10 w-[180px] rounded-[22px] border border-white/75 bg-white/78 p-5 shadow-[0_20px_55px_rgba(43,57,63,.11)] backdrop-blur-xl sm:right-[1%] sm:w-[220px]">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#edf4f6] text-lg">
                  {market.flag}
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.17em] text-[#82939a]">
                    {copy.dealerOnly}
                  </p>
                  <strong className="mt-1 block [overflow-wrap:anywhere] text-base">
                    {place}
                  </strong>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[4%] left-1/2 z-20 w-[min(94%,440px)] -translate-x-1/2 overflow-hidden rounded-[25px] border border-white/80 bg-white/88 p-5 shadow-[0_28px_70px_rgba(43,57,63,.15)] backdrop-blur-xl sm:p-6">
              <div className="flex min-w-0 items-start justify-between gap-4 border-b border-[#dfe4e5] pb-4">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[#6d8995]">
                    Autorell Market Intelligence
                  </p>
                  <h2 className="mt-2 [overflow-wrap:anywhere] text-xl tracking-[-0.04em]">
                    {copy.dealerDemand}
                  </h2>
                </div>
                <span className="inline-flex max-w-[42%] shrink-0 items-center gap-2 rounded-full bg-[#edf7f1] px-3 py-2 text-[9px] leading-4 text-[#567164]">
                  <span className="dealer-seo-live h-2 w-2 shrink-0 rounded-full bg-[#8ed1a8]" />
                  <span className="[overflow-wrap:anywhere]">{copy.liveMarket}</span>
                </span>
              </div>
              <div className="mt-5 grid gap-4">
                {market.demand.map((label, index) => (
                  <div key={label}>
                    <div className="flex min-w-0 items-center justify-between gap-4 text-xs text-[#536b76]">
                      <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
                      <span className="font-medium text-[#202124]">
                        {demandValues[index]}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8edef]">
                      <span
                        className="dealer-seo-bar block h-full origin-left rounded-full bg-[#83c3df]"
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
        </div>
        <div className="relative mx-auto grid max-w-[1440px] gap-px border-t border-[#d7dcdd] bg-[#d7dcdd] sm:grid-cols-2 lg:grid-cols-4">
          {copy.standards.map((standard, index) => {
            const Icon = standardIcons[index]
            return (
              <article
                key={standard}
                className={`min-h-[132px] px-6 py-7 ${
                  index === 0
                    ? 'bg-[#e6f4fa]'
                    : index === 1
                      ? 'bg-[#f7f8f7]'
                      : index === 2
                        ? 'bg-[#eef1f1]'
                        : 'bg-[#e3e7e8]'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <Icon className="h-5 w-5 text-[#4e8197]" />
                  <span className="text-[10px] tracking-[0.18em] text-[#819198]">
                    0{index + 1}
                  </span>
                </div>
                <strong className="mt-6 block text-lg font-medium">
                  {standard}
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
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[.78fr_1.22fr] lg:gap-20 lg:px-12">
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
              const Icon = valueIcons[index]
              const supportingText = [
                copy.verified,
                copy.dealerOnly,
                copy.inspected,
                copy.howItWorks,
              ][index]
              return (
                <article
                  key={standard}
                  className={`group relative min-h-[250px] overflow-hidden rounded-[26px] border p-7 transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(32,33,36,.09)] ${
                    index === 0
                      ? 'border-[#b9d7e6] bg-[#dfeff7]'
                      : 'border-[#deddd7] bg-white'
                  }`}
                >
                  <span className="absolute -right-12 -top-12 h-36 w-36 rounded-full border-[22px] border-[#b4d9ef]/20 transition duration-700 group-hover:scale-110" />
                  <Icon className="h-6 w-6 text-[#4e7f94]" />
                  <p className="mt-12 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718690]">
                    {standard}
                  </p>
                  <h3 className="mt-4 text-2xl tracking-[-0.04em]">
                    {supportingText}
                  </h3>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="process" className="relative overflow-hidden bg-[#202427] py-20 text-white sm:py-28">
        <span className="dealer-seo-orbit absolute -right-64 -top-72 h-[620px] w-[620px] rounded-full border-[86px] border-white/[.035]" />
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
            Autorell / {copy.howItWorks}
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
                  className="group relative min-h-[280px] bg-[#202427] p-7 transition duration-500 hover:bg-[#293033]"
                >
                  <span className="absolute left-0 top-0 h-1 w-0 bg-[#b4d9ef] transition-all duration-500 group-hover:w-full" />
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-[#b4d9ef]" />
                    <span className="text-[10px] tracking-[0.18em] text-white/35">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="absolute bottom-8 left-7 right-7">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                      {index === 0 ? copy.verified : index === 1 ? copy.dealerOnly : index === 2 ? copy.liveMarket : copy.inspected}
                    </p>
                    <h3 className="mt-3 text-xl tracking-[-0.035em]">{title}</h3>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#eef4f5] py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-12">
          <div className="relative min-h-[500px] overflow-hidden rounded-[30px] border border-white/70 bg-[#202427] p-5 text-white shadow-[0_28px_70px_rgba(48,65,72,.16)] sm:p-8">
            <span className="dealer-seo-orbit absolute -right-36 -top-40 h-96 w-96 rounded-full border-[58px] border-white/[.045]" />
            <div className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
                  Autorell Vehicle Intelligence
                </p>
                <h3 className="mt-3 text-2xl tracking-[-0.04em]">
                  {copy.verified}
                </h3>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[.06]">
                <ScanSearch className="h-5 w-5 text-[#b4d9ef]" />
              </span>
            </div>
            <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-2">
              {copy.standards.map((standard, index) => {
                const Icon = standardIcons[index]
                return (
                  <div
                    key={standard}
                    className={`min-h-[126px] rounded-[20px] border p-5 ${
                      index === 0
                        ? 'border-[#b4d9ef]/60 bg-[#b4d9ef] text-[#202124]'
                        : 'border-white/10 bg-white/[.055]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Icon
                        className={`h-5 w-5 ${
                          index === 0 ? 'text-[#3e6f85]' : 'text-[#b4d9ef]'
                        }`}
                      />
                      <span
                        className={`text-[9px] tracking-[0.17em] ${
                          index === 0 ? 'text-[#52798b]' : 'text-white/30'
                        }`}
                      >
                        0{index + 1}
                      </span>
                    </div>
                    <strong className="mt-7 block text-base font-medium">
                      {standard}
                    </strong>
                  </div>
                )
              })}
            </div>
            <div className="relative z-10 mt-3 flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-white/[.04] px-5 py-4">
              <span className="text-xs text-white/52">{copy.inspected}</span>
              <span className="inline-flex items-center gap-2 text-xs text-[#b4d9ef]">
                <span className="dealer-seo-live h-2 w-2 rounded-full bg-[#8ed1a8]" />
                {copy.verified}
              </span>
            </div>
          </div>
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66808c]">
              Autorell / {copy.standards[0]}
            </p>
            <h2 className="mt-5 text-[40px] leading-[1.02] tracking-[-0.055em] sm:text-6xl">
              {copy.vehicleTitle}
            </h2>
            <p className="mt-6 text-base leading-8 text-[#65767c]">
              {copy.vehicleText}
            </p>
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {copy.standards.map((standard) => (
                <div
                  key={standard}
                  className="flex min-h-16 items-center gap-3 rounded-[16px] border border-white bg-white/75 px-4 py-3"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#dceef7]">
                    <Check className="h-4 w-4 text-[#436d80]" />
                  </span>
                  <span className="text-sm font-medium">{standard}</span>
                </div>
              ))}
            </div>
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
                  className="group relative flex min-h-28 items-center justify-between overflow-hidden rounded-[22px] border border-[#deddd7] bg-white px-6 py-5 transition duration-300 hover:-translate-y-1 hover:border-[#b4d9ef] hover:shadow-[0_18px_46px_rgba(32,33,36,.08)]"
                >
                  <span className="absolute -right-8 -top-10 h-24 w-24 rounded-full border-[15px] border-[#b4d9ef]/15 transition duration-500 group-hover:scale-110" />
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
          <div className="mt-14 rounded-[26px] border border-[#deddd8] bg-white p-6 sm:p-8">
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
                    className="rounded-full border border-[#d8d8d2] bg-[#faf9f6] px-4 py-2 text-sm text-[#5f7077] transition hover:-translate-y-0.5 hover:border-[#9ecce2] hover:bg-white hover:text-[#202124]"
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
