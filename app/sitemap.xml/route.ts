import {
  getPublicMarket,
  getPublicMarketConfig,
} from '@/lib/public-market'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const market = getPublicMarket(request)
  const config = getPublicMarketConfig(market)
  const lastModified = new Date().toISOString()
  const urls = config.paths
    .map((path) => {
      const priority =
        path === '' ? '1' : path === config.priorityPath ? '0.9' : '0.7'
      const changeFrequency = path === '' ? 'weekly' : 'monthly'

      return [
        '  <url>',
        `    <loc>${config.host}${path}</loc>`,
        `    <lastmod>${lastModified}</lastmod>`,
        `    <changefreq>${changeFrequency}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n')

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      Vary: 'Host, X-Forwarded-Host',
    },
  })
}
