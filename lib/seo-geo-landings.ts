import { cleanSeoText } from './market-seo'
import { type MarketplaceCategorySlug } from './marketplace'
import { brandSuggestionsForCategory } from './listing-brand-suggestions'
import {
  resolveMarketplaceGeoAreaBySlug,
  type MarketplaceGeoArea,
} from './marketplace-search-state'
import {
  getGeoRegions,
  marketplaceGeoSlug,
  resolveStaticMarketplaceGeoAreaBySlug,
  searchGeoPlaces,
} from './marketplace-geo'
import { getSeoSitemapAreas } from './seo-sitemap-places'
import type { PublicLocale } from './public-i18n'

export { getSeoSitemapAreas } from './seo-sitemap-places'

type GeoCategoryRoute = {
  category: MarketplaceCategorySlug
  plural: string
  leasing?: boolean
}

export type GeoSitemapMarketConfig = {
  market: string
  countryCode: string
  categorySlugs: string[]
  categories: Array<{
    slug: string
    category: MarketplaceCategorySlug
    leasing: boolean
  }>
}

export type SeoLandingLink = {
  label: string
  href: string
}

type GeoMarketRouteConfig = {
  locale: PublicLocale
  countryCode: string
  categories: Record<string, GeoCategoryRoute>
  title: (subject: string, place: string) => string
  description: (subject: string, place: string) => string
  zeroResults: (subject: string, place: string) => string
}

export type GeoLandingRoute = {
  market: string
  locale: PublicLocale
  countryCode: string
  category: MarketplaceCategorySlug
  categorySlug: string
  categoryLabel: string
  leasing: boolean
  place: MarketplaceGeoArea | null
  makeSlug: string | null
  make: string | null
  modelSlug: string | null
  model: string | null
  routeKind:
    | 'category'
    | 'category-location'
    | 'category-make'
    | 'category-make-location'
    | 'category-make-model'
    | 'category-make-model-location'
  canonicalPath: string
  h1: string
  title: string
  description: string
  zeroResultsText: string
  breadcrumbs: SeoLandingLink[]
  relatedLinks: SeoLandingLink[]
}

