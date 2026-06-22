import {
  getPublicMarket,
  getPublicMarketConfig,
} from '@/lib/public-market'

export const dynamic = 'force-dynamic'

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
    '',
    `Sitemap: ${host}/sitemap.xml`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      Vary: 'Host, X-Forwarded-Host',
    },
  })
}
