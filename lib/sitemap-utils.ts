import { getSeoSitemapMakes, getSeoSitemapModels } from './seo-geo-landings'

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
