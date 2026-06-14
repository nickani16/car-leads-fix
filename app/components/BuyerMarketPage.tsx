import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BatteryCharging,
  Building2,
  CalendarRange,
  Check,
  ChevronRight,
  CircleDollarSign,
  CircleDot,
  FileCheck2,
  Gavel,
  Gauge,
  Globe2,
  Handshake,
  ScanLine,
  Search,
  Sparkles,
  Truck,
} from 'lucide-react'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'

type BuyerLocale = 'de' | 'en'

const content = {
  de: {
    eyebrow: 'B2B-Fahrzeugmarkt für Autohändler',
    titleTop: 'Sicher einkaufen.',
    titleBottom: 'Europaweit handeln.',
    intro:
      'Ausgewählte Fahrzeuge aus Schweden, professionelle Gebote und eine durch Autorell koordinierte Transaktion. Wir bestätigen den Zahlungseingang, prüfen das Fahrzeug vor Ort und organisieren Export und Übergabe.',
    primary: 'Händlerzugang beantragen',
    secondary: 'Plattform entdecken',
    platformLabel: 'Autorell Market Intelligence',
    platformTitle: 'Europäischer Fahrzeugmarkt',
    live: 'Live-Marktplatz',
    sourceLabel: 'Fahrzeugauswahl',
    sourceValue: 'Ab Baujahr 2018',
    dataLabel: 'Laufleistung',
    dataValue: 'Unter 100.000 km',
    dealerLabel: 'Zugang',
    dealerValue: 'Geprüfte Händler',
    bidLabel: 'Schwerpunkt',
    bidValue: 'Modern & elektrifiziert',
    marketEyebrow: 'Qualität vor Volumen',
    marketTitle: 'Ein klarer Standard für jedes Fahrzeug.',
    marketText:
      'Premium bedeutet für uns nicht nur Sportwagen. Es bedeutet jüngere, relevante Fahrzeuge mit nachvollziehbaren Daten, marktgerechter Laufleistung und guter Wiederverkaufsperspektive.',
    pillars: [
      ['Baujahr 2018 oder neuer', 'Ein fokussiertes Angebot moderner Fahrzeuge mit relevanter Nachfrage im europäischen Handel.'],
      ['Unter 100.000 Kilometer', 'Laufleistung als klarer Qualitätsfilter für Bestand, Finanzierung und Wiederverkauf.'],
      ['Elektrifiziert & zukunftsfähig', 'Wachsender Fokus auf Elektro-, Hybrid- und moderne effiziente Antriebe.'],
      ['Strukturiert dokumentiert', 'Vergleichbare Angaben zu Zustand, Historie, Dokumenten und bekannten Abweichungen.'],
    ],
    networkEyebrow: 'Autorell Dealer Network',
    networkTitle: 'Von lokalem Bestand zu europäischer Nachfrage.',
    networkText:
      'Autorell startet mit qualifiziertem Fahrzeugangebot und baut schrittweise weitere europäische Märkte auf. Deutschland ist dabei ein zentraler Handels- und Wachstumsmarkt.',
    markets: [
      ['Deutschland', 'Händlernetzwerk & Marktausbau', 'active'],
      ['Schweden', 'Qualifiziertes Fahrzeugangebot', 'active'],
      ['Europa', 'Weitere Märkte im Aufbau', 'next'],
    ],
    flowEyebrow: 'Die Autorell Transaktion',
    flowTitle: 'Vom Gebot bis zur Übergabe. Kontrolliert durch Autorell.',
    steps: [
      ['Zugang erhalten', 'Unternehmen verifizieren und professionelles Händlerkonto aktivieren.'],
      ['Fahrzeug bewerten', 'Deklaration, Bilder, Historie und bekannte Abweichungen vor dem Gebot prüfen.'],
      ['Gebot & Vertrag', 'Nach Annahme werden Preis, Bedingungen und Parteien vertraglich festgehalten.'],
      ['Zahlung an Autorell', 'Der Käufer überweist den Gesamtbetrag an Autorell vor Abholung und Abschluss.'],
      ['Vor-Ort-Prüfung', 'Autorell gleicht Identität, Laufleistung, Funktion und Zustand mit der Deklaration ab.'],
      ['Freigabe & Export', 'Bei Übereinstimmung schließen wir den Kauf ab und koordinieren Dokumente, Abholung und Export.'],
    ],
    assuranceEyebrow: 'Autorell Verified Transaction',
    assuranceTitle: 'Ihr Geld wird nicht blind in ein unbekanntes Fahrzeug geschickt.',
    assuranceText:
      'Der Käufer überweist vor der Abholung an Autorell. Nach bestätigtem Geldeingang prüft Autorell das Fahrzeug in Schweden gegen die Verkaufsdeklaration. Bei einer wesentlichen Abweichung wird die Transaktion pausiert: Die Parteien können schriftlich einen neuen Preis vereinbaren oder Autorell kann den Vorgang abbrechen und die erhaltenen Käufergelder zurückzahlen.',
    assuranceItems: [
      ['Zahlung vor Ausführung', 'Autorell bestätigt den Geldeingang, bevor Fahrzeug und Dokumente freigegeben werden.'],
      ['Prüfung gegen Deklaration', 'VIN, Laufleistung, Warnleuchten, Fahrbereitschaft, Hauptfunktionen, sichtbarer Zustand und dokumentierte Mängel werden abgeglichen.'],
      ['Klare Abweichungsregel', 'Keine stillen Preisänderungen: Fortsetzung nur nach dokumentierter Zustimmung oder Abbruch nach Vertragsregeln.'],
      ['Export aus einer Hand', 'Autorell koordiniert schwedische Abmeldung, Exportdokumente, Abholung und vereinbarte Logistik.'],
    ],
    trustEyebrow: 'Warum Händler Autorell wählen',
    trustTitle: 'Ein besserer Einkaufskanal für modernen Bestand.',
    trustText:
      'Autorell wird als Handelsinfrastruktur entwickelt: datenorientiert, grenzüberschreitend und auf professionelle Entscheidungen ausgerichtet.',
    trustItems: [
      'Kuratiertes Angebot statt unübersichtlicher Fahrzeuganzeigen',
      'Klare Auswahlkriterien: 2018+, unter 100.000 km und guter Zustand',
      'Vergleichbare Daten für schnellere Einkaufsentscheidungen',
      'Käuferzahlung vor Abholung und kontrollierter Freigabe',
      'Autorell Verified Inspection vor dem endgültigen Abschluss',
      'Koordinierte Verträge, Exportdokumente, Abholung und Transport',
      'Eine Plattform, die mit neuen europäischen Märkten wächst',
    ],
    ctaEyebrow: 'Frühen Zugang sichern',
    cta: 'Ihr Zugang zum europäischen Fahrzeugmarkt.',
    ctaText:
      'Werden Sie Teil des Autorell Dealer Network und erhalten Sie Zugang zu neuen Fahrzeugangeboten, digitalen Auktionen und dem Ausbau unserer europäischen Marktplattform.',
  },
  en: {
    eyebrow: 'Swedish vehicle sourcing for European dealers',
    titleTop: 'Source with confidence.',
    titleBottom: 'Trade across Europe.',
    intro:
      'Selected Swedish vehicles, professional bidding and a transaction coordinated by Autorell. We confirm receipt of buyer funds, inspect the vehicle in Sweden and manage the agreed export and handover.',
    primary: 'Apply for dealer access',
    secondary: 'Explore the platform',
    platformLabel: 'Autorell Market Intelligence',
    platformTitle: 'Swedish supply. European reach.',
    live: 'Marketplace live',
    sourceLabel: 'Vehicle selection',
    sourceValue: 'Model year 2018+',
    dataLabel: 'Mileage',
    dataValue: 'Below 100,000 km',
    dealerLabel: 'Access',
    dealerValue: 'Verified dealers',
    bidLabel: 'Focus',
    bidValue: 'Modern & electrified',
    marketEyebrow: 'Quality before volume',
    marketTitle: 'A clear standard behind every vehicle.',
    marketText:
      'Premium does not only mean sports cars. To us, it means newer, relevant vehicles with transparent information, sensible mileage and strong resale potential.',
    pillars: [
      ['Model year 2018 or newer', 'A focused supply of modern vehicles with relevant demand across European markets.'],
      ['Below 100,000 kilometres', 'Mileage used as a clear quality filter for inventory, financing and resale.'],
      ['Electrified and future-ready', 'A growing focus on electric, hybrid and modern efficient powertrains.'],
      ['Structured documentation', 'Comparable information on condition, history, documents and known discrepancies.'],
    ],
    networkEyebrow: 'Autorell Dealer Network',
    networkTitle: 'Swedish vehicles. European dealer demand.',
    networkText:
      'Sweden is Autorell’s first supply market. The platform is designed to expand into a broader European trading network as vehicle volume and dealer demand grow.',
    markets: [
      ['Sweden', 'Qualified vehicle supply', 'active'],
      ['Germany', 'Dealer network & market growth', 'active'],
      ['Europe', 'More markets to follow', 'next'],
    ],
    flowEyebrow: 'The Autorell transaction',
    flowTitle: 'From bid to handover. Controlled by Autorell.',
    steps: [
      ['Get approved', 'Verify your business and activate professional dealer access.'],
      ['Review the vehicle', 'Assess the declaration, images, history and known discrepancies before bidding.'],
      ['Bid and contract', 'After acceptance, price, conditions and counterparties are fixed in the transaction documents.'],
      ['Fund the transaction', 'The buyer transfers the confirmed total to Autorell before collection and completion.'],
      ['On-site inspection', 'Autorell checks identity, mileage, operation and condition against the seller declaration.'],
      ['Release and export', 'When verified, we complete the purchase and coordinate documents, collection and export.'],
    ],
    assuranceEyebrow: 'Autorell Verified Transaction',
    assuranceTitle: 'Your funds are not sent blindly against an unseen vehicle.',
    assuranceText:
      'The buyer transfers funds to Autorell before collection. After cleared funds, Autorell inspects the vehicle in Sweden against the seller declaration. If a material discrepancy is found, the transaction is paused: the parties may agree a revised price in writing, or Autorell may cancel and return the buyer funds received.',
    assuranceItems: [
      ['Funded before execution', 'Autorell confirms cleared funds before the vehicle or transaction documents are released.'],
      ['Checked against the declaration', 'VIN, mileage, warning lights, drivability, principal functions, visible condition and disclosed faults are compared.'],
      ['A clear discrepancy rule', 'No silent price changes: the deal proceeds only with documented agreement or is cancelled under the contract.'],
      ['Export coordinated by Autorell', 'We coordinate Swedish deregistration, export documentation, collection and agreed logistics.'],
    ],
    trustEyebrow: 'Why dealers choose Autorell',
    trustTitle: 'A better sourcing channel for modern inventory.',
    trustText:
      'Autorell is being built as trading infrastructure: data-led, cross-border and designed around professional purchasing decisions.',
    trustItems: [
      'Curated supply instead of crowded vehicle classifieds',
      'Clear criteria: 2018+, below 100,000 km and good condition',
      'Comparable data for faster purchasing decisions',
      'Buyer funding before collection and controlled release',
      'Autorell Verified Inspection before final completion',
      'Coordinated contracts, export documents, collection and transport',
      'A platform designed to expand across European markets',
    ],
    ctaEyebrow: 'Secure early access',
    cta: 'Build your next sourcing channel with Autorell.',
    ctaText:
      'Join the Autorell Dealer Network for access to selected Swedish vehicles, focused online auctions and a platform built for European automotive trade.',
  },
} as const

