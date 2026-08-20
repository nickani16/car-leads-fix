import { notFound } from 'next/navigation'
import { buildListingPath, listingMarketPath } from '@/lib/listing-url'
import {
  buildSeoMarketplacePath,
  getGeoSitemapMarketConfig,
  getSeoSitemapAreas,
  getSeoSitemapMakes,
  getSeoSitemapModels,
  shouldIncludeInSitemap,
} from '@/lib/seo-geo-landings'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  allSitemapMarkets,
  marketFromSitemapName,
  popularGeoMakes,
  popularGeoModels,
  type SitemapMarketCode,
  xmlResponse,
} from '@/lib/sitemap-utils'

const host = 'https://www.autorell.com'
const maxUrlsPerSitemap = 50_000
const maxGeoUrlsPerSitemap = 10_000
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
  const staticMarket = marketFromPrefixedSitemapName(normalizedName, 'static')
  const listingCountry = listingCountryFromSitemapName(normalizedName)
  const geoSitemap = geoSitemapFromName(normalizedName)
  const geoMakeSitemap = geoMakeSitemapFromName(normalizedName)
  const geoModelSitemap = geoModelSitemapFromName(normalizedName)
  const marketplaceSearchMarket = marketFromPrefixedSitemapName(normalizedName, 'marketplace')
  const vehicleNewsMarket = marketFromPrefixedSitemapName(normalizedName, 'vehicle-news')
  if (!market && !staticMarket && !listingCountry && !geoSitemap && !geoMakeSitemap && !geoModelSitemap && !marketplaceSearchMarket && !vehicleNewsMarket) notFound()

  const urls = staticMarket
    ? staticPublicUrls(staticMarket)
    : vehicleNewsMarket
    ? await vehicleNewsUrls(vehicleNewsMarket)
    : marketplaceSearchMarket
    ? marketplaceSearchUrls(marketplaceSearchMarket)
    : geoModelSitemap
    ? geoModelSitemapUrls(geoModelSitemap.market, geoModelSitemap.page)
    : geoMakeSitemap
    ? geoMakeSitemapUrls(geoMakeSitemap.market, geoMakeSitemap.page)
    : geoSitemap
    ? geoSitemapUrls(geoSitemap.market, geoSitemap.page)
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
  try {
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
  } catch {
    return base
  }
}

function geoSitemapUrls(market: string, page: number) {
  const config = getGeoSitemapMarketConfig(market)
  if (!config) return []
  const areas = getSeoSitemapAreas(config.countryCode)
  const urlsPerArea = config.categorySlugs.length
  const maxAreasPerPage = Math.max(1, Math.floor(maxGeoUrlsPerSitemap / urlsPerArea))
  const pageAreas = areas.slice((page - 1) * maxAreasPerPage, page * maxAreasPerPage)
  return pageAreas.flatMap((area) =>
    config.categories
      .filter((entry) => shouldIncludeInSitemap({ category: entry.category, make: null, model: null, place: area }))
      .map((entry) => sitemapUrl(`/${config.market}/${entry.slug}/${area.slug}`, undefined, 'daily', '0.8')),
  )
}

function geoMakeSitemapUrls(market: SitemapMarketCode, page: number) {
  const config = getGeoSitemapMarketConfig(market)
  const carCategorySlug = config?.categories.find((entry) => entry.category === 'cars' && !entry.leasing)?.slug
  if (!config || !carCategorySlug) return []
  const areas = getSeoSitemapAreas(config.countryCode)
  const urlsPerArea = popularGeoMakes.length
  const maxAreasPerPage = Math.max(1, Math.floor(maxGeoUrlsPerSitemap / urlsPerArea))
  const pageAreas = areas.slice((page - 1) * maxAreasPerPage, page * maxAreasPerPage)
  return pageAreas.flatMap((area) =>
    popularGeoMakes
      .filter((make) => shouldIncludeInSitemap({ category: 'cars', make, model: null, place: area }))
      .map((make) => sitemapUrl(buildSeoMarketplacePath({ market, categorySlug: carCategorySlug, make, placeSlug: area.slug }), undefined, 'daily', '0.78')),
  )
}

