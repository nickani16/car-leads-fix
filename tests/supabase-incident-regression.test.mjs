import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const sitemapRoute = readFileSync(new URL('../app/sitemaps/[name]/route.ts', import.meta.url), 'utf8')
const marketplaceSearch = readFileSync(new URL('../lib/marketplace-search-v2.ts', import.meta.url), 'utf8')
const marketplacePublicData = readFileSync(new URL('../lib/marketplace-public-data.ts', import.meta.url), 'utf8')
const marketplaceSearchRoute = readFileSync(new URL('../app/api/marketplace/search-v2/route.ts', import.meta.url), 'utf8')
const vehicleNews = readFileSync(new URL('../lib/content/vehicle-news.ts', import.meta.url), 'utf8')
const home = readFileSync(new URL('../app/components/BusinessMarketplaceHome.tsx', import.meta.url), 'utf8')
const homeRpcMigration = readFileSync(new URL('../supabase/migrations/20260826214500_batch_marketplace_home_listings.sql', import.meta.url), 'utf8')
const cronMigration = readFileSync(new URL('../supabase/migrations/20260826213000_stabilize_auction_close_cron.sql', import.meta.url), 'utf8')

test('database-backed sitemap rows are shared across crawler requests without automatic retries', () => {
  assert.match(sitemapRoute, /unstable_cache/)
  assert.match(sitemapRoute, /sitemap-vehicle-news-v1/)
  assert.match(sitemapRoute, /sitemap-marketplace-listings-v1/)
  assert.match(sitemapRoute, /sitemap-vehicle-news-fallback-v1/)
  assert.match(sitemapRoute, /sitemap-marketplace-listings-fallback-v1/)
  assert.match(sitemapRoute, /revalidate: 300/)
  assert.match(sitemapRoute, /if \(!data\.length\)/)
  assert.equal(sitemapRoute.match(/\.retry\(false\)/g)?.length, 2)
  assert.match(sitemapRoute, /revalidate: 21_600/)
  assert.match(sitemapRoute, /revalidate: 3_600/)
})

test('marketplace fan-out queries fail fast instead of multiplying an outage', () => {
  assert.ok((marketplaceSearch.match(/\.retry\(false\)/g) || []).length >= 9)
  assert.ok((marketplacePublicData.match(/\.retry\(false\)/g) || []).length >= 8)
  assert.match(marketplaceSearch, /sponsoredCountQuery\.retry\(false\)/)
  assert.match(marketplaceSearch, /normalCountQuery\.retry\(false\)/)
  assert.match(marketplaceSearchRoute, /setMarketplaceSearchCache\(cacheKey, body\)/)
})

test('homepage news caches fallback data and does not retry failed reads', () => {
  assert.match(vehicleNews, /public-vehicle-news-v1/)
  assert.match(vehicleNews, /unstable_cache/)
  assert.ok((vehicleNews.match(/\.retry\(false\)/g) || []).length >= 3)
})

test('homepage listing categories use one bounded RPC instead of per-category requests', () => {
  assert.match(home, /getPublishedMarketplaceHomeListingGroups\(localMarketCode, homeListingCategories, 17\)/)
  assert.doesNotMatch(home, /homeListingCategories\.map\(async \(category\)/)
  assert.match(marketplacePublicData, /\.rpc\('get_marketplace_home_listings'/)
  assert.match(homeRpcMigration, /cross join lateral/)
  assert.match(homeRpcMigration, /limit greatest\(1, least\(p_limit_per_category, 50\)\)/)
  assert.match(homeRpcMigration, /listing\.country_code = upper\(p_country_code\)/)
  assert.match(homeRpcMigration, /listing\.country_code <> upper\(p_country_code\)/)
})

test('auction close cron is serialized, bounded and runs at a recovery-safe cadence', () => {
  assert.match(cronMigration, /pg_try_advisory_xact_lock/)
  assert.match(cronMigration, /limit 25[\s\S]*for update skip locked/)
  assert.match(cronMigration, /cron\.alter_job/)
  assert.match(cronMigration, /'\*\/5 \* \* \* \*'/)
})
