import {
  getMarketplaceCategory,
  marketplaceLanguage,
  type MarketplaceCategorySlug,
} from './marketplace'
import {
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from './public-i18n'

type CoreLanguage = 'sv' | 'en' | 'de'
type LocalizedText = Record<CoreLanguage, string>

export type CategoryLandingConfig = {
  slug: MarketplaceCategorySlug
  path: string
  aliases: string[]
  heroImage: string
  heroPosition: string
  eyebrow: LocalizedText
  intro: LocalizedText
  searchHint: LocalizedText
  menu: Record<CoreLanguage, string[]>
  guideTopics: Record<CoreLanguage, string[]>
}

const sharedEyebrow = {
  sv: 'Autorell marketplace',
  en: 'Autorell marketplace',
  de: 'Autorell Marktplatz',
}

export const categoryLandingConfigs: CategoryLandingConfig[] = [
  {
    slug: 'cars',
    path: '/cars',
    aliases: ['/car'],
    heroImage: '/autorell-home-hero-banner.jpg',
    heroPosition: '58% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Hitta rätt bil bland annonser från privatpersoner och företag i hela Europa.',
      en: 'Find the right car from private and business sellers across Europe.',
      de: 'Finden Sie das passende Auto von privaten und gewerblichen Verkäufern in Europa.',
    },
    searchHint: { sv: 'Märke eller modell', en: 'Make or model', de: 'Marke oder Modell' },
    menu: {
      sv: ['Begagnade bilar', 'Nya bilar', 'Sälj din bil'],
      en: ['Used cars', 'New cars', 'Sell your car'],
      de: ['Gebrauchtwagen', 'Neuwagen', 'Auto verkaufen'],
    },
    guideTopics: {
      sv: ['Välja rätt bil', 'Köpa begagnat', 'Ladda elbil'],
      en: ['Choosing the right car', 'Buying used', 'Charging an electric car'],
      de: ['Das richtige Auto wählen', 'Gebraucht kaufen', 'Elektroauto laden'],
    },
  },
  {
    slug: 'vans',
    path: '/vans',
    aliases: ['/van'],
    heroImage: '/category-vans-hero-autorell.webp',
    heroPosition: '72% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Sök transportbilar för arbete, leverans och växande verksamheter i hela Europa.',
      en: 'Search vans for work, delivery and growing businesses across Europe.',
      de: 'Finden Sie Transporter für Arbeit, Lieferung und wachsende Unternehmen in Europa.',
    },
    searchHint: { sv: 'Märke, modell eller skåptyp', en: 'Make, model or van type', de: 'Marke, Modell oder Aufbau' },
    menu: {
      sv: ['Begagnade transportbilar', 'Nya transportbilar', 'Sälj din transportbil'],
      en: ['Used vans', 'New vans', 'Sell your van'],
      de: ['Gebrauchte Transporter', 'Neue Transporter', 'Transporter verkaufen'],
    },
    guideTopics: {
      sv: ['Rätt lastutrymme', 'Transportbil för företag', 'Eltransportbil i vardagen'],
      en: ['Choosing load space', 'Vans for business', 'Living with an electric van'],
      de: ['Passender Laderaum', 'Transporter fürs Unternehmen', 'Elektrotransporter im Alltag'],
    },
  },
  {
    slug: 'motorcycles',
    path: '/motorcycles',
    aliases: ['/motorcycle', '/bikes'],
    heroImage: '/category-motorcycles-hero.jpg',
    heroPosition: '45% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Upptäck motorcyklar för pendling, touring och nästa stora resa.',
      en: 'Discover motorcycles for commuting, touring and your next great ride.',
      de: 'Entdecken Sie Motorräder für Pendeln, Touren und die nächste große Fahrt.',
    },
    searchHint: { sv: 'Märke, modell eller MC-typ', en: 'Make, model or bike type', de: 'Marke, Modell oder Motorradtyp' },
    menu: {
      sv: ['Begagnade motorcyklar', 'Nya motorcyklar', 'Sälj din motorcykel'],
      en: ['Used motorcycles', 'New motorcycles', 'Sell your motorcycle'],
      de: ['Gebrauchte Motorräder', 'Neue Motorräder', 'Motorrad verkaufen'],
    },
    guideTopics: {
      sv: ['Välj rätt MC-typ', 'Kontrollera en begagnad MC', 'Utrustning för längre resor'],
      en: ['Choose the right bike type', 'Inspecting a used motorcycle', 'Equipment for longer rides'],
      de: ['Den richtigen Motorradtyp wählen', 'Gebrauchtmotorrad prüfen', 'Ausrüstung für lange Touren'],
    },
  },
  {
    slug: 'motorhomes',
    path: '/motorhomes',
    aliases: ['/motorhome'],
    heroImage: '/category-motorhomes-hero.jpg',
    heroPosition: '67% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Hitta husbilen som passar helgresor, långsemester och livet på vägen.',
      en: 'Find a motorhome for weekend escapes, long holidays and life on the road.',
      de: 'Finden Sie ein Wohnmobil für Wochenenden, lange Reisen und das Leben unterwegs.',
    },
    searchHint: { sv: 'Märke, modell eller sovplatser', en: 'Make, model or berths', de: 'Marke, Modell oder Schlafplätze' },
    menu: {
      sv: ['Begagnade husbilar', 'Nya husbilar', 'Sälj din husbil'],
      en: ['Used motorhomes', 'New motorhomes', 'Sell your motorhome'],
      de: ['Gebrauchte Wohnmobile', 'Neue Wohnmobile', 'Wohnmobil verkaufen'],
    },
    guideTopics: {
      sv: ['Planlösning och sovplatser', 'Vikt och körkort', 'Köpa husbil utomlands'],
      en: ['Layouts and berths', 'Weight and driving licences', 'Buying across borders'],
      de: ['Grundriss und Schlafplätze', 'Gewicht und Führerschein', 'Grenzüberschreitend kaufen'],
    },
  },
  {
    slug: 'caravans',
    path: '/caravans',
    aliases: ['/caravan'],
    heroImage: '/category-caravans-hero.jpg',
    heroPosition: '62% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Jämför husvagnar för familjesemester, säsongsboende och friheten att resa.',
      en: 'Compare caravans for family holidays, seasonal stays and freedom to travel.',
      de: 'Vergleichen Sie Wohnwagen für Familienurlaub, Saisonplätze und freie Reisen.',
    },
    searchHint: { sv: 'Märke, modell eller sovplatser', en: 'Make, model or berths', de: 'Marke, Modell oder Schlafplätze' },
    menu: {
      sv: ['Begagnade husvagnar', 'Nya husvagnar', 'Sälj din husvagn'],
      en: ['Used caravans', 'New caravans', 'Sell your caravan'],
      de: ['Gebrauchte Wohnwagen', 'Neue Wohnwagen', 'Wohnwagen verkaufen'],
    },
    guideTopics: {
      sv: ['Dragvikt och totalvikt', 'Enkel- eller dubbelaxel', 'Kontroll före köp'],
      en: ['Towing and total weight', 'Single or twin axle', 'Checks before buying'],
      de: ['Anhängelast und Gesamtgewicht', 'Ein- oder Tandemachser', 'Prüfung vor dem Kauf'],
    },
  },
  {
    slug: 'trucks',
    path: '/trucks',
    aliases: ['/truck'],
    heroImage: '/category-trucks-hero.jpg',
    heroPosition: '63% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Sök lastbilar och påbyggnader för transport, logistik och specialuppdrag.',
      en: 'Search trucks and body configurations for transport, logistics and specialist work.',
      de: 'Finden Sie Lkw und Aufbauten für Transport, Logistik und Spezialaufgaben.',
    },
    searchHint: { sv: 'Märke, modell eller påbyggnad', en: 'Make, model or body type', de: 'Marke, Modell oder Aufbau' },
    menu: {
      sv: ['Begagnade lastbilar', 'Nya lastbilar', 'Sälj din lastbil'],
      en: ['Used trucks', 'New trucks', 'Sell your truck'],
      de: ['Gebrauchte Lkw', 'Neue Lkw', 'Lkw verkaufen'],
    },
    guideTopics: {
      sv: ['Välj rätt påbyggnad', 'Axelkonfiguration och last', 'Driftkostnad och export'],
      en: ['Choosing the right body', 'Axle configuration and payload', 'Running cost and export'],
      de: ['Den richtigen Aufbau wählen', 'Achsen und Nutzlast', 'Betriebskosten und Export'],
    },
  },
  {
    slug: 'agriculture',
    path: '/farm',
    aliases: ['/agriculture'],
    heroImage: '/category-agriculture-hero.jpg',
    heroPosition: '52% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Hitta traktorer, skördemaskiner och redskap för modernt lantbruk.',
      en: 'Find tractors, harvesting machinery and implements for modern farming.',
      de: 'Finden Sie Traktoren, Erntemaschinen und Geräte für moderne Landwirtschaft.',
    },
    searchHint: { sv: 'Märke, modell eller maskintyp', en: 'Make, model or machine type', de: 'Marke, Modell oder Maschinentyp' },
    menu: {
      sv: ['Begagnade lantbruksmaskiner', 'Nya lantbruksmaskiner', 'Sälj din lantbruksmaskin'],
      en: ['Used farm machinery', 'New farm machinery', 'Sell your farm machinery'],
      de: ['Gebrauchte Landmaschinen', 'Neue Landmaschinen', 'Landmaschine verkaufen'],
    },
    guideTopics: {
      sv: ['Effekt och redskapsbehov', 'Drifttimmar och service', 'Köpa maskin i Europa'],
      en: ['Power and implement needs', 'Operating hours and service', 'Buying machinery in Europe'],
      de: ['Leistung und Gerätebedarf', 'Betriebsstunden und Service', 'Maschinen in Europa kaufen'],
    },
  },
  {
    slug: 'construction',
    path: '/plant',
    aliases: ['/construction'],
    heroImage: '/category-construction-hero-autorell.webp',
    heroPosition: '68% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Sök entreprenadmaskiner för markarbete, bygg, materialhantering och infrastruktur.',
      en: 'Search construction machinery for earthmoving, building, materials and infrastructure.',
      de: 'Finden Sie Baumaschinen für Erdarbeiten, Bau, Materialumschlag und Infrastruktur.',
    },
    searchHint: { sv: 'Märke, modell eller maskintyp', en: 'Make, model or machine type', de: 'Marke, Modell oder Maschinentyp' },
    menu: {
      sv: ['Begagnade entreprenadmaskiner', 'Nya entreprenadmaskiner', 'Sälj din entreprenadmaskin'],
      en: ['Used construction machinery', 'New construction machinery', 'Sell your construction machinery'],
      de: ['Gebrauchte Baumaschinen', 'Neue Baumaschinen', 'Baumaschine verkaufen'],
    },
    guideTopics: {
      sv: ['Storlek och arbetsvikt', 'Redskap och hydraulik', 'Kontroll av begagnad maskin'],
      en: ['Size and operating weight', 'Attachments and hydraulics', 'Inspecting used machinery'],
      de: ['Größe und Einsatzgewicht', 'Anbaugeräte und Hydraulik', 'Gebrauchtmaschine prüfen'],
    },
  },
  {
    slug: 'electric-bikes',
    path: '/electric-bikes',
    aliases: ['/e-bikes'],
    heroImage: '/category-electric-bikes-hero.jpg',
    heroPosition: '47% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Upptäck cyklar för stad, pendling, last och längre vardagsresor.',
      en: 'Discover bikes for cities, commuting, cargo and longer everyday journeys.',
      de: 'Entdecken Sie Fahrräder für Stadt, Pendeln, Lasten und längere Alltagswege.',
    },
    searchHint: { sv: 'Märke, modell eller cykeltyp', en: 'Make, model or bike type', de: 'Marke, Modell oder Fahrradtyp' },
    menu: {
      sv: ['Begagnade cyklar', 'Nya cyklar', 'Sälj din cykel'],
      en: ['Used bikes', 'New bikes', 'Sell your bike'],
      de: ['Gebrauchte Fahrräder', 'Neue Fahrräder', 'Fahrrad verkaufen'],
    },
    guideTopics: {
      sv: ['Motorplacering och känsla', 'Batteri och räckvidd', 'Kontrollera en begagnad cykel'],
      en: ['Motor position and ride feel', 'Battery and range', 'Checking a used e-bike'],
      de: ['Motorposition und Fahrgefühl', 'Akku und Reichweite', 'Gebrauchtes E-Bike prüfen'],
    },
  },
]

