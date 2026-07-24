import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Building2,
  ChevronRight,
  FileSpreadsheet,
  Layers3,
  LineChart,
  LockKeyhole,
  MousePointerClick,
  Users2,
  Warehouse,
} from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import {
  isPublicLanguage,
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { cleanSeoText } from '@/lib/market-seo'

const businessPageCopy = {
  sv: {
    metaTitle: 'Företagslösningar för fordonsförsäljare | Autorell',
    metaDescription:
      'Skapa företagskonto, importera lager, hantera annonser och nå fordonsköpare i flera europeiska marknader med Autorell.',
    eyebrow: 'Autorell för företag',
    heroTitle: 'Hantera fordonslagret från en plats.',
    heroIntro:
      'Publicera, importera och hantera företagets annonser i ett modernt kontrollcenter. Följ resultat, nå fler köpare och väx på nya marknader med Autorell.',
    primaryCta: 'Skapa företagskonto',
    secondaryCta: 'Boka en genomgång',
    audience: 'För bilhandlare, maskinhandlare, återförsäljare och professionella fordonsföretag.',
    liveLabel: 'Aktivt lager',
    importedLabel: 'CSV importerad',
    marketLabel: 'Marknader',
    leadLabel: 'Leads idag',
    dashboardTitle: 'Lagerkontroll',
    vehicleColumn: 'Fordon',
    statusColumn: 'Status',
    marketColumn: 'Marknad',
    csvUpload: 'upload.csv',
    csvMapping: 'kolumnmatchning',
    csvPreview: 'förhandsgranska',
    csvPublish: 'publicera',
    reachLabel: 'räckvidd',
    bulkActions: 'Massåtgärder',
    selectedCount: '4 valda',
    publishAction: 'Publicera',
    networkEyebrow: 'Europeisk räckvidd',
    networkTitle: 'Ett lager. Flera marknader.',
    networkText:
      'Publicera fordon lokalt och gör dem samtidigt synliga för köpare i resten av Europa med rätt språk, valuta och marknadskänsla.',
    workflowTitle: 'Från import till publicerad annons utan tungt manuellt arbete.',
    workflowText:
      'Företag kan skapa annonser manuellt, importera större lager via CSV och sedan granska, publicera, pausa eller uppdatera annonser från samma arbetsyta.',
    inventoryTitle: 'Kontroll över hela lagret',
    inventoryText: 'Hantera en annons eller tusentals fordon utan att tappa överblicken.',
    csvTitle: 'Från fil till publicerade annonser på några minuter',
    csvText:
      'CSV-importen hjälper teamet att matcha kolumner, hitta fel och förhandsgranska annonser innan de går live.',
    analyticsTitle: 'Se vad som fungerar',
    analyticsText:
      'Följ visningar, klick, sparade annonser och inkommande leads så att företaget ser vilka fordon och marknader som skapar intresse.',
    teamTitle: 'Bygg för hela teamet',
    teamText:
      'Samla säljare, lageransvariga och administratörer i ett företagskonto med tydliga arbetsflöden för annonser och kontakt.',
    businessTypesTitle: 'Byggt för professionella fordonsföretag',
    scaleTitle: 'Börja enkelt. Väx utan att byta plattform.',
    scaleText:
      'Autorell passar mindre företag som publicerar sina första annonser och större verksamheter som behöver lagerkontroll, import och marknadsöversikt.',
    finalTitle: 'Redo att samla hela fordonsaffären på en plats?',
    finalText: 'Skapa ett företagskonto och börja publicera fordon med Autorell.',
    contactCta: 'Kontakta oss',
    soon: 'Kommer snart',
  },
  en: {
    metaTitle: 'Business solutions for vehicle sellers | Autorell',
    metaDescription:
      'Create a business account, import inventory, manage listings and reach vehicle buyers across European markets with Autorell.',
    eyebrow: 'Autorell for business',
    heroTitle: 'Manage vehicle inventory from one place.',
    heroIntro:
      'Publish, import and manage company listings in a modern control centre. Track results, reach more buyers and grow into new markets with Autorell.',
    primaryCta: 'Create business account',
    secondaryCta: 'Book a walkthrough',
    audience: 'For dealers, machinery sellers, resellers and professional vehicle companies.',
    liveLabel: 'Active inventory',
    importedLabel: 'CSV imported',
    marketLabel: 'Markets',
    leadLabel: 'Leads today',
    dashboardTitle: 'Inventory hub',
    vehicleColumn: 'Vehicle',
    statusColumn: 'Status',
    marketColumn: 'Market',
    csvUpload: 'upload.csv',
    csvMapping: 'mapping',
    csvPreview: 'preview',
    csvPublish: 'publish',
    reachLabel: 'reach',
    bulkActions: 'Bulk actions',
    selectedCount: '4 selected',
    publishAction: 'Publish',
    networkEyebrow: 'European reach',
    networkTitle: 'One inventory. Multiple markets.',
    networkText:
      'Publish vehicles locally and make them visible to buyers across Europe with the right language, currency and market context.',
    workflowTitle: 'From import to published listing without heavy manual work.',
    workflowText:
      'Businesses can create listings manually, import larger inventory by CSV and then review, publish, pause or update listings from one workspace.',
    inventoryTitle: 'Control over the full inventory',
    inventoryText: 'Manage one listing or thousands of vehicles without losing overview.',
    csvTitle: 'From file to published listings in minutes',
    csvText:
      'CSV import helps the team match columns, find errors and preview listings before they go live.',
    analyticsTitle: 'See what works',
    analyticsText:
      'Track views, clicks, saved listings and incoming leads so the business can see which vehicles and markets create interest.',
    teamTitle: 'Built for the whole team',
    teamText:
      'Bring sellers, inventory managers and administrators into one business account with clear workflows for listings and contact.',
    businessTypesTitle: 'Built for professional vehicle companies',
    scaleTitle: 'Start simple. Grow without changing platform.',
    scaleText:
      'Autorell fits smaller companies publishing their first listings and larger operations that need inventory control, import and market overview.',
    finalTitle: 'Ready to bring the vehicle business into one place?',
    finalText: 'Create a business account and start publishing vehicles with Autorell.',
    contactCta: 'Contact us',
    soon: 'Coming soon',
  },
  de: {
    metaTitle: 'Unternehmenslösungen für Fahrzeugverkäufer | Autorell',
    metaDescription:
      'Unternehmenskonto erstellen, Bestand importieren, Anzeigen verwalten und Fahrzeugkäufer in europäischen Märkten mit Autorell erreichen.',
    eyebrow: 'Autorell für Unternehmen',
    heroTitle: 'Fahrzeugbestand an einem Ort verwalten.',
    heroIntro:
      'Veröffentlichen, importieren und verwalten Sie Unternehmensanzeigen in einem modernen Kontrollzentrum. Ergebnisse verfolgen, mehr Käufer erreichen und in neue Märkte wachsen.',
    primaryCta: 'Unternehmenskonto erstellen',
    secondaryCta: 'Demo anfragen',
    audience: 'Für Händler, Maschinenverkäufer, Wiederverkäufer und professionelle Fahrzeugunternehmen.',
    liveLabel: 'Aktiver Bestand',
    importedLabel: 'CSV importiert',
    marketLabel: 'Märkte',
    leadLabel: 'Leads heute',
    dashboardTitle: 'Bestandskontrolle',
    vehicleColumn: 'Fahrzeug',
    statusColumn: 'Status',
    marketColumn: 'Markt',
    csvUpload: 'upload.csv',
    csvMapping: 'Zuordnung',
    csvPreview: 'Vorschau',
    csvPublish: 'Veröffentlichen',
    reachLabel: 'Reichweite',
    bulkActions: 'Massenaktionen',
    selectedCount: '4 ausgewählt',
    publishAction: 'Veröffentlichen',
    networkEyebrow: 'Europäische Reichweite',
    networkTitle: 'Ein Bestand. Mehrere Märkte.',
    networkText:
      'Fahrzeuge lokal veröffentlichen und gleichzeitig Käufern in Europa mit passender Sprache, Währung und Marktsicht zeigen.',
    workflowTitle: 'Vom Import zur Anzeige ohne schwere Handarbeit.',
    workflowText:
      'Unternehmen können Anzeigen manuell erstellen, größere Bestände per CSV importieren und Anzeigen in einer Arbeitsfläche prüfen, veröffentlichen, pausieren oder aktualisieren.',
    inventoryTitle: 'Kontrolle über den gesamten Bestand',
    inventoryText: 'Eine Anzeige oder tausende Fahrzeuge verwalten, ohne den Überblick zu verlieren.',
    csvTitle: 'Von der Datei zu veröffentlichten Anzeigen in Minuten',
    csvText:
      'Der CSV-Import hilft dem Team, Spalten zuzuordnen, Fehler zu finden und Anzeigen vor der Veröffentlichung zu prüfen.',
    analyticsTitle: 'Sehen, was funktioniert',
    analyticsText:
      'Verfolgen Sie Ansichten, Klicks, gespeicherte Anzeigen und eingehende Leads, um starke Fahrzeuge und Märkte zu erkennen.',
    teamTitle: 'Für das ganze Team gebaut',
    teamText:
      'Verkäufer, Lagerverantwortliche und Administratoren in einem Unternehmenskonto mit klaren Abläufen bündeln.',
    businessTypesTitle: 'Für professionelle Fahrzeugunternehmen gebaut',
    scaleTitle: 'Einfach starten. Wachsen ohne Plattformwechsel.',
    scaleText:
      'Autorell passt zu kleineren Unternehmen mit ersten Anzeigen und größeren Betrieben mit Lagerkontrolle, Import und Marktübersicht.',
    finalTitle: 'Bereit, das Fahrzeuggeschäft an einem Ort zu bündeln?',
    finalText: 'Erstellen Sie ein Unternehmenskonto und veröffentlichen Sie Fahrzeuge mit Autorell.',
    contactCta: 'Kontakt aufnehmen',
    soon: 'Demnächst',
  },
} as const

const workflowSteps = ['Importera', 'Granska', 'Publicera', 'Hantera', 'Analysera']
const vehicleRows = [
  ['BMW iX1 xDrive 30', 'Aktiv', '683 300 SEK', 'Sverige'],
  ['Volvo FH 540', 'Pausad', '1 249 000 SEK', 'Danmark'],
  ['Caterpillar 320', 'Utkast', '899 000 SEK', 'Tyskland'],
  ['Mercedes-Benz Vito', 'Såld', '329 000 SEK', 'Finland'],
]
const csvRows = [
  ['make', 'BMW', 'Matchad'],
  ['model', 'iX1 xDrive 30', 'Matchad'],
  ['price', '683300', 'Matchad'],
  ['range_km', '438', 'Kontrollera'],
]
const businessTypes = [
  'Bilhandlare',
  'Transportbilar',
  'Maskinhandlare',
  'Motorcyklar',
  'Husbilar',
  'Återförsäljarkedjor',
]

const activeMarkets = [
  { code: 'SE', name: 'Sverige', x: 48, y: 18 },
  { code: 'DK', name: 'Danmark', x: 44, y: 38 },
  { code: 'DE', name: 'Tyskland', x: 49, y: 48 },
  { code: 'PL', name: 'Polen', x: 60, y: 47 },
  { code: 'NL', name: 'Nederländerna', x: 43, y: 49 },
  { code: 'BE', name: 'Belgien', x: 41, y: 54 },
  { code: 'FR', name: 'Frankrike', x: 36, y: 63 },
  { code: 'AT', name: 'Österrike', x: 53, y: 61 },
  { code: 'IT', name: 'Italien', x: 55, y: 72 },
  { code: 'ES', name: 'Spanien', x: 28, y: 78 },
  { code: 'FI', name: 'Finland', x: 61, y: 15 },
]

type BusinessCopy = (typeof businessPageCopy)[keyof typeof businessPageCopy]

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers()
  const locale = getRequestedLocale(headerStore)
  const copy = getBusinessCopy(locale)
  const canonicalPath = headerStore.get('x-autorell-pathname') || '/business'
  return {
    title: { absolute: cleanSeoText(copy.metaTitle, 65) },
    description: cleanSeoText(copy.metaDescription, 150),
    alternates: { canonical: `https://www.autorell.com${canonicalPath}` },
  }
}

