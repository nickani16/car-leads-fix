import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CarFront,
  Check,
  FileCheck2,
  Globe2,
  Handshake,
  Route,
  ScanSearch,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import BusinessFleetForm from '../components/BusinessFleetForm'
import PublicBreadcrumbs from '../components/PublicBreadcrumbs'
import PublicFooter from '../components/PublicFooter'
import PublicHeader from '../components/PublicHeader'

export const metadata: Metadata = {
  title: 'Företagsförsäljning och fordonsflottor',
  description:
    'Autorell hjälper företag, leasingbolag och vagnparksägare att avyttra enstaka fordon eller hela fordonsflottor genom ett europeiskt köparnätverk.',
}

const process = [
  {
    icon: ScanSearch,
    title: 'Portföljen kartläggs',
    text: 'Vi går igenom volym, fordonstyper, placering, tidsplan och era kommersiella mål.',
  },
  {
    icon: FileCheck2,
    title: 'Underlaget kvalitetssäkras',
    text: 'Fordonsdata, historik, dokumentation och deklarerat skick struktureras för professionella köpare.',
  },
  {
    icon: Globe2,
    title: 'Rätt marknad aktiveras',
    text: 'Fordonen presenteras för relevanta och verifierade köpare i Sverige och övriga Europa.',
  },
  {
    icon: TrendingUp,
    title: 'Konkurrens skapas',
    text: 'En tydlig budprocess ger er jämförbara erbjudanden och bättre beslutsunderlag per fordon.',
  },
  {
    icon: ShieldCheck,
    title: 'Affären samordnas',
    text: 'Autorell koordinerar avtal, identitetskontroller, betalningsflöde och överlämning.',
  },
  {
    icon: Route,
    title: 'Transport och export',
    text: 'Vid behov samordnar vi upphämtning, transport, exportdokumentation och leverans inom Europa.',
  },
]

