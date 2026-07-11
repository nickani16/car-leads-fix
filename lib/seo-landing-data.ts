import 'server-only'

import { unstable_cache } from 'next/cache'
import { searchMarketplaceListings } from './marketplace-search-v2'
import { formatMarketplacePrice, getMarketplaceCategory, type MarketplaceCategorySlug } from './marketplace'
import { buildListingPath } from './listing-url'
import type { PublicLocale } from './public-i18n'
import {
  buildSeoPath,
  getPopularSeoLocations,
  getSeoCategoryForCategory,
  popularSeoMakes,
  popularSeoModels,
  seoMarkets,
  type SeoRouteDefinition,
} from './seo-routes'

export type SeoLandingListing = {
  id: string
  title: string
  href: string
  make: string | null
  model: string | null
  modelYear: number | null
  mileageKm: number | null
  fuelType: string | null
  gearbox: string | null
  city: string | null
  municipality: string | null
  countryCode: string | null
  price: string | null
  image: string | null
}

export type SeoLandingData = {
  title: string
  h1: string
  description: string
  intro: string
  canonical: string
  robots: { index: boolean; follow: boolean }
  count: number
  minIndexableCount: number
  listings: SeoLandingListing[]
  breadcrumbs: Array<{ label: string; href: string }>
  relatedLinks: Array<{ label: string; href: string }>
  alternateLanguages: Record<string, string>
  pagination: {
    currentPage: number
    totalPages: number
    pageSize: number
    previousHref: string | null
    nextHref: string | null
  }
}

export const getSeoLandingData = unstable_cache(
  async (route: SeoRouteDefinition, page = 1): Promise<SeoLandingData> => {
    const country = seoMarkets[route.market].country
    const locale = route.market === 'se' ? 'sv' : route.market
    const currentPage = normalizePage(page)
    const pageSize = 24
    const result = await searchMarketplaceListings({
      categories: route.category === 'vehicles' ? null : route.category,
      markets: country,
      make: route.make || null,
      model: route.model || null,
      city: route.location?.type === 'city' ? stripMunicipalitySuffix(route.location.name) : null,
      municipality: route.location?.type === 'municipality' ? stripMunicipalitySuffix(route.location.name) : null,
      limit: pageSize,
      page: currentPage,
      sort: 'published',
    })

    const minIndexableCount = minimumIndexableCount(route)
    const count = result.totalEstimate ?? result.items.length
    const indexable = count >= minIndexableCount
    const labels = buildSeoLabels(route, count)
    const totalPages = result.totalPages || Math.max(1, Math.ceil(count / pageSize))
    const canonicalPath = pageHref(route.path, currentPage)

    return {
      title: labels.title,
      h1: labels.h1,
      description: labels.description,
      intro: labels.intro,
      canonical: `https://www.autorell.com${canonicalPath}`,
      robots: { index: indexable, follow: true },
      count,
      minIndexableCount,
      listings: result.items.map((item) => mapSeoListing(item, locale as PublicLocale)),
      breadcrumbs: buildBreadcrumbs(route),
      relatedLinks: buildRelatedLinks(route),
      alternateLanguages: buildAlternateLanguages(route, currentPage),
      pagination: {
        currentPage,
        totalPages,
        pageSize,
        previousHref: currentPage > 1 ? pageHref(route.path, currentPage - 1) : null,
        nextHref: currentPage < totalPages ? pageHref(route.path, currentPage + 1) : null,
      },
    }
  },
  ['seo-landing-data'],
  { revalidate: 300, tags: ['marketplace-listings', 'seo-landings'] },
)

export function buildSeoLandingJsonLd(data: SeoLandingData) {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: data.breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://www.autorell.com${item.href}`,
    })),
  }

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: data.h1,
    numberOfItems: data.count,
    itemListElement: data.listings.map((listing, index) => ({
      '@type': 'ListItem',
      position: (data.pagination.currentPage - 1) * data.pagination.pageSize + index + 1,
      url: `https://www.autorell.com${listing.href}`,
      name: listing.title,
    })),
  }

  return [breadcrumb, itemList]
}

export function sanitizeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function mapSeoListing(item: Record<string, unknown>, locale: PublicLocale): SeoLandingListing {
  const price = numberOrNull(item.price)
  const currency = stringOrNull(item.currency) || 'EUR'
  return {
    id: String(item.id || ''),
    title: stringOrNull(item.title) || 'Autorell listing',
    href: buildListingPath({
      id: String(item.id || ''),
      title: stringOrNull(item.title),
      make: stringOrNull(item.make),
      model: stringOrNull(item.model),
      model_year: numberOrNull(item.model_year),
      city: stringOrNull(item.city),
      country_code: stringOrNull(item.country_code),
    }),
    make: stringOrNull(item.make),
    model: stringOrNull(item.model),
    modelYear: numberOrNull(item.model_year),
    mileageKm: numberOrNull(item.mileage_km),
    fuelType: stringOrNull(item.fuel_type),
    gearbox: stringOrNull(item.gearbox),
    city: stringOrNull(item.city),
    municipality: stringOrNull(item.municipality),
    countryCode: stringOrNull(item.country_code),
    price: price !== null ? formatMarketplacePrice(price, currency, locale) : null,
    image: Array.isArray(item.images) ? item.images.find((image): image is string => typeof image === 'string') || null : null,
  }
}

