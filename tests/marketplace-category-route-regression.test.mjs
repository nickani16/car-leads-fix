import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const marketplacePageSource = readFileSync(
  new URL('../app/marketplace/[category]/page.tsx', import.meta.url),
  'utf8',
)
const vehicleSearchSource = readFileSync(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)
const searchSeoSource = readFileSync(
  new URL('../lib/marketplace-search-seo.ts', import.meta.url),
  'utf8',
)
const geoLandingSource = readFileSync(
  new URL('../lib/seo-geo-landings.ts', import.meta.url),
  'utf8',
)
const marketplaceSearchSource = readFileSync(
  new URL('../lib/marketplace-search-v2.ts', import.meta.url),
  'utf8',
)
const findCarsSource = readFileSync(
  new URL('../app/find-cars/page.tsx', import.meta.url),
  'utf8',
)
const categoryHeroSearchSource = readFileSync(
  new URL('../app/components/CategoryHeroSearch.tsx', import.meta.url),
  'utf8',
)
const publicHeaderSource = readFileSync(
  new URL('../app/components/PublicHeader.tsx', import.meta.url),
  'utf8',
)

test('marketplace category changes navigate to the matching localized route', () => {
  assert.match(vehicleSearchSource, /import \{ useRouter \} from 'next\/navigation'/)
  assert.match(vehicleSearchSource, /syncCategoryRoute = false/)
  assert.match(vehicleSearchSource, /categoryRouteSyncArmedRef = useRef\(false\)/)
  assert.match(vehicleSearchSource, /categoryRouteSyncArmedRef\.current = true/)
  assert.match(vehicleSearchSource, /localizePublicHref\(locale, `\/marketplace\/\$\{routeCategory\}`\)/)
  assert.match(vehicleSearchSource, /router\.replace\(nextUrl, \{ scroll: false \}\)/)
  assert.match(vehicleSearchSource, /browserSearchParams\.delete\('categories'\)/)
})