function geoModelSitemapUrls(market: SitemapMarketCode, page: number) {
  const config = getGeoSitemapMarketConfig(market)
  const carCategorySlug = config?.categories.find((entry) => entry.category === 'cars' && !entry.leasing)?.slug
  if (!config || !carCategorySlug) return []
  const areas = getSeoSitemapAreas(config.countryCode)
  const urlsPerArea = popularGeoModels.length
  const maxAreasPerPage = Math.max(1, Math.floor(maxGeoUrlsPerSitemap / urlsPerArea))
  const pageAreas = areas.slice((page - 1) * maxAreasPerPage, page * maxAreasPerPage)
  return pageAreas.flatMap((area) =>
    popularGeoModels
      .filter(({ make, model }) => shouldIncludeInSitemap({ category: 'cars', make, model, place: area }))
      .map(({ make, model }) => sitemapUrl(buildSeoMarketplacePath({ market, categorySlug: carCategorySlug, make, model, placeSlug: area.slug }), undefined, 'weekly', '0.75')),
  )
}

function marketplaceSearchUrls(market: SitemapMarketCode) {
  return [sitemapUrl(`/${market}/marketplace`, undefined, 'daily', '0.9')]
}

function staticSeoUrls(market: SitemapMarketCode, name: string) {
  const config = getGeoSitemapMarketConfig(market)
  if (!config) return []
  const categoryUrls = config.categories.map((entry) =>
    buildSeoMarketplacePath({ market, categorySlug: entry.slug }),
  )

  if (name.startsWith('categories-')) {
    return categoryUrls.map((path) => sitemapUrl(path, undefined, 'daily', '0.9'))
  }

  if (name.startsWith('brands-')) {
    return config.categories.flatMap((entry) =>
      getSeoSitemapMakes(entry.category)
        .filter((make) => shouldIncludeInSitemap({ category: entry.category, make, model: null, place: null }))
        .map((make) => sitemapUrl(buildSeoMarketplacePath({ market, categorySlug: entry.slug, make }), undefined, 'daily', '0.82')),
    )
  }

  if (name.startsWith('models-')) {
    return config.categories.flatMap((entry) =>
      getSeoSitemapModels(entry.category)
        .filter(({ make, model }) => shouldIncludeInSitemap({ category: entry.category, make, model, place: null }))
        .map(({ make, model }) => sitemapUrl(buildSeoMarketplacePath({ market, categorySlug: entry.slug, make, model }), undefined, 'weekly', '0.78')),
    )
  }

  return []
}

function staticPublicUrls(market: SitemapMarketCode) {
  const publicPaths = [
    '',
    '/sell-car',
    '/sell-to-dealer',
    '/sell-van',
    '/about',
    '/help-center',
    '/contact',
    '/pricing',
    '/business',
    '/privacy',
    '/cookies',
    '/terms',
    '/refund-policy',
    '/withdrawal',
    '/report',
  ]
  const paths = [...publicPaths.map((path) => `/${market}${path}`), `/${market}/marketplace`]

  return [...new Set(paths)].map((path) => sitemapUrl(path, undefined, 'weekly', '0.8'))
}

async function listingUrls(country: string, page: number) {
  const offset = (page - 1) * maxUrlsPerSitemap
  const { data } = await createAdminClient()
    .from('marketplace_listings')
    .select('id,title,make,model,model_year,city,country_code,updated_at,published_at,created_at')
    .eq('status', 'published')
    .eq('country_code', country)
    .not('published_at', 'is', null)
    .is('sold_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('published_at', { ascending: false })
    .range(offset, offset + maxUrlsPerSitemap - 1)

  return (data || []).map((listing) => sitemapUrl(
    buildListingPath(listing),
    listing.updated_at || listing.published_at || listing.created_at,
    'daily',
    '0.9',
  ))
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

function geoMakeSitemapFromName(name: string) {
  const match = name.match(/^geo-makes-([a-z]{2})-(\d+)$/i)
  if (!match) return null
  const market = match[1].toLowerCase()
  const page = Number(match[2])
  return isSitemapMarket(market) && Number.isFinite(page) && page > 0 ? { market, page } : null
}

function geoModelSitemapFromName(name: string) {
  const match = name.match(/^geo-models-([a-z]{2})-(\d+)$/i)
  if (!match) return null
  const market = match[1].toLowerCase()
  const page = Number(match[2])
  return isSitemapMarket(market) && Number.isFinite(page) && page > 0 ? { market, page } : null
}

function marketFromPrefixedSitemapName(name: string, prefix: string) {
  const market = name.match(new RegExp(`^${prefix}-([a-z]{2})$`, 'i'))?.[1]?.toLowerCase()
  return market && isSitemapMarket(market) ? market : null
}

function isSitemapMarket(value: string): value is SitemapMarketCode {
  return (allSitemapMarkets as readonly string[]).includes(value)
}

function pageFromSitemapName(name: string) {
  const page = Number(name.match(/-(\d+)$/)?.[1] || '1')
  return Number.isFinite(page) && page > 0 ? page : 1
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
