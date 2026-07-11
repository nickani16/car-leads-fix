import type { MarketplaceCategorySlug } from './marketplace'
import { swedishCounties, swedishMunicipalities } from './swedish-regions.generated'

export type SeoMarketCode = 'se' | 'de' | 'es'

export type SeoCategoryRoute = {
  category: MarketplaceCategorySlug | 'vehicles'
  segments: Record<SeoMarketCode, string>
  labels: Record<SeoMarketCode, string>
}

export type SeoLocation = {
  type: 'city' | 'municipality' | 'region'
  slug: string
  name: string
  market: SeoMarketCode
}

export type SeoRouteDefinition = {
  market: SeoMarketCode
  category: MarketplaceCategorySlug | 'vehicles'
  categorySegment: string
  make?: string
  makeSlug?: string
  model?: string
  modelSlug?: string
  location?: SeoLocation
  path: string
  indexableType:
    | 'category'
    | 'category-make'
    | 'category-make-model'
    | 'category-location'
    | 'category-make-location'
    | 'category-make-model-location'
}

export const seoMarkets: Record<SeoMarketCode, { country: string; locale: string; label: string }> = {
  se: { country: 'SE', locale: 'sv-SE', label: 'Sverige' },
  de: { country: 'DE', locale: 'de-DE', label: 'Deutschland' },
  es: { country: 'ES', locale: 'es-ES', label: 'España' },
}

export const seoCategoryRoutes: SeoCategoryRoute[] = [
  { category: 'vehicles', segments: { se: 'fordon', de: 'fahrzeuge', es: 'vehiculos' }, labels: { se: 'Fordon', de: 'Fahrzeuge', es: 'Vehículos' } },
  { category: 'cars', segments: { se: 'bilar', de: 'autos', es: 'coches' }, labels: { se: 'Bilar', de: 'Autos', es: 'Coches' } },
  { category: 'vans', segments: { se: 'transportbilar', de: 'transporter', es: 'furgonetas' }, labels: { se: 'Transportbilar', de: 'Transporter', es: 'Furgonetas' } },
  { category: 'motorcycles', segments: { se: 'motorcyklar', de: 'motorraeder', es: 'motos' }, labels: { se: 'Motorcyklar', de: 'Motorräder', es: 'Motos' } },
  { category: 'trucks', segments: { se: 'lastbilar', de: 'lkw', es: 'camiones' }, labels: { se: 'Lastbilar', de: 'Lkw', es: 'Camiones' } },
]

export const popularSeoMakes = ['Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Volvo', 'Toyota', 'Tesla']

export const popularSeoModels = [
  { make: 'Volvo', model: 'XC60' },
  { make: 'Volkswagen', model: 'Golf' },
  { make: 'BMW', model: 'X5' },
  { make: 'Audi', model: 'A4' },
  { make: 'Tesla', model: 'Model Y' },
]

const importantSwedishCities = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala']
const nonSwedishLocations: Record<Exclude<SeoMarketCode, 'se'>, SeoLocation[]> = {
  de: [
    { market: 'de', type: 'city', slug: 'berlin', name: 'Berlin' },
    { market: 'de', type: 'city', slug: 'hamburg', name: 'Hamburg' },
    { market: 'de', type: 'city', slug: 'muenchen', name: 'München' },
  ],
  es: [
    { market: 'es', type: 'city', slug: 'madrid', name: 'Madrid' },
    { market: 'es', type: 'city', slug: 'barcelona', name: 'Barcelona' },
    { market: 'es', type: 'city', slug: 'valencia', name: 'Valencia' },
  ],
}

export function getSeoCategoryBySegment(market: SeoMarketCode, segment: string) {
  return seoCategoryRoutes.find((route) => route.segments[market] === segment) || null
}

export function getSeoCategoryForCategory(category: MarketplaceCategorySlug | 'vehicles') {
  return seoCategoryRoutes.find((route) => route.category === category) || null
}

export function isSeoMarketCode(value: string): value is SeoMarketCode {
  return value === 'se' || value === 'de' || value === 'es'
}

export function isSeoVehiclePath(market: string, segments: string[]) {
  return isSeoMarketCode(market) && Boolean(segments[0] && getSeoCategoryBySegment(market, segments[0]))
}

