import {
  getGeoSitemapMarketCodes,
  getGeoSitemapMarketConfig,
  getSeoSitemapAreas,
  getSeoSitemapMakes,
  getSeoSitemapModels,
} from '@/lib/seo-geo-landings'
import { createAdminClient } from '@/lib/supabase/admin'

const host = 'https://www.autorell.com'
const maxUrlsPerSitemap = 50_000
const maxGeoUrlsPerSitemap = 10_000
export const dynamic = 'force-dynamic'
export const allSitemapMarkets = ['se', 'de', 'es', 'fr', 'it', 'nl', 'be', 'pl', 'at', 'dk', 'fi'] as const
export type SitemapMarketCode = (typeof allSitemapMarkets)[number]
export const sitemapMarketCountries: Record<SitemapMarketCode, string> = {
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

export async function GET() {
  const staticSitemapNames = allSitemapMarkets.map((market) => `static-${market}`)
  const seoSitemapNames = allSitemapMarkets.flatMap((market) => [
    `categories-${market}`,
    `brands-${market}`,
    `models-${market}`,
  ])
  const marketplaceSitemapNames = allSitemapMarkets.map((market) => `marketplace-${market}`)
  const { names: listingSitemapNames, hadError: listingCountHadError } = await getListingSitemapNames()
  const geoSitemapNames = await getGeoSitemapNames()
  const geoMakeSitemapNames = await getGeoMakeSitemapNames()
  const geoModelSitemapNames = await getGeoModelSitemapNames()
  const vehicleNewsSitemapNames = allSitemapMarkets.map((market) => `vehicle-news-${market}`)
  const sitemapNames = [
    ...staticSitemapNames,
    ...seoSitemapNames,
    ...marketplaceSitemapNames,
    ...geoSitemapNames,
    ...geoMakeSitemapNames,
    ...geoModelSitemapNames,
    ...vehicleNewsSitemapNames,
    ...listingSitemapNames,
  ]

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapNames.map((name) => [
      '  <sitemap>',
      `    <loc>${host}/sitemaps/${name}.xml</loc>`,
      '  </sitemap>',
    ].join('\n')),
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

async function getListingSitemapNames() {
  const names: string[] = []
  let hadError = false
  await Promise.all(
    allSitemapMarkets.map(async (market) => {
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

async function getGeoSitemapNames() {
  const names: string[] = []
  await Promise.all(
    getGeoSitemapMarketCodes().map(async (market) => {
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

async function getGeoMakeSitemapNames() {
  const names: string[] = []
  await Promise.all(
    allSitemapMarkets.map(async (market) => {
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

async function getGeoModelSitemapNames() {
  const names: string[] = []
  await Promise.all(
    allSitemapMarkets.map(async (market) => {
      const config = getGeoSitemapMarketConfig(market)
      if (!config) return
      const areaCount = getGeoSitemapAreaCount(config.countryCode)
      const urlsPerArea = popularGeoModels.length
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

export function marketFromSitemapName(name: string): SitemapMarketCode | null {
  const market = name.match(/-([a-z]{2})(?:-\d+)?$/i)?.[1]?.toLowerCase()
  return market && (allSitemapMarkets as readonly string[]).includes(market)
    ? market as SitemapMarketCode
    : null
}

export const popularGeoMakes = getSeoSitemapMakes('cars')
export const popularGeoModels = getSeoSitemapModels('cars')

export function xmlResponse(body: string, cacheControl?: string) {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': cacheControl || 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
