import type { MarketplaceCategorySlug } from './marketplace'
import { swedishCounties, swedishMunicipalities } from './swedish-regions.generated'

export type MarketplaceGeoLevel = 'country' | 'region' | 'municipality' | 'locality' | 'postal_code'
export type MarketplaceOfferType = '' | 'sale' | 'leasing'

export type MarketplaceBoundingBox = {
  north: number
  east: number
  south: number
  west: number
}

export type MarketplaceGeoArea = {
  id: string
  countryCode: string
  level: MarketplaceGeoLevel
  name: string
  code?: string
  slug?: string
  parentId?: string
  region?: string
  municipality?: string
  locality?: string
  postalCode?: string
  centroid: {
    latitude: number
    longitude: number
  }
  bounds: MarketplaceBoundingBox
  aliases: string[]
}

export type MarketplaceSearchState = {
  rawQuery: string
  query: string
  make: string
  categories: MarketplaceCategorySlug[]
  offerType: MarketplaceOfferType
  geoArea: MarketplaceGeoArea | null
  postalCode: string
  maxPrice: number | null
}

const SWEDEN_BOUNDS: MarketplaceBoundingBox = { north: 69.1, east: 24.2, south: 55.2, west: 10.6 }
const SWEDEN_CENTROID = { latitude: 62, longitude: 15 }

const swedenCountryGeoArea: MarketplaceGeoArea = {
  id: 'SE:country:sweden',
  countryCode: 'SE',
  level: 'country',
  name: 'Sverige',
  code: 'SE',
  slug: 'sverige',
  centroid: SWEDEN_CENTROID,
  bounds: SWEDEN_BOUNDS,
  aliases: ['sverige', 'sweden', 'hela sverige'],
}

const curatedSwedenGeoAreas: MarketplaceGeoArea[] = [
  {
    id: 'SE:municipality:goteborg',
    countryCode: 'SE',
    level: 'municipality',
    name: 'Goteborg',
    code: '1480',
    slug: 'goteborg',
    parentId: 'SE:region:14',
    region: 'Vastra Gotaland',
    municipality: 'Goteborg',
    centroid: { latitude: 57.7089, longitude: 11.9746 },
    bounds: { north: 57.86, east: 12.18, south: 57.55, west: 11.72 },
    aliases: ['goteborg', 'g\u00f6teborg', 'gothenburg', 'goteborg kommun', 'g\u00f6teborg kommun'],
  },
  {
    id: 'SE:municipality:stockholm',
    countryCode: 'SE',
    level: 'municipality',
    name: 'Stockholm',
    code: '0180',
    slug: 'stockholm',
    parentId: 'SE:region:01',
    region: 'Stockholm',
    municipality: 'Stockholm',
    centroid: { latitude: 59.3293, longitude: 18.0686 },
    bounds: { north: 59.44, east: 18.22, south: 59.23, west: 17.8 },
    aliases: ['stockholm', 'stockholms kommun', 'stockholm kommun'],
  },
  {
    id: 'SE:municipality:huddinge',
    countryCode: 'SE',
    level: 'municipality',
    name: 'Huddinge',
    code: '0126',
    slug: 'huddinge',
    parentId: 'SE:region:01',
    region: 'Stockholm',
    municipality: 'Huddinge',
    centroid: { latitude: 59.2369, longitude: 17.9824 },
    bounds: { north: 59.31, east: 18.12, south: 59.15, west: 17.82 },
    aliases: ['huddinge', 'huddinge kommun'],
  },
  {
    id: 'SE:municipality:kramfors',
    countryCode: 'SE',
    level: 'municipality',
    name: 'Kramfors',
    code: '2282',
    slug: 'kramfors',
    parentId: 'SE:region:22',
    region: 'Vasternorrland',
    municipality: 'Kramfors',
    centroid: { latitude: 62.9316, longitude: 17.7765 },
    bounds: { north: 63.25, east: 18.35, south: 62.6, west: 17.1 },
    aliases: ['kramfors', 'kramfors kommun'],
  },
  {
    id: 'SE:locality:bollstabruk',
    countryCode: 'SE',
    level: 'locality',
    name: 'Bollstabruk',
    code: 'bollstabruk',
    slug: 'bollstabruk',
    parentId: 'SE:municipality:kramfors',
    region: 'Vasternorrland',
    municipality: 'Kramfors',
    locality: 'Bollstabruk',
    centroid: { latitude: 62.9974, longitude: 17.6783 },
    bounds: { north: 63.03, east: 17.73, south: 62.96, west: 17.62 },
    aliases: ['bollstabruk', 'bollsta bruk'],
  },
  {
    id: 'SE:locality:nyland',
    countryCode: 'SE',
    level: 'locality',
    name: 'Nyland',
    code: 'nyland',
    slug: 'nyland',
    parentId: 'SE:municipality:kramfors',
    region: 'Vasternorrland',
    municipality: 'Kramfors',
    locality: 'Nyland',
    centroid: { latitude: 63.0042, longitude: 17.7606 },
    bounds: { north: 63.04, east: 17.82, south: 62.97, west: 17.7 },
    aliases: ['nyland'],
  },
]

