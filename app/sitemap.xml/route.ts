import { seoMarkets, type SeoMarketCode } from '@/lib/seo-routes'
import { getGeoSitemapMarketCodes, getGeoSitemapMarketConfig } from '@/lib/seo-geo-landings'
import { getStaticGeoDataset } from '@/lib/geo-static-datasets'
import { createAdminClient } from '@/lib/supabase/admin'

const host = 'https://www.autorell.com'
const maxUrlsPerSitemap = 50_000
export const dynamic = 'force-dynamic'
const listingSitemapMarkets = ['se', 'de', 'es', 'fr', 'it', 'nl', 'be', 'pl', 'at', 'dk', 'fi'] as const
const listingCountries: Record<(typeof listingSitemapMarkets)[number], string> = {
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
  const seoSitemapNames = ['se', 'de', 'es'].flatMap((market) => [
    `static-${market}`,
    `categories-${market}`,
    `brands-${market}`,
    `models-${market}`,
    `locations-${market}`,
  ])
  const listingSitemapNames = await getListingSitemapNames()
  const geoSitemapNames = await getGeoSitemapNames()
  const vehicleNewsSitemapNames = ['se', 'de', 'es', 'pl', 'fr'].map((market) => `vehicle-news-${market}`)
  const sitemapNames = [
    ...seoSitemapNames,
    ...geoSitemapNames,
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

  return xmlResponse(body)
}

async function getListingSitemapNames() {
  const names: string[] = []
  await Promise.all(
    listingSitemapMarkets.map(async (market) => {
      const { count } = await createAdminClient()
        .from('marketplace_listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .eq('country_code', listingCountries[market])
        .not('published_at', 'is', null)
        .is('sold_at', null)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

      const pages = Math.ceil((count || 0) / maxUrlsPerSitemap)
      for (let page = 1; page <= pages; page += 1) {
        names.push(`listings-${market}-${page}`)
      }
    }),
  )
  return names.sort()
}

async function getGeoSitemapNames() {
  const names: string[] = []
  await Promise.all(
    getGeoSitemapMarketCodes().map(async (market) => {
      const config = getGeoSitemapMarketConfig(market)
      if (!config) return
      const areaCount = await getGeoSitemapAreaCount(config.countryCode)
      const urlsPerArea = config.categorySlugs.length
      const pages = Math.max(1, Math.ceil((areaCount * urlsPerArea) / maxUrlsPerSitemap))
      for (let page = 1; page <= pages; page += 1) {
        names.push(`geo-${market}-${page}`)
      }
    }),
  )
  return names.sort()
}

async function getGeoSitemapAreaCount(countryCode: string) {
  const [regionCount, placeCount] = await Promise.all([
    getGeoTableCount('geo_regions', countryCode),
    getGeoTableCount('geo_places', countryCode),
  ])
  const staticDataset = getStaticGeoDataset(countryCode)
  const staticCount = staticDataset ? staticDataset.regions.length + staticDataset.places.length : 0
  const dbCount = regionCount + placeCount
  return Math.max(dbCount, staticCount)
}

async function getGeoTableCount(table: 'geo_regions' | 'geo_places', countryCode: string) {
  try {
    const { count } = await createAdminClient()
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('country_code', countryCode)
      .eq('active', true)
    return count || 0
  } catch {
    return 0
  }
}

export function marketFromSitemapName(name: string): SeoMarketCode | null {
  const market = name.match(/-(se|de|es)(?:-\d+)?$/)?.[1]
  return market && market in seoMarkets ? (market as SeoMarketCode) : null
}

export function xmlResponse(body: string) {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
