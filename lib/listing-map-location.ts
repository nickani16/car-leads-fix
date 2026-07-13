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
  source: 'listing_coordinates' | 'geocoded_full_address' | 'geocoded_postal_city_country'
  query: string | null
}

export async function resolveListingMapLocation(
  input: ListingMapLocationInput,
): Promise<ListingMapLocation | null> {
  const listingCoordinates = parseListingCoordinates(input.latitude, input.longitude)
  if (listingCoordinates) {
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
