import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Building2,
  CarFront,
  Check,
  ChevronRight,
  CircleDot,
  Database,
  FileCheck2,
  Gavel,
  Globe2,
  LockKeyhole,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'

type BuyerLocale = 'de' | 'en'

const content = {
  de: {
    eyebrow: 'B2B-Fahrzeugmarkt für Autohändler',
    titleTop: 'Fahrzeuge handeln.',
    titleBottom: 'Europa verbinden.',
    intro:
      'Autorell entwickelt den digitalen B2B-Marktplatz für den professionellen Fahrzeughandel. Geprüfte Händler, strukturierte Fahrzeugdaten und effiziente Online-Auktionen in einem europäischen Netzwerk.',
    primary: 'Händlerzugang beantragen',
    secondary: 'Plattform entdecken',
    platformLabel: 'Autorell Market Intelligence',
    platformTitle: 'Europäischer Fahrzeugmarkt',
    live: 'Live-Marktplatz',
    sourceLabel: 'Beschaffungsnetzwerk',
    sourceValue: 'Europaweit aufgebaut',
    dataLabel: 'Datenstandard',
    dataValue: 'Einheitliche Profile',
    dealerLabel: 'Zugang',
    dealerValue: 'Geprüfte Händler',
    bidLabel: 'Auktionsformat',
    bidValue: 'Digital & fokussiert',
    marketEyebrow: 'Eine Plattform. Mehr Markt.',
    marketTitle: 'Gebaut für den nächsten europäischen Fahrzeughandel.',
    marketText:
      'Der grenzüberschreitende Fahrzeugeinkauf ist heute fragmentiert. Autorell verbindet Angebot, Daten, Gebote und Transaktionsstatus in einem professionellen digitalen Ablauf.',
    pillars: [
      ['Europäische Beschaffung', 'Neue Angebotsmärkte erschließen und relevante Fahrzeuge zentral prüfen.'],
      ['Strukturierte Fahrzeugdaten', 'Zustand, Historie, Dokumente und bekannte Abweichungen vergleichbar darstellen.'],
      ['Digitale B2B-Auktionen', 'In klaren Zeitfenstern bieten und Einkaufsentscheidungen effizient koordinieren.'],
      ['Verifiziertes Netzwerk', 'Zugang für geprüfte Händler und professionelle Marktteilnehmer.'],
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
    flowEyebrow: 'Der digitale Einkaufsfluss',
    flowTitle: 'Weniger Reibung zwischen Fahrzeug und Bestand.',
    steps: [
      ['Zugang erhalten', 'Unternehmen verifizieren und professionelles Händlerkonto aktivieren.'],
      ['Fahrzeuge entdecken', 'Relevantes Angebot anhand strukturierter Profile effizient bewerten.'],
      ['Digital bieten', 'Gebote transparent innerhalb der aktiven Auktionsphase abgeben.'],
      ['Geschäft koordinieren', 'Entscheidung, Dokumente, Zahlung und Logistik im Prozess verfolgen.'],
    ],
    trustEyebrow: 'Warum Händler Autorell wählen',
    trustTitle: 'Mehr als Fahrzeuganzeigen.',
    trustText:
      'Autorell wird als Handelsinfrastruktur entwickelt: datenorientiert, grenzüberschreitend und auf professionelle Entscheidungen ausgerichtet.',
    trustItems: [
      'Professioneller B2B-Zugang statt offener Kleinanzeigen',
      'Vergleichbare Informationen für schnellere Einkaufsentscheidungen',
      'Digitale Gebote und klarer Transaktionsstatus',
      'Plattformarchitektur für mehrere europäische Märkte',
      'Persönlicher Support bei komplexen Geschäftsschritten',
      'Ein Netzwerk, das mit Ihrem Beschaffungsbedarf wächst',
    ],
    ctaEyebrow: 'Frühen Zugang sichern',
    cta: 'Ihr Zugang zum europäischen Fahrzeugmarkt.',
    ctaText:
      'Werden Sie Teil des Autorell Dealer Network und erhalten Sie Zugang zu neuen Fahrzeugangeboten, digitalen Auktionen und dem Ausbau unserer europäischen Marktplattform.',
  },
  en: {
    eyebrow: 'Swedish vehicle sourcing for European dealers',
    titleTop: 'Source better vehicles.',
    titleBottom: 'Trade across Europe.',
    intro:
      'Autorell gives professional dealers access to selected Swedish vehicles through structured data, focused online auctions and a digital cross-border buying workflow.',
    primary: 'Apply for dealer access',
    secondary: 'Explore the platform',
    platformLabel: 'Autorell Market Intelligence',
    platformTitle: 'Swedish supply. European reach.',
    live: 'Marketplace live',
    sourceLabel: 'Current supply',
    sourceValue: 'Vehicles in Sweden',
    dataLabel: 'Data standard',
    dataValue: 'Structured profiles',
    dealerLabel: 'Access',
    dealerValue: 'Verified dealers',
    bidLabel: 'Auction format',
    bidValue: 'Digital & focused',
    marketEyebrow: 'One platform. Better sourcing.',
    marketTitle: 'A professional route into the Swedish vehicle market.',
    marketText:
      'Autorell turns selected Swedish vehicle supply into a clear buying experience for European dealers, connecting vehicle information, bidding and transaction progress.',
    pillars: [
      ['Selected Swedish supply', 'Access relevant vehicles from a highly digitalised Nordic automotive market.'],
      ['Structured vehicle data', 'Review condition, history, documents and known discrepancies in a consistent format.'],
      ['Focused online auctions', 'Bid within clear time windows and coordinate purchasing decisions efficiently.'],
      ['Verified dealer network', 'A professional marketplace built for approved automotive businesses.'],
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
    flowEyebrow: 'The digital buying flow',
    flowTitle: 'Less friction between vehicle and inventory.',
    steps: [
      ['Get approved', 'Verify your business and activate professional dealer access.'],
      ['Discover vehicles', 'Evaluate relevant supply through structured vehicle profiles.'],
      ['Bid digitally', 'Place transparent bids during the active auction window.'],
      ['Coordinate the deal', 'Follow decisions, documents, payment and logistics in one process.'],
    ],
    trustEyebrow: 'Why dealers choose Autorell',
    trustTitle: 'More than vehicle listings.',
    trustText:
      'Autorell is being built as trading infrastructure: data-led, cross-border and designed around professional purchasing decisions.',
    trustItems: [
      'Professional B2B access instead of open classifieds',
      'Comparable information for faster buying decisions',
      'Digital bidding and clear transaction progress',
      'Selected supply from the Swedish vehicle market',
      'Personal support through complex deal stages',
      'A network designed to expand across Europe',
    ],
    ctaEyebrow: 'Secure early access',
    cta: 'Build your next sourcing channel with Autorell.',
    ctaText:
      'Join the Autorell Dealer Network for access to selected Swedish vehicles, focused online auctions and a platform built for European automotive trade.',
  },
} as const

const pillarIcons = [Globe2, Database, Gavel, ShieldCheck]
const stepIcons = [Building2, Search, Gavel, Route]

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

          <MarketConsole locale={locale} content={t} />
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
                    className={`group rounded-[26px] border p-7 transition duration-300 hover:-translate-y-1 sm:p-8 ${
                      index === 0
                        ? 'border-[#b9d7e6] bg-[#dfeff7]'
                        : 'border-[#deddd7] bg-white shadow-[0_18px_55px_rgba(32,33,36,.045)]'
                    }`}
                  >
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

      <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12">
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

            <div className="relative flex min-h-[390px] items-center justify-center">
              <div className="absolute h-[330px] w-[330px] rounded-full border border-white/10" />
              <div className="absolute h-[220px] w-[220px] rounded-full border border-[#b4d9ef]/20" />
              <div className="absolute h-[110px] w-[110px] rounded-full bg-[#b4d9ef] shadow-[0_0_80px_rgba(180,217,239,.25)]" />
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
                    className={`absolute ${positions[index]} w-[185px] rounded-[18px] border border-white/10 bg-white/[.075] p-4 backdrop-blur-md sm:w-[215px]`}
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

          <div className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-[#dcddd9] bg-[#dcddd9] lg:grid-cols-4">
            {t.steps.map(([title, text], index) => {
              const Icon = stepIcons[index]
              return (
                <article key={title} className="relative min-h-[310px] bg-[#f8f7f3] p-7 sm:p-8">
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

function MarketConsole({
  locale,
  content: t,
}: {
  locale: BuyerLocale
  content: (typeof content)[BuyerLocale]
}) {
  const rows =
    locale === 'de'
      ? [
          ['01', 'Premium SUV', 'DE / EU', 'Auktion offen'],
          ['02', 'Electric vehicle', 'SE / DE', 'Daten geprüft'],
          ['03', 'Business fleet', 'EU', 'In Vorbereitung'],
        ]
      : [
          ['01', 'Premium SUV', 'Sweden', 'Auction open'],
          ['02', 'Electric vehicle', 'Sweden', 'Data verified'],
          ['03', 'Business fleet', 'Sweden', 'Preparing'],
        ]

  return (
    <div className="relative z-10 mx-auto min-w-0 w-full max-w-[620px] lg:ml-auto">
      <div className="absolute -inset-6 rounded-[42px] bg-white/50 blur-2xl" />
      <div className="market-console-float relative overflow-hidden rounded-[30px] border border-white/75 bg-[#202427] p-4 text-white shadow-[0_40px_100px_rgba(32,36,39,.25)] sm:p-6">
        <div className="flex min-w-0 items-start justify-between gap-3 border-b border-white/10 px-1 pb-5">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b4d9ef]">{t.platformLabel}</p>
            <p className="mt-2 text-lg tracking-[-0.03em] sm:text-xl">{t.platformTitle}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[9px] text-white/65 sm:text-[10px]">
            <CircleDot className="h-3.5 w-3.5 text-[#8ed1a8]" />
            {t.live}
          </span>
        </div>

        <div className="mt-4 rounded-[22px] bg-[#f7f6f2] p-4 text-[#202124] sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#829096]">
                {locale === 'de' ? 'Aktueller Marktzugang' : 'Current market access'}
              </p>
              <p className="mt-2 text-xl tracking-[-0.04em] sm:text-2xl">
                {locale === 'de' ? 'Professionelles Fahrzeugangebot' : 'Professional vehicle supply'}
              </p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#b4d9ef]">
              <BarChart3 className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-5 space-y-2">
            {rows.map(([number, vehicle, market, status], index) => (
              <div key={number} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-[13px] border border-[#e0e3e0] bg-white px-3 py-3.5">
                <span className="text-[9px] tracking-[0.14em] text-[#9aa3a6]">{number}</span>
                <div>
                  <p className="text-xs font-medium sm:text-sm">{vehicle}</p>
                  <p className="mt-0.5 text-[9px] text-[#8a969b]">{market}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1.5 text-[8px] font-medium sm:text-[9px] ${index === 0 ? 'bg-[#dff2e6] text-[#3f7452]' : 'bg-[#eef3f5] text-[#60747d]'}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            [CarFront, locale === 'de' ? 'Fahrzeuge' : 'Vehicles'],
            [FileCheck2, locale === 'de' ? 'Daten' : 'Data'],
            [LockKeyhole, locale === 'de' ? 'B2B-Zugang' : 'B2B access'],
          ].map(([Icon, label]) => {
            const Component = Icon as typeof CarFront
            return (
              <div key={label as string} className="rounded-[15px] border border-white/10 bg-white/[.055] p-3 sm:p-4">
                <Component className="h-4 w-4 text-[#b4d9ef]" />
                <p className="mt-5 text-[10px] text-white/52 sm:text-xs">{label as string}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
