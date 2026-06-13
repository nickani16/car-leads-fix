import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BatteryCharging,
  Building2,
  CarFront,
  Check,
  CircleDollarSign,
  FileCheck2,
  Gauge,
  Gavel,
  Globe2,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import {
  type DealerSeoLocale,
  getDealerSeoLocation,
  getDealerSeoLocations,
  getDealerSeoPublicPath,
} from '@/lib/international-dealer-seo'

type RouteProps = {
  params: Promise<{ locale: string; slug: string }>
}

const localeCopy = {
  de: {
    hubTitle: 'Autorell für Autohändler in Deutschland',
    hubDescription:
      'Entdecken Sie Autorell Händlerzugang, geprüfte europäische Fahrzeuge und digitale B2B-Auktionen für professionelle Autohändler in Deutschland.',
    hubEyebrow: 'Autorell Deutschland',
    hubIntro:
      'Ein digitaler Einkaufskanal für moderne Fahrzeuge, strukturierte Daten und durch Autorell koordinierte grenzüberschreitende Transaktionen.',
    title: (name: string) => `B2B Fahrzeugmarkt für Autohändler in ${name}`,
    description: (name: string) =>
      `Autorell Händlerzugang in ${name}: moderne Fahrzeuge ab 2018, unter 100.000 km, strukturierte Daten, Prüfung, Zahlung und Export.`,
    eyebrow: (name: string) => `Händlerzugang für ${name}`,
    heading: (name: string) => `Neue Fahrzeuge für Autohändler in ${name}.`,
    intro:
      'Autorell verbindet professionelle Käufer mit ausgewählten europäischen Fahrzeugen. Sie geben Ihr Gebot ab. Wir koordinieren Vertrag, Zahlung, Vor-Ort-Prüfung, Abholung, Dokumente und Export.',
    primary: 'Händlerzugang beantragen',
    secondary: 'So funktioniert Autorell',
    signalLabel: 'Autorell Market Signal',
    signalTitle: 'Fahrzeugnachfrage',
    live: 'Aktiver Markt',
    whyEyebrow: 'Warum Autorell',
    whyTitle: 'Ein professioneller Beschaffungskanal statt unstrukturierter Anzeigen.',
    whyText:
      'Wir konzentrieren Angebot, Daten und Transaktionsschritte in einem klaren Händlerprozess. So kann Ihr Einkaufsteam schneller prüfen, bieten und entscheiden.',
    processEyebrow: 'Einfacher B2B-Prozess',
    processTitle: 'Sie bieten. Autorell führt die Transaktion aus.',
    vehicleEyebrow: 'Unser Fahrzeugfokus',
    vehicleTitle: 'Modern, relevant und für den Wiederverkauf ausgewählt.',
    vehicleText:
      'Premium bedeutet bei Autorell nicht nur Luxus- oder Sportwagen. Es bedeutet jüngere, marktgerechte Fahrzeuge mit transparenter Deklaration und guter professioneller Nachfrage.',
    localEyebrow: 'Marktzugang',
    localTitle: (name: string) => `Für professionelle Käufer in ${name}.`,
    locationsTitle: 'Autorell Händlerstandorte entdecken',
    faqTitle: 'Häufige Fragen zum Händlerzugang',
    ctaTitle: 'Bereit für einen besseren europäischen Einkaufskanal?',
    ctaText:
      'Beantragen Sie Ihren geprüften Händlerzugang und erhalten Sie Zugang zu qualifizierten Fahrzeugangeboten und digitalen Gebotsprozessen.',
    facts: ['B2B-only', 'Geprüfte Händler', 'Autorell Verified Inspection'],
  },
  en: {
    hubTitle: 'European Vehicle Sourcing for Professional Dealers',
    hubDescription:
      'Join Autorell for selected modern vehicles, structured B2B auctions, verified inspections and coordinated cross-border transactions across Europe.',
    hubEyebrow: 'Autorell Dealer Network',
    hubIntro:
      'A digital sourcing channel for modern vehicles, structured data and cross-border transactions coordinated by Autorell.',
    title: (name: string) => `European Car Sourcing for Dealers in ${name}`,
    description: (name: string) =>
      `Dealer access in ${name}: selected 2018+ vehicles below 100,000 km, structured data, inspection, payment, collection and export.`,
    eyebrow: (name: string) => `Dealer access for ${name}`,
    heading: (name: string) => `A new vehicle sourcing channel for dealers in ${name}.`,
    intro:
      'Autorell connects professional buyers with selected European vehicles. You place the bid. We coordinate contracts, cleared funds, on-site inspection, collection, documentation and export.',
    primary: 'Apply for dealer access',
    secondary: 'How Autorell works',
    signalLabel: 'Autorell Market Signal',
    signalTitle: 'Dealer demand',
    live: 'Active market',
    whyEyebrow: 'Why Autorell',
    whyTitle: 'Professional sourcing without fragmented listings.',
    whyText:
      'Vehicle supply, comparable data and transaction stages are brought into one dealer workflow, helping purchasing teams review, bid and decide faster.',
    processEyebrow: 'A clearer B2B process',
    processTitle: 'You bid. Autorell coordinates the transaction.',
    vehicleEyebrow: 'Our vehicle focus',
    vehicleTitle: 'Modern, relevant and selected for professional resale.',
    vehicleText:
      'Premium at Autorell does not only mean luxury or sports cars. It means newer, market-relevant vehicles with transparent declarations and strong professional demand.',
    localEyebrow: 'Market access',
    localTitle: (name: string) => `Built for professional buyers in ${name}.`,
    locationsTitle: 'Explore the Autorell dealer network',
    faqTitle: 'Dealer access questions',
    ctaTitle: 'Ready to build a better European sourcing channel?',
    ctaText:
      'Apply for verified dealer access to qualified vehicle opportunities and focused digital bidding.',
    facts: ['Dealer-only', 'Verified businesses', 'Autorell Verified Inspection'],
  },
} as const

