import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  FileSpreadsheet,
  Globe2,
  Layers3,
  ShieldCheck,
  Store,
  Users2,
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
    metaTitle: 'Företagssida och abonnemang för fordonsföretag | Autorell',
    metaDescription:
      'Autorell Business samlar annonser, företagssida, team, import och europeisk räckvidd för professionella fordonsföretag.',
    heroEyebrow: 'Autorell Business',
    heroTitle: 'Verktyg för att driva och växa fordonsaffären. Allt på en plats.',
    heroIntro:
      'Bygg företagssida, publicera annonser, hantera säljare och nå köpare i flera europeiska marknader från samma arbetsyta.',
    primaryCta: 'Starta företagskonto',
    secondaryCta: 'Se abonnemang',
    discoverTitle: 'Upptäck lösningar som passar ert sätt att sälja.',
    discoverIntro: 'Välj det ni behöver nu och bygg vidare när lagret växer.',
    globeTitle: 'Ett europeiskt skyltfönster för ert lager.',
    globeText:
      'Autorell gör företagets annonser synliga lokalt och över marknader med rätt språk, valuta och länkar tillbaka till er företagssida.',
    stepTitle: 'Ta nästa steg.',
    faqTitle: 'Frågor? Svar.',
    allMarkets: '11 marknader',
    liveListings: 'Annonser',
    companyPage: 'Företagssida',
    cards: [
      ['Företagssida', 'Logo, adress, kontaktuppgifter och alla annonser samlade på en tydlig sida.'],
      ['Annonsflöde', 'Publicera fordon med strukturerade fält, bilder, pris och säljarkontakt.'],
      ['Team', 'Låt flera säljare arbeta i samma företagskonto med egna kontaktuppgifter.'],
      ['Import', 'Förbered större lager med CSV och kontroller innan annonser går live.'],
      ['Analys', 'Följ visningar, sparade annonser och vilka fordon som skapar intresse.'],
      ['Marknader', 'Visa rätt språk, valuta och marknadslogik för köpare i Europa.'],
    ],
    plans: [
      ['Start', 'För företag som vill komma igång med en ren företagssida och grundannonser.', 'Skapa konto'],
      ['Standard', 'För team som vill hantera fler annonser, säljare och uppföljning.', 'Se priser'],
      ['Premium', 'För växande lager med mer synlighet, struktur och prioriterad hantering.', 'Kontakta oss'],
    ],
    faqs: [
      ['Vad får företagssidan innehålla?', 'Företagssidan visar företagets logo, adress, webbplats, generella kontaktuppgifter och samlade annonser.'],
      ['Kan säljare ha egna kontaktuppgifter?', 'Ja. Annonskort och annonssidor kan visa säljarens direkta kontakt, medan företagssidan visar företagets gemensamma kontaktuppgifter.'],
      ['Fungerar Autorell i flera marknader?', 'Ja. Sidan är byggd för elva marknader med lokaliserade länkar, språk och valuta där det behövs.'],
      ['Kan vi börja enkelt?', 'Ja. Börja med Start och uppgradera när fler annonser, säljare eller importflöden behövs.'],
    ],
  },
  en: {
    metaTitle: 'Business pages and plans for vehicle companies | Autorell',
    metaDescription:
      'Autorell Business brings listings, company pages, teams, imports and European reach together for professional vehicle sellers.',
    heroEyebrow: 'Autorell Business',
    heroTitle: 'Tools to run and grow your vehicle business. All in one place.',
    heroIntro:
      'Build a company page, publish listings, manage sellers and reach buyers across European markets from one workspace.',
    primaryCta: 'Start business account',
    secondaryCta: 'View plans',
    discoverTitle: 'Discover solutions that fit the way you sell.',
    discoverIntro: 'Choose what you need now and add more when inventory grows.',
    globeTitle: 'A European showroom for your inventory.',
    globeText:
      'Autorell makes company listings visible locally and across markets with the right language, currency and links back to your company page.',
    stepTitle: 'Take the next step.',
    faqTitle: 'Questions? Answers.',
    allMarkets: '11 markets',
    liveListings: 'Listings',
    companyPage: 'Company page',
    cards: [
      ['Company page', 'Logo, address, contact details and all listings gathered on one clear page.'],
      ['Listing flow', 'Publish vehicles with structured fields, images, price and seller contact.'],
      ['Team', 'Let multiple sellers work in one business account with their own contact details.'],
      ['Import', 'Prepare larger inventory with CSV and checks before listings go live.'],
      ['Analytics', 'Track views, saved listings and which vehicles create interest.'],
      ['Markets', 'Show the right language, currency and market logic for buyers in Europe.'],
    ],
    plans: [
      ['Start', 'For companies that want a clean company page and basic listings.', 'Create account'],
      ['Standard', 'For teams that need more listings, sellers and follow-up.', 'View pricing'],
      ['Premium', 'For growing inventory with more visibility, structure and priority handling.', 'Contact us'],
    ],
    faqs: [
      ['What does the company page include?', 'The company page shows logo, address, website, general contact details and all published listings.'],
      ['Can sellers use their own contact details?', 'Yes. Listing cards and listing pages can show the direct seller contact while the company page shows company-wide details.'],
      ['Does Autorell work across markets?', 'Yes. The page is built for eleven markets with localized links, language and currency where needed.'],
      ['Can we start simple?', 'Yes. Start with the basic plan and upgrade when more listings, sellers or import flows are needed.'],
    ],
  },
  de: {
    metaTitle: 'Unternehmensseiten und Pläne für Fahrzeugfirmen | Autorell',
    metaDescription:
      'Autorell Business bündelt Anzeigen, Unternehmensseiten, Teams, Import und europäische Reichweite für professionelle Fahrzeugverkäufer.',
    heroEyebrow: 'Autorell Business',
    heroTitle: 'Werkzeuge, um Ihr Fahrzeuggeschäft zu führen und zu erweitern. Alles an einem Ort.',
    heroIntro:
      'Erstellen Sie eine Unternehmensseite, veröffentlichen Sie Anzeigen, verwalten Sie Verkäufer und erreichen Sie Käufer in europäischen Märkten.',
    primaryCta: 'Unternehmenskonto starten',
    secondaryCta: 'Pläne ansehen',
    discoverTitle: 'Lösungen für Ihre Verkaufsweise.',
    discoverIntro: 'Starten Sie mit dem, was Sie brauchen, und erweitern Sie bei wachsendem Bestand.',
    globeTitle: 'Ein europäisches Schaufenster für Ihren Bestand.',
    globeText:
      'Autorell zeigt Unternehmensanzeigen lokal und marktübergreifend mit passender Sprache, Währung und Links zur Unternehmensseite.',
    stepTitle: 'Der nächste Schritt.',
    faqTitle: 'Fragen? Antworten.',
    allMarkets: '11 Märkte',
    liveListings: 'Anzeigen',
    companyPage: 'Unternehmensseite',
    cards: [
      ['Unternehmensseite', 'Logo, Adresse, Kontaktdaten und alle Anzeigen auf einer klaren Seite.'],
      ['Anzeigenfluss', 'Fahrzeuge mit strukturierten Feldern, Bildern, Preis und Verkäuferkontakt veröffentlichen.'],
      ['Team', 'Mehrere Verkäufer arbeiten in einem Unternehmenskonto mit eigenen Kontaktdaten.'],
      ['Import', 'Größere Bestände per CSV vorbereiten und prüfen, bevor Anzeigen live gehen.'],
      ['Analyse', 'Ansichten, gespeicherte Anzeigen und interessierte Fahrzeuge verfolgen.'],
      ['Märkte', 'Passende Sprache, Währung und Marktlogik für Käufer in Europa zeigen.'],
    ],
    plans: [
      ['Start', 'Für Unternehmen mit sauberer Unternehmensseite und Basisanzeigen.', 'Konto erstellen'],
      ['Standard', 'Für Teams mit mehr Anzeigen, Verkäufern und Auswertung.', 'Preise ansehen'],
      ['Premium', 'Für wachsende Bestände mit mehr Sichtbarkeit, Struktur und Priorität.', 'Kontakt aufnehmen'],
    ],
    faqs: [
      ['Was enthält die Unternehmensseite?', 'Die Unternehmensseite zeigt Logo, Adresse, Website, allgemeine Kontaktdaten und alle Anzeigen.'],
      ['Können Verkäufer eigene Kontaktdaten nutzen?', 'Ja. Anzeigen können den direkten Verkäuferkontakt zeigen, während die Unternehmensseite allgemeine Unternehmensdaten zeigt.'],
      ['Funktioniert Autorell in mehreren Märkten?', 'Ja. Die Seite ist für elf Märkte mit lokalisierten Links, Sprache und Währung gebaut.'],
      ['Können wir einfach starten?', 'Ja. Starten Sie mit dem Basispaket und erweitern Sie bei mehr Anzeigen, Verkäufern oder Importbedarf.'],
    ],
  },
} as const

