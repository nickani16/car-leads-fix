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
import BrandLogo from '@/app/components/BrandLogo'
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
    heroTitle: 'Företag, annonser, import och analys. Allt på en plats.',
    heroIntro:
      'Samla företagssida, lagerflöde, säljare och marknadsdata i en arbetsyta byggd för professionell fordonsförsäljning.',
    primaryCta: 'Starta företagskonto',
    secondaryCta: 'Se abonnemang',
    learnMoreCta: 'Läs mer',
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
    heroTitle: 'Business, listings, imports and analytics. All in one place.',
    heroIntro:
      'Bring company pages, inventory flows, sellers and market data into one workspace built for professional vehicle sales.',
    primaryCta: 'Start business account',
    secondaryCta: 'View plans',
    learnMoreCta: 'Learn more',
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
    heroTitle: 'Unternehmen, Anzeigen, Import und Analyse. Alles an einem Ort.',
    heroIntro:
      'Bündeln Sie Unternehmensseite, Bestand, Verkäufer und Marktdaten in einer Arbeitsfläche für professionellen Fahrzeugverkauf.',
    primaryCta: 'Unternehmenskonto starten',
    secondaryCta: 'Pläne ansehen',
    learnMoreCta: 'Mehr erfahren',
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
      <AppleHero copy={copy} pricingHref={pricingHref} />
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
  pricingHref,
}: {
  copy: BusinessCopy
  pricingHref: string
}) {
  return (
    <section className="min-h-[600px] overflow-hidden border-b border-[#e5e7eb] bg-white px-5 py-10 sm:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="grid min-h-[420px] w-full overflow-hidden rounded-[8px] bg-[#eef8fb] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative z-10 flex min-w-0 flex-col justify-center px-7 py-10 sm:px-10 lg:px-12">
            <div className="inline-flex w-max flex-col items-start">
              <BrandLogo compact underline={false} />
              <p className="mt-0.5 w-full text-center text-[14px] font-semibold leading-none tracking-[-.01em] text-[#101828]">{copy.heroEyebrow.replace('Autorell ', '')}</p>
            </div>
            <h1 className="mt-4 w-full max-w-[290px] text-[29px] font-semibold leading-[1.08] tracking-[-.018em] text-[#101828] sm:max-w-[540px] sm:text-[40px] lg:text-[44px]">
              {copy.heroTitle}
            </h1>
            <p className="mt-5 w-full max-w-[360px] text-base leading-7 text-[#475467] sm:max-w-[500px]">{copy.heroIntro}</p>
            <div className="mt-6">
              <Link
                href={pricingHref}
                className="inline-flex items-center gap-1.5 text-[17px] font-medium text-[#0866ff] transition hover:text-[#0057df]"
              >
                {copy.learnMoreCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <HeroImageSlot />
        </div>
      </div>
    </section>
  )
}

function HeroImageSlot() {
  return (
    <div className="relative hidden min-h-[420px] min-w-0 overflow-hidden lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_50%,rgba(210,236,240,.9)_0,rgba(210,236,240,.9)_28%,transparent_29%),radial-gradient(circle_at_28%_50%,rgba(226,243,245,.72)_0,rgba(226,243,245,.72)_34%,transparent_35%),radial-gradient(circle_at_43%_50%,rgba(242,246,250,.95)_0,rgba(242,246,250,.95)_39%,transparent_40%)]" />
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
