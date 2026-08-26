import { getSeoSitemapMakes, getSeoSitemapModels } from './seo-geo-landings'

export const allSitemapMarkets = ['se', 'de', 'es', 'fr', 'it', 'nl', 'be', 'pl', 'at', 'dk', 'fi'] as const

export type SitemapMarketCode = (typeof allSitemapMarkets)[number]

export const comSitemapMarkets = allSitemapMarkets.filter(
  (market): market is Exclude<SitemapMarketCode, 'se' | 'de'> => market !== 'se' && market !== 'de',
)
export const englishSitemapMarket = 'en' as const

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
    return comSitemapMarkets
  }
  return allSitemapMarkets
}

export function isComSitemapRequest(request: Request) {
  const hostname = sitemapHostname(request)
  return hostname === 'www.autorell.com' || hostname === 'autorell.com'
}

export function localizedComSitemapMarketForRequest(request: Request): SitemapMarketCode | typeof englishSitemapMarket | null {
  if (!isComSitemapRequest(request)) return null
  const market = new URL(request.url).pathname.match(/^\/([a-z]{2})\/sitemap\.xml$/i)?.[1]?.toLowerCase()
  if (market === englishSitemapMarket) return englishSitemapMarket
  return market && (comSitemapMarkets as readonly string[]).includes(market)
    ? market as SitemapMarketCode
    : null
}

export function sitemapIndexUrlsForRequest(request: Request) {
  const host = sitemapHostForRequest(request)
  if (!isComSitemapRequest(request)) return [`${host}/sitemap.xml`]
  return [
    `${host}/sitemap.xml`,
    `${host}/${englishSitemapMarket}/sitemap.xml`,
    ...comSitemapMarkets.map((market) => `${host}/${market}/sitemap.xml`),
  ]
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

// Bump this only when the generated SEO sitemap datasets or URL rules change.
// Google uses it to decide when existing sitemap shards need to be fetched again.
export const generatedSitemapLastModified = '2026-08-26'

export function geoModelsForSitemapMarket(market: SitemapMarketCode) {
  return market === 'dk' || market === 'nl'
    ? getSeoSitemapModels('cars', 6)
    : popularGeoModels
}

export function xmlResponse(body: string, cacheControl?: string) {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': cacheControl || 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      Vary: 'Host, X-Forwarded-Host',
    },
  })
}
