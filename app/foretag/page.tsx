import Link from 'next/link'
import { createPublicMetadata } from '@/lib/public-seo'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CarFront,
  Check,
  Database,
  FileCheck2,
  Globe2,
  Handshake,
  ScanSearch,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import BusinessFleetForm from '../components/BusinessFleetForm'
import BusinessDealerShowcase from '../components/BusinessDealerShowcase'
import PublicFooter from '../components/PublicFooter'
import PublicHeader from '../components/PublicHeader'

export const metadata = createPublicMetadata({
  title: 'Sälj företagsbilar i hela Europa | Autorell',
  description:
    'Autorell testar efterfrågan för företagsbilar hos verifierade köpare i hela EU och samordnar erbjudande, kontroll, betalning, hämtning och export.',
  path: '/foretag',
  keywords: [
    'sälja företagsbilar',
    'sälja bilar till Europa',
    'avyttra fordonsflotta',
    'sälja leasingbilar',
    'B2B bilförsäljning Europa',
  ],
  languagePaths: {
    sv: '/foretag',
    de: '/vorteile',
    en: '/dealer-benefits',
  },
})

const portfolioTypes = [
  ['Inbyten', 'Fordon utanför den egna lagerstrategin'],
  ['Leasingreturer', 'Planerad och återkommande avyttring'],
  ['Företagsflottor', 'Samlat flöde över flera orter'],
  ['Utvalda objekt', 'Enstaka fordon med exportpotential'],
]

const process = [
  {
    icon: Database,
    title: 'Dela fordonsunderlaget',
    text: 'Skicka en lista eller beskriv volym, fordonstyper, placering och tidsplan.',
  },
  {
    icon: ScanSearch,
    title: 'Vi kvalificerar portföljen',
    text: 'Vi identifierar vilka fordon som passar aktuell efterfrågan och vilket underlag som behövs.',
  },
  {
    icon: Globe2,
    title: 'Vi testar efterfrågan i EU',
    text: 'Utvalda fordon presenteras anonymt för relevanta, verifierade bilhandlare på flera europeiska marknader.',
  },
  {
    icon: Truck,
    title: 'Vi genomför affären',
    text: 'När marknaden fungerar lämnar Autorell ett eget erbjudande och samordnar kontroll, betalning, hämtning och export.',
  },
]

