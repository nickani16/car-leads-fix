import 'server-only'

import {
  marketplaceCategories,
  marketplaceLanguage,
  type MarketplaceCategorySlug,
} from '@/lib/marketplace'
import { defaultSearchCountryForLocale } from '@/lib/market-locale'
import {
  isPublicLanguage,
  localizePublicHref,
  type PublicLocale,
} from '@/lib/public-i18n'
import { swedishCounties as swedishLocationCounties } from '@/lib/swedish-locations'

export type PublicSearchEntry = {
  href: string
  title: string
  description: string
  keywords: string
  type: 'category' | 'listing' | 'place' | 'make' | 'model' | 'vehicle-query'
}

export type ListingSearchProvider =
  | 'supabase'
  | 'meilisearch'
  | 'typesense'
  | 'algolia'
  | 'opensearch'

export type PublicSearchInput = {
  locale?: string | null
  query?: string | null
  limit?: number
  provider?: ListingSearchProvider
  market?: string | null
}

type PublicSearchCacheEntry = {
  expiresAt: number
  results: PublicSearchEntry[]
}

type VehicleLocation = {
  country: string
  region?: string
  municipality?: string
  city?: string
  postalCode?: string
}

type VehicleMake = {
  make: string
  models?: string[]
}

type DetectedVehicleQuery = {
  category?: MarketplaceCategorySlug
  make?: VehicleMake
  model?: string
  location?: VehicleLocation
  usesAllEurope: boolean
}

const PUBLIC_SEARCH_CACHE_VERSION = 'vehicle-structured-v3'
const PUBLIC_SEARCH_CACHE_TTL_MS = 60_000

const locationStopWords = new Set([
  'i',
  'in',
  'en',
  'im',
  'pa',
  'paa',
  'auf',
  'kommun',
  'commune',
  'municipality',
  'city',
  'stad',
  'ort',
  'region',
  'provins',
  'province',
])

const europeTerms = new Set(['eu', 'europe', 'europa', 'europeiska', 'europeo', 'europaweit'])

const categoryAliases: Record<MarketplaceCategorySlug, string[]> = {
  cars: ['bil', 'bilar', 'personbil', 'auto', 'autos', 'car', 'cars', 'coche', 'coches', 'turismo', 'turismos'],
  vans: ['transportbil', 'transportbilar', 'skapbil', 'skapbilar', 'van', 'vans', 'furgoneta', 'furgonetas', 'transporter'],
  motorcycles: ['motorcykel', 'motorcyklar', 'mc', 'moto', 'motos', 'motorrad', 'motorrader', 'motorcycle', 'motorcycles'],
  motorhomes: ['husbil', 'husbilar', 'camper', 'campers', 'autocaravana', 'autocaravanas', 'wohnmobil', 'wohnmobile'],
  caravans: ['husvagn', 'husvagnar', 'caravan', 'caravans', 'caravana', 'caravanas', 'wohnwagen'],
  trucks: ['lastbil', 'lastbilar', 'truck', 'trucks', 'lorry', 'lkw', 'camion', 'camiones'],
  agriculture: ['lantbruk', 'lantbruksmaskin', 'lantbruksmaskiner', 'traktor', 'tractor', 'tractores', 'landmaschinen'],
  construction: ['entreprenad', 'entreprenadmaskin', 'entreprenadmaskiner', 'construction', 'baumaschinen', 'maquinaria'],
  'electric-bikes': ['cykel', 'cyklar', 'elcykel', 'elcyklar', 'bike', 'bikes', 'bicycle', 'bicicleta', 'bicicletas', 'fahrrad', 'fahrrader'],
  'e-scooters': ['sparkcykel', 'sparkcyklar', 'elsparkcykel', 'elsparkcyklar', 'scooter', 'scooters', 'patinete', 'patinetes'],
}

