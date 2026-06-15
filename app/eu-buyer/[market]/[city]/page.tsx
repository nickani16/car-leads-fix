import type { Metadata } from 'next'
import Image from 'next/image'
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

      <section className="relative isolate min-h-[860px] overflow-hidden border-b border-[#d9ddd9] pt-[78px]">
        <Image
          src="/autorell-volvo-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[66%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(249,247,241,.99)_0%,rgba(249,247,241,.94)_36%,rgba(249,247,241,.28)_70%,rgba(32,36,39,.12)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(32,36,39,.26)_0%,transparent_34%)]" />
        <div className="dealer-seo-orbit absolute -right-52 -top-56 h-[720px] w-[720px] rounded-full border-[96px] border-white/30" />
        <div className="relative mx-auto grid min-h-[690px] max-w-[1440px] items-center gap-12 px-5 pb-12 pt-14 sm:px-8 lg:grid-cols-[1.03fr_.97fr] lg:px-12">
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

          <div className="dealer-seo-console relative z-10 mx-auto w-full min-w-0 max-w-[500px] overflow-hidden rounded-[30px] border border-white/75 bg-white/88 p-5 shadow-[0_35px_90px_rgba(32,36,39,.2)] backdrop-blur-xl sm:p-8 lg:ml-auto">
            <div className="flex items-start justify-between gap-4 border-b border-[#dde2e3] pb-6">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
                  Autorell Market Signal
                </p>
                <h2 className="mt-3 [overflow-wrap:anywhere] text-2xl tracking-[-0.04em] text-[#202124]">
                  {copy.dealerDemand}
                </h2>
              </div>
              <span className="inline-flex max-w-[44%] shrink-0 items-center gap-2 rounded-full bg-[#edf7f1] px-3 py-2 text-[10px] leading-4 text-[#567164]">
                <span className="dealer-seo-live h-2 w-2 shrink-0 rounded-full bg-[#8ed1a8]" />
                <span className="[overflow-wrap:anywhere]">{copy.liveMarket}</span>
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {market.demand.map((label, index) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-[#dfe3e4] bg-white/76 p-4 shadow-[0_12px_28px_rgba(32,33,36,.045)]"
                >
                  <div className="flex min-w-0 items-center justify-between gap-4 text-sm text-[#536b76]">
                    <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
                    <span className="font-medium text-[#202124]">
                      {demandValues[index]}%
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e8edef]">
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
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[17px] bg-[#202427] p-4 text-white">
                <p className="text-[9px] uppercase tracking-[0.16em] text-white/46">
                  01 / Autorell
                </p>
                <strong className="mt-2 block text-lg">2018+</strong>
              </div>
              <div className="rounded-[17px] bg-[#dceef7] p-4 text-[#202124]">
                <p className="text-[9px] uppercase tracking-[0.16em] text-[#58717c]">
                  02 / Autorell
                </p>
                <strong className="mt-2 block text-lg">&lt; 100,000 km</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="relative mx-auto grid max-w-[1440px] gap-px border-t border-white/45 bg-white/38 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {copy.standards.map((standard, index) => {
            const Icon = standardIcons[index]
            return (
              <article
                key={standard}
                className="min-h-[132px] border-b border-white/45 bg-white/48 px-6 py-7 sm:border-b-0 sm:border-r"
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
                    {supportingText}
                  </p>
                  <h3 className="mt-4 text-2xl tracking-[-0.04em]">
                    {standard}
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
          <div className="relative min-h-[460px] overflow-hidden rounded-[30px] border border-white/70 shadow-[0_28px_70px_rgba(48,65,72,.12)]">
            <Image
              src="/autorell-volvo-hero.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover object-[72%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#202427]/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-px bg-white/25 backdrop-blur-md">
              <div className="bg-[#202427]/70 p-6 text-white">
                <Gauge className="h-5 w-5 text-[#b4d9ef]" />
                <strong className="mt-5 block text-xl">{copy.standards[1]}</strong>
              </div>
              <div className="bg-[#202427]/70 p-6 text-white">
                <BatteryCharging className="h-5 w-5 text-[#b4d9ef]" />
                <strong className="mt-5 block text-xl">{copy.standards[3]}</strong>
              </div>
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
