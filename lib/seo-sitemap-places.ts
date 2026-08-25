import swedenSitemapPlaceRows from '../scripts/data/geonames-sweden-sitemap-places-2026.json'
import {
  getStaticMarketplaceGeoAreas,
  marketplaceGeoSlug,
} from './marketplace-geo'
import type { MarketplaceGeoArea } from './marketplace-search-state'

type SwedenSitemapPlaceRow = {
  municipalityCode: string
  municipalityName: string
  regionCode: string
  regionName: string
}

const swedenGeometry = {
  centroid: { latitude: 62, longitude: 15 },
  bounds: { north: 69.1, east: 24.2, south: 55.2, west: 10.6 },
}

const swedenSitemapPlaces = (swedenSitemapPlaceRows as SwedenSitemapPlaceRow[]).map((place) => ({
  id: `SE:sitemap-locality:${place.municipalityCode}`,
  countryCode: 'SE',
  level: 'locality' as const,
  name: place.municipalityName,
  code: place.municipalityCode,
  slug: marketplaceGeoSlug(place.municipalityName),
  region: place.regionName,
  municipality: place.municipalityName,
  locality: place.municipalityName,
  centroid: swedenGeometry.centroid,
  bounds: swedenGeometry.bounds,
  aliases: [
    place.municipalityCode,
    place.municipalityName,
    place.regionCode,
    marketplaceGeoSlug(place.municipalityName),
  ],
} satisfies MarketplaceGeoArea))

let cachedSwedenSeoAreas: MarketplaceGeoArea[] | null = null

export function getSeoSitemapAreas(countryCode: string) {
  const country = countryCode.toUpperCase()
  const baseAreas = getStaticMarketplaceGeoAreas(country)
  if (country !== 'SE') return baseAreas
  if (cachedSwedenSeoAreas) return cachedSwedenSeoAreas

  const seen = new Set<string>()
  cachedSwedenSeoAreas = [...baseAreas, ...swedenSitemapPlaces].filter((area) => {
    if (!area.slug || seen.has(area.slug)) return false
    seen.add(area.slug)
    return true
  })
  return cachedSwedenSeoAreas
}