const processIcons = [Building2, ScanSearch, Gavel, CircleDollarSign, ShieldCheck, Truck]
const vehicleIcons = [CarFront, Gauge, BatteryCharging, FileCheck2]

export function generateStaticParams() {
  return (['de', 'en'] as const).flatMap((locale) => [
    { locale, slug: 'index' },
    ...getDealerSeoLocations(locale).map(({ slug }) => ({ locale, slug })),
  ])
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params
  if (rawLocale !== 'de' && rawLocale !== 'en') return {}

  const locale = rawLocale as DealerSeoLocale
  const t = localeCopy[locale]
  const location = slug === 'index' ? null : getDealerSeoLocation(locale, slug)
  if (slug !== 'index' && !location) return {}

  const title = location ? t.title(location.name) : t.hubTitle
  const description = location ? t.description(location.name) : t.hubDescription
  const path = getDealerSeoPublicPath(locale, location?.slug)
  const host = locale === 'de' ? 'https://www.autorell.de' : 'https://www.autorell.com'

  return {
    title: { absolute: `${title} | Autorell` },
    description,
    keywords:
      locale === 'de'
        ? [
            `Autohändler ${location?.name ?? 'Deutschland'}`,
            'B2B Fahrzeugmarkt',
            'Online Autoauktion Händler',
            'Fahrzeugeinkauf Europa',
            'junge Gebrauchtwagen Großhandel',
          ]
        : [
            `car dealers ${location?.name ?? 'Europe'}`,
            'European vehicle sourcing',
            'B2B car auctions',
            'dealer vehicle marketplace',
            'wholesale cars Europe',
          ],
    alternates: { canonical: `${host}${path}` },
    openGraph: {
      title: `${title} | Autorell`,
      description,
      url: `${host}${path}`,
      siteName: 'Autorell',
      locale: locale === 'de' ? 'de_DE' : 'en_GB',
      type: 'website',
    },
  }
}