export function getCategoryLanding(slug: MarketplaceCategorySlug) {
  return categoryLandingConfigs.find((item) => item.slug === slug)!
}

export function categoryLandingPath(slug: MarketplaceCategorySlug) {
  return getCategoryLanding(slug).path
}

export function localizeCategoryLanding(
  config: CategoryLandingConfig,
  locale: PublicLocale,
) {
  const language = marketplaceLanguage(locale)
  const category = getMarketplaceCategory(config.slug)
  const core = {
    label: category.labels[language],
    singular: category.singular[language],
    eyebrow: config.eyebrow[language],
    intro: config.intro[language],
    searchHint: config.searchHint[language],
    menu: config.menu[language],
    guideTopics: config.guideTopics[language],
  }

  if (locale === 'sv' || locale === 'de' || locale === 'en') return core
  return translatePublicObject(locale, {
    label: category.labels.en,
    singular: category.singular.en,
    eyebrow: config.eyebrow.en,
    intro: config.intro.en,
    searchHint: config.searchHint.en,
    menu: config.menu.en,
    guideTopics: config.guideTopics.en,
  })
}

export function categoryLandingMenuHref(
  config: CategoryLandingConfig,
  item: string,
) {
  const normalized = item.toLowerCase()
  if (
    normalized.includes('sell') ||
    normalized.includes('sälj') ||
    normalized.includes('verkaufen')
  ) {
    return `/sell-vehicle?category=${config.slug}`
  }
  return `/marketplace/${config.slug}?filter=${encodeURIComponent(item)}`
}

