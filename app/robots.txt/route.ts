import {
  getPublicMarket,
  getPublicMarketConfig,
} from '@/lib/public-market'

export function GET(request: Request) {
  const market = getPublicMarket(request)
  const { host } = getPublicMarketConfig(market)
  const body = [
    'User-Agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /auth/',
    'Disallow: /konto/',
    'Disallow: /account/',
    '',
    `Sitemap: ${host}/sitemap.xml`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Vary: 'Host, X-Forwarded-Host',
    },
  })
}