const curatedSlugs = new Set(curatedSwedenGeoAreas.map((area) => area.slug).filter(Boolean))
const countyByCode = new Map(swedishCounties.map((county) => [county.code, county]))

const generatedSwedenCountyGeoAreas: MarketplaceGeoArea[] = swedishCounties.map((county) => {
  const name = titleFromSlug(county.slug)
  return {
    id: `SE:region:${county.code}`,
    countryCode: 'SE',
    level: 'region',
    name,
    code: county.code,
    slug: county.slug,
    parentId: swedenCountryGeoArea.id,
    region: name,
    centroid: SWEDEN_CENTROID,
    bounds: SWEDEN_BOUNDS,
    aliases: uniqueAliases([county.slug, name, county.name, `${county.slug} lan`, `${county.slug} l\u00e4n`, county.code]),
  }
})

const generatedSwedenMunicipalityGeoAreas: MarketplaceGeoArea[] = swedishMunicipalities
  .filter((municipality) => !curatedSlugs.has(municipality.slug))
  .map((municipality) => {
    const county = countyByCode.get(municipality.countyCode)
    const name = titleFromSlug(municipality.slug)
    const region = county ? titleFromSlug(county.slug) : undefined
    return {
      id: `SE:municipality:${municipality.code}`,
      countryCode: 'SE',
      level: 'municipality',
      name,
      code: municipality.code,
      slug: municipality.slug,
      parentId: county ? `SE:region:${county.code}` : swedenCountryGeoArea.id,
      region,
      municipality: name,
      centroid: SWEDEN_CENTROID,
      bounds: SWEDEN_BOUNDS,
      aliases: uniqueAliases([
        municipality.slug,
        name,
        municipality.name,
        `${municipality.slug} kommun`,
        `${name} kommun`,
        municipality.code,
      ]),
    }
  })

const swedenPhaseOneGeoAreas: MarketplaceGeoArea[] = dedupeGeoAreas([
  swedenCountryGeoArea,
  ...curatedSwedenGeoAreas,
  ...generatedSwedenCountyGeoAreas,
  ...generatedSwedenMunicipalityGeoAreas,
])

const knownVehicleMakes = [
  'Mercedes-Benz',
  'Volkswagen',
  'Mercedes',
  'Hyundai',
  'Citroen',
  'Peugeot',
  'Renault',
  'Toyota',
  'Nissan',
  'Scania',
  'Volvo',
  'Tesla',
  'Skoda',
  'Cupra',
  'Audi',
  'Ford',
  'Opel',
  'Fiat',
  'Iveco',
  'Seat',
  'BMW',
  'Kia',
  'MAN',
  'VW',
]