const categoryLocalLabels: Record<string, Partial<Record<MarketplaceCategorySlug, string>>> = {
  sv: {
    cars: 'Bilar',
    vans: 'Transportbilar',
    motorcycles: 'Motorcyklar',
    motorhomes: 'Husbilar',
    caravans: 'Husvagnar',
    trucks: 'Lastbilar',
    agriculture: 'Lantbruksmaskiner',
    construction: 'Entreprenadmaskiner',
    'electric-bikes': 'Cyklar',
    'e-scooters': 'Sparkcyklar',
  },
  es: {
    cars: 'Coches',
    vans: 'Furgonetas',
    motorcycles: 'Motos',
    motorhomes: 'Autocaravanas',
    caravans: 'Caravanas',
    trucks: 'Camiones',
    agriculture: 'Maquinaria agricola',
    construction: 'Maquinaria de construccion',
    'electric-bikes': 'Bicicletas',
    'e-scooters': 'Patinetes',
  },
  de: {
    cars: 'Autos',
    vans: 'Transporter',
    motorcycles: 'Motorrader',
    motorhomes: 'Wohnmobile',
    caravans: 'Wohnwagen',
    trucks: 'Lkw',
    agriculture: 'Landmaschinen',
    construction: 'Baumaschinen',
    'electric-bikes': 'Fahrrader',
    'e-scooters': 'Scooter',
  },
}

const swedishVehicleLocations: VehicleLocation[] = swedishLocationCounties.flatMap((county) =>
  county.municipalities.map((municipality) => ({
    country: 'SE',
    region: county.name,
    municipality,
    city: municipality,
  })),
)

const vehicleLocationsByCountry: Record<string, VehicleLocation[]> = {
  SE: swedishVehicleLocations,
  ES: [
    { country: 'ES', region: 'Comunidad de Madrid', city: 'Madrid' },
    { country: 'ES', region: 'Cataluna', city: 'Barcelona' },
    { country: 'ES', region: 'Comunitat Valenciana', city: 'Valencia' },
    { country: 'ES', region: 'Andalucia', city: 'Sevilla' },
    { country: 'ES', region: 'Aragon', city: 'Zaragoza' },
  ],
  DE: [
    { country: 'DE', region: 'Berlin', city: 'Berlin' },
    { country: 'DE', region: 'Bayern', city: 'Munchen' },
    { country: 'DE', region: 'Hamburg', city: 'Hamburg' },
    { country: 'DE', region: 'Nordrhein-Westfalen', city: 'Koln' },
    { country: 'DE', region: 'Hessen', city: 'Frankfurt am Main' },
  ],
  PL: [
    { country: 'PL', region: 'Mazowieckie', city: 'Warszawa' },
    { country: 'PL', region: 'Malopolskie', city: 'Krakow' },
    { country: 'PL', region: 'Dolnoslaskie', city: 'Wroclaw' },
  ],
  FR: [
    { country: 'FR', region: 'Ile-de-France', city: 'Paris' },
    { country: 'FR', region: 'Auvergne-Rhone-Alpes', city: 'Lyon' },
    { country: 'FR', region: 'Provence-Alpes-Cote d Azur', city: 'Marseille' },
  ],
  IT: [
    { country: 'IT', region: 'Lazio', city: 'Roma' },
    { country: 'IT', region: 'Lombardia', city: 'Milano' },
    { country: 'IT', region: 'Piemonte', city: 'Torino' },
  ],
  NL: [
    { country: 'NL', region: 'Noord-Holland', city: 'Amsterdam' },
    { country: 'NL', region: 'Zuid-Holland', city: 'Rotterdam' },
    { country: 'NL', region: 'Utrecht', city: 'Utrecht' },
  ],
  BE: [
    { country: 'BE', region: 'Brussels', city: 'Brussel' },
    { country: 'BE', region: 'Vlaanderen', city: 'Antwerpen' },
    { country: 'BE', region: 'Wallonie', city: 'Liege' },
  ],
  AT: [
    { country: 'AT', region: 'Wien', city: 'Wien' },
    { country: 'AT', region: 'Steiermark', city: 'Graz' },
    { country: 'AT', region: 'Oberosterreich', city: 'Linz' },
  ],
  DK: [
    { country: 'DK', region: 'Hovedstaden', city: 'Kobenhavn' },
    { country: 'DK', region: 'Midtjylland', city: 'Aarhus' },
    { country: 'DK', region: 'Syddanmark', city: 'Odense' },
  ],
  FI: [
    { country: 'FI', region: 'Uusimaa', city: 'Helsinki' },
    { country: 'FI', region: 'Pirkanmaa', city: 'Tampere' },
    { country: 'FI', region: 'Varsinais-Suomi', city: 'Turku' },
  ],
}