export function parseSeoRoute(market: SeoMarketCode, rawSegments: string[]): SeoRouteDefinition | null {
  const [categorySegment, first, second, third] = rawSegments
  const categoryRoute = categorySegment ? getSeoCategoryBySegment(market, categorySegment) : null
  if (!categoryRoute || rawSegments.length > 4) return null

  if (!first) {
    return buildDefinition(market, categoryRoute.category, categorySegment, {}, 'category')
  }

  const firstLocation = resolveSeoLocation(market, first)
  if (firstLocation && !second) {
    return buildDefinition(market, categoryRoute.category, categorySegment, { location: firstLocation }, 'category-location')
  }

  const make = makeFromSlug(first)
  if (!make) return null

  if (!second) {
    return buildDefinition(market, categoryRoute.category, categorySegment, { make, makeSlug: first }, 'category-make')
  }

  const secondLocation = resolveSeoLocation(market, second)
  if (secondLocation && !third) {
    return buildDefinition(market, categoryRoute.category, categorySegment, { make, makeSlug: first, location: secondLocation }, 'category-make-location')
  }

  const model = modelFromSlug(make, second)
  if (!model) return null

  if (!third) {
    return buildDefinition(market, categoryRoute.category, categorySegment, { make, makeSlug: first, model, modelSlug: second }, 'category-make-model')
  }

  const thirdLocation = resolveSeoLocation(market, third)
  if (thirdLocation) {
    return buildDefinition(
      market,
      categoryRoute.category,
      categorySegment,
      { make, makeSlug: first, model, modelSlug: second, location: thirdLocation },
      'category-make-model-location',
    )
  }

  return null
}

export function getPopularSeoLocations(market: SeoMarketCode) {
  if (market !== 'se') return nonSwedishLocations[market]
  const cities = importantSwedishCities.map((name) => ({
    market,
    type: 'city' as const,
    name,
    slug: slugifySeoPart(name),
  }))
  const municipalities = swedishMunicipalities
    .filter((item) => ['Huddinge', 'Stockholm', 'Uppsala', 'Malmö', 'Göteborg'].includes(item.name))
    .map((item) => ({
      market,
      type: 'municipality' as const,
      name: `${item.name} kommun`,
      slug: `${item.slug}-kommun`,
    }))
  const regions = swedishCounties
    .filter((item) => ['stockholms-lan', 'vastra-gotalands-lan', 'skane-lan'].includes(item.slug))
    .map((item) => ({
      market,
      type: 'region' as const,
      name: item.name,
      slug: item.slug,
    }))
  return [...cities, ...municipalities, ...regions]
}

export function buildSeoPath({
  market,
  category,
  make,
  model,
  location,
}: {
  market: SeoMarketCode
  category: MarketplaceCategorySlug | 'vehicles'
  make?: string | null
  model?: string | null
  location?: SeoLocation | null
}) {
  const categoryRoute = getSeoCategoryForCategory(category)
  if (!categoryRoute) return null
  const segments = [market, categoryRoute.segments[market]]
  if (make) segments.push(slugifySeoPart(make))
  if (model) segments.push(slugifySeoPart(model))
  if (location) segments.push(location.slug)
  return `/${segments.join('/')}`
}

export function slugifySeoPart(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function resolveSeoLocation(market: SeoMarketCode, slug: string): SeoLocation | null {
  if (market !== 'se') {
    return nonSwedishLocations[market].find((item) => item.slug === slug) || null
  }

  const county = swedishCounties.find((item) => item.slug === slug)
  if (county) return { market, type: 'region', slug, name: county.name }

  const municipalitySlug = slug.endsWith('-kommun') ? slug.slice(0, -8) : slug
  const municipality = swedishMunicipalities.find((item) => item.slug === municipalitySlug)
  if (municipality && slug.endsWith('-kommun')) {
    return { market, type: 'municipality', slug, name: `${municipality.name} kommun` }
  }

  const city = importantSwedishCities.find((name) => slugifySeoPart(name) === slug)
  if (city) return { market, type: 'city', slug, name: city }

  return null
}

function buildDefinition(
  market: SeoMarketCode,
  category: MarketplaceCategorySlug | 'vehicles',
  categorySegment: string,
  parts: Pick<SeoRouteDefinition, 'make' | 'makeSlug' | 'model' | 'modelSlug' | 'location'>,
  indexableType: SeoRouteDefinition['indexableType'],
): SeoRouteDefinition {
  const path = buildSeoPath({ market, category, make: parts.make, model: parts.model, location: parts.location }) || `/${market}/${categorySegment}`
  return { market, category, categorySegment, ...parts, path, indexableType }
}

function makeFromSlug(slug: string) {
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) return null
  const special: Record<string, string> = {
    bmw: 'BMW',
    audi: 'Audi',
    volvo: 'Volvo',
    volkswagen: 'Volkswagen',
    toyota: 'Toyota',
    tesla: 'Tesla',
    'mercedes-benz': 'Mercedes-Benz',
    mercedes: 'Mercedes-Benz',
    skoda: 'Skoda',
  }
  const make = special[slug]
  if (!make) return null
  return popularSeoMakes.some((allowed) => allowed.toLowerCase() === make.toLowerCase()) ? make : null
}

function modelFromSlug(make: string, slug: string) {
  if (!/^[a-z0-9-]{1,50}$/.test(slug)) return null
  const words = slug.split('-')
  const model = words
    .map((word) => (/^[a-z]\d+$|^\d+[a-z]?$|^xc\d+$/i.test(word) ? word.toUpperCase() : titleCase(word)))
    .join(' ')
  return popularSeoModels.some(
    (allowed) =>
      allowed.make.toLowerCase() === make.toLowerCase() &&
      slugifySeoPart(allowed.model) === slugifySeoPart(model),
  )
    ? model
    : null
}

function titleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}