export default async function BusinessPage({
  localeOverride,
  marketCodeOverride,
}: {
  localeOverride?: PublicLocale
  marketCodeOverride?: string
} = {}) {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const marketCode = marketCodeOverride || headerStore.get('x-autorell-market') || undefined
  const copy = getBusinessCopy(locale)
  const createAccountHref = localizePublicHref(locale, '/register?account=business')
  const contactHref = localizePublicHref(locale, '/contact')

  return (
    <main className="overflow-x-hidden bg-white text-[#101828]">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .business-flow-line {
            stroke-dasharray: 10 12;
            animation: businessDash 9s linear infinite;
          }
          .business-bar {
            transform-origin: bottom;
            animation: businessBar 3.8s ease-in-out infinite;
          }
          .business-row-live {
            animation: businessRow 5.6s ease-in-out infinite;
          }
          .business-float {
            animation: businessFloat 7s ease-in-out infinite;
          }
        }
        @keyframes businessDash {
          to { stroke-dashoffset: -88; }
        }
        @keyframes businessBar {
          0%, 100% { transform: scaleY(.62); opacity: .72; }
          45% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes businessRow {
          0%, 100% { background: #ffffff; }
          45% { background: #f1f7ff; }
        }
        @keyframes businessFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
      <PublicHeader locale={locale} marketCode={marketCode} />
      <BusinessHero copy={copy} createAccountHref={createAccountHref} contactHref={contactHref} />
      <EuropeNetwork copy={copy} />
      <WorkflowDemo copy={copy} />
      <InventorySection copy={copy} />
      <CsvAndAnalytics copy={copy} />
      <TeamAndTypes copy={copy} />
      <ScaleAndCta copy={copy} createAccountHref={createAccountHref} contactHref={contactHref} />
      <PublicFooter locale={locale} />
    </main>
  )
}

function BusinessHero({
  copy,
  createAccountHref,
  contactHref,
}: {
  copy: BusinessCopy
  createAccountHref: string
  contactHref: string
}) {
  return (
    <section className="overflow-hidden border-b border-[#e4e9f2] bg-[#fbfcff]">
      <div className="mx-auto grid max-w-[var(--autorell-page-max)] grid-cols-1 gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,.9fr)_minmax(520px,1fr)] lg:items-center">
        <div className="min-w-0 max-w-[min(350px,calc(100vw-40px))] sm:max-w-none">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#0866ff]">{copy.eyebrow}</p>
          <h1 className="mt-5 max-w-full break-words text-[38px] font-bold leading-[1.04] tracking-[-.035em] text-[#101828] sm:max-w-5xl sm:text-7xl sm:tracking-[-.045em] lg:text-[82px]">
            {copy.heroTitle}
          </h1>
          <p className="mt-6 max-w-full text-lg leading-8 text-[#526071] sm:max-w-3xl sm:text-xl">
            {copy.heroIntro}
          </p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Link href={createAccountHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-5 text-sm font-bold text-white transition hover:bg-[#075ce5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/20">
              {copy.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={contactHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] border border-[#b9c7dc] bg-white px-5 text-sm font-bold text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/16">
              {copy.secondaryCta}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-6 max-w-full text-sm font-semibold leading-6 text-[#667085] sm:max-w-2xl">{copy.audience}</p>
        </div>
        <DashboardVisual copy={copy} />
      </div>
    </section>
  )
}

function DashboardVisual({ copy }: { copy: BusinessCopy }) {
  return (
    <div className="relative min-w-0 max-w-[min(350px,calc(100vw-40px))] overflow-hidden sm:max-w-full">
      <div className="absolute -left-10 top-12 hidden h-28 w-28 rounded-full bg-[#0866ff]/10 blur-3xl lg:block" />
      <div className="business-float relative max-w-full overflow-hidden rounded-[8px] border border-[#d8e2f1] bg-white p-3 shadow-[0_28px_90px_rgba(16,24,40,.14)]">
        <div className="rounded-[8px] border border-[#e8edf5] bg-[#f8fbff] p-4">
          <div className="flex items-center justify-between border-b border-[#e3e9f3] pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#667085]">Autorell Control</p>
              <p className="mt-1 text-2xl font-bold tracking-[-.035em]">{copy.dashboardTitle}</p>
            </div>
            <span className="rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-bold text-[#0866ff]">Live</span>
          </div>
          <div className="grid gap-3 py-4 sm:grid-cols-4">
            {[
              [copy.liveLabel, '184'],
              [copy.importedLabel, '42'],
              [copy.marketLabel, '11'],
              [copy.leadLabel, '27'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[8px] border border-[#e3e9f3] bg-white p-3">
                <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#8a96a8]">{label}</p>
                <p className="mt-2 text-2xl font-bold tracking-[-.035em]">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_220px]">
            <div className="rounded-[8px] border border-[#dfe7f2] bg-white">
              <div className="grid grid-cols-[1fr_.55fr] border-b border-[#edf1f7] px-4 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#8a96a8] sm:grid-cols-[1.2fr_.7fr_.7fr] sm:text-[11px]">
                <span>{copy.vehicleColumn}</span>
                <span>{copy.statusColumn}</span>
                <span className="hidden sm:block">{copy.marketColumn}</span>
              </div>
              {vehicleRows.slice(0, 3).map(([name, status, , market], index) => (
                <div key={name} className={`grid grid-cols-[1fr_.55fr] items-center gap-2 px-4 py-3 text-sm font-bold sm:grid-cols-[1.2fr_.7fr_.7fr] ${index === 0 ? 'business-row-live' : ''}`}>
                  <span className="min-w-0 truncate">{name}</span>
                  <span className={`w-max rounded-full px-2.5 py-1 text-xs ${index === 0 ? 'bg-[#e9f8ef] text-[#067647]' : index === 1 ? 'bg-[#fff7e8] text-[#b54708]' : 'bg-[#eef4ff] text-[#0866ff]'}`}>{status}</span>
                  <span className="hidden text-[#667085] sm:block">{market}</span>
                </div>
              ))}
            </div>
            <div className="rounded-[8px] border border-[#dfe7f2] bg-[#101828] p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#90a4c2]">CSV</p>
              <div className="mt-5 space-y-2">
                {[copy.csvUpload, copy.csvMapping, copy.csvPreview, copy.csvPublish].map((item, index) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-bold">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#0866ff] text-[11px]">{index + 1}</span>
                    {item}
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

function EuropeNetwork({ copy }: { copy: BusinessCopy }) {
  return (
    <section className="mx-auto grid max-w-[var(--autorell-page-max)] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[.72fr_1fr] lg:items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#0866ff]">{copy.networkEyebrow}</p>
        <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-[-.04em] sm:text-6xl">{copy.networkTitle}</h2>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[#5d6a7c]">{copy.networkText}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {activeMarkets.slice(0, 6).map((market) => (
            <span key={market.code} className="rounded-full border border-[#d7e3f2] bg-white px-3 py-1.5 text-xs font-bold text-[#344054]">
              {market.code} {market.name}
            </span>
          ))}
        </div>
      </div>
      <div className="relative min-h-[460px] overflow-hidden rounded-[8px] border border-[#dce5f2] bg-[#f6fbff] shadow-[0_24px_70px_rgba(16,24,40,.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_46%,rgba(8,102,255,.12),transparent_34%),linear-gradient(180deg,#ffffff,rgba(242,247,255,.84))]" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 700 470" aria-label="Autorells prioriterade marknader i Europa">
          <path d="M360 62 436 72 503 116 535 178 526 248 571 318 540 394 448 414 382 384 328 416 248 401 202 336 127 322 119 254 169 198 193 123 272 78Z" fill="#eaf3ff" stroke="#c5d9f4" strokeWidth="1.5" />
          <path d="M309 250 358 239 401 266 424 326 394 386 333 371 304 314Z" fill="#dcecff" stroke="#bfd5f0" strokeWidth="1.5" />
          <path d="M187 302 243 326 254 386 214 429 145 398 118 340Z" fill="#e9f3ff" stroke="#bfd5f0" strokeWidth="1.5" />
          <path d="M398 338 449 371 473 438 438 454 392 406Z" fill="#e5f0ff" stroke="#bfd5f0" strokeWidth="1.5" />
          <path className="business-flow-line" d="M336 84 C352 150 352 197 344 226 C393 225 451 218 501 220" fill="none" stroke="#0866ff" strokeWidth="2.4" opacity=".42" />
          <path className="business-flow-line" d="M344 226 C297 259 254 292 188 343" fill="none" stroke="#0866ff" strokeWidth="2.4" opacity=".36" />
          <path className="business-flow-line" d="M344 226 C411 275 441 313 450 380" fill="none" stroke="#0866ff" strokeWidth="2.4" opacity=".32" />
          <path className="business-flow-line" d="M344 226 C386 248 422 255 462 285" fill="none" stroke="#0866ff" strokeWidth="2.4" opacity=".34" />
        </svg>
        {activeMarkets.map((market) => (
          <div
            key={market.code}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${market.x}%`, top: `${market.y}%` }}
          >
            <span className="relative flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0866ff] opacity-25" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-[#0866ff] shadow-[0_0_0_7px_rgba(8,102,255,.10)]" />
            </span>
            <div className="mt-2 hidden min-w-[106px] rounded-[8px] border border-[#d8e4f3] bg-white/95 px-3 py-2 shadow-[0_16px_38px_rgba(16,24,40,.10)] backdrop-blur sm:block">
              <p className="text-xs font-bold text-[#101828]">{market.name}</p>
              <p className="text-[11px] font-semibold text-[#667085]">{market.code} market</p>
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 left-4 right-4 grid gap-2 rounded-[8px] border border-[#d8e4f3] bg-white/94 p-3 backdrop-blur sm:left-auto sm:right-4 sm:w-[260px]">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0866ff]">11 markets</p>
          <p className="text-sm font-semibold leading-6 text-[#344054]">Sverige, Tyskland, Frankrike, Italien, Spanien, Nederländerna, Belgien, Polen, Österrike, Danmark och Finland.</p>
        </div>
      </div>
    </section>
  )
}

function WorkflowDemo({ copy }: { copy: BusinessCopy }) {
  return (
    <section className="border-y border-[#e2e8f2] bg-[#f8fbff] px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-[var(--autorell-page-max)]">
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="rounded-[8px] border border-[#d9e4f2] bg-white p-4 shadow-[0_22px_60px_rgba(16,24,40,.08)]">
            <div className="flex items-center gap-3 rounded-[8px] bg-[#101828] p-4 text-white">
              <FileSpreadsheet className="h-5 w-5 text-[#7ab0ff]" />
              <div>
                <p className="text-sm font-bold">autorell-inventory.csv</p>
                <p className="text-xs font-semibold text-[#9fb0c8]">184 vehicles ready for review</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-5">
              {workflowSteps.map((step, index) => (
                <div key={step} className="rounded-[8px] border border-[#e1e8f1] bg-[#fbfdff] p-3 text-center">
                  <span className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-[#0866ff] text-xs font-bold text-white">{index + 1}</span>
                  <p className="mt-3 text-xs font-bold">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 overflow-hidden rounded-[8px] border border-[#e3eaf4]">
              {['BMW iX1 xDrive 30', 'Mercedes-Benz Vito', 'Volvo FH 540'].map((name, index) => (
                <div key={name} className={`grid grid-cols-[1fr_auto] items-center border-b border-[#eef2f7] px-4 py-3 text-sm last:border-b-0 ${index === 1 ? 'business-row-live' : ''}`}>
                  <span className="font-semibold">{name}</span>
                  <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#0866ff]">
                    {index === 0 ? 'Ready' : index === 1 ? 'Publishing' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="max-w-3xl text-4xl font-bold tracking-[-.04em] sm:text-6xl">{copy.workflowTitle}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5d6a7c]">{copy.workflowText}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function InventorySection({ copy }: { copy: BusinessCopy }) {
  return (
    <section className="mx-auto grid max-w-[var(--autorell-page-max)] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[.76fr_1fr] lg:items-center">
      <div>
        <Warehouse className="h-9 w-9 text-[#0866ff]" />
        <h2 className="mt-5 max-w-xl text-4xl font-bold tracking-[-.04em] sm:text-6xl">{copy.inventoryTitle}</h2>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[#5d6a7c]">{copy.inventoryText}</p>
      </div>
      <div className="overflow-hidden rounded-[8px] border border-[#dce5f2] bg-white shadow-[0_24px_70px_rgba(16,24,40,.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8edf5] p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-[8px] bg-[#edf5ff] px-3 py-2 text-xs font-bold text-[#0866ff]">{copy.bulkActions}</span>
            <span className="rounded-[8px] border border-[#d7e2f1] px-3 py-2 text-xs font-bold text-[#344054]">{copy.selectedCount}</span>
          </div>
          <button className="rounded-[8px] bg-[#0866ff] px-4 py-2 text-xs font-bold text-white" type="button">{copy.publishAction}</button>
        </div>
        <div className="grid grid-cols-3 gap-3 border-b border-[#eef2f7] bg-[#fbfdff] p-4">
          {[
            ['Aktiva', '128'],
            ['Pausade', '24'],
            ['Utkast', '32'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[8px] border border-[#e1e8f1] bg-white p-3">
              <p className="text-xs font-semibold text-[#667085]">{label}</p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        {vehicleRows.map(([name, status, price, market]) => (
          <div key={name} className="grid grid-cols-[32px_1fr] gap-3 border-b border-[#edf1f7] p-4 last:border-b-0 sm:grid-cols-[32px_1.2fr_.7fr_.7fr]">
            <span className="mt-1 h-4 w-4 rounded border border-[#b8c7dc] bg-white" />
            <div>
              <p className="font-bold">{name}</p>
              <p className="mt-1 text-sm font-semibold text-[#667085] sm:hidden">{price} | {market}</p>
            </div>
            <span className="hidden text-sm font-bold text-[#344054] sm:block">{price}</span>
            <span className="hidden text-sm font-bold text-[#667085] sm:block">{market}</span>
            <span className="col-start-2 w-max rounded-full bg-[#f2f5f9] px-3 py-1 text-xs font-bold text-[#344054] sm:col-auto">{status}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function CsvAndAnalytics({ copy }: { copy: BusinessCopy }) {
  return (
    <section className="border-y border-[#e2e8f2] bg-[#f7f9fc]">
      <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-5 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2">
        <article className="rounded-[8px] border border-[#dce5f2] bg-white p-6">
          <FileSpreadsheet className="h-8 w-8 text-[#0866ff]" />
          <h2 className="mt-5 text-3xl font-bold tracking-[-.035em] sm:text-5xl">{copy.csvTitle}</h2>
          <p className="mt-4 leading-7 text-[#5d6a7c]">{copy.csvText}</p>
          <div className="mt-6 rounded-[8px] border border-[#e4eaf3]">
            {csvRows.map(([field, value, status]) => (
              <div key={field} className="grid grid-cols-[.8fr_1fr_.8fr] border-b border-[#edf1f7] px-4 py-3 text-sm last:border-b-0">
                <span className="font-bold text-[#667085]">{field}</span>
                <span className="font-bold">{value}</span>
                <span className="text-right text-xs font-bold text-[#0866ff]">{status}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[8px] border border-[#dce5f2] bg-[#101828] p-6 text-white shadow-[0_24px_70px_rgba(16,24,40,.12)]">
          <LineChart className="h-8 w-8 text-[#7ab0ff]" />
          <h2 className="mt-5 text-3xl font-bold tracking-[-.035em] sm:text-5xl">{copy.analyticsTitle}</h2>
          <p className="mt-4 leading-7 text-[#cbd5e1]">{copy.analyticsText}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              ['Views', '18.4k'],
              ['Clicks', '842'],
              ['Leads', '126'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[8px] border border-white/10 bg-white/[.06] p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9fb0c8]">{label}</p>
                <p className="mt-2 text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 h-28 rounded-[8px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,102,255,.22),rgba(8,102,255,.04))] p-4">
            <div className="flex h-full items-end gap-2">
              {[34, 48, 42, 62, 58, 76, 88, 74].map((height, index) => (
                <span
                  key={index}
                  className="business-bar flex-1 rounded-t bg-[#7ab0ff]"
                  style={{ height: `${height}%`, animationDelay: `${index * 140}ms` }}
                />
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-[8px] border border-white/10 bg-white/[.06] p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-[#d7e3f4]">Top listing</span>
              <span className="rounded-full bg-[#0866ff] px-3 py-1 text-xs font-bold">+18%</span>
            </div>
            <p className="mt-2 text-sm font-bold">BMW iX1 xDrive 30 · Sverige</p>
          </div>
        </article>
      </div>
    </section>
  )
}

function TeamAndTypes({ copy }: { copy: BusinessCopy }) {
  return (
    <section className="mx-auto grid max-w-[var(--autorell-page-max)] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_.9fr]">
      <div className="rounded-[8px] border border-[#dce5f2] bg-white p-6">
        <Users2 className="h-8 w-8 text-[#0866ff]" />
        <h2 className="mt-5 text-3xl font-bold tracking-[-.035em] sm:text-5xl">{copy.teamTitle}</h2>
        <p className="mt-4 leading-7 text-[#5d6a7c]">{copy.teamText}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {[
            ['Administrator', 'Settings, billing, team'],
            ['Seller', 'Listings and buyer contact'],
            ['Inventory', 'Import and stock updates'],
            ['Marketing', 'Results and market view'],
          ].map(([role, detail]) => (
            <div key={role} className="flex items-start gap-3 rounded-[8px] border border-[#e4eaf3] p-4">
              <LockKeyhole className="mt-0.5 h-5 w-5 text-[#0866ff]" />
              <div>
                <p className="font-bold">{role}</p>
                <p className="mt-1 text-sm font-semibold text-[#667085]">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[8px] border border-[#dce5f2] bg-[#f8fbff] p-6">
        <Building2 className="h-8 w-8 text-[#0866ff]" />
        <h2 className="mt-5 text-3xl font-bold tracking-[-.035em]">{copy.businessTypesTitle}</h2>
        <div className="mt-7 flex flex-wrap gap-2">
          {businessTypes.map((type, index) => (
            <span key={type} className={`rounded-full border px-4 py-2 text-sm font-bold ${index === 0 ? 'border-[#0866ff] bg-[#0866ff] text-white' : 'border-[#d6e1ef] bg-white text-[#344054]'}`}>
              {type}
            </span>
          ))}
        </div>
        <div className="mt-7 rounded-[8px] border border-[#dce5f2] bg-white p-4">
          <div className="flex items-center gap-3">
            <Layers3 className="h-5 w-5 text-[#0866ff]" />
            <p className="font-bold">Vehicle categories</p>
          </div>
          <p className="mt-3 leading-7 text-[#667085]">
            Cars, vans, trucks, motorcycles, motorhomes, caravans and machines can use the same structured listing workflow.
          </p>
        </div>
      </div>
    </section>
  )
}

function ScaleAndCta({
  copy,
  createAccountHref,
  contactHref,
}: {
  copy: BusinessCopy
  createAccountHref: string
  contactHref: string
}) {
  return (
    <>
      <section className="border-y border-[#e2e8f2] bg-[#fbfcff] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[var(--autorell-page-max)]">
          <h2 className="max-w-3xl text-4xl font-bold tracking-[-.04em] sm:text-6xl">{copy.scaleTitle}</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5d6a7c]">{copy.scaleText}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['10', 'listings', 'Manual publishing'],
              ['100', 'listings', 'CSV and team workflow'],
              ['1 000+', 'listings', 'Market overview and scale'],
            ].map(([value, label, text]) => (
              <div key={value} className="rounded-[8px] border border-[#dce5f2] bg-white p-6">
                <p className="text-5xl font-bold tracking-[-.045em] text-[#0866ff]">{value}</p>
                <p className="mt-2 text-sm font-bold uppercase tracking-[.14em] text-[#667085]">{label}</p>
                <p className="mt-4 font-bold text-[#101828]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[var(--autorell-page-max)] rounded-[8px] bg-[#101828] p-8 text-white sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#7ab0ff]">Autorell Business</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-.04em] sm:text-6xl">{copy.finalTitle}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#cbd5e1]">{copy.finalText}</p>
          </div>
          <div className="mt-8 flex shrink-0 flex-wrap gap-3 lg:mt-0">
            <Link href={createAccountHref} className="inline-flex min-h-12 items-center gap-2 rounded-[8px] bg-[#0866ff] px-5 text-sm font-bold text-white transition hover:bg-[#2a7cff]">
              {copy.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={contactHref} className="inline-flex min-h-12 items-center gap-2 rounded-[8px] border border-white/25 px-5 text-sm font-bold text-white transition hover:border-white">
              {copy.contactCta}
              <MousePointerClick className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function getBusinessCopy(locale: PublicLocale): BusinessCopy {
  if (locale === 'sv' || locale === 'de' || locale === 'en') {
    return businessPageCopy[locale]
  }

  return translatePublicObject(locale, businessPageCopy.en)
}

function getRequestedLocale(headerStore: Awaited<ReturnType<typeof headers>>): PublicLocale {
  const requested = headerStore.get('x-autorell-language') || 'sv'
  return requested === 'sv' || requested === 'de' || isPublicLanguage(requested)
    ? requested
    : 'sv'
}
