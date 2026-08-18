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
const findCarsPageSource = readFileSync(
  new URL('../app/find-cars/page.tsx', import.meta.url),
  'utf8',
)

test('desktop list view keeps one listing per row and uses the current marketplace shell', () => {
  assert.match(experienceSource, /type DesktopMarketplaceView = 'map' \| 'list'/)
  assert.match(experienceSource, /useState<DesktopMarketplaceView>\('map'\)/)
  assert.match(experienceSource, /desktopMarketplaceView === 'list'/)
  assert.match(experienceSource, /data-marketplace-list-sidebar/)
  assert.match(experienceSource, /data-marketplace-list-empty/)
  assert.match(experienceSource, /density="sidebar"/)
  assert.doesNotMatch(experienceSource, /<MarketplaceDesktopListingRow/)
  assert.doesNotMatch(experienceSource, /layout="desktopCard"/)
  assert.doesNotMatch(experienceSource, /grid max-w-\[920px\] grid-cols-2/)
  assert.match(experienceSource, /max-w-\[1180px\] overflow-hidden rounded-\[8px\] border border-\[#d6dde8\] bg-white/)
  assert.match(experienceSource, /onShowDesktopList=\{\(\) => setDesktopMarketplaceView\('list'\)\}/)
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

test('desktop list cards expose mapped vehicle, seller and action data without desktop card layout', () => {
  for (const field of [
    'listing.title',
    'listing.priceLabel',
    'listing.mileageKm',
    'listing.fuelType',
    'listing.gearbox',
    'listing.sellerName',
    'listing.sellerRatingAverage',
    'listing.imageUrls',
  ]) {
    assert.ok(experienceSource.includes(field), `${field} should be represented in the marketplace result cards`)
  }

  assert.match(experienceSource, /<ListingCardImageCarousel/)
  assert.match(experienceSource, /<SavedListingButton/)
  assert.match(experienceSource, /aria-pressed=\{compareActive\}/)
  assert.match(experienceSource, /buildListingPath/)
  assert.match(experienceSource, /<MetaSeparatorList/)
  assert.match(experienceSource, /sellerTypeLabel/)
  assert.match(experienceSource, /shouldShowListingCountryChip/)
  assert.match(experienceSource, /sm:grid-cols-\[260px_minmax\(0,1fr\)\] sm:items-start/)
  assert.match(experienceSource, /grid-cols-\[286px_minmax\(0,1fr\)\]/)
  assert.match(experienceSource, /icon=\{<Scale/)
  assert.match(experienceSource, /icon=\{<Layers/)
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
