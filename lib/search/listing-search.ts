import 'server-only'

import {
  marketplaceCategories,
  marketplaceLanguage,
  normalizeMarketplaceCategory,
  type MarketplaceCategorySlug,
} from '@/lib/marketplace'
import {
  marketplaceLocationEntries,
  marketplaceRegionEntries,
} from '@/lib/marketplace-locations'
import { defaultSearchCountryForLocale } from '@/lib/market-locale'
import {
  isPublicLanguage,
  localizePublicHref,
  type PublicLocale,
} from '@/lib/public-i18n'
import { buildListingPath } from '@/lib/listing-url'
import { translateListingVehicleValue } from '@/lib/listing-display'
import { createAdminClient } from '@/lib/supabase/admin'

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

type SearchListingRow = {
  id: string
  category: MarketplaceCategorySlug | string | null
  title: string | null
  make: string | null
  model: string | null
  variant: string | null
  model_year: number | string | null
  fuel_type: string | null
  gearbox: string | null
  body_type: string | null
  city: string | null
  municipality: string | null
  postal_code: string | null
  country_code: string | null
  country: string | null
}

type DetectedVehicleQuery = {
  category?: MarketplaceCategorySlug
  location?: VehicleLocation
  usesAllEurope: boolean
}

const PUBLIC_SEARCH_CACHE_VERSION = 'vehicle-live-listings-v1'
const PUBLIC_SEARCH_CACHE_TTL_MS = 5 * 60_000
const PUBLIC_SEARCH_CACHE_MAX_ENTRIES = 1_000

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
  'lan',
  'lans',
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
  },
}

const vehicleLocations = [
  ...marketplaceRegionEntries(),
  ...marketplaceLocationEntries(),
]

const fuelSearchAliases: Array<{ value: string; aliases: string[] }> = [
  { value: 'Bensin', aliases: ['bensin', 'petrol', 'gasolina', 'essence', 'benzina', 'benzin'] },
  { value: 'Diesel', aliases: ['diesel', 'diésel', 'dieselolie'] },
  { value: 'El', aliases: ['el', 'electric', 'elektrisk', 'eléctrico', 'electrico', 'elektro', 'elettrica'] },
  { value: 'Hybrid', aliases: ['hybrid', 'híbrido', 'hibrido', 'hybride'] },
  { value: 'Laddhybrid', aliases: ['laddhybrid', 'plug in hybrid', 'plug-in hybrid', 'phev'] },
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
  if (publicSearchCache.size >= PUBLIC_SEARCH_CACHE_MAX_ENTRIES) {
    const firstKey = publicSearchCache.keys().next().value
    if (firstKey) publicSearchCache.delete(firstKey)
  }
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

  const listingEntries = await searchPublishedListingEntries({ locale, query, limit, market })
  if (listingEntries.length > 0) {
    const structuredEntries = buildStructuredVehicleEntries({ locale, language, query, market })
    return rankEntries(dedupeEntries([...listingEntries, ...structuredEntries]), query).slice(0, limit)
  }

  const structuredEntries = buildStructuredVehicleEntries({ locale, language, query, market })
  if (structuredEntries.length > 0) {
    return structuredEntries.slice(0, limit)
  }

  if (looksLikeSiteNavigationQuery(query)) return []
  return []
}

