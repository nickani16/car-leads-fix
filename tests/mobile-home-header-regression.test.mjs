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
    /h-\[56px\][^\n]+border-b border-\[#deddd8\][^\n]+min-\[1120px\]:border-b-0/,
  )
})