const categoryQueryEntries: Array<{ category: MarketplaceCategorySlug; aliases: string[] }> = [
  { category: 'cars', aliases: ['bil', 'bilar', 'car', 'cars', 'auto', 'autos'] },
  { category: 'vans', aliases: ['transportbil', 'transportbilar', 'van', 'vans', 'sk\u00e5pbil', 'sk\u00e5pbilar'] },
  { category: 'motorcycles', aliases: ['motorcykel', 'motorcyklar', 'mc', 'motorcycle', 'motorcycles', 'motorbike'] },
  { category: 'motorhomes', aliases: ['husbil', 'husbilar', 'motorhome', 'motorhomes', 'camper'] },
  { category: 'caravans', aliases: ['husvagn', 'husvagnar', 'caravan', 'caravans'] },
  { category: 'trucks', aliases: ['lastbil', 'lastbilar', 'truck', 'trucks', 'lorry', 'buss', 'bussar', 'bus'] },
  { category: 'agriculture', aliases: ['lantbruk', 'lantbruksmaskin', 'lantbruksmaskiner', 'traktor', 'tractor', 'farm'] },
  {
    category: 'construction',
    aliases: ['entreprenad', 'entreprenadmaskin', 'entreprenadmaskiner', 'gr\u00e4vmaskin', 'excavator', 'loader'],
  },
  { category: 'electric-bikes', aliases: ['cykel', 'cyklar', 'bike', 'bikes', 'bicycle', 'elcykel', 'e bike', 'e-bike'] },
]

const geoAreaById = new Map(swedenPhaseOneGeoAreas.map((area) => [normalizeSearchStateText(area.id), area]))
const geoAliasEntries = swedenPhaseOneGeoAreas
  .flatMap((area) => area.aliases.map((alias) => ({ alias, key: normalizeSearchStateText(alias), area })))
  .sort((left, right) => right.key.length - left.key.length)

export function parseMarketplaceSearchState(
  query: string | null | undefined,
  options: { markets?: string[] } = {},
): MarketplaceSearchState {
  const rawQuery = cleanQuery(query)
  const markets = new Set((options.markets || []).map((market) => market.toUpperCase()))
  const canUseSweden = markets.size === 0 || markets.has('SE')
  const make = extractVehicleMake(rawQuery)
  const categories = extractCategoryFilters(rawQuery)
  const offerType = extractOfferType(rawQuery)
  const postalCode = canUseSweden ? extractSwedishPostalCode(rawQuery) : ''
  const maxPrice = extractMaxPrice(rawQuery)
  const geoArea = canUseSweden
    ? findGeoArea(rawQuery) || (postalCode ? postalCodeGeoArea(postalCode) : null)
    : null

  return {
    rawQuery,
    query: removeSearchStateTerms(rawQuery, { make, categories, offerType, geoArea, postalCode, maxPrice }),
    make,
    categories,
    offerType,
    geoArea,
    postalCode,
    maxPrice,
  }
}

export function resolveMarketplaceGeoArea(value: string | null | undefined) {
  const key = normalizeSearchStateText(value || '')
  if (!key) return null
  return geoAreaById.get(key) || findGeoArea(value || '')
}

export function marketplaceGeoAreaOrFilters(area: MarketplaceGeoArea) {
  const filters = new Set<string>()
  filters.add(`geo_area_id.eq.${area.id}`)
  filters.add(`geo_place_code.eq.${area.id}`)
  if (area.level === 'region' && area.code) filters.add(`geo_region_code.eq.${area.code}`)
  if (area.level === 'municipality' && area.code) filters.add(`geo_municipality_code.eq.${area.code}`)
  if (area.level === 'locality' && area.code) filters.add(`geo_locality_code.eq.${area.code}`)

  const values = new Set<string>()
  values.add(area.name)
  if (area.locality) values.add(area.locality)
  if (area.municipality) values.add(area.municipality)
  if (area.region && area.level === 'region') values.add(area.region)
  if (area.postalCode) values.add(area.postalCode)
  for (const alias of area.aliases) values.add(alias.replace(/\s+kommun$/i, '').trim())

  for (const value of values) {
    const escaped = escapePostgrestIlike(value)
    filters.add(`city.ilike.${escaped}`)
    filters.add(`municipality.ilike.${escaped}`)
    filters.add(`postal_code.ilike.${escaped}`)
  }

  return [...filters]
}

