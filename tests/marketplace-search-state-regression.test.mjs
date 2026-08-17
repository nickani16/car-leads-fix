import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const searchStateSource = readFileSync(new URL('../lib/marketplace-search-state.ts', import.meta.url), 'utf8')
const searchSource = readFileSync(new URL('../lib/marketplace-search-v2.ts', import.meta.url), 'utf8')
const vehicleSearchExperienceSource = readFileSync(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)
const appLayoutSource = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8')
const homeHeroVehicleSearchSource = readFileSync(
  new URL('../app/components/HomeHeroVehicleSearch.tsx', import.meta.url),
  'utf8',
)
const publicHeaderSource = readFileSync(
  new URL('../app/components/PublicHeader.tsx', import.meta.url),
  'utf8',
)
const listingCardImageCarouselSource = readFileSync(
  new URL('../app/components/ListingCardImageCarousel.tsx', import.meta.url),
  'utf8',
)
const marketplaceCategoryBrowserSource = readFileSync(
  new URL('../app/components/MarketplaceCategoryBrowser.tsx', import.meta.url),
  'utf8',
)
const mapCategoryMarkerSource = readFileSync(
  new URL('../app/components/MapCategoryMarker.ts', import.meta.url),
  'utf8',
)
const marketplaceCategoryPageSource = readFileSync(
  new URL('../app/marketplace/[category]/page.tsx', import.meta.url),
  'utf8',
)
const searchRouteSource = readFileSync(new URL('../app/api/marketplace/search-v2/route.ts', import.meta.url), 'utf8')
const geoContractRepairMigration = readFileSync(
  new URL('../supabase/migrations/20260816171048_marketplace_listing_geo_contract_repair.sql', import.meta.url),
  'utf8',
)
const findCarsPageSource = readFileSync(new URL('../app/find-cars/page.tsx', import.meta.url), 'utf8')
const listingDetailPageSource = readFileSync(
  new URL('../app/listings/[slug]/ListingDetailPage.tsx', import.meta.url),
  'utf8',
)
const marketCatchAllSource = readFileSync(new URL('../app/[market]/[...slug]/page.tsx', import.meta.url), 'utf8')
const swedishCarRouteSource = readFileSync(new URL('../app/[market]/bilar/[...segments]/page.tsx', import.meta.url), 'utf8')
const internalSeoRouteSource = readFileSync(new URL('../app/seo/[market]/[...slug]/page.tsx', import.meta.url), 'utf8')
const geoLandingSource = readFileSync(new URL('../lib/seo-geo-landings.ts', import.meta.url), 'utf8')
const seoRoutesSource = readFileSync(new URL('../lib/seo-routes.ts', import.meta.url), 'utf8')
const marketplacePublicDataSource = readFileSync(new URL('../lib/marketplace-public-data.ts', import.meta.url), 'utf8')
const manualPublicTranslationsSource = readFileSync(new URL('../lib/manual-public-translations.ts', import.meta.url), 'utf8')
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
  assert.match(searchSource, /marketplaceGeoAreaOrFilters\(geoArea\)/)
  assert.match(searchSource, /resolveStaticMarketplaceGeoArea\(geoAreaValue\)/)
  assert.match(searchSource, /query\.or\(filters\.join\(','\)\)/)
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

test('production geo filter columns are guarded by an additive contract repair', () => {
  for (const column of [
    'geo_place_code',
    'geo_area_id',
    'geo_region_code',
    'geo_municipality_code',
    'geo_locality_code',
  ]) {
    assert.match(geoContractRepairMigration, new RegExp(`add column if not exists ${column} text`))
  }
  assert.match(geoContractRepairMigration, /marketplace_listings_geo_area_idx/)
})

test('marketplace UI hydrates geo search state into URL, API and map handoff', () => {
  for (const snippet of [
    'initialGeoAreaId',
    'initialGeoBounds',
    "setParam('geoAreaId'",
    "setParam('region'",
    "setParam('municipality'",
    "setParam('north'",
    'geoBounds',
    'map.fitBounds(bounds',
  ]) {
    assert.ok(vehicleSearchExperienceSource.includes(snippet), `VehicleSearchExperience should include ${snippet}`)
  }
  assert.doesNotMatch(vehicleSearchExperienceSource, /Search in this area/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /Sök i detta område/)

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
  assert.match(geoLandingSource, /offerType.*lease/)
  assert.match(geoLandingSource, /params\.set\('mode', landing\.leasing \? 'leasing' : 'sale'\)/)
  for (const slug of ['husbilar', 'leasingbilar', 'wohnmobile', 'leasingautos', 'camping-cars', 'leaseautos', 'leasing-kuorma-autot']) {
    assert.ok(seoRoutesSource.includes(slug), `${slug} should be proxy-routable`)
  }
  assert.doesNotMatch(geoLandingSource, /buildGeoLandingMetadata/)
  assert.match(marketCatchAllSource, /redirect\(buildGeoMarketplaceHref\(geoLanding\)\)/)
  assert.match(swedishCarRouteSource, /redirect\(buildGeoMarketplaceHref\(landing\)\)/)
  assert.match(internalSeoRouteSource, /import MarketplaceCategoryPage/)
  assert.match(internalSeoRouteSource, /buildSeoMarketplaceSearchParams/)
  assert.match(internalSeoRouteSource, /seoLanding=\{landing\}/)
  assert.match(internalSeoRouteSource, /robots: \{ index: true, follow: true \}/)
  assert.match(internalSeoRouteSource, /CollectionPage/)
  assert.match(internalSeoRouteSource, /BreadcrumbList/)
  assert.match(internalSeoRouteSource, /permanentRedirect\(landing\.canonicalPath\)/)
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
  assert.match(proxySource, /LOCALIZED_AD_SEGMENTS\.has\(segments\[1\] \|\| ''\)/)
})

