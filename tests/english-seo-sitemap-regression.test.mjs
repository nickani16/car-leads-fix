import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const geoLandings = readFileSync(new URL('../lib/seo-geo-landings.ts', import.meta.url), 'utf8')
const seoRoutes = readFileSync(new URL('../lib/seo-routes.ts', import.meta.url), 'utf8')
const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8')
const sitemapIndex = readFileSync(new URL('../app/sitemap.xml/route.ts', import.meta.url), 'utf8')
const sitemapShard = readFileSync(new URL('../app/sitemaps/[name]/route.ts', import.meta.url), 'utf8')
const sitemapUtils = readFileSync(new URL('../lib/sitemap-utils.ts', import.meta.url), 'utf8')
const seoSitemapPlaces = readFileSync(new URL('../lib/seo-sitemap-places.ts', import.meta.url), 'utf8')
const seoPriorityPlaces = readFileSync(new URL('../lib/seo-priority-places.ts', import.meta.url), 'utf8')

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

test('English sitemap plan stays within a cost-safe curated locality budget', () => {
  const maximumPriorityAreaCount = 54
  const englishCategoryCount = 7
  const countryLandingCount = 11 * englishCategoryCount
  const maximumPlannedUrlCount = maximumPriorityAreaCount * englishCategoryCount + countryLandingCount

  assert.equal(maximumPlannedUrlCount, 455)
  assert.ok(maximumPlannedUrlCount < 500)
  assert.match(geoLandings, /englishSeoSitemapCategories/)
  assert.match(sitemapShard, /englishSeoSitemapCategories\.map/)
  assert.match(sitemapShard, /getEnglishSeoSitemapAreas\(\)/)
  assert.match(seoSitemapPlaces, /prioritySeoPlaceSlugs/)
  assert.match(seoPriorityPlaces, /prioritySeoPlaceSlugs/)
  assert.match(proxy, /isRetiredSeoLocalityPath/)
  assert.match(proxy, /X-Autorell-Bot-Protection': 'retired-seo-locality'/)
  assert.match(seoSitemapPlaces, /priorityAreas = areas\.filter/)
})
