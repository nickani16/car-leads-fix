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
  Clock3,
  Gavel,
  Globe2,
  Handshake,
  MonitorSmartphone,
  ScanSearch,
  ShieldCheck,
  Sparkles,
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
        'European dealer marketplace',
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
      'Sälj bilen till verifierade handlare i Europa. Autorell samordnar budgivning, kontroll, betalning, hämtning, dokument och export.',
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

      <section className="relative isolate min-h-[676px] overflow-hidden bg-[#f7f2e8] md:-mt-[124px] md:min-h-[864px] md:pt-[124px] lg:min-h-[864px]">
        <Image
          src="/autorell-volvo-hero.jpg"
          alt="Modern elbil vid nordisk arkitektur"
          fill
          priority
          className="object-cover object-[72%_bottom] sm:object-[76%_center] lg:object-right"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fcfaf5_0%,rgba(252,250,245,.98)_33%,rgba(252,250,245,.82)_49%,rgba(252,250,245,.14)_75%,transparent_100%)] max-md:bg-[linear-gradient(180deg,#fcfaf5_0%,rgba(252,250,245,.96)_45%,rgba(252,250,245,.45)_68%,rgba(247,242,232,.06)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(247,242,232,.42)_0%,transparent_35%)] max-md:bg-[linear-gradient(0deg,rgba(32,33,36,.18)_0%,transparent_35%)]" />
        <div className="home-hero-orb absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#B4D9EF]/28 blur-3xl" />

        <HomeMarketPulse />

        <div className="relative mx-auto flex min-h-[676px] max-w-[1440px] items-start px-5 pb-16 pt-16 sm:px-8 md:items-center md:py-24 lg:min-h-[740px] lg:px-12 xl:px-16">
          <div className="w-full min-w-0 max-w-[720px] md:translate-y-8">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-[#d3d9d9] bg-white/82 px-3.5 py-2 text-[11px] font-medium text-[#405764] shadow-[0_10px_28px_rgba(32,33,36,.07)] backdrop-blur sm:mb-6 sm:px-4 sm:text-xs md:mb-10 md:translate-y-4">
              <Sparkles className="h-4 w-4 shrink-0 text-[#4f8298]" />
              <span>Sälj tryggt. Nå fler professionella köpare.</span>
            </div>
            <h1 className="max-w-[700px] text-[42px] leading-[.98] tracking-[-0.055em] text-[#202124] min-[390px]:text-[48px] sm:text-6xl lg:text-[64px] xl:text-[76px]">
              Sälj bilen i Sverige.
              <span className="block text-[#242424]">
                <span className="whitespace-nowrap">Nå professionella</span>{' '}
                köpare i Europa.
              </span>
            </h1>
            <p className="mt-5 max-w-[590px] text-[16px] leading-7 text-[#4e6377] sm:mt-7 sm:text-xl sm:leading-8">
              Vi kvalificerar bilen, presenterar den för verifierade handlare
              och samlar bud under 24 timmar. Accepterar du ett bud samordnar
              Autorell kontroll, betalning, hämtning och export.
            </p>
            <div className="mt-7 grid gap-3 sm:mt-10 sm:flex sm:flex-row">
              <Link
                href="/salj-bil"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[14px] bg-[#B4D9EF] px-7 text-base font-medium text-[#242424] shadow-[0_14px_30px_rgba(94,154,190,.18)] transition hover:-translate-y-0.5 hover:bg-[#C9E6F6] sm:rounded-full sm:font-normal"
              >
                Sälj din bil
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#sa-fungerar-det"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[14px] border border-[#d0cec7] bg-white/85 px-7 text-base font-medium text-[#242424] shadow-[0_10px_28px_rgba(32,33,36,.06)] backdrop-blur-sm transition hover:border-[#242424] hover:bg-white sm:rounded-full sm:font-normal"
              >
                Hur det funkar
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6 grid w-full max-w-[420px] grid-cols-3 gap-1.5 sm:mt-10 sm:flex sm:max-w-none sm:flex-wrap sm:gap-2.5 sm:text-sm">
              {[
                { label: 'Kostnadsfritt' },
                { label: 'Ingen bindning' },
                { label: 'Budgivning i 24 timmar', mobileLabel: '24 h budgivning' },
              ].map(({ label, mobileLabel }) => (
                  <span
                    key={label}
                    className="inline-flex min-h-8 items-center justify-center gap-1 whitespace-nowrap rounded-full border border-[#d9e1e4] bg-white/88 px-1.5 text-[9px] text-[#334c5d] shadow-[0_10px_28px_rgba(32,33,36,.12)] backdrop-blur-md min-[390px]:gap-1.5 min-[390px]:px-2 min-[390px]:text-[10px] sm:min-h-9 sm:justify-start sm:gap-2 sm:px-4 sm:text-sm sm:shadow-[0_8px_24px_rgba(32,33,36,.07)]"
                  >
                    <CircleCheck className="h-3 w-3 shrink-0 text-[#b4d9ef] min-[390px]:h-3.5 min-[390px]:w-3.5 sm:h-4 sm:w-4 sm:text-[#4f8ca8]" />
                    <span className={mobileLabel ? 'sm:hidden' : undefined}>
                      {mobileLabel || label}
                    </span>
                    {mobileLabel && (
                      <span className="hidden sm:inline">{label}</span>
                    )}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden border-y border-[#dce7eb] bg-[#f7faf9]">
        <div className="absolute -left-20 -top-32 h-72 w-72 rounded-full bg-[#b4d9ef]/35 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#efe5cf]/45 blur-3xl" />

        <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-5 sm:px-8 lg:grid-cols-4 lg:px-12 xl:px-16">
          {[
            {
              value: 'Utvalda bilar',
              label: 'Kvalificerat utbud',
              note: 'Vi fokuserar på fordon som matchar verklig efterfrågan i nätverket.',
              icon: Globe2,
            },
            {
              value: 'Tydlig fordonsdata',
              label: 'Bättre beslutsunderlag',
              note: 'Skick, historik och kända fel struktureras före budgivningen.',
              icon: Clock3,
            },
            {
              value: '24 timmar',
              label: 'Europeisk budgivning',
              note: 'Verifierade handlare får en fokuserad period att bedöma och buda.',
              icon: MonitorSmartphone,
            },
            {
              value: 'Vi löser resten',
              label: 'Efter accepterat bud',
              note: 'Autorell samordnar kontroll, betalning, hämtning, dokument och export.',
              icon: Truck,
            },
          ].map(({ value, label, note, icon: Icon }, index) => (
            <div
              key={label}
              className="home-signal-card group relative min-h-[190px] border-b border-[#dce7eb] px-3 py-7 odd:border-r odd:border-[#dce7eb] sm:px-6 sm:py-9 lg:min-h-[232px] lg:border-b-0 lg:border-r lg:border-[#dce7eb] lg:px-8 lg:py-10 lg:last:border-r-0 xl:px-10"
              style={{ animationDelay: `${index * 0.45}s` }}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-[#cfe0e7] bg-white text-[#4f8298] shadow-[0_8px_22px_rgba(51,83,96,.07)] transition group-hover:-translate-y-0.5 group-hover:bg-[#b4d9ef] group-hover:text-[#202427] sm:h-11 sm:w-11">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#a5b3b8]">
                  0{index + 1}
                </span>
              </div>
              <strong className="mt-7 block max-w-[230px] text-xl leading-tight tracking-[-0.035em] text-[#202124] sm:text-[25px]">
                {value}
              </strong>
              <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.13em] text-[#4f8298]">
                {label}
              </span>
              <p className="mt-3 hidden max-w-[245px] text-sm leading-6 text-[#687980] sm:block">
                {note}
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
                Vi kvalificerar bilen innan den visas, samlar strukturerad
                fordonsdata och låter verifierade handlare konkurrera om den.
                När du accepterar tar vi affären vidare hela vägen.
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
            <div className="business-orbit absolute -right-20 -top-28 h-64 w-64 rounded-full border-[42px] border-white/[.055]" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
                Efter accepterat bud
              </p>
              <p className="mt-2 text-2xl leading-tight tracking-[-0.035em] sm:text-3xl">
                Du säljer bilen. Autorell samordnar genomförandet.
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
                    <span className="text-[10px] text-[#b4d9ef]">{number}</span>
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
        <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-[#b4d9ef]/30 blur-3xl" />
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
                <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#b4d9ef]/15 blur-2xl" />
                <CarFront className="absolute -bottom-16 right-3 h-56 w-56 text-white/[.035] sm:right-12 sm:h-64 sm:w-64" />

                <div className="relative flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
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
                      <Icon className="h-5 w-5 text-[#b4d9ef]" />
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
                Svensk exportbudgivning
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
                      text: '24 timmars budgivning ger ett tydligt marknadsunderlag.',
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
                <div className="trust-ring absolute -right-20 -top-20 h-52 w-52 rounded-full border-[32px] border-[#b4d9ef]/10" />
                <div className="relative w-full max-w-[245px]">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-white/[.07] shadow-[0_20px_55px_rgba(0,0,0,.2)]">
                    <Handshake className="h-8 w-8 text-[#b4d9ef]" />
                  </div>
                  <div className="mt-7 rounded-[18px] border border-white/10 bg-white/[.06] p-5 text-center backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
                      Autorell matchning
                    </p>
                    <p className="mt-3 text-xl tracking-[-0.03em]">
                      Svensk bil.
                      <span className="block">Europeiska dealerbud.</span>
                    </p>
                    <div className="mt-5 flex items-end justify-center gap-1">
                      {[35, 54, 43, 72, 61, 88].map((height, index) => (
                        <span
                          key={height}
                          className={`w-4 rounded-t-sm ${
                            index === 5 ? 'bg-[#b4d9ef]' : 'bg-white/18'
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
              className="mt-8 inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-2 rounded-[14px] bg-[#242424] px-8 font-medium text-white shadow-[0_15px_35px_rgba(32,33,36,.2)] transition hover:-translate-y-0.5 hover:bg-[#111111] sm:w-auto sm:rounded-full sm:font-normal"
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
