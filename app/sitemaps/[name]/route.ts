import { notFound } from 'next/navigation'
import { buildListingPath, listingMarketPath } from '@/lib/listing-url'
import { marketplaceCategories, type MarketplaceCategorySlug } from '@/lib/marketplace'
import { getStaticGeoDataset } from '@/lib/geo-static-datasets'
import { getGeoSitemapMarketConfig } from '@/lib/seo-geo-landings'
import {
  buildSeoPath,
  getPopularSeoLocations,
  popularSeoMakes,
  popularSeoModels,
  type SeoMarketCode,
} from '@/lib/seo-routes'
import { createAdminClient } from '@/lib/supabase/admin'
import { marketFromSitemapName, xmlResponse } from '@/app/sitemap.xml/route'

const host = 'https://www.autorell.com'
const maxUrlsPerSitemap = 50_000
export const dynamic = 'force-dynamic'
const listingSitemapCountries: Record<string, string> = {
  se: 'SE',
  de: 'DE',
  es: 'ES',
  fr: 'FR',
  it: 'IT',
  nl: 'NL',
  be: 'BE',
  pl: 'PL',
  at: 'AT',
  dk: 'DK',
  fi: 'FI',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params
  const normalizedName = name.replace(/\.xml$/i, '')
  const market = marketFromSitemapName(normalizedName)
  const listingCountry = listingCountryFromSitemapName(normalizedName)
  const geoSitemap = geoSitemapFromName(normalizedName)
  const vehicleNewsMarket = normalizedName.match(/^vehicle-news-(se|de|es|pl|fr)$/)?.[1]
  if (!market && !listingCountry && !geoSitemap && !vehicleNewsMarket) notFound()

  const urls = vehicleNewsMarket
    ? await vehicleNewsUrls(vehicleNewsMarket)
    : geoSitemap
    ? await geoSitemapUrls(geoSitemap.market, geoSitemap.page)
    : normalizedName.startsWith('listings-')
    ? await listingUrls(listingCountry!, pageFromSitemapName(normalizedName))
    : staticSeoUrls(market!, normalizedName)

  if (!urls.length) notFound()

  return xmlResponse([
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => [
      '  <url>',
      `    <loc>${escapeXml(url.loc)}</loc>`,
      url.lastmod ? `    <lastmod>${escapeXml(url.lastmod)}</lastmod>` : null,
      `    <changefreq>${url.changefreq || 'daily'}</changefreq>`,
      `    <priority>${url.priority || '0.7'}</priority>`,
      '  </url>',
    ].filter(Boolean).join('\n')),
    '</urlset>',
    '',
  ].join('\n'))
}

async function vehicleNewsUrls(market: string) {
  const language = market === 'se' ? 'sv' : market
  const base = [sitemapUrl(`/${market}/vehicle-news`, undefined, 'daily', '0.8')]
  const { data, error } = await createAdminClient()
    .from('content_posts')
    .select('slug,updated_at,published_at')
    .eq('post_type', 'news')
    .eq('status', 'published')
    .eq('market', market.toUpperCase())
    .eq('language', language)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(maxUrlsPerSitemap - 1)
  if (error) return base
  return [...base, ...(data || []).map((article) => sitemapUrl(`/${market}/vehicle-news/${article.slug}`, article.updated_at || article.published_at, 'weekly', '0.7'))]
}

async function geoSitemapUrls(market: string, page: number) {
  const config = getGeoSitemapMarketConfig(market)
  if (!config) return []
  const areas = await geoSitemapAreas(config.countryCode)
  const urlsPerArea = config.categorySlugs.length
  const maxAreasPerPage = Math.max(1, Math.floor(maxUrlsPerSitemap / urlsPerArea))
  const pageAreas = areas.slice((page - 1) * maxAreasPerPage, page * maxAreasPerPage)
  return pageAreas.flatMap((area) =>
    config.categorySlugs.map((categorySlug) =>
      sitemapUrl(`/${config.market}/${categorySlug}/${area.slug}`, undefined, 'daily', '0.8'),
    ),
  )
}

async function geoSitemapAreas(countryCode: string) {
  const [regions, places] = await Promise.all([
    readGeoRegions(countryCode),
    readGeoPlaces(countryCode),
  ])
  const staticDataset = getStaticGeoDataset(countryCode)
  const rows = [
    ...regions.map((region) => ({
      key: `region:${region.code}`,
      slug: slugify(region.name || region.code),
      name: region.name || region.code,
    })),
    ...places.map((place) => ({
      key: `place:${place.code}`,
      slug: slugify(place.name || place.city || place.code.split(':').pop() || place.code),
      name: place.name || place.city || place.code,
    })),
  ]

  if (staticDataset) {
    rows.push(
      ...staticDataset.regions.map((region) => ({
        key: `region:${region.code}`,
        slug: slugify(region.name || region.code),
        name: region.name || region.code,
      })),
      ...staticDataset.places.map((place) => ({
        key: `place:${place.code}`,
        slug: slugify(place.name || place.city || place.code.split(':').pop() || place.code),
        name: place.name || place.city || place.code,
      })),
    )
  }

  const seen = new Set<string>()
  return rows
    .filter((area) => {
      if (!area.slug) return false
      const dedupeKey = area.slug
      if (seen.has(dedupeKey)) return false
      seen.add(dedupeKey)
      return true
    })
    .sort((left, right) => left.name.localeCompare(right.name, 'en'))
}