export function normalizeSearchBounds(input: {
  north?: string | number | null
  east?: string | number | null
  south?: string | number | null
  west?: string | number | null
}) {
  const north = boundedCoordinate(input.north, -90, 90)
  const east = boundedCoordinate(input.east, -180, 180)
  const south = boundedCoordinate(input.south, -90, 90)
  const west = boundedCoordinate(input.west, -180, 180)
  if (north === null || east === null || south === null || west === null) return null
  if (north <= south || east <= west) return null
  return { north, east, south, west }
}

export function isPointInsideSearchBounds(
  point: { latitude: number | null | undefined; longitude: number | null | undefined },
  bounds: MarketplaceBoundingBox | null | undefined,
) {
  if (!bounds || point.latitude === null || point.latitude === undefined || point.longitude === null || point.longitude === undefined) {
    return false
  }
  return (
    point.latitude >= bounds.south &&
    point.latitude <= bounds.north &&
    point.longitude >= bounds.west &&
    point.longitude <= bounds.east
  )
}

export function searchBoundsToPolygon(bounds: MarketplaceBoundingBox) {
  return [
    [bounds.west, bounds.south],
    [bounds.east, bounds.south],
    [bounds.east, bounds.north],
    [bounds.west, bounds.north],
    [bounds.west, bounds.south],
  ]
}

function findGeoArea(query: string) {
  const normalized = normalizeSearchStateText(query)
  if (!normalized) return null
  const exact = geoAreaById.get(normalized)
  if (exact) return exact
  return geoAliasEntries.find(({ key }) => tokenBoundaryMatch(normalized, key))?.area || null
}

function postalCodeGeoArea(postalCode: string): MarketplaceGeoArea {
  const compact = postalCode.replace(/\s+/g, '')
  return {
    id: `SE:postal_code:${compact}`,
    countryCode: 'SE',
    level: 'postal_code',
    name: postalCode,
    code: compact,
    postalCode,
    centroid: SWEDEN_CENTROID,
    bounds: SWEDEN_BOUNDS,
    aliases: [postalCode, compact],
  }
}

function removeSearchStateTerms(
  query: string,
  state: Pick<MarketplaceSearchState, 'make' | 'categories' | 'offerType' | 'geoArea' | 'postalCode' | 'maxPrice'>,
) {
  let value = query
  if (state.make) {
    value = value.replace(new RegExp(`\\b${escapeRegex(state.make)}\\b`, 'gi'), ' ')
    if (state.make === 'Volkswagen') value = value.replace(/\bVW\b/gi, ' ')
    if (state.make === 'Mercedes-Benz') value = value.replace(/\bMercedes\b/gi, ' ')
  }
  for (const entry of categoryQueryEntries.filter((entry) => state.categories.includes(entry.category))) {
    for (const alias of entry.aliases.sort((left, right) => right.length - left.length)) {
      value = value.replace(new RegExp(`\\b${escapeRegex(alias)}\\b`, 'gi'), ' ')
    }
  }
  if (state.offerType) {
    value = value.replace(/\b(leasing|leasa|lease|leasingbil|leasingbilar|till salu|for sale|sale|s\u00e4ljes|saljes)\b/gi, ' ')
  }
  if (state.geoArea) {
    const aliases = [...state.geoArea.aliases, state.geoArea.name]
      .sort((left, right) => right.length - left.length)
    for (const alias of aliases) {
      value = value.replace(new RegExp(`\\b${escapeRegex(alias)}\\b`, 'gi'), ' ')
    }
    value = value.replace(/\b(i|in|vid|n\u00e4ra|nara|kommun|l\u00e4n|lan)\b/gi, ' ')
  }
  if (state.postalCode) {
    value = value.replace(new RegExp(escapeRegex(state.postalCode), 'gi'), ' ')
    value = value.replace(new RegExp(escapeRegex(state.postalCode.replace(/\s+/g, '')), 'gi'), ' ')
  }
  if (state.maxPrice !== null) {
    value = value.replace(/\b(under|max|upp till)\s*\d[\d\s.,]*(kr|sek|eur|\u20ac)?\b/gi, ' ')
  }
  return cleanQuery(value)
}