const vehicleMakes: VehicleMake[] = [
  { make: 'Volvo', models: ['XC60', 'V60', 'XC90', 'V90'] },
  { make: 'BMW', models: ['320', '520', 'X3', 'X5'] },
  { make: 'Mercedes-Benz', models: ['C-Klass', 'E-Klass', 'Sprinter', 'Actros'] },
  { make: 'Volkswagen', models: ['Golf', 'Passat', 'Transporter', 'Crafter'] },
  { make: 'Audi', models: ['A4', 'A6', 'Q5'] },
  { make: 'Toyota', models: ['Corolla', 'RAV4', 'Yaris'] },
  { make: 'Ford', models: ['Transit', 'Focus', 'Ranger'] },
  { make: 'Renault', models: ['Master', 'Trafic', 'Clio'] },
  { make: 'Peugeot', models: ['Boxer', 'Partner', '308'] },
  { make: 'Scania', models: ['R-serie', 'S-serie', 'P-serie'] },
  { make: 'MAN', models: ['TGX', 'TGS', 'TGE'] },
]

declare global {
  var __autorellPublicSearchCache: Map<string, PublicSearchCacheEntry> | undefined
}

const publicSearchCache =
  globalThis.__autorellPublicSearchCache ||
  (globalThis.__autorellPublicSearchCache = new Map<string, PublicSearchCacheEntry>())

export function normalizePublicSearchLocale(value?: string | null): PublicLocale {
  if (value === 'sv' || value === 'de' || isPublicLanguage(value || '')) {
    return value as PublicLocale
  }
  return 'en'
}

export async function searchPublicEntries(input: PublicSearchInput) {
  const locale = normalizePublicSearchLocale(input.locale)
  const language = marketplaceLanguage(locale)
  const query = normalizeQuery(input.query)
  const limit = clampLimit(input.limit)
  const provider = input.provider || 'supabase'
  const explicitMarket = normalizeMarket(input.market)
  const market = resolveSearchMarket(locale, explicitMarket, query)
  const cacheKey = `${PUBLIC_SEARCH_CACHE_VERSION}:${provider}:${locale}:${market || 'EU'}:${query.toLocaleLowerCase('en-US')}:${limit}`
  const cached = publicSearchCache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) return cached.results

  const results = await searchWithSupabase({ locale, language, query, limit, market })
  publicSearchCache.set(cacheKey, {
    expiresAt: Date.now() + PUBLIC_SEARCH_CACHE_TTL_MS,
    results,
  })

  return results
}

function normalizeQuery(value?: string | null) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 60)
}

function clampLimit(value?: number) {
  if (!Number.isFinite(value)) return 10
  return Math.min(Math.max(Math.round(Number(value)), 1), 10)
}

function normalizeMarket(value?: string | null) {
  const normalized = String(value || '').trim().toUpperCase()
  if (normalized === 'EU') return 'EU'
  return /^[A-Z]{2}$/.test(normalized) ? normalized : ''
}

function resolveSearchMarket(locale: PublicLocale, explicitMarket: string, query: string) {
  if (detectsEurope(query)) return 'EU'
  if (explicitMarket) return explicitMarket
  return defaultSearchCountryForLocale(locale) || ''
}

async function searchWithSupabase({
  locale,
  language,
  query,
  limit,
  market,
}: {
  locale: PublicLocale
  language: 'sv' | 'en' | 'de'
  query: string
  limit: number
  market: string
}) {
  if (query.length < 2) return []

  const structuredEntries = buildStructuredVehicleEntries({ locale, language, query, market })
  if (structuredEntries.length > 0) {
    return structuredEntries.slice(0, limit)
  }

  if (looksLikeSiteNavigationQuery(query)) return []
  return []
}

