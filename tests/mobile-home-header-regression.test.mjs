import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const headerSource = readFileSync(
  new URL('../app/components/PublicHeader.tsx', import.meta.url),
  'utf8',
)

test('homepage category URLs do not activate the legacy mobile category subnavigation', () => {
  assert.doesNotMatch(headerSource, /homepageCategoryFromPath/)
  assert.match(
    headerSource,
    /unprefixedPathname === `\/marketplace\/\$\{category\.slug\}`,[\s\S]*?\)\?\.slug \|\| null/,
  )
  assert.match(
    headerSource,
    /Boolean\(categoryPrimaryLinks\) && !isMarketplaceResults && !isListingDetail/,
  )
})

test('the normal mobile header row has a visible gray bottom divider', () => {
  assert.match(
    headerSource,
    /data-mobile-header-divider[\s\S]*?absolute inset-x-0 top-\[55px\] h-px bg-\[#d0d5dd\] min-\[1120px\]:hidden/,
  )
  assert.doesNotMatch(headerSource, /h-\[56px\][^\n]+border-b border-\[#deddd8\]/)
})

test('the fixed mobile header layer has its own visible gray bottom divider', () => {
  assert.match(
    headerSource,
    /data-mobile-visible-header[\s\S]*?z-\[130\] h-\[56px\][^\n]+border-b border-\[#e4e7ec\]/,
  )
  assert.doesNotMatch(
    headerSource,
    /data-mobile-menu-divider[^\n]+-mt-5[^\n]+bg-\[#e4e7ec\]/,
  )
})