const pillarIcons = [CalendarRange, Gauge, BatteryCharging, FileCheck2]
const stepIcons = [
  Building2,
  Search,
  Gavel,
  CircleDollarSign,
  ScanLine,
  Truck,
]

export default function BuyerMarketPage({ locale }: { locale: BuyerLocale }) {
  const t = content[locale]
  const platformHref = locale === 'de' ? '/vorteile' : '/dealer-benefits'

  return (
    <main className="overflow-hidden bg-[#f7f6f2] text-[#202124]">
      <PublicHeader locale={locale} />

      <section className="relative isolate overflow-hidden border-b border-[#d9d8d2]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_42%,rgba(180,217,239,.54),transparent_31%),linear-gradient(135deg,#fbfaf6_0%,#f2f0e9_57%,#e9f2f5_100%)]" />
        <div className="absolute -right-52 -top-60 h-[760px] w-[760px] rounded-full border-[110px] border-white/45" />
        <div className="absolute -bottom-56 left-[38%] h-[430px] w-[430px] rounded-full bg-[#b4d9ef]/25 blur-3xl" />

        <div className="relative mx-auto grid min-h-[760px] max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.03fr_.97fr] lg:px-12 lg:py-24 xl:px-16">
          <div className="relative z-10 min-w-0 max-w-[760px]">
            <span className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-[#cbd7da] bg-white/72 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#496674] shadow-[0_10px_30px_rgba(32,33,36,.05)] backdrop-blur sm:text-[11px]">
              <Sparkles className="h-4 w-4 shrink-0 text-[#4b8198]" />
              {t.eyebrow}
            </span>
            <h1 className="mt-8 text-[48px] leading-[.92] tracking-[-0.065em] sm:text-7xl lg:text-[82px] xl:text-[92px]">
              {t.titleTop}
              <span className="mt-1 block text-[#4f7181]">{t.titleBottom}</span>
            </h1>
            <p className="mt-7 max-w-[670px] text-[17px] leading-8 text-[#536a75] sm:text-xl sm:leading-9">
              {t.intro}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dealer-apply"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] pl-7 pr-3 text-sm font-medium text-white shadow-[0_18px_40px_rgba(32,33,36,.2)] transition hover:-translate-y-0.5 hover:bg-[#111]"
              >
                {t.primary}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#b4d9ef] text-[#242424] transition group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href={platformHref}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#c7c8c3] bg-white/70 px-7 text-sm font-medium backdrop-blur transition hover:bg-white"
              >
                {t.secondary}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <HeroVehicleVisual locale={locale} content={t} />
        </div>

        <div className="relative mx-auto grid max-w-[1440px] grid-cols-2 border-t border-[#d8dddc] bg-white/48 px-5 backdrop-blur sm:px-8 lg:grid-cols-4 lg:px-12 xl:px-16">
          {[
            [t.sourceLabel, t.sourceValue],
            [t.dataLabel, t.dataValue],
            [t.dealerLabel, t.dealerValue],
            [t.bidLabel, t.bidValue],
          ].map(([label, value], index) => (
            <div
              key={label}
              className={`py-6 sm:py-8 ${index % 2 ? 'border-l border-[#d8dddc] pl-5 sm:pl-8' : ''} ${index > 1 ? 'border-t border-[#d8dddc] lg:border-t-0' : ''} ${index === 2 ? 'lg:border-l lg:pl-8' : ''}`}
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#879398] sm:text-[10px]">
                {label}
              </p>
              <p className="mt-2 text-sm font-medium tracking-[-0.02em] sm:text-lg">{value}</p>
            </div>
          ))}
        </div>

      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66808c]">
                {t.marketEyebrow}
              </p>
              <h2 className="mt-5 text-[40px] leading-[1.01] tracking-[-0.055em] sm:text-6xl">
                {t.marketTitle}
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#66767c]">{t.marketText}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {t.pillars.map(([title, text], index) => {
                const Icon = pillarIcons[index]
                return (
                  <article
                    key={title}
                    className={`buyer-quality-card group relative overflow-hidden rounded-[26px] border p-7 transition duration-300 hover:-translate-y-1 sm:p-8 ${
                      index === 0
                        ? 'border-[#b9d7e6] bg-[#dfeff7]'
                        : 'border-[#deddd7] bg-white shadow-[0_18px_55px_rgba(32,33,36,.045)]'
                    }`}
                  >
                    <span className="absolute -right-12 -top-12 h-32 w-32 rounded-full border-[20px] border-[#b4d9ef]/15 transition duration-500 group-hover:scale-110" />
                    <div className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#345d70] shadow-[0_8px_25px_rgba(32,33,36,.07)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-[10px] tracking-[0.18em] text-[#9aa4a8]">0{index + 1}</span>
                    </div>
                    <h3 className="mt-12 text-2xl tracking-[-0.04em]">{title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#65747a]">{text}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="dealer-network" className="scroll-mt-28 px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12">
        <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[32px] bg-[#202427] text-white shadow-[0_35px_90px_rgba(32,36,39,.16)]">
          <div className="absolute -right-40 -top-52 h-[560px] w-[560px] rounded-full border-[80px] border-[#b4d9ef]/10" />
          <div className="relative grid gap-12 p-7 sm:p-12 lg:grid-cols-[.8fr_1.2fr] lg:p-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">
                {t.networkEyebrow}
              </p>
              <h2 className="mt-5 text-[38px] leading-[1.02] tracking-[-0.055em] sm:text-5xl">
                {t.networkTitle}
              </h2>
              <p className="mt-6 max-w-xl leading-8 text-white/58">{t.networkText}</p>
            </div>

            <div className="relative hidden min-h-[390px] items-center justify-center lg:flex">
              <div className="buyer-network-ring absolute h-[330px] w-[330px] rounded-full border border-white/10" />
              <div className="buyer-network-ring buyer-network-ring-delayed absolute h-[220px] w-[220px] rounded-full border border-[#b4d9ef]/20" />
              <div className="buyer-network-core absolute h-[110px] w-[110px] rounded-full bg-[#b4d9ef] shadow-[0_0_80px_rgba(180,217,239,.25)]" />
              <div className="relative z-10 text-center text-[#202124]">
                <Globe2 className="mx-auto h-7 w-7" />
                <p className="mt-2 text-sm font-semibold">Autorell</p>
              </div>
              {t.markets.map(([market, text, state], index) => {
                const positions = [
                  'left-0 top-7 sm:left-[5%]',
                  'right-0 top-[42%] sm:right-[2%]',
                  'bottom-4 left-[4%] sm:left-[14%]',
                ]
                return (
                  <div
                    key={market}
                    className={`buyer-network-node buyer-network-node-${index + 1} absolute ${positions[index]} w-[185px] rounded-[18px] border border-white/10 bg-white/[.075] p-4 backdrop-blur-md sm:w-[215px]`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${state === 'active' ? 'bg-[#8ed1a8]' : 'bg-[#b4d9ef]'}`} />
                      <strong className="text-sm font-medium">{market}</strong>
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-white/48">{text}</p>
                  </div>
                )
              })}
            </div>

            <div className="lg:hidden">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-[#b4d9ef] text-center text-[#202124] shadow-[0_0_70px_rgba(180,217,239,.2)]">
                <div>
                  <Globe2 className="mx-auto h-6 w-6" />
                  <p className="mt-1 text-sm font-semibold">Autorell</p>
                </div>
              </div>
              <div className="relative mx-auto -mt-1 h-8 w-px bg-white/15" />
              <div className="grid gap-3 sm:grid-cols-3">
                {t.markets.map(([market, text, state]) => (
                  <div
                    key={market}
                    className="min-w-0 rounded-[18px] border border-white/10 bg-white/[.075] p-5 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          state === 'active' ? 'bg-[#8ed1a8]' : 'bg-[#b4d9ef]'
                        }`}
                      />
                      <strong className="text-base font-medium">{market}</strong>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-white/48">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef4f5] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto grid max-w-[1320px] overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_30px_90px_rgba(32,33,36,.08)] lg:grid-cols-[.92fr_1.08fr]">
          <div className="relative overflow-hidden bg-[#dceef7] p-7 sm:p-12 lg:p-16">
            <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full border-[48px] border-white/35" />
            <div className="relative">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#202427] text-white shadow-[0_16px_35px_rgba(32,36,39,.18)]">
                <Handshake className="h-6 w-6" />
              </span>
              <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#527485]">
                {t.assuranceEyebrow}
              </p>
              <h2 className="mt-5 text-[38px] leading-[1.02] tracking-[-0.055em] sm:text-5xl">
                {t.assuranceTitle}
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-[#526d78] sm:text-base sm:leading-8">
                {t.assuranceText}
              </p>
            </div>
          </div>

          <div className="grid gap-px bg-[#e1e3df] sm:grid-cols-2">
            {t.assuranceItems.map(([title, text], index) => {
              const Icon = [CircleDollarSign, ScanLine, FileCheck2, Truck][index]
              return (
                <article
                  key={title}
                  className="group relative min-h-[260px] overflow-hidden bg-[#fbfaf7] p-7 transition duration-300 hover:bg-white sm:p-9"
                >
                  <span className="absolute right-6 top-6 text-[10px] tracking-[0.18em] text-[#a0a7a9]">
                    0{index + 1}
                  </span>
                  <Icon className="h-6 w-6 text-[#4e7f94]" />
                  <div className="absolute bottom-8 left-7 right-7 sm:left-9 sm:right-9">
                    <h3 className="text-xl tracking-[-0.035em]">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#68767b]">{text}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66808c]">
                {t.flowEyebrow}
              </p>
              <h2 className="mt-5 max-w-3xl text-[40px] leading-[1.02] tracking-[-0.055em] sm:text-6xl">
                {t.flowTitle}
              </h2>
            </div>
            <Link href={locale === 'de' ? '/so-funktionierts' : '/how-it-works'} className="inline-flex items-center gap-2 text-sm font-medium">
              {locale === 'de' ? 'Gesamten Ablauf ansehen' : 'View the complete process'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-[#dcddd9] bg-[#dcddd9] md:grid-cols-2 lg:grid-cols-3">
            {t.steps.map(([title, text], index) => {
              const Icon = stepIcons[index]
              return (
                <article key={title} className="group relative min-h-[310px] overflow-hidden bg-[#f8f7f3] p-7 transition duration-300 hover:bg-white sm:p-8">
                  <span className="absolute left-0 top-0 h-1 w-0 bg-[#8fc5df] transition-all duration-500 group-hover:w-full" />
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-[#527d90]" />
                    <span className="text-[10px] tracking-[0.18em] text-[#9ba3a6]">0{index + 1}</span>
                  </div>
                  <div className="absolute bottom-8 left-7 right-7 sm:left-8 sm:right-8">
                    <h3 className="text-xl tracking-[-0.035em]">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#68767b]">{text}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#eef4f5] py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1220px] gap-12 px-5 sm:px-8 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:px-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66808c]">
              {t.trustEyebrow}
            </p>
            <h2 className="mt-5 text-[40px] leading-[1.02] tracking-[-0.055em] sm:text-6xl">
              {t.trustTitle}
            </h2>
            <p className="mt-6 max-w-lg leading-8 text-[#64757c]">{t.trustText}</p>
          </div>
          <div className="rounded-[28px] border border-white bg-white/80 p-3 shadow-[0_24px_70px_rgba(32,33,36,.07)] backdrop-blur sm:p-5">
            {t.trustItems.map((item, index) => (
              <div key={item} className="flex items-center gap-4 border-b border-[#e3e5e2] px-3 py-5 last:border-b-0 sm:px-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dceef7] text-[#3e7188]">
                  <Check className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm leading-6 sm:text-base">{item}</span>
                <span className="hidden text-[10px] tracking-[0.15em] text-[#a0a7a9] sm:block">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="relative mx-auto max-w-[1160px] overflow-hidden rounded-[32px] bg-[#b4d9ef] px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[55px] border-white/25" />
          <div className="absolute -bottom-44 -left-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#35596a]">{t.ctaEyebrow}</p>
            <h2 className="mx-auto mt-5 max-w-4xl text-[38px] leading-[1.02] tracking-[-0.055em] sm:text-6xl">
              {t.cta}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl leading-8 text-[#3d6070]">{t.ctaText}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/dealer-apply" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] px-8 text-sm font-medium text-white">
                {t.primary}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#7faec5] bg-white/45 px-8 text-sm font-medium">
                {locale === 'de' ? 'Händler-Login' : 'Dealer login'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function HeroVehicleVisual({
  locale,
  content: t,
}: {
  locale: BuyerLocale
  content: (typeof content)[BuyerLocale]
}) {
  const stats =
    locale === 'de'
      ? [
          ['Fahrzeugstandard', '2018+'],
          ['Laufleistung', '< 100.000 km'],
          ['Transaktion', 'Autorell koordiniert'],
        ]
      : [
          ['Vehicle standard', '2018+'],
          ['Mileage focus', '< 100,000 km'],
          ['Transaction', 'Autorell coordinated'],
        ]

  return (
    <div className="relative z-10 mx-auto w-full max-w-[660px] lg:ml-auto">
      <div className="absolute -inset-6 rounded-[48px] bg-white/55 blur-2xl" />
      <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-[#dbe7eb] shadow-[0_42px_110px_rgba(32,36,39,.2)]">
        <div className="relative aspect-[1.18/1] min-h-[470px] sm:aspect-[1.3/1] sm:min-h-0 lg:aspect-[1.08/1] xl:aspect-[1.18/1]">
          <Image
            src="/autorell-volvo-hero.jpg"
            alt={
              locale === 'de'
                ? 'Modernes Elektrofahrzeug aus dem Autorell Fahrzeugangebot'
                : 'Modern electric vehicle representing Autorell vehicle supply'
            }
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 48vw"
            className="object-cover object-[69%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,27,31,.03)_28%,rgba(20,27,31,.7)_100%)]" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 sm:p-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/65 bg-white/82 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#3f5f6d] shadow-[0_10px_30px_rgba(32,33,36,.09)] backdrop-blur-md sm:text-[10px]">
              <Sparkles className="h-3.5 w-3.5 text-[#4b8198]" />
              {locale === 'de'
                ? 'Nordisches Fahrzeugangebot'
                : 'Nordic vehicle supply'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#202427]/82 px-3.5 py-2 text-[9px] text-white/82 backdrop-blur-md sm:text-[10px]">
              <CircleDot className="buyer-live-dot h-3.5 w-3.5 text-[#8ed1a8]" />
              {t.live}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
            <div className="market-console-float overflow-hidden rounded-[24px] border border-white/18 bg-[#202427]/88 p-4 text-white shadow-[0_24px_70px_rgba(15,20,23,.35)] backdrop-blur-xl sm:p-5">
              <div className="flex items-end justify-between gap-5 border-b border-white/10 pb-4">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.21em] text-[#b4d9ef] sm:text-[9px]">
                    {t.platformLabel}
                  </p>
                  <p className="mt-2 text-base tracking-[-0.03em] sm:text-lg">
                    {t.platformTitle}
                  </p>
                </div>
                <BarChart3 className="h-5 w-5 shrink-0 text-[#b4d9ef]" />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {stats.map(([label, value], index) => (
                  <div
                    key={label}
                    className={`rounded-[15px] border p-3 ${
                      index === 0
                        ? 'border-[#b4d9ef]/35 bg-[#b4d9ef]/15'
                        : 'border-white/10 bg-white/[.055]'
                    }`}
                  >
                    <p className="text-[8px] uppercase tracking-[0.14em] text-white/48">
                      {label}
                    </p>
                    <p className="mt-3 text-[11px] font-medium leading-4 text-white/88 sm:text-xs">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
