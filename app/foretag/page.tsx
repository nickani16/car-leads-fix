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
    <main className="overflow-hidden bg-white text-[#202124]">
      <PublicHeader />

      <section className="relative isolate min-h-[760px] overflow-hidden bg-[#eef5f8]">
        <div className="absolute inset-y-0 right-0 hidden w-[48%] lg:block">
          <Image
            src="/autorell-home-hero.webp"
            alt="Professionell hantering av företagsfordon"
            fill
            priority
            className="object-cover object-[62%_center]"
            sizes="48vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#eef5f8] via-transparent to-transparent" />
        </div>
        <div className="absolute -left-48 -top-56 h-[560px] w-[560px] rounded-full border-[72px] border-white/55" />
        <div className="absolute bottom-[-180px] right-[34%] h-[380px] w-[380px] rounded-full border-[52px] border-[#B4D9EF]/50" />

        <div className="relative mx-auto flex min-h-[760px] max-w-[1440px] items-center px-5 py-20 sm:px-8 lg:px-12 xl:px-16">
          <div className="max-w-[760px] lg:max-w-[690px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cddde5] bg-white/75 px-4 py-2 text-xs font-medium text-[#465c68] backdrop-blur">
              <Building2 className="h-4 w-4" />
              Autorell för företag
            </div>
            <h1 className="mt-7 text-[48px] leading-[.98] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
              En strukturerad väg ut ur fordonsinnehavet.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#526b78] sm:text-xl">
              För företag, leasingaktörer och vagnparksägare som vill avyttra
              enstaka bilar eller hela flottor med större räckvidd, tydlig
              kontroll och en ansvarig partner genom hela affären.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#foretagskontakt"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] px-7 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#111]"
              >
                Diskutera er fordonsflotta
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#process"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#bfcfd7] bg-white/70 px-7 text-sm font-medium backdrop-blur transition hover:bg-white"
              >
                Se hur processen fungerar
              </a>
            </div>
            <div className="mt-10 grid gap-4 border-t border-[#cad8df] pt-7 text-sm text-[#52646e] sm:grid-cols-3">
              {[
                'En dedikerad kontakt',
                'Sverige och Europa',
                'Anpassat efter volym',
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e0e7ea] bg-white">
        <div className="mx-auto grid max-w-[1440px] sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Företagsflottor', 'Planerad avyttring'],
            ['Leasingreturer', 'Effektiv remarketing'],
            ['Transportbilar', 'Bredare köparmarknad'],
            ['Enstaka objekt', 'Samma strukturerade process'],
          ].map(([title, text]) => (
            <div
              key={title}
              className="border-b border-[#e0e7ea] px-6 py-8 sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0 xl:px-10"
            >
              <strong className="text-lg tracking-[-0.025em]">{title}</strong>
              <span className="mt-1 block text-sm text-[#70808a]">{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f8f6f1] py-20 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-24">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#71818a]">
                Byggt för professionella säljare
              </p>
              <h2 className="mt-5 text-[38px] leading-[1.06] tracking-[-0.045em] sm:text-5xl">
                Mer än en försäljning. Ett komplett avyttringsflöde.
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#65737b]">
                När många fordon ska säljas behöver processen fungera för
                ekonomi, administration, förare och ledning samtidigt. Autorell
                samlar arbetet i ett tydligt flöde med löpande återkoppling.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-[24px] border border-[#dde2e2] bg-[#dde2e2] sm:grid-cols-2">
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
                <div key={title} className="bg-white p-7 sm:p-9">
                  <Icon className="h-6 w-6 text-[#536b77]" />
                  <h3 className="mt-8 text-xl tracking-[-0.03em]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#6a777d]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="bg-[#202124] py-20 text-white sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B4D9EF]">
              Från fordonslista till genomförd affär
            </p>
            <h2 className="mt-5 text-[38px] leading-[1.06] tracking-[-0.045em] sm:text-5xl">
              Sex steg. En sammanhållen process.
            </h2>
          </div>

          <div className="mt-14 grid border-l border-t border-white/15 sm:grid-cols-2 lg:grid-cols-3">
            {process.map(({ icon: Icon, title, text }, index) => (
              <article
                key={title}
                className="relative min-h-[310px] border-b border-r border-white/15 p-7 sm:p-9"
              >
                <span className="text-xs tracking-[0.18em] text-white/40">
                  0{index + 1}
                </span>
                <Icon className="mt-12 h-6 w-6 text-[#B4D9EF]" />
                <h3 className="mt-6 text-xl tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-white/60">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-24">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#71818a]">
                Kontroll och transparens
              </p>
              <h2 className="mt-5 text-[38px] leading-[1.06] tracking-[-0.045em] sm:text-5xl">
                Ni behåller beslutet. Vi driver processen.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#65737b]">
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
                    <p className="leading-7 text-[#4f5d64]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] bg-[#eaf3f7] p-7 sm:p-10">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[34px] border-white/60" />
              <div className="relative">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6c7d85]">
                  Exempel på upplägg
                </p>
                <p className="mt-5 text-3xl leading-tight tracking-[-0.04em]">
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
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="foretagskontakt" className="bg-[#f3f2ee] py-20 sm:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:px-12">
          <div className="lg:py-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#71818a]">
              Företagskontakt
            </p>
            <h2 className="mt-5 text-[38px] leading-[1.06] tracking-[-0.045em] sm:text-5xl">
              Börja med ett konfidentiellt samtal.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#65737b]">
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

          <div className="overflow-hidden rounded-[26px] border border-[#deddd7] shadow-[0_30px_80px_rgba(32,33,36,.08)]">
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
