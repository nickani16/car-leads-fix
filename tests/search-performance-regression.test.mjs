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
const homeSearch = readFileSync(
  new URL('../app/components/HomeHeroVehicleSearch.tsx', import.meta.url),
  'utf8',
)
const marketplaceHome = readFileSync(
  new URL('../app/components/BusinessMarketplaceHome.tsx', import.meta.url),
  'utf8',
)
const publicHeader = readFileSync(
  new URL('../app/components/PublicHeader.tsx', import.meta.url),
  'utf8',
)
const publicFooter = readFileSync(
  new URL('../app/components/PublicFooter.tsx', import.meta.url),
  'utf8',
)
const adminClient = readFileSync(
  new URL('../lib/supabase/admin.ts', import.meta.url),
  'utf8',
)
const publicMarketplaceData = readFileSync(
  new URL('../lib/marketplace-public-data.ts', import.meta.url),
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
  assert.match(marketplaceSearchApi, /SEARCH_CACHE_TTL_MS = 5_000/)
  assert.match(marketplaceSearchApi, /SEARCH_CACHE_MAX_ENTRIES = 1_000/)
  assert.match(marketplaceSearchApi, /Math\.min\(Math\.max\(Number\(input\.limit \|\| 48\), 1\), 48\)/)
  assert.match(marketplaceSearchApi, /'Cache-Control': 'no-store'/)
})

test('marketplace outage handling aborts quickly and settles the public UI', () => {
  assert.match(adminClient, /createAbortableFetch/)
  assert.match(adminClient, /signal: controller\.signal/)
  assert.match(marketplaceSearchApi, /SEARCH_TIMEOUT_MS = 1_800/)
  assert.match(marketplaceSearchApi, /setTimeout\(\(\) => searchController\.abort\(\), SEARCH_TIMEOUT_MS\)/)
  assert.match(marketplaceSearchApi, /X-Autorell-Search-Fallback/)
  assert.match(marketplaceSearchApi, /emptySearchResult/)
  assert.doesNotMatch(marketplaceSearchApi, /status: 503/)
  assert.doesNotMatch(marketplaceSearchApi, /Promise\.race/)
  assert.match(homeSearch, /countRequestInitialized/)
  assert.match(homeSearch, /setTimeout\(\(\) => controller\.abort\(\), 2_500\)/)
  assert.match(vehicleSearchExperience, /response\.headers\.get\('X-Autorell-Search-Fallback'\)/)
  assert.doesNotMatch(
    vehicleSearchExperience.slice(
      vehicleSearchExperience.indexOf('const response = await fetch(`/api/marketplace/search-v2?'),
      vehicleSearchExperience.indexOf('const selectedCategoryItems'),
    ),
    /setSearchListings\(\[\]\)/,
  )
  assert.match(vehicleSearchExperience, /setSearchLoading\(false\)/)
  assert.match(marketplaceHome, /timeoutMs = 900/)
  assert.match(publicMarketplaceData, /createAdminClient\(\{ timeoutMs: 900 \}\)/)
})

test('header and footer logos keep Next client-side navigation', () => {
  const headerLogoHandler = publicHeader.slice(
    publicHeader.indexOf('function handleHomeLogoClick'),
    publicHeader.indexOf('function handleCategoryNavigation'),
  )
  assert.doesNotMatch(headerLogoHandler, /preventDefault|window\.location/)
  assert.match(publicHeader, /<Link[\s\S]*href=\{homeHref\}[\s\S]*onClick=\{handleHomeLogoClick\}/)

  const footerLogo = publicFooter.slice(
    publicFooter.indexOf('<Link\n              href={homeHref}'),
    publicFooter.indexOf('<BrandLogo underline={false} />') + 31,
  )
  assert.doesNotMatch(footerLogo, /preventDefault|window\.location/)
})
