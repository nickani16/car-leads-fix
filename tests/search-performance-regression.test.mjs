import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const smartSuggestions = readFileSync(
  new URL('../app/components/VehicleSmartSearchSuggestions.tsx', import.meta.url),
  'utf8',
)
const vehicleSearchExperience = readFileSync(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)
const publicSearchApi = readFileSync(
  new URL('../app/api/public-search/route.ts', import.meta.url),
  'utf8',
)
const listingSearch = readFileSync(
  new URL('../lib/search/listing-search.ts', import.meta.url),
  'utf8',
)
const marketplaceSearchApi = readFileSync(
  new URL('../app/api/marketplace/search-v2/route.ts', import.meta.url),
  'utf8',
)

test('smart search suggestions are throttled, cached and deduped on the client', () => {
  assert.match(smartSuggestions, /SMART_SEARCH_MIN_QUERY_LENGTH = 3/)
  assert.match(smartSuggestions, /SMART_SEARCH_DEBOUNCE_MS = 650/)
  assert.match(smartSuggestions, /smartSearchInflight/)
  assert.match(smartSuggestions, /SMART_SEARCH_CACHE_TTL_MS = 5 \* 60_000/)
  assert.match(smartSuggestions, /SMART_SEARCH_CACHE_MAX_ENTRIES = 150/)
})

test('marketplace search waits for debounced text before API search', () => {
  assert.match(vehicleSearchExperience, /debouncedSearchInput/)
  assert.match(vehicleSearchExperience, /setDebouncedSearchInput\(searchInput\.trim\(\)\.replace/)
  assert.match(vehicleSearchExperience, /setParam\('q', debouncedSearchInput\)/)
  assert.match(vehicleSearchExperience, /active: mobileMapOpen && mobileMapSearchFocused/)
})

test('search APIs have cheap rejects, bounded limits and shared cache headers', () => {
  assert.match(publicSearchApi, /PUBLIC_SEARCH_MIN_QUERY_LENGTH = 2/)
  assert.match(publicSearchApi, /Math\.min\(Math\.max\(Number\(request\.nextUrl\.searchParams\.get\('limit'\) \|\| 8\), 1\), 8\)/)
  assert.match(publicSearchApi, /s-maxage=900/)
  assert.match(listingSearch, /__autorellPublicSearchCache/)
  assert.match(listingSearch, /PUBLIC_SEARCH_CACHE_TTL_MS = 5 \* 60_000/)
  assert.match(listingSearch, /PUBLIC_SEARCH_CACHE_MAX_ENTRIES = 1_000/)
  assert.match(marketplaceSearchApi, /SEARCH_CACHE_TTL_MS = 60_000/)
  assert.match(marketplaceSearchApi, /SEARCH_CACHE_MAX_ENTRIES = 1_000/)
  assert.match(marketplaceSearchApi, /Math\.min\(Math\.max\(Number\(input\.limit \|\| 48\), 1\), 48\)/)
  assert.match(marketplaceSearchApi, /s-maxage=300/)
})
