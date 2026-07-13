import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const detailPage = readFileSync('app/listings/[slug]/ListingDetailPage.tsx', 'utf8')
const mapComponent = readFileSync('app/components/ListingLocationMap.tsx', 'utf8')
const marketplace = readFileSync('lib/marketplace.ts', 'utf8')
const mapResolver = readFileSync('lib/listing-map-location.ts', 'utf8')

test('listing detail map uses listing-owned location fields only', () => {
  assert.match(detailPage, /resolveListingMapLocation\(\{[\s\S]*id: listing\.id/)
  assert.match(detailPage, /address: listing\.address/)
  assert.match(detailPage, /postalCode: listing\.postal_code/)
  assert.match(detailPage, /latitude: listing\.latitude/)
  assert.match(detailPage, /longitude: listing\.longitude/)
  assert.doesNotMatch(detailPage, /resolveListingCoordinates\(/)
  assert.match(marketplace, /address,postal_code,latitude,longitude/)
})

test('listing map resolver rejects generic city and country fallback coordinates', () => {
  assert.match(mapResolver, /source: 'listing_coordinates'/)
  assert.match(mapResolver, /source: 'geocoded_full_address'/)
  assert.match(mapResolver, /source: 'geocoded_postal_city_country'/)
  assert.doesNotMatch(mapResolver, /resolveListingCoordinates/)
  assert.doesNotMatch(mapResolver, /cityCoordinates|countryCoordinates/)
  assert.match(mapResolver, /parsedLatitude === 0 && parsedLongitude === 0/)
})

test('listing map exposes development-only debug fields for verification', () => {
  assert.match(mapComponent, /process\.env\.NODE_ENV === 'production'/)
  assert.match(mapComponent, /Listing map debug/)
  assert.match(mapComponent, /listing id/)
  assert.match(mapComponent, /postal code/)
  assert.match(mapComponent, /actual map center/)
})
