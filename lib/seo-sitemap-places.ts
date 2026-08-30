import swedenSitemapPlaceRows from '../scripts/data/geonames-sweden-sitemap-places-2026.json'
import expandedSitemapPlaceRows from '../scripts/data/geonames-seo-sitemap-places-2026.json'
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

type CompactSitemapPlaceRow = [
  geonameId: string,
  name: string,
  regionCode: string,
  regionName: string,
]

const expandedRowsByCountry = expandedSitemapPlaceRows as unknown as Record<
  string,
  CompactSitemapPlaceRow[]
>

const swedenGeometry = {
  centroid: { latitude: 62, longitude: 15 },
  bounds: { north: 69.1, east: 24.2, south: 55.2, west: 10.6 },
}

const expandedCountryGeometry: Record<string, typeof swedenGeometry> = {
  AT: { centroid: { latitude: 47.6, longitude: 14.1 }, bounds: { north: 49.1, east: 17.2, south: 46.3, west: 9.5 } },
  BE: { centroid: { latitude: 50.6, longitude: 4.7 }, bounds: { north: 51.5, east: 6.4, south: 49.5, west: 2.5 } },
  DK: { centroid: { latitude: 56.1, longitude: 10 }, bounds: { north: 57.8, east: 15.2, south: 54.5, west: 8 } },
  ES: { centroid: { latitude: 40.4, longitude: -3.7 }, bounds: { north: 43.8, east: 4.4, south: 36, west: -9.4 } },
  FI: { centroid: { latitude: 64.5, longitude: 26 }, bounds: { north: 70.1, east: 31.6, south: 59.7, west: 19.1 } },
  NL: { centroid: { latitude: 52.1, longitude: 5.3 }, bounds: { north: 53.7, east: 7.3, south: 50.7, west: 3.3 } },
  PL: { centroid: { latitude: 52.1, longitude: 19.4 }, bounds: { north: 54.9, east: 24.2, south: 49, west: 14.1 } },
}

// Keep the indexable geo surface focused on the largest buyer markets instead
// of publishing every imported locality. The full datasets remain available to
// marketplace search; this list only controls sitemap discovery.
const prioritySitemapPlaceSlugs: Record<string, readonly string[]> = {
  AT: ['wien', 'graz', 'linz', 'salzburg', 'innsbruck'],
  BE: ['bruxelles-brussel', 'gent', 'charleroi', 'liege'],
  DE: ['berlin', 'hamburg', 'munchen', 'koln', 'frankfurt-am-main'],
  DK: ['k-benhavn', 'aarhus', 'odense', 'aalborg', 'esbjerg'],
  ES: ['madrid', 'barcelona', 'valencia', 'sevilla', 'zaragoza'],
  FI: ['helsinki', 'espoo', 'tampere', 'vantaa', 'oulu'],
  FR: ['paris', 'marseille', 'lyon', 'toulouse', 'nice'],
  IT: ['roma', 'milano', 'napoli', 'torino', 'palermo'],
  NL: ['amsterdam', 'rotterdam', 'den-haag', 'utrecht', 'eindhoven'],
  PL: ['warszawa', 'krakow', 'odz', 'wroc-aw', 'poznan'],
  SE: ['stockholm', 'goteborg', 'malmo', 'uppsala', 'vasteras'],
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

const cachedSeoAreas = new Map<string, MarketplaceGeoArea[]>()

export function getSeoSitemapAreas(countryCode: string) {
  const country = countryCode.toUpperCase()
  const baseAreas = getStaticMarketplaceGeoAreas(country)
  const cached = cachedSeoAreas.get(country)
  if (cached) return cached

  const expandedAreas = country === 'SE'
    ? swedenSitemapPlaces
    : buildExpandedCountryAreas(country)
  if (!expandedAreas.length) return baseAreas

  const seen = new Set<string>()
  const areas = [...baseAreas, ...expandedAreas].filter((area) => {
    if (!area.slug || seen.has(area.slug)) return false
    seen.add(area.slug)
    return true
  })
  const prioritySlugs = new Set(prioritySitemapPlaceSlugs[country] || [])
  const priorityAreas = areas.filter(
    (area) => Boolean(area.slug && prioritySlugs.has(area.slug)),
  )
  cachedSeoAreas.set(country, priorityAreas)
  return priorityAreas
}

function buildExpandedCountryAreas(country: string): MarketplaceGeoArea[] {
  const geometry = expandedCountryGeometry[country]
  const rows = expandedRowsByCountry[country]
  if (!geometry || !rows) return []

  return rows.map(([geonameId, name, regionCode, regionName]) => ({
    id: `${country}:sitemap-locality:${geonameId}`,
    countryCode: country,
    level: 'locality' as const,
    name,
    code: geonameId,
    slug: marketplaceGeoSlug(name),
    region: regionName,
    municipality: name,
    locality: name,
    centroid: geometry.centroid,
    bounds: geometry.bounds,
    aliases: [geonameId, name, regionCode, marketplaceGeoSlug(name)],
  }))
}
