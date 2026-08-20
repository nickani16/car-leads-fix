import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8')
const publicSeo = readFileSync(new URL('../lib/public-seo.ts', import.meta.url), 'utf8')
const sitemapUtils = readFileSync(new URL('../lib/sitemap-utils.ts', import.meta.url), 'utf8')
const sitemapIndex = readFileSync(new URL('../app/sitemap.xml/route.ts', import.meta.url), 'utf8')
const sitemapRoute = readFileSync(new URL('../app/sitemaps/[name]/route.ts', import.meta.url), 'utf8')
const footer = readFileSync(new URL('../app/components/PublicFooter.tsx', import.meta.url), 'utf8')
const publicInfoPage = readFileSync(new URL('../app/components/PublicInfoPage.tsx', import.meta.url), 'utf8')
const seoLandingData = readFileSync(new URL('../lib/seo-landing-data.ts', import.meta.url), 'utf8')

test('Swedish and German markets use their own canonical domains', () => {
  assert.match(proxy, /sv: 'www\.autorell\.se'/)
  assert.match(proxy, /de: 'www\.autorell\.de'/)
  assert.match(proxy, /'autorell\.se': 'www\.autorell\.se'/)
  assert.match(proxy, /'autorell\.de': 'www\.autorell\.de'/)
  assert.match(publicSeo, /locale === 'sv'.*https:\/\/www\.autorell\.se/)
  assert.match(publicSeo, /locale === 'de'.*https:\/\/www\.autorell\.de/)
})

test('domain sitemap indexes and shards cannot mix markets', () => {
  assert.match(sitemapUtils, /sitemapMarketsForRequest/)
  assert.match(sitemapUtils, /return \['se'\]/)
  assert.match(sitemapUtils, /return \['de'\]/)
  assert.match(sitemapIndex, /sitemapHostForRequest\(request\)/)
  assert.match(sitemapRoute, /sitemapMarketsForRequest\(request\)\.includes\(requestedMarket\)/)
  assert.match(sitemapRoute, /sitemapHostForMarket\(market\)/)
})

test('shared public pages and structured data use the market domain helper', () => {
  assert.match(publicInfoPage, /const canonical = publicUrlForPath\(canonicalPath\)/)
  assert.match(seoLandingData, /item: publicUrlForPath\(item\.href\)/)
  assert.match(seoLandingData, /url: publicUrlForPath\(listing\.href\)/)
})

test('regular mobile footer can scroll above the fixed bottom navigation', () => {
  assert.match(footer, /pb-\[calc\(7rem\+env\(safe-area-inset-bottom\)\)\]/)
  assert.match(footer, /min-\[1120px\]:pb-7/)
})
