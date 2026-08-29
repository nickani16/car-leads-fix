import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const header = readFileSync(new URL('../app/components/PublicHeader.tsx', import.meta.url), 'utf8')
const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
const bodyTypes = readFileSync(new URL('../lib/marketplace-body-types.ts', import.meta.url), 'utf8')
const homeSearch = readFileSync(new URL('../app/components/HomeHeroVehicleSearch.tsx', import.meta.url), 'utf8')
const desktopSearchStart = header.indexOf("if (item.kind === 'search')")
const desktopSearchEnd = header.indexOf("if (item.kind === 'sell')", desktopSearchStart)
const desktopSearchMenu = header.slice(desktopSearchStart, desktopSearchEnd)

test('desktop vehicle search menu keeps focused categories and a visual bikes panel', () => {
  assert.ok(desktopSearchStart >= 0 && desktopSearchEnd > desktopSearchStart)
  assert.match(desktopSearchMenu, /w-\[min\(600px,calc\(100vw-2rem\)\)\]/)
  assert.match(desktopSearchMenu, /w-\[min\(880px,calc\(100vw-2rem\)\)\]/)
  assert.match(desktopSearchMenu, /desktopSearchGroups\.map/)
  assert.doesNotMatch(desktopSearchMenu, /desktopSearchCopy\.viewAll/)
  assert.match(desktopSearchMenu, /vehicle-menu-bikes\.webp/)
  assert.match(desktopSearchMenu, /<Image/)
  assert.ok(existsSync(new URL('../public/vehicle-menu-bikes.webp', import.meta.url)))
  assert.doesNotMatch(desktopSearchMenu, /searchIntentOptions\.map|role="tablist"/)
  assert.doesNotMatch(desktopSearchMenu, /CategoryIcon|autorellCategoryIcons/)

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
  assert.doesNotMatch(desktopSearchMenu, /overflow-y-auto|scrollbar-width:thin/)
  assert.match(desktopSearchMenu, /publicLabel\('Sustainable mobility', 'Hållbar mobilitet', 'Nachhaltige Mobilität'\)/)
  assert.match(desktopSearchMenu, /brightness-\[1\.1\]/)
})

test('the active marketplace category stays highlighted in desktop and mobile menus', () => {
  assert.match(desktopSearchMenu, /aria-current=\{isCategoryActive \? 'page' : undefined\}/)
  assert.match(desktopSearchMenu, /isCategoryActive \? 'bg-\[#f5f7fa\]'/)
  assert.match(desktopSearchMenu, /isCategoryActive[\s\S]*'text-\[#0866ff\]'/)
  assert.match(header, /aria-current=\{isActive \? 'page' : undefined\}/)
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

test('desktop category labels lead to all vehicles while the separate arrow opens vehicle types', () => {
  assert.match(desktopSearchMenu, /href=\{categoryHref\}/)
  assert.match(desktopSearchMenu, /handleInternalNavigation\(event, categoryHref\)/)
  assert.match(desktopSearchMenu, /aria-label=\{`\$\{categoryLabel\}: \$\{desktopSearchCopy\.browseTypes\}`\}/)
  assert.match(desktopSearchMenu, /setDesktopSearchCategory\(categorySlug \|\| null\)/)
})

test('desktop category navigation uses blue titles and directional reduced-motion-safe transitions', () => {
  assert.equal((desktopSearchMenu.match(/text-\[#0866ff\]/g) || []).length >= 4, true)
  assert.match(header, /useState<'idle' \| 'forward' \| 'back'>\('idle'\)/)
  assert.match(desktopSearchMenu, /setDesktopSearchMotion\('forward'\)/)
  assert.match(desktopSearchMenu, /setDesktopSearchMotion\('back'\)/)
  assert.match(desktopSearchMenu, /autorell-desktop-search-forward/)
  assert.match(desktopSearchMenu, /autorell-desktop-search-back/)
  assert.match(globals, /@keyframes autorell-desktop-search-forward/)
  assert.match(globals, /translate3d\(24px, 0, 0\)/)
  assert.match(globals, /@keyframes autorell-desktop-search-back/)
  assert.match(globals, /translate3d\(-24px, 0, 0\)/)
  assert.match(globals, /@media \(prefers-reduced-motion: reduce\)/)
})

test('desktop drilldown shares the body type source used by the existing home search', () => {
  for (const slug of ['cars', 'vans', 'trucks', 'motorcycles', 'construction', 'motorhomes', 'caravans', 'agriculture', 'electric-bikes']) {
    assert.match(bodyTypes, new RegExp(`\\n  ['"]?${slug}['"]?: \\[`))
  }
  assert.match(homeSearch, /import \{ marketplaceBodyTypeOptions \} from '@\/lib\/marketplace-body-types'/)
  assert.match(homeSearch, /\.\.\.marketplaceBodyTypeOptions\[category\]/)
  assert.doesNotMatch(homeSearch, /const bodyTypeOptions:/)
})
