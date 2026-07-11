import { notFound } from 'next/navigation'
import { buildListingPath, listingMarketPath } from '@/lib/listing-url'
import { marketplaceCategories, type MarketplaceCategorySlug } from '@/lib/marketplace'
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
  if (!market && !listingCountry) notFound()

  const urls = normalizedName.startsWith('listings-')
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
    .select('id,title,make,model,model_year,city,country_code,published_at,created_at,edited_at,last_price_change_at')
    .eq('status', 'published')
    .eq('country_code', country)
    .not('published_at', 'is', null)
    .is('deleted_at', null)
    .is('sold_at', null)
    .or('removed_by_admin.is.null,removed_by_admin.eq.false')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('published_at', { ascending: false })
    .range(offset, offset + maxUrlsPerSitemap - 1)

  return (data || []).map((listing) => sitemapUrl(
    buildListingPath(listing),
    listing.last_price_change_at || listing.edited_at || listing.published_at || listing.created_at,
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
