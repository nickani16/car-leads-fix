import 'server-only'

type ListingMapLocationInput = {
  id: string
  address?: string | null
  postalCode?: string | null
  city?: string | null
  country?: string | null
  countryCode?: string | null
  latitude?: number | string | null
  longitude?: number | string | null
}

export type ListingMapLocation = {
  latitude: number
  longitude: number
  approximate: boolean
  source: 'listing_coordinates' | 'geocoded_full_address' | 'geocoded_postal_city_country' | 'geocoded_city_country'
  query: string | null
}

export async function resolveListingMapLocation(
  input: ListingMapLocationInput,
): Promise<ListingMapLocation | null> {
  const listingCoordinates = parseListingCoordinates(input.latitude, input.longitude)
  if (listingCoordinates && !isKnownGenericFallbackCoordinate(listingCoordinates, input)) {
    return {
      ...listingCoordinates,
      approximate: false,
      source: 'listing_coordinates',
      query: null,
    }
  }

  const fullAddressQuery = buildLocationQuery([
    input.address,
    input.postalCode,
    input.city,
    input.country || input.countryCode,
  ])
  if (fullAddressQuery && hasFullStreetAddress(input)) {
    const geocoded = await geocodeSavedListingAddress(fullAddressQuery)
    if (geocoded) {
      return {
        ...geocoded,
        approximate: false,
        source: 'geocoded_full_address',
        query: fullAddressQuery,
      }
    }
  }

  const postalQuery = buildLocationQuery([
    input.postalCode,
    input.city,
    input.country || input.countryCode,
  ])
  if (postalQuery && hasPostalCityCountry(input)) {
    const geocoded = await geocodeSavedListingAddress(postalQuery)
    if (geocoded) {
      return {
        ...geocoded,
        approximate: true,
        source: 'geocoded_postal_city_country',
        query: postalQuery,
      }
    }
  }

  const cityCountryQuery = buildLocationQuery([
    input.city,
    input.country || input.countryCode,
  ])
  if (cityCountryQuery && hasCityCountryOnly(input)) {
    const geocoded = await geocodeSavedListingAddress(cityCountryQuery)
    if (geocoded) {
      return {
        ...geocoded,
        approximate: true,
        source: 'geocoded_city_country',
        query: cityCountryQuery,
      }
    }
  }

  return null
}

export function parseListingCoordinates(
  latitude: number | string | null | undefined,
  longitude: number | string | null | undefined,
) {
  const parsedLatitude = parseCoordinate(latitude)
  const parsedLongitude = parseCoordinate(longitude)

  if (parsedLatitude === null || parsedLongitude === null) return null
  if (parsedLatitude === 0 && parsedLongitude === 0) return null
  if (!validLatitude(parsedLatitude) || !validLongitude(parsedLongitude)) return null

  return {
    latitude: parsedLatitude,
    longitude: parsedLongitude,
  }
}

function parseCoordinate(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

function isKnownGenericFallbackCoordinate(
  coordinates: { latitude: number; longitude: number },
  input: ListingMapLocationInput,
) {
  const countryKey = normalizeLocationName(input.countryCode || input.country || '').toUpperCase()
  const cityKey = normalizeLocationName(input.city || '')
  const fallbackCoordinates = [
    countryKey ? legacyCountryFallbackCoordinates[countryKey] : null,
    cityKey ? legacyCityFallbackCoordinates[cityKey] : null,
  ].filter(Boolean) as Array<{ latitude: number; longitude: number }>

  return fallbackCoordinates.some((fallback) => sameCoordinate(coordinates, fallback))
}

function sameCoordinate(
  left: { latitude: number; longitude: number },
  right: { latitude: number; longitude: number },
) {
  return (
    Math.abs(left.latitude - right.latitude) < 0.000001 &&
    Math.abs(left.longitude - right.longitude) < 0.000001
  )
}

function normalizeLocationName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ã¥/g, 'a')
    .replace(/Ã¤/g, 'a')
    .replace(/Ã¶/g, 'o')
}

const legacyCityFallbackCoordinates: Record<string, { latitude: number; longitude: number }> = {
  nacka: { latitude: 59.3105, longitude: 18.1637 },
  taby: { latitude: 59.4439, longitude: 18.0687 },
  stockholm: { latitude: 59.3293, longitude: 18.0686 },
  goteborg: { latitude: 57.7089, longitude: 11.9746 },
  malmo: { latitude: 55.605, longitude: 13.0038 },
  uppsala: { latitude: 59.8586, longitude: 17.6389 },
  vasteras: { latitude: 59.6099, longitude: 16.5448 },
  orebro: { latitude: 59.2753, longitude: 15.2134 },
  linkoping: { latitude: 58.4108, longitude: 15.6214 },
  helsingborg: { latitude: 56.0465, longitude: 12.6945 },
  jonkoping: { latitude: 57.7826, longitude: 14.1618 },
  norrkoping: { latitude: 58.5877, longitude: 16.1924 },
  lund: { latitude: 55.7047, longitude: 13.191 },
  umea: { latitude: 63.8258, longitude: 20.263 },
}