function staticSeoUrls(market: SeoMarketCode, name: string) {
  const now = undefined
  const categoryUrls = marketplaceCategories
    .filter((category) => ['cars', 'vans', 'motorcycles', 'trucks'].includes(category.slug))
    .map((category) => buildSeoPath({ market, category: category.slug }))
    .filter((path): path is string => Boolean(path))

  if (name.startsWith('static-')) {
    return [
      `/${market}`,
      `/${market}/marketplace`,
      ...categoryUrls,
    ].map((path) => sitemapUrl(path, now, 'daily', '0.8'))
  }

  if (name.startsWith('categories-')) {
    return categoryUrls.map((path) => sitemapUrl(path, now, 'daily', '0.9'))
  }

  if (name.startsWith('brands-')) {
    return flatCategoryUrls(market, (category) =>
      popularSeoMakes.map((make) => buildSeoPath({ market, category, make })),
    )
  }

  if (name.startsWith('models-')) {
    return flatCategoryUrls(market, (category) =>
      popularSeoModels.map(({ make, model }) => buildSeoPath({ market, category, make, model })),
    )
  }

  if (name.startsWith('locations-')) {
    return flatCategoryUrls(market, (category) =>
      getPopularSeoLocations(market).map((location) => buildSeoPath({ market, category, location })),
    )
  }

  return []
}

function flatCategoryUrls(
  market: SeoMarketCode,
  build: (category: MarketplaceCategorySlug) => Array<string | null>,
) {
  return (['cars', 'vans', 'motorcycles', 'trucks'] as MarketplaceCategorySlug[])
    .flatMap((category) => build(category))
    .filter((path): path is string => Boolean(path))
    .map((path) => sitemapUrl(path, undefined, 'daily', '0.8'))
}

async function listingUrls(country: string, page: number) {
  const offset = (page - 1) * maxUrlsPerSitemap
  const { data } = await createAdminClient()
    .from('marketplace_listings')
    .select('id,title,make,model,model_year,city,country_code,published_at,created_at')
    .eq('status', 'published')
    .eq('country_code', country)
    .not('published_at', 'is', null)
    .is('sold_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('published_at', { ascending: false })
    .range(offset, offset + maxUrlsPerSitemap - 1)

  return (data || []).map((listing) => sitemapUrl(
    buildListingPath(listing),
    listing.published_at || listing.created_at,
    'daily',
    '0.9',
  ))
}

async function readGeoRegions(countryCode: string) {
  try {
    const { data } = await createAdminClient()
      .from('geo_regions')
      .select('code,name')
      .eq('country_code', countryCode)
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
      .limit(maxUrlsPerSitemap)
    return (data || []) as Array<{ code: string; name: string }>
  } catch {
    return []
  }
}

async function readGeoPlaces(countryCode: string) {
  try {
    const { data } = await createAdminClient()
      .from('geo_places')
      .select('code,name,city')
      .eq('country_code', countryCode)
      .eq('active', true)
      .order('name', { ascending: true })
      .limit(maxUrlsPerSitemap)
    return (data || []) as Array<{ code: string; name: string; city: string | null }>
  } catch {
    return []
  }
}

function listingCountryFromSitemapName(name: string) {
  const code = name.match(/^listings-([a-z]{2})-\d+$/i)?.[1]?.toLowerCase()
  if (!code || !listingSitemapCountries[code]) return null
  const marketPath = listingMarketPath(listingSitemapCountries[code])
  return marketPath.prefix ? listingSitemapCountries[code] : null
}

function geoSitemapFromName(name: string) {
  const match = name.match(/^geo-([a-z]{2})-(\d+)$/i)
  if (!match) return null
  const page = Number(match[2])
  return Number.isFinite(page) && page > 0 ? { market: match[1].toLowerCase(), page } : null
}

function pageFromSitemapName(name: string) {
  const page = Number(name.match(/-(\d+)$/)?.[1] || '1')
  return Number.isFinite(page) && page > 0 ? page : 1
}

function slugify(value: string) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sitemapUrl(path: string, lastmod?: string, changefreq?: string, priority?: string) {
  return {
    loc: `${host}${path}`,
    lastmod: lastmod ? new Date(lastmod).toISOString() : undefined,
    changefreq,
    priority,
  }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