export default async function DealerSeoPage({ params }: RouteProps) {
  const { locale: rawLocale, slug } = await params
  if (rawLocale !== 'de' && rawLocale !== 'en') notFound()

  const locale = rawLocale as DealerSeoLocale
  const locations = getDealerSeoLocations(locale)
  const location = slug === 'index' ? null : getDealerSeoLocation(locale, slug)
  if (slug !== 'index' && !location) notFound()

  const t = localeCopy[locale]
  const displayName = location?.name ?? (locale === 'de' ? 'Deutschland' : 'Europe')
  const demand = location?.demand ?? (
    locale === 'de'
      ? ['Elektro & Hybrid', 'SUV & Crossover', 'Junge Gebrauchte']
      : ['Electric & hybrid', 'SUV & crossover', 'Young used vehicles']
  )
  const processSteps =
    locale === 'de'
      ? [
          ['Zugang beantragen', 'Wir prüfen Unternehmen, Umsatzsteuer-ID und Ansprechpartner.'],
          ['Fahrzeuge prüfen', 'Sie sehen strukturierte Daten, Bilder, Historie und bekannte Abweichungen.'],
          ['Digital bieten', 'Geben Sie Ihr professionelles Gebot innerhalb des aktiven Zeitfensters ab.'],
          ['Zahlung sichern', 'Nach Annahme überweist der Käufer den bestätigten Gesamtbetrag an Autorell.'],
          ['Vor Ort kontrollieren', 'Autorell gleicht Identität, Laufleistung, Funktion und Zustand mit der Deklaration ab.'],
          ['Abholen & exportieren', 'Bei Übereinstimmung koordinieren wir Abschluss, Dokumente, Abholung und Export.'],
        ]
      : [
          ['Apply for access', 'We review the business, VAT details and authorised contact.'],
          ['Review vehicles', 'See structured data, images, history and known discrepancies.'],
          ['Bid digitally', 'Place your professional bid during the active market window.'],
          ['Fund securely', 'After acceptance, the buyer transfers the confirmed total to Autorell.'],
          ['Inspect on site', 'Autorell checks identity, mileage, operation and condition against the declaration.'],
          ['Collect and export', 'When verified, we coordinate completion, documents, collection and export.'],
        ]
  const vehicleStandards =
    locale === 'de'
      ? [
          ['Baujahr 2018+', 'Ein klarer Fokus auf jüngere Fahrzeuge mit relevanter europäischer Nachfrage.'],
          ['Unter 100.000 km', 'Marktgerechte Laufleistung für Finanzierung, Bestand und Wiederverkauf.'],
          ['Modern & elektrifiziert', 'Elektro, Hybrid und effiziente moderne Verbrenner im passenden Marktsegment.'],
          ['Deklarierter Zustand', 'Strukturierte Angaben zu Historie, Schäden, Dokumenten und bekannten Mängeln.'],
        ]
      : [
          ['Model year 2018+', 'A clear focus on newer vehicles with relevant European dealer demand.'],
          ['Below 100,000 km', 'Marketable mileage for financing, inventory planning and resale.'],
          ['Modern and electrified', 'Electric, hybrid and efficient modern combustion vehicles in relevant segments.'],
          ['Declared condition', 'Structured information on history, damage, documents and known faults.'],
        ]
  const faq =
    locale === 'de'
      ? [
          ['Wer kann Händlerzugang erhalten?', 'Der Zugang richtet sich an geprüfte Autohändler und professionelle Fahrzeugunternehmen mit korrekten Unternehmens- und Umsatzsteuerangaben.'],
          ['Wo befinden sich die Fahrzeuge?', 'Der aktuelle Schwerpunkt liegt auf qualifizierten Fahrzeugen aus Schweden. Weitere europäische Angebotsmärkte werden schrittweise ergänzt.'],
          ['Was übernimmt Autorell?', 'Autorell koordiniert Vertrag, Zahlungseingang, Vor-Ort-Prüfung, Dokumente, Abholung und den vereinbarten Exportprozess.'],
          ['Was passiert bei einer Abweichung?', 'Die Transaktion wird pausiert. Ein neuer Preis kann schriftlich vereinbart oder der Vorgang nach den Vertragsbedingungen abgebrochen werden.'],
        ]
      : [
          ['Who can receive dealer access?', 'Access is for verified dealerships and professional automotive businesses with valid company and VAT information.'],
          ['Where are the vehicles located?', 'Current supply is focused on qualified vehicles from Sweden, with additional European supply markets planned over time.'],
          ['What does Autorell coordinate?', 'Autorell coordinates contracts, receipt of funds, on-site inspection, documentation, collection and the agreed export process.'],
          ['What happens if a vehicle differs from its declaration?', 'The transaction is paused. A revised price can be agreed in writing or the transaction can be cancelled under the contract.'],
        ]

  const pagePath = getDealerSeoPublicPath(locale, location?.slug)
  const host = locale === 'de' ? 'https://www.autorell.de' : 'https://www.autorell.com'
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: location ? t.title(location.name) : t.hubTitle,
        serviceType: 'B2B vehicle sourcing and dealer marketplace',
        provider: {
          '@type': 'Organization',
          name: 'Autorell AB',
          url: host,
        },
        areaServed: {
          '@type': location && locale === 'de' ? 'City' : 'Country',
          name: displayName,
        },
        url: `${host}${pagePath}`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  }

  return (
    <main className="overflow-hidden bg-[#f7f6f2] text-[#202124]">
      <PublicHeader locale={locale} />

      <section className="relative isolate overflow-hidden border-b border-[#d9ddd9]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_28%,rgba(180,217,239,.64),transparent_28%),linear-gradient(135deg,#fcfaf5_0%,#f2f0e9_55%,#e6f1f5_100%)]" />
        <div className="dealer-seo-orbit absolute -right-52 -top-64 h-[760px] w-[760px] rounded-full border-[105px] border-white/45" />
        <div className="relative mx-auto grid min-h-[710px] min-w-0 max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:px-12 xl:px-16">
          <div className="relative z-10 min-w-0 max-w-[760px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c7d7dc] bg-white/75 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4f7181] shadow-[0_12px_35px_rgba(32,33,36,.06)]">
              <MapPin className="h-4 w-4" />
              {location ? t.eyebrow(location.name) : t.hubEyebrow}
            </span>
            <h1 className="mt-8 max-w-[820px] break-words text-[46px] leading-[.94] tracking-[-0.062em] sm:text-7xl lg:text-[82px]">
              {location ? t.heading(location.name) : t.hubTitle}
            </h1>
            <p className="mt-7 max-w-[680px] text-[17px] leading-8 text-[#536b76] sm:text-xl sm:leading-9">
              {location ? t.intro : t.hubIntro}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/dealer-apply" className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] pl-7 pr-3 text-sm font-medium text-white shadow-[0_18px_40px_rgba(32,33,36,.2)] transition hover:-translate-y-0.5">
                {t.primary}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#b4d9ef] text-[#242424]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link href={locale === 'de' ? '/so-funktionierts' : '/how-it-works'} className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#c9cbc6] bg-white/72 px-7 text-sm font-medium backdrop-blur transition hover:bg-white">
                {t.secondary}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {t.facts.map((fact) => (
                <span key={fact} className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-4 py-2 text-xs text-[#556d78]">
                  <Check className="h-3.5 w-3.5 text-[#4c8299]" />
                  {fact}
                </span>
              ))}
            </div>
          </div>

          <div className="dealer-seo-console relative z-10 mx-auto min-w-0 w-full max-w-[520px] rounded-[30px] border border-white/65 bg-[#202427] p-5 text-white shadow-[0_35px_90px_rgba(32,36,39,.22)] sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">{t.signalLabel}</p>
                <h2 className="mt-3 text-2xl tracking-[-0.04em]">{t.signalTitle}</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[10px] text-white/70">
                <span className="dealer-seo-live h-2 w-2 rounded-full bg-[#8ed1a8]" />
                {t.live}
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {demand.map((label, index) => {
                const values = [84, 73, 66]
                return (
                  <div key={label} className="rounded-[18px] border border-white/10 bg-white/[.065] p-4">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span>{label}</span>
                      <span className="text-white/55">{values[index]}%</span>
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="dealer-seo-bar block h-full origin-left rounded-full bg-[#b4d9ef]"
                        style={{ width: `${values[index]}%`, animationDelay: `${index * 180}ms` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[16px] bg-[#b4d9ef] p-4 text-[#202124]">
                <p className="text-[9px] uppercase tracking-[0.16em] opacity-60">Vehicle standard</p>
                <strong className="mt-2 block text-lg">2018+</strong>
              </div>
              <div className="rounded-[16px] border border-white/10 bg-white/[.06] p-4">
                <p className="text-[9px] uppercase tracking-[0.16em] text-white/45">Mileage focus</p>
                <strong className="mt-2 block text-lg">
                  {locale === 'de' ? '< 100.000 km' : '< 100,000 km'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {location && (
        <section className="border-b border-[#dfdfda] bg-white">
          <div className="mx-auto grid max-w-[1320px] gap-px bg-[#dfdfda] sm:grid-cols-2 lg:grid-cols-3">
            <article className="bg-white p-7 sm:p-9">
              <Globe2 className="h-5 w-5 text-[#4e8197]" />
              <p className="mt-7 text-[10px] uppercase tracking-[0.18em] text-[#88979d]">{t.localEyebrow}</p>
              <h2 className="mt-3 text-2xl tracking-[-0.04em]">{t.localTitle(location.name)}</h2>
            </article>
            <article className="bg-white p-7 sm:p-9 lg:col-span-2">
              <p className="max-w-3xl text-base leading-8 text-[#61737a]">{location.marketNote}</p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#7a8589]">{location.logisticsNote}</p>
            </article>
          </div>
        </section>
      )}

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:gap-20">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66808c]">{t.whyEyebrow}</p>
              <h2 className="mt-5 text-[40px] leading-[1.02] tracking-[-0.055em] sm:text-6xl">{t.whyTitle}</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#66767c]">{t.whyText}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [BarChart3, locale === 'de' ? 'Vergleichbare Daten' : 'Comparable data', locale === 'de' ? 'Ein konsistenter Fahrzeugbericht unterstützt schnelle professionelle Entscheidungen.' : 'A consistent vehicle report supports faster professional decisions.'],
                [BadgeCheck, locale === 'de' ? 'Geprüfter Zugang' : 'Verified access', locale === 'de' ? 'Der Marktplatz ist für geprüfte gewerbliche Käufer aufgebaut.' : 'The marketplace is built for verified professional buyers.'],
                [ShieldCheck, locale === 'de' ? 'Kontrollierter Abschluss' : 'Controlled completion', locale === 'de' ? 'Autorell prüft das Fahrzeug gegen die Deklaration, bevor die Transaktion abgeschlossen wird.' : 'Autorell checks the vehicle against its declaration before completion.'],
                [Truck, locale === 'de' ? 'Grenzüberschreitend' : 'Cross-border by design', locale === 'de' ? 'Dokumente, Abholung und vereinbarter Export werden in einem Prozess koordiniert.' : 'Documents, collection and agreed export are coordinated in one process.'],
              ].map(([Icon, title, text], index) => {
                const CardIcon = Icon as typeof BarChart3
                return (
                  <article key={String(title)} className={`relative min-h-[260px] overflow-hidden rounded-[25px] border p-7 ${index === 0 ? 'border-[#b9d7e6] bg-[#dfeff7]' : 'border-[#deddd7] bg-white'}`}>
                    <span className="absolute -right-12 -top-12 h-32 w-32 rounded-full border-[20px] border-[#b4d9ef]/20" />
                    <CardIcon className="h-6 w-6 text-[#4e7f94]" />
                    <h3 className="mt-14 text-2xl tracking-[-0.04em]">{String(title)}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#68777c]">{String(text)}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#202427] py-20 text-white sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b4d9ef]">{t.processEyebrow}</p>
          <h2 className="mt-5 max-w-4xl text-[40px] leading-[1.02] tracking-[-0.055em] sm:text-6xl">{t.processTitle}</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {processSteps.map(([title, text], index) => {
              const Icon = processIcons[index]
              return (
                <article key={title} className="group relative min-h-[285px] bg-[#202427] p-7 transition hover:bg-[#272d30] sm:p-8">
                  <span className="absolute left-0 top-0 h-1 w-0 bg-[#b4d9ef] transition-all duration-500 group-hover:w-full" />
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-[#b4d9ef]" />
                    <span className="text-[10px] tracking-[0.18em] text-white/35">0{index + 1}</span>
                  </div>
                  <div className="absolute bottom-8 left-7 right-7 sm:left-8 sm:right-8">
                    <h3 className="text-xl tracking-[-0.035em]">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/52">{text}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#eef4f5] py-20 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66808c]">{t.vehicleEyebrow}</p>
            <h2 className="mt-5 text-[40px] leading-[1.02] tracking-[-0.055em] sm:text-6xl">{t.vehicleTitle}</h2>
            <p className="mt-6 text-base leading-8 text-[#65767c]">{t.vehicleText}</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {vehicleStandards.map(([title, text], index) => {
              const Icon = vehicleIcons[index]
              return (
                <article key={title} className="rounded-[24px] border border-white bg-white p-7 shadow-[0_18px_50px_rgba(32,33,36,.05)]">
                  <Icon className="h-6 w-6 text-[#4e8095]" />
                  <h3 className="mt-10 text-xl tracking-[-0.035em]">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#68777c]">{text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66808c]">Autorell Network</p>
              <h2 className="mt-4 text-[38px] tracking-[-0.05em] sm:text-5xl">{t.locationsTitle}</h2>
            </div>
            {location && (
              <Link href={getDealerSeoPublicPath(locale)} className="inline-flex items-center gap-2 text-sm font-medium">
                {locale === 'de' ? 'Alle Standorte' : 'All markets'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locations
              .filter(({ slug: itemSlug }) => itemSlug !== location?.slug)
              .slice(0, location ? 9 : locations.length)
              .map((item) => (
                <Link key={item.slug} href={getDealerSeoPublicPath(locale, item.slug)} className="group flex min-h-24 items-center justify-between rounded-[20px] border border-[#deddd7] bg-white px-6 py-5 transition hover:-translate-y-0.5 hover:border-[#b4d9ef] hover:shadow-[0_16px_40px_rgba(32,33,36,.06)]">
                  <span>
                    <strong className="block text-lg font-medium">{item.name}</strong>
                    <span className="mt-1 block text-xs text-[#849096]">{item.region}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#62879a] transition group-hover:translate-x-1" />
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#deddd8] bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-[1040px] px-5 sm:px-8">
          <h2 className="text-center text-[38px] tracking-[-0.05em] sm:text-5xl">{t.faqTitle}</h2>
          <div className="mt-10 grid gap-3">
            {faq.map(([question, answer]) => (
              <details key={question} className="group rounded-[20px] border border-[#deddd7] bg-[#faf9f6] p-6 open:bg-white open:shadow-[0_16px_45px_rgba(32,33,36,.05)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-medium">
                  {question}
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dceef7] text-[#365c6f] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-[#68777c]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[30px] bg-[#b4d9ef] px-7 py-14 text-center sm:px-12 sm:py-20">
          <span className="absolute -right-24 -top-28 h-72 w-72 rounded-full border-[46px] border-white/28" />
          <BadgeCheck className="relative z-10 mx-auto h-7 w-7" />
          <h2 className="relative z-10 mx-auto mt-5 max-w-4xl text-[38px] leading-[1.04] tracking-[-0.055em] sm:text-6xl">{t.ctaTitle}</h2>
          <p className="relative z-10 mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#496675] sm:text-base">{t.ctaText}</p>
          <Link href="/dealer-apply" className="relative z-10 mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] px-8 text-sm font-medium text-white">
            {t.primary}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  )
}
