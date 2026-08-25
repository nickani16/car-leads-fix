import 'server-only'

import { getStaticGeoDataset, normalizeGeoName, type StaticGeoPlace } from './geo-static-datasets'
import type { MarketplaceGeoArea } from './marketplace-search-state'
import { createAdminClient } from './supabase/admin'

export type GeoRegionOption = {
  code: string
  name: string
}

export type GeoPlaceOption = {
  code: string
  name: string
  regionCode: string
  regionName: string
  city: string
  postalCode: string | null
  source: 'verified'
}

type GeoRegionRow = {
  code: string
  name: string
}

type GeoPlaceRow = {
  code: string
  name: string
  city: string | null
  postal_code: string | null
  region_code: string
  region_name: string | null
  subregion_code: string | null
  subregion_name: string | null
}

const supportedGeoCountries = new Set([
  'AT',
  'BE',
  'DK',
  'FI',
  'FR',
  'DE',
  'IT',
  'NL',
  'PL',
  'ES',
  'SE',
])

const geoAreaCache = new Map<string, MarketplaceGeoArea[]>()

const countryMapGeometry: Record<
  string,
  Pick<MarketplaceGeoArea, 'centroid' | 'bounds'>
> = {
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

export function normalizeGeoCountry(countryCode: string | null | undefined) {
  const normalized = String(countryCode || '').trim().toUpperCase()
  return supportedGeoCountries.has(normalized) ? normalized : 'SE'
}

export function getStaticMarketplaceGeoAreas(countryCode: string) {
  const country = normalizeGeoCountry(countryCode)
  const cached = geoAreaCache.get(country)
  if (cached) return cached

  const dataset = getStaticGeoDataset(country)
  if (!dataset) return []
  const geometry = countryMapGeometry[country] || {
    centroid: { latitude: 50, longitude: 10 },
    bounds: { north: 72, east: 32, south: 35, west: -10 },
  }
  const areas: MarketplaceGeoArea[] = [
    ...dataset.regions.map((region) => ({
      id: `${country}:region:${region.code}`,
      countryCode: country,
      level: 'region' as const,
      name: region.name,
      code: region.code,
      slug: marketplaceGeoSlug(region.name),
      region: region.name,
      centroid: geometry.centroid,
      bounds: geometry.bounds,
      aliases: [region.code, region.name, marketplaceGeoSlug(region.name)],
    })),
    ...dataset.places.map((place) => ({
      id: `${country}:locality:${place.code}`,
      countryCode: country,
      level: 'locality' as const,
      name: place.name,
      code: place.code,
      slug: marketplaceGeoSlug(place.name || place.city),
      region: place.regionName,
      municipality: place.name,
      locality: place.city || place.name,
      postalCode: place.postalCode || undefined,
      centroid: geometry.centroid,
      bounds: geometry.bounds,
      aliases: [place.code, place.name, place.city, marketplaceGeoSlug(place.name || place.city)].filter(Boolean),
    })),
  ]

  const seen = new Set<string>()
  const uniqueAreas = areas.filter((area) => {
    if (!area.slug || seen.has(area.slug)) return false
    seen.add(area.slug)
    return true
  })
  geoAreaCache.set(country, uniqueAreas)
  return uniqueAreas
}

export function resolveStaticMarketplaceGeoAreaBySlug(
  countryCode: string,
  slug: string | null | undefined,
) {
  const normalizedSlug = marketplaceGeoSlug(slug || '')
  if (!normalizedSlug) return null
  return (
    getStaticMarketplaceGeoAreas(countryCode).find((area) =>
      area.slug === normalizedSlug ||
      marketplaceGeoSlug(area.code || '') === normalizedSlug ||
      area.aliases.some((alias) => marketplaceGeoSlug(alias) === normalizedSlug),
    ) || null
  )
}

export function resolveStaticMarketplaceGeoArea(
  value: string | null | undefined,
) {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return null
  const countryCode = normalized.slice(0, 2).toUpperCase()
  if (!supportedGeoCountries.has(countryCode)) return null
  return (
    getStaticMarketplaceGeoAreas(countryCode).find((area) =>
      area.id.toLowerCase() === normalized ||
      String(area.code || '').toLowerCase() === normalized,
    ) || null
  )
}

export function marketplaceGeoSlug(value: string) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getGeoRegions(countryCode: string) {
  const country = normalizeGeoCountry(countryCode)
  const staticDataset = getStaticGeoDataset(country)

  const rows = await readGeoRegions(country)
  if (rows.length) {
    return rows.map((row) => ({
      code: row.code,
      name: row.name,
    }))
  }

  return staticDataset?.regions.map((region) => ({
    code: region.code,
    name: region.name,
  })) || []
}

export async function searchGeoPlaces({
  countryCode,
  region,
  subregion,
  query,
  limit = 20,
}: {
  countryCode: string
  region?: string | null
  subregion?: string | null
  query?: string | null
  limit?: number
}) {
  const country = normalizeGeoCountry(countryCode)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 500)

  const dbRows = await readGeoPlaces({
    countryCode: country,
    region,
    subregion,
    query,
    limit: safeLimit,
  })
  if (dbRows.length) return dbRows.map(mapGeoPlaceRow)

  return fallbackGeoPlaces({ countryCode: country, region, query, limit: safeLimit })
}