const marketRouteConfigs: Record<string, GeoMarketRouteConfig> = {
  se: {
    locale: 'sv',
    countryCode: 'SE',
    categories: {
      bilar: category('cars', 'bilar'),
      transportbilar: category('vans', 'transportbilar'),
      motorcyklar: category('motorcycles', 'motorcyklar'),
      husbilar: category('motorhomes', 'husbilar'),
      husvagnar: category('caravans', 'husvagnar'),
      lastbilar: category('trucks', 'lastbilar'),
      lantbruksmaskiner: category('agriculture', 'lantbruksmaskiner'),
      entreprenadmaskiner: category('construction', 'entreprenadmaskiner'),
      cyklar: category('electric-bikes', 'cyklar'),
      leasingbilar: leasingCategory('cars', 'leasingbilar'),
      leasingtransportbilar: leasingCategory('vans', 'leasingtransportbilar'),
      leasinglastbilar: leasingCategory('trucks', 'leasinglastbilar'),
      leasinglantbruksmaskiner: leasingCategory('agriculture', 'leasinglantbruksmaskiner'),
      leasingentreprenadmaskiner: leasingCategory('construction', 'leasingentreprenadmaskiner'),
    },
    title: (subject, place) => `${subject} till salu i ${place}`,
    description: (subject, place) =>
      `Se ${lower(subject)} till salu i ${place}. J\u00e4mf\u00f6r fordon fr\u00e5n privata s\u00e4ljare och f\u00f6retag p\u00e5 Autorell.`,
    zeroResults: (subject, place) => `Inga ${lower(subject)} till salu i ${place} just nu`,
  },
  de: deMarket('de', 'DE'),
  at: deMarket('at', 'AT'),
  fr: {
    locale: 'fr',
    countryCode: 'FR',
    categories: {
      voitures: category('cars', 'voitures'),
      utilitaires: category('vans', 'utilitaires'),
      motos: category('motorcycles', 'motos'),
      'camping-cars': category('motorhomes', 'camping-cars'),
      caravanes: category('caravans', 'caravanes'),
      camions: category('trucks', 'camions'),
      'machines-agricoles': category('agriculture', 'machines agricoles'),
      'engins-chantier': category('construction', 'engins de chantier'),
      'velos-electriques': category('electric-bikes', 'v\u00e9los \u00e9lectriques'),
      'leasing-voitures': leasingCategory('cars', 'voitures en leasing'),
      'leasing-utilitaires': leasingCategory('vans', 'utilitaires en leasing'),
      'leasing-camions': leasingCategory('trucks', 'camions en leasing'),
      'leasing-machines-agricoles': leasingCategory('agriculture', 'machines agricoles en leasing'),
      'leasing-engins-chantier': leasingCategory('construction', 'engins de chantier en leasing'),
    },
    title: (subject, place) => `${subject} \u00e0 vendre \u00e0 ${place}`,
    description: (subject, place) =>
      `Voir ${lower(subject)} \u00e0 vendre \u00e0 ${place}. Comparez les v\u00e9hicules de particuliers et de professionnels sur Autorell.`,
    zeroResults: (subject, place) => `Aucune annonce pour ${lower(subject)} \u00e0 ${place} pour le moment`,
  },
  it: {
    locale: 'it',
    countryCode: 'IT',
    categories: {
      auto: category('cars', 'auto'),
      furgoni: category('vans', 'furgoni'),
      moto: category('motorcycles', 'moto'),
      camper: category('motorhomes', 'camper'),
      caravan: category('caravans', 'caravan'),
      autocarri: category('trucks', 'autocarri'),
      'macchine-agricole': category('agriculture', 'macchine agricole'),
      'macchine-edili': category('construction', 'macchine edili'),
      'bici-elettriche': category('electric-bikes', 'bici elettriche'),
      'leasing-auto': leasingCategory('cars', 'auto in leasing'),
      'leasing-furgoni': leasingCategory('vans', 'furgoni in leasing'),
      'leasing-autocarri': leasingCategory('trucks', 'autocarri in leasing'),
      'leasing-macchine-agricole': leasingCategory('agriculture', 'macchine agricole in leasing'),
      'leasing-macchine-edili': leasingCategory('construction', 'macchine edili in leasing'),
    },
    title: (subject, place) => `${subject} in vendita a ${place}`,
    description: (subject, place) =>
      `Scopri ${lower(subject)} in vendita a ${place}. Confronta veicoli da privati e aziende su Autorell.`,
    zeroResults: (subject, place) => `Nessun annuncio per ${lower(subject)} a ${place} al momento`,
  },
  es: {
    locale: 'es',
    countryCode: 'ES',
    categories: {
      coches: category('cars', 'coches'),
      furgonetas: category('vans', 'furgonetas'),
      motos: category('motorcycles', 'motos'),
      autocaravanas: category('motorhomes', 'autocaravanas'),
      caravanas: category('caravans', 'caravanas'),
      camiones: category('trucks', 'camiones'),
      'maquinaria-agricola': category('agriculture', 'maquinaria agr\u00edcola'),
      'maquinaria-construccion': category('construction', 'maquinaria de construcci\u00f3n'),
      'bicicletas-electricas': category('electric-bikes', 'bicicletas el\u00e9ctricas'),
      'leasing-coches': leasingCategory('cars', 'coches de leasing'),
      'leasing-furgonetas': leasingCategory('vans', 'furgonetas de leasing'),
      'leasing-camiones': leasingCategory('trucks', 'camiones de leasing'),
      'leasing-maquinaria-agricola': leasingCategory('agriculture', 'maquinaria agr\u00edcola de leasing'),
      'leasing-maquinaria-construccion': leasingCategory('construction', 'maquinaria de construcci\u00f3n de leasing'),
    },
    title: (subject, place) => `${subject} en venta en ${place}`,
    description: (subject, place) =>
      `Ver ${lower(subject)} en venta en ${place}. Compara veh\u00edculos de particulares y empresas en Autorell.`,
    zeroResults: (subject, place) => `No hay anuncios de ${lower(subject)} en ${place} ahora mismo`,
  },
  nl: nlMarket('nl', 'NL'),
  be: nlMarket('be', 'BE'),
  pl: {
    locale: 'pl',
    countryCode: 'PL',
    categories: {
      samochody: category('cars', 'samochody'),
      dostawcze: category('vans', 'samochody dostawcze'),
      motocykle: category('motorcycles', 'motocykle'),
      kampery: category('motorhomes', 'kampery'),
      przyczepy: category('caravans', 'przyczepy kempingowe'),
      ciezarowki: category('trucks', 'ci\u0119\u017car\u00f3wki'),
      'maszyny-rolnicze': category('agriculture', 'maszyny rolnicze'),
      'maszyny-budowlane': category('construction', 'maszyny budowlane'),
      'rowery-elektryczne': category('electric-bikes', 'rowery elektryczne'),
      'leasing-samochody': leasingCategory('cars', 'samochody w leasingu'),
      'leasing-dostawcze': leasingCategory('vans', 'samochody dostawcze w leasingu'),
      'leasing-ciezarowki': leasingCategory('trucks', 'ci\u0119\u017car\u00f3wki w leasingu'),
      'leasing-maszyny-rolnicze': leasingCategory('agriculture', 'maszyny rolnicze w leasingu'),
      'leasing-maszyny-budowlane': leasingCategory('construction', 'maszyny budowlane w leasingu'),
    },
    title: (subject, place) => `${subject} na sprzeda\u017c w ${place}`,
    description: (subject, place) =>
      `Zobacz ${lower(subject)} na sprzeda\u017c w ${place}. Por\u00f3wnaj pojazdy od os\u00f3b prywatnych i firm w Autorell.`,
    zeroResults: (subject, place) => `Brak og\u0142osze\u0144 dla ${lower(subject)} w ${place}`,
  },
  dk: {
    locale: 'da',
    countryCode: 'DK',
    categories: {
      biler: category('cars', 'biler'),
      varevogne: category('vans', 'varevogne'),
      motorcykler: category('motorcycles', 'motorcykler'),
      autocampere: category('motorhomes', 'autocampere'),
      campingvogne: category('caravans', 'campingvogne'),
      lastbiler: category('trucks', 'lastbiler'),
      landbrugsmaskiner: category('agriculture', 'landbrugsmaskiner'),
      entreprenormaskiner: category('construction', 'entrepren\u00f8rmaskiner'),
      elcykler: category('electric-bikes', 'elcykler'),
      leasingbiler: leasingCategory('cars', 'leasingbiler'),
      leasingvarevogne: leasingCategory('vans', 'leasingvarevogne'),
      leasinglastbiler: leasingCategory('trucks', 'leasinglastbiler'),
      leasinglandbrugsmaskiner: leasingCategory('agriculture', 'leasinglandbrugsmaskiner'),
      leasingentreprenormaskiner: leasingCategory('construction', 'leasingentrepren\u00f8rmaskiner'),
    },
    title: (subject, place) => `${subject} til salg i ${place}`,
    description: (subject, place) =>
      `Se ${lower(subject)} til salg i ${place}. Sammenlign k\u00f8ret\u00f8jer fra private og virksomheder p\u00e5 Autorell.`,
    zeroResults: (subject, place) => `Ingen annoncer for ${lower(subject)} i ${place} lige nu`,
  },
  fi: {
    locale: 'fi',
    countryCode: 'FI',
    categories: {
      autot: category('cars', 'autot'),
      pakettiautot: category('vans', 'pakettiautot'),
      moottoripyorat: category('motorcycles', 'moottoripy\u00f6r\u00e4t'),
      matkailuautot: category('motorhomes', 'matkailuautot'),
      asuntovaunut: category('caravans', 'asuntovaunut'),
      'kuorma-autot': category('trucks', 'kuorma-autot'),
      maatalouskoneet: category('agriculture', 'maatalouskoneet'),
      maanrakennuskoneet: category('construction', 'maanrakennuskoneet'),
      sahkopyorat: category('electric-bikes', 's\u00e4hk\u00f6py\u00f6r\u00e4t'),
      leasingautot: leasingCategory('cars', 'leasingautot'),
      leasingpakettiautot: leasingCategory('vans', 'leasingpakettiautot'),
      'leasing-kuorma-autot': leasingCategory('trucks', 'leasing-kuorma-autot'),
      leasingmaatalouskoneet: leasingCategory('agriculture', 'leasingmaatalouskoneet'),
      leasingmaanrakennuskoneet: leasingCategory('construction', 'leasingmaanrakennuskoneet'),
    },
    title: (subject, place) => `${subject} myyt\u00e4v\u00e4n\u00e4 kohteessa ${place}`,
    description: (subject, place) =>
      `Katso ${lower(subject)} myyt\u00e4v\u00e4n\u00e4 kohteessa ${place}. Vertaa yksityisten ja yritysten ajoneuvoja Autorellissa.`,
    zeroResults: (subject, place) => `Ei ilmoituksia haulle ${lower(subject)} kohteessa ${place}`,
  },
}

const englishMarketRouteConfig = {
  locale: 'en' as const,
  categories: {
    cars: category('cars', 'cars'),
    vans: category('vans', 'vans'),
    motorcycles: category('motorcycles', 'motorcycles'),
    motorhomes: category('motorhomes', 'motorhomes'),
    caravans: category('caravans', 'caravans'),
    trucks: category('trucks', 'trucks'),
    'agricultural-machinery': category('agriculture', 'agricultural machinery'),
  },
}

