import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import {
  ArrowRight,
  BarChart3,
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
import BusinessPilotPromo from '@/app/business/pilot/BusinessPilotPromo'
import BusinessFaqClient from './BusinessFaqClient'
import { getBusinessPilotCopy } from '@/lib/business-pilot-i18n'
import { isBusinessFeatureEnabled } from '@/lib/business-feature-flags'
import { getBusinessPlanCopy, type BusinessPlanCopy } from '@/lib/business-plan-i18n'
import {
  isPublicLanguage,
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { cleanSeoText } from '@/lib/market-seo'

const businessPageCopy = {
  sv: {
    metaTitle: 'Företagslösningar för fordonsföretag | Autorell',
    metaDescription:
      'Autorells företagslösningar samlar lagerflöde, team, import och europeisk räckvidd för professionella fordonsföretag.',
    heroEyebrow: 'Autorell för företag',
    heroTitle: 'Lager, team och annonser. Allt på en plats.',
    heroIntro:
      'Samla lagerflöde, säljare, import och marknadsdata i en arbetsyta byggd för professionell fordonsförsäljning.',
    primaryCta: 'Starta företagskonto',
    secondaryCta: 'Se abonnemang',
    learnMoreCta: 'Läs mer',
    discoverTitle: 'Insikter och verktyg för företag som säljer fordon.',
    discoverIntro: 'Samla företagets lager, säljare, kontaktvägar och marknadsdata i ett flöde som går att växa med.',
    globeTitle: 'Ett europeiskt skyltfönster för ert lager.',
    globeText:
      'Autorell gör företagets annonser synliga lokalt och över marknader med rätt språk, valuta och länkar tillbaka till er företagssida.',
    stepTitle: 'Ta nästa steg.',
    faqTitle: 'Frågor? Svar.',
    allMarkets: '11 marknader',
    liveListings: 'Annonser',
    companyPage: 'Företagslösningar',
    cards: [
      ['Företagsprofil', 'Visa varumärke, adress, allmän kontakt, karta och hela lagret på en samlad företagssida.'],
      ['Annonskvalitet', 'Strukturerade fält, bilder, pris, tekniska data och säljarkontakt gör varje annons lättare att jämföra.'],
      ['Säljarteam', 'Låt varje säljare få egna leads och kontaktuppgifter medan företaget behåller en gemensam profil.'],
      ['Lagerimport', 'Förbered många fordon med CSV, kontroller och granskningsflöde innan annonser publiceras.'],
      ['Lead-insikter', 'Följ intresse via visningar, sparade annonser, kontaktstarter och vilka fordon som driver efterfrågan.'],
      ['Marknadsnärvaro', 'Anpassa språk, valuta och marknadslänkar så köpare i Europa möter rätt information direkt.'],
    ],
    plans: [
      ['Start', 'För handlare som vill komma igång med en ren dealer-profil och grundannonser.', 'Skapa konto'],
      ['Standard', 'För team som vill hantera fler annonser, säljare och uppföljning.', 'Se priser'],
      ['Premium', 'För växande lager med mer synlighet, struktur och prioriterad hantering.', 'Kontakta oss'],
    ],
    faqs: [
      ['Vad ingår i företagslösningarna?', 'Företagslösningarna visar företagets logotyp, adress, webbplats, allmänna kontaktuppgifter och samlade annonser.'],
      ['Kan säljare ha egna kontaktuppgifter?', 'Ja. Annonskort och annonssidor kan visa säljarens direkta kontakt, medan företagssidan visar företagets gemensamma kontaktuppgifter.'],
      ['Fungerar Autorell i flera marknader?', 'Ja. Sidan är byggd för elva marknader med lokaliserade länkar, språk och valuta där det behövs.'],
      ['Kan vi börja enkelt?', 'Ja. Börja med Start och uppgradera när fler annonser, säljare eller importflöden behövs.'],
    ],
  },
  en: {
    metaTitle: 'Dealer solutions for vehicle companies | Autorell',
    metaDescription:
      'Autorell Dealer solutions brings inventory flows, teams, imports and European reach together for professional vehicle sellers.',
    heroEyebrow: 'Autorell Dealer solutions',
    heroTitle: 'Dealer solutions for inventory, teams and listings. All in one place.',
    heroIntro:
      'Bring inventory flows, sellers, imports and market data into one workspace built for professional vehicle sales.',
    primaryCta: 'Start business account',
    secondaryCta: 'View plans',
    learnMoreCta: 'Learn more',
    discoverTitle: 'Insights and tools for companies selling vehicles.',
    discoverIntro: 'Bring inventory, sellers, contact routes and market data into one flow that can grow with the business.',
    globeTitle: 'A European showroom for your inventory.',
    globeText:
      'Autorell makes company listings visible locally and across markets with the right language, currency and links back to your company page.',
    stepTitle: 'Take the next step.',
    faqTitle: 'Questions? Answers.',
    allMarkets: '11 markets',
    liveListings: 'Listings',
    companyPage: 'Dealer solutions',
    cards: [
      ['Company profile', 'Show brand, address, general contact, map and full inventory on one company page.'],
      ['Listing quality', 'Structured fields, images, price, technical data and seller contact make each listing easier to compare.'],
      ['Seller teams', 'Give each seller direct leads and contact details while the company keeps one shared profile.'],
      ['Inventory import', 'Prepare many vehicles with CSV, checks and review flow before listings are published.'],
      ['Lead insights', 'Track interest through views, saved listings, contact starts and which vehicles drive demand.'],
      ['Market presence', 'Adapt language, currency and market links so buyers in Europe see the right information immediately.'],
    ],
    plans: [
      ['Start', 'For dealers that want a clean dealer profile and basic listings.', 'Create account'],
      ['Standard', 'For teams that need more listings, sellers and follow-up.', 'View pricing'],
      ['Premium', 'For growing inventory with more visibility, structure and priority handling.', 'Contact us'],
    ],
    faqs: [
      ['What does Dealer solutions include?', 'Dealer solutions shows logo, address, website, general contact details and all published listings.'],
      ['Can sellers use their own contact details?', 'Yes. Listing cards and listing pages can show the direct seller contact while the company page shows company-wide details.'],
      ['Does Autorell work across markets?', 'Yes. The page is built for eleven markets with localized links, language and currency where needed.'],
      ['Can we start simple?', 'Yes. Start with the basic plan and upgrade when more listings, sellers or import flows are needed.'],
    ],
  },
  de: {
    metaTitle: 'Händlerlösungen für Fahrzeugfirmen | Autorell',
    metaDescription:
      'Autorell bündelt Bestand, Teams, Import und europäische Reichweite für professionelle Fahrzeugverkäufer.',
    heroEyebrow: 'Autorell für Unternehmen',
    heroTitle: 'Bestand, Teams und Anzeigen. Alles an einem Ort.',
    heroIntro:
      'Bündeln Sie Bestand, Verkäufer, Import und Marktdaten in einer Arbeitsfläche für professionellen Fahrzeugverkauf.',
    primaryCta: 'Unternehmenskonto starten',
    secondaryCta: 'Pläne ansehen',
    learnMoreCta: 'Mehr erfahren',
    discoverTitle: 'Einblicke und Werkzeuge für Unternehmen im Fahrzeugverkauf.',
    discoverIntro: 'Bündeln Sie Bestand, Verkäufer, Kontaktwege und Marktdaten in einem Ablauf, der mit dem Unternehmen wächst.',
    globeTitle: 'Ein europäisches Schaufenster für Ihren Bestand.',
    globeText:
      'Autorell zeigt Dealer-Anzeigen lokal und marktübergreifend mit passender Sprache, Währung und Links zur Dealer-Präsenz.',
    stepTitle: 'Der nächste Schritt.',
    faqTitle: 'Fragen? Antworten.',
    allMarkets: '11 Märkte',
    liveListings: 'Anzeigen',
    companyPage: 'Händlerlösungen',
    cards: [
      ['Unternehmensprofil', 'Marke, Adresse, allgemeine Kontaktdaten, Karte und gesamten Bestand auf einer Unternehmensseite zeigen.'],
      ['Anzeigenqualität', 'Strukturierte Felder, Bilder, Preis, technische Daten und Verkäuferkontakt machen Anzeigen vergleichbarer.'],
      ['Verkäuferteams', 'Jeder Verkäufer erhält direkte Leads und Kontaktdaten, während das Unternehmen ein gemeinsames Profil behält.'],
      ['Bestandsimport', 'Viele Fahrzeuge per CSV, Prüfung und Freigabefluss vorbereiten, bevor Anzeigen veröffentlicht werden.'],
      ['Lead-Einblicke', 'Interesse über Ansichten, gespeicherte Anzeigen, Kontaktstarts und nachfragestarke Fahrzeuge verfolgen.'],
      ['Marktpräsenz', 'Sprache, Währung und Marktlinks anpassen, damit Käufer in Europa sofort die richtigen Informationen sehen.'],
    ],
    plans: [
      ['Start', 'Für Händler mit sauberem Dealer-Profil und Basisanzeigen.', 'Konto erstellen'],
      ['Standard', 'Für Teams mit mehr Anzeigen, Verkäufern und Auswertung.', 'Preise ansehen'],
      ['Premium', 'Für wachsende Bestände mit mehr Sichtbarkeit, Struktur und Priorität.', 'Kontakt aufnehmen'],
    ],
    faqs: [
      ['Was ist in den Händlerlösungen enthalten?', 'Die Händlerlösungen zeigen Logo, Adresse, Website, allgemeine Kontaktdaten und alle Anzeigen.'],
      ['Können Verkäufer eigene Kontaktdaten nutzen?', 'Ja. Anzeigen können den direkten Verkäuferkontakt zeigen, während die Unternehmensseite allgemeine Kontaktdaten zeigt.'],
      ['Funktioniert Autorell in mehreren Märkten?', 'Ja. Die Seite ist für elf Märkte mit lokalisierten Links, Sprache und Währung gebaut.'],
      ['Können wir einfach starten?', 'Ja. Starten Sie mit dem Basispaket und erweitern Sie bei mehr Anzeigen, Verkäufern oder Importbedarf.'],
    ],
  },
} as const

type BusinessCopy = (typeof businessPageCopy)[keyof typeof businessPageCopy]
type BusinessCopyTextKey = {
  [Key in keyof BusinessCopy]: BusinessCopy[Key] extends string ? Key : never
}[keyof BusinessCopy]

const businessCopyOverrides: Partial<
  Record<PublicLocale, Partial<Record<BusinessCopyTextKey, string>>>
> = {
  fr: {
    metaTitle: 'Solutions pour professionnels de l’automobile | Autorell',
    metaDescription: 'Autorell réunit stock, équipes, import et visibilité européenne pour les professionnels de l’automobile.',
    heroEyebrow: 'Solutions Autorell pour professionnels',
    heroTitle: 'Gérez votre stock, votre équipe et vos annonces au même endroit.',
    heroIntro: 'Regroupez vos véhicules, vendeurs, imports et données de marché dans un espace conçu pour la vente automobile professionnelle.',
    primaryCta: 'Créer un compte professionnel',
    secondaryCta: 'Voir les abonnements',
    learnMoreCta: 'En savoir plus',
    discoverTitle: 'Des outils et des données pour les professionnels de l’automobile.',
    discoverIntro: 'Centralisez le stock, les vendeurs, les contacts et les données de marché dans un flux qui évolue avec votre entreprise.',
    globeTitle: 'Une vitrine européenne pour votre stock.',
    globeText: 'Autorell rend vos annonces visibles localement et en Europe avec la bonne langue, la bonne devise et un lien vers votre page entreprise.',
    stepTitle: 'Passez à l’étape suivante.',
    faqTitle: 'Des questions ? Nos réponses.',
    allMarkets: '11 marchés',
    liveListings: 'Annonces',
    companyPage: 'Solutions professionnelles',
  },
  es: {
    metaTitle: 'Soluciones para empresas de vehículos | Autorell',
    metaDescription: 'Autorell reúne inventario, equipos, importación y alcance europeo para vendedores profesionales de vehículos.',
    heroEyebrow: 'Soluciones Autorell para profesionales',
    heroTitle: 'Gestiona inventario, equipo y anuncios en un solo lugar.',
    heroIntro: 'Reúne vehículos, vendedores, importaciones y datos de mercado en un espacio creado para la venta profesional de vehículos.',
    primaryCta: 'Crear cuenta de empresa',
    secondaryCta: 'Ver planes',
    learnMoreCta: 'Más información',
    discoverTitle: 'Herramientas y datos para empresas que venden vehículos.',
    discoverIntro: 'Centraliza inventario, vendedores, contactos y datos de mercado en un flujo que crece con tu empresa.',
    globeTitle: 'Un escaparate europeo para tu inventario.',
    globeText: 'Autorell muestra tus anuncios localmente y en Europa con el idioma, la moneda y los enlaces adecuados.',
    stepTitle: 'Da el siguiente paso.',
    faqTitle: 'Preguntas y respuestas.',
    allMarkets: '11 mercados',
    liveListings: 'Anuncios',
    companyPage: 'Soluciones profesionales',
  },
  it: {
    metaTitle: 'Soluzioni per aziende di veicoli | Autorell',
    metaDescription: 'Autorell riunisce inventario, team, importazione e visibilità europea per i venditori professionali di veicoli.',
    heroEyebrow: 'Soluzioni Autorell per professionisti',
    heroTitle: 'Gestisci inventario, team e annunci in un unico posto.',
    heroIntro: 'Riunisci veicoli, venditori, importazioni e dati di mercato in uno spazio creato per la vendita professionale di veicoli.',
    primaryCta: 'Crea un account aziendale',
    secondaryCta: 'Vedi i piani',
    learnMoreCta: 'Scopri di più',
    discoverTitle: 'Strumenti e dati per le aziende che vendono veicoli.',
    discoverIntro: 'Centralizza inventario, venditori, contatti e dati di mercato in un flusso che cresce con la tua azienda.',
    globeTitle: 'Una vetrina europea per il tuo inventario.',
    globeText: 'Autorell rende visibili i tuoi annunci localmente e in Europa con lingua, valuta e collegamenti corretti.',
    stepTitle: 'Fai il passo successivo.',
    faqTitle: 'Domande e risposte.',
    allMarkets: '11 mercati',
    liveListings: 'Annunci',
    companyPage: 'Soluzioni professionali',
  },
  pl: {
    metaTitle: 'Rozwiązania dla firm motoryzacyjnych | Autorell',
    metaDescription: 'Autorell łączy zapasy, zespoły, import i zasięg europejski dla profesjonalnych sprzedawców pojazdów.',
    heroEyebrow: 'Rozwiązania Autorell dla firm',
    heroTitle: 'Zarządzaj zapasami, zespołem i ogłoszeniami w jednym miejscu.',
    heroIntro: 'Połącz pojazdy, sprzedawców, import i dane rynkowe w przestrzeni stworzonej do profesjonalnej sprzedaży pojazdów.',
    primaryCta: 'Utwórz konto firmowe',
    secondaryCta: 'Zobacz plany',
    learnMoreCta: 'Dowiedz się więcej',
    discoverTitle: 'Narzędzia i dane dla firm sprzedających pojazdy.',
    discoverIntro: 'Zarządzaj zapasami, sprzedawcami, kontaktami i danymi rynkowymi w procesie, który rośnie wraz z firmą.',
    globeTitle: 'Europejska witryna dla Twoich pojazdów.',
    globeText: 'Autorell prezentuje ogłoszenia lokalnie i w Europie we właściwym języku, walucie i z linkiem do strony firmy.',
    stepTitle: 'Zrób kolejny krok.',
    faqTitle: 'Pytania i odpowiedzi.',
    allMarkets: '11 rynków',
    liveListings: 'Ogłoszenia',
    companyPage: 'Rozwiązania dla firm',
  },
  nl: {
    metaTitle: 'Oplossingen voor voertuigbedrijven | Autorell',
    metaDescription: 'Autorell brengt voorraad, teams, import en Europees bereik samen voor professionele voertuigverkopers.',
    heroEyebrow: 'Autorell-oplossingen voor bedrijven',
    heroTitle: 'Beheer voorraad, teams en advertenties op één plek.',
    heroIntro: 'Breng voertuigen, verkopers, import en marktgegevens samen in een werkruimte voor professionele voertuigverkoop.',
    primaryCta: 'Zakelijk account aanmaken',
    secondaryCta: 'Abonnementen bekijken',
    learnMoreCta: 'Meer informatie',
    discoverTitle: 'Tools en inzichten voor bedrijven die voertuigen verkopen.',
    discoverIntro: 'Centraliseer voorraad, verkopers, contactroutes en marktgegevens in een proces dat met je bedrijf meegroeit.',
    globeTitle: 'Een Europese etalage voor je voorraad.',
    globeText: 'Autorell toont advertenties lokaal en in Europa met de juiste taal, valuta en links naar je bedrijfspagina.',
    stepTitle: 'Zet de volgende stap.',
    faqTitle: 'Vragen en antwoorden.',
    allMarkets: '11 markten',
    liveListings: 'Advertenties',
    companyPage: 'Zakelijke oplossingen',
  },
  fi: {
    metaTitle: 'Ratkaisut ajoneuvoalan yrityksille | Autorell',
    metaDescription: 'Autorell yhdistää ajoneuvot, tiimit, tuonnin ja eurooppalaisen näkyvyyden ammattimaisille myyjille.',
    heroEyebrow: 'Autorell-ratkaisut yrityksille',
    heroTitle: 'Hallitse ajoneuvoja, tiimejä ja ilmoituksia yhdessä paikassa.',
    heroIntro: 'Yhdistä ajoneuvot, myyjät, tuonti ja markkinatiedot ammattimaiseen ajoneuvomyyntiin rakennetussa työtilassa.',
    primaryCta: 'Luo yritystili',
    secondaryCta: 'Katso tilaukset',
    learnMoreCta: 'Lue lisää',
    discoverTitle: 'Työkalut ja tiedot ajoneuvoja myyville yrityksille.',
    discoverIntro: 'Keskitä ajoneuvot, myyjät, yhteydenotot ja markkinatiedot prosessiin, joka kasvaa yrityksesi mukana.',
    globeTitle: 'Eurooppalainen näyteikkuna ajoneuvoillesi.',
    globeText: 'Autorell näyttää ilmoitukset paikallisesti ja Euroopassa oikealla kielellä, valuutalla ja yrityssivun linkeillä.',
    stepTitle: 'Ota seuraava askel.',
    faqTitle: 'Kysymyksiä ja vastauksia.',
    allMarkets: '11 markkinaa',
    liveListings: 'Ilmoitukset',
    companyPage: 'Yritysratkaisut',
  },
  da: {
    metaTitle: 'Løsninger til køretøjsvirksomheder | Autorell',
    metaDescription: 'Autorell samler lager, teams, import og europæisk rækkevidde for professionelle køretøjssælgere.',
    heroEyebrow: 'Autorell-løsninger til virksomheder',
    heroTitle: 'Administrer lager, teams og annoncer ét sted.',
    heroIntro: 'Saml køretøjer, sælgere, import og markedsdata i et arbejdsområde til professionelt køretøjssalg.',
    primaryCta: 'Opret virksomhedskonto',
    secondaryCta: 'Se abonnementer',
    learnMoreCta: 'Læs mere',
    discoverTitle: 'Værktøjer og indsigt til virksomheder, der sælger køretøjer.',
    discoverIntro: 'Saml lager, sælgere, kontaktveje og markedsdata i et flow, der vokser med virksomheden.',
    globeTitle: 'Et europæisk udstillingsvindue til jeres lager.',
    globeText: 'Autorell viser annoncer lokalt og i Europa med korrekt sprog, valuta og links til virksomhedssiden.',
    stepTitle: 'Tag det næste skridt.',
    faqTitle: 'Spørgsmål og svar.',
    allMarkets: '11 markeder',
    liveListings: 'Annoncer',
    companyPage: 'Virksomhedsløsninger',
  },
}

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
  const pilotEnabled = await isBusinessFeatureEnabled('business_pilot_program', {
    marketCode: String(marketCode || 'en').toLowerCase(),
  })
  const pilotCopy = getBusinessPilotCopy(locale).businessSection
  const pilotHref = localizePublicHref(locale, '/business/pilot')
  const inventoryImportHref = localizePublicHref(locale, '/business/inventory-import')

  return (
    <main className="overflow-x-hidden bg-white text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <AppleHero copy={copy} registerHref={registerHref} pricingHref={pricingHref} />
      <BusinessInsights copy={copy} />
      <NextStep copy={copy} planCopy={getBusinessPlanCopy(locale)} registerHref={registerHref} pricingHref={pricingHref} contactHref={contactHref} />
      {pilotEnabled ? (
        <BusinessPilotPromo
          copy={pilotCopy}
          applicationHref={`${pilotHref}#application`}
          inventoryHref={inventoryImportHref}
        />
      ) : null}
      <BusinessFaq copy={copy} planCopy={getBusinessPlanCopy(locale)} />
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
    <section className="overflow-hidden border-b border-[#e5e7eb] bg-white px-5 py-8 sm:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="relative isolate grid min-h-[500px] w-full overflow-hidden rounded-[16px] border border-[#d8e5f6] bg-[#eef6ff] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative z-10 flex min-w-0 flex-col justify-center px-7 py-10 sm:px-10 lg:px-12">
            <div className="inline-flex w-max flex-col items-end">
              <BrandLogo underline={false} />
              <p className="mt-0.5 w-full text-right text-[12px] font-semibold leading-none tracking-[-.01em] text-[#101828] sm:text-[14px]">Business</p>
            </div>
            <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#0866ff]">
              {copy.heroEyebrow}
            </p>
            <h1 className="mt-4 w-full max-w-[290px] text-[29px] font-semibold leading-[1.08] tracking-[-.018em] text-[#101828] sm:max-w-[540px] sm:text-[40px] lg:text-[44px]">
              {copy.heroTitle}
            </h1>
            <p className="mt-5 w-full max-w-[360px] text-base leading-7 text-[#475467] sm:max-w-[500px]">{copy.heroIntro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={registerHref}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#0866ff] px-5 text-[15px] font-semibold text-white transition hover:bg-[#075be5]"
              >
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={pricingHref}
                className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-[#aebbd0] bg-white px-5 text-[15px] font-semibold text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff]"
              >
                {copy.secondaryCta}
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
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#0866ff]">{copy.heroEyebrow}</p>
          <h2 className="text-[34px] font-semibold leading-tight tracking-[-.018em] text-[#101828] sm:text-5xl">{copy.discoverTitle}</h2>
          <p className="max-w-[560px] text-base leading-7 text-[#667085]">{copy.discoverIntro}</p>
        </div>

        <div className="mt-10 grid grid-flow-col auto-cols-[275px] gap-4 overflow-x-auto pb-5 pr-5 [scrollbar-width:thin] lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:pb-0 lg:pr-0">
          {copy.cards.map(([title, text], index) => {
            const Icon = icons[index] || Store
            return (
              <article
                key={title}
                className="group flex min-h-[260px] min-w-0 snap-start flex-col rounded-[10px] border border-[#e1e7f0] bg-[#f5f8fc] p-6 transition hover:-translate-y-1 hover:border-[#0866ff] hover:bg-[#eef6ff]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[9px] bg-white text-[#0866ff] shadow-[0_10px_30px_rgba(16,24,40,.06)]">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <h3 className="mt-7 text-[21px] font-semibold tracking-[-.018em] text-[#101828]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">{text}</p>
                <span className="mt-auto block h-1 w-10 rounded-full bg-[#0866ff]" aria-hidden="true" />
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
  planCopy,
  registerHref,
  pricingHref,
  contactHref,
}: {
  copy: BusinessCopy
  planCopy: BusinessPlanCopy
  registerHref: string
  pricingHref: string
  contactHref: string
}) {
  const hrefByKind = { register: registerHref, pricing: pricingHref, contact: contactHref }

  return (
    <section className="overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="flex flex-col gap-3 sm:max-w-[620px]">
          <h2 className="text-4xl font-semibold leading-tight tracking-[-.018em] text-[#101828] sm:text-5xl">{copy.stepTitle}</h2>
          <p className="max-w-[330px] text-base leading-7 text-[#667085] sm:max-w-[620px]">{planCopy.intro}</p>
        </div>
        <div className="mt-10 grid grid-flow-col auto-cols-[300px] gap-4 overflow-x-auto pb-5 pr-5 [scrollbar-width:thin] lg:grid-flow-row lg:grid-cols-2 lg:overflow-visible lg:pb-0 lg:pr-0 xl:grid-cols-4">
          {planCopy.plans.map((plan) => (
            <Link
              key={plan.name}
              href={hrefByKind[plan.hrefKind]}
              className={`group flex min-h-[430px] min-w-0 snap-start flex-col rounded-[10px] border p-6 transition hover:-translate-y-1 hover:border-[#0866ff] hover:bg-[#f7fbff] ${
                plan.recommended ? 'border-[#0866ff] bg-[#f4f8ff]' : 'border-[#e1e7f0] bg-[#f5f5f7]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-[#0866ff]">
                  {plan.recommended ? <Layers3 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </div>
                {plan.recommended ? (
                  <span className="rounded-full border border-[#0866ff] bg-white px-3 py-1 text-[11px] font-semibold text-[#0866ff]">{planCopy.recommended}</span>
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

function BusinessFaq({ copy, planCopy }: { copy: BusinessCopy; planCopy: BusinessPlanCopy }) {
  const extendedFaqs = [
    ...copy.faqs,
    ...planCopy.faqs,
  ] as const

  return (
    <section className="w-screen max-w-full overflow-hidden border-t border-[#e5e7eb] bg-[#f5f5f7] px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto w-full max-w-[1260px]">
        <BusinessFaqClient title={copy.faqTitle} items={extendedFaqs} />
      </div>
    </section>
  )
}

function getBusinessCopy(locale: PublicLocale): BusinessCopy {
  if (locale === 'sv' || locale === 'de' || locale === 'en') {
    return businessPageCopy[locale]
  }

  const translationLocale = locale === 'at' ? 'de' : locale === 'be' ? 'nl' : locale
  if (translationLocale === 'de') return businessPageCopy.de

  return {
    ...translatePublicObject(locale, businessPageCopy.en),
    ...businessCopyOverrides[translationLocale],
  } as BusinessCopy
}

function getRequestedLocale(headerStore: Awaited<ReturnType<typeof headers>>): PublicLocale {
  const requested = headerStore.get('x-autorell-language') || 'sv'
  return requested === 'sv' || requested === 'de' || isPublicLanguage(requested)
    ? requested
    : 'sv'
}
