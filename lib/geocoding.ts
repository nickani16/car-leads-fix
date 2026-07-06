import { resolveListingCoordinates } from './location-coordinates'

export type ListingGeocodeInput = {
  address?: string | null
  city?: string | null
  municipality?: string | null
  country?: string | null
}

export type ListingGeocodeResult = {
  latitude: number
  longitude: number
}

export function parseCoordinate(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && Math.abs(parsed) <= 180 ? parsed : null
}

export async function geocodeListingLocation(
  input: ListingGeocodeInput,
): Promise<ListingGeocodeResult | null> {
  const provider = process.env.GEOCODING_PROVIDER || process.env.MAP_GEOCODING_PROVIDER
  const endpoint = process.env.GEOCODING_API_URL || process.env.MAP_GEOCODING_API_URL

  const fallback = resolveListingCoordinates({
    city: input.city,
    municipality: input.municipality,
    country: input.country,
    countryCode: input.country,
  })

  if (!provider || !endpoint) {
    return fallback
      ? { latitude: fallback.latitude, longitude: fallback.longitude }
      : null
  }

  void provider
  void endpoint
  return fallback
    ? { latitude: fallback.latitude, longitude: fallback.longitude }
    : null
}
