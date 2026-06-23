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
    heroImage: '/category-road-vehicles.jpg',
    heroPosition: '66% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Hitta rätt bil bland annonser från privatpersoner och företag i hela Europa.',
      en: 'Find the right car from private and business sellers across Europe.',
      de: 'Finden Sie das passende Auto von privaten und gewerblichen Verkäufern in Europa.',
    },
    searchHint: { sv: 'Märke eller modell', en: 'Make or model', de: 'Marke oder Modell' },
    menu: {
      sv: ['Begagnade bilar', 'Nya bilar', 'Sälj din bil', 'Bilrecensioner', 'Elbilar'],
      en: ['Used cars', 'New cars', 'Sell your car', 'Car reviews', 'Electric cars'],
      de: ['Gebrauchtwagen', 'Neuwagen', 'Auto verkaufen', 'Autotests', 'Elektroautos'],
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
    heroImage: '/category-road-vehicles.jpg',
    heroPosition: '87% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Sök transportbilar för arbete, leverans och växande verksamheter i hela Europa.',
      en: 'Search vans for work, delivery and growing businesses across Europe.',
      de: 'Finden Sie Transporter für Arbeit, Lieferung und wachsende Unternehmen in Europa.',
    },
    searchHint: { sv: 'Märke, modell eller skåptyp', en: 'Make, model or van type', de: 'Marke, Modell oder Aufbau' },
    menu: {
      sv: ['Begagnade transportbilar', 'Nya transportbilar', 'Sälj din transportbil', 'Transportbilsrecensioner', 'Eltransportbilar', 'Leasing', 'Försäkring'],
      en: ['Used vans', 'New vans', 'Sell your van', 'Van reviews', 'Electric vans', 'Van leasing', 'Insurance'],
      de: ['Gebrauchte Transporter', 'Neue Transporter', 'Transporter verkaufen', 'Transporter-Tests', 'Elektrotransporter', 'Leasing', 'Versicherung'],
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
    heroImage: '/category-leisure-vehicles.jpg',
    heroPosition: '67% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Upptäck motorcyklar för pendling, touring och nästa stora resa.',
      en: 'Discover motorcycles for commuting, touring and your next great ride.',
      de: 'Entdecken Sie Motorräder für Pendeln, Touren und die nächste große Fahrt.',
    },
    searchHint: { sv: 'Märke, modell eller MC-typ', en: 'Make, model or bike type', de: 'Marke, Modell oder Motorradtyp' },
    menu: {
      sv: ['Begagnade motorcyklar', 'Nya motorcyklar', 'Sälj din motorcykel', 'MC-recensioner', 'Elmoto', 'Touring'],
      en: ['Used motorcycles', 'New motorcycles', 'Sell your motorcycle', 'Motorcycle reviews', 'Electric motorcycles', 'Touring bikes'],
      de: ['Gebrauchte Motorräder', 'Neue Motorräder', 'Motorrad verkaufen', 'Motorradtests', 'Elektromotorräder', 'Tourer'],
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
    heroImage: '/category-leisure-vehicles.jpg',
    heroPosition: '56% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Hitta husbilen som passar helgresor, långsemester och livet på vägen.',
      en: 'Find a motorhome for weekend escapes, long holidays and life on the road.',
      de: 'Finden Sie ein Wohnmobil für Wochenenden, lange Reisen und das Leben unterwegs.',
    },
    searchHint: { sv: 'Märke, modell eller sovplatser', en: 'Make, model or berths', de: 'Marke, Modell oder Schlafplätze' },
    menu: {
      sv: ['Begagnade husbilar', 'Nya husbilar', 'Sälj din husbil', 'Husbilsrecensioner', 'Kompakta husbilar', 'Reseguider'],
      en: ['Used motorhomes', 'New motorhomes', 'Sell your motorhome', 'Motorhome reviews', 'Compact motorhomes', 'Travel guides'],
      de: ['Gebrauchte Wohnmobile', 'Neue Wohnmobile', 'Wohnmobil verkaufen', 'Wohnmobiltests', 'Kompakte Wohnmobile', 'Reiseratgeber'],
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
    heroImage: '/category-leisure-vehicles.jpg',
    heroPosition: '88% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Jämför husvagnar för familjesemester, säsongsboende och friheten att resa.',
      en: 'Compare caravans for family holidays, seasonal stays and freedom to travel.',
      de: 'Vergleichen Sie Wohnwagen für Familienurlaub, Saisonplätze und freie Reisen.',
    },
    searchHint: { sv: 'Märke, modell eller sovplatser', en: 'Make, model or berths', de: 'Marke, Modell oder Schlafplätze' },
    menu: {
      sv: ['Begagnade husvagnar', 'Nya husvagnar', 'Sälj din husvagn', 'Husvagnsrecensioner', 'Familjehusvagnar', 'Tillbehör'],
      en: ['Used caravans', 'New caravans', 'Sell your caravan', 'Caravan reviews', 'Family caravans', 'Accessories'],
      de: ['Gebrauchte Wohnwagen', 'Neue Wohnwagen', 'Wohnwagen verkaufen', 'Wohnwagentests', 'Familienwohnwagen', 'Zubehör'],
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
    heroImage: '/category-heavy-machinery.jpg',
    heroPosition: '52% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Sök lastbilar och påbyggnader för transport, logistik och specialuppdrag.',
      en: 'Search trucks and body configurations for transport, logistics and specialist work.',
      de: 'Finden Sie Lkw und Aufbauten für Transport, Logistik und Spezialaufgaben.',
    },
    searchHint: { sv: 'Märke, modell eller påbyggnad', en: 'Make, model or body type', de: 'Marke, Modell oder Aufbau' },
    menu: {
      sv: ['Begagnade lastbilar', 'Nya lastbilar', 'Sälj din lastbil', 'Dragbilar', 'Lastväxlare', 'El-lastbilar'],
      en: ['Used trucks', 'New trucks', 'Sell your truck', 'Tractor units', 'Hook loaders', 'Electric trucks'],
      de: ['Gebrauchte Lkw', 'Neue Lkw', 'Lkw verkaufen', 'Sattelzugmaschinen', 'Abrollkipper', 'Elektro-Lkw'],
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
    heroImage: '/category-heavy-machinery.jpg',
    heroPosition: '72% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Hitta traktorer, skördemaskiner och redskap för modernt lantbruk.',
      en: 'Find tractors, harvesting machinery and implements for modern farming.',
      de: 'Finden Sie Traktoren, Erntemaschinen und Geräte für moderne Landwirtschaft.',
    },
    searchHint: { sv: 'Märke, modell eller maskintyp', en: 'Make, model or machine type', de: 'Marke, Modell oder Maschinentyp' },
    menu: {
      sv: ['Traktorer', 'Skördemaskiner', 'Redskap', 'Sälj lantbruksmaskin', 'Nya maskiner', 'Lantbruksguider'],
      en: ['Tractors', 'Harvesting machinery', 'Implements', 'Sell farm machinery', 'New machinery', 'Farming guides'],
      de: ['Traktoren', 'Erntemaschinen', 'Anbaugeräte', 'Landmaschine verkaufen', 'Neue Maschinen', 'Landwirtschaftsratgeber'],
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
    heroImage: '/category-heavy-machinery.jpg',
    heroPosition: '91% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Sök entreprenadmaskiner för markarbete, bygg, materialhantering och infrastruktur.',
      en: 'Search construction machinery for earthmoving, building, materials and infrastructure.',
      de: 'Finden Sie Baumaschinen für Erdarbeiten, Bau, Materialumschlag und Infrastruktur.',
    },
    searchHint: { sv: 'Märke, modell eller maskintyp', en: 'Make, model or machine type', de: 'Marke, Modell oder Maschinentyp' },
    menu: {
      sv: ['Grävmaskiner', 'Lastare', 'Dumprar', 'Sälj entreprenadmaskin', 'Nya maskiner', 'Maskinguider'],
      en: ['Excavators', 'Loaders', 'Dumpers', 'Sell construction machinery', 'New machinery', 'Machine guides'],
      de: ['Bagger', 'Lader', 'Dumper', 'Baumaschine verkaufen', 'Neue Maschinen', 'Maschinenratgeber'],
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
    heroImage: '/category-electric-mobility.jpg',
    heroPosition: '66% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Upptäck elcyklar för stad, pendling, last och längre vardagsresor.',
      en: 'Discover electric bikes for cities, commuting, cargo and longer everyday journeys.',
      de: 'Entdecken Sie E-Bikes für Stadt, Pendeln, Lasten und längere Alltagswege.',
    },
    searchHint: { sv: 'Märke, modell eller cykeltyp', en: 'Make, model or bike type', de: 'Marke, Modell oder Fahrradtyp' },
    menu: {
      sv: ['Begagnade elcyklar', 'Nya elcyklar', 'Sälj din elcykel', 'Lastcyklar', 'Pendlingscyklar', 'Batteriguider'],
      en: ['Used electric bikes', 'New electric bikes', 'Sell your e-bike', 'Cargo bikes', 'Commuter bikes', 'Battery guides'],
      de: ['Gebrauchte E-Bikes', 'Neue E-Bikes', 'E-Bike verkaufen', 'Lastenräder', 'Pendler-E-Bikes', 'Akkuratgeber'],
    },
    guideTopics: {
      sv: ['Motorplacering och känsla', 'Batteri och räckvidd', 'Kontrollera en begagnad elcykel'],
      en: ['Motor position and ride feel', 'Battery and range', 'Checking a used e-bike'],
      de: ['Motorposition und Fahrgefühl', 'Akku und Reichweite', 'Gebrauchtes E-Bike prüfen'],
    },
  },
  {
    slug: 'e-scooters',
    path: '/e-scooters',
    aliases: ['/electric-scooters'],
    heroImage: '/category-electric-mobility.jpg',
    heroPosition: '88% center',
    eyebrow: sharedEyebrow,
    intro: {
      sv: 'Jämför elsparkcyklar för smidig pendling och korta resor i vardagen.',
      en: 'Compare e-scooters for convenient commuting and shorter everyday journeys.',
      de: 'Vergleichen Sie E-Scooter für bequemes Pendeln und kurze Alltagswege.',
    },
    searchHint: { sv: 'Märke, modell eller användning', en: 'Make, model or use', de: 'Marke, Modell oder Nutzung' },
    menu: {
      sv: ['Begagnade elsparkcyklar', 'Nya elsparkcyklar', 'Sälj din elsparkcykel', 'Pendlingsmodeller', 'Räckvidd', 'Säkerhetsguider'],
      en: ['Used e-scooters', 'New e-scooters', 'Sell your e-scooter', 'Commuter models', 'Range', 'Safety guides'],
      de: ['Gebrauchte E-Scooter', 'Neue E-Scooter', 'E-Scooter verkaufen', 'Pendlermodelle', 'Reichweite', 'Sicherheitsratgeber'],
    },
    guideTopics: {
      sv: ['Räckvidd i verkligheten', 'Däck, bromsar och komfort', 'Regler i olika länder'],
      en: ['Real-world range', 'Tyres, brakes and comfort', 'Rules in different countries'],
      de: ['Reale Reichweite', 'Reifen, Bremsen und Komfort', 'Regeln in verschiedenen Ländern'],
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
  index: number,
) {
  const normalized = item.toLowerCase()
  if (
    normalized.includes('sell') ||
    normalized.includes('sälj') ||
    normalized.includes('verkaufen')
  ) {
    return `/salj-fordon?category=${config.slug}`
  }
  if (
    normalized.includes('review') ||
    normalized.includes('recension') ||
    normalized.includes('test') ||
    normalized.includes('guide') ||
    normalized.includes('ratgeber') ||
    normalized.includes('insurance') ||
    normalized.includes('försäkring') ||
    normalized.includes('versicherung') ||
    normalized.includes('leasing') ||
    normalized.includes('accessor') ||
    normalized.includes('tillbehör') ||
    normalized.includes('zubehör')
  ) {
    return `${config.path}#guides`
  }
  return `/marketplace/${config.slug}?filter=${encodeURIComponent(item || String(index))}`
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
