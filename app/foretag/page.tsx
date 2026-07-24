import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Check,
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
      <PublicHeader locale={locale} marketCode={marketCode} />
      <AppleHero copy={copy} pricingHref={pricingHref} />
      <BusinessInsights copy={copy} />
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
        <div className="relative isolate grid min-h-[520px] w-full overflow-hidden rounded-[30px] bg-[#eef6ff] lg:grid-cols-[0.78fr_1.22fr]">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_52%,rgba(8,102,255,.09)_0,rgba(8,102,255,.09)_28%,transparent_29%),radial-gradient(circle_at_14%_52%,rgba(8,102,255,.055)_0,rgba(8,102,255,.055)_36%,transparent_37%),radial-gradient(circle_at_29%_52%,rgba(8,102,255,.032)_0,rgba(8,102,255,.032)_43%,transparent_44%)]" />
          <div className="relative z-10 flex min-w-0 flex-col justify-center px-7 py-10 sm:px-10 lg:px-12">
            <div className="inline-flex w-max flex-col items-end">
              <BrandLogo underline={false} />
              <p className="mt-0.5 w-full text-right text-[12px] font-semibold leading-none tracking-[-.01em] text-[#101828] sm:text-[14px]">{copy.heroEyebrow.replace('Autorell ', '')}</p>
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
    <div className="relative min-h-[260px] min-w-0 overflow-hidden sm:min-h-[330px] lg:min-h-[520px]">
      <Image
        src="/business-responsive-mockup.webp"
        alt=""
        width={1920}
        height={1080}
        priority
        className="relative left-1/2 mt-2 w-[455px] max-w-none -translate-x-1/2 object-contain min-[430px]:w-[520px] sm:w-[640px] lg:absolute lg:bottom-[-76px] lg:left-auto lg:right-[-230px] lg:top-auto lg:mt-0 lg:w-[980px] lg:translate-x-0 xl:right-[-260px] xl:w-[1040px]"
      />
    </div>
  )
}

