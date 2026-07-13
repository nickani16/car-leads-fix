import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

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

test('listing map resolver centers three listings from their own location data', async () => {
  const geocodeResults = new Map([
    ['Storgatan 1, 111 22, Stockholm, SE', [{ lat: '59.332100', lon: '18.064900' }]],
    ['211 20, Malmö, SE', [{ lat: '55.609900', lon: '13.003800' }]],
  ])
  const { resolveListingMapLocation } = loadListingMapResolver(async (url) => {
    const query = new URL(url).searchParams.get('q')
    return {
      ok: true,
      json: async () => geocodeResults.get(query) || [],
    }
  })

  const coordinateListing = await resolveListingMapLocation({
    id: 'listing-with-coordinates',
    address: 'Sveavägen 10',
    postalCode: '111 57',
    city: 'Stockholm',
    countryCode: 'SE',
    latitude: 59.336,
    longitude: 18.063,
  })
  assert.equal(coordinateListing?.latitude, 59.336)
  assert.equal(coordinateListing?.longitude, 18.063)
  assert.equal(coordinateListing?.approximate, false)
  assert.equal(coordinateListing?.source, 'listing_coordinates')
  assert.equal(coordinateListing?.query, null)

  const fullAddressListing = await resolveListingMapLocation({
    id: 'listing-with-full-address',
    address: 'Storgatan 1',
    postalCode: '111 22',
    city: 'Stockholm',
    countryCode: 'SE',
    latitude: null,
    longitude: null,
  })
  assert.equal(fullAddressListing?.source, 'geocoded_full_address')
  assert.equal(fullAddressListing?.latitude, 59.3321)
  assert.equal(fullAddressListing?.longitude, 18.0649)

  const postalListing = await resolveListingMapLocation({
    id: 'listing-with-postal-location',
    address: null,
    postalCode: '211 20',
    city: 'Malmö',
    countryCode: 'SE',
    latitude: null,
    longitude: null,
  })
  assert.equal(postalListing?.source, 'geocoded_postal_city_country')
  assert.equal(postalListing?.approximate, true)
  assert.equal(postalListing?.latitude, 55.6099)
  assert.equal(postalListing?.longitude, 13.0038)

  const ambiguousLocalityListing = await resolveListingMapLocation({
    id: 'listing-saltsjo-boo-ekero',
    address: 'Saltsjo-boo',
    postalCode: null,
    city: 'Ekero',
    country: 'Sweden',
    latitude: null,
    longitude: null,
  })
  assert.equal(ambiguousLocalityListing, null)
})

function loadListingMapResolver(fetchImpl) {
  const source = readFileSync('lib/listing-map-location.ts', 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText
  const context = {
    exports: {},
    module: { exports: {} },
    process: { env: {} },
    URL,
    fetch: fetchImpl,
    require(specifier) {
      if (specifier === 'server-only') return {}
      throw new Error(`Unexpected require: ${specifier}`)
    },
  }
  context.exports = context.module.exports
  vm.runInNewContext(compiled, context)
  return context.module.exports
}