type BusinessCopy = (typeof businessPageCopy)[keyof typeof businessPageCopy]

const solutionIcons = [Store, Layers3, Users2, FileSpreadsheet, BarChart3, Globe2]

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
  const registerHref = localizePublicHref(locale, '/register?account=business')
  const pricingHref = localizePublicHref(locale, '/pricing#business')
  const contactHref = localizePublicHref(locale, '/contact')

  return (
    <main className="overflow-x-hidden bg-white text-[#101828]">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .business-orbit {
            animation: businessOrbit 18s linear infinite;
            transform-origin: 50% 50%;
          }
          .business-card-drift {
            animation: businessCardDrift 8s ease-in-out infinite;
          }
          .business-metric-line {
            animation: businessMetricLine 4.8s ease-in-out infinite;
          }
        }
        @keyframes businessOrbit {
          to { transform: rotate(360deg); }
        }
        @keyframes businessCardDrift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes businessMetricLine {
          0%, 100% { transform: scaleY(.55); opacity: .55; }
          45% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
      <PublicHeader locale={locale} marketCode={marketCode} />
      <AppleHero copy={copy} registerHref={registerHref} pricingHref={pricingHref} />
      <SolutionScroller copy={copy} />
      <EuropeGlobe copy={copy} />
      <NextStep copy={copy} registerHref={registerHref} pricingHref={pricingHref} contactHref={contactHref} />
      <BusinessFaq copy={copy} />
      <PublicFooter locale={locale} />
    </main>
  )
}

