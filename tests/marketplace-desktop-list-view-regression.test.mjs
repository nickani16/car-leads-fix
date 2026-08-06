import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const vehicleSearchSource = readFileSync(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)
const listingRowSource = readFileSync(
  new URL('../app/components/MarketplaceDesktopListingRow.tsx', import.meta.url),
  'utf8',
)
const viewToggleSource = readFileSync(
  new URL('../app/components/MarketplaceViewToggle.tsx', import.meta.url),
  'utf8',
)
const marketplacePageSource = readFileSync(
  new URL('../app/marketplace/[category]/page.tsx', import.meta.url),
  'utf8',
)
const findCarsPageSource = readFileSync(
  new URL('../app/find-cars/page.tsx', import.meta.url),
  'utf8',
)
const marketplaceViewSource = readFileSync(
  new URL('../lib/marketplace-view.ts', import.meta.url),
  'utf8',
)
const translationsSource = readFileSync(
  new URL('../lib/manual-public-translations.ts', import.meta.url),
  'utf8',
)
const globalCssSource = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')

test('marketplace defaults to map while direct list URLs hydrate list mode', () => {
  assert.match(marketplaceViewSource, /export type MarketplaceViewMode = 'map' \| 'list'/)
  assert.match(marketplaceViewSource, /return normalized === 'list' \? 'list' : 'map'/)
  assert.match(vehicleSearchSource, /initialView = 'map'/)
  assert.match(vehicleSearchSource, /useState<MarketplaceViewMode>\(initialView\)/)
  assert.match(marketplacePageSource, /initialView=\{normalizeMarketplaceView\(getSearchParam\(resolvedSearchParams, 'view'\)\)\}/)
  assert.match(findCarsPageSource, /initialView=\{normalizeMarketplaceView\(getSearchParam\(resolvedSearchParams, 'view'\)\)\}/)
  assert.match(findCarsPageSource, /description: listing\.description \|\| null/)
})

test('view state uses native history without entering the marketplace search request', () => {
  assert.match(vehicleSearchSource, /const marketplaceUrlSearchParams = useMemo/)
  assert.match(vehicleSearchSource, /withMarketplaceView\(marketplaceSearchParams, marketplaceView\)/)
  assert.match(vehicleSearchSource, /new URLSearchParams\(marketplaceSearchParams\)/)
  assert.match(vehicleSearchSource, /window\.history\.pushState\(window\.history\.state, '', nextUrl\)/)
  assert.match(vehicleSearchSource, /window\.addEventListener\('popstate', syncViewFromHistory\)/)
  assert.match(vehicleSearchSource, /new URLSearchParams\(marketplaceSearchParams\)[\s\S]*params\.set\('page'/)
  assert.doesNotMatch(
    vehicleSearchSource.match(/const marketplaceSearchParams = useMemo\([\s\S]*?return params\n  \}, \[/)?.[0] || '',
    /set\('view'/,
  )
})

test('view is presentation-only for SEO canonical URLs', () => {
  assert.match(marketplacePageSource, /const ignored = new Set\(\['view'/)
  assert.match(marketplacePageSource, /canonicalSearchParams\(params\)/)
})

test('desktop list view reuses filters, result state and keeps the map mounted', () => {
  assert.match(vehicleSearchSource, /renderCategoryFilterSections\('sidebar'\)/)
  assert.match(vehicleSearchSource, /renderLocationFilterSection\(true\)/)
  assert.match(vehicleSearchSource, /<MarketplaceDesktopListingRow/)
  assert.match(vehicleSearchSource, /listing=\{listing\}/)
  assert.match(vehicleSearchSource, /<MarketplaceDesktopListSkeleton/)
  assert.match(vehicleSearchSource, /marketplaceView === 'list' \? 'min-\[1024px\]:hidden'/)
  assert.match(vehicleSearchSource, /<VehicleSearchMap[\s\S]*active=\{marketplaceView === 'map' \|\| mobileMapOpen\}/)
  assert.match(vehicleSearchSource, /mapRef\.current\?\.resize\(\), 240/)
})

test('desktop list cards use real listing data, optimized images and existing favourites', () => {
  assert.match(listingRowSource, /import Image from 'next\/image'/)
  assert.match(listingRowSource, /prefetch=\{false\}/)
  assert.match(listingRowSource, /listing\.description/)
  assert.match(listingRowSource, /listing\.operatingHours/)
  assert.match(listingRowSource, /listing\.mileageKm/)
  assert.match(listingRowSource, /<SavedListingButton/)
  assert.match(listingRowSource, /sellerIsTrader/)
  assert.match(listingRowSource, /translatePublic\(locale, 'Private seller'\)/)
  assert.doesNotMatch(listingRowSource, /Bra pris|Good price|Very good price/)
})

test('view toggle and transitions are accessible and reduced-motion aware', () => {
  assert.match(viewToggleSource, /aria-pressed=\{active\}/)
  assert.match(viewToggleSource, /role="group"/)
  assert.match(viewToggleSource, /focus-visible:ring-2/)
  assert.match(globalCssSource, /\.marketplace-view-enter/)
  assert.match(globalCssSource, /animation: marketplace-view-enter 220ms/)
  assert.match(globalCssSource, /@media \(prefers-reduced-motion: reduce\)/)
})

test('new list-view copy is translated for every active translation locale', () => {
  assert.match(translationsSource, /const marketplaceListViewTranslations/)
  assert.match(translationsSource, /const marketplaceListView = marketplaceListViewTranslations\[normalizedLocale\]/)
  for (const locale of ['sv', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'da', 'fi']) {
    const localeBlock = new RegExp(`${locale}: \\{[\\s\\S]*?'Map view':[\\s\\S]*?'List view':[\\s\\S]*?'Clear all filters':[\\s\\S]*?'View listing':[\\s\\S]*?'Load more':`)
    assert.match(translationsSource, localeBlock, `${locale} should include complete list-view copy`)
  }
})

test('desktop list UI stays behind the desktop breakpoint', () => {
  assert.match(vehicleSearchSource, /hidden flex-1 bg-\[#f7f9fc\] min-\[1024px\]:block/)
  assert.match(vehicleSearchSource, /className="hidden shrink-0 min-\[1024px\]:block min-\[1120px\]:hidden">\s*<MarketplaceViewToggle/)
  assert.doesNotMatch(vehicleSearchSource, /className="hidden min-\[1024px\]:inline-flex/)
})