export default function BusinessPage() {
  return (
    <main className="w-full overflow-x-hidden bg-[#f7f5f0] text-[#202124]">
      <PublicHeader />

      <section className="relative isolate overflow-hidden bg-[linear-gradient(145deg,#f8f4ec_0%,#edf5f8_58%,#e4f0f5_100%)]">
        <div className="business-orbit absolute -left-36 -top-40 h-[440px] w-[440px] rounded-full border-[64px] border-white/55" />
        <div className="business-orbit-reverse absolute -bottom-48 right-[-90px] h-[430px] w-[430px] rounded-full border-[58px] border-[#B4D9EF]/35" />
        <div className="absolute left-[44%] top-[12%] h-64 w-64 rounded-full bg-white/65 blur-3xl" />

        <div className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-[72px] lg:px-12 lg:pb-28 lg:pt-20 xl:px-16">
          <div className="grid min-w-0 gap-12 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:gap-16">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c9dce5] bg-white/75 px-4 py-2 text-xs font-medium text-[#496878] shadow-[0_10px_28px_rgba(60,84,96,.06)] backdrop-blur">
                <Building2 className="h-4 w-4" />
                Europeisk försäljning för företag
              </span>
              <h1 className="mt-6 max-w-[760px] text-[42px] leading-[.99] tracking-[-0.055em] sm:text-6xl lg:text-[72px]">
                Sälj era fordon till professionella köpare i hela EU.
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-8 text-[#526b78] sm:text-xl">
                Autorell öppnar ert lager, era leasingreturer och
                företagsfordon mot verifierade europeiska köpare. Vi driver
                stora och återkommande volymer från fordonsunderlag till
                kontroll, betalning, hämtning och export.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/salj-lagerbil"
                  className="group inline-flex min-h-14 items-center justify-between gap-4 rounded-[16px] bg-[#242424] pl-6 pr-3 text-sm font-medium text-white shadow-[0_16px_35px_rgba(32,33,36,.2)] transition hover:-translate-y-0.5 hover:bg-[#111] sm:justify-center sm:rounded-full sm:px-7"
                >
                  Skicka in ett fordon
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </a>
                <a
                  href="#process"
                  className="inline-flex min-h-14 items-center justify-center rounded-[16px] border border-[#bfcfd7] bg-white/75 px-7 text-sm font-medium shadow-[0_10px_28px_rgba(60,84,96,.06)] backdrop-blur transition hover:bg-white sm:rounded-full"
                >
                  Se hur upplägget fungerar
                </a>
              </div>

              <div className="mt-8 grid gap-3 border-t border-[#cad8df] pt-6 text-sm text-[#52646e] sm:grid-cols-3">
                {[
                  'Börja med utvalda fordon',
                  'Köpare i hela EU',
                  'Kapacitet för stora volymer',
                ].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#4f8298]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <BusinessDealerShowcase />
          </div>
        </div>
      </section>

      <section className="border-y border-[#e0e7ea] bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 lg:grid-cols-4">
          {portfolioTypes.map(([title, text]) => (
            <div
              key={title}
              className="min-w-0 border-b border-r border-[#e0e7ea] px-5 py-7 even:border-r-0 lg:border-b-0 lg:border-r lg:px-8 lg:py-9 lg:last:border-r-0"
            >
              <strong className="block text-[16px] tracking-[-0.025em] sm:text-lg">
                {title}
              </strong>
              <span className="mt-2 block text-xs leading-5 text-[#70808a] sm:text-sm">
                {text}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#fbfaf7] py-16 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-start lg:gap-24">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#71818a]">
                Från lager till europeisk köpare
              </p>
              <h2 className="mt-5 text-[36px] leading-[1.05] tracking-[-0.05em] sm:text-5xl">
                En komplett försäljningskanal för företagets fordon.
              </h2>
              <p className="mt-6 text-base leading-8 text-[#65737b] sm:text-lg">
                Ni väljer vilka fordon som ska säljas. Autorell kvalificerar
                underlaget, aktiverar relevanta köpare i EU och samordnar
                genomförandet när vårt eget inköpserbjudande accepteras.
              </p>
              <a
                href="#foretagskontakt"
                className="mt-8 inline-flex items-center gap-3 text-sm font-medium"
              >
                Diskutera er första portfölj
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: CarFront,
                  title: 'Fler köpare per fordon',
                  text: 'Nå professionella bilhandlare utanför den lokala marknaden utan att bygga en egen europeisk försäljningsorganisation.',
                },
                {
                  icon: FileCheck2,
                  title: 'Bättre underlag, tydligare bud',
                  text: 'Vi strukturerar fordonsdata, skick och dokumentation så att köpare kan bedöma och buda effektivt.',
                },
                {
                  icon: BadgeCheck,
                  title: 'Verifierade EU-köpare',
                  text: 'Fordon presenteras för professionella motparter i ett kontrollerat B2B-flöde med tydliga villkor.',
                },
                {
                  icon: Handshake,
                  title: 'Vi tar affären i mål',
                  text: 'Autorell samordnar kontroll, betalning, hämtning, exportdokument och överlämning efter accepterat inköpserbjudande.',
                },
              ].map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="business-card rounded-[22px] border border-[#e0e6e8] bg-white p-6 shadow-[0_18px_50px_rgba(32,33,36,.05)] sm:p-8"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e6f2f7] text-[#4f8298]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-7 text-xl tracking-[-0.035em]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#6a777d]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="process"
        className="scroll-mt-[124px] overflow-hidden bg-[#eef5f7] py-16 sm:py-28"
      >
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#5f7d8c]">
                Ett sammanhållet B2B-flöde
              </p>
              <h2 className="mt-5 text-[36px] leading-[1.05] tracking-[-0.05em] sm:text-5xl">
                Från fordonslista till genomförd EU-affär.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[#65737b] sm:text-base">
              Börja med en utvald grupp fordon eller ett återkommande flöde.
              Ni väljer fordonen och beslutar om Autorells erbjudande. Vi
              samordnar resten.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {process.map(({ icon: Icon, title, text }, index) => (
              <article
                key={title}
                className="business-card relative min-h-[290px] overflow-hidden rounded-[22px] border border-white bg-white/85 p-7 shadow-[0_18px_50px_rgba(55,85,99,.06)]"
              >
                <span className="text-[11px] font-medium tracking-[0.18em] text-[#8aa2ad]">
                  0{index + 1}
                </span>
                <Icon className="mt-10 h-6 w-6 text-[#4f8298]" />
                <h3 className="mt-6 text-xl tracking-[-0.035em]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#6a777d]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#202124] py-16 text-white sm:py-24">
        <div className="trust-ring absolute -right-24 -top-28 h-80 w-80 rounded-full border-[52px] border-[#b4d9ef]/10" />
        <div className="business-orbit-reverse absolute -bottom-32 -left-24 h-72 w-72 rounded-full border-[46px] border-white/[.045]" />
        <div className="relative mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_.9fr] lg:items-center lg:px-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B4D9EF]">
              Autorell driver genomförandet
            </p>
            <h2 className="mt-5 max-w-2xl text-[36px] leading-[1.06] tracking-[-0.05em] sm:text-5xl">
              Ni säljer fordonen. Vi tar affären över gränsen.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
              Efter accepterat inköpserbjudande kontrollerar vi fordonet mot
              underlaget och samordnar betalning, hämtning, dokumentation och
              export till den europeiska köparen.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              'Ni väljer fordon och beslutar om Autorells erbjudande',
              'Autorell kontrollerar fordonet mot deklarationen',
              'Vi samordnar betalning, avtal och dokument',
              'Vi koordinerar hämtning och export till köparen',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-[16px] border border-white/10 bg-white/[0.045] px-5 py-4"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#B4D9EF] text-[#202124]">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="foretagskontakt"
        className="scroll-mt-[124px] overflow-hidden bg-[linear-gradient(135deg,#edf5f8_0%,#f6f2ea_100%)] py-16 sm:py-28"
      >
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:px-12">
          <div className="lg:py-8">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#4f8298] shadow-[0_12px_30px_rgba(50,78,91,.08)]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-[#71818a]">
              Nästa steg
            </p>
            <h2 className="mt-5 text-[36px] leading-[1.06] tracking-[-0.05em] sm:text-5xl">
              Låt oss sälja er första fordonsportfölj i Europa.
            </h2>
            <p className="mt-6 text-base leading-8 text-[#65737b] sm:text-lg">
              Beskriv volym, fordonstyper och tidsplan. Vi återkommer med ett
              konkret upplägg för kvalificering, europeiskt marknadstest och
              genomförande.
            </p>
            <div className="mt-9 rounded-[18px] border border-white/80 bg-white/55 p-5">
              <p className="text-sm font-medium">Föredrar ni e-post?</p>
              <a
                href="mailto:info@autorell.com?subject=Företagsförsäljning"
                className="mt-2 inline-flex items-center gap-2 text-sm text-[#4f6f7e]"
              >
                info@autorell.com
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white/90 shadow-[0_30px_80px_rgba(32,33,36,.1)]">
            <BusinessFleetForm />
          </div>
        </div>
      </section>

      <section className="border-t border-[#e0ded8] bg-white py-11">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-5 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div>
            <p className="text-sm text-[#707b80]">Gäller det en privat bil?</p>
            <p className="mt-1 text-xl tracking-[-0.025em]">
              Registrera bilen kostnadsfritt och se om den passar våra kriterier.
            </p>
          </div>
          <Link
            href="/salj-bil"
            className="inline-flex items-center gap-3 text-sm font-medium"
          >
            Sälj din bil
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
