import {
  getPublicMarket,
  getPublicMarketConfig,
} from '@/lib/public-market'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function GET(request: Request) {
  const market = getPublicMarket(request)
  const config = getPublicMarketConfig(market)
  const urls = [...new Set(config.paths)]
    .map((path) => {
      const loc = `${config.host}${path || '/'}`
      const priority =
        path === ''
          ? '1.0'
          : path.startsWith('/marketplace/')
            ? '0.9'
            : '0.7'
      const frequency =
        path === '' ||
        path.startsWith('/marketplace/')
          ? 'daily'
          : 'monthly'
      return [
        '  <url>',
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <changefreq>${frequency}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return new Response(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      urls,
      '</urlset>',
      '',
    ].join('\n'),
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        Vary: 'Host, X-Forwarded-Host',
      },
    },
  )
}