function BusinessInsights({ copy }: { copy: BusinessCopy }) {
  const icons = [Store, Layers3, Users2, FileSpreadsheet, BarChart3, Globe2]

  return (
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="flex max-w-[330px] flex-col gap-3 sm:max-w-[660px]">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#0866ff]">Autorell Business</p>
          <h2 className="text-[34px] font-semibold leading-tight tracking-[-.018em] text-[#101828] sm:text-5xl">{copy.discoverTitle}</h2>
          <p className="max-w-[560px] text-base leading-7 text-[#667085]">{copy.discoverIntro}</p>
        </div>

        <div className="mt-10 flex gap-5 overflow-x-auto pb-6 pr-8 [scrollbar-width:thin]">
          {copy.cards.map(([title, text], index) => {
            const Icon = icons[index] || Store
            return (
              <article
                key={title}
                className="group flex min-h-[300px] w-[275px] shrink-0 snap-start flex-col rounded-[20px] border border-[#e1e7f0] bg-[#f5f8fc] p-6 transition hover:-translate-y-1 hover:border-[#0866ff] hover:bg-[#eef6ff]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white text-[#0866ff] shadow-[0_10px_30px_rgba(16,24,40,.06)]">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <h3 className="mt-8 text-2xl font-semibold tracking-[-.018em] text-[#101828]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">{text}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-7 text-sm font-semibold text-[#0866ff]">
                  Läs mer
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </article>
            )
          })}
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
  const plans = [
    {
      name: 'Starter',
      audience: 'Small dealers',
      price: '499 kr',
      period: '/mån',
      limit: '25 aktiva annonser',
      text: 'För mindre lager som behöver företagssida och ett mer professionellt annonsflöde.',
      href: registerHref,
      cta: 'Skapa konto',
      features: ['Företagssida Basic', 'Logo och kontaktväg', 'Standardförfrågningar'],
    },
    {
      name: 'Growth',
      audience: 'Growing team',
      price: '999 kr',
      period: '/mån',
      limit: '100 aktiva annonser',
      text: 'För företag där flera säljare arbetar i samma konto och publicerar löpande.',
      href: pricingHref,
      cta: 'Se priser',
      recommended: true,
      features: ['Företagssida Plus', '10 teamkonton', 'Roller för säljare'],
    },
    {
      name: 'Professional',
      audience: 'High volume',
      price: '1 999 kr',
      period: '/mån',
      limit: '500 aktiva annonser',
      text: 'För större lager med hög volym, fler säljare och bättre uppföljning.',
      href: pricingHref,
      cta: 'Jämför plan',
      features: ['Företagssida Pro', '50+ teamkonton', 'Rapporter och export'],
    },
    {
      name: 'Enterprise',
      audience: 'Tailored',
      price: 'Anpassat',
      period: '',
      limit: 'Anpassad kvot',
      text: 'För importörer, kedjor och operatörer med särskilda behov för volym och process.',
      href: contactHref,
      cta: 'Kontakta oss',
      features: ['Avancerad företagssida', 'Utökat team', 'Enterprise-support'],
    },
  ]

  return (
    <section className="overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="flex flex-col gap-3 sm:max-w-[620px]">
          <h2 className="text-4xl font-semibold leading-tight tracking-[-.018em] text-[#101828] sm:text-5xl">{copy.stepTitle}</h2>
          <p className="max-w-[330px] text-base leading-7 text-[#667085] sm:max-w-[620px]">Välj plan efter lager, team och hur många annonser ni vill ha aktiva samtidigt.</p>
        </div>
        <div className="mt-10 flex gap-5 overflow-x-auto pb-6 pr-8 [scrollbar-width:thin]">
          {plans.map((plan) => (
            <Link
              key={plan.name}
              href={plan.href}
              className={`group flex min-h-[430px] w-[300px] shrink-0 snap-start flex-col rounded-[18px] border p-6 transition hover:-translate-y-1 hover:border-[#0866ff] hover:bg-[#f7fbff] sm:w-[320px] ${
                plan.recommended ? 'border-[#0866ff] bg-[#f4f8ff]' : 'border-[#e1e7f0] bg-[#f5f5f7]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-[#0866ff]">
                  {plan.recommended ? <Layers3 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </div>
                {plan.recommended ? (
                  <span className="rounded-full border border-[#0866ff] bg-white px-3 py-1 text-[11px] font-semibold text-[#0866ff]">Rekommenderad</span>
                ) : null}
              </div>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[.14em] text-[#667085]">{plan.audience}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-.02em] text-[#101828]">{plan.name}</h3>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-[34px] font-semibold leading-none tracking-[-.04em] text-[#101828]">{plan.price}</span>
                <span className="pb-1 text-sm font-semibold text-[#667085]">{plan.period}</span>
              </div>
              <p className="mt-3 rounded-[10px] border border-[#d8e3f2] bg-white px-3 py-2 text-sm font-semibold text-[#344054]">{plan.limit}</p>
              <p className="mt-4 max-w-full text-sm leading-6 text-[#667085]">{plan.text}</p>
              <ul className="mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[#344054]">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#eaf2ff] text-[#0866ff]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-semibold text-[#0866ff]">
                {plan.cta}
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
  const extendedFaqs = [
    ...copy.faqs,
    ['Vilken plan passar mindre handlare?', 'Starter passar företag som vill ha en professionell företagssida och upp till 25 aktiva annonser utan ett större teamflöde.'],
    ['När behöver vi Growth?', 'Growth passar när flera säljare ska arbeta i samma konto, när lagret växer och när upp till 100 aktiva annonser behövs.'],
    ['Vad är skillnaden med Professional?', 'Professional är för större lager med upp till 500 aktiva annonser, fler teamkonton, rapporter, export och prioriterad hantering.'],
    ['Finns Enterprise för kedjor och importörer?', 'Ja. Enterprise anpassas för större aktörer med särskilda behov kring volym, import, process, support och presentation.'],
  ] as const

  return (
    <section className="border-t border-[#e5e7eb] bg-[#f5f5f7] px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1260px]">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-4xl font-semibold tracking-[-.02em] text-[#101828] sm:text-5xl">{copy.faqTitle}</h2>
          <span className="hidden text-sm font-medium text-[#0866ff] sm:inline">Expandera alla</span>
        </div>
        <div className="mt-14 divide-y divide-[#d0d5dd]">
          {extendedFaqs.map(([question, answer]) => (
            <details key={question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-xl font-semibold tracking-[-.012em] text-[#1d1d1f] sm:text-2xl">
                {question}
                <ChevronDown className="h-7 w-7 shrink-0 text-[#86868b] transition group-open:rotate-180" />
              </summary>
              <p className="max-w-[920px] pb-8 text-base leading-8 text-[#515966] sm:text-lg">{answer}</p>
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
