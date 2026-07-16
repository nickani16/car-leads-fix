import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const marketplaceSearch = readFileSync(
  new URL('../lib/marketplace-search-v2.ts', import.meta.url),
  'utf8',
)
const listingSearch = readFileSync(
  new URL('../lib/search/listing-search.ts', import.meta.url),
  'utf8',
)

test('marketplace free text requires every search token to match a listing field', () => {
  assert.match(marketplaceSearch, /for \(const token of marketplaceSearchTokens\(filters\.q\)\)/)
  assert.match(marketplaceSearch, /marketplaceSearchOrFiltersForToken\(token, filters\.markets\)/)
  assert.match(marketplaceSearch, /fuel_type\.ilike/)
  assert.match(marketplaceSearch, /body_type\.ilike/)
  assert.match(marketplaceSearch, /municipality\.ilike/)
  assert.match(marketplaceSearch, /postalCode/)
  assert.match(marketplaceSearch, /postal_code/)
  assert.match(marketplaceSearch, /model_year\.eq/)
})

test('public smart search suggestions are derived from live listing make, model and location fields', () => {
  assert.match(listingSearch, /postal_code/)
  assert.match(listingSearch, /function listingLocation/)
  assert.match(listingSearch, /createLocationEntry\(\{ locale, location \}\)/)
  assert.match(listingSearch, /joinLocalized\(listing\.make, formatLocationTitle\(location/)
  assert.match(listingSearch, /modelLocationParams\.set\('model', listing\.model\)/)
})
