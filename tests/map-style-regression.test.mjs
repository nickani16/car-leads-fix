import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const mapStyleSource = await readFile(new URL('../lib/map-style.ts', import.meta.url), 'utf8')
const marketplaceMapSource = await readFile(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)
const listingMapSource = await readFile(
  new URL('../app/components/ListingLocationMap.tsx', import.meta.url),
  'utf8',
)

test('standard maps use the keyless OpenFreeMap style', () => {
  assert.match(mapStyleSource, /https:\/\/tiles\.openfreemap\.org\/styles\/liberty/)
  assert.match(mapStyleSource, /NEXT_PUBLIC_MAP_STYLE_URL/)
})

test('standard map loading no longer requests legacy CARTO raster tiles', () => {
  const runtimeMapSource = [mapStyleSource, marketplaceMapSource, listingMapSource].join('\n')

  assert.doesNotMatch(runtimeMapSource, /cartocdn\.com/)
  assert.doesNotMatch(runtimeMapSource, /getStandardFallbackTileUrl/)
  assert.match(marketplaceMapSource, /if \(layer === 'standard'\) return \[\]/)
  assert.match(listingMapSource, /if \(layer === 'standard'\) return \[\]/)
})

test('satellite fallback remains available', () => {
  assert.match(mapStyleSource, /World_Imagery\/MapServer\/tile/)
  assert.match(mapStyleSource, /World_Transportation\/MapServer\/tile/)
  assert.match(mapStyleSource, /World_Boundaries_and_Places\/MapServer\/tile/)
  assert.match(mapStyleSource, /NEXT_PUBLIC_SATELLITE_MAP_STYLE_URL/)
})
