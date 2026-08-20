import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const experienceSource = readFileSync(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)
const marketplacePageSource = readFileSync(
  new URL('../app/marketplace/[category]/page.tsx', import.meta.url),
  'utf8',
)
const desktopListingRowSource = readFileSync(
  new URL('../app/components/MarketplaceDesktopListingRow.tsx', import.meta.url),
  'utf8',
)
const findCarsPageSource = readFileSync(
  new URL('../app/find-cars/page.tsx', import.meta.url),
  'utf8',
)

test('desktop list view keeps one listing per row and uses the current marketplace shell', () => {
  assert.match(experienceSource, /type DesktopMarketplaceView = 'map' \| 'list'/)
  assert.match(experienceSource, /useState<DesktopMarketplaceView>\(initialPage > 1 \? 'list' : 'map'\)/)
  assert.match(experienceSource, /desktopMarketplaceView === 'list'/)
  assert.match(experienceSource, /data-marketplace-list-sidebar/)
  assert.match(experienceSource, /data-marketplace-list-empty/)
  assert.match(experienceSource, /density="sidebar"/)
  assert.match(experienceSource, /<MarketplaceDesktopListingRow/)
  assert.doesNotMatch(experienceSource, /layout="desktopCard"/)
  assert.doesNotMatch(experienceSource, /grid max-w-\[920px\] grid-cols-2/)
  assert.match(experienceSource, /max-w-\[1320px\]/)
  assert.match(experienceSource, /onShowDesktopList=\{\(\) => \{/)
  assert.match(experienceSource, /setDesktopMarketplaceView\('map'\)/)
  assert.match(experienceSource, /min-\[1120px\]:!hidden/)
  assert.doesNotMatch(experienceSource, /setFullscreen|<Expand|translatePublic\(locale, 'Fullscreen'\)/)
})

test('desktop list sidebar follows a flat Blocket-style filter structure', () => {
  assert.match(experienceSource, /className="flex min-h-0 flex-col border-r border-\[#d7dde7\] bg-white"/)
  assert.match(experienceSource, /sidebar\s*\? 'border-b border-\[#e4e7ec\] bg-white last:border-b-0'/)
  assert.match(experienceSource, /sidebar \? 'min-h-\[48px\] px-1 py-2'/)
  assert.match(experienceSource, /sidebar \? 'hidden' : 'grid'/)
  assert.match(experienceSource, /summary && !sidebar/)
  assert.doesNotMatch(experienceSource, /mb-2 overflow-hidden rounded-\[8px\] border bg-white/)
  assert.match(experienceSource, /onChange=\{\(event\) => changeMarketplaceMode\(event\.target\.value as SearchMode\)\}/)
  assert.doesNotMatch(experienceSource, /grid grid-cols-3 rounded-\[9px\]/)
})

test('desktop list shell has explicit copy for every public locale', () => {
  assert.match(experienceSource, /const desktopListShellCopy: Record<PublicLocale, DesktopListShellCopy>/)
  for (const locale of ['en', 'sv', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(experienceSource, new RegExp(`\n  ${locale}: desktopList`))
  }
  assert.match(experienceSource, /showMap: 'Visa karta'/)
  assert.match(experienceSource, /showMap: 'Karte anzeigen'/)
  assert.match(experienceSource, /showMap: 'Afficher la carte'/)
})

test('desktop list cards keep the image full-height and reserve the price column for price and save action', () => {
  for (const field of [
    'listing.title',
    'listing.priceLabel',
    'listing.mileageKm',
    'listing.fuelType',
    'listing.gearbox',
    'listing.imageUrls',
  ]) {
    assert.ok(desktopListingRowSource.includes(field), `${field} should be represented in desktop marketplace rows`)
  }

  assert.match(desktopListingRowSource, /<ListingCardImageCarousel/)
  assert.match(desktopListingRowSource, /<SavedListingButton/)
  assert.match(desktopListingRowSource, /className="absolute right-3\.5 top-3/)
  assert.match(desktopListingRowSource, /className="absolute inset-0 overflow-hidden bg-white"/)
  assert.doesNotMatch(desktopListingRowSource, /sellerLogoUrl/)
  assert.doesNotMatch(desktopListingRowSource, /sellerRatingAverage/)
  assert.doesNotMatch(desktopListingRowSource, /location \|\| sellerLabel/)
  assert.match(desktopListingRowSource, /aria-pressed=\{compareActive\}/)
  assert.match(desktopListingRowSource, /buildListingPath/)
  assert.match(experienceSource, /<MetaSeparatorList/)
  assert.match(experienceSource, /sellerTypeLabel/)
  assert.match(experienceSource, /shouldShowListingCountryChip/)
  assert.match(experienceSource, /sm:grid-cols-\[260px_minmax\(0,1fr\)\] sm:items-start/)
  assert.match(experienceSource, /grid-cols-\[286px_minmax\(0,1fr\)\]/)
  assert.match(experienceSource, /min-\[1120px\]:my-4/)
  assert.match(experienceSource, /flex min-h-9 items-center gap-3/)
  assert.match(desktopListingRowSource, /grid-cols-\[260px_minmax\(0,1fr\)_184px\]/)
  assert.match(experienceSource, /icon=\{<Scale/)
  assert.match(experienceSource, /icon=\{<Layers/)
})

test('desktop location filtering uses the shared market hierarchy and scopes municipalities to the selected region', () => {
  assert.match(experienceSource, /getMarketplaceCountryLocations,[\s\S]*inferMarketplaceLocation/)
  assert.match(experienceSource, /function normalizeMarketplaceLocationSelection/)
  assert.match(experienceSource, /const inferredOptionLocations = useMemo/)
  assert.match(experienceSource, /<LocationHierarchyFilter/)
  assert.match(experienceSource, /aria-pressed=\{selected\}/)
  assert.match(experienceSource, /municipalityOptions\.map/)
  assert.match(experienceSource, /setMunicipality\(''\)/)
  assert.doesNotMatch(experienceSource, /label: `\$\{municipality\} kommun`/)
})

test('desktop range controls keep their handles inside the sidebar', () => {
  assert.match(experienceSource, /className="relative mx-2 h-8 touch-none"/)
  assert.match(experienceSource, /top-1\/2 z-20 h-\[18px\] w-\[18px\]/)
  assert.match(experienceSource, /top-1\/2 z-30 h-\[18px\] w-\[18px\]/)
})

test('desktop list pagination is API-backed and preserved in browser history', () => {
  assert.match(experienceSource, /params\.set\('page', String\(searchPage\)\)/)
  assert.match(experienceSource, /desktopMarketplaceView === 'list' \? '24' : '48'/)
  assert.match(experienceSource, /<MarketplacePagination/)
  assert.match(experienceSource, /nextUrl\.searchParams\.set\('page', String\(nextPage\)\)/)
  assert.match(experienceSource, /window\.addEventListener\('popstate', handlePopState\)/)
  assert.match(marketplacePageSource, /initialPage=\{Math\.max\(1,/)
})

test('mobile card and mobile map flows remain available while list mode stays desktop-only', () => {
  assert.match(experienceSource, /min-\[1120px\]:block/)
  assert.match(experienceSource, /<VehicleResultCard/)
  assert.match(experienceSource, /mobileMapOpen/)
  assert.match(experienceSource, /mobileOverlay \? \(/)
  assert.match(experienceSource, /translatePublic\(locale, 'Show list'\)/)
})

test('description is mapped for initial server results and subsequent API searches', () => {
  assert.match(experienceSource, /description: stringOrNull\(listing\.description\)/)
  assert.match(marketplacePageSource, /description: listing\.description/)
  assert.match(findCarsPageSource, /description: listing\.description/)
})