test('marketplace mode defaults to all while sale and leasing stay query-separated', () => {
  assert.match(vehicleSearchExperienceSource, /type SearchMode = 'all' \| 'sale' \| 'leasing'/)
  assert.match(vehicleSearchExperienceSource, /initialMode = 'all'/)
  assert.match(vehicleSearchExperienceSource, /initialModeExplicit = false/)
  assert.match(vehicleSearchExperienceSource, /initialModeExplicit \|\|/)
  assert.match(vehicleSearchExperienceSource, /normalizeSearchMode\(initialMode\)/)
  assert.match(vehicleSearchExperienceSource, /marketplaceModeOptionLabel\(locale, 'all'\)/)
  assert.match(vehicleSearchExperienceSource, /resultActionSubjectLabel\(locale, mode\)/)
  assert.match(vehicleSearchExperienceSource, /formatAllCountText/)
  assert.match(vehicleSearchExperienceSource, /formatLeasingCountText/)
  assert.ok(vehicleSearchExperienceSource.includes('f\\u00f6r leasing'))
  assert.match(vehicleSearchExperienceSource, /Till leasing/)
  assert.match(vehicleSearchExperienceSource, /applyMarketplaceSearchModeParams\(params, mode\)/)
  assert.match(homeHeroVehicleSearchSource, /params\.set\('mode', intent\)/)
  assert.match(homeHeroVehicleSearchSource, /params\.set\('offerType', intent === 'leasing' \? 'lease' : 'sale'\)/)
  assert.match(publicHeaderSource, /marketplaceMode = 'all'/)
  assert.match(publicHeaderSource, /useState<MarketplaceSearchMode>\(marketplaceMode\)/)
  assert.match(publicHeaderSource, /applyMarketplaceSearchModeParams\(params, searchMenuIntent\)/)
  assert.match(marketplaceCategoryPageSource, /hasSearchParam\(resolvedSearchParams, 'offerType'\)/)
  assert.match(findCarsPageSource, /hasSearchParam\(resolvedSearchParams, 'offerType'\)/)
  assert.match(marketplaceCategoryPageSource, /offerType: normalizeListingOfferType\(listing\.offer_type\)/)
  assert.match(findCarsPageSource, /offerType: normalizeListingOfferType\(listing\.offer_type\)/)
  assert.match(vehicleSearchExperienceSource, /if \(mode === 'sale' && !isSaleListing\(listing\)\) return false/)
  assert.match(vehicleSearchExperienceSource, /if \(mode === 'leasing' && !isLeasingListing\(listing\)\) return false/)
  assert.match(vehicleSearchExperienceSource, /listingOfferBadge\(locale, listing\)/)
  assert.match(homeHeroVehicleSearchSource, /type Intent = 'sale' \| 'leasing'/)
  assert.match(homeHeroVehicleSearchSource, /useState<Intent>\('sale'\)/)
  assert.match(homeHeroVehicleSearchSource, /isLeasingMarketplaceCategory\(category\)/)
  assert.match(homeHeroVehicleSearchSource, /\['sale', buyLabel\]/)
  assert.match(homeHeroVehicleSearchSource, /\['leasing', leasingLabel\]/)
  assert.match(publicHeaderSource, /useState<MarketplaceSearchMode>\(marketplaceMode\)/)
  assert.match(publicHeaderSource, /key: 'all' as const/)
  assert.match(publicHeaderSource, /shortLabel/)
  assert.match(publicHeaderSource, /max-h-8 min-w-0 overflow-hidden whitespace-normal break-words/)
  assert.match(publicHeaderSource, /\[overflow-wrap:anywhere\]/)
  assert.match(vehicleSearchExperienceSource, /const visibleMeta = meta/)
  assert.match(vehicleSearchExperienceSource, /createCategoryMapMarker/)
  assert.match(mapCategoryMarkerSource, /categoryIconPaths/)
  assert.match(mapCategoryMarkerSource, /offerType === 'lease' \|\| offerType === 'sale_and_lease'/)
  assert.match(mapCategoryMarkerSource, /bg-\[#16a34a\] group-hover:bg-\[#15803d\]/)
  assert.match(mapCategoryMarkerSource, /stroke-width="1\.65"/)
  assert.match(searchSource, /normalizeOfferTypeFilter\(input, parsedSearchState\.offerType\)/)
  assert.match(searchSource, /if \(mode === 'leasing'\) return 'lease'/)
  assert.match(searchSource, /if \(mode === 'sale'\) return 'sale'/)
  assert.match(searchSource, /query\.in\('offer_type', \['sale', 'sale_and_lease'\]\)/)
  assert.match(searchSource, /query\.in\('offer_type', \['lease', 'sale_and_lease'\]\)/)
  assert.match(searchSource, /return ''/)
})

test('marketplace empty state converts zero-result searches into a focused seller action', () => {
  assert.match(vehicleSearchExperienceSource, /function getMarketplaceEmptySubject/)
  assert.match(vehicleSearchExperienceSource, /function getMarketplaceEmptyCopy/)
  assert.match(vehicleSearchExperienceSource, /No listings for \{subject\} match your search in \{location\} yet/)
  assert.match(vehicleSearchExperienceSource, /const createListingHref = localizePublicHref\(/)
  assert.match(vehicleSearchExperienceSource, /\/account\/listings\/new/)
  assert.match(vehicleSearchExperienceSource, /category', activeCategoryKey/)
  assert.match(vehicleSearchExperienceSource, /const loginForListingHref = localizePublicHref\(locale, `\/login\?next=\$\{encodeURIComponent\(createListingHref\)\}`\)/)
  assert.match(vehicleSearchExperienceSource, /emptyStateCopy\.createLabel/)
  assert.match(vehicleSearchExperienceSource, /rounded-full bg-\[#0866ff\]/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /function broadenSearchToEurope\(\)/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /emptyStateCopy\.buyerTitle/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /emptyStateCopy\.buyerText/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /emptyStateCopy\.searchEurope/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /emptyStateCopy\.clearFilters/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /shadow-\[0_12px_28px/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /seoLanding\?\.zeroResultsText \|\| translatePublic\(locale, 'There do not seem to be any results\.'\)/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /translatePublic\(locale, 'Try searching for another location, another vehicle or another make\.'\)/)

  for (const locale of ['sv', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'fi', 'da']) {
    assert.match(manualPublicTranslationsSource, new RegExp(`${locale}: \\{[\\s\\S]*'No listings match your search yet':`))
    assert.match(manualPublicTranslationsSource, new RegExp(`${locale}: \\{[\\s\\S]*'No listings for \\{subject\\} match your search yet':`))
    assert.match(manualPublicTranslationsSource, new RegExp(`${locale}: \\{[\\s\\S]*'No listings for \\{subject\\} match your search in \\{location\\} yet':`))
    assert.match(manualPublicTranslationsSource, new RegExp(`${locale}: \\{[\\s\\S]*'Be the first to publish a listing and reach buyers in your market and across Europe\\.':`))
    assert.match(manualPublicTranslationsSource, new RegExp(`${locale}: \\{[\\s\\S]*'Create free listing':`))
    assert.match(manualPublicTranslationsSource, new RegExp(`${locale}: \\{[\\s\\S]*'It only takes a few minutes to get started\\.':`))
    assert.match(manualPublicTranslationsSource, new RegExp(`${locale}: \\{[\\s\\S]*'Already have an account\\?':`))
  }
})

test('marketplace make and model filters use live category-scoped options while keeping free text', () => {
  assert.match(vehicleSearchExperienceSource, /const makeModelOptions = useMemo/)
  assert.match(vehicleSearchExperienceSource, /optionListings\.filter/)
  assert.match(vehicleSearchExperienceSource, /countValues\(scopedListings\.map\(\(listing\) => listing\.make\)/)
  assert.match(vehicleSearchExperienceSource, /filter\(\(listing\) => !make \|\| normalizeSearchText\(listing\.make\) === normalizeSearchText\(make\)\)/)
  assert.match(vehicleSearchExperienceSource, /<MakeModelFilter[\s\S]*makeOptions=\{makeModelOptions\.makes\}[\s\S]*modelOptions=\{makeModelOptions\.models\}/)
  assert.match(vehicleSearchExperienceSource, /function MakeModelFilter/)
  assert.match(vehicleSearchExperienceSource, /function OptionSelectionList/)
  assert.match(vehicleSearchExperienceSource, /visibleMakes = makeOptions\.filter/)
  assert.match(vehicleSearchExperienceSource, /visibleModels = modelOptions\.filter/)
  assert.match(vehicleSearchExperienceSource, /useState<'make' \| 'model'>\('make'\)/)
  assert.match(vehicleSearchExperienceSource, /setMobilePanel\('model'\)/)
  assert.match(vehicleSearchExperienceSource, /sm:hidden/)
  assert.match(vehicleSearchExperienceSource, /max-sm:!left-3/)
  assert.match(vehicleSearchExperienceSource, /max-sm:!right-3/)
  assert.match(vehicleSearchExperienceSource, /max-sm:!w-auto/)
  assert.match(vehicleSearchExperienceSource, /hidden overflow-hidden rounded-\[12px\][\s\S]*sm:grid/)
  assert.match(vehicleSearchExperienceSource, /max-h-\[280px\]/)
  assert.match(vehicleSearchExperienceSource, /sm:w-\[640px\]/)
  assert.match(vehicleSearchExperienceSource, /showChevron/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /Live makes/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /Live-m/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /Live model suggestions/)
  assert.match(vehicleSearchExperienceSource, /function makeModelPickerCopy/)
  assert.match(vehicleSearchExperienceSource, /fi: \{[\s\S]*title: 'Merkki ja malli'/)
  assert.match(vehicleSearchExperienceSource, /pl: \{[\s\S]*title: 'Marka i model'/)
  assert.match(vehicleSearchExperienceSource, /<TextFilterInput[\s\S]*label=\{copy\.make\}/)
  assert.match(vehicleSearchExperienceSource, /<TextFilterInput[\s\S]*label=\{copy\.model\}/)
  assert.match(vehicleSearchExperienceSource, /onMakeChange\(value\)[\s\S]*onModelChange\(''\)/)
  assert.match(vehicleSearchExperienceSource, /onSelect=\{onModelChange\}/)
})

test('marketplace price filters use the active market currency instead of hardcoded SEK', () => {
  assert.match(vehicleSearchExperienceSource, /import \{ currencyForCountry, isLeasingMarketplaceCategory \} from '@\/lib\/marketplace'/)
  assert.match(vehicleSearchExperienceSource, /import \{ countryForLocale, currencyForLocale \} from '@\/lib\/market-locale'/)
  assert.match(vehicleSearchExperienceSource, /const priceFilterCurrency = selectedMarkets\.filter\(Boolean\)\.length === 1/)
  assert.match(vehicleSearchExperienceSource, /currencyForCountry\(selectedMarkets\.filter\(Boolean\)\[0\]\)/)
  assert.match(vehicleSearchExperienceSource, /currencyForLocale\(locale\)/)
  assert.match(vehicleSearchExperienceSource, /displayPriceValue\?: number \| null/)
  assert.match(vehicleSearchExperienceSource, /function priceFilterValue\(listing: VehicleSearchListing\)/)
  assert.match(vehicleSearchExperienceSource, /case 'EUR':\s*return 100000/)
  assert.match(vehicleSearchExperienceSource, /searchListings\.map\(priceFilterValue\)/)
  assert.match(vehicleSearchExperienceSource, /const comparablePrice = priceFilterValue\(listing\)/)
  assert.match(vehicleSearchExperienceSource, /unit=\{priceFilterCurrency\}/)
  assert.match(vehicleSearchExperienceSource, /\+ ' ' \+ priceFilterCurrency/)
  assert.match(vehicleSearchExperienceSource, /displayPriceValue: numberOrNull\(listing\.display_price_value\)/)
  assert.match(marketplaceCategoryPageSource, /displayPriceValue: price\.displayAmount/)
  assert.match(searchRouteSource, /display_price_value: price\?\.displayAmount \?\? null/)
  assert.match(searchRouteSource, /input\.minPrice = ''[\s\S]*input\.maxPrice = ''/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /unit="SEK"/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /\+ ' SEK'/)
})

test('marketplace range and select filters localize short UI labels', () => {
  assert.match(vehicleSearchExperienceSource, /function RangeFilter\(\{\s*locale,/)
  assert.match(vehicleSearchExperienceSource, /const clearLabel = translatePublic\(locale, 'Clear'\)/)
  assert.match(vehicleSearchExperienceSource, /const minLabel = translatePublic\(locale, 'Min'\)/)
  assert.match(vehicleSearchExperienceSource, /const maxLabel = translatePublic\(locale, 'Max'\)/)
  assert.match(vehicleSearchExperienceSource, /<FilterInput label=\{minLabel\}/)
  assert.match(vehicleSearchExperienceSource, /<FilterInput label=\{maxLabel\}/)
  assert.match(vehicleSearchExperienceSource, /function FilterSelect\(\{\s*locale,/)
  assert.match(vehicleSearchExperienceSource, /<option value="">\{translatePublic\(locale, 'All'\)\}<\/option>/)
  assert.doesNotMatch(vehicleSearchExperienceSource, />\s*Rensa\s*</)
  assert.doesNotMatch(vehicleSearchExperienceSource, /<option value="">Alla<\/option>/)

  assert.match(manualPublicTranslationsSource, /const marketplaceFilterTranslations/)
  assert.match(manualPublicTranslationsSource, /const marketplaceFilter = marketplaceFilterTranslations\[normalizedLocale\]/)
  assert.match(manualPublicTranslationsSource, /if \(marketplaceFilter\?\.\[value\]\) return marketplaceFilter\[value\]/)
  for (const locale of ['sv', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'da', 'fi']) {
    assert.match(manualPublicTranslationsSource, new RegExp(`${locale}: \\{[\\s\\S]*Clear:`), `${locale} should translate Clear`)
    assert.match(manualPublicTranslationsSource, new RegExp(`${locale}: \\{[\\s\\S]*All:`), `${locale} should translate All`)
    assert.match(manualPublicTranslationsSource, new RegExp(`${locale}: \\{[\\s\\S]*'Clear filters':`), `${locale} should translate Clear filters`)
    assert.match(manualPublicTranslationsSource, new RegExp(`${locale}: \\{[\\s\\S]*Mileage:`), `${locale} should translate Mileage`)
  }
  assert.match(manualPublicTranslationsSource, /fi: \{[\s\S]*Clear: 'Tyhjennä'/)
  assert.match(manualPublicTranslationsSource, /fi: \{[\s\S]*Price: 'Hinta'/)
  assert.match(manualPublicTranslationsSource, /fi: \{[\s\S]*Mileage: 'Kilometrit'/)
})

test('marketplace mobile filter panel always opens fullscreen', () => {
  assert.match(vehicleSearchExperienceSource, /fixed inset-0 z-\[180\] h-screen max-h-screen/)
  assert.match(vehicleSearchExperienceSource, /\[height:100dvh\] \[max-height:100dvh\]/)
  assert.match(vehicleSearchExperienceSource, /min-\[1120px\]:absolute min-\[1120px\]:inset-0/)
  assert.match(vehicleSearchExperienceSource, /px-4 py-3 pr-3 sm:px-6 sm:py-4 sm:pr-16/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /h-\[min\(88vh,820px\)\]/)
})

test('marketplace quick filter trigger stays outside the horizontal filter rail', () => {
  const triggerIndex = vehicleSearchExperienceSource.indexOf('data-marketplace-filter-trigger')
  const railIndex = vehicleSearchExperienceSource.indexOf('data-marketplace-filter-rail')

  assert.ok(triggerIndex > -1, 'filter trigger marker should exist')
  assert.ok(railIndex > triggerIndex, 'filter trigger must render before the scrollable rail')
  assert.match(
    vehicleSearchExperienceSource.slice(railIndex, railIndex + 320),
    /min-w-0 flex-1 overflow-x-auto/,
  )
  assert.doesNotMatch(
    vehicleSearchExperienceSource.slice(triggerIndex, railIndex),
    /sticky left-0/,
  )
})

test('marketplace quick filters serialize popovers and route-changing selections', () => {
  assert.match(
    vehicleSearchExperienceSource,
    /const \[quickFilterPlacement, setQuickFilterPlacement\] = useState<QuickFilterPlacement \| null>\(null\)/,
  )
  assert.match(
    vehicleSearchExperienceSource,
    /if \(desktopFilterMenu !== menu \|\| quickFilterPlacement !== placement\) return null/,
  )
  assert.match(
    vehicleSearchExperienceSource,
    /function afterQuickFilterMenuCloses\(update: \(\) => void\) \{\s*closeQuickFilterMenu\(\)\s*window\.requestAnimationFrame\(update\)\s*\}/,
  )
  assert.match(
    vehicleSearchExperienceSource,
    /afterQuickFilterMenuCloses\(\(\) => \{[\s\S]*setSelectedCategories\(next\)[\s\S]*\}\)/,
  )
  assert.match(
    vehicleSearchExperienceSource,
    /afterQuickFilterMenuCloses\(\(\) => \{[\s\S]*setMode\(nextMode\)[\s\S]*\}\)/,
  )
  assert.doesNotMatch(
    vehicleSearchExperienceSource,
    /document\.head\.(appendChild|removeChild)|new MutationObserver\(syncMetadata\)|duplicates\.forEach\(\(element\) => element\.remove\(\)\)/,
  )
})

test('marketplace range filters contain pointer gestures with pointer capture', () => {
  const rangeFilterSource = vehicleSearchExperienceSource.slice(
    vehicleSearchExperienceSource.indexOf('function RangeFilter('),
    vehicleSearchExperienceSource.indexOf('function FilterSelect('),
  )

  assert.match(rangeFilterSource, /activeHandleRef = useRef/)
  assert.match(rangeFilterSource, /setPointerCapture\(event\.pointerId\)/)
  assert.match(rangeFilterSource, /releasePointerCapture\(event\.pointerId\)/)
  assert.match(rangeFilterSource, /onLostPointerCapture/)
  assert.doesNotMatch(rangeFilterSource, /window\.addEventListener\('pointermove'/)
})

test('marketplace cards and listing detail show stable rounded offer status', () => {
  assert.match(vehicleSearchExperienceSource, /px-2 py-0\.5 text-\[11px\][\s\S]*\{offerBadge\.label\}[\s\S]*line-clamp-1 font-semibold/)
  assert.match(vehicleSearchExperienceSource, /truncate rounded-full bg-\[#f2f4f7\]/)
  assert.match(vehicleSearchExperienceSource, /inline-flex min-w-0 items-center gap-1\.5 rounded-full bg-\[#f2f4f7\]/)
  assert.match(listingDetailPageSource, /listingDetailOfferBadge\(locale, listing\.offer_type\)/)
  assert.match(listingDetailPageSource, /Till leasing/)
  assert.match(listingDetailPageSource, /Till salu/)
  assert.match(listingDetailPageSource, /mb-3 inline-flex w-max max-w-full items-center rounded-full[\s\S]*\{offerBadge\.label\}[\s\S]*<h1 className="max-w-4xl/)
  assert.match(listingDetailPageSource, /<p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1\.5 text-xs font-medium text-\[#667085\] sm:mt-4 sm:text-sm">\s*<span className="inline-flex items-center gap-1\.5">\s*<MapPin/)
})

test('electric listing range uses localized WLTP help and map previews badge offer type first', () => {
  assert.match(listingDetailPageSource, /function wltpRangeCopy\(locale: PublicLocale\)/)
  for (const locale of ['sv', 'en', 'de', 'fr', 'es', 'it', 'nl', 'da', 'fi', 'pl']) {
    assert.match(listingDetailPageSource, new RegExp(`${locale}: \\{[\\s\\S]*label: '[^']*\\(WLTP\\)'`))
  }
  assert.match(listingDetailPageSource, /Den faktiska räckvidden måste uppskattas/)
  assert.match(listingDetailPageSource, /group-hover:block group-focus-within:block/)
  assert.doesNotMatch(listingDetailPageSource, /h-4 w-4 items-center justify-center rounded-full text-\[#0866ff\][\s\S]*<Info className="h-3 w-3"/)
  assert.match(listingDetailPageSource, /<Info className="h-3\.5 w-3\.5" strokeWidth=\{2\.4\}/)
  assert.match(listingDetailPageSource, /labelNode: electricListing \? <WltpRangeLabel locale=\{locale\} \/> : undefined/)
  assert.match(vehicleSearchExperienceSource, /flex items-center justify-between gap-3 border-b border-\[#edf1f6\]/)
  assert.match(vehicleSearchExperienceSource, /rounded-full px-2\.5 py-1 text-\[12px\][\s\S]*\{offerBadge\.label\}[\s\S]*uiText\(locale, 'Close', 'St\\u00e4ng', 'Schlie\\u00dfen'\)/)
})

test('listing vehicle profile is automatically built from listing data, history and market insights', () => {
  assert.match(listingDetailPageSource, /<VehicleProfileSection[\s\S]*marketInsight=\{marketInsight\}[\s\S]*listingHistory=\{listingHistory\}/)
  assert.match(listingDetailPageSource, /function buildVehicleProfileCompleteness\(listing: ListingRow, specsCount: number, equipmentCount: number\)/)
  assert.match(listingDetailPageSource, /Automatisk profil/)
  assert.match(listingDetailPageSource, /Datatäckning/)
  assert.match(listingDetailPageSource, /completeness\.score/)
  assert.match(listingDetailPageSource, /marketInsight\.matchingCriteria\.join/)
  assert.match(listingDetailPageSource, /listingHistory\.length/)
  assert.match(listingDetailPageSource, /Platsprofil/)
  assert.match(listingDetailPageSource, /Publiceringsdata/)
})

test('marketplace comparison is localized, capped at four and uses a comparison matrix', () => {
  assert.match(vehicleSearchExperienceSource, /const maxCompareListings = 4/)
  assert.match(vehicleSearchExperienceSource, /const \[compareError, setCompareError\] = useState\(''\)/)
  assert.match(vehicleSearchExperienceSource, /current\.length >= maxCompareListings/)
  assert.match(vehicleSearchExperienceSource, /getCompareCopy\(locale\)\.limit/)
  assert.match(vehicleSearchExperienceSource, /function getCompareCopy\(locale: PublicLocale\)/)
  for (const locale of ['sv', 'en', 'de', 'fr', 'es', 'it', 'nl', 'da', 'fi', 'pl']) {
    assert.match(vehicleSearchExperienceSource, new RegExp(`${locale}: \\{[\\s\\S]*title:`))
  }
  assert.match(vehicleSearchExperienceSource, /buildVehicleCompareRows\(compareListings, locale, compareCopy\)/)
  assert.match(vehicleSearchExperienceSource, /type ResultsLayout = 'single' \| 'split'/)
  assert.match(vehicleSearchExperienceSource, /useState<ResultsLayout>\('single'\)/)
  assert.match(vehicleSearchExperienceSource, /const \[resultsLayoutTouched, setResultsLayoutTouched\] = useState\(false\)/)
  assert.match(vehicleSearchExperienceSource, /window\.matchMedia\('\(min-width: 768px\)'\)\.matches[\s\S]*setResultsLayout\('split'\)/)
  assert.match(vehicleSearchExperienceSource, /else if \(listings\.length > 1\) \{[\s\S]*setResultsLayout\('split'\)/)
  assert.match(vehicleSearchExperienceSource, /setResultsLayoutTouched\(true\)/)
  assert.match(vehicleSearchExperienceSource, /resultsLayoutTouched && resultsLayout === 'split'/)
  assert.match(vehicleSearchExperienceSource, /resultsLayout === 'split' && filteredListings\.length > 1 \? 'grid grid-cols-2' : ''/)
  assert.match(vehicleSearchExperienceSource, /layout=\{resultsLayout === 'split' && filteredListings\.length > 1 \? 'split' : 'single'\}/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /desktopSplit/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /min-\[1120px\]:grid-cols-2/)
  assert.match(vehicleSearchExperienceSource, /grid gap-3 p-3 sm:hidden/)
  assert.match(vehicleSearchExperienceSource, /sizes="calc\(100vw - 48px\)"/)
  assert.match(vehicleSearchExperienceSource, /grid grid-cols-\[minmax\(0,\.9fr\)_minmax\(0,1\.1fr\)\]/)
  assert.match(vehicleSearchExperienceSource, /className="hidden min-w-\[860px\] sm:block"/)
  assert.match(vehicleSearchExperienceSource, /gridTemplateColumns: `repeat\(\$\{compareListings\.length\}, minmax\(170px, 1fr\)\)`/)
  assert.match(vehicleSearchExperienceSource, /--autorell-mobile-bottom-gap/)
  assert.match(vehicleSearchExperienceSource, /--autorell-mobile-browser-inset/)
  assert.match(vehicleSearchExperienceSource, /gridTemplateColumns: `minmax\(150px, \.55fr\) repeat\(\$\{compareListings\.length\}, minmax\(170px, 1fr\)\)`/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /sticky left-0 top-0 z-20/)
  assert.match(vehicleSearchExperienceSource, /copy\.price/)
  assert.match(vehicleSearchExperienceSource, /copy\.seller/)
  assert.match(vehicleSearchExperienceSource, /copy\.location/)
  assert.match(marketplaceCategoryBrowserSource, /current\.length >= 4/)
  assert.match(marketplaceCategoryBrowserSource, /fixed inset-x-3 bottom-\[calc\(5\.15rem\+env\(safe-area-inset-bottom\)\)\]/)
  assert.match(marketplaceCategoryBrowserSource, /max 4 annonser/)
  assert.match(marketplaceCategoryBrowserSource, /up to 4 listings/)
  assert.match(marketplaceCategoryBrowserSource, /maximal 4 Anzeigen/)
})

test('marketplace mobile shortcuts use existing map, saved search and sorting controls', () => {
  assert.match(vehicleSearchExperienceSource, /aria-label=\{uiText\(locale, 'Marketplace shortcuts'/)
  assert.match(vehicleSearchExperienceSource, /fixed left-1\/2 z-\[86\] flex w-\[min\(356px,calc\(100vw-24px\)\)\] -translate-x-1\/2/)
  assert.match(vehicleSearchExperienceSource, /bottom-\[calc\(var\(--autorell-mobile-bottom-gap/)
  assert.match(vehicleSearchExperienceSource, /max\(0px,var\(--autorell-mobile-browser-inset,0px\)-env\(safe-area-inset-bottom\)\)/)
  assert.match(vehicleSearchExperienceSource, /VehicleSearchFooter locale=\{locale\} \/>[\s\S]*h-\[calc\(var\(--autorell-mobile-bottom-gap/)
  assert.match(vehicleSearchExperienceSource, /7\.25rem\)\] lg:hidden/)
  assert.match(vehicleSearchExperienceSource, /onClick=\{\(\) => setMobileMapOpen\(true\)\}/)
  assert.match(vehicleSearchExperienceSource, /onClick=\{saveCurrentSearch\}/)
  assert.match(vehicleSearchExperienceSource, /disabled=\{savingSearch\}/)
  assert.match(vehicleSearchExperienceSource, /onClick=\{focusMobileSortControl\}/)
  assert.match(vehicleSearchExperienceSource, /ref=\{mobileSortSelectRef\}/)
  assert.match(vehicleSearchExperienceSource, /data-marketplace-mobile-sort/)
  assert.match(vehicleSearchExperienceSource, /showPicker\?: \(\) => void/)
  assert.match(vehicleSearchExperienceSource, /catch \{[\s\S]*Some browsers only allow the native picker/)
  assert.match(vehicleSearchExperienceSource, /uiText\(locale, 'Sort', 'Sortera', 'Sortieren'\)/)
  assert.match(vehicleSearchExperienceSource, /inline-flex h-9 min-w-0 flex-1/)
  assert.match(vehicleSearchExperienceSource, /style=\{\{ fontWeight: 400 \}\}/)
  assert.match(vehicleSearchExperienceSource, /mobileShortcutOverMedia\s*\?\s*'border border-white\/10 bg-\[#101828\]\/72 text-white supports-\[backdrop-filter\]:bg-\[#101828\]\/64'/)
  assert.match(vehicleSearchExperienceSource, /'border border-\[#101828\]\/10 bg-white\/72 text-\[#111827\] supports-\[backdrop-filter\]:bg-white\/64'/)
  assert.match(vehicleSearchExperienceSource, /data-autorell-floating-shortcuts-tone=\{mobileShortcutOverMedia \? 'light' : 'dark'\}/)
  assert.match(vehicleSearchExperienceSource, /mobileShortcutOverMedia \? 'text-white' : 'text-\[#111827\]'/)
  assert.match(vehicleSearchExperienceSource, /floatingControlsOverlapMedia\(mobileShortcutBarRef\.current\)/)
  assert.match(vehicleSearchExperienceSource, /document\.addEventListener\('scroll', updateShortcutContrast, \{ passive: true, capture: true \}\)/)
  assert.match(listingCardImageCarouselSource, /data-autorell-media-surface="true"/)
  assert.match(vehicleSearchExperienceSource, /supports-\[backdrop-filter\]:bg-white\/64/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /border border-white\/70 bg-white\/72/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /inset_0_1px_0\(rgba\(255,255,255/)
  assert.doesNotMatch(vehicleSearchExperienceSource, /bg-\[#101828\]\/86 px-3 text-\[13px\] font-normal text-white/)
  assert.match(vehicleSearchExperienceSource, /flex min-w-0 flex-wrap items-center gap-1 sm:hidden/)
  assert.match(vehicleSearchExperienceSource, /inline-flex max-w-full shrink-0 rounded-full bg-\[#f2f4f7\] px-2 py-0\.5/)
})

test('mobile bottom navigation glass avoids white outlines and adapts inactive item contrast', () => {
  assert.match(publicHeaderSource, /fixed bottom-0 left-1\/2 z-\[120\] -translate-x-1\/2/)
  assert.match(publicHeaderSource, /--autorell-mobile-browser-inset/)
  assert.match(publicHeaderSource, /--autorell-mobile-bottom-gap/)
  assert.match(publicHeaderSource, /window\.visualViewport\?\.addEventListener\('resize', updateMobileBottomInset\)/)
  assert.match(publicHeaderSource, /window\.visualViewport\?\.addEventListener\('scroll', updateMobileBottomInset\)/)
  assert.match(publicHeaderSource, /pb-\[var\(--autorell-mobile-bottom-gap/)
  assert.match(publicHeaderSource, /mobileNavOverMedia\s*\?\s*'border border-white\/10 bg-\[#101828\]\/72 supports-\[backdrop-filter\]:bg-\[#101828\]\/64'/)
  assert.match(publicHeaderSource, /'border border-\[#101828\]\/10 bg-white\/72 supports-\[backdrop-filter\]:bg-white\/64'/)
  assert.match(publicHeaderSource, /data-autorell-mobile-nav-tone=\{mobileNavOverMedia \? 'light' : 'dark'\}/)
  assert.match(publicHeaderSource, /mobileNavOverMedia \? 'text-white' : 'text-\[#101828\]'/)
  assert.match(publicHeaderSource, /floatingNavOverlapsMedia\(mobileBottomNavRef\.current\)/)
  assert.match(publicHeaderSource, /document\.addEventListener\('scroll', updateNavContrast, \{ passive: true, capture: true \}\)/)
  assert.doesNotMatch(publicHeaderSource, /rounded-\[28px\] border border-white\/70 bg-white\/72/)
  assert.doesNotMatch(publicHeaderSource, /inset_0_1px_0\(rgba\(255,255,255/)
  assert.doesNotMatch(publicHeaderSource, /\[mix-blend-mode:difference\]/)
})

test('marketplace mobile listing prices do not render as underlined detected numbers', () => {
  assert.match(vehicleSearchExperienceSource, /listing\.priceLabel/)
  assert.match(vehicleSearchExperienceSource, /font-semibold text-\[#101828\] no-underline \[text-decoration:none\]/)
  assert.match(appLayoutSource, /formatDetection:\s*\{\s*telephone: false,\s*\}/)
})

test('listing detail lookups are uncached so newly published listings do not keep stale 404s', () => {
  assert.match(marketplacePublicDataSource, /export async function getMarketplaceListingForPublicDetail\(id: string\)/)
  assert.doesNotMatch(marketplacePublicDataSource, /public-marketplace-listing-detail-by-id/)
  assert.match(marketplacePublicDataSource, /\.select\(`\$\{marketplacePublicSelect\},insurance_offers`\)/)
  assert.match(marketplacePublicDataSource, /if \(error\) \{/)
  assert.match(marketplacePublicDataSource, /\.select\(marketplacePublicSelect\)/)
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
