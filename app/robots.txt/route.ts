const canonicalSitemap = 'https://www.autorell.com/sitemap.xml'

export function GET() {
  const body = [
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
    `Sitemap: ${canonicalSitemap}`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
