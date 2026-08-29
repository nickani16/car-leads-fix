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
