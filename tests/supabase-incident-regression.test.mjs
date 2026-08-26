import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const sitemapRoute = readFileSync(new URL('../app/sitemaps/[name]/route.ts', import.meta.url), 'utf8')
const marketplaceSearch = readFileSync(new URL('../lib/marketplace-search-v2.ts', import.meta.url), 'utf8')
const cronMigration = readFileSync(new URL('../supabase/migrations/20260826213000_stabilize_auction_close_cron.sql', import.meta.url), 'utf8')

test('database-backed sitemap rows are shared across crawler requests without automatic retries', () => {
  assert.match(sitemapRoute, /unstable_cache/)
  assert.match(sitemapRoute, /sitemap-vehicle-news-v1/)
  assert.match(sitemapRoute, /sitemap-marketplace-listings-v1/)
  assert.equal(sitemapRoute.match(/\.retry\(false\)/g)?.length, 2)
  assert.match(sitemapRoute, /revalidate: 21_600/)
  assert.match(sitemapRoute, /revalidate: 3_600/)
})

test('marketplace fan-out queries fail fast instead of multiplying an outage', () => {
  assert.ok((marketplaceSearch.match(/\.retry\(false\)/g) || []).length >= 9)
  assert.match(marketplaceSearch, /sponsoredCountQuery\.retry\(false\)/)
  assert.match(marketplaceSearch, /normalCountQuery\.retry\(false\)/)
})

test('auction close cron is serialized, bounded and runs at a recovery-safe cadence', () => {
  assert.match(cronMigration, /pg_try_advisory_xact_lock/)
  assert.match(cronMigration, /limit 25[\s\S]*for update skip locked/)
  assert.match(cronMigration, /cron\.alter_job/)
  assert.match(cronMigration, /'\*\/5 \* \* \* \*'/)
})
