import { sitemapIndexUrlsForRequest } from '@/lib/sitemap-utils'

export function GET(request: Request) {
  const sitemapIndexes = sitemapIndexUrlsForRequest(request)
  const body = [
    // GoogleOther is separate from Google Search and is used for non-search
    // product research. It must not consume the marketplace crawl budget.
    'User-Agent: GoogleOther',
    'Disallow: /',
    '',
    'User-Agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /auth/',
    'Disallow: /konto/',
    'Disallow: /account/',
    'Disallow: /seo/',
    'Disallow: /*?*sort=',
    'Disallow: /*?*pageSize=',
    'Disallow: /*?*view=',
    'Disallow: /*?*layout=',
    'Disallow: /*?*map=',
    'Disallow: /*?*bounds=',
    'Disallow: /*?*bbox=',
    'Disallow: /*?*lat=',
    'Disallow: /*?*lng=',
    'Disallow: /*?*debug=',
    'Disallow: /*?*session=',
    'Disallow: /*?*sid=',
    'Disallow: /*?*utm_=',
    'Disallow: /*?*gclid=',
    'Disallow: /*?*fbclid=',
    '',
    ...sitemapIndexes.map((sitemap) => `Sitemap: ${sitemap}`),
    '',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'Vercel-CDN-Cache-Control': 's-maxage=86400, stale-while-revalidate=604800',
      Vary: 'Host, X-Forwarded-Host',
    },
  })
}
