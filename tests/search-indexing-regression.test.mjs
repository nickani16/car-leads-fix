import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8')
const rootHome = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8')
const marketHome = readFileSync(new URL('../app/[market]/page.tsx', import.meta.url), 'utf8')
const germanHome = readFileSync(new URL('../app/de/page.tsx', import.meta.url), 'utf8')
const marketplace = readFileSync(new URL('../app/marketplace/[category]/page.tsx', import.meta.url), 'utf8')
const robots = readFileSync(new URL('../app/robots.txt/route.ts', import.meta.url), 'utf8')
const sitemapIndex = readFileSync(new URL('../app/sitemap.xml/route.ts', import.meta.url), 'utf8')
const localizedSitemapIndex = readFileSync(new URL('../app/[market]/sitemap.xml/route.ts', import.meta.url), 'utf8')
const sitemapRoute = readFileSync(new URL('../app/sitemaps/[name]/route.ts', import.meta.url), 'utf8')
const sitemapUtils = readFileSync(new URL('../lib/sitemap-utils.ts', import.meta.url), 'utf8')
const privacyRoute = readFileSync(new URL('../app/privacy/page.tsx', import.meta.url), 'utf8')
const reportRoute = readFileSync(new URL('../app/report/page.tsx', import.meta.url), 'utf8')
const localizedReportRoute = readFileSync(new URL('../app/rapportera/page.tsx', import.meta.url), 'utf8')

test('robots advertises the canonical XML sitemap for the request host', () => {
  assert.match(robots, /sitemapIndexUrlsForRequest\(request\)/)
  assert.match(robots, /sitemapIndexes\.map\(\(sitemap\) => `Sitemap: \$\{sitemap\}`\)/)
  assert.match(robots, /Vary: 'Host, X-Forwarded-Host'/)
  assert.doesNotMatch(robots, /getPublicMarketConfig/)
})

test('autorell.com exposes one aggregate and nine market-specific sitemap indexes', () => {
  assert.match(sitemapUtils, /comSitemapMarkets = allSitemapMarkets\.filter/)
  assert.match(sitemapUtils, /`\$\{host\}\/\$\{market\}\/sitemap\.xml`/)
  assert.match(sitemapUtils, /localizedComSitemapMarketForRequest/)
  assert.match(sitemapIndex, /localizedComSitemapMarketForRequest\(request\)/)
  assert.match(sitemapIndex, /localizedMarket \? \[localizedMarket\] : sitemapMarketsForRequest\(request\)/)
  assert.match(localizedSitemapIndex, /GET as getSitemapIndex/)
  assert.match(localizedSitemapIndex, /return getSitemapIndex\(request\)/)
})

test('static sitemaps cover every active country market without removing specialist sitemaps', () => {
  assert.match(sitemapIndex, /sitemapMarketsForRequest\(request\)/)
  assert.match(sitemapIndex, /sitemapMarkets\.map\(\(market\) => `static-\$\{market\}`\)/)
  assert.match(sitemapIndex, /\.\.\.marketplaceSitemapNames/)
  assert.match(sitemapIndex, /\.\.\.geoSitemapNames/)
  assert.match(sitemapIndex, /\.\.\.geoMakeSitemapNames/)
  assert.match(sitemapIndex, /\.\.\.vehicleNewsSitemapNames/)
  assert.match(sitemapIndex, /\.\.\.listingSitemapNames/)
  assert.match(sitemapRoute, /marketFromPrefixedSitemapName\(normalizedName, 'static'\)/)
  assert.match(sitemapRoute, /function staticPublicUrls\(market: SitemapMarketCode\)/)
  assert.match(sitemapRoute, /marketplaceSearchUrls/)
  assert.doesNotMatch(sitemapRoute, /helpCenterPaths\.map[\s\S]{0,160}`\/\$\{market\}\/marketplace`/)
  assert.doesNotMatch(sitemapRoute, /'\/benefits'/)
})

test('listing sitemap freshness follows the actual listing update time', () => {
  assert.match(sitemapRoute, /updated_at,published_at,created_at/)
  assert.match(sitemapRoute, /listing\.updated_at \|\| listing\.published_at \|\| listing\.created_at/)
})

test('generated sitemap shards advertise freshness without week-old CDN responses', () => {
  assert.match(sitemapIndex, /generatedSitemapLastModified/)
  assert.match(sitemapIndex, /<lastmod>\$\{lastModified\}<\/lastmod>/)
  assert.match(sitemapUtils, /generatedSitemapLastModified = '\d{4}-\d{2}-\d{2}'/)
  assert.match(sitemapUtils, /max-age=300, s-maxage=3600, stale-while-revalidate=86400/)
  assert.doesNotMatch(sitemapUtils, /stale-while-revalidate=604800/)
  assert.doesNotMatch(sitemapUtils, /generatedSitemapLastModified\s*=\s*new Date/)
})

test('localized pages expose document language and reciprocal language alternates', () => {
  assert.match(layout, /lang=\{documentLanguage\}/)
  assert.match(layout, /x-autorell-market/)
  assert.match(layout, /SE: 'sv-SE'/)
  assert.match(layout, /FI: 'fi-FI'/)
  assert.doesNotMatch(layout, /lang="en"/)
  assert.match(rootHome, /getPublicLanguageAlternates\('\/'\)/)
  assert.match(marketHome, /getPublicLanguageAlternates\('\/'\)/)
  assert.match(germanHome, /getPublicLanguageAlternates\('\/'\)/)
  assert.match(marketplace, /getPublicLanguageAlternates\(alternatePath\)/)
  assert.match(marketplace, /stripLocalePrefix\(canonicalUrl\.pathname\)/)
})

test('Google and Bing ownership tags can be configured without hard-coded tokens', () => {
  assert.match(layout, /GOOGLE_SITE_VERIFICATION/)
  assert.match(layout, /BING_SITE_VERIFICATION/)
  assert.match(layout, /'msvalidate\.01'/)
  assert.doesNotMatch(layout, /google-site-verification=/)
})

test('legal and safety pages included in sitemaps expose localized canonical metadata', () => {
  assert.match(privacyRoute, /default, generateMetadata/)
  assert.match(reportRoute, /default, generateMetadata/)
  assert.match(localizedReportRoute, /createPublicMetadata/)
  assert.match(localizedReportRoute, /path: '\/report'/)
})
