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
const publicHeaderSource = readFileSync(
  new URL('../app/components/PublicHeader.tsx', import.meta.url),
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
  assert.match(experienceSource, /max-w-\[1170px\]/)
  assert.match(experienceSource, /2xl:max-w-\[1320px\]/)
  assert.match(experienceSource, /onShowDesktopList=\{\(\) => \{/)
  assert.match(experienceSource, /setDesktopMarketplaceView\('map'\)/)
  assert.match(experienceSource, /min-\[1120px\]:!hidden/)
  assert.doesNotMatch(experienceSource, /setFullscreen|<Expand|translatePublic\(locale, 'Fullscreen'\)/)
})

test('desktop list sidebar follows a flat filter structure', () => {
  assert.match(experienceSource, /className="flex min-h-0 self-start flex-col bg-white"/)
  assert.doesNotMatch(experienceSource, /data-marketplace-list-sidebar[\s\S]{0,180}overflow-hidden rounded-\[7px\] border/)
  assert.match(experienceSource, /className="my-4 rounded-\[7px\] border border-\[#d7dde7\] bg-white/)
  assert.match(experienceSource, /sidebar\s*\? 'border-b border-\[#e4e7ec\] bg-white last:border-b-0'/)
  assert.match(experienceSource, /sidebar \? 'min-h-\[48px\] px-1 py-2'/)
  assert.match(experienceSource, /sidebar \? 'hidden' : 'grid'/)
  assert.match(experienceSource, /summary && !sidebar/)
  assert.doesNotMatch(experienceSource, /mb-2 overflow-hidden rounded-\[8px\] border bg-white/)
  assert.match(experienceSource, /role="radiogroup" aria-label=\{desktopListText\.offerType\}/)
  assert.match(experienceSource, /onChange=\{\(\) => changeMarketplaceMode\(option\)\}/)
  assert.match(experienceSource, /<SearchableSidebarOptions/)
  assert.match(experienceSource, /data-marketplace-list-breadcrumbs/)
  assert.match(experienceSource, /data-marketplace-list-active-filters/)
  assert.doesNotMatch(experienceSource, /grid grid-cols-3 rounded-\[9px\]/)
})

test('desktop list shell has explicit copy for every public locale', () => {
  assert.match(experienceSource, /const desktopListShellCopy: Record<PublicLocale, DesktopListShellCopy>/)
  assert.match(experienceSource, /const listViewExtraCopy: Record<PublicLocale, ListViewExtraCopy>/)
  for (const locale of ['en', 'sv', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(experienceSource, new RegExp(`\n  ${locale}: desktopList`))
    assert.match(experienceSource, new RegExp(`\n  ${locale}: \\{ typeLabel:`))
  }
  assert.match(experienceSource, /showMap: 'Visa karta'/)
  assert.match(experienceSource, /showMap: 'Karte anzeigen'/)
  assert.match(experienceSource, /showMap: 'Afficher la carte'/)
})

test('desktop list cards use a wide image, seller row and listing actions', () => {
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
  assert.match(desktopListingRowSource, /className="absolute right-4 top-4 !h-10 !w-10/)
  assert.match(desktopListingRowSource, /className="absolute inset-0 overflow-hidden bg-white"/)
  assert.doesNotMatch(desktopListingRowSource, /showDotsOnDesktop/)
  assert.doesNotMatch(desktopListingRowSource, /\{listing\.description\}/)
  assert.match(desktopListingRowSource, /const sellerLabel = listing\.sellerIsTrader \? copy\.businessSeller : copy\.privateSeller/)
  assert.match(desktopListingRowSource, /\{offerBadge\.label\}/)
  assert.match(desktopListingRowSource, /<h2[\s\S]*?\{listing\.title\}[\s\S]*?\{offerBadge\.label\}/)
  assert.match(desktopListingRowSource, /listing\.sellerName \|\| sellerLabel/)
  assert.match(desktopListingRowSource, /const detailStripItems = \[/)
  assert.match(desktopListingRowSource, /\.\.\.equipmentChips/)
  assert.match(desktopListingRowSource, /detailStripItems\.join\('\s\|\s'\)/)
  assert.match(desktopListingRowSource, /grid-rows-\[minmax\(214px,auto\)_36px\]/)
  assert.match(desktopListingRowSource, /col-span-2 flex min-w-0 items-start overflow-hidden border-t/)
  assert.match(desktopListingRowSource, /\{copy\.showMoreEquipment\}/)
  assert.match(desktopListingRowSource, /\{copy\.vatIncluded\}/)
  assert.match(desktopListingRowSource, /sellerLogoUrl/)
  assert.match(desktopListingRowSource, /listing\.sellerName/)
  assert.match(desktopListingRowSource, /contactListingLabel/)
  assert.doesNotMatch(desktopListingRowSource, /sellerRatingAverage/)
  assert.doesNotMatch(desktopListingRowSource, /location \|\| sellerLabel/)
  assert.match(desktopListingRowSource, /aria-pressed=\{compareActive\}/)
  assert.match(desktopListingRowSource, /buildListingPath/)
  assert.match(experienceSource, /<MetaSeparatorList/)
  assert.match(experienceSource, /sellerTypeLabel/)
  assert.match(experienceSource, /shouldShowListingCountryChip/)
  assert.match(experienceSource, /sm:grid-cols-\[260px_minmax\(0,1fr\)\] sm:items-start/)
  assert.match(experienceSource, /grid-cols-\[320px_minmax\(0,1fr\)\]/)
  assert.match(experienceSource, /min-\[1120px\]:overflow-visible/)
  assert.match(experienceSource, /flex min-h-12 items-start gap-3/)
  assert.match(desktopListingRowSource, /grid-cols-\[minmax\(280px,34%\)_minmax\(0,1fr\)\]/)
  assert.match(experienceSource, /icon=\{<Scale/)
  assert.match(experienceSource, /icon=\{<Layers/)
})

test('marketplace dialogs keep one blue scroll container and align the desktop filter rail', () => {
  assert.match(experienceSource, /marketplace-scrollbar max-h-\[calc\(min\(74vh,560px\)-65px\)\] overflow-y-auto/)
  assert.doesNotMatch(experienceSource, /grid max-h-\[(?:420|360)px\] gap-1 overflow-y-auto/)
  assert.match(experienceSource, /placement === 'mobile' \? 'relative top-\[3px\] items-center' : 'items-start'/)
  assert.match(experienceSource, /'marketplace-scrollbar min-w-0 flex-1 overflow-x-auto/)
})

test('desktop list row provides equipment overflow and VAT copy for every public locale', () => {
  for (const locale of ['en', 'sv', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(
      desktopListingRowSource,
      new RegExp(`\\n  ${locale}: \\{[\\s\\S]*?showMoreEquipment:[\\s\\S]*?vatIncluded:`),
    )
  }
  for (const vatLabel of ['incl. VAT', 'inkl. moms', 'inkl. MwSt.', 'incl. btw', 'TVA incluse', 'IVA incluido', 'IVA inclusa', 'z VAT', 'sis. ALV']) {
    assert.ok(desktopListingRowSource.includes(vatLabel), `${vatLabel} should be localized in desktop list rows`)
  }
})

test('map and mobile split results use the same compact card structure as the homepage', () => {
  assert.match(experienceSource, /grid grid-cols-2 gap-3 p-3/)
  assert.match(experienceSource, /function marketplaceCardHeadline/)
  assert.match(experienceSource, /function marketplaceCardVersionLabel/)
  assert.match(experienceSource, /showDotsOnDesktop/)
  assert.match(experienceSource, /rounded-\[8px\] border border-\[#d7dee8\] bg-white/)
  assert.match(experienceSource, /details\.join\('\s\|\s'\)/)
  assert.match(experienceSource, /sellerDetail = listing\.sellerIsTrader \? listing\.sellerName\.trim\(\) : ''/)
  assert.match(experienceSource, /const visibleEquipmentChips = equipmentChips\.slice\(0, 4\)/)
  assert.match(experienceSource, /max-h-\[58px\][^\n]*overflow-hidden/)
  assert.match(experienceSource, /remainingEquipmentCount/)
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

test('desktop list search is compact and uses the short localized search label', () => {
  assert.match(experienceSource, /renderMarketplaceSearchInput\('', true, translatePublic\(locale, 'Search'\)\)/)
  assert.match(experienceSource, /compact \? 'min-h-\[44px\] py-1'/)
  assert.match(experienceSource, /placeholder:font-normal placeholder:text-\[#767676\]/)
  assert.match(experienceSource, /placeholder:font-normal placeholder:text-\[#98a2b3\]/)
})

test('desktop list controls remain legible across translated labels', () => {
  assert.match(experienceSource, /locale === 'de' \|\| locale === 'at'/)
  assert.match(experienceSource, /flex h-9 min-w-\[250px\] shrink-0 items-center/)
  assert.match(experienceSource, /style=\{\{ gridTemplateColumns: 'minmax\(0, 1fr\)' \}\}/)
  assert.match(experienceSource, /data-marketplace-list-year-filter/)
  assert.match(experienceSource, /grid min-w-0 w-full grid-cols-1 gap-2/)
  assert.doesNotMatch(experienceSource, /pl-\[68px\]/)
})

test('mobile bottom navigation and marketplace shortcuts do not render drop shadows', () => {
  const shortcutBlock = experienceSource.slice(
    experienceSource.indexOf('data-autorell-floating-shortcuts-tone'),
    experienceSource.indexOf('{compareOpen && compareListings.length >= 2'),
  )
  const mobileNavBlock = publicHeaderSource.slice(
    publicHeaderSource.indexOf('data-autorell-mobile-nav-tone'),
    publicHeaderSource.indexOf('<MarketSelectorModal'),
  )

  assert.doesNotMatch(shortcutBlock, /shadow-\[/)
  assert.doesNotMatch(mobileNavBlock, /shadow-\[/)
})
