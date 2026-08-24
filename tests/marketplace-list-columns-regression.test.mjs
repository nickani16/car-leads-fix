import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const marketplace = readFileSync(new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url), 'utf8')
const listingRow = readFileSync(new URL('../app/components/MarketplaceDesktopListingRow.tsx', import.meta.url), 'utf8')

test('desktop list view can switch between one and two vehicles per row', () => {
  assert.match(marketplace, /desktopListColumns, setDesktopListColumns/)
  assert.match(marketplace, /desktopListColumns === 2 \? 'grid-cols-2' : 'grid-cols-1'/)
  assert.match(marketplace, /compact=\{desktopListColumns === 2\}/)
  assert.match(marketplace, /Show two vehicles per row/)
  assert.match(listingRow, /data-marketplace-listing-layout=\{compact \? 'compact' : 'row'\}/)
  assert.match(listingRow, /grid-rows-\[220px_minmax\(264px,auto\)_36px\]/)
})
