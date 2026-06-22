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
    'Skapa företagskonto på Autorell, publicera fordonsannonser och nå privatpersoner och företag på marknader i hela EU.',
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
  ['Företagsprofil', 'Logotyp, kontaktuppgifter och verifierad säljaridentitet'],
  ['Lagerannonser', 'Publicera fordon och maskiner i alla kategorier'],
  ['EU-räckvidd', 'Nå privatpersoner och företag på flera marknader'],
  ['Meddelanden', 'Hantera intresse och köparkontakter från samma konto'],
]

const process = [
  {
    icon: Database,
    title: 'Skapa företagskonto',
    text: 'Lägg in verifierbara företags-, adress- och kontaktuppgifter.',
  },
  {
    icon: ScanSearch,
    title: 'Bygg en tydlig annons',
    text: 'Lägg till fordonsdata, skick, kända fel, pris, plats och bilder.',
  },
  {
    icon: Globe2,
    title: 'Välj annonspaket',
    text: 'Starta gratis i sju dagar eller välj längre synlighet och Premium.',
  },
  {
    icon: Truck,
    title: 'Möt köpare i Europa',
    text: 'Ta emot sparningar och meddelanden och hantera försäljningen från kontot.',
  },
]

export default function BusinessPage() {
  return (
    <main className="w-full overflow-x-hidden bg-[#f7f8fb] text-[#101828]">
      <PublicHeader />

      <section className="relative isolate overflow-hidden bg-white">
        <div className="business-orbit absolute -left-36 -top-40 h-[440px] w-[440px] rounded-full border-[64px] border-white/55" />
        <div className="business-orbit-reverse absolute -bottom-48 right-[-90px] h-[430px] w-[430px] rounded-full border-[58px] border-[#B4D9EF]/35" />
        <div className="absolute left-[44%] top-[12%] h-64 w-64 rounded-full bg-white/65 blur-3xl" />

        <div className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-[72px] lg:px-12 lg:pb-28 lg:pt-20 xl:px-16">
          <div className="grid min-w-0 gap-12 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:gap-16">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-[13px] border border-[#c9d9ff] bg-[#edf3ff] px-4 py-2 text-xs font-bold text-[#0866ff]">
                <Building2 className="h-4 w-4" />
                Fordonsmarknadsplats för företag
              </span>
              <h1 className="mt-6 max-w-[760px] text-[42px] leading-[.99] tracking-[-0.055em] sm:text-6xl lg:text-[72px]">
                Sälj företagets fordon till köpare i hela Europa.
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-8 text-[#526b78] sm:text-xl">
                Skapa en verifierad företagsprofil, publicera annonser i alla
                fordonskategorier och hantera intresse från privatpersoner och
                företag på flera europeiska marknader.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/registrera?account=business"
                  className="group inline-flex min-h-14 items-center justify-between gap-4 rounded-[15px] bg-[#0866ff] px-7 text-sm font-bold text-white shadow-[0_16px_35px_rgba(8,102,255,.2)] transition hover:-translate-y-0.5 sm:justify-center"
                >
                  Skapa företagskonto
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/salj-fordon#priser"
                  className="inline-flex min-h-14 items-center justify-center rounded-[15px] border border-[#cbd5e1] bg-white px-7 text-sm font-bold transition hover:border-[#0866ff]"
                >
                  Se annonspriser
                </Link>
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
                Ni väljer vilka fordon som ska säljas, skapar strukturerade
                annonser och väljer annonspaket. Köpare kan spara objekten och
                kontakta er direkt genom marknadsplatsen.
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
                  text: 'Nå privatpersoner och företag utanför den lokala marknaden med samma tydliga annons.',
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
                  text: 'Hantera annonser, intresse och direkta meddelanden från ett gemensamt företagskonto.',
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
              Börja med ett fordon eller publicera ett återkommande lager.
              Varje objekt får rätt kategori, data, plats, bilder och vald
              synlighetstid.
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

      <section className="relative overflow-hidden border-y border-[#dfe4ec] bg-[#edf3ff] py-16 text-[#101828] sm:py-24">
        <div className="trust-ring absolute -right-24 -top-28 h-80 w-80 rounded-full border-[52px] border-[#b4d9ef]/10" />
        <div className="business-orbit-reverse absolute -bottom-32 -left-24 h-72 w-72 rounded-full border-[46px] border-white/[.045]" />
        <div className="relative mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_.9fr] lg:items-center lg:px-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#0866ff]">
              Byggt för professionell försäljning
            </p>
            <h2 className="mt-5 max-w-2xl text-[36px] leading-[1.06] tracking-[-0.05em] sm:text-5xl">
              Ett företagskonto för lager, annonser och köparkontakter.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#667085] sm:text-lg">
              Företag får en tydlig offentlig profil och kan publicera varje
              objekt med rätt kategori, data, bilder och annonspaket.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              'Privat- och företagsköpare möts på samma marknadsplats',
              'Verifierbara säljar- och kontaktuppgifter',
              'Fasta annonspaket per fordonskategori',
              'Sparade annonser och direkta meddelanden',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-[16px] border border-[#d7e1f2] bg-white px-5 py-4"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#B4D9EF] text-[#202124]">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm text-[#475467]">{item}</span>
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
              Beskriv volym, fordonstyper och behov. Vi hjälper er att välja
              kontoupplägg, annonspaket och ett tydligt publiceringsflöde.
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