export const englishSeoCountries = [
  { slug: 'austria', countryCode: 'AT', name: 'Austria' },
  { slug: 'belgium', countryCode: 'BE', name: 'Belgium' },
  { slug: 'denmark', countryCode: 'DK', name: 'Denmark' },
  { slug: 'finland', countryCode: 'FI', name: 'Finland' },
  { slug: 'france', countryCode: 'FR', name: 'France' },
  { slug: 'germany', countryCode: 'DE', name: 'Germany' },
  { slug: 'italy', countryCode: 'IT', name: 'Italy' },
  { slug: 'netherlands', countryCode: 'NL', name: 'the Netherlands' },
  { slug: 'poland', countryCode: 'PL', name: 'Poland' },
  { slug: 'spain', countryCode: 'ES', name: 'Spain' },
  { slug: 'sweden', countryCode: 'SE', name: 'Sweden' },
] as const

export const englishSeoSitemapCategories = Object.entries(englishMarketRouteConfig.categories).map(
  ([slug, route]) => ({ slug, category: route.category }),
)

let cachedEnglishSeoSitemapAreas: Array<{
  country: (typeof englishSeoCountries)[number]
  area: MarketplaceGeoArea
}> | null = null

const marketCountryNames: Record<string, string> = {
  se: 'Sverige',
  de: 'Deutschland',
  at: '\u00d6sterreich',
  fr: 'France',
  it: 'Italia',
  es: 'Espa\u00f1a',
  nl: 'Nederland',
  be: 'Belgi\u00eb',
  pl: 'Polska',
  dk: 'Danmark',
  fi: 'Suomi',
}

