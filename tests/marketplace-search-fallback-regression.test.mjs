import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const clientSource = await readFile(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)
const routeSource = await readFile(
  new URL('../app/api/marketplace/search-v2/route.ts', import.meta.url),
  'utf8',
)

test('transient marketplace search failures preserve the last valid listings and markers', () => {
  const searchEffect = clientSource.slice(
    clientSource.indexOf('const response = await fetch(`/api/marketplace/search-v2?'),
    clientSource.indexOf('const selectedCategoryItems'),
  )

  assert.match(searchEffect, /response\.headers\.get\('X-Autorell-Search-Fallback'\)/)
  assert.match(searchEffect, /setSearchError\(true\)/)
  assert.doesNotMatch(searchEffect, /setSearchListings\(\[\]\)/)
  assert.doesNotMatch(searchEffect, /setSearchTotalCount\(0\)/)
  assert.doesNotMatch(searchEffect, /setSearchFacets\(\{\}\)/)
})

test('unavailable empty search fallbacks are not cached as real results', () => {
  const fallbackHandler = routeSource.slice(
    routeSource.indexOf('} catch (error) {'),
    routeSource.indexOf('function marketplaceSearchCacheKey'),
  )

  assert.match(fallbackHandler, /X-Autorell-Search-Fallback/)
  assert.doesNotMatch(fallbackHandler, /setMarketplaceSearchCache/)
})
