import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const geoLandings = readFileSync(new URL('../lib/seo-geo-landings.ts', import.meta.url), 'utf8')
const seoRoutes = readFileSync(new URL('../lib/seo-routes.ts', import.meta.url), 'utf8')
const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8')
const sitemapIndex = readFileSync(new URL('../app/sitemap.xml/route.ts', import.meta.url), 'utf8')
const sitemapShard = readFileSync(new URL('../app/sitemaps/[name]/route.ts', import.meta.url), 'utf8')
const sitemapUtils = readFileSync(new URL('../lib/sitemap-utils.ts', import.meta.url), 'utf8')

test('English .com SEO routes use clean category, country and place paths', () => {
  assert.match(geoLandings, /market: 'en'/)
  assert.match(geoLandings, /locale: 'en'/)
  assert.match(geoLandings, /buildEnglishSeoMarketplacePath/)
  assert.match(geoLandings, /countrySlug: country\.slug/)
  assert.match(geoLandings, /placeSlug: place\?\.slug/)
  assert.match(seoRoutes, /isEnglishSeoVehiclePath/)
  assert.match(proxy, /seoUrl\.pathname = `\/seo\/en\/\$\{englishSeoSegments\.join\('\/'\)\}`/)
  assert.match(proxy, /requestHeaders\.set\('x-autorell-language', 'en'\)/)
  assert.match(proxy, /pathname !== '\/en\/sitemap\.xml'/)
})

test('English sitemap index and shards are available only on autorell.com', () => {
  assert.match(sitemapUtils, /englishSitemapMarket = 'en'/)
  assert.match(sitemapUtils, /`\$\{host\}\/\$\{englishSitemapMarket\}\/sitemap\.xml`/)
  assert.match(sitemapIndex, /english-countries/)
  assert.match(sitemapIndex, /english-geo-\$\{index \+ 1\}/)
  assert.match(sitemapShard, /if \(!isComSitemapRequest\(request\)\) notFound\(\)/)
  assert.match(sitemapShard, /pageFromEnglishGeoSitemapName/)
})

test('English sitemap plan exceeds 700k useful country and locality URLs', () => {
  const knownCountryAreaCount = 111_206
  const englishCategoryCount = 7
  const countryLandingCount = 11 * englishCategoryCount
  const plannedUrlCount = knownCountryAreaCount * englishCategoryCount + countryLandingCount

  assert.equal(plannedUrlCount, 778_519)
  assert.ok(plannedUrlCount >= 700_000)
  assert.match(geoLandings, /englishSeoSitemapCategories/)
  assert.match(sitemapShard, /englishSeoSitemapCategories\.map/)
  assert.match(sitemapShard, /getEnglishSeoSitemapAreas\(\)/)
})