function AppleHero({
  copy,
  registerHref,
  pricingHref,
}: {
  copy: BusinessCopy
  registerHref: string
  pricingHref: string
}) {
  return (
    <section className="min-h-[600px] overflow-hidden border-b border-[#e5e7eb] bg-white px-5 py-10 sm:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="grid min-h-[420px] w-full overflow-hidden rounded-[8px] bg-[#eef8fb] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative z-10 flex min-w-0 flex-col justify-center px-7 py-10 sm:px-10 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#0866ff]">{copy.heroEyebrow}</p>
            <h1 className="mt-4 w-full max-w-[300px] text-[32px] font-bold leading-[1.04] tracking-[-.02em] text-[#101828] sm:max-w-[520px] sm:text-[46px] lg:text-[54px]">
              {copy.heroTitle}
            </h1>
            <p className="mt-5 w-full max-w-[300px] text-base leading-7 text-[#475467] sm:max-w-[500px] sm:text-lg">{copy.heroIntro}</p>
            <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href={registerHref}
                className="inline-flex min-h-11 items-center rounded-full bg-[#0866ff] px-5 text-sm font-semibold text-white transition hover:bg-[#0057df]"
              >
                {copy.primaryCta}
              </Link>
              <Link
                href={pricingHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0866ff] ring-1 ring-[#c9d8ee] transition hover:ring-[#0866ff]"
              >
                {copy.secondaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <DeviceMockup copy={copy} />
        </div>
      </div>
    </section>
  )
}

function DeviceMockup({ copy }: { copy: BusinessCopy }) {
  return (
    <div className="relative min-w-0 overflow-hidden min-h-[380px] lg:min-h-[520px]">
      <div className="absolute left-8 top-10 h-[330px] w-[520px] rotate-[-6deg] rounded-[24px] border-[10px] border-[#1d2939] bg-[#0f172a] shadow-[0_34px_90px_rgba(16,24,40,.24)] sm:left-auto sm:right-4 sm:h-[360px] sm:w-[640px] lg:right-[-22px] lg:top-16">
        <div className="h-full overflow-hidden rounded-[14px] bg-white">
          <div className="flex h-10 items-center gap-2 border-b border-[#e8eef6] bg-[#f8fbff] px-5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-4 h-4 w-40 rounded-full bg-[#e8eef6]" />
          </div>
          <div className="grid h-[calc(100%-40px)] grid-cols-[150px_1fr]">
            <aside className="border-r border-[#e8eef6] bg-[#fbfcff] p-4">
              <div className="h-7 w-24 rounded bg-[#0866ff]" />
              <div className="mt-8 space-y-3">
                {[72, 92, 64, 84].map((width) => (
                  <span key={width} className="block h-3 rounded-full bg-[#dce6f4]" style={{ width }} />
                ))}
              </div>
            </aside>
            <div className="p-5">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#667085]">{copy.companyPage}</p>
                  <div className="mt-2 h-7 w-64 rounded bg-[#111827]" />
                </div>
                <div className="rounded-full bg-[#eaf2ff] px-4 py-2 text-sm font-semibold text-[#0866ff]">
                  {copy.allMarkets}
                </div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[copy.liveListings, 'Team', 'Leads'].map((label, index) => (
                  <div key={label} className="rounded-[8px] border border-[#dce6f4] bg-white p-4">
                    <div className="h-8 w-12 rounded bg-[#eaf2ff]" />
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[.12em] text-[#667085]">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-[#101828]">{[184, 8, 42][index]}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[8px] border border-[#dce6f4] bg-[#fbfdff] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="h-3 w-32 rounded bg-[#cbd7ea]" />
                  <span className="h-7 w-24 rounded-full bg-[#0866ff]" />
                </div>
                {[64, 82, 48].map((height, index) => (
                  <div key={height} className="mb-3 grid grid-cols-[64px_1fr_72px] items-center gap-3 last:mb-0">
                    <span className="h-11 rounded bg-[#e7eef8]" />
                    <span className="h-3 rounded-full bg-[#cbd7ea]" />
                    <span className="business-metric-line h-10 origin-bottom rounded-t bg-[#0866ff]" style={{ animationDelay: `${index * 180}ms`, height }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="business-card-drift absolute bottom-8 right-6 h-[250px] w-[176px] rotate-[4deg] rounded-[28px] border-[9px] border-[#1d2939] bg-[#0f172a] shadow-[0_26px_70px_rgba(16,24,40,.22)] sm:right-8 sm:h-[260px] sm:w-[190px] lg:right-24">
        <div className="h-full overflow-hidden rounded-[18px] bg-white p-4">
          <div className="mx-auto h-5 w-20 rounded-full bg-[#e8eef6]" />
          <div className="mt-6 h-20 rounded-[8px] bg-[#eaf2ff]" />
          <div className="mt-4 h-5 w-28 rounded bg-[#101828]" />
          <div className="mt-3 h-3 w-32 rounded bg-[#cbd7ea]" />
          <div className="mt-6 space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-[8px] border border-[#e5edf7] p-2">
                <span className="h-8 w-8 rounded bg-[#eef4fb]" />
                <span className="h-3 flex-1 rounded bg-[#cbd7ea]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SolutionScroller({ copy }: { copy: BusinessCopy }) {
  return (
    <section className="bg-white px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="w-full max-w-[330px] sm:max-w-[360px]">
          <h2 className="text-3xl font-semibold leading-tight tracking-[-.015em] text-[#101828] sm:text-4xl">{copy.discoverTitle}</h2>
          <p className="mt-3 text-base leading-7 text-[#667085]">{copy.discoverIntro}</p>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {copy.cards.slice(0, 4).map(([title]) => (
            <span key={title} className="shrink-0 rounded-full bg-[#f2f4f7] px-4 py-2 text-xs font-semibold text-[#101828]">
              {title}
            </span>
          ))}
        </div>
        <div className="mt-10 flex w-full max-w-full gap-6 overflow-x-auto pb-8 [scrollbar-width:thin]">
          {copy.cards.map(([title, text], index) => {
            const Icon = solutionIcons[index] || Store
            return (
              <article key={title} className="w-[245px] shrink-0 snap-start text-center">
                <div className="mx-auto flex h-[112px] w-[150px] items-center justify-center rounded-[8px] bg-[#f5f8fc]">
                  <Icon className="h-11 w-11 text-[#0866ff]" strokeWidth={1.7} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#101828]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function EuropeGlobe({ copy }: { copy: BusinessCopy }) {
  return (
    <section className="border-y border-[#e5e7eb] bg-[#f5f5f7] px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid w-full max-w-[1120px] items-center gap-12 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#0866ff]">Europe</p>
          <h2 className="mt-4 w-full max-w-[330px] text-4xl font-semibold leading-[1.03] tracking-[-.02em] sm:max-w-[540px] sm:text-6xl">{copy.globeTitle}</h2>
          <p className="mt-5 w-full max-w-[330px] text-lg leading-8 text-[#475467] sm:max-w-[520px]">{copy.globeText}</p>
        </div>
        <div className="relative mx-auto flex aspect-square w-full max-w-[340px] items-center justify-center sm:max-w-[520px]">
          <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_38%_30%,#ffffff_0,#dff0ff_22%,#72b4ff_58%,#0866ff_100%)] shadow-[inset_-28px_-34px_60px_rgba(16,24,40,.18),0_32px_80px_rgba(8,102,255,.18)]" />
          <div className="business-orbit absolute inset-[13%] rounded-full border border-white/70" />
          <div className="business-orbit absolute inset-[20%] rounded-full border border-white/45" style={{ animationDuration: '24s' }} />
          <div className="absolute h-[76%] w-[1px] rounded-full bg-white/55" />
          <div className="absolute h-[1px] w-[76%] rounded-full bg-white/55" />
          <svg className="relative h-[72%] w-[72%]" viewBox="0 0 320 320" aria-label="Europe map">
            <path d="M124 56l31 8 18 25 37 4 17 30-11 38 22 28-18 37-41 9-31 29-42-18-12-41-34-22 12-45-19-31 38-19z" fill="rgba(255,255,255,.68)" />
            <path d="M148 91l31 10 12 29-19 18 9 28-25 22-31-12-4-29-24-18 17-28z" fill="rgba(255,255,255,.78)" />
            {[
              [128, 88, 'SE'],
              [126, 125, 'DE'],
              [166, 123, 'PL'],
              [104, 143, 'FR'],
              [88, 191, 'ES'],
            ].map(([cx, cy, code]) => (
              <g key={code as string}>
                <circle cx={cx as number} cy={cy as number} r="9" fill="#0866ff" />
                <text x={cx as number} y={(cy as number) + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">
                  {code}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  )
}

function NextStep({
  copy,
  registerHref,
  pricingHref,
  contactHref,
}: {
  copy: BusinessCopy
  registerHref: string
  pricingHref: string
  contactHref: string
}) {
  const hrefs = [registerHref, pricingHref, contactHref]

  return (
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[1120px]">
        <h2 className="text-3xl font-semibold tracking-[-.015em] text-[#101828]">{copy.stepTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.plans.map(([title, text, cta], index) => (
            <Link
              key={title}
              href={hrefs[index]}
              className="group rounded-[8px] bg-[#f5f5f7] p-6 transition hover:bg-[#eef5ff]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-white text-[#0866ff]">
                {[ShieldCheck, Layers3, ArrowRight].map((Icon, iconIndex) =>
                  iconIndex === index ? <Icon key={title} className="h-5 w-5" /> : null,
                )}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[#101828]">{title}</h3>
              <p className="mt-2 min-h-[72px] text-sm leading-6 text-[#667085]">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0866ff]">
                {cta}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function BusinessFaq({ copy }: { copy: BusinessCopy }) {
  return (
    <section className="bg-[#f5f5f7] px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-[1120px]">
        <h2 className="text-3xl font-semibold tracking-[-.015em] text-[#101828]">{copy.faqTitle}</h2>
        <div className="mt-8 divide-y divide-[#d7dbe3]">
          {copy.faqs.map(([question, answer]) => (
            <details key={question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-semibold text-[#101828]">
                {question}
                <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" />
              </summary>
              <p className="max-w-[820px] pb-6 text-base leading-7 text-[#667085]">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
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
