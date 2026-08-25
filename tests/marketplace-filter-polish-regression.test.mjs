import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('every desktop marketplace Apply button renders at font weight 500', () => {
  const experience = read('app/components/VehicleSearchExperience.tsx')
  const applyButtons = experience.match(/<button data-marketplace-apply[^>]*font-medium[^>]*>/g) || []

  assert.equal(applyButtons.length, 6)
  assert.match(experience, /\[&_button\[data-marketplace-apply\]\]:!font-medium/)
})

test('marketplace country controls and list results use text without flags', () => {
  for (const file of [
    'app/components/VehicleSearchExperience.tsx',
    'app/components/MarketplaceDesktopListingRow.tsx',
    'app/components/MarketplaceSearch.tsx',
    'app/components/MarketplaceCategoryBrowser.tsx',
  ]) {
    assert.doesNotMatch(read(file), /CountryFlag/)
  }
})
