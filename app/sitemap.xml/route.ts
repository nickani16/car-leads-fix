import {
  getPublicMarket,
  getPublicMarketConfig,
} from '@/lib/public-market'
import { getEuBuyerHubAlternates } from '@/lib/eu-buyer-markets'
import {
  getImportGuideAlternates,
  importGuides,
} from '@/lib/import-guides'

export const dynamic = 'force-dynamic'

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
                      : path.includes('/guides/') || path.startsWith('/ratgeber/')
                        ? '0.8'
                : '0.7'
      const changeFrequency =
        path === '' ||
        path.startsWith('/salj-bil/') ||
        path.startsWith('/haendler') ||
        path.startsWith('/dealers') ||
        /^\/[a-z]{2}(\/dealers\/.*)?$/.test(path)
          ? 'weekly'
          : 'monthly'
      const isImportGuide = importGuides.some(
        (guide) => guide.publicPath === path,
      )
      const alternates: Record<string, string> | null =
        isImportGuide
          ? getImportGuideAlternates()
          : market === 'en' && /^\/[a-z]{2}$/.test(path)
          ? getEuBuyerHubAlternates()
          : path === ''
            ? {
                'sv-SE': 'https://www.autorell.se/',
                'de-DE': 'https://www.autorell.de/',
                en: 'https://www.autorell.com/',
                'x-default': 'https://www.autorell.com/',
              }
            : null
      const alternateLinks = alternates
        ? Object.entries(alternates)
            .map(
              ([hreflang, href]) =>
                `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}" />`
            )
            .join('\n')
        : ''

      return [
        '  <url>',
        `    <loc>${escapeXml(`${config.host}${path}`)}</loc>`,
        alternateLinks,
        `    <changefreq>${changeFrequency}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
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
