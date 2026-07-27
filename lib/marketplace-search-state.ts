export type MarketplaceGeoLevel = 'country' | 'region' | 'municipality' | 'locality' | 'postal_code'

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
  geoArea: MarketplaceGeoArea | null
  postalCode: string
  maxPrice: number | null
}

const swedenPhaseOneGeoAreas: MarketplaceGeoArea[] = [
  {
    id: 'SE:municipality:goteborg',
    countryCode: 'SE',
    level: 'municipality',
    name: 'Goteborg',
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
    region: 'Vasternorrland',
    municipality: 'Kramfors',
    locality: 'Nyland',
    centroid: { latitude: 63.0042, longitude: 17.7606 },
    bounds: { north: 63.04, east: 17.82, south: 62.97, west: 17.7 },
    aliases: ['nyland'],
  },
]

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
  const postalCode = canUseSweden ? extractSwedishPostalCode(rawQuery) : ''
  const maxPrice = extractMaxPrice(rawQuery)
  const geoArea = canUseSweden
    ? findGeoArea(rawQuery) || (postalCode ? postalCodeGeoArea(postalCode) : null)
    : null

  return {
    rawQuery,
    query: removeSearchStateTerms(rawQuery, { make, geoArea, postalCode, maxPrice }),
    make,
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
  const values = new Set<string>()
  values.add(area.name)
  if (area.locality) values.add(area.locality)
  if (area.municipality) values.add(area.municipality)
  if (area.region && area.level === 'region') values.add(area.region)
  if (area.postalCode) values.add(area.postalCode)
  for (const alias of area.aliases) values.add(alias.replace(/\s+kommun$/i, '').trim())

  return [...values].flatMap((value) => {
    const escaped = escapePostgrestIlike(value)
    return [
      `city.ilike.${escaped}`,
      `municipality.ilike.${escaped}`,
      `postal_code.ilike.${escaped}`,
      `geo_place_code.eq.${area.id}`,
    ]
  })
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
    postalCode,
    centroid: { latitude: 62, longitude: 15 },
    bounds: { north: 69.1, east: 24.2, south: 55.2, west: 10.6 },
    aliases: [postalCode, compact],
  }
}

function removeSearchStateTerms(
  query: string,
  state: Pick<MarketplaceSearchState, 'make' | 'geoArea' | 'postalCode' | 'maxPrice'>,
) {
  let value = query
  if (state.make) {
    value = value.replace(new RegExp(`\\b${escapeRegex(state.make)}\\b`, 'gi'), ' ')
    if (state.make === 'Volkswagen') value = value.replace(/\bVW\b/gi, ' ')
    if (state.make === 'Mercedes-Benz') value = value.replace(/\bMercedes\b/gi, ' ')
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
