import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ChevronRight,
  CircleCheck,
  LockKeyhole,
  Sparkles,
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

      <section className="relative isolate -mt-[104px] min-h-[780px] overflow-hidden bg-[#f7f2e8] pt-[104px] md:-mt-[124px] md:min-h-[864px] md:pt-[124px] lg:min-h-[864px]">
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

      <section className="relative z-10 border-b border-[#dce5ee] bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-5 sm:px-8 lg:grid-cols-4 lg:px-12 xl:px-16">
          {[
            ['Sverige + Europa', 'Handlarnätverk'],
            ['24 timmar', 'Aktiv budgivning'],
            ['100%', 'Digital process'],
            ['Personlig', 'Support hela vägen'],
          ].map(([value, label]) => (
            <div
              key={label}
              className="flex min-h-28 flex-col justify-center border-b border-[#dce5ee] px-4 py-5 odd:border-r first:pl-0 lg:min-h-36 lg:border-b-0 lg:border-r lg:px-10 lg:last:border-r-0"
            >
              <strong className="text-xl tracking-[-0.025em] text-[#242424] sm:text-2xl">
                {value}
              </strong>
              <span className="mt-1 text-sm text-[#5d6c7c]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="sa-fungerar-det" className="bg-[#f8f5ee] py-16 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#242424]">
              Så fungerar Autorell
            </span>
            <h2 className="mt-4 text-[34px] leading-[1.08] tracking-[-0.045em] text-[#202124] sm:text-5xl">
              Från bil till affär i tre enkla steg
            </h2>
            <p className="mt-4 text-base leading-7 text-[#5d6c7c] sm:mt-5 sm:text-lg sm:leading-8">
              Vi har gjort processen enkel för dig och samtidigt byggt ett
              bättre beslutsunderlag för handlarna.
            </p>
          </div>
          <ProcessSteps />
        </div>
      </section>

      <section id="varfor-autorell" className="bg-white py-16 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid overflow-hidden bg-[#f4efe5] lg:min-h-[720px] lg:grid-cols-[.92fr_1.08fr]">
            <div className="flex flex-col justify-between px-5 py-10 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#242424]">
                  Autorell
                </p>
                <h2 className="mt-6 max-w-xl text-[34px] leading-[1.06] tracking-[-0.05em] text-[#202124] sm:mt-8 sm:text-5xl lg:text-[62px]">
                  Din bil hör hemma på en större marknad.
                </h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-[#536a7f] sm:mt-7 sm:text-lg sm:leading-8">
                  Vi för samman svenska bilägare med professionella köpare i
                  Europa. Du får större räckvidd utan att affären blir mer
                  komplicerad.
                </p>
                <Link
                  href="/salj-bil"
                  className="mt-10 inline-flex items-center gap-3 border-b-2 border-[#242424] pb-2 font-normal text-[#242424] transition hover:gap-5"
                >
                  Börja med din bil
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 border-t border-[#cad9e4] pt-6 sm:mt-20 sm:pt-8">
                <div>
                  <strong className="block text-xl text-[#202124] sm:text-2xl">3 min</strong>
                  <span className="mt-1 block text-xs text-[#6b7e90]">att komma igång</span>
                </div>
                <div className="border-l border-[#cad9e4] pl-5 sm:pl-8">
                  <strong className="block text-xl text-[#202124] sm:text-2xl">24 h</strong>
                  <span className="mt-1 block text-xs text-[#6b7e90]">aktiv marknad</span>
                </div>
                <div className="border-l border-[#cad9e4] pl-5 sm:pl-8">
                  <strong className="block text-xl text-[#202124] sm:text-2xl">EU</strong>
                  <span className="mt-1 block text-xs text-[#6b7e90]">räckvidd</span>
                </div>
              </div>
            </div>

            <div className="relative min-h-[380px] sm:min-h-[520px] lg:min-h-full">
              <Image
                src="/autorell-home-hero.webp"
                alt="Bil redo för en europeisk marknad"
                fill
                className="object-cover object-[58%_center]"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
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

      <section className="border-y border-[#dce5ec] bg-[#f6fbfe] py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:px-12">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-[15px] bg-[#B4D9EF] text-[#242424]">
              <LockKeyhole size={21} />
            </span>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-[#6a7882]">
              Din integritet
            </p>
            <h2 className="mt-4 max-w-xl text-[34px] leading-[1.08] tracking-[-0.045em] sm:text-5xl">
              Vi förmedlar bilen, inte dina kontaktuppgifter.
            </h2>
          </div>

          <div className="rounded-[18px] border border-[#d7e8f2] bg-white p-5 shadow-[0_18px_55px_rgba(32,33,36,.055)] sm:rounded-[24px] sm:p-9">
            <p className="text-base leading-7 text-[#4f606b] sm:text-lg sm:leading-8">
              Ditt telefonnummer och din e-post säljs inte och visas inte för
              dealers under budgivningen. Godkända handlare bedömer
              fordonsprofilen. Kontaktuppgifter delas först när det behövs för
              att genomföra en affär som du har valt att gå vidare med.
            </p>
            <div className="mt-7 grid gap-3 text-sm text-[#52616b] sm:grid-cols-2">
              {[
                'Anonyma dealers i budgivningen',
                'Inga sålda kontaktlistor',
                'Endast relevanta fordonsuppgifter',
                'Du väljer om du vill sälja',
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CircleCheck size={16} className="text-[#609bbb]" />
                  {item}
                </span>
              ))}
            </div>
            <Link
              href="/integritet"
              className="mt-8 inline-flex items-center gap-2 border-b border-[#242424] pb-1 text-sm text-[#242424]"
            >
              Läs vår integritetspolicy
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <FaqTestimonials />

      <section className="bg-white px-5 pb-16 sm:px-8 sm:pb-32 lg:px-12">
        <div className="relative mx-auto max-w-[1220px] overflow-hidden rounded-[20px] bg-[#B4D9EF] px-6 py-11 sm:rounded-[26px] sm:px-12 sm:py-16 lg:px-16">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[55px] border-white/25" />
          <div className="relative flex flex-col items-start justify-between gap-9 lg:flex-row lg:items-center">
            <div>
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
              className="inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-2 rounded-[14px] bg-[#242424] px-8 font-medium text-white shadow-[0_15px_35px_rgba(32,33,36,.2)] transition hover:-translate-y-0.5 hover:bg-[#111111] sm:w-auto sm:rounded-full sm:font-normal"
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