function extractVehicleMake(query: string) {
  const normalizedQuery = normalizeSearchStateText(query)
  const match = knownVehicleMakes.find((make) => tokenBoundaryMatch(normalizedQuery, normalizeSearchStateText(make)))
  if (!match) return ''
  if (match === 'VW') return 'Volkswagen'
  if (match === 'Mercedes') return 'Mercedes-Benz'
  return match
}

function extractCategoryFilters(query: string) {
  const normalizedQuery = normalizeSearchStateText(query)
  const categories = new Set<MarketplaceCategorySlug>()
  for (const entry of categoryQueryEntries) {
    if (entry.aliases.some((alias) => tokenBoundaryMatch(normalizedQuery, normalizeSearchStateText(alias)))) {
      categories.add(entry.category)
    }
  }
  return [...categories]
}

function extractOfferType(query: string): MarketplaceOfferType {
  const normalizedQuery = normalizeSearchStateText(query)
  if (tokenBoundaryMatch(normalizedQuery, 'leasing') || tokenBoundaryMatch(normalizedQuery, 'lease') || tokenBoundaryMatch(normalizedQuery, 'leasa')) {
    return 'leasing'
  }
  if (
    tokenBoundaryMatch(normalizedQuery, 'till salu') ||
    tokenBoundaryMatch(normalizedQuery, 'for sale') ||
    tokenBoundaryMatch(normalizedQuery, 'sale') ||
    tokenBoundaryMatch(normalizedQuery, 'saljes')
  ) {
    return 'sale'
  }
  return ''
}

function extractSwedishPostalCode(query: string) {
  const match = query.match(/\b(\d{3})\s?(\d{2})\b/)
  return match ? `${match[1]} ${match[2]}` : ''
}

function extractMaxPrice(query: string) {
  const match = query.match(/\b(?:under|max|upp till)\s*(\d[\d\s.,]*)\s*(?:kr|sek|eur|\u20ac)?\b/i)
  if (!match) return null
  const value = Number(match[1].replace(/[^\d]/g, ''))
  return Number.isFinite(value) && value > 0 ? value : null
}

function boundedCoordinate(value: string | number | null | undefined, min: number, max: number) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < min || number > max) return null
  return number
}

function tokenBoundaryMatch(haystack: string, needle: string) {
  return new RegExp(`(^|\\s)${escapeRegex(needle)}($|\\s)`).test(haystack)
}

function cleanQuery(value: string | null | undefined) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizeSearchStateText(value: string) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('sv-SE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapePostgrestIlike(value: string) {
  return `%${String(value).replace(/[%_,]/g, '').trim()}%`
}

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function uniqueAliases(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => cleanQuery(value)).filter(Boolean))]
}

function dedupeGeoAreas(areas: MarketplaceGeoArea[]) {
  const seenIds = new Set<string>()
  return areas.filter((area) => {
    const key = normalizeSearchStateText(area.id)
    if (seenIds.has(key)) return false
    seenIds.add(key)
    return true
  })
}
