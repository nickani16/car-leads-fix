import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  ChevronRight,
  CircleCheck,
  Clock3,
  Globe2,
  Headphones,
  MonitorSmartphone,
  Sparkles,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react'
import PublicHeader from './components/PublicHeader'
import FaqTestimonials from './components/FaqTestimonials'
import ProcessSteps from './components/ProcessSteps'
import PublicFooter from './components/PublicFooter'

export const metadata: Metadata = {
  title: 'Autorell | Sälj din bil tryggt till rätt pris',
  description:
    'Sälj din bil enkelt och tryggt. Autorell matchar ditt fordon med kvalitetssäkrade bilhandlare i Sverige och Europa.',
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#202124]">
      <PublicHeader transparentAtTop />

      <section className="relative isolate min-h-[676px] overflow-hidden bg-[#f7f2e8] md:-mt-[124px] md:min-h-[864px] md:pt-[124px] lg:min-h-[864px]">
        <Image
          src="/autorell-home-hero.webp"
          alt="Premiumbil vid modern nordisk arkitektur"
          fill
          priority
          className="object-cover object-[68%_center] max-md:object-[66%_bottom]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fcfaf5_0%,rgba(252,250,245,.98)_33%,rgba(252,250,245,.82)_49%,rgba(252,250,245,.14)_75%,transparent_100%)] max-md:bg-[linear-gradient(180deg,#fcfaf5_0%,rgba(252,250,245,.96)_45%,rgba(252,250,245,.45)_68%,rgba(247,242,232,.06)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(247,242,232,.42)_0%,transparent_35%)] max-md:bg-[linear-gradient(0deg,rgba(32,33,36,.18)_0%,transparent_35%)]" />
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#B4D9EF]/28 blur-3xl" />

        <div className="relative mx-auto flex min-h-[676px] max-w-[1440px] items-start px-5 pb-16 pt-16 sm:px-8 md:items-center md:py-24 lg:min-h-[740px] lg:px-12 xl:px-16">
          <div className="max-w-[720px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d8d6cf] bg-white/82 px-3.5 py-2 text-xs text-[#242424] shadow-[0_8px_25px_rgba(32,33,36,.07)] backdrop-blur-md sm:mb-7 sm:px-4 sm:text-sm">
              <Sparkles className="h-4 w-4 text-[#242424]" />
              En smartare väg till nästa bilaffär
            </div>
            <h1 className="max-w-[700px] text-[42px] leading-[.98] tracking-[-0.055em] text-[#202124] min-[390px]:text-[48px] sm:text-6xl lg:text-[76px]">
              Sälj din bil.
              <span className="block text-[#242424]">Vi hittar rätt köpare.</span>
            </h1>
            <p className="mt-5 max-w-[590px] text-[16px] leading-7 text-[#4e6377] sm:mt-7 sm:text-xl sm:leading-8">
              Autorell matchar din bil med kvalitetssäkrade handlare i Sverige
              och Europa, så att du kan sälja tryggt, enkelt och till rätt pris.
            </p>
            <div className="mt-7 grid gap-3 sm:mt-10 sm:flex sm:flex-row">
              <Link
                href="/salj-bil"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[14px] bg-[#B4D9EF] px-7 text-base font-medium text-[#242424] shadow-[0_14px_30px_rgba(94,154,190,.18)] transition hover:-translate-y-0.5 hover:bg-[#C9E6F6] sm:rounded-full sm:font-normal"
              >
                Värdera din bil
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#sa-fungerar-det"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[14px] border border-[#d0cec7] bg-white/85 px-7 text-base font-medium text-[#242424] shadow-[0_10px_28px_rgba(32,33,36,.06)] backdrop-blur-sm transition hover:border-[#242424] hover:bg-white sm:rounded-full sm:font-normal"
              >
                Så fungerar det
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-[#435a70] sm:mt-10 sm:flex sm:flex-wrap sm:gap-x-7 sm:text-sm">
              {['Kostnadsfritt', 'Ingen bindning', 'Tar cirka 3 minuter'].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CircleCheck className="h-4 w-4 text-[#242424]" />
                    {item}
                  </span>
                ),
              )}
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
              value: 'Sverige + Europa',
              label: 'Ett bredare handlarnätverk',
              note: 'Din bil når relevanta köpare över flera marknader.',
              icon: Globe2,
            },
            {
              value: '24 timmar',
              label: 'Fokuserad budgivning',
              note: 'Handlarna får en tydlig period att bedöma och agera.',
              icon: Clock3,
            },
            {
              value: '100% digitalt',
              label: 'Från uppgifter till bud',
              note: 'Följ processen enkelt utan onödiga mellansteg.',
              icon: MonitorSmartphone,
            },
            {
              value: 'Personlig support',
              label: 'En människa hela vägen',
              note: 'Vi finns nära till hands när affären behöver oss.',
              icon: Headphones,
            },
          ].map(({ value, label, note, icon: Icon }, index) => (
            <div
              key={label}
              className="group relative min-h-[190px] border-b border-[#dce7eb] px-3 py-7 odd:border-r odd:border-[#dce7eb] sm:px-6 sm:py-9 lg:min-h-[232px] lg:border-b-0 lg:border-r lg:border-[#dce7eb] lg:px-8 lg:py-10 lg:last:border-r-0 xl:px-10"
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
        className="relative overflow-hidden bg-[#eef5f7] py-16 sm:py-28"
      >
        <div className="absolute -left-28 top-16 h-72 w-72 rounded-full border-[55px] border-white/45" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#dcecf3]/70 blur-3xl" />

        <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-[#c8dce5] bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#496878]">
                Så fungerar Autorell
              </span>
              <h2 className="mt-6 text-[38px] leading-[1.04] tracking-[-0.052em] text-[#202124] sm:text-5xl lg:text-[58px]">
                Från första uppgift till rätt affär.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#5b6e77] sm:text-lg sm:leading-8">
                En genomtänkt process som gör det enkelt för dig att sälja och
                enkelt för rätt handlare att lämna ett seriöst erbjudande.
              </p>
            </div>

            <div className="grid grid-cols-3 overflow-hidden rounded-[18px] border border-white/80 bg-white/65 shadow-[0_18px_55px_rgba(32,33,36,.06)] backdrop-blur-sm">
              {[
                ['3 min', 'att komma igång'],
                ['24 h', 'aktiv marknad'],
                ['0 kr', 'att använda'],
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

          <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-[20px] bg-[#242424] px-6 py-7 text-white shadow-[0_24px_65px_rgba(32,33,36,.16)] sm:flex-row sm:items-center sm:px-9">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
                Redo när du är
              </p>
              <p className="mt-2 text-xl tracking-[-0.025em] sm:text-2xl">
                Börja med bilen. Vi tar hand om resten.
              </p>
            </div>
            <Link
              href="/salj-bil"
              className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#b4d9ef] px-6 text-sm font-medium text-[#242424] transition hover:-translate-y-0.5 hover:bg-[#c9e6f6] sm:w-auto"
            >
              Värdera din bil
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="varfor-autorell"
        className="relative overflow-hidden bg-[#f5f1e8] py-16 sm:py-28"
      >
        <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-[#b4d9ef]/30 blur-3xl" />
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full border-[52px] border-white/45" />

        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end lg:gap-20">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d4d0c7] bg-white/65 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5c625f]">
                <TrendingUp className="h-3.5 w-3.5" />
                Efterfrågan i nätverket
              </span>
              <h2 className="mt-6 text-[38px] leading-[1.02] tracking-[-0.052em] text-[#202124] sm:text-5xl lg:text-[58px]">
                Bilar som får handlare att titta en gång till.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#596a70] sm:text-lg sm:leading-8">
                Vårt nätverk söker allt från familjebilar och elbilar till
                premium- och transportfordon. Lägg upp bilen så matchar vi den
                mot de handlare som är mest relevanta.
              </p>
              <Link
                href="/salj-bil"
                className="mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#242424] px-6 text-sm font-medium text-white shadow-[0_16px_35px_rgba(32,33,36,.14)] transition hover:-translate-y-0.5 hover:bg-[#111111]"
              >
                Se intresset för din bil
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
                      Sökes just nu
                    </p>
                    <h3 className="mt-2 text-2xl tracking-[-0.035em] sm:text-[32px]">
                      Fordon för flera marknader
                    </h3>
                  </div>
                  <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-2 text-xs text-white/65 sm:inline-flex">
                    <span className="h-2 w-2 rounded-full bg-[#8fc6a5]" />
                    Aktiv efterfrågan
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
                      Populära märken
                    </p>
                    <p className="mt-2 text-lg tracking-[-0.02em] text-[#242424]">
                      Märken som ofta efterfrågas av handlare
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

          <div className="grid border-b border-[#dce5ec] py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:py-20">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b8c9b]">
                Autorell Dealer Network
              </p>
              <h3 className="mt-4 text-[30px] leading-[1.12] tracking-[-0.04em] text-[#202124] sm:mt-5 sm:text-4xl">
                Professionell bilhandel, samlad på en plats.
              </h3>
              <p className="mt-4 max-w-2xl leading-7 text-[#607286]">
                För handlare erbjuder Autorell ett fokuserat flöde av fordon
                med information som gör det enklare att bedöma och agera.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0">
              <Link
                href="/dealer-apply"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#242424] px-6 font-normal text-white transition hover:bg-[#111111]"
              >
                För bilhandlare
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-13 items-center justify-center px-5 font-normal text-[#242424]"
              >
                Logga in
              </Link>
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
                Se vad marknaden är beredd att betala.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-[#34526c]">
                Börja med en kostnadsfri värdering. Det tar bara några minuter.
              </p>
            </div>
            <Link
              href="/salj-bil"
              className="mt-8 inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-2 rounded-[14px] bg-[#242424] px-8 font-medium text-white shadow-[0_15px_35px_rgba(32,33,36,.2)] transition hover:-translate-y-0.5 hover:bg-[#111111] sm:w-auto sm:rounded-full sm:font-normal"
            >
              Värdera min bil
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
