import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const experienceSource = readFileSync(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)
const listRowSource = readFileSync(
  new URL('../app/components/MarketplaceDesktopListingRow.tsx', import.meta.url),
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

test('desktop list view extends the current marketplace instead of restoring a parallel layout', () => {
  assert.match(experienceSource, /type DesktopMarketplaceView = 'map' \| 'list'/)
  assert.match(experienceSource, /useState<DesktopMarketplaceView>\('map'\)/)
  assert.match(experienceSource, /desktopMarketplaceView === 'list'/)
  assert.match(experienceSource, /data-marketplace-list-sidebar/)
  assert.match(experienceSource, /density="sidebar"/)
  assert.match(experienceSource, /<MarketplaceDesktopListingRow/)
  assert.match(experienceSource, /onShowDesktopList=\{\(\) => setDesktopMarketplaceView\('list'\)\}/)
  assert.match(experienceSource, /setDesktopMarketplaceView\('map'\)/)
  assert.match(experienceSource, /min-\[1120px\]:!hidden/)
  assert.doesNotMatch(experienceSource, /setFullscreen|<Expand|translatePublic\(locale, 'Fullscreen'\)/)
})

test('desktop list shell has explicit copy for every public locale', () => {
  assert.match(experienceSource, /const desktopListShellCopy: Record<PublicLocale, DesktopListShellCopy>/)
  for (const locale of ['en', 'sv', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(experienceSource, new RegExp(`\\n  ${locale}: desktopList`))
  }
  assert.match(experienceSource, /showMap: 'Visa karta'/)
  assert.match(experienceSource, /showMap: 'Karte anzeigen'/)
  assert.match(experienceSource, /showMap: 'Afficher la carte'/)
})

test('desktop list rows expose mapped vehicle, seller and action data', () => {
  for (const field of [
    'listing.title',
    'listing.priceLabel',
    'listing.description',
    'listing.mileageKm',
    'listing.operatingHours',
    'listing.fuelType',
    'listing.gearbox',
    'listing.bodyType',
    'listing.condition',
    'listing.color',
    'listing.sellerName',
    'listing.sellerRatingAverage',
    'listing.imageUrls',
  ]) {
    assert.ok(listRowSource.includes(field), `${field} should be represented in the desktop list row`)
  }

  assert.match(listRowSource, /<ListingCardImageCarousel/)
  assert.match(listRowSource, /<SavedListingButton/)
  assert.match(listRowSource, /aria-pressed=\{compareActive\}/)
  assert.match(listRowSource, /buildListingPath/)
  assert.match(listRowSource, /const desktopListCopy: Record<PublicLocale, DesktopListCopy>/)
  assert.match(listRowSource, /label: copy\.operatingHours/)
  assert.match(listRowSource, /label: copy\.fuel/)
  assert.match(listRowSource, /label: copy\.gearbox/)
  assert.match(listRowSource, /data-marketplace-listing-row/)
  assert.match(listRowSource, /grid-cols-\[minmax\(270px,306px\)_minmax\(0,1fr\)\]/)
  assert.match(listRowSource, /equipmentChips\.slice\(0, 3\)/)
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
