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
const marketCatchAllSource = readFileSync(new URL('../app/[market]/[...slug]/page.tsx', import.meta.url), 'utf8')
const swedishCarRouteSource = readFileSync(new URL('../app/[market]/bilar/[...segments]/page.tsx', import.meta.url), 'utf8')
const internalSeoRouteSource = readFileSync(new URL('../app/seo/[market]/[...slug]/page.tsx', import.meta.url), 'utf8')
const geoLandingSource = readFileSync(new URL('../lib/seo-geo-landings.ts', import.meta.url), 'utf8')
const seoRoutesSource = readFileSync(new URL('../lib/seo-routes.ts', import.meta.url), 'utf8')
const marketplacePublicDataSource = readFileSync(new URL('../lib/marketplace-public-data.ts', import.meta.url), 'utf8')
const proxySource = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8')
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
  assert.match(searchStateSource, /swedishDisplayName\(municipality\.name, municipality\.slug\)/)
  assert.match(searchStateSource, /swedishDisplayName\(county\.name, county\.slug\)/)
  assert.match(searchStateSource, /repairMojibake/)
  assert.doesNotMatch(searchStateSource, /const name = titleFromSlug\(municipality\.slug\)/)
  assert.doesNotMatch(searchStateSource, /const region = county \? titleFromSlug\(county\.slug\)/)
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
  assert.match(searchSource, /applyStrictGeoAreaFilter/)
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
  assert.match(searchSource, /geoArea\.level === 'region'/)
  assert.match(searchSource, /geoArea\.level === 'municipality'/)
  assert.match(searchSource, /geoArea\.level === 'locality'/)
  assert.match(searchSource, /geoArea\.level === 'postal_code'/)
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
    "setParam('region'",
    "setParam('municipality'",
    "setParam('north'",
    'onSearchArea',
    'geoBounds',
    'map.fitBounds(bounds',
  ]) {
    assert.ok(vehicleSearchExperienceSource.includes(snippet), `VehicleSearchExperience should include ${snippet}`)
  }

  for (const snippet of [
    'parseMarketplaceSearchState',
    'normalizeSearchBounds',
    'initialSearchChips.push(initialGeoArea.name)',
    'initialGeoAreaId=',
    'initialGeoBounds=',
    "initialGeoFilterMode={initialGeoArea ? 'strict' : 'legacy'}",
  ]) {
    assert.ok(marketplaceCategoryPageSource.includes(snippet), `marketplace category page should include ${snippet}`)
  }
})