const sitemapMakesByCategory: Record<MarketplaceCategorySlug, readonly string[]> = {
  cars: ['Audi', 'BMW', 'Mercedes-Benz', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Peugeot', 'Renault', 'Ford', 'Fiat', 'Skoda'],
  vans: ['Citroen', 'Ford', 'Iveco', 'Mercedes-Benz', 'Opel', 'Peugeot', 'Renault', 'Volkswagen'],
  motorcycles: ['BMW Motorrad', 'Ducati', 'Harley-Davidson', 'Honda', 'Kawasaki', 'KTM', 'Suzuki', 'Yamaha'],
  motorhomes: ['Adria', 'Dethleffs', 'Hobby', 'Hymer', 'Knaus', 'Rapido'],
  caravans: ['Adria', 'Fendt', 'Hobby', 'Kabe', 'Knaus', 'Polar'],
  trucks: ['DAF', 'Iveco', 'MAN', 'Mercedes-Benz', 'Scania', 'Volvo'],
  agriculture: ['Case IH', 'Claas', 'Fendt', 'John Deere', 'Massey Ferguson', 'New Holland', 'Valtra'],
  construction: ['Bobcat', 'Caterpillar', 'Hitachi', 'JCB', 'Komatsu', 'Liebherr', 'Volvo CE'],
  'electric-bikes': ['Canyon', 'Cube', 'Gazelle', 'Giant', 'Haibike', 'Specialized', 'Trek'],
}

const seoModelsByMake: Record<string, readonly string[]> = {
  Audi: ['A4', 'Q5', 'A3', 'A5', 'A6', 'Q3'],
  BMW: ['X5', '3 Series', '1 Series', '5 Series', 'X1', 'X3'],
  'Mercedes-Benz': ['GLC', 'C-Class', 'A-Class', 'E-Class', 'GLE', 'Sprinter'],
  Volkswagen: ['Golf', 'Tiguan', 'Passat', 'Polo', 'T-Roc', 'ID.4'],
  Volvo: ['XC60', 'V60', 'V40', 'V90', 'XC40', 'XC90'],
  Toyota: ['Corolla', 'RAV4', 'Yaris', 'C-HR', 'Prius', 'Land Cruiser'],
  Ford: ['Focus', 'Kuga', 'Fiesta', 'Mustang', 'Puma', 'Ranger'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster'],
  Peugeot: ['208', '3008', '308', '2008', '5008'],
  Renault: ['Clio', 'Captur', 'Megane', 'Austral', 'Scenic'],
  Fiat: ['500', 'Panda', 'Tipo', '600'],
  Skoda: ['Octavia', 'Kodiaq', 'Fabia', 'Superb', 'Karoq', 'Enyaq'],
}

const makeSlugAliases: Record<string, string> = {
  mercedes: 'mercedes-benz',
  vw: 'volkswagen',
}

export async function resolveGeoLandingRoute(
  market: string,
  categorySlug: string | undefined,
  segments: string[] | undefined,
): Promise<GeoLandingRoute | null> {
  const normalizedMarket = normalizeSegment(market)
  if (normalizedMarket === 'en') {
    return resolveEnglishGeoLandingRoute(categorySlug, segments)
  }
  const config = marketRouteConfigs[normalizedMarket]
  if (!config || !categorySlug) return null

  const normalizedCategorySlug = normalizeSegment(categorySlug)
  const categoryRoute = config.categories[normalizedCategorySlug]
  if (!categoryRoute) return null
  const normalizedSegments = (segments || []).map((segment) => normalizeSegment(segment)).filter(Boolean)
  if (normalizedSegments.length > 3) return null

  let make: string | null = null
  let model: string | null = null
  let place: MarketplaceGeoArea | null = null

  if (normalizedSegments.length === 1) {
    make = resolveCategoryMake(categoryRoute.category, normalizedSegments[0])
    if (!make) place = await resolveGeoLandingPlace(config.countryCode, normalizedSegments[0])
    if (!make && !place) return null
  }

  if (normalizedSegments.length >= 2) {
    make = resolveCategoryMake(categoryRoute.category, normalizedSegments[0])
    if (!make) return null
    model = resolveMakeModel(categoryRoute.category, make, normalizedSegments[1])
    if (!model) place = await resolveGeoLandingPlace(config.countryCode, normalizedSegments[1])
    if (!model && !place) return null
  }

  if (normalizedSegments.length === 3) {
    if (!make || !model) return null
    place = await resolveGeoLandingPlace(config.countryCode, normalizedSegments[2])
    if (!place) return null
  }

  const localizedPlace = place ? localizeSeoPlace(place, config.locale) : null

  const makeSlug = make ? slugify(make) : null
  const modelSlug = model ? slugify(model) : null
  const canonicalPath = buildSeoMarketplacePath({
    market: normalizedMarket,
    categorySlug: normalizedCategorySlug,
    make,
    model,
    placeSlug: localizedPlace?.slug,
  })
  const countryName = marketCountryNames[normalizedMarket]
  const baseCategoryRoute = Object.values(config.categories).find(
    (route) => route.category === categoryRoute.category && !route.leasing,
  )
  const categorySubject = capitalize(baseCategoryRoute?.plural || categoryRoute.plural)
  const routeCategoryLabel = capitalize(categoryRoute.plural)
  const subject = model ? `${make} ${model}` : make || categorySubject
  const scope = localizedPlace?.name || countryName
  const copy = buildLocalizedSeoCopy(config.locale, subject, scope, !localizedPlace, Boolean(categoryRoute.leasing))
  const routeKind = getRouteKind({ make, model, place: localizedPlace })
  const breadcrumbs = buildBreadcrumbs({
    market: normalizedMarket,
    countryName,
    categorySlug: normalizedCategorySlug,
    categoryLabel: routeCategoryLabel,
    make,
    model,
    place: localizedPlace,
    canonicalPath,
  })
  const relatedLinks = buildRelatedLinks({
    market: normalizedMarket,
    locale: config.locale,
    countryName,
    category: categoryRoute.category,
    categorySlug: normalizedCategorySlug,
    categoryLabel: categorySubject,
    leasing: Boolean(categoryRoute.leasing),
    make,
    model,
    place: localizedPlace,
    canonicalPath,
  })

  return {
    market: normalizedMarket,
    locale: config.locale,
    countryCode: config.countryCode,
    category: categoryRoute.category,
    categorySlug: normalizedCategorySlug,
    categoryLabel: routeCategoryLabel,
    leasing: Boolean(categoryRoute.leasing),
    place: localizedPlace,
    makeSlug,
    make,
    modelSlug,
    model,
    routeKind,
    canonicalPath,
    h1: copy.h1,
    title: fitSeoTitle(`${copy.h1} | Autorell`),
    description: fitSeoDescription(copy.description),
    zeroResultsText: copy.zeroResults,
    breadcrumbs,
    relatedLinks,
  }
}

function localizeSeoPlace(place: MarketplaceGeoArea, locale: PublicLocale): MarketplaceGeoArea {
  if (locale === 'fi' && place.name === '\u00c5land') {
    return { ...place, name: 'Ahvenanmaa' }
  }

  if (locale !== 'be') return place

  const dutchName = place.name
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
    .at(-1)
    ?.replace(/^Arrondissement\s+/i, '')

  return dutchName ? { ...place, name: dutchName } : place
}

function normalizeSeoText(value: string) {
  return cleanSeoText(value, Number.MAX_SAFE_INTEGER)
}

function fitSeoTitle(value: string) {
  const cleaned = normalizeSeoText(value)
  if (cleaned.length <= 60) return cleaned

  const suffix = cleaned.endsWith(' | Autorell') ? ' | Autorell' : ''
  const available = 60 - suffix.length
  const candidate = cleaned.slice(0, available).trimEnd()
  const wordBoundary = candidate.lastIndexOf(' ')
  const shortened = wordBoundary >= Math.max(24, available - 18)
    ? candidate.slice(0, wordBoundary)
    : candidate
  const withoutDanglingConnector = shortened
    .replace(/[\s,;:.-]+$/g, '')
    .replace(/\s+(?:a|de|en|for|i|in|of|oder|eller|o|or|ou|til|w)$/i, '')
  return `${withoutDanglingConnector}${suffix}`
}

function fitSeoDescription(value: string) {
  const cleaned = normalizeSeoText(value)
  if (cleaned.length <= 155) return cleaned

  const candidate = cleaned.slice(0, 152).trimEnd()
  const wordBoundary = candidate.lastIndexOf(' ')
  const shortened = wordBoundary >= 120 ? candidate.slice(0, wordBoundary) : candidate
  return `${shortened.replace(/[\s,;:.-]+$/g, '')}...`
}

export const resolveSeoMarketplaceRoute = resolveGeoLandingRoute

export function isGeoLandingCandidate(
  market: string,
  categorySlug: string | undefined,
  segments: string[] | undefined,
) {
  const config = marketRouteConfigs[normalizeSegment(market)]
  return Boolean(config && categorySlug && config.categories[normalizeSegment(categorySlug)] && (segments?.length || 0) <= 3)
}

export function buildGeoMarketplaceHref(landing: GeoLandingRoute) {
  const params = new URLSearchParams()
  params.set('categories', landing.category)
  params.set('markets', landing.countryCode)
  params.set('mode', landing.leasing ? 'leasing' : 'sale')
  params.set('offerType', landing.leasing ? 'lease' : 'sale')
  if (landing.place) {
    params.set('geoAreaId', landing.place.id)
    params.set('geoFilterMode', 'strict')
    params.set('chips', landing.place.name)
  }
  if (landing.make) params.set('make', landing.make)
  if (landing.model) params.set('model', landing.model)
  const marketPrefix = landing.market === 'en' ? '' : `/${landing.market}`
  return `${marketPrefix}/marketplace/${landing.category}?${params.toString()}`
}

export function buildSeoMarketplaceSearchParams(landing: GeoLandingRoute) {
  const params: Record<string, string | string[]> = {
    categories: landing.category,
    markets: landing.countryCode,
    mode: landing.leasing ? 'leasing' : 'sale',
    offerType: landing.leasing ? 'lease' : 'sale',
  }
  if (landing.make) params.make = landing.make
  if (landing.model) params.model = landing.model
  if (landing.place) {
    params.geoAreaId = landing.place.id
    params.geoFilterMode = 'strict'
    params.chips = landing.place.name
  }
  return params
}

export function buildSeoMarketplacePath({
  market,
  categorySlug,
  make,
  model,
  placeSlug,
}: {
  market: string
  categorySlug: string
  make?: string | null
  model?: string | null
  placeSlug?: string | null
}) {
  return `/${[
    normalizeSegment(market),
    normalizeSegment(categorySlug),
    make ? slugify(make) : '',
    model ? slugify(model) : '',
    placeSlug ? slugify(placeSlug) : '',
  ].filter(Boolean).join('/')}`
}

export function getSeoCategoryPath(
  market: string,
  category: MarketplaceCategorySlug,
  leasing = false,
) {
  const normalizedMarket = normalizeSegment(market)
  const config = marketRouteConfigs[normalizedMarket]
  if (!config) return null
  const entry = Object.entries(config.categories).find(
    ([, route]) => route.category === category && Boolean(route.leasing) === leasing,
  )
  return entry ? `/${normalizedMarket}/${entry[0]}` : null
}

export function getSeoSitemapMakes(category: MarketplaceCategorySlug) {
  const allowed = new Set(brandSuggestionsForCategory(category))
  return (sitemapMakesByCategory[category] || []).filter((make) => allowed.has(make))
}

export function getSeoSitemapModels(category: MarketplaceCategorySlug, modelsPerMake = 2) {
  if (category !== 'cars') return []
  return Object.entries(seoModelsByMake)
    .filter(([make]) => getSeoSitemapMakes('cars').includes(make))
    .flatMap(([make, models]) => models.slice(0, modelsPerMake).map((model) => ({ make, model })))
}

export function shouldIncludeInSitemap({
  category,
  make,
  model,
  place,
}: Pick<GeoLandingRoute, 'category' | 'make' | 'model' | 'place'>) {
  if (make && !resolveCategoryMake(category, slugify(make))) return false
  if (model && (!make || !resolveMakeModel(category, make, slugify(model)))) return false
  const collidingMake = place?.slug && !make
    ? resolveCategoryMake(category, place.slug)
    : null
  if (collidingMake && getSeoSitemapMakes(category).includes(collidingMake)) return false

  const collidingModel = place?.slug && make && !model
    ? resolveMakeModel(category, make, place.slug)
    : null
  if (collidingModel && getSeoSitemapModels(category).some(
    (entry) => entry.make === make && entry.model === collidingModel,
  )) return false
  return !place || Boolean(place.slug && place.countryCode)
}

export function getGeoSitemapMarketCodes() {
  return Object.keys(marketRouteConfigs).sort()
}

export function getEnglishSeoSitemapAreas() {
  if (cachedEnglishSeoSitemapAreas) return cachedEnglishSeoSitemapAreas
  cachedEnglishSeoSitemapAreas = englishSeoCountries.flatMap((country) =>
    getSeoSitemapAreas(country.countryCode).map((area) => ({ country, area })),
  )
  return cachedEnglishSeoSitemapAreas
}

export function getEnglishSeoSitemapAreaCount() {
  return englishSeoCountries.reduce(
    (total, country) => total + getSeoSitemapAreas(country.countryCode).length,
    0,
  )
}

export function buildEnglishSeoMarketplacePath({
  categorySlug,
  countrySlug,
  make,
  model,
  placeSlug,
}: {
  categorySlug: string
  countrySlug: string
  make?: string | null
  model?: string | null
  placeSlug?: string | null
}) {
  return `/${[
    normalizeSegment(categorySlug),
    normalizeSegment(countrySlug),
    make ? slugify(make) : '',
    model ? slugify(model) : '',
    placeSlug ? slugify(placeSlug) : '',
  ].filter(Boolean).join('/')}`
}

export function getGeoSitemapMarketConfig(market: string): GeoSitemapMarketConfig | null {
  const normalizedMarket = normalizeSegment(market)
  const config = marketRouteConfigs[normalizedMarket]
  if (!config) return null
  return {
    market: normalizedMarket,
    countryCode: config.countryCode,
    categorySlugs: Object.keys(config.categories),
    categories: Object.entries(config.categories).map(([slug, route]) => ({
      slug,
      category: route.category,
      leasing: Boolean(route.leasing),
    })),
  }
}

async function resolveEnglishGeoLandingRoute(
  categorySlug: string | undefined,
  segments: string[] | undefined,
): Promise<GeoLandingRoute | null> {
  const normalizedCategorySlug = normalizeSegment(categorySlug || '')
  const categoryRoute = englishMarketRouteConfig.categories[
    normalizedCategorySlug as keyof typeof englishMarketRouteConfig.categories
  ]
  const normalizedSegments = (segments || []).map((segment) => normalizeSegment(segment)).filter(Boolean)
  if (!categoryRoute || normalizedSegments.length < 1 || normalizedSegments.length > 4) return null

  const country = englishSeoCountries.find((entry) => entry.slug === normalizedSegments[0])
  if (!country) return null

  const routeSegments = normalizedSegments.slice(1)
  let make: string | null = null
  let model: string | null = null
  let place: MarketplaceGeoArea | null = null

  if (routeSegments.length === 1) {
    make = resolveCategoryMake(categoryRoute.category, routeSegments[0])
    if (!make) place = await resolveGeoLandingPlace(country.countryCode, routeSegments[0])
    if (!make && !place) return null
  }

  if (routeSegments.length >= 2) {
    make = resolveCategoryMake(categoryRoute.category, routeSegments[0])
    if (!make) return null
    model = resolveMakeModel(categoryRoute.category, make, routeSegments[1])
    if (!model) place = await resolveGeoLandingPlace(country.countryCode, routeSegments[1])
    if (!model && !place) return null
  }

  if (routeSegments.length === 3) {
    if (!make || !model) return null
    place = await resolveGeoLandingPlace(country.countryCode, routeSegments[2])
    if (!place) return null
  }

  const categoryLabel = capitalize(categoryRoute.plural)
  const subject = model ? `${make} ${model}` : make || categoryLabel
  const scope = place?.name || country.name
  const copy = buildLocalizedSeoCopy('en', subject, scope, !place)
  const canonicalPath = buildEnglishSeoMarketplacePath({
    categorySlug: normalizedCategorySlug,
    countrySlug: country.slug,
    make,
    model,
    placeSlug: place?.slug,
  })
  const countryPath = buildEnglishSeoMarketplacePath({
    categorySlug: normalizedCategorySlug,
    countrySlug: country.slug,
  })
  const breadcrumbs: SeoLandingLink[] = [
    { label: 'Europe', href: '/' },
    { label: `${categoryLabel} in ${country.name}`, href: countryPath },
  ]
  if (make) {
    breadcrumbs.push({
      label: make,
      href: buildEnglishSeoMarketplacePath({
        categorySlug: normalizedCategorySlug,
        countrySlug: country.slug,
        make,
      }),
    })
  }
  if (model) {
    breadcrumbs.push({
      label: `${make} ${model}`,
      href: buildEnglishSeoMarketplacePath({
        categorySlug: normalizedCategorySlug,
        countrySlug: country.slug,
        make,
        model,
      }),
    })
  }
  if (place) breadcrumbs.push({ label: place.name, href: canonicalPath })

  const relatedLinks = getSeoSitemapMakes(categoryRoute.category)
    .filter((relatedMake) => relatedMake !== make)
    .slice(0, 8)
    .map((relatedMake) => ({
      label: `${relatedMake} for sale in ${place?.name || country.name}`,
      href: buildEnglishSeoMarketplacePath({
        categorySlug: normalizedCategorySlug,
        countrySlug: country.slug,
        make: relatedMake,
        placeSlug: place?.slug,
      }),
    }))

  return {
    market: 'en',
    locale: 'en',
    countryCode: country.countryCode,
    category: categoryRoute.category,
    categorySlug: normalizedCategorySlug,
    categoryLabel,
    leasing: false,
    place,
    makeSlug: make ? slugify(make) : null,
    make,
    modelSlug: model ? slugify(model) : null,
    model,
    routeKind: getRouteKind({ make, model, place }),
    canonicalPath,
    h1: copy.h1,
    title: fitSeoTitle(`${copy.h1} | Autorell`),
    description: fitSeoDescription(copy.description),
    zeroResultsText: copy.zeroResults,
    breadcrumbs: dedupeLinks(breadcrumbs),
    relatedLinks: dedupeLinks(relatedLinks).filter((link) => link.href !== canonicalPath),
  }
}

function resolveCategoryMake(categorySlug: MarketplaceCategorySlug, rawSlug: string) {
  const normalizedSlug = makeSlugAliases[slugify(rawSlug)] || slugify(rawSlug)
  return (
    brandSuggestionsForCategory(categorySlug).find((make) => slugify(make) === normalizedSlug) ||
    null
  )
}

function resolveMakeModel(
  categorySlug: MarketplaceCategorySlug,
  make: string,
  rawSlug: string,
) {
  if (categorySlug !== 'cars') return null
  const normalizedSlug = slugify(rawSlug)
  return (seoModelsByMake[make] || []).find((model) => slugify(model) === normalizedSlug) || null
}

function getRouteKind({
  make,
  model,
  place,
}: Pick<GeoLandingRoute, 'make' | 'model' | 'place'>): GeoLandingRoute['routeKind'] {
  if (make && model && place) return 'category-make-model-location'
  if (make && model) return 'category-make-model'
  if (make && place) return 'category-make-location'
  if (make) return 'category-make'
  if (place) return 'category-location'
  return 'category'
}

function buildBreadcrumbs({
  market,
  countryName,
  categorySlug,
  categoryLabel,
  make,
  model,
  place,
  canonicalPath,
}: {
  market: string
  countryName: string
  categorySlug: string
  categoryLabel: string
  make: string | null
  model: string | null
  place: MarketplaceGeoArea | null
  canonicalPath: string
}) {
  const links: SeoLandingLink[] = [
    { label: countryName, href: `/${market}` },
    { label: categoryLabel, href: buildSeoMarketplacePath({ market, categorySlug }) },
  ]
  if (make) {
    links.push({
      label: make,
      href: buildSeoMarketplacePath({ market, categorySlug, make }),
    })
  }
  if (model) {
    links.push({
      label: `${make} ${model}`,
      href: buildSeoMarketplacePath({ market, categorySlug, make, model }),
    })
  }
  if (place) links.push({ label: place.name, href: canonicalPath })
  return dedupeLinks(links)
}

function buildRelatedLinks({
  market,
  locale,
  countryName,
  category,
  categorySlug,
  categoryLabel,
  leasing,
  make,
  model,
  place,
  canonicalPath,
}: {
  market: string
  locale: PublicLocale
  countryName: string
  category: MarketplaceCategorySlug
  categorySlug: string
  categoryLabel: string
  leasing: boolean
  make: string | null
  model: string | null
  place: MarketplaceGeoArea | null
  canonicalPath: string
}) {
  const links: SeoLandingLink[] = []
  const add = (targetMake?: string | null, targetModel?: string | null, targetPlace: MarketplaceGeoArea | null = place) => {
    const subject = targetModel
      ? `${targetMake} ${targetModel}`
      : targetMake || categoryLabel
    const scope = targetPlace?.name || countryName
    links.push({
      label: buildLocalizedSeoCopy(
        locale,
        subject,
        scope,
        !targetPlace,
        leasing,
      ).h1,
      href: buildSeoMarketplacePath({
        market,
        categorySlug,
        make: targetMake,
        model: targetModel,
        placeSlug: targetPlace?.slug,
      }),
    })
  }

  if (place && (make || model)) add(null, null, place)
  if (make && place) add(make, null, null)
  if (model) add(make, null, place)

  for (const relatedMake of getSeoSitemapMakes(category)) {
    if (relatedMake === make) continue
    add(relatedMake, null, place)
    if (links.length >= 5) break
  }

  if (make) {
    for (const relatedModel of (seoModelsByMake[make] || []).slice(0, 3)) {
      if (relatedModel === model) continue
      add(make, relatedModel, place)
      if (links.length >= 8) break
    }
  }

  return dedupeLinks(links).filter((link) => link.href !== canonicalPath).slice(0, 8)
}

function dedupeLinks(links: SeoLandingLink[]) {
  const seen = new Set<string>()
  return links.filter((link) => {
    if (seen.has(link.href)) return false
    seen.add(link.href)
    return true
  })
}

function buildLocalizedSeoCopy(
  locale: PublicLocale,
  subject: string,
  scope: string,
  countryScope: boolean,
  leasing = false,
) {
  if (leasing) return buildLocalizedLeasingSeoCopy(locale, subject, scope)
  const copy = {
    sv: {
      h1: `${subject} till salu i ${scope}`,
      description: `Utforska utbudet: ${subject} till salu i ${scope}. J\u00e4mf\u00f6r aktuella annonser fr\u00e5n privatpersoner och f\u00f6retag p\u00e5 Autorell.`,
      zeroResults: `Inga annonser f\u00f6r ${subject} i ${scope} just nu`,
    },
    de: {
      h1: `${subject} kaufen in ${scope}`,
      description: `${subject} in ${scope} suchen und vergleichen. Finden Sie aktuelle Angebote von privaten und gewerblichen Verk\u00e4ufern auf Autorell.`,
      zeroResults: `Derzeit keine Anzeigen f\u00fcr ${subject} in ${scope}`,
    },
    at: {
      h1: `${subject} kaufen in ${scope}`,
      description: `${subject} in ${scope} suchen und vergleichen. Finden Sie aktuelle Angebote von privaten und gewerblichen Verk\u00e4ufern auf Autorell.`,
      zeroResults: `Derzeit keine Anzeigen f\u00fcr ${subject} in ${scope}`,
    },
    fr: {
      h1: `${subject} \u00e0 vendre - ${scope}`,
      description: `D\u00e9couvrez les annonces : ${subject} \u00e0 vendre - ${scope}. Comparez les offres actuelles des particuliers et des professionnels sur Autorell.`,
      zeroResults: `Aucune annonce pour ${subject} ${countryScope ? 'en' : '\u00e0'} ${scope} pour le moment`,
    },
    it: {
      h1: `${subject} in vendita - ${scope}`,
      description: `Scopri gli annunci: ${subject} in vendita - ${scope}. Confronta le offerte attuali di privati e professionisti su Autorell.`,
      zeroResults: `Nessun annuncio per ${subject} ${countryScope ? 'in' : 'a'} ${scope} al momento`,
    },
    es: {
      h1: `${subject} en venta en ${scope}`,
      description: `Explora los anuncios: ${subject} en venta en ${scope}. Compara ofertas actuales de particulares y profesionales en Autorell.`,
      zeroResults: `No hay anuncios de ${subject} en ${scope} ahora mismo`,
    },
    nl: {
      h1: `${subject} te koop in ${scope}`,
      description: `Bekijk het aanbod: ${subject} te koop in ${scope}. Vergelijk actuele advertenties van particuliere en zakelijke verkopers op Autorell.`,
      zeroResults: `Momenteel geen advertenties voor ${subject} in ${scope}`,
    },
    be: {
      h1: `${subject} te koop in ${scope}`,
      description: `Bekijk het aanbod: ${subject} te koop in ${scope}. Vergelijk actuele advertenties van particuliere en zakelijke verkopers op Autorell.`,
      zeroResults: `Momenteel geen advertenties voor ${subject} in ${scope}`,
    },
    pl: {
      h1: `${subject} na sprzeda\u017c - ${scope}`,
      description: `Sprawd\u017a oferty: ${subject} na sprzeda\u017c - ${scope}. Por\u00f3wnaj aktualne og\u0142oszenia prywatne i firmowe w Autorell.`,
      zeroResults: `Obecnie brak og\u0142osze\u0144 dla ${subject} - ${scope}`,
    },
    da: {
      h1: `${subject} til salg i ${scope}`,
      description: `Se udvalget: ${subject} til salg i ${scope}. Sammenlign aktuelle annoncer fra private s\u00e6lgere og virksomheder p\u00e5 Autorell.`,
      zeroResults: `Ingen annoncer for ${subject} i ${scope} lige nu`,
    },
    fi: {
      h1: `${subject} myynniss\u00e4 - ${scope}`,
      description: `Tutustu tarjontaan: ${subject} myynniss\u00e4 - ${scope}. Vertaile yksityisten ja yritysten ajankohtaisia ilmoituksia Autorellissa.`,
      zeroResults: `Ei ilmoituksia haulle ${subject} - ${scope}`,
    },
    en: {
      h1: `${subject} for sale in ${scope}`,
      description: `Browse ${subject} for sale in ${scope}. Compare current listings from private and business sellers on Autorell.`,
      zeroResults: `No listings for ${subject} in ${scope} right now`,
    },
  } satisfies Record<PublicLocale, { h1: string; description: string; zeroResults: string }>
  return copy[locale] || copy.en
}

function buildLocalizedLeasingSeoCopy(
  locale: PublicLocale,
  subject: string,
  scope: string,
) {
  const effectiveLocale = locale === 'at' ? 'de' : locale === 'be' ? 'nl' : locale
  const copy = {
    sv: {
      h1: `${subject} f\u00f6r leasing i ${scope}`,
      description: `Hitta ${subject} f\u00f6r leasing i ${scope}. J\u00e4mf\u00f6r aktuella leasingannonser fr\u00e5n anslutna f\u00f6retag p\u00e5 Autorell.`,
      zeroResults: `Inga leasingannonser f\u00f6r ${subject} i ${scope} just nu`,
    },
    de: {
      h1: `${subject} in ${scope} leasen`,
      description: `${subject} in ${scope} leasen und aktuelle Angebote von gewerblichen Anbietern auf Autorell vergleichen.`,
      zeroResults: `Derzeit keine Leasingangebote f\u00fcr ${subject} in ${scope}`,
    },
    fr: {
      h1: `${subject} en leasing - ${scope}`,
      description: `D\u00e9couvrez les offres : ${subject} en leasing - ${scope}. Comparez les offres actuelles des professionnels sur Autorell.`,
      zeroResults: `Aucune offre de leasing pour ${subject} \u00e0 ${scope} pour le moment`,
    },
    it: {
      h1: `${subject} in leasing - ${scope}`,
      description: `Scopri le offerte: ${subject} in leasing - ${scope}. Confronta le proposte attuali delle aziende su Autorell.`,
      zeroResults: `Nessuna offerta di leasing per ${subject} a ${scope} al momento`,
    },
    es: {
      h1: `${subject} en leasing en ${scope}`,
      description: `Explora las ofertas: ${subject} en leasing en ${scope}. Compara propuestas actuales de empresas en Autorell.`,
      zeroResults: `No hay ofertas de leasing de ${subject} en ${scope} ahora mismo`,
    },
    nl: {
      h1: `${subject} leasen in ${scope}`,
      description: `Bekijk het leaseaanbod: ${subject} leasen in ${scope}. Vergelijk actuele aanbiedingen van zakelijke verkopers op Autorell.`,
      zeroResults: `Momenteel geen leaseaanbiedingen voor ${subject} in ${scope}`,
    },
    pl: {
      h1: `${subject} w leasingu - ${scope}`,
      description: `Sprawd\u017a oferty: ${subject} w leasingu - ${scope}. Por\u00f3wnaj aktualne propozycje firmowe w Autorell.`,
      zeroResults: `Obecnie brak ofert leasingu dla ${subject} - ${scope}`,
    },
    da: {
      h1: `${subject} til leasing i ${scope}`,
      description: `Se leasingudvalget: ${subject} til leasing i ${scope}. Sammenlign aktuelle tilbud fra virksomheder p\u00e5 Autorell.`,
      zeroResults: `Ingen leasingtilbud for ${subject} i ${scope} lige nu`,
    },
    fi: {
      h1: `${subject} leasingiin - ${scope}`,
      description: `Tutustu leasingtarjontaan: ${subject} leasingiin - ${scope}. Vertaile yritysten ajankohtaisia tarjouksia Autorellissa.`,
      zeroResults: `Ei leasingilmoituksia haulle ${subject} - ${scope}`,
    },
    en: {
      h1: `${subject} for leasing in ${scope}`,
      description: `Find ${subject} for leasing in ${scope}. Compare current offers from business sellers on Autorell.`,
      zeroResults: `No leasing listings for ${subject} in ${scope} right now`,
    },
  } satisfies Record<Exclude<PublicLocale, 'at' | 'be'>, { h1: string; description: string; zeroResults: string }>
  return copy[effectiveLocale]
}

function category(categorySlug: MarketplaceCategorySlug, plural: string): GeoCategoryRoute {
  return { category: categorySlug, plural }
}

function leasingCategory(categorySlug: MarketplaceCategorySlug, plural: string): GeoCategoryRoute {
  return { category: categorySlug, plural, leasing: true }
}

async function resolveGeoLandingPlace(countryCode: string, placeSlug: string) {
  const staticPlace = resolveMarketplaceGeoAreaBySlug(countryCode, placeSlug)
  if (staticPlace) return staticPlace

  const datasetPlace = resolveStaticMarketplaceGeoAreaBySlug(countryCode, placeSlug)
  if (datasetPlace) return datasetPlace

  const sitemapPlace = getSeoSitemapAreas(countryCode).find(
    (area) => area.slug === marketplaceGeoSlug(placeSlug),
  )
  if (sitemapPlace) return sitemapPlace

  const [regions, places] = await Promise.all([
    getGeoRegions(countryCode),
    searchGeoPlaces({
      countryCode,
      query: placeSlug.replace(/-/g, ' '),
      limit: 50,
    }),
  ])
  const normalizedSlug = slugify(placeSlug)
  const region = regions.find((item) => slugify(item.code) === normalizedSlug || slugify(item.name) === normalizedSlug)
  if (region) {
    return {
      id: `${countryCode}:region:${region.code}`,
      countryCode,
      level: 'region',
      name: region.name,
      code: region.code,
      slug: normalizedSlug,
      region: region.name,
      centroid: countryCentroid(countryCode),
      bounds: countryBounds(countryCode),
      aliases: [region.code, region.name, normalizedSlug],
    } satisfies MarketplaceGeoArea
  }

  const place = places.find((item) => slugify(item.code.split(':').pop() || item.code) === normalizedSlug || slugify(item.name) === normalizedSlug || slugify(item.city) === normalizedSlug)
  if (!place) return null

  return {
    id: `${countryCode}:locality:${place.code}`,
    countryCode,
    level: 'locality',
    name: place.name,
    code: place.code,
    slug: normalizedSlug,
    region: place.regionName,
    municipality: place.name,
    locality: place.city || place.name,
    postalCode: place.postalCode || undefined,
    centroid: countryCentroid(countryCode),
    bounds: countryBounds(countryCode),
    aliases: [place.code, place.name, place.city, normalizedSlug].filter(Boolean),
  } satisfies MarketplaceGeoArea
}

function deMarket(locale: 'de' | 'at', countryCode: 'DE' | 'AT'): GeoMarketRouteConfig {
  return {
    locale,
    countryCode,
    categories: {
      autos: category('cars', 'Autos'),
      transporter: category('vans', 'Transporter'),
      motorraeder: category('motorcycles', 'Motorr\u00e4der'),
      wohnmobile: category('motorhomes', 'Wohnmobile'),
      wohnwagen: category('caravans', 'Wohnwagen'),
      lkw: category('trucks', 'Lkw'),
      landmaschinen: category('agriculture', 'Landmaschinen'),
      baumaschinen: category('construction', 'Baumaschinen'),
      fahrraeder: category('electric-bikes', 'Fahrr\u00e4der'),
      leasingautos: leasingCategory('cars', 'Leasingautos'),
      leasingtransporter: leasingCategory('vans', 'Leasingtransporter'),
      leasinglkw: leasingCategory('trucks', 'Leasing-Lkw'),
      leasinglandmaschinen: leasingCategory('agriculture', 'Leasing-Landmaschinen'),
      leasingbaumaschinen: leasingCategory('construction', 'Leasing-Baumaschinen'),
    },
    title: (subject, place) => `${subject} kaufen in ${place}`,
    description: (subject, place) =>
      `${subject} in ${place} kaufen. Vergleichen Sie Fahrzeuge von privaten Verk\u00e4ufern und Unternehmen auf Autorell.`,
    zeroResults: (subject, place) => `Keine Anzeigen f\u00fcr ${subject} in ${place} im Moment`,
  }
}

function nlMarket(locale: 'nl' | 'be', countryCode: 'NL' | 'BE'): GeoMarketRouteConfig {
  return {
    locale,
    countryCode,
    categories: {
      autos: category('cars', "auto's"),
      bestelwagens: category('vans', 'bestelwagens'),
      motoren: category('motorcycles', 'motoren'),
      campers: category('motorhomes', 'campers'),
      caravans: category('caravans', 'caravans'),
      vrachtwagens: category('trucks', 'vrachtwagens'),
      landbouwmachines: category('agriculture', 'landbouwmachines'),
      bouwmachines: category('construction', 'bouwmachines'),
      'elektrische-fietsen': category('electric-bikes', 'elektrische fietsen'),
      leaseautos: leasingCategory('cars', "leaseauto's"),
      leasebestelwagens: leasingCategory('vans', 'leasebestelwagens'),
      leasevrachtwagens: leasingCategory('trucks', 'leasevrachtwagens'),
      leaselandbouwmachines: leasingCategory('agriculture', 'leaselandbouwmachines'),
      leasebouwmachines: leasingCategory('construction', 'leasebouwmachines'),
    },
    title: (subject, place) => `${subject} te koop in ${place}`,
    description: (subject, place) =>
      `Bekijk ${lower(subject)} te koop in ${place}. Vergelijk voertuigen van particulieren en bedrijven op Autorell.`,
    zeroResults: (subject, place) => `Geen advertenties voor ${lower(subject)} in ${place} op dit moment`,
  }
}

function normalizeSegment(value: string | undefined) {
  return String(value || '').trim().toLowerCase()
}

const routeCountryBounds: Record<string, { centroid: MarketplaceGeoArea['centroid']; bounds: MarketplaceGeoArea['bounds'] }> = {
  AT: { centroid: { latitude: 47.6, longitude: 14.1 }, bounds: { north: 49.1, east: 17.2, south: 46.3, west: 9.5 } },
  BE: { centroid: { latitude: 50.6, longitude: 4.7 }, bounds: { north: 51.5, east: 6.4, south: 49.5, west: 2.5 } },
  DE: { centroid: { latitude: 51.2, longitude: 10.4 }, bounds: { north: 55.1, east: 15.1, south: 47.2, west: 5.8 } },
  DK: { centroid: { latitude: 56.1, longitude: 10 }, bounds: { north: 57.8, east: 15.2, south: 54.5, west: 8 } },
  ES: { centroid: { latitude: 40.4, longitude: -3.7 }, bounds: { north: 43.8, east: 4.4, south: 36, west: -9.4 } },
  FI: { centroid: { latitude: 64.5, longitude: 26 }, bounds: { north: 70.1, east: 31.6, south: 59.7, west: 19.1 } },
  FR: { centroid: { latitude: 46.6, longitude: 2.3 }, bounds: { north: 51.2, east: 8.3, south: 41.3, west: -5.2 } },
  IT: { centroid: { latitude: 42.8, longitude: 12.5 }, bounds: { north: 47.1, east: 18.8, south: 36.6, west: 6.6 } },
  NL: { centroid: { latitude: 52.1, longitude: 5.3 }, bounds: { north: 53.7, east: 7.3, south: 50.7, west: 3.3 } },
  PL: { centroid: { latitude: 52.1, longitude: 19.4 }, bounds: { north: 54.9, east: 24.2, south: 49, west: 14.1 } },
  SE: { centroid: { latitude: 62, longitude: 15 }, bounds: { north: 69.1, east: 24.2, south: 55.2, west: 10.6 } },
}

function countryCentroid(countryCode: string) {
  return routeCountryBounds[countryCode]?.centroid || { latitude: 50, longitude: 10 }
}

function countryBounds(countryCode: string) {
  return routeCountryBounds[countryCode]?.bounds || { north: 72, east: 32, south: 35, west: -10 }
}

function slugify(value: string) {
  return marketplaceGeoSlug(value)
}

function capitalize(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value
}

function lower(value: string) {
  return value.toLocaleLowerCase()
}
