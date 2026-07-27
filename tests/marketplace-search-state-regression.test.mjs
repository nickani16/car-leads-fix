import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const searchStateSource = readFileSync(new URL('../lib/marketplace-search-state.ts', import.meta.url), 'utf8')
const searchSource = readFileSync(new URL('../lib/marketplace-search-v2.ts', import.meta.url), 'utf8')
const vehicleSearchExperienceSource = readFileSync(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)
const marketplaceCategoryPageSource = readFileSync(
  new URL('../app/marketplace/[category]/page.tsx', import.meta.url),
  'utf8',
)
const migrationSource = readFileSync(
  new URL('../supabase/migrations/20260727110000_marketplace_geo_search_state.sql', import.meta.url),
  'utf8',
)

test('marketplace search state defines one shared geo/search model', () => {
  assert.match(searchStateSource, /export type MarketplaceSearchState/)
  assert.match(searchStateSource, /export type MarketplaceGeoArea/)
  assert.match(searchStateSource, /export type MarketplaceBoundingBox/)
  assert.match(searchStateSource, /parseMarketplaceSearchState/)
  assert.match(searchStateSource, /normalizeSearchBounds/)
  assert.match(searchStateSource, /isPointInsideSearchBounds/)
  assert.match(searchStateSource, /searchBoundsToPolygon/)
  assert.match(searchStateSource, /knownVehicleMakes/)
})

test('phase 1 Sweden fixtures include municipalities, localities, aliases and bounds', () => {
  for (const fixture of [
    'SE:country:sweden',
    'SE:municipality:goteborg',
    'SE:municipality:stockholm',
    'SE:municipality:huddinge',
    'SE:municipality:kramfors',
    'SE:locality:bollstabruk',
    'SE:locality:nyland',
  ]) {
    assert.ok(searchStateSource.includes(fixture), `${fixture} should be registered`)
  }

  for (const alias of ['gothenburg', 'goteborg kommun', 'huddinge kommun', 'bollsta bruk']) {
    assert.ok(searchStateSource.includes(alias), `${alias} should be searchable`)
  }

  assert.match(searchStateSource, /bounds:\s*\{\s*north:/)
  assert.match(searchStateSource, /centroid:\s*\{\s*latitude:/)
  assert.match(searchStateSource, /swedishMunicipalities/)
  assert.match(searchStateSource, /swedishCounties/)
})

test('free text parsing removes location, category, offer type and price terms before text tokens run', () => {
  assert.match(searchStateSource, /extractMaxPrice/)
  assert.match(searchStateSource, /extractVehicleMake/)
  assert.match(searchStateSource, /extractCategoryFilters/)
  assert.match(searchStateSource, /extractOfferType/)
  assert.match(searchStateSource, /removeSearchStateTerms/)
  assert.match(searchStateSource, /under\|max\|upp till/)
  assert.match(searchStateSource, /transportbilar/)
  assert.match(searchStateSource, /leasing/)
  assert.match(searchStateSource, /postalCodeGeoArea/)
  assert.match(searchStateSource, /'BMW'/)
})

test('search-v2 consumes geo area and bounding box through the same normalized filter state', () => {
  assert.match(searchSource, /parseMarketplaceSearchState/)
  assert.match(searchSource, /resolveMarketplaceGeoArea/)
  assert.match(searchSource, /marketplaceGeoAreaOrFilters/)
  assert.match(searchSource, /normalizeSearchBounds/)
  assert.match(searchSource, /parsedSearchState\.categories/)
  assert.match(searchSource, /parsedSearchState\.offerType/)
  assert.match(searchSource, /parsedSearchState\.make/)
  assert.match(searchSource, /filters\.geoArea/)
  assert.match(searchSource, /filters\.bounds/)
  assert.match(searchSource, /gte\('latitude', filters\.bounds\.south\)/)
  assert.match(searchSource, /lte\('longitude', filters\.bounds\.east\)/)
})

test('geo area filters prefer stable columns before text fallback', () => {
  for (const snippet of [
    'geo_area_id.eq',
    'geo_region_code.eq',
    'geo_municipality_code.eq',
    'geo_locality_code.eq',
  ]) {
    assert.ok(searchStateSource.includes(snippet), `${snippet} should be present`)
  }
})

test('geo search migration prepares stable IDs, polygons and indexed coordinates', () => {
  for (const snippet of [
    'add column if not exists geo_area_id text',
    'add column if not exists geo_region_code text',
    'add column if not exists geo_municipality_code text',
    'add column if not exists geo_locality_code text',
    'add column if not exists centroid_lat double precision',
    'add column if not exists bounds jsonb',
    'add column if not exists polygon jsonb',
    'add column if not exists aliases text[]',
    'marketplace_listings_lat_lng_idx',
  ]) {
    assert.ok(migrationSource.includes(snippet), `${snippet} should be present`)
  }
})

test('marketplace UI hydrates geo search state into URL, API and map handoff', () => {
  for (const snippet of [
    'initialGeoAreaId',
    'initialGeoBounds',
    "setParam('geoAreaId'",
    "setParam('north'",
    'onSearchArea',
    'geoBounds',
    'autorell-geo-bounds',
    'searchBoundsToPolygon',
  ]) {
    assert.ok(vehicleSearchExperienceSource.includes(snippet), `VehicleSearchExperience should include ${snippet}`)
  }

  for (const snippet of [
    'parseMarketplaceSearchState',
    'normalizeSearchBounds',
    'initialGeoAreaId=',
    'initialGeoBounds=',
  ]) {
    assert.ok(marketplaceCategoryPageSource.includes(snippet), `marketplace category page should include ${snippet}`)
  }
})