export default function BusinessPage() {
  return (
    <main className="w-full overflow-x-hidden bg-[#f7f5f0] text-[#202124]">
      <PublicHeader />

      <section className="relative isolate overflow-hidden bg-[linear-gradient(145deg,#f8f4ec_0%,#edf5f8_58%,#e5f0f5_100%)] lg:min-h-[760px]">
        <div className="absolute inset-x-0 bottom-0 h-[44%] sm:h-[48%] lg:inset-y-0 lg:left-auto lg:h-auto lg:w-[48%]">
          <Image
            src="/autorell-home-hero.webp"
            alt="Professionell hantering av företagsfordon"
            fill
            priority
            className="object-cover object-[67%_center] lg:object-[62%_center]"
            sizes="(max-width: 1024px) 100vw, 48vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#edf5f8_0%,rgba(237,245,248,.4)_30%,transparent_72%)] lg:bg-gradient-to-r lg:from-[#edf5f8] lg:via-transparent lg:to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(18,28,34,.24),transparent_45%)] lg:hidden" />
        </div>
        <div className="business-orbit absolute -left-32 -top-36 h-[340px] w-[340px] rounded-full border-[44px] border-white/55 sm:-left-48 sm:-top-56 sm:h-[560px] sm:w-[560px] sm:border-[72px]" />
        <div className="business-orbit-reverse absolute bottom-[-120px] right-[-100px] h-[270px] w-[270px] rounded-full border-[38px] border-[#B4D9EF]/55 sm:bottom-[-180px] sm:right-[34%] sm:h-[380px] sm:w-[380px] sm:border-[52px]" />
        <div className="absolute left-[12%] top-20 h-24 w-24 rounded-full bg-white/65 blur-2xl sm:h-40 sm:w-40" />

        <div className="relative mx-auto flex min-h-[820px] max-w-[1440px] items-start px-5 pb-[360px] pt-5 sm:min-h-[900px] sm:px-8 sm:pb-[430px] sm:pt-7 lg:min-h-[760px] lg:px-12 lg:py-7 xl:px-16">
          <div className="flex min-w-0 max-w-full flex-col lg:min-h-[706px] lg:w-full">
            <PublicBreadcrumbs
              items={[{ label: 'Företag' }]}
              className="mb-12 sm:mb-16 lg:mb-0"
            />

            <div className="min-w-0 lg:my-auto lg:max-w-[690px]">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#cddde5] bg-white/75 px-3.5 py-2 text-[11px] font-medium text-[#465c68] shadow-[0_10px_30px_rgba(60,84,96,.07)] backdrop-blur sm:px-4 sm:text-xs">
                <Building2 className="h-4 w-4" />
                Autorell för företag
              </div>
              <h1 className="mt-6 max-w-full text-[39px] leading-[1.01] tracking-[-0.052em] [overflow-wrap:anywhere] min-[390px]:text-[43px] sm:mt-7 sm:text-6xl lg:text-[76px]">
                En strukturerad väg ut ur fordonsinnehavet.
              </h1>
              <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#526b78] sm:mt-7 sm:text-xl sm:leading-8">
                För företag, leasingaktörer och vagnparksägare som vill avyttra
                enstaka bilar eller hela flottor med större räckvidd, tydlig
                kontroll och en ansvarig partner genom hela affären.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row">
                <a
                  href="#foretagskontakt"
                  className="group inline-flex min-h-14 w-full items-center justify-between gap-3 rounded-[16px] bg-[#242424] pl-6 pr-3 text-sm font-medium text-white shadow-[0_16px_35px_rgba(32,33,36,.2)] transition hover:-translate-y-0.5 hover:bg-[#111] sm:w-auto sm:justify-center sm:rounded-full sm:px-7"
                >
                  Diskutera er fordonsflotta
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#B4D9EF] text-[#242424] sm:hidden">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                  <ArrowRight className="hidden h-4 w-4 sm:block" />
                </a>
                <a
                  href="#process"
                  className="inline-flex min-h-14 w-full items-center justify-center rounded-[16px] border border-[#bfcfd7] bg-white/75 px-6 text-sm font-medium shadow-[0_10px_28px_rgba(60,84,96,.06)] backdrop-blur transition hover:bg-white sm:w-auto sm:rounded-full sm:px-7"
                >
                  Se hur processen fungerar
                </a>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-[#cad8df] pt-6 text-[12px] text-[#52646e] sm:mt-10 sm:grid-cols-3 sm:gap-4 sm:pt-7 sm:text-sm">
                {[
                  'En dedikerad kontakt',
                  'Sverige och Europa',
                  'Anpassat efter volym',
                ].map((item) => (
                  <span key={item} className="flex min-w-0 items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-[#e0e7ea] bg-white/95 shadow-[0_-18px_50px_rgba(32,33,36,.04)] backdrop-blur">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 lg:grid-cols-4">
          {[
            ['Företagsflottor', 'Planerad avyttring'],
            ['Leasingreturer', 'Effektiv remarketing'],
            ['Transportbilar', 'Bredare köparmarknad'],
            ['Enstaka objekt', 'Samma strukturerade process'],
          ].map(([title, text]) => (
            <div
              key={title}
              className="min-w-0 border-b border-r border-[#e0e7ea] px-4 py-6 even:border-r-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-8 lg:last:border-r-0 xl:px-10"
            >
              <strong className="block break-words text-[15px] leading-5 tracking-[-0.025em] sm:text-lg">{title}</strong>
              <span className="mt-1 block break-words text-xs leading-5 text-[#70808a] sm:text-sm">{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="relative bg-[linear-gradient(180deg,#f8f5ef_0%,#f2f0ea_100%)] py-16 sm:py-32">
        <div className="absolute right-[-100px] top-20 h-64 w-64 rounded-full bg-[#B4D9EF]/25 blur-3xl" />
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="relative grid min-w-0 gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-24">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#71818a]">
                Byggt för professionella säljare
              </p>
              <h2 className="mt-4 max-w-full text-[32px] leading-[1.08] tracking-[-0.045em] [overflow-wrap:anywhere] sm:mt-5 sm:text-5xl">
                Mer än en försäljning. Ett komplett avyttringsflöde.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#65737b] sm:mt-6 sm:text-lg sm:leading-8">
                När många fordon ska säljas behöver processen fungera för
                ekonomi, administration, förare och ledning samtidigt. Autorell
                samlar arbetet i ett tydligt flöde med löpande återkoppling.
              </p>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Handshake,
                  title: 'En kommersiell kontakt',
                  text: 'En ansvarig person samordnar portföljen och håller ihop dialogen.',
                },
                {
                  icon: CarFront,
                  title: 'Flexibel volym',
                  text: 'Från ett fåtal tjänstebilar till återkommande leasingreturer och hela flottor.',
                },
                {
                  icon: BadgeCheck,
                  title: 'Kvalificerade köpare',
                  text: 'Fordonen matchas mot relevanta professionella aktörer, inte en öppen kontaktlista.',
                },
                {
                  icon: Globe2,
                  title: 'Europeisk räckvidd',
                  text: 'Efterfrågan kan aktiveras över flera marknader när det skapar bättre förutsättningar.',
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="business-card min-w-0 rounded-[20px] border border-white/80 bg-white/85 p-6 shadow-[0_18px_50px_rgba(32,33,36,.06)] backdrop-blur sm:p-9">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e5f2f8]">
                    <Icon className="h-5 w-5 text-[#536b77]" />
                  </span>
                  <h3 className="mt-7 break-words text-xl tracking-[-0.03em]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#6a777d]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="relative overflow-hidden bg-[radial-gradient(circle_at_85%_15%,#344852_0%,#202124_42%,#18191a_100%)] py-16 text-white sm:py-32">
        <div className="business-orbit absolute -right-28 -top-28 h-72 w-72 rounded-full border-[42px] border-[#B4D9EF]/10" />
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B4D9EF]">
              Från fordonslista till genomförd affär
            </p>
            <h2 className="mt-4 max-w-full text-[32px] leading-[1.08] tracking-[-0.045em] [overflow-wrap:anywhere] sm:mt-5 sm:text-5xl">
              Sex steg. En sammanhållen process.
            </h2>
          </div>

          <div className="relative mt-10 grid gap-3 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
            {process.map(({ icon: Icon, title, text }, index) => (
              <article
                key={title}
                className="relative min-h-[250px] min-w-0 overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#B4D9EF]/35 hover:bg-white/[0.07] sm:min-h-[310px] sm:p-9"
              >
                <span className="text-xs tracking-[0.18em] text-white/40">
                  0{index + 1}
                </span>
                <Icon className="mt-9 h-6 w-6 text-[#B4D9EF] sm:mt-12" />
                <h3 className="mt-6 text-xl tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-white/60">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf7] py-16 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid min-w-0 gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-24">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#71818a]">
                Kontroll och transparens
              </p>
              <h2 className="mt-4 max-w-full text-[32px] leading-[1.08] tracking-[-0.045em] [overflow-wrap:anywhere] sm:mt-5 sm:text-5xl">
                Ni behåller beslutet. Vi driver processen.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#65737b] sm:mt-6 sm:text-lg sm:leading-8">
                Varje upplägg anpassas efter era interna krav. Ni får ett
                tydligt underlag inför beslut och väljer själva vilka
                erbjudanden som ska gå vidare.
              </p>
              <div className="mt-9 space-y-5">
                {[
                  'Tydlig status per fordon och försäljningsomgång',
                  'Separat redovisning av bud, avgifter och tilläggstjänster',
                  'Digital dokumentation och spårbar händelsehistorik',
                  'Samordning med era befintliga rutiner och kontaktpersoner',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-4">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#e7f2f7]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <p className="min-w-0 break-words leading-7 text-[#4f5d64]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="business-card relative min-w-0 overflow-hidden rounded-[24px] border border-white bg-[linear-gradient(145deg,#e8f3f8,#dcecf3)] p-6 shadow-[0_24px_70px_rgba(67,92,104,.12)] sm:rounded-[28px] sm:p-10">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[34px] border-white/60" />
              <div className="relative">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6c7d85]">
                  Exempel på upplägg
                </p>
                <p className="mt-5 break-words text-[27px] leading-tight tracking-[-0.04em] sm:text-3xl">
                  48 tjänstebilar.
                  <br />
                  Tre orter.
                  <br />
                  En ansvarig process.
                </p>
                <div className="mt-10 space-y-3">
                  {[
                    ['01', 'Gemensam fordonsimport'],
                    ['02', 'Planerade inspektionsfönster'],
                    ['03', 'Marknadsanpassade försäljningsgrupper'],
                    ['04', 'Samordnad transport och dokumentation'],
                  ].map(([number, label]) => (
                    <div
                      key={number}
                      className="flex items-center gap-4 border-t border-[#cbdde5] py-4"
                    >
                      <span className="text-xs text-[#71818a]">{number}</span>
                      <span className="min-w-0 break-words text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="foretagskontakt" className="relative overflow-hidden bg-[linear-gradient(135deg,#edf5f8_0%,#f6f2ea_100%)] py-16 sm:py-32">
        <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full border-[46px] border-white/45" />
        <div className="relative mx-auto grid min-w-0 max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:px-12">
          <div className="min-w-0 lg:py-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#71818a]">
              Företagskontakt
            </p>
            <h2 className="mt-4 max-w-full text-[32px] leading-[1.08] tracking-[-0.045em] [overflow-wrap:anywhere] sm:mt-5 sm:text-5xl">
              Börja med ett konfidentiellt samtal.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#65737b] sm:mt-6 sm:text-lg sm:leading-8">
              Beskriv volymen och er tidsplan. Vi återkommer med frågor och ett
              första förslag på hur portföljen kan hanteras.
            </p>
            <div className="mt-10 border-t border-[#d8d7d1] pt-7">
              <p className="text-sm text-[#707874]">Föredrar ni e-post?</p>
              <a
                href="mailto:info@autorell.com?subject=Företagsförsäljning"
                className="mt-2 inline-flex items-center gap-2 font-medium"
              >
                info@autorell.com
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-[22px] border border-white/90 shadow-[0_30px_80px_rgba(32,33,36,.1)] sm:rounded-[26px]">
            <BusinessFleetForm />
          </div>
        </div>
      </section>

      <section className="border-t border-[#e0ded8] bg-white py-12">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div>
            <p className="text-sm text-[#707b80]">Säljer ni en privat bil?</p>
            <p className="mt-1 text-xl tracking-[-0.025em]">
              Starta en kostnadsfri värdering på några minuter.
            </p>
          </div>
          <Link
            href="/salj-bil"
            className="inline-flex items-center gap-3 text-sm font-medium"
          >
            Värdera din bil
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