export async function validateGeoListingLocation({
  countryCode,
  region,
  municipality,
  city,
  geoPlaceCode,
  locationSource,
}: {
  countryCode: string
  region?: string | null
  municipality?: string | null
  city?: string | null
  geoPlaceCode?: string | null
  locationSource?: string | null
}) {
  const country = normalizeGeoCountry(countryCode)
  const manual = locationSource === 'manual'
  if (manual) {
    const manualName = (municipality || city || '').trim()
    return {
      region: region || '',
      municipality: manualName,
      city: city || manualName,
      geoPlaceCode: null,
      locationSource: 'manual' as const,
      valid: Boolean(manualName),
    }
  }

  const placeQuery = municipality || city || ''
  const places = await searchGeoPlaces({
    countryCode: country,
    region,
    query: placeQuery,
    limit: 20,
  })
  const normalizedMunicipality = normalizeGeoName(municipality || '')
  const normalizedCity = normalizeGeoName(city || '')
  const match = places.find((place) => {
    if (geoPlaceCode && place.code === geoPlaceCode) return true
    const placeName = normalizeGeoName(place.name)
    const placeCity = normalizeGeoName(place.city)
    return Boolean(
      (normalizedMunicipality && (placeName === normalizedMunicipality || placeCity === normalizedMunicipality)) ||
        (normalizedCity && (placeCity === normalizedCity || placeName === normalizedCity)),
    )
  })

  if (match) {
    return {
      region: match.regionName || region || '',
      municipality: match.name,
      city: city || match.city || match.name,
      geoPlaceCode: match.code,
      locationSource: 'verified' as const,
      valid: true,
    }
  }

  return {
    region: region || '',
    municipality: municipality || '',
    city: city || municipality || '',
    geoPlaceCode: null,
    locationSource: 'unverified' as const,
    valid: false,
  }
}

async function readGeoRegions(countryCode: string): Promise<GeoRegionRow[]> {
  try {
    const { data, error } = await createAdminClient()
      .from('geo_regions')
      .select('code,name')
      .eq('country_code', countryCode)
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) return []
    return (data || []) as GeoRegionRow[]
  } catch {
    return []
  }
}

async function readGeoPlaces({
  countryCode,
  region,
  subregion,
  query,
  limit,
}: {
  countryCode: string
  region?: string | null
  subregion?: string | null
  query?: string | null
  limit: number
}): Promise<GeoPlaceRow[]> {
  try {
    let request = createAdminClient()
      .from('geo_places')
      .select('code,name,city,postal_code,region_code,region_name,subregion_code,subregion_name')
      .eq('country_code', countryCode)
      .eq('active', true)
      .order('name', { ascending: true })
      .limit(limit)

    const trimmedRegion = String(region || '').trim()
    if (trimmedRegion) {
      request = request.or(
        `region_code.eq.${escapeSupabaseFilter(trimmedRegion)},region_name.eq.${escapeSupabaseFilter(trimmedRegion)}`,
      )
    }

    const trimmedSubregion = String(subregion || '').trim()
    if (trimmedSubregion) {
      request = request.or(
        `subregion_code.eq.${escapeSupabaseFilter(trimmedSubregion)},subregion_name.eq.${escapeSupabaseFilter(trimmedSubregion)}`,
      )
    }

    const normalizedQuery = normalizeGeoName(query || '')
    if (normalizedQuery.length >= 2) {
      request = request.ilike('search_name', `%${escapeIlike(normalizedQuery)}%`)
    }

    const { data, error } = await request
    if (error) return []
    return (data || []) as GeoPlaceRow[]
  } catch {
    return []
  }
}

function fallbackGeoPlaces({
  countryCode,
  region,
  query,
  limit,
}: {
  countryCode: string
  region?: string | null
  query?: string | null
  limit: number
}) {
  const dataset = getStaticGeoDataset(countryCode)
  if (!dataset) return []
  const regionKey = normalizeGeoName(region || '')
  const queryKey = normalizeGeoName(query || '')

  return dataset.places
    .filter((place) => {
      if (!regionKey) return true
      return normalizeGeoName(place.regionCode) === regionKey || normalizeGeoName(place.regionName) === regionKey
    })
    .filter((place) => {
      if (queryKey.length < 2) return true
      const placeKey = normalizeGeoName([place.name, place.city, place.regionName].join(' '))
      return placeKey.includes(queryKey)
    })
    .map(mapStaticGeoPlace)
    .slice(0, limit)
}

function mapStaticGeoPlace(place: StaticGeoPlace): GeoPlaceOption {
  return {
    code: place.code,
    name: place.name,
    regionCode: place.regionCode,
    regionName: place.regionName,
    city: place.city,
    postalCode: place.postalCode,
    source: 'verified',
  }
}

function mapGeoPlaceRow(row: GeoPlaceRow): GeoPlaceOption {
  return {
    code: row.code,
    name: row.name,
    regionCode: row.region_code,
    regionName: row.region_name || row.region_code,
    city: row.city || row.name,
    postalCode: row.postal_code || null,
    source: 'verified',
  }
}

function escapeIlike(value: string) {
  return value.replace(/[%_]/g, (char) => `\\${char}`)
}

function escapeSupabaseFilter(value: string) {
  return value.replace(/["(),]/g, ' ')
}
