import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const source = fs.readFileSync(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)

test('marketplace map changes style without recreating the map camera', () => {
  assert.match(source, /style: getMapStyle\(mapLayerRef\.current\)/)
  assert.match(source, /map\.setStyle\(getMapStyle\(mapLayer\)\)/)
  assert.doesNotMatch(source, /\}, \[country, mapLayer\]\)/)
})

test('marketplace map zooms close to one listing and local result bounds', () => {
  assert.match(
    source,
    /mapListings\.length === 1[\s\S]*?map\.flyTo\(\{ center: mapListings\[0\]\.coordinates, zoom: 11\.5/,
  )
  assert.match(source, /geoBounds[\s\S]*?maxZoom: 12/)
  assert.match(source, /mapListings\.forEach[\s\S]*?maxZoom: 11\.5/)
})