export function categoryLandingCopy(locale: PublicLocale) {
  const language = marketplaceLanguage(locale)
  const copy = {
    sv: {
      search: 'Sök',
      searchPrefix: 'Sök',
      allEurope: 'Hela Europa',
      allMakes: 'Alla märken',
      sellPrefix: 'Sälj din',
      sellSuffix: 'på Autorell.',
      sellText: 'Skapa en tydlig annons, nå köpare i flera europeiska länder och hantera kontakterna i ditt Autorell-konto.',
      sellCta: 'Skapa annons',
      browseCta: 'Se alla annonser',
      guideEyebrow: 'Råd och inspiration',
      guideTitle: 'Bättre beslut börjar med rätt information.',
      guideText: 'Utforska praktiska guider före köp, försäljning och jämförelse.',
      readGuide: 'Läs guide',
      faqEyebrow: 'Vanliga frågor',
      faqTitle: 'Bra att veta innan du börjar.',
      faqSearchQuestion: 'Hur söker jag i hela Europa?',
      faqSearchAnswer: 'Välj land eller Hela Europa i sökmodulen. På resultatsidan kan du sedan filtrera vidare på märke, modell, skick och kategorispecifika fordonsdata.',
      faqSellQuestion: 'Kan både privatpersoner och företag annonsera?',
      faqSellAnswer: 'Ja. Autorell stödjer både privatkonton och företagskonton. Säljaren ansvarar för annonsen och affären, medan Autorell tillhandahåller marknadsplatsen och kommunikationen.',
    },
    en: {
      search: 'Search',
      searchPrefix: 'Search',
      allEurope: 'All of Europe',
      allMakes: 'All makes',
      sellPrefix: 'Sell your',
      sellSuffix: 'on Autorell.',
      sellText: 'Create a clear listing, reach buyers in multiple European countries and manage enquiries from your Autorell account.',
      sellCta: 'Create a listing',
      browseCta: 'Browse all listings',
      guideEyebrow: 'Advice and inspiration',
      guideTitle: 'Better decisions start with the right information.',
      guideText: 'Explore practical guidance before buying, selling and comparing.',
      readGuide: 'Read guide',
      faqEyebrow: 'Frequently asked questions',
      faqTitle: 'Good to know before you start.',
      faqSearchQuestion: 'How do I search across Europe?',
      faqSearchAnswer: 'Choose a country or All of Europe in the search module. On the results page you can filter further by make, model, condition and category-specific vehicle data.',
      faqSellQuestion: 'Can private and business sellers advertise?',
      faqSellAnswer: 'Yes. Autorell supports private and business accounts. The seller is responsible for the listing and transaction, while Autorell provides the marketplace and communication tools.',
    },
    de: {
      search: 'Suchen',
      searchPrefix: 'Suchen',
      allEurope: 'Ganz Europa',
      allMakes: 'Alle Marken',
      sellPrefix: 'Verkaufen Sie',
      sellSuffix: 'auf Autorell.',
      sellText: 'Erstellen Sie eine klare Anzeige, erreichen Sie Käufer in mehreren europäischen Ländern und verwalten Sie Anfragen in Ihrem Autorell-Konto.',
      sellCta: 'Anzeige erstellen',
      browseCta: 'Alle Anzeigen ansehen',
      guideEyebrow: 'Rat und Inspiration',
      guideTitle: 'Bessere Entscheidungen beginnen mit den richtigen Informationen.',
      guideText: 'Entdecken Sie praktische Ratgeber vor Kauf, Verkauf und Vergleich.',
      readGuide: 'Ratgeber lesen',
      faqEyebrow: 'Häufige Fragen',
      faqTitle: 'Gut zu wissen, bevor Sie starten.',
      faqSearchQuestion: 'Wie suche ich in ganz Europa?',
      faqSearchAnswer: 'Wählen Sie ein Land oder Ganz Europa im Suchmodul. Auf der Ergebnisseite können Sie nach Marke, Modell, Zustand und kategoriespezifischen Fahrzeugdaten filtern.',
      faqSellQuestion: 'Können private und gewerbliche Verkäufer inserieren?',
      faqSellAnswer: 'Ja. Autorell unterstützt Privat- und Unternehmenskonten. Der Verkäufer ist für Anzeige und Geschäft verantwortlich; Autorell stellt Marktplatz und Kommunikation bereit.',
    },
  }[language]

  return locale === 'sv' || locale === 'de' || locale === 'en'
    ? copy
    : translatePublicObject(locale, copy)
}

export function localizedCategorySearchLabel(
  locale: PublicLocale,
  label: string,
) {
  const language = marketplaceLanguage(locale)
  const value =
    language === 'sv'
      ? `Sök ${label.toLowerCase()}`
      : language === 'de'
        ? `${label} suchen`
        : `Search ${label.toLowerCase()}`
  return locale === 'sv' || locale === 'de' || locale === 'en'
    ? value
    : translatePublic(locale, value)
}
