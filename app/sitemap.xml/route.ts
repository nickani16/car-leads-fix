import {
  englishSeoSitemapCategories,
  getEnglishSeoSitemapAreaCount,
  getGeoSitemapMarketCodes,
  getGeoSitemapMarketConfig,
  getSeoSitemapAreas,
} from '@/lib/seo-geo-landings'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  allSitemapMarkets,
  englishSitemapMarket,
  generatedSitemapLastModified,
  geoModelsForSitemapMarket,
  localizedComSitemapMarketForRequest,
  isComSitemapRequest,
  popularGeoMakes,
  sitemapHostForMarket,
  sitemapHostForRequest,
  sitemapMarketsForRequest,
  sitemapMarketCountries,
  type SitemapMarketCode,
  xmlResponse,
} from '@/lib/sitemap-utils'

const maxUrlsPerSitemap = 50_000
const maxGeoUrlsPerSitemap = 10_000
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const localizedMarket = localizedComSitemapMarketForRequest(request)
  const localizedSitemapPath = /^\/[a-z]{2}\/sitemap\.xml$/i.test(new URL(request.url).pathname)
  if (localizedSitemapPath && !localizedMarket) return new Response('Not Found', { status: 404 })
  const englishOnly = localizedMarket === englishSitemapMarket
  const includeEnglish = englishOnly || (!localizedMarket && isComSitemapRequest(request))
  const sitemapMarkets = englishOnly
    ? []
    : localizedMarket
      ? [localizedMarket]
      : sitemapMarketsForRequest(request)
  const host = englishOnly
    ? 'https://www.autorell.com'
    : sitemapMarkets.length === 1
    ? sitemapHostForMarket(sitemapMarkets[0])
    : sitemapHostForRequest(request)
  const staticSitemapNames = sitemapMarkets.map((market) => `static-${market}`)
  const seoSitemapNames = sitemapMarkets.flatMap((market) => [
    `categories-${market}`,
    `brands-${market}`,
    `models-${market}`,
  ])
  const marketplaceSitemapNames = sitemapMarkets.map((market) => `marketplace-${market}`)
  const { names: listingSitemapNames, hadError: listingCountHadError } = await getListingSitemapNames(sitemapMarkets)
  const geoSitemapNames = await getGeoSitemapNames(sitemapMarkets)
  const geoMakeSitemapNames = await getGeoMakeSitemapNames(sitemapMarkets)
  const geoModelSitemapNames = await getGeoModelSitemapNames(sitemapMarkets)
  const vehicleNewsSitemapNames = sitemapMarkets.map((market) => `vehicle-news-${market}`)
  const englishSitemapNames = includeEnglish
    ? ['english-countries', ...getEnglishGeoSitemapNames()]
    : []
  const generatedSitemapNames = [
    ...staticSitemapNames,
    ...seoSitemapNames,
    ...marketplaceSitemapNames,
    ...geoSitemapNames,
    ...geoMakeSitemapNames,
    ...geoModelSitemapNames,
    ...englishSitemapNames,
  ]
  const sitemapEntries = [
    ...generatedSitemapNames.map((name) => ({
      name,
      lastModified: generatedSitemapLastModified,
    })),
    ...vehicleNewsSitemapNames.map((name) => ({ name, lastModified: undefined })),
    ...listingSitemapNames.map((name) => ({ name, lastModified: undefined })),
  ]

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapEntries.map(({ name, lastModified }) => [
      '  <sitemap>',
      `    <loc>${host}/sitemaps/${name}.xml</loc>`,
      lastModified ? `    <lastmod>${lastModified}</lastmod>` : null,
      '  </sitemap>',
    ].filter(Boolean).join('\n')),
    '</sitemapindex>',
    '',
  ].join('\n')

  return xmlResponse(
    body,
    listingCountHadError
      ? 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600'
      : undefined,
  )
}

function getEnglishGeoSitemapNames() {
  const areaCount = getEnglishSeoSitemapAreaCount()
  const urlsPerArea = englishSeoSitemapCategories.length
  const areasPerPage = Math.max(1, Math.floor(maxGeoUrlsPerSitemap / urlsPerArea))
  const pages = Math.max(1, Math.ceil(areaCount / areasPerPage))
  return Array.from({ length: pages }, (_, index) => `english-geo-${index + 1}`)
}

async function getListingSitemapNames(markets: readonly (typeof allSitemapMarkets)[number][]) {
  const names: string[] = []
  let hadError = false
  await Promise.all(
    markets.map(async (market) => {
      try {
        const { count, error } = await createAdminClient()
          .from('marketplace_listings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')
          .eq('country_code', sitemapMarketCountries[market])
          .not('published_at', 'is', null)
          .is('sold_at', null)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

        if (error) {
          hadError = true
          return
        }

        const pages = Math.ceil((count || 0) / maxUrlsPerSitemap)
        for (let page = 1; page <= pages; page += 1) {
          names.push(`listings-${market}-${page}`)
        }
      } catch {
        hadError = true
      }
    }),
  )
  return { names: names.sort(), hadError }
}

async function getGeoSitemapNames(markets: readonly (typeof allSitemapMarkets)[number][]) {
  const names: string[] = []
  await Promise.all(
    getGeoSitemapMarketCodes().filter((market): market is SitemapMarketCode => markets.includes(market as SitemapMarketCode)).map(async (market) => {
      const config = getGeoSitemapMarketConfig(market)
      if (!config) return
      const areaCount = getGeoSitemapAreaCount(config.countryCode)
      const urlsPerArea = config.categorySlugs.length
      const areasPerPage = Math.max(1, Math.floor(maxGeoUrlsPerSitemap / urlsPerArea))
      const pages = Math.max(1, Math.ceil(areaCount / areasPerPage))
      for (let page = 1; page <= pages; page += 1) {
        names.push(`geo-${market}-${page}`)
      }
    }),
  )
  return names.sort()
}

async function getGeoMakeSitemapNames(markets: readonly (typeof allSitemapMarkets)[number][]) {
  const names: string[] = []
  await Promise.all(
    markets.map(async (market) => {
      const config = getGeoSitemapMarketConfig(market)
      if (!config) return
      const areaCount = getGeoSitemapAreaCount(config.countryCode)
      const urlsPerArea = popularGeoMakes.length
      const areasPerPage = Math.max(1, Math.floor(maxGeoUrlsPerSitemap / urlsPerArea))
      const pages = Math.max(1, Math.ceil(areaCount / areasPerPage))
      for (let page = 1; page <= pages; page += 1) {
        names.push(`geo-makes-${market}-${page}`)
      }
    }),
  )
  return names.sort()
}

async function getGeoModelSitemapNames(markets: readonly (typeof allSitemapMarkets)[number][]) {
  const names: string[] = []
  await Promise.all(
    markets.map(async (market) => {
      const config = getGeoSitemapMarketConfig(market)
      if (!config) return
      const areaCount = getGeoSitemapAreaCount(config.countryCode)
      const urlsPerArea = geoModelsForSitemapMarket(market).length
      const areasPerPage = Math.max(1, Math.floor(maxGeoUrlsPerSitemap / urlsPerArea))
      const pages = Math.max(1, Math.ceil(areaCount / areasPerPage))
      for (let page = 1; page <= pages; page += 1) {
        names.push(`geo-models-${market}-${page}`)
      }
    }),
  )
  return names.sort()
}

function getGeoSitemapAreaCount(countryCode: string) {
  return getSeoSitemapAreas(countryCode).length
}
