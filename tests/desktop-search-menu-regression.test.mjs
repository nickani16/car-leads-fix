import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const header = readFileSync(new URL('../app/components/PublicHeader.tsx', import.meta.url), 'utf8')
const bodyTypes = readFileSync(new URL('../lib/marketplace-body-types.ts', import.meta.url), 'utf8')
const homeSearch = readFileSync(new URL('../app/components/HomeHeroVehicleSearch.tsx', import.meta.url), 'utf8')
const desktopSearchStart = header.indexOf("if (item.kind === 'search')")
const desktopSearchEnd = header.indexOf("if (item.kind === 'sell')", desktopSearchStart)
const desktopSearchMenu = header.slice(desktopSearchStart, desktopSearchEnd)

test('desktop vehicle search menu is compact, text-only and separated from mobile intent controls', () => {
  assert.ok(desktopSearchStart >= 0 && desktopSearchEnd > desktopSearchStart)
  assert.match(desktopSearchMenu, /w-\[min\(600px,calc\(100vw-2rem\)\)\]/)
  assert.match(desktopSearchMenu, /desktopSearchGroups\.map/)
  assert.match(desktopSearchMenu, /desktopSearchCopy\.viewAll/)
  assert.doesNotMatch(desktopSearchMenu, /searchIntentOptions\.map|role="tablist"/)
  assert.doesNotMatch(desktopSearchMenu, /CategoryIcon|autorellCategoryIcons|<ArrowRight/)

  assert.match(header, /visibleSearchCategoryItems\.map/)
  assert.equal((header.match(/searchIntentOptions\.map/g) || []).length, 0)
})

test('desktop vehicle search menu has explicit copy for every public locale', () => {
  assert.match(header, /const desktopSearchMenuCopy: Record<PublicLocale, DesktopSearchMenuCopy>/)
  for (const locale of ['sv', 'en', 'de', 'at', 'fr', 'es', 'it', 'nl', 'be', 'pl', 'da', 'fi']) {
    assert.match(header, new RegExp(`\\n  ${locale}: \\{`))
  }
})

test('desktop vehicle search menu keeps a focused category set', () => {
  assert.match(header, /slugs: \['cars', 'motorcycles', 'motorhomes', 'caravans'\] as const/)
  assert.match(header, /slugs: \['vans', 'trucks', 'agriculture', 'construction'\] as const/)
  assert.doesNotMatch(desktopSearchMenu, /electric-bikes/)
})

test('desktop categories drill into localized vehicle types inside the same dropdown', () => {
  assert.match(header, /useState<MarketplaceCategorySlug \| null>\(null\)/)
  assert.match(desktopSearchMenu, /desktopSearchCategoryItem && desktopSearchCategory/)
  assert.match(desktopSearchMenu, /setDesktopSearchCategory\(categorySlug \|\| null\)/)
  assert.match(desktopSearchMenu, /setDesktopSearchCategory\(null\)/)
  assert.match(desktopSearchMenu, /desktopSearchBodyTypes\.map/)
  assert.match(desktopSearchMenu, /translateListingVehicleValue\(locale, bodyType\)/)
  assert.match(header, /params\.set\('bodyType', bodyType\)/)
  assert.match(desktopSearchMenu, /<ChevronRight/)
  assert.match(desktopSearchMenu, /<ChevronLeft/)
})

test('desktop drilldown shares the body type source used by the existing home search', () => {
  for (const slug of ['cars', 'vans', 'trucks', 'motorcycles', 'construction', 'motorhomes', 'caravans', 'agriculture', 'electric-bikes']) {
    assert.match(bodyTypes, new RegExp(`\\n  ['"]?${slug}['"]?: \\[`))
  }
  assert.match(homeSearch, /import \{ marketplaceBodyTypeOptions \} from '@\/lib\/marketplace-body-types'/)
  assert.match(homeSearch, /\.\.\.marketplaceBodyTypeOptions\[category\]/)
  assert.doesNotMatch(homeSearch, /const bodyTypeOptions:/)
})
