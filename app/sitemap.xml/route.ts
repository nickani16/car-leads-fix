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
        path === ''
          ? '1'
          : path === config.priorityPath
            ? '0.9'
            : path.startsWith('/salj-bil/lan/')
              ? '0.8'
            : path.startsWith('/salj-bil/')
              ? '0.7'
              : path === '/haendler' || path === '/dealers'
                ? '0.9'
                : path.startsWith('/haendler/') || path.startsWith('/dealers/')
                  ? '0.75'
                  : /^\/[a-z]{2}$/.test(path)
                    ? '0.85'
                    : /^\/[a-z]{2}\/dealers\//.test(path)
                      ? '0.75'
                : '0.7'
      const changeFrequency =
        path === '' ||
        path.startsWith('/salj-bil/') ||
        path.startsWith('/haendler') ||
        path.startsWith('/dealers') ||
        /^\/[a-z]{2}(\/dealers\/.*)?$/.test(path)
          ? 'weekly'
          : 'monthly'

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