async function searchPublishedListingEntries({
  locale,
  query,
  limit,
  market,
}: {
  locale: PublicLocale
  query: string
  limit: number
  market: string
}) {
  const normalizedQuery = normalizeForMatch(query)
  const terms = normalizedQuery.split(' ').filter(Boolean)
  const year = detectYear(terms)
  const fuelValues = detectFuelValues(normalizedQuery)
  const textTerms = terms.filter((term) => term.length >= 2 && !/^\d{4}$/.test(term))

  if (!terms.length) return []

  let request = createAdminClient()
    .from('marketplace_listings')
    .select('id,category,title,make,model,variant,model_year,fuel_type,gearbox,body_type,city,municipality,postal_code,country_code,country')
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .is('sold_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .limit(Math.max(limit * 4, 20))

  if (market && market !== 'EU') request = request.eq('country_code', market)

  const orFilters: string[] = []
  for (const term of textTerms.slice(0, 4)) {
    const escaped = escapePostgrestLike(term)
    orFilters.push(
      `title.ilike.%${escaped}%`,
      `make.ilike.%${escaped}%`,
      `model.ilike.%${escaped}%`,
      `variant.ilike.%${escaped}%`,
      `fuel_type.ilike.%${escaped}%`,
      `gearbox.ilike.%${escaped}%`,
      `body_type.ilike.%${escaped}%`,
      `city.ilike.%${escaped}%`,
      `municipality.ilike.%${escaped}%`,
      `postal_code.ilike.%${escaped}%`,
      `country.ilike.%${escaped}%`,
      `country_code.ilike.%${escaped}%`,
    )
  }
  for (const fuel of fuelValues) {
    orFilters.push(`fuel_type.ilike.%${escapePostgrestLike(fuel)}%`)
  }
  if (year) orFilters.push(`model_year.eq.${year}`)

  if (!orFilters.length) return []

  const { data, error } = await request.or(orFilters.join(','))
  if (error) {
    console.error('Public listing search failed', error)
    return []
  }

  const listings = ((data || []) as SearchListingRow[])
    .map((listing, index) => ({
      listing,
      score: scoreListingMatch(listing, normalizedQuery, terms, year, fuelValues),
      index,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ listing }) => listing)

  return dedupeEntries(listings.flatMap((listing) =>
    createListingDerivedEntries({ locale, listing, query, year, fuelValues }),
  )).slice(0, limit)
}

function detectYear(terms: string[]) {
  const value = terms.find((term) => /^(19|20)\d{2}$/.test(term))
  return value ? Number(value) : null
}

function detectFuelValues(normalizedQuery: string) {
  return fuelSearchAliases
    .filter((item) => item.aliases.some((alias) => normalizedQuery.includes(normalizeForMatch(alias))))
    .map((item) => item.value)
}

function scoreListingMatch(
  listing: SearchListingRow,
  normalizedQuery: string,
  terms: string[],
  year: number | null,
  fuelValues: string[],
) {
  const title = normalizeForMatch(listing.title || [listing.make, listing.model, listing.variant].filter(Boolean).join(' '))
  const haystack = normalizeForMatch([
    listing.title,
    listing.make,
    listing.model,
    listing.variant,
    listing.model_year,
    listing.fuel_type,
    listing.gearbox,
    listing.body_type,
    listing.city,
    listing.municipality,
    listing.postal_code,
    listing.country,
    listing.country_code,
  ].filter(Boolean).join(' '))
  const base = terms.reduce((score, term) => {
    if (title.startsWith(term)) return score + 18
    if (title.includes(term)) return score + 12
    if (haystack.includes(term)) return score + 7
    return score - 3
  }, 0)
  const yearScore = year && Number(listing.model_year) === year ? 12 : 0
  const fuelScore = fuelValues.some((fuel) => normalizeForMatch(listing.fuel_type || '') === normalizeForMatch(fuel)) ? 10 : 0
  const wholeQueryScore = normalizedQuery && haystack.includes(normalizedQuery) ? 10 : 0
  return base + yearScore + fuelScore + wholeQueryScore
}

function createListingDerivedEntries({
  locale,
  listing,
  query,
  year,
  fuelValues,
}: {
  locale: PublicLocale
  listing: SearchListingRow
  query: string
  year: number | null
  fuelValues: string[]
}) {
  const entries: PublicSearchEntry[] = []
  const market = normalizeMarket(listing.country_code) || ''
  const category = normalizeMarketplaceCategory(String(listing.category || 'cars'))
  const title = listingTitle(listing)
  const description = listingDescription(locale, listing)
  const location = listingLocation(listing)

  if (listing.make) {
    const params = baseListingFilterParams(market, category)
    params.set('make', listing.make)
    entries.push({
      href: localizePublicHref(locale, `/marketplace/${category}?${params.toString()}`),
      title: listing.make,
      description,
      keywords: `${listing.make} ${listing.model || ''} ${title} ${listing.model_year || ''} ${listing.fuel_type || ''} ${listing.city || ''} ${listing.municipality || ''}`,
      type: 'make',
    })

    if (listing.model) {
      const modelParams = baseListingFilterParams(market, category)
      modelParams.set('make', listing.make)
      modelParams.set('model', listing.model)
      const label = [listing.make, listing.model].filter(Boolean).join(' ')
      entries.push({
        href: localizePublicHref(locale, `/marketplace/${category}?${modelParams.toString()}`),
        title: label,
        description,
        keywords: `${label} ${title} ${listing.variant || ''} ${listing.model_year || ''} ${listing.fuel_type || ''} ${listing.city || ''} ${listing.municipality || ''}`,
        type: 'model',
      })
    }

    if (location) {
      const makeLocationParams = baseListingFilterParams(market, category)
      makeLocationParams.set('make', listing.make)
      setLocationParams(makeLocationParams, location)
      entries.push({
        href: localizePublicHref(locale, `/marketplace/${category}?${makeLocationParams.toString()}`),
        title: joinLocalized(listing.make, formatLocationTitle(location, locale, false), locale),
        description: locationDescriptor(location, locale),
        keywords: `${listing.make} ${listing.model || ''} ${listing.city || ''} ${listing.municipality || ''} ${listing.postal_code || ''} ${listing.country || ''}`,
        type: 'vehicle-query',
      })

      if (listing.model) {
        const modelLocationParams = baseListingFilterParams(market, category)
        modelLocationParams.set('make', listing.make)
        modelLocationParams.set('model', listing.model)
        setLocationParams(modelLocationParams, location)
        const label = [listing.make, listing.model].filter(Boolean).join(' ')
        entries.push({
          href: localizePublicHref(locale, `/marketplace/${category}?${modelLocationParams.toString()}`),
          title: joinLocalized(label, formatLocationTitle(location, locale, false), locale),
          description: locationDescriptor(location, locale),
          keywords: `${label} ${listing.variant || ''} ${listing.city || ''} ${listing.municipality || ''} ${listing.postal_code || ''} ${listing.country || ''}`,
          type: 'vehicle-query',
        })
      }
    }
  }

  if (location) {
    entries.push(createLocationEntry({ locale, location }))
  }

  if (year && Number(listing.model_year) === year) {
    const params = baseListingFilterParams(market, category)
    params.set('minYear', String(year))
    params.set('maxYear', String(year))
    entries.push({
      href: localizePublicHref(locale, `/marketplace/${category}?${params.toString()}`),
      title: String(year),
      description,
      keywords: `${title} ${year} ${listing.make || ''} ${listing.model || ''}`,
      type: 'vehicle-query',
    })
  }

  const fuelMatches = fuelValues.length
    ? fuelValues.includes(listing.fuel_type || '')
    : normalizeForMatch(listing.fuel_type || '').includes(normalizeForMatch(query))
  if (listing.fuel_type && fuelMatches) {
    const params = baseListingFilterParams(market, category)
    params.set('fuel', listing.fuel_type)
    entries.push({
      href: localizePublicHref(locale, `/marketplace/${category}?${params.toString()}`),
      title: translateListingVehicleValue(locale, listing.fuel_type) || listing.fuel_type,
      description,
      keywords: `${title} ${listing.fuel_type} ${listing.make || ''} ${listing.model || ''}`,
      type: 'vehicle-query',
    })
  }

  entries.push({
    href: buildListingPath({
      id: listing.id,
      title: listing.title,
      make: listing.make,
      model: listing.model,
      model_year: listing.model_year,
      city: listing.city,
      country_code: listing.country_code,
    }, locale),
    title,
    description,
    keywords: `${title} ${listing.make || ''} ${listing.model || ''} ${listing.variant || ''} ${listing.model_year || ''} ${listing.fuel_type || ''} ${listing.city || ''} ${listing.municipality || ''} ${listing.postal_code || ''} ${listing.country || ''}`,
    type: 'listing',
  })

  return entries
}

function listingLocation(listing: SearchListingRow): VehicleLocation | null {
  const country = normalizeMarket(listing.country_code)
  if (!country) return null
  const city = cleanLocationValue(listing.city)
  const municipality = cleanLocationValue(listing.municipality)
  const postalCode = cleanLocationValue(listing.postal_code)
  if (!city && !municipality && !postalCode) return { country }
  return {
    country,
    city: city || municipality,
    municipality: municipality || city,
    postalCode,
  }
}

function cleanLocationValue(value: string | null | undefined) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function baseListingFilterParams(market: string, category: MarketplaceCategorySlug) {
  const params = new URLSearchParams()
  if (market) params.set('markets', market)
  params.set('categories', category)
  return params
}

function listingTitle(listing: SearchListingRow) {
  return (
    listing.title ||
    [listing.make, listing.model, listing.variant, listing.model_year].filter(Boolean).join(' ') ||
    'Vehicle listing'
  )
}

function listingDescription(locale: PublicLocale, listing: SearchListingRow) {
  return [
    listing.model_year,
    translateListingVehicleValue(locale, listing.fuel_type) || listing.fuel_type,
    listing.city || listing.municipality,
    listing.country_code ? countryDisplayName(listing.country_code, locale) : null,
  ].filter(Boolean).join(' · ')
}

function escapePostgrestLike(value: string) {
  return value.replace(/[%_,()]/g, '')
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
    usesAllEurope: detectsEurope(query),
  }

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

  if (detected.category && !detected.location) {
    entries.push(createCategoryEntry({ locale, language, category: detected.category, market: detected.usesAllEurope ? 'EU' : market }))
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
  if (market === 'EU' || !market) return vehicleLocations
  return vehicleLocations.filter((location) => location.country === market)
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
      const matched = locationParts.some((part) => locationSearchPartMatches(part, term))
      return score + (matched ? (term.length >= 4 ? 5 : 3) : 0)
    }, 0)
}

function locationSearchPartMatches(part: string, term: string) {
  const partBase = part.replace(/s$/, '')
  const termBase = term.replace(/s$/, '')
  return (
    part === term ||
    partBase === termBase ||
    part.startsWith(term) ||
    (term.length >= 4 && part.includes(term)) ||
    (termBase.length >= 4 && partBase.includes(termBase))
  )
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
  kind: 'category-location'
  market: string
}) {
  const params = new URLSearchParams()
  const location = detected.location!

  params.set('markets', market && market !== 'EU' ? market : location.country)
  setLocationParams(params, location)

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
  if (includeMunicipalitySuffix && locale === 'sv' && !location.municipality && location.region) return `${city} län`
  return city
}

function locationDescriptor(location: VehicleLocation, locale: PublicLocale) {
  const region = formatLocationName(location.region || '')
  if (locale === 'sv' && location.municipality) return 'Kommun'
  if (locale === 'sv' && location.region && !location.municipality) return 'Län'
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
  else if (location.region) params.set('region', location.region)
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