test('legacy path and category query mismatches redirect before rendering', () => {
  assert.match(marketplacePageSource, /getExplicitMarketplaceCategory\(resolvedSearchParams\)/)
  assert.match(marketplacePageSource, /explicitCategory \|\| normalizedRouteCategory !== requestedCategory/)
  assert.match(marketplacePageSource, /permanentRedirect\(getMarketplaceCategoryRedirectHref/)
  assert.match(marketplacePageSource, /localizePublicHref\(locale, `\/marketplace\/\$\{category\}`\)/)
  assert.match(marketplacePageSource, /key === 'categories'/)
})

test('metadata follows an explicit category while an old URL is being canonicalized', () => {
  assert.match(marketplacePageSource, /const requestedMetadataCategory = explicitCategory \|\| requestedCategory/)
  assert.match(marketplacePageSource, /metadataMode === 'leasing'/)
  assert.match(marketplacePageSource, /!isLeasingMarketplaceCategory\(requestedMetadataCategory\)/)
  assert.match(marketplacePageSource, /getMarketplaceCategory\(metadataCategory\)/)
  assert.match(marketplacePageSource, /syncCategoryRoute=\{!seoLanding\}/)
})

test('sale and leasing modes stay aligned across URL state, search results and metadata', () => {
  assert.match(searchSeoSource, /export function resolveMarketplaceSearchMode/)
  assert.match(searchSeoSource, /export function applyMarketplaceSearchModeParams/)
  assert.match(marketplacePageSource, /resolveMarketplaceSearchMode\(\{/)
  assert.match(findCarsSource, /resolveMarketplaceSearchMode\(\{/)
  assert.match(marketplacePageSource, /getMarketplaceSearchSeo\(\{/)
  assert.match(findCarsSource, /getMarketplaceSearchSeo\(\{/)
  assert.match(findCarsSource, /mode === 'leasing' && requestedCategory !== 'vehicles'/)
  assert.match(findCarsSource, /!isLeasingMarketplaceCategory\(requestedCategory\)/)
  assert.match(findCarsSource, /syncCategoryRoute/)
  assert.match(marketplacePageSource, /metadataMode === 'leasing'/)
  assert.match(vehicleSearchSource, /seoRouteSyncArmedRef\.current = true/)
  assert.match(vehicleSearchSource, /changeMarketplaceMode/)
  assert.match(vehicleSearchSource, /setLeasingPossible\(false\)/)
  assert.match(vehicleSearchSource, /applyMarketplaceSearchModeParams\(params, mode\)/)
  assert.match(vehicleSearchSource, /router\.replace\(nextUrl, \{ scroll: false \}\)/)
  assert.match(vehicleSearchSource, /syncDocumentTitle\(marketplaceSeo\.title\)/)
  assert.match(vehicleSearchSource, /if \(document\.title !== title\) document\.title = title/)
  assert.match(vehicleSearchSource, /const \[primary, \.\.\.duplicates\] = elements/)
  assert.match(vehicleSearchSource, /if \(primary\.content !== content\) primary\.content = content/)
  assert.match(vehicleSearchSource, /duplicates\.forEach\(\(element\) => element\.remove\(\)\)/)
  assert.match(vehicleSearchSource, /new MutationObserver\(syncMetadata\)/)
  assert.match(vehicleSearchSource, /listing\.offerType === 'sale_and_lease'/)
  assert.match(marketplaceSearchSource, /\['sale', 'sale_and_lease'\]/)
  assert.match(marketplaceSearchSource, /\['lease', 'sale_and_lease'\]/)
  assert.match(geoLandingSource, /landing\.leasing \? 'lease' : 'sale'/)
  assert.match(categoryHeroSearchSource, /params\.set\('mode', 'sale'\)/)
  assert.match(categoryHeroSearchSource, /params\.set\('offerType', 'sale'\)/)
  assert.match(publicHeaderSource, /marketplaceMode\?: MarketplaceSearchMode/)
  assert.match(publicHeaderSource, /applyMarketplaceSearchModeParams\(params, searchMenuIntent\)/)
  assert.match(marketplacePageSource, /marketplaceMode=\{requestedMode\}/)
  assert.match(findCarsSource, /marketplaceMode=\{getSearchMode\(resolvedSearchParams\)\}/)
})

test('marketplace SEO provides sale, leasing and neutral copy for every active locale', () => {
  for (const locale of ['sv', 'de', 'fr', 'es', 'it', 'pl', 'nl', 'da', 'fi']) {
    assert.match(searchSeoSource, new RegExp(`case '${locale}'`), `${locale} SEO copy is missing`)
  }
  assert.match(searchSeoSource, /mode === 'leasing'/)
  assert.match(searchSeoSource, /mode === 'sale'/)
  assert.match(searchSeoSource, /K\\u00f6p eller leasa/)
  assert.match(searchSeoSource, /kaufen oder leasen/)
  assert.match(searchSeoSource, /myyntiin tai leasingiin/)
  assert.match(searchSeoSource, /fitSeoTitle\(copy\.title\)/)
  assert.match(searchSeoSource, /cleanSeoText\(copy\.description, 150\)/)
  assert.match(searchSeoSource, /locale === 'at' \? 'de'/)
  assert.match(searchSeoSource, /locale === 'be' \? 'nl'/)
})

test('clean sitemap landing pages use leasing-specific copy and localized category paths', () => {
  assert.match(geoLandingSource, /Boolean\(categoryRoute\.leasing\)/)
  assert.match(geoLandingSource, /buildLocalizedLeasingSeoCopy/)
  assert.match(geoLandingSource, /Boolean\(route\.leasing\) === leasing/)
  assert.match(geoLandingSource, /leasingannonser/)
  assert.match(geoLandingSource, /Leasingangebote/)
  assert.match(geoLandingSource, /leaseaanbiedingen/)
  for (const market of ['se', 'de', 'at', 'fr', 'it', 'es', 'nl', 'be', 'pl', 'dk', 'fi']) {
    assert.match(geoLandingSource, new RegExp(`\\b${market}:`), `${market} needs localized sale and leasing SEO`)
  }
  for (const category of ['cars', 'vans', 'trucks', 'agriculture', 'construction']) {
    assert.ok(
      geoLandingSource.split(`leasingCategory('${category}'`).length >= 10,
      `${category} needs a leasing path in all 11 markets`,
    )
  }
  assert.match(geoLandingSource, /de: deMarket\('de', 'DE'\)/)
  assert.match(geoLandingSource, /at: deMarket\('at', 'AT'\)/)
  assert.match(geoLandingSource, /nl: nlMarket\('nl', 'NL'\)/)
  assert.match(geoLandingSource, /be: nlMarket\('be', 'BE'\)/)
})