const legacyCountryFallbackCoordinates: Record<string, { latitude: number; longitude: number }> = {
  SE: { latitude: 57.8, longitude: 14.5 },
  SWEDEN: { latitude: 57.8, longitude: 14.5 },
  SVERIGE: { latitude: 57.8, longitude: 14.5 },
  DK: { latitude: 56.0, longitude: 10.0 },
  DE: { latitude: 51.16, longitude: 10.45 },
  NO: { latitude: 60.47, longitude: 8.47 },
  FI: { latitude: 61.92, longitude: 25.75 },
  NL: { latitude: 52.13, longitude: 5.29 },
  BE: { latitude: 50.5, longitude: 4.47 },
  FR: { latitude: 46.23, longitude: 2.21 },
  ES: { latitude: 40.46, longitude: -3.75 },
  IT: { latitude: 41.87, longitude: 12.57 },
  PL: { latitude: 51.92, longitude: 19.15 },
  EU: { latitude: 52.0, longitude: 14.5 },
}

function buildLocationQuery(parts: Array<string | null | undefined>) {
  const query = parts
    .map((part) => (part || '').trim())
    .filter(Boolean)
    .join(', ')
  return query || null
}

function hasFullStreetAddress(input: ListingMapLocationInput) {
  const address = (input.address || '').trim()
  const hasStreetNumber = /\d/.test(address)
  return Boolean(
    address &&
      hasStreetNumber &&
      (input.city || '').trim() &&
      ((input.country || '').trim() || (input.countryCode || '').trim()),
  )
}

function hasPostalCityCountry(input: ListingMapLocationInput) {
  return Boolean(
    (input.postalCode || '').trim() &&
      (input.city || '').trim() &&
      ((input.country || '').trim() || (input.countryCode || '').trim()),
  )
}

function hasCityCountryOnly(input: ListingMapLocationInput) {
  return Boolean(
    !(input.address || '').trim() &&
      !(input.postalCode || '').trim() &&
      (input.city || '').trim() &&
      ((input.country || '').trim() || (input.countryCode || '').trim()),
  )
}

async function geocodeSavedListingAddress(query: string) {
  const endpoint = process.env.GEOCODING_API_URL || process.env.MAP_GEOCODING_API_URL
  const url = endpoint
    ? buildConfiguredGeocodingUrl(endpoint, query)
    : buildNominatimUrl(query)

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Autorell listing detail map geocoder',
      },
      next: { revalidate: 60 * 60 * 24 * 30 },
    })
    if (!response.ok) return null
    const payload = await response.json()
    return readFirstCoordinate(payload)
  } catch {
    return null
  }
}

function buildConfiguredGeocodingUrl(endpoint: string, query: string) {
  const url = new URL(endpoint)
  if (!url.searchParams.has('q') && !url.searchParams.has('query')) {
    url.searchParams.set('q', query)
  }
  if (!url.searchParams.has('format')) {
    url.searchParams.set('format', 'json')
  }
  if (!url.searchParams.has('limit')) {
    url.searchParams.set('limit', '1')
  }
  return url
}

function buildNominatimUrl(query: string) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('addressdetails', '0')
  return url
}

function readFirstCoordinate(payload: unknown) {
  const candidate = Array.isArray(payload)
    ? payload[0]
    : typeof payload === 'object' && payload !== null && 'features' in payload
      ? (payload as { features?: Array<{ geometry?: { coordinates?: unknown } }> }).features?.[0]
      : payload

  if (!candidate || typeof candidate !== 'object') return null

  if ('lat' in candidate && 'lon' in candidate) {
    const latitude = parseCoordinate((candidate as { lat?: string | number }).lat)
    const longitude = parseCoordinate((candidate as { lon?: string | number }).lon)
    return latitude !== null && longitude !== null && validLatitude(latitude) && validLongitude(longitude)
      ? { latitude, longitude }
      : null
  }

  const coordinates = (candidate as { geometry?: { coordinates?: unknown } }).geometry?.coordinates
  if (Array.isArray(coordinates)) {
    const longitude = parseCoordinate(coordinates[0] as string | number | null)
    const latitude = parseCoordinate(coordinates[1] as string | number | null)
    return latitude !== null && longitude !== null && validLatitude(latitude) && validLongitude(longitude)
      ? { latitude, longitude }
      : null
  }

  return null
}

function validLatitude(value: number) {
  return value >= -90 && value <= 90
}

function validLongitude(value: number) {
  return value >= -180 && value <= 180
}
