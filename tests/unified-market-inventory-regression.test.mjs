import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const searchSource = readFileSync(new URL('../lib/marketplace-search-v2.ts', import.meta.url), 'utf8')
const clientSource = readFileSync(new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url), 'utf8')
const pageSource = readFileSync(new URL('../app/marketplace/[category]/page.tsx', import.meta.url), 'utf8')
const homeDataSource = readFileSync(new URL('../lib/marketplace-public-data.ts', import.meta.url), 'utf8')

test('local market is a ranking preference instead of a default filter', () => {
  assert.match(searchSource, /preferredMarket: markets\.length \? '' : normalizePreferredMarket\(input\.displayMarket\)/)
  assert.match(searchSource, /searchPublishedWithPreferredMarket/)
  assert.match(searchSource, /query\.eq\('country_code', filters\.preferredMarket\)/)
  assert.match(searchSource, /query\.neq\('country_code', filters\.preferredMarket\)/)
  assert.doesNotMatch(clientSource, /params\.set\('markets', safeAutomaticCountry\)/)
  assert.match(clientSource, /setSelectedMarkets\(\[\]\)/)
  assert.match(pageSource, /parseMarketplaceSearchState\(initialQuery, \{\s*markets: initialMarkets,/)
})

test('homepage merges local inventory before inventory from other markets', () => {
  assert.match(homeDataSource, /buildQuery\('local'\)/)
  assert.match(homeDataSource, /buildQuery\('other'\)/)
  assert.match(homeDataSource, /\[\.\.\.\(local \|\| \[\]\), \.\.\.\(other \|\| \[\]\)\]/)
})