function buildSeoLabels(route: SeoRouteDefinition, count: number) {
  const marketLabel = seoMarkets[route.market].label
  const categoryRoute = getSeoCategoryForCategory(route.category)
  const categoryLabel = categoryRoute?.labels[route.market] || getFallbackCategoryLabel(route.category)
  const subject = [route.make, route.model].filter(Boolean).join(' ') || categoryLabel
  const location = route.location?.name
  const countText = count > 0 ? `${count} aktuella annonser` : 'aktuella annonser'

  if (route.market === 'de') {
    const place = location ? ` in ${location}` : ' in Deutschland'
    return {
      title: `${subject} kaufen${place} | Autorell`,
      h1: `${subject} kaufen${place}`,
      description: `Finden Sie ${subject} bei Autorell. Vergleichen Sie Preis, Baujahr, Kilometerstand und Verkäufer.`,
      intro: `Hier finden Sie ${countText.toLowerCase()} für ${subject}${place}. Vergleichen Sie Fahrzeuge von privaten und gewerblichen Verkäufern.`,
    }
  }

  if (route.market === 'es') {
    const place = location ? ` en ${location}` : ' en España'
    return {
      title: `${subject} en venta${place} | Autorell`,
      h1: `${subject} en venta${place}`,
      description: `Encuentra ${subject} en Autorell. Compara precio, año, kilometraje y vendedor.`,
      intro: `Aquí encontrarás ${countText.toLowerCase()} de ${subject}${place}. Compara vehículos de vendedores particulares y profesionales.`,
    }
  }

  const place = location ? ` i ${location}` : ` i ${marketLabel}`
  return {
    title: `${subject} till salu${place} | Autorell`,
    h1: `${subject} till salu${place}`,
    description: `Se aktuella ${subject.toLowerCase()} till salu${place}. Jämför pris, årsmodell, miltal och säljare på Autorell.`,
    intro: `Här hittar du ${countText.toLowerCase()} för ${subject.toLowerCase()}${place} från både privatpersoner och företag. Jämför pris, årsmodell, miltal och utrustning.`,
  }
}

function buildBreadcrumbs(route: SeoRouteDefinition) {
  const categoryRoute = getSeoCategoryForCategory(route.category)
  const breadcrumbs = [
    { label: 'Autorell', href: `/${route.market}` },
    {
      label: categoryRoute?.labels[route.market] || getFallbackCategoryLabel(route.category),
      href: `/${route.market}/${route.categorySegment}`,
    },
  ]
  if (route.make) {
    breadcrumbs.push({ label: route.make, href: `/${route.market}/${route.categorySegment}/${route.makeSlug}` })
  }
  if (route.model && route.makeSlug && route.modelSlug) {
    breadcrumbs.push({
      label: route.model,
      href: `/${route.market}/${route.categorySegment}/${route.makeSlug}/${route.modelSlug}`,
    })
  }
  if (route.location) {
    breadcrumbs.push({ label: route.location.name, href: route.path })
  }
  return breadcrumbs
}

function buildRelatedLinks(route: SeoRouteDefinition) {
  const links: Array<{ label: string; href: string }> = []
  for (const make of popularSeoMakes) {
    const href = buildSeoPath({ market: route.market, category: route.category, make })
    if (href && href !== route.path) links.push({ label: make, href })
  }
  for (const { make, model } of popularSeoModels) {
    const href = buildSeoPath({ market: route.market, category: route.category, make, model })
    if (href && href !== route.path) links.push({ label: `${make} ${model}`, href })
  }
  for (const location of getPopularSeoLocations(route.market).slice(0, 8)) {
    const href = buildSeoPath({ market: route.market, category: route.category, make: route.make, location })
    if (href && href !== route.path) {
      links.push({ label: route.make ? `${route.make} ${location.name}` : `${getFallbackCategoryLabel(route.category)} ${location.name}`, href })
    }
  }
  return links.slice(0, 18)
}

function buildAlternateLanguages(route: SeoRouteDefinition, page = 1) {
  const languages: Record<string, string> = {
    'x-default': 'https://www.autorell.com/',
  }
  for (const market of ['se', 'de', 'es'] as const) {
    const location =
      route.location && route.location.market === market
        ? route.location
        : undefined
    const href = buildSeoPath({
      market,
      category: route.category,
      make: route.make,
      model: route.model,
      location,
    })
    if (href) {
      languages[seoMarkets[market].locale] = `https://www.autorell.com${pageHref(href, page)}`
    }
  }
  return languages
}

export function normalizeSeoPage(value: unknown) {
  return normalizePage(value)
}

function normalizePage(value: unknown) {
  const page = Number(value)
  return Number.isFinite(page) && page > 1 ? Math.floor(page) : 1
}

function pageHref(path: string, page: number) {
  return page > 1 ? `${path}?page=${page}` : path
}

function minimumIndexableCount(route: SeoRouteDefinition) {
  if (route.indexableType === 'category') return 1
  if (route.indexableType === 'category-make' || route.indexableType === 'category-make-model') return 3
  return 5
}

function getFallbackCategoryLabel(category: MarketplaceCategorySlug | 'vehicles') {
  if (category === 'vehicles') return 'Fordon'
  return getMarketplaceCategory(category).labels.sv
}

function stripMunicipalitySuffix(value: string) {
  return value.replace(/\s+kommun$/i, '')
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function stringOrNull(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}
