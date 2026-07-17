import 'server-only'

import { getStaticGeoDataset, normalizeGeoName, type StaticGeoPlace } from './geo-static-datasets'
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
const verifiedMunicipalityCountries = new Set(['SE', 'DK', 'FI', 'NL', 'BE', 'AT'])

export function normalizeGeoCountry(countryCode: string | null | undefined) {
  const normalized = String(countryCode || '').trim().toUpperCase()
  return supportedGeoCountries.has(normalized) ? normalized : 'SE'
}

export async function getGeoRegions(countryCode: string) {
  const country = normalizeGeoCountry(countryCode)
  const staticDataset = getStaticGeoDataset(country)
  if (staticDataset?.expectedPlaces) {
    return staticDataset.regions.map((region) => ({
      code: region.code,
      name: region.name,
    }))
  }

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
  const staticDataset = getStaticGeoDataset(country)
  if (staticDataset?.expectedPlaces) {
    return fallbackGeoPlaces({ countryCode: country, region, query, limit: safeLimit })
  }

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
    if (verifiedMunicipalityCountries.has(country)) {
      return {
        region: region || '',
        municipality: manualName,
        city: city || manualName,
        geoPlaceCode: null,
        locationSource: 'unverified' as const,
        valid: false,
      }
    }
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