test('marketplace keeps county and municipality in full filters and facets, not desktop tabs', () => {
  assert.doesNotMatch(vehicleSearchExperienceSource, /'region' \| 'municipality'/)
  assert.match(vehicleSearchExperienceSource, /searchFacets\?\.regions/)
  assert.match(vehicleSearchExperienceSource, /searchFacets\?\.municipalities/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /desktopMenuButton\('region'/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /desktopMenuButton\('municipality'/)
  assert.match(vehicleSearchExperienceSource, /renderLocationFilterSection/)
  assert.match(vehicleSearchExperienceSource, /updateRegionFilter/)
  assert.match(vehicleSearchExperienceSource, /updateMunicipalityFilter/)
  assert.match(searchSource, /regions: MarketplaceFacetOption\[\]/)
  assert.match(searchSource, /municipalities: MarketplaceFacetOption\[\]/)
  assert.match(searchSource, /add\('regions', row\.municipality \|\| row\.city\)/)
  assert.match(searchSource, /add\('municipalities', row\.municipality \|\| row\.city\)/)
})

test('geo SEO landings are market-wide, localized and backed by the geo directory', () => {
  for (const market of ['se', 'de', 'at', 'fr', 'it', 'es', 'nl', 'be', 'pl', 'dk', 'fi']) {
    assert.match(geoLandingSource, new RegExp(`\\b${market}:`), `${market} should have a route config`)
  }
  for (const slug of ['bilar', 'motorcyklar', 'husbilar', 'husvagnar', 'cyklar', 'leasingbilar', 'lastbilar', 'lkw', 'leasingautos', 'camions', 'autocarri', 'camiones', 'vrachtwagens', 'leaseautos', 'ciezarowki', 'lastbiler', 'kuorma-autot']) {
    assert.ok(geoLandingSource.includes(slug), `${slug} should be routable`)
  }
  assert.match(geoLandingSource, /export async function resolveGeoLandingRoute/)
  assert.match(geoLandingSource, /searchGeoPlaces/)
  assert.match(geoLandingSource, /getGeoRegions/)
  assert.match(geoLandingSource, /buildGeoMarketplaceHref/)
  assert.match(geoLandingSource, /leasingPossible/)
  assert.match(geoLandingSource, /mode', 'leasing'/)
  for (const slug of ['husbilar', 'leasingbilar', 'wohnmobile', 'leasingautos', 'camping-cars', 'leaseautos', 'leasing-kuorma-autot']) {
    assert.ok(seoRoutesSource.includes(slug), `${slug} should be proxy-routable`)
  }
  assert.doesNotMatch(geoLandingSource, /buildGeoLandingMetadata/)
  assert.match(marketCatchAllSource, /redirect\(buildGeoMarketplaceHref\(geoLanding\)\)/)
  assert.match(swedishCarRouteSource, /redirect\(buildGeoMarketplaceHref\(landing\)\)/)
  assert.match(internalSeoRouteSource, /redirect\(destination\)/)
  assert.match(internalSeoRouteSource, /buildGeoMarketplaceHref\(geoLanding\)/)
  assert.doesNotMatch(marketCatchAllSource, /GeoLandingSearchPage/)
  assert.doesNotMatch(swedishCarRouteSource, /GeoLandingSearchPage/)
  assert.doesNotMatch(internalSeoRouteSource, /PublicHeader|PublicFooter|getSeoLandingData/)
  assert.doesNotMatch(geoLandingSource, /resolveSwedishCarGeoLanding/)
  assert.doesNotMatch(geoLandingSource, /municipalityCode/)
})

test('localized listing URLs render listing detail pages instead of falling through to market catch-all', () => {
  assert.match(marketCatchAllSource, /import ListingDetailPage, \{ generateListingMetadata \}/)
  for (const segment of ['annons', 'anzeige', 'advertentie', 'annonce', 'anuncio', 'annuncio', 'ogloszenie', 'ilmoitus']) {
    assert.ok(marketCatchAllSource.includes(segment), `${segment} should route to listing detail`)
  }
  assert.match(marketCatchAllSource, /localizedListingParams/)
  assert.match(marketCatchAllSource, /return generateListingMetadata\(\{ params: listingParams \}\)/)
  assert.match(marketCatchAllSource, /return <ListingDetailPage params=\{listingParams\} \/>/)
})

test('leasing marketplace mode does not present map markers or result labels as for-sale-only', () => {
  assert.match(vehicleSearchExperienceSource, /resultActionSubjectLabel\(locale, mode\)/)
  assert.match(vehicleSearchExperienceSource, /formatLeasingCountText/)
  assert.match(vehicleSearchExperienceSource, /för leasing/)
  assert.match(vehicleSearchExperienceSource, /const baseColorClass = 'bg-\[#0866ff\] group-hover:bg-\[#0757da\]'/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /leasing \? 'bg-\[#16a34a\]/)
})

test('listing detail lookups are uncached so newly published listings do not keep stale 404s', () => {
  assert.match(marketplacePublicDataSource, /export async function getMarketplaceListingForPublicDetail\(id: string\)/)
  assert.doesNotMatch(marketplacePublicDataSource, /public-marketplace-listing-detail-by-id/)
})

test('proxy protects expensive crawl surfaces without blocking verified search bots', () => {
  assert.match(proxySource, /SEARCH_CRAWLER_PATTERN/)
  assert.match(proxySource, /googlebot\|bingbot/)
  assert.match(proxySource, /SUSPICIOUS_BOT_PATTERN/)
  assert.match(proxySource, /claudebot\|gptbot/)
  assert.match(proxySource, /isBotProtectedPath/)
  assert.match(proxySource, /\/api\/marketplace\/search-v2/)
  assert.match(proxySource, /\/sitemaps\/:path\*/)
  assert.match(proxySource, /proxyBotRateLimit/)
  assert.match(proxySource, /botRateLimitedResponse/)
  assert.match(proxySource, /botBlockedResponse/)
})
