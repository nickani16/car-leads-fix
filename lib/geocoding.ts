import { resolveListingMapLocation } from './listing-map-location'

export type ListingGeocodeInput = {
  address?: string | null
  postalCode?: string | null
  city?: string | null
  municipality?: string | null
  country?: string | null
  countryCode?: string | null
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
  const resolved = await resolveListingMapLocation({
    id: 'listing-form-location',
    address: input.address,
    postalCode: input.postalCode,
    city: input.city,
    latitude: null,
    longitude: null,
    country: input.country,
    countryCode: input.countryCode || input.country,
  })

  return resolved
    ? { latitude: resolved.latitude, longitude: resolved.longitude }
    : null
}