function looksLikeSiteNavigationQuery(query: string) {
  const terms = normalizeForMatch(query).split(' ').filter(Boolean)
  const blockedTerms = new Set([
    'kontakt',
    'contact',
    'hjalp',
    'help',
    'hjalpcenter',
    'helpcenter',
    'villkor',
    'terms',
    'integritet',
    'privacy',
    'nyheter',
    'news',
    'om',
    'about',
  ])
  return terms.some((term) => blockedTerms.has(term))
}

function buildStructuredVehicleEntries({
  locale,
  language,
  query,
  market,
}: {
  locale: PublicLocale
  language: 'sv' | 'en' | 'de'
  query: string
  market: string
}) {
  const normalizedQuery = normalizeForMatch(query)
  const terms = normalizedQuery.split(' ').filter(Boolean)
  const detected: DetectedVehicleQuery = {
    category: detectCategory(normalizedQuery),
    make: detectMake(normalizedQuery),
    usesAllEurope: detectsEurope(query),
  }
  detected.model = detected.make ? detectModel(detected.make, normalizedQuery) : undefined

  const locations = getLocationsForMarket(market)
    .map((location) => ({ location, score: scoreLocationMatch(location, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ location }) => location)

  detected.location = locations[0]

  const entries: PublicSearchEntry[] = []

  if (detected.category && detected.location) {
    entries.push(createCombinedEntry({ locale, language, detected, kind: 'category-location', market }))
  }

  if (detected.make && detected.location) {
    entries.push(createCombinedEntry({ locale, language, detected, kind: 'make-location', market }))
  }

  if (detected.category && !detected.location) {
    entries.push(createCategoryEntry({ locale, language, category: detected.category, market: detected.usesAllEurope ? 'EU' : market }))
  }

  if (detected.make && !detected.location) {
    entries.push(createMakeEntry({ locale, make: detected.make, model: detected.model, market: detected.usesAllEurope ? 'EU' : market }))
  }

  locations.slice(0, 4).forEach((location) => {
    entries.push(createLocationEntry({ locale, location }))
  })

  return rankEntries(dedupeEntries(entries), query)
}

function detectsEurope(query: string) {
  return normalizeForMatch(query)
    .split(' ')
    .some((term) => europeTerms.has(term))
}

function getLocationsForMarket(market: string) {
  if (market === 'EU') return Object.values(vehicleLocationsByCountry).flat()
  if (market) return vehicleLocationsByCountry[market] || []
  return Object.values(vehicleLocationsByCountry).flat()
}

function detectCategory(normalizedQuery: string) {
  const terms = normalizedQuery.split(' ').filter(Boolean)
  return marketplaceCategories.find((category) => {
    const values = [
      category.slug,
      category.labels.sv,
      category.labels.en,
      category.labels.de,
      category.singular.sv,
      category.singular.en,
      category.singular.de,
      ...category.keywords,
      ...categoryAliases[category.slug],
    ].map(normalizeForMatch)

    return values.some((value) =>
      value
        .split(' ')
        .filter(Boolean)
        .some((part) => terms.some((term) => part === term || part.startsWith(term))),
    )
  })?.slug
}

function detectMake(normalizedQuery: string) {
  const terms = normalizedQuery.split(' ').filter(Boolean)
  return vehicleMakes.find((item) => {
    const make = normalizeForMatch(item.make)
    return terms.some((term) => make === term || make.startsWith(term))
  })
}

function detectModel(make: VehicleMake, normalizedQuery: string) {
  const terms = normalizedQuery.split(' ').filter(Boolean)
  return make.models?.find((model) => {
    const normalizedModel = normalizeForMatch(model)
    return terms.some((term) => normalizedModel === term || normalizedModel.startsWith(term))
  })
}

function scoreLocationMatch(location: VehicleLocation, terms: string[]) {
  const searchable = [
    location.city,
    location.municipality,
    location.region,
    location.postalCode,
    location.country,
  ]
    .filter(Boolean)
    .join(' ')
  const locationParts = normalizeForMatch(searchable)
    .split(' ')
    .filter((part) => part.length >= 2 && !locationStopWords.has(part))

  return terms
    .filter((term) => term.length >= 2 && !locationStopWords.has(term) && !europeTerms.has(term))
    .reduce((score, term) => {
      const matched = locationParts.some((part) => part === term || part.startsWith(term) || (term.length >= 4 && part.includes(term)))
      return score + (matched ? (term.length >= 4 ? 5 : 3) : 0)
    }, 0)
}

function createCombinedEntry({
  locale,
  language,
  detected,
  kind,
  market,
}: {
  locale: PublicLocale
  language: 'sv' | 'en' | 'de'
  detected: DetectedVehicleQuery
  kind: 'category-location' | 'make-location'
  market: string
}) {
  const params = new URLSearchParams()
  const location = detected.location!

  params.set('markets', market && market !== 'EU' ? market : location.country)
  setLocationParams(params, location)

  if (kind === 'category-location') {
    params.set('categories', detected.category!)
    const label = categoryLabel(detected.category!, locale, language)
    const titleLocation = formatLocationTitle(location, locale, true)
    return {
      href: localizePublicHref(locale, `/marketplace?${params.toString()}`),
      title: joinLocalized(label, titleLocation, locale),
      description: locationDescriptor(location, locale),
      keywords: `${label} ${location.city || ''} ${location.municipality || ''} ${location.country}`,
      type: 'vehicle-query' as const,
    }
  }

  params.set('make', detected.make!.make)
  if (detected.model) params.set('model', detected.model)
  const makeTitle = [detected.make!.make, detected.model].filter(Boolean).join(' ')
  const titleLocation = formatLocationTitle(location, locale, false)
  return {
    href: localizePublicHref(locale, `/marketplace?${params.toString()}`),
    title: joinLocalized(makeTitle, titleLocation, locale),
    description: locationDescriptor(location, locale),
    keywords: `${makeTitle} ${location.city || ''} ${location.municipality || ''} ${location.country}`,
    type: detected.model ? ('model' as const) : ('make' as const),
  }
}

function createCategoryEntry({
  locale,
  language,
  category,
  market,
}: {
  locale: PublicLocale
  language: 'sv' | 'en' | 'de'
  category: MarketplaceCategorySlug
  market: string
}) {
  const params = new URLSearchParams()
  params.set('categories', category)
  if (market) params.set('markets', market)
  const label = categoryLabel(category, locale, language)

  return {
    href: localizePublicHref(locale, `/marketplace?${params.toString()}`),
    title: label,
    description: market === 'EU' ? 'Europe' : countryDisplayName(market, locale),
    keywords: `${label} ${category} ${market}`,
    type: 'category' as const,
  }
}

function createMakeEntry({
  locale,
  make,
  model,
  market,
}: {
  locale: PublicLocale
  make: VehicleMake
  model?: string
  market: string
}) {
  const params = new URLSearchParams()
  if (market) params.set('markets', market)
  params.set('make', make.make)
  if (model) params.set('model', model)
  const title = [make.make, model].filter(Boolean).join(' ')

  return {
    href: localizePublicHref(locale, `/marketplace?${params.toString()}`),
    title,
    description: market === 'EU' ? 'Europe' : countryDisplayName(market, locale),
    keywords: `${title} ${(make.models || []).join(' ')}`,
    type: model ? ('model' as const) : ('make' as const),
  }
}

function createLocationEntry({ locale, location }: { locale: PublicLocale; location: VehicleLocation }) {
  const params = new URLSearchParams()
  params.set('markets', location.country)
  setLocationParams(params, location)

  const title = formatLocationTitle(location, locale, true)
  return {
    href: localizePublicHref(locale, `/marketplace?${params.toString()}`),
    title,
    description: locationDescriptor(location, locale),
    keywords: `${title} ${location.region || ''} ${location.country}`,
    type: 'place' as const,
  }
}

function categoryLabel(category: MarketplaceCategorySlug, locale: PublicLocale, language: 'sv' | 'en' | 'de') {
  const marketLabel = categoryLocalLabels[locale]?.[category]
  if (marketLabel) return marketLabel
  const fallback = marketplaceCategories.find((item) => item.slug === category)
  return fallback?.labels[language] || category
}

function formatLocationTitle(location: VehicleLocation, locale: PublicLocale, includeMunicipalitySuffix: boolean) {
  const city = formatLocationName(location.city || location.municipality || location.region || location.country)
  if (includeMunicipalitySuffix && locale === 'sv' && location.municipality) return `${city} kommun`
  return city
}

function locationDescriptor(location: VehicleLocation, locale: PublicLocale) {
  const region = formatLocationName(location.region || '')
  if (locale === 'sv' && location.municipality) return 'Kommun'
  if (region) return region
  return countryDisplayName(location.country, locale)
}

function joinLocalized(subject: string, location: string, locale: PublicLocale) {
  if (locale === 'es') return `${subject} en ${location}`
  if (locale === 'de') return `${subject} in ${location}`
  if (locale === 'en') return `${subject} in ${location}`
  return `${subject} i ${location}`
}

function setLocationParams(params: URLSearchParams, location: VehicleLocation) {
  if (location.municipality) params.set('municipality', location.municipality)
  else if (location.city) params.set('city', location.city)
  if (location.postalCode) params.set('postalCode', location.postalCode)
}

function normalizeForMatch(value: string) {
  return String(value || '')
    .toLocaleLowerCase('sv-SE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatLocationName(value: string) {
  const normalizedDisplay: Record<string, string> = {
    goteborg: 'G\u00f6teborg',
    malmo: 'Malm\u00f6',
    munchen: 'M\u00fcnchen',
    koln: 'K\u00f6ln',
    kobenhavn: 'K\u00f6benhavn',
  }
  const key = normalizeForMatch(value)
  if (normalizedDisplay[key]) return normalizedDisplay[key]
  return String(value || '')
    .trim()
    .split(/\s+/)
    .map((part) =>
      part
        .split('-')
        .map((piece) => (piece ? piece.charAt(0).toLocaleUpperCase('sv-SE') + piece.slice(1).toLocaleLowerCase('sv-SE') : piece))
        .join('-'),
    )
    .join(' ')
}

function countryDisplayName(country: string, locale: PublicLocale) {
  const normalized = String(country || '').toUpperCase()
  if (!normalized) return ''
  const names: Record<string, Record<string, string>> = {
    SE: { sv: 'Sverige', en: 'Sweden', de: 'Schweden', es: 'Suecia' },
    ES: { sv: 'Spanien', en: 'Spain', de: 'Spanien', es: 'Espa\u00f1a' },
    DE: { sv: 'Tyskland', en: 'Germany', de: 'Deutschland', es: 'Alemania' },
    PL: { sv: 'Polen', en: 'Poland', de: 'Polen', es: 'Polonia' },
    FR: { sv: 'Frankrike', en: 'France', de: 'Frankreich', es: 'Francia' },
    IT: { sv: 'Italien', en: 'Italy', de: 'Italien', es: 'Italia' },
    NL: { sv: 'Nederl\u00e4nderna', en: 'Netherlands', de: 'Niederlande', es: 'Pa\u00edses Bajos' },
    BE: { sv: 'Belgien', en: 'Belgium', de: 'Belgien', es: 'B\u00e9lgica' },
    AT: { sv: '\u00d6sterrike', en: 'Austria', de: '\u00d6sterreich', es: 'Austria' },
    DK: { sv: 'Danmark', en: 'Denmark', de: 'D\u00e4nemark', es: 'Dinamarca' },
    FI: { sv: 'Finland', en: 'Finland', de: 'Finnland', es: 'Finlandia' },
  }
  return names[normalized]?.[locale] || names[normalized]?.en || normalized
}

function dedupeEntries(entries: PublicSearchEntry[]) {
  const seen = new Set<string>()
  return entries.filter((entry) => {
    const key = `${entry.type}:${entry.href}:${entry.title}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function rankEntries(entries: PublicSearchEntry[], query: string) {
  const terms = normalizeForMatch(query).split(/\s+/).filter(Boolean)

  return entries
    .map((item, index) => {
      const title = normalizeForMatch(item.title)
      const haystack = normalizeForMatch(`${item.title} ${item.description} ${item.keywords}`)
      const score = terms.reduce(
        (total, term) =>
          total +
          (title.startsWith(term) ? 10 : 0) +
          (title.includes(term) ? 5 : 0) +
          (haystack.includes(term) ? 2 : -4),
        item.type === 'listing' ? 1 : 4,
      )
      return { item, score, index }
    })
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item)
}
