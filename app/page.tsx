import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { createPublicMetadata } from '@/lib/public-seo'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CarFront,
  ChevronRight,
  CircleDollarSign,
  CircleCheck,
  Gavel,
  Handshake,
  ScanSearch,
  ShieldCheck,
  TrendingUp,
  Truck,
  UserRound,
  Zap,
} from 'lucide-react'
import PublicHeader from './components/PublicHeader'
import BuyerMarketPage from './components/BuyerMarketPage'
import FaqTestimonials from './components/FaqTestimonials'
import HomeMarketPulse from './components/HomeMarketPulse'
import ProcessSteps from './components/ProcessSteps'
import PublicFooter from './components/PublicFooter'

async function getRootMarket() {
  const requestHeaders = await headers()
  const hostname = (
    requestHeaders.get('host') ||
    requestHeaders.get('x-forwarded-host') ||
    ''
  )
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase()

  if (hostname.endsWith('autorell.de')) return 'de'
  if (hostname.endsWith('autorell.com')) return 'en'
  return 'sv'
}

const homeDealerExperienceTiles = [
  {
    title: 'Granska',
    label: 'Vehicle access',
    text: 'Utvalda svenska fordon med tydliga bilder, data och nästa steg.',
    href: '/for-handlare',
    src: '/dealer-handtag.webp',
    alt: 'Närbild på bildörrhandtag för utvalda Autorell-fordon',
  },
  {
    title: 'Analysera',
    label: 'Dealer dashboard',
    text: 'Se marknadssignaler, bud och fordonsprofiler innan beslut.',
    href: '/for-handlare',
    src: '/dealer-macbook.webp',
    alt: 'Autorell dealer dashboard på en laptop',
  },
  {
    title: 'Budsystem',
    label: 'Enkelt budflöde',
    text: 'Lägg bud, se avgifter och förstå totalsumman innan budet skickas in.',
    href: '/for-handlare',
    src: '/dealer-samsung.webp',
    alt: 'Autorell enkelt budsystem med budvy och köpsammanfattning',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const market = await getRootMarket()

  if (market === 'de') {
    return createPublicMetadata({
      title: 'B2B Fahrzeugmarkt für Autohändler | Autorell',
      description:
        'Digitaler B2B-Fahrzeugmarkt für Autohändler: geprüfte Fahrzeuge, strukturierte Daten, Online-Auktionen und europaweite Beschaffung mit Autorell.',
      path: '/',
      locale: 'de',
      keywords: [
        'B2B Fahrzeugmarkt',
        'Fahrzeugbörse für Händler',
        'Autoauktion Händler',
        'Fahrzeugeinkauf Europa',
        'Gebrauchtwagen Großhandel',
        'digitale Fahrzeugauktion',
        'Autohändler Plattform',
      ],
    })
  }

  if (market === 'en') {
    return createPublicMetadata({
      title: 'European Vehicle Sourcing for Dealers | Autorell',
      description:
        'Source selected modern vehicles through structured B2B auctions, verified inspections and cross-border transactions coordinated by Autorell.',
      path: '/',
      locale: 'en',
      keywords: [
        'European vehicle sourcing',
        'modern vehicles for dealers',
        'European vehicle trading platform',
        'B2B car auctions',
        'car sourcing platform',
        'wholesale vehicles Europe',
        'dealer vehicle auctions',
      ],
    })
  }

  return createPublicMetadata({
    title: 'Sälj din bil till handlare i Europa | Autorell',
    description:
      'Privatperson eller företag: Autorell hittar professionella köpare i hela EU och sköter kontroll, betalning, hämtning och export.',
    path: '/',
  })
}

export default async function HomePage() {
  const market = await getRootMarket()

  if (market === 'de') return <BuyerMarketPage locale="de" />
  if (market === 'en') return <BuyerMarketPage locale="en" />

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#202124]">
      <PublicHeader transparentAtTop />

      <section className="relative isolate overflow-hidden border-b border-[#d9d8d2] bg-[#f4f1ea]">
        <Image
          src="/autorell-volvo-hero.jpg"
          alt="Modern elbil vid nordisk arkitektur"
          fill
          priority
          className="object-cover object-[84%_bottom] sm:object-[76%_center] lg:object-right"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(249,247,242,.96)_0%,rgba(249,247,242,.9)_42%,rgba(249,247,242,.46)_69%,rgba(238,238,233,.12)_100%)] sm:bg-[linear-gradient(90deg,#faf8f3_0%,rgba(250,248,243,.98)_34%,rgba(250,248,243,.8)_52%,rgba(250,248,243,.18)_78%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_58%,rgba(180,217,239,.28),transparent_36%),linear-gradient(0deg,rgba(31,36,39,.18)_0%,transparent_34%)] sm:bg-[linear-gradient(0deg,rgba(31,36,39,.12)_0%,transparent_42%)]" />
        <div className="home-hero-orb absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#B4D9EF]/30 blur-3xl" />
        <div className="home-hero-orb absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-white/32 blur-3xl [animation-delay:2.2s]" />
        <div className="absolute -right-32 top-2 h-64 w-64 rounded-full border-[38px] border-[#B4D9EF]/28 sm:hidden" />

        <div className="relative mx-auto grid min-h-[820px] w-full max-w-[1440px] items-start gap-9 px-5 pb-12 pt-14 sm:min-h-[780px] sm:px-8 sm:py-20 lg:min-h-[760px] lg:grid-cols-[1.1fr_.62fr] lg:items-center lg:gap-16 lg:px-12 lg:py-24 xl:px-16">
          <div className="relative z-10 min-w-0 max-w-[760px] lg:translate-y-20 xl:translate-y-16">
            <span className="block max-w-full text-[10px] font-semibold uppercase tracking-[0.18em] text-[#547382] sm:text-[11px] sm:tracking-[0.22em]">
              Svenska fordon för professionella köpare i Europa
            </span>
            <h1 className="mt-8 text-[48px] leading-[.92] tracking-[-0.065em] sm:text-7xl lg:text-[82px] xl:text-[92px]">
              Sälj tryggt.
              <span className="mt-1 block text-[#4f7181]">
                Nå köpare i hela Europa.
              </span>
            </h1>
            <p className="mt-7 max-w-[670px] text-[17px] leading-8 text-[#536a75] sm:text-xl sm:leading-9">
              Autorell testar efterfrågan hos verifierade EU-handlare, lämnar
              ett eget inköpserbjudande och sköter kontroll, betalning,
              hämtning och export.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/salj-bil"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] pl-7 pr-3 text-sm font-medium text-white shadow-[0_18px_40px_rgba(32,33,36,.2)] transition hover:-translate-y-0.5 hover:bg-[#111]"
              >
                Sälj din bil
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#B4D9EF] text-[#242424] transition group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/foretag"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#c7c8c3] bg-white/70 px-7 text-sm font-medium backdrop-blur transition hover:bg-white"
              >
                Sälj företagsfordon
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <HomeMarketPulse />
        </div>

        <div className="relative mx-auto grid max-w-[1440px] grid-cols-2 border-t border-[#d8dddc] bg-white/48 px-5 backdrop-blur sm:px-8 lg:grid-cols-4 lg:px-12 xl:px-16">
          {[
            ['Vår nisch', 'Årsmodell 2018+'],
            ['Mätarställning', 'Högst 10 000 mil'],
            ['Köparnätverk', 'Verifierade handlare i EU'],
            ['Vi sköter', 'Affär, hämtning och export'],
          ].map(([label, value], index) => (
            <div
              key={label}
              className={`py-6 sm:py-8 ${index % 2 ? 'border-l border-[#d8dddc] pl-5 sm:pl-8' : ''} ${index > 1 ? 'border-t border-[#d8dddc] lg:border-t-0' : ''} ${index === 2 ? 'lg:border-l lg:pl-8' : ''}`}
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#879398] sm:text-[10px]">
                {label}
              </p>
              <p className="mt-2 text-sm font-medium tracking-[-0.02em] sm:text-lg">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="sa-fungerar-det"
        className="relative scroll-mt-[124px] overflow-hidden bg-[#eef5f7] py-16 sm:py-28"
      >
        <div className="absolute -left-28 top-16 h-72 w-72 rounded-full border-[55px] border-white/45" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#dcecf3]/70 blur-3xl" />

        <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-[#c8dce5] bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#496878]">
                Från svensk bil till europeisk affär
              </span>
              <h2 className="mt-6 text-[38px] leading-[1.04] tracking-[-0.052em] text-[#202124] sm:text-5xl lg:text-[58px]">
                Sex tydliga steg. Ett sammanhållet exportflöde.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#5b6e77] sm:text-lg sm:leading-8">
                Vi granskar bilen och testar efterfrågan hos verifierade
                handlare i EU. När marknaden fungerar lämnar Autorell ett eget
                erbjudande och sköter resten.
              </p>
            </div>

            <div className="grid grid-cols-3 overflow-hidden rounded-[18px] border border-white/80 bg-white/65 shadow-[0_18px_55px_rgba(32,33,36,.06)] backdrop-blur-sm">
              {[
                ['6 steg', 'från bil till export'],
                ['24 h', 'aktiv marknad'],
                ['0 kr', 'att registrera'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="border-r border-[#dce5e8] px-3 py-5 text-center last:border-r-0 sm:px-5"
                >
                  <strong className="block text-xl tracking-[-0.035em] text-[#202124] sm:text-2xl">
                    {value}
                  </strong>
                  <span className="mt-1 block text-[10px] leading-4 text-[#718087] sm:text-xs">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ProcessSteps />

          <div className="relative mt-10 overflow-hidden rounded-[20px] bg-[#242424] px-6 py-7 text-white shadow-[0_24px_65px_rgba(32,33,36,.16)] sm:px-9 sm:py-9">
            <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full border-[42px] border-white/[.055]" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B4D9EF]">
                Efter accepterat erbjudande
              </p>
              <p className="mt-2 text-2xl leading-tight tracking-[-0.035em] sm:text-3xl">
                Du säljer bilen till Autorell. Vi säljer den vidare i Europa.
              </p>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Vi kontrollerar bilen mot deklarationen och koordinerar
                betalning, hämtning, dokumentation och export till köparen.
              </p>
            </div>
              <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[480px]">
                {[
                  ['01', 'Kontroll på plats'],
                  ['02', 'Betalning & avtal'],
                  ['03', 'Hämtning & export'],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="rounded-[14px] border border-white/10 bg-white/[.055] px-4 py-4 backdrop-blur-sm"
                  >
                    <span className="text-[10px] text-[#B4D9EF]">{number}</span>
                    <strong className="mt-3 block text-sm font-medium text-white/88">
                      {label}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="varfor-autorell"
        className="relative overflow-hidden bg-[#f5f1e8] pb-16 pt-16 sm:pb-20 sm:pt-24"
      >
        <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-[#B4D9EF]/30 blur-3xl" />
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full border-[52px] border-white/45" />

        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end lg:gap-20">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d4d0c7] bg-white/65 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5c625f]">
                <TrendingUp className="h-3.5 w-3.5" />
                Vilka bilar söker vi?
              </span>
              <h2 className="mt-6 text-[38px] leading-[1.02] tracking-[-0.052em] text-[#202124] sm:text-5xl lg:text-[58px]">
                Utvalda bilar för professionell export.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#596a70] sm:text-lg sm:leading-8">
                Vi söker körbara svenska bilar i gott tekniskt skick som
                matchar aktuell efterfrågan hos professionella köpare.
              </p>
              <Link
                href="/salj-bil"
                className="mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#242424] px-6 text-sm font-medium text-white shadow-[0_16px_35px_rgba(32,33,36,.14)] transition hover:-translate-y-0.5 hover:bg-[#111111]"
              >
                Sälj din bil
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/70 shadow-[0_30px_90px_rgba(32,33,36,.1)] backdrop-blur-sm sm:rounded-[30px]">
              <div className="relative overflow-hidden bg-[#23282b] px-5 py-7 text-white sm:px-8 sm:py-9">
                <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#B4D9EF]/15 blur-2xl" />
                <CarFront className="absolute -bottom-16 right-3 h-56 w-56 text-white/[.035] sm:right-12 sm:h-64 sm:w-64" />

                <div className="relative flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B4D9EF]">
                      Aktuell köpbox
                    </p>
                    <h3 className="mt-2 text-2xl tracking-[-0.035em] sm:text-[32px]">
                      Bilar med europeisk efterfrågan
                    </h3>
                  </div>
                  <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-2 text-xs text-white/65 sm:inline-flex">
                    <span className="h-2 w-2 rounded-full bg-[#8fc6a5]" />
                    Sverige som ursprung
                  </span>
                </div>

                <div className="relative mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {[
                    { label: 'SUV & crossover', icon: CarFront },
                    { label: 'El & hybrid', icon: Zap },
                    { label: 'Premium', icon: BadgeCheck },
                    { label: 'Transport', icon: Truck },
                  ].map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      className="rounded-[15px] border border-white/10 bg-white/[.055] p-3.5 sm:min-h-[112px] sm:p-4"
                    >
                      <Icon className="h-5 w-5 text-[#B4D9EF]" />
                      <span className="mt-5 block text-sm leading-5 text-white/85">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-7 sm:px-8 sm:py-9">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#748087]">
                      Ofta relevanta märken
                    </p>
                    <p className="mt-2 text-lg tracking-[-0.02em] text-[#242424]">
                      Exempel från vårt europeiska köparnätverk
                    </p>
                  </div>
                  <span className="text-xs text-[#7a878c]">
                    Efterfrågan varierar per modell
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {[
                    'Volvo',
                    'Volkswagen',
                    'BMW',
                    'Mercedes-Benz',
                    'Audi',
                    'Tesla',
                  ].map((brand) => (
                    <div
                      key={brand}
                      className="flex min-h-14 items-center justify-between rounded-[14px] border border-[#e0e3e1] bg-white px-4 text-sm font-medium text-[#303638] shadow-[0_8px_22px_rgba(32,33,36,.035)] transition hover:-translate-y-0.5 hover:border-[#b7d8e8]"
                    >
                      {brand}
                      <CircleCheck className="h-4 w-4 text-[#78a8bd]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 overflow-hidden rounded-[26px] border border-white/80 bg-white/70 shadow-[0_28px_85px_rgba(32,33,36,.08)] backdrop-blur-sm sm:mt-18 sm:rounded-[32px]">
            <div className="border-b border-[#dfe6e5] px-5 py-9 text-center sm:px-10 sm:py-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d5e2e5] bg-[#f4fafc] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4f7484]">
                <Gavel className="h-3.5 w-3.5" />
                Orderstyrd svensk exporthandel
              </span>
              <h3 className="mx-auto mt-5 max-w-4xl text-[32px] leading-[1.06] tracking-[-0.045em] text-[#202124] sm:text-[46px]">
                Rätt fordonsdata skapar tryggare bud och bättre exportaffärer.
              </h3>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#64757b]">
                Säljaren deklarerar bilen i Sverige. Verifierade handlare
                bedömer samma underlag och lämnar villkorade bud under 24
                timmar.
              </p>
            </div>

            <div className="grid lg:grid-cols-[1fr_.72fr_1fr]">
              <div className="p-6 sm:p-9 lg:p-10">
                <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[#ddecf3] text-[#315f73]">
                  <UserRound className="h-5 w-5" />
                </span>
                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#718086]">
                  För dig som säljer
                </p>
                <h4 className="mt-3 text-2xl tracking-[-0.035em] text-[#202124]">
                  Europeisk räckvidd från Sverige.
                </h4>
                <div className="mt-6 space-y-4">
                  {[
                    {
                      icon: ScanSearch,
                      text: 'En kvalificerad fordonsprofil når relevanta europeiska köpare.',
                    },
                    {
                      icon: CircleDollarSign,
                      text: 'Europeiska handlarbud ger Autorell ett tydligt marknadsunderlag för inköpserbjudandet.',
                    },
                    {
                      icon: ShieldCheck,
                      text: 'Efter acceptans samordnar Autorell kontroll, betalning, hämtning och export.',
                    },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#5f96ad]" />
                      <p className="text-sm leading-6 text-[#5c6d73]">{text}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/salj-bil"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#242424]"
                >
                  Sälj din bil
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden border-y border-[#dfe6e5] bg-[#22272a] p-7 text-white lg:min-h-full lg:border-x lg:border-y-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(180,217,239,.18),transparent_47%)]" />
                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full border-[32px] border-[#B4D9EF]/10" />
                <div className="relative w-full max-w-[245px]">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-white/[.07] shadow-[0_20px_55px_rgba(0,0,0,.2)]">
                    <Handshake className="h-8 w-8 text-[#B4D9EF]" />
                  </div>
                  <div className="mt-7 rounded-[18px] border border-white/10 bg-white/[.06] p-5 text-center backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B4D9EF]">
                      Autorell matchning
                    </p>
                    <p className="mt-3 text-xl tracking-[-0.03em]">
                      Svensk bil.
                      <span className="block">Autorells inköpserbjudande.</span>
                    </p>
                    <div className="mt-5 flex items-end justify-center gap-1">
                      {[35, 54, 43, 72, 61, 88].map((height, index) => (
                        <span
                          key={height}
                          className={`w-4 rounded-t-sm ${
                            index === 5 ? 'bg-[#B4D9EF]' : 'bg-white/18'
                          }`}
                          style={{ height }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-9 lg:p-10">
                <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[#eee8dc] text-[#665d4e]">
                  <Building2 className="h-5 w-5" />
                </span>
                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#718086]">
                  För professionella handlare
                </p>
                <h4 className="mt-3 text-2xl tracking-[-0.035em] text-[#202124]">
                  Kvalificerade bilar. Tydligare beslut.
                </h4>
                <div className="mt-6 space-y-4">
                  {[
                    {
                      icon: BadgeCheck,
                      text: 'Strukturerade uppgifter om skick, historik och kända fel.',
                    },
                    {
                      icon: TrendingUp,
                      text: 'Ett fokuserat flöde av utvalda svenska fordon.',
                    },
                    {
                      icon: Zap,
                      text: 'Villkorad kontroll innan betalning och export slutförs.',
                    },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7b61]" />
                      <p className="text-sm leading-6 text-[#5c6d73]">{text}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/dealer-apply"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#242424]"
                >
                  Bli en del av nätverket
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="grid w-full bg-[#202427] lg:grid-cols-2">
          <div className="grid lg:min-h-[760px] lg:grid-rows-2">
            {homeDealerExperienceTiles.slice(1).map((tile) => (
              <Link
                key={tile.title}
                href={tile.href}
                className="group relative isolate min-h-[330px] overflow-hidden bg-[#dbe9f1] text-[#202124] outline-none sm:min-h-[430px] lg:min-h-0"
              >
                <Image
                  src={tile.src}
                  alt={tile.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.72)_0%,rgba(255,255,255,.16)_42%,rgba(32,36,39,.36)_100%)] transition duration-500 group-hover:bg-[linear-gradient(180deg,rgba(255,255,255,.58)_0%,rgba(255,255,255,.08)_42%,rgba(32,36,39,.48)_100%)]" />
                <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-5 sm:left-8 sm:right-8 sm:top-8">
                  <div>
                    <p className="text-[12px] font-medium tracking-[0.02em]">{tile.label}</p>
                    <h2 className="mt-3 text-[34px] leading-none tracking-[-0.045em] sm:text-5xl">
                      {tile.title}
                    </h2>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#202124]/15 bg-white/35 shadow-[0_18px_45px_rgba(32,33,36,.18)] backdrop-blur transition group-hover:translate-x-1 group-hover:bg-white/70">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </div>
                <p className="absolute bottom-6 left-5 right-5 max-w-xl text-[15px] leading-7 text-white drop-shadow-[0_2px_14px_rgba(0,0,0,.5)] sm:left-8 sm:right-8 sm:text-base">
                  {tile.text}
                </p>
              </Link>
            ))}
          </div>

          <Link
            href={homeDealerExperienceTiles[0].href}
            className="group relative isolate min-h-[520px] overflow-hidden bg-[#dcecf3] text-[#202124] outline-none sm:min-h-[640px] lg:min-h-[760px]"
          >
            <Image
              src={homeDealerExperienceTiles[0].src}
              alt={homeDealerExperienceTiles[0].alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,240,231,.84)_0%,rgba(244,240,231,.42)_28%,rgba(32,36,39,.08)_62%,rgba(32,36,39,.34)_100%)] transition duration-500 group-hover:bg-[linear-gradient(90deg,rgba(244,240,231,.72)_0%,rgba(244,240,231,.3)_28%,rgba(32,36,39,.05)_62%,rgba(32,36,39,.44)_100%)]" />
            <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-5 sm:left-8 sm:right-8 sm:top-8">
              <div>
                <p className="text-[12px] font-medium tracking-[0.02em]">{homeDealerExperienceTiles[0].label}</p>
                <h2 className="mt-3 text-[38px] leading-none tracking-[-0.045em] sm:text-6xl">
                  {homeDealerExperienceTiles[0].title}
                </h2>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#202124]/15 bg-white/35 shadow-[0_18px_45px_rgba(32,33,36,.18)] backdrop-blur transition group-hover:translate-x-1 group-hover:bg-white/70">
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>
            <p className="absolute bottom-6 left-5 right-5 max-w-xl text-[15px] leading-7 text-white drop-shadow-[0_2px_14px_rgba(0,0,0,.5)] sm:left-8 sm:right-8 sm:text-base lg:text-[#202124] lg:drop-shadow-none">
              {homeDealerExperienceTiles[0].text}
            </p>
          </Link>
        </div>
      </section>

      <FaqTestimonials />

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[20px] bg-[#B4D9EF] px-6 py-12 text-center sm:rounded-[26px] sm:px-12 sm:py-16 lg:px-16">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[55px] border-white/25" />
          <div className="absolute -bottom-36 -left-20 h-72 w-72 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex flex-col items-center">
            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#242424]">
                Din bil. Ditt beslut.
              </p>
              <h2 className="mt-4 max-w-3xl text-[34px] leading-[1.06] tracking-[-0.05em] text-[#202124] sm:text-5xl">
                Se om din bil kan nå professionella köpare i Europa.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-[#34526c]">
                Kostnadsfri registrering för utvalda svenska bilar.
              </p>
            </div>
            <Link
              href="/salj-bil"
              className="mt-8 inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#242424] px-8 font-medium text-white shadow-[0_15px_35px_rgba(32,33,36,.2)] transition hover:-translate-y-0.5 hover:bg-[#111111] sm:w-auto sm:font-normal"
            >
              Sälj min bil
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
