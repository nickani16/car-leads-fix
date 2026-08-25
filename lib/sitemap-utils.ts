import { getSeoSitemapMakes, getSeoSitemapModels } from './seo-geo-landings'

export const allSitemapMarkets = ['se', 'de', 'es', 'fr', 'it', 'nl', 'be', 'pl', 'at', 'dk', 'fi'] as const

export type SitemapMarketCode = (typeof allSitemapMarkets)[number]

const sitemapHostByMarket: Partial<Record<SitemapMarketCode, string>> = {
  se: 'https://www.autorell.se',
  de: 'https://www.autorell.de',
}

export function sitemapHostForMarket(market: SitemapMarketCode) {
  return sitemapHostByMarket[market] || 'https://www.autorell.com'
}

export function sitemapHostname(request: Request) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost || request.headers.get('host') || 'www.autorell.com'
  return host.split(',')[0].trim().split(':')[0].toLowerCase()
}

export function sitemapMarketsForRequest(request: Request): readonly SitemapMarketCode[] {
  const hostname = sitemapHostname(request)
  if (hostname === 'www.autorell.se' || hostname === 'autorell.se') return ['se']
  if (hostname === 'www.autorell.de' || hostname === 'autorell.de') return ['de']
  if (hostname === 'www.autorell.com' || hostname === 'autorell.com') {
    return allSitemapMarkets.filter((market) => market !== 'se' && market !== 'de')
  }
  return allSitemapMarkets
}

export function sitemapHostForRequest(request: Request) {
  const markets = sitemapMarketsForRequest(request)
  return markets.length === 1 ? sitemapHostForMarket(markets[0]) : 'https://www.autorell.com'
}

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
      Vary: 'Host, X-Forwarded-Host',
    },
  })
}
