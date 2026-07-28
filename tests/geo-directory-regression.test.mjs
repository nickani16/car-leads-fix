import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const migration = readFileSync(
  new URL('../supabase/migrations/20260717093000_marketplace_geo_directory.sql', import.meta.url),
  'utf8',
)
const form = readFileSync(new URL('../app/konto/annonser/ny/NewListingForm.tsx', import.meta.url), 'utf8')
const geoHelper = readFileSync(new URL('../lib/marketplace-geo.ts', import.meta.url), 'utf8')
const staticGeoDatasets = readFileSync(new URL('../lib/geo-static-datasets.ts', import.meta.url), 'utf8')
const sitemapIndex = readFileSync(new URL('../app/sitemap.xml/route.ts', import.meta.url), 'utf8')
const sitemapRoute = readFileSync(new URL('../app/sitemaps/[name]/route.ts', import.meta.url), 'utf8')
const largeMarketRows = JSON.parse(
  readFileSync(new URL('../scripts/data/geonames-large-market-places-2026.json', import.meta.url), 'utf8'),
)

test('geo directory creates public read tables with indexed bounded search', () => {
  assert.match(migration, /create table if not exists public\.geo_regions/)
  assert.match(migration, /create table if not exists public\.geo_places/)
  assert.match(migration, /alter table public\.geo_regions enable row level security/)
  assert.match(migration, /alter table public\.geo_places enable row level security/)
  assert.match(migration, /geo_places_search_trgm_idx/)
  assert.match(migration, /extensions\.gin_trgm_ops/)
  assert.match(migration, /grant select on public\.geo_regions to anon, authenticated/)
  assert.match(migration, /grant select on public\.geo_places to anon, authenticated/)
})

test('initial geo seed covers all active Autorell markets', () => {
  for (const country of ['AT', 'BE', 'DK', 'FI', 'FR', 'DE', 'IT', 'NL', 'PL', 'ES', 'SE']) {
    assert.match(migration, new RegExp(`'${country}'`))
  }
  assert.match(migration, /insert into public\.geo_regions/)
  assert.match(migration, /insert into public\.geo_places/)
  assert.match(migration, /on conflict \(country_code, code\) do update/)
})

test('create listing uses market country and server-backed place search', () => {
  assert.match(form, /const listingCountryCode = countryCode\.toUpperCase\(\)/)
  assert.doesNotMatch(form, /name="sellerCountryCode"/)
  assert.match(form, /\/api\/geo\/regions\?country=/)
  assert.match(form, /\/api\/geo\/places\?\$\{params\.toString\(\)\}/)
  assert.match(form, /const usesMunicipalityDropdown = \['SE', 'DK', 'FI', 'NL', 'BE', 'AT', 'DE', 'ES', 'FR', 'IT', 'PL'\]\.includes\(listingCountryCode\)/)
  assert.match(form, /limit: '500'/)
  assert.match(form, /<GeoPlaceCombobox\s+name="municipality"/)
  assert.match(form, /<Field\s+name="municipality"/)
  assert.match(form, /locationSource/)
  assert.match(form, /geoPlaceCode/)
})

test('Denmark seed is complete and region scoped', () => {
  const regions = rowsFor('geo_regions', 'DK')
  const places = rowsFor('geo_places', 'DK')
  assert.equal(regions.length, 5)
  assert.equal(places.length, 98)
  assert.equal(new Set(places.map((row) => row.code)).size, 98)

  const expectedRegionCounts = new Map([
    ['region-hovedstaden', 29],
    ['region-midtjylland', 19],
    ['region-nordjylland', 11],
    ['region-sjaelland', 17],
    ['region-syddanmark', 22],
  ])
  const regionCodes = new Set(regions.map((row) => row.code))
  for (const place of places) {
    assert.ok(regionCodes.has(place.regionCode), `${place.name} has invalid region ${place.regionCode}`)
  }
  for (const [regionCode, expectedCount] of expectedRegionCounts) {
    assert.equal(places.filter((place) => place.regionCode === regionCode).length, expectedCount)
  }
  assert.ok(places.some((place) => place.name === 'København'))
  assert.ok(places.some((place) => place.name === 'Aarhus'))
  assert.ok(places.some((place) => place.name === 'Ærø'))
})

test('Sweden seed is complete from generated county data', () => {
  const regions = rowsFor('geo_regions', 'SE')
  const places = rowsFor('geo_places', 'SE')
  assert.equal(regions.length, 21)
  assert.equal(places.length, 290)
  assert.equal(new Set(places.map((row) => row.code)).size, 290)
  assert.ok(places.some((place) => place.name === 'Stockholm'))
  assert.ok(places.some((place) => place.name === 'Göteborg'))
  assert.ok(places.some((place) => place.name === 'Malmö'))
})

test('Finland seed is complete and region scoped', () => {
  const regions = rowsFor('geo_regions', 'FI')
  const places = rowsFor('geo_places', 'FI')
  assert.equal(regions.length, 19)
  assert.equal(places.length, 308)
  assert.equal(new Set(places.map((row) => row.code)).size, 308)
  assert.ok(places.some((place) => place.name === 'Helsinki'))
  assert.ok(places.some((place) => place.name === 'Espoo'))
  assert.ok(places.some((place) => place.name === 'Tampere'))
})

test('Netherlands, Belgium and Austria use complete municipality datasets', () => {
  assertSeedCount('NL', 12, 342)
  assertSeedCount('BE', 11, 564)
  assertSeedCount('AT', 9, 2114)

  assert.ok(rowsFor('geo_places', 'NL').some((place) => place.name === 'Amsterdam'))
  assert.ok(rowsFor('geo_places', 'BE').some((place) => place.name.includes('Bruxelles')))
  assert.ok(rowsFor('geo_places', 'AT').some((place) => place.name === 'Eisenstadt'))
})

test('initial SQL seed keeps large markets region level only', () => {
  const expectedRegionCounts = new Map([
    ['FR', 13],
    ['DE', 16],
    ['ES', 17],
    ['IT', 20],
    ['PL', 16],
  ])
  for (const [country, expectedRegions] of expectedRegionCounts) {
    assert.equal(rowsFor('geo_regions', country).length, expectedRegions)
    assert.equal(rowsFor('geo_places', country).length, 0)
  }
})

test('large market static fallback covers towns for every large language market', () => {
  const expectedPlaceCounts = new Map([
    ['DE', 10949],
    ['ES', 7339],
    ['FR', 14900],
    ['IT', 11339],
    ['PL', 3348],
  ])
  for (const [country, expectedPlaces] of expectedPlaceCounts) {
    const rows = largeMarketRows.filter((row) => row.countryCode === country)
    assert.equal(rows.length, expectedPlaces)
    assert.equal(new Set(rows.map((row) => slug(row.municipalityName))).size, expectedPlaces)
    assert.ok(rows.every((row) => row.regionName && row.municipalityName && row.municipalityCode))
  }

  assert.ok(largeMarketRows.some((row) => row.countryCode === 'DE' && row.municipalityName === 'Berlin'))
  assert.ok(largeMarketRows.some((row) => row.countryCode === 'DE' && row.municipalityName === 'München'))
  assert.ok(largeMarketRows.some((row) => row.countryCode === 'FR' && row.municipalityName === 'Paris'))
  assert.ok(largeMarketRows.some((row) => row.countryCode === 'ES' && row.municipalityName === 'Barcelona'))
  assert.ok(largeMarketRows.some((row) => row.countryCode === 'IT' && row.municipalityName === 'Roma'))
  assert.ok(largeMarketRows.some((row) => row.countryCode === 'PL' && row.municipalityName === 'Warszawa'))
  assert.match(staticGeoDatasets, /geonames-large-market-places-2026/)
  assert.match(staticGeoDatasets, /buildLargeMarketDataset\('DE', 16, 10949\)/)
  assert.match(staticGeoDatasets, /buildLargeMarketDataset\('FR', 13, 14900\)/)
})

test('geo helper prefers database rows and uses static datasets only as fallback', () => {
  assert.match(geoHelper, /\.from\('geo_regions'\)/)
  assert.match(geoHelper, /\.from\('geo_places'\)/)
  assert.match(geoHelper, /fallbackGeoPlaces/)
  assert.match(geoHelper, /getStaticGeoDataset/)
  assert.match(geoHelper, /if \(dbRows\.length\) return dbRows\.map\(mapGeoPlaceRow\)/)
  assert.match(geoHelper, /return fallbackGeoPlaces\(\{ countryCode: country, region, query, limit: safeLimit \}\)/)
  assert.doesNotMatch(geoHelper, /getMarketplaceCountryLocations/)
  assert.doesNotMatch(geoHelper, /inferMarketplaceLocation/)
  assert.match(geoHelper, /Math\.min\(Math\.max\(Number\(limit\) \|\| 20, 1\), 500\)/)
})

test('manual location fallback is tracked separately from verified places', () => {
  assert.match(migration, /location_source text not null default 'verified'/)
  assert.match(migration, /check \(location_source in \('verified', 'manual', 'unverified'\)\)/)
  assert.match(migration, /geo_place_code text/)
  assert.match(form, /usesMunicipalityDropdown \? locationSource \|\| 'unverified' : 'manual'/)
  assert.match(form, /setLocationSource\('manual'\)/)
  assert.match(form, /setLocationSource\('verified'\)/)
  assert.match(geoHelper, /verifiedMunicipalityCountries = new Set\(\['SE', 'DK', 'FI', 'NL', 'BE', 'AT', 'DE', 'ES', 'FR', 'IT', 'PL'\]\)/)
  assert.match(geoHelper, /locationSource: 'manual' as const/)
  assert.match(geoHelper, /locationSource: 'verified' as const/)
})

test('geo marketplace routes are advertised through dynamic sitemaps for every market', () => {
  assert.match(sitemapIndex, /getGeoSitemapMarketCodes/)
  assert.match(sitemapIndex, /getGeoSitemapNames/)
  assert.match(sitemapIndex, /names\.push\(`geo-\$\{market\}-\$\{page\}`\)/)
  assert.match(sitemapIndex, /Math\.ceil\(\(areaCount \* urlsPerArea\) \/ maxUrlsPerSitemap\)/)
  assert.match(sitemapRoute, /geoSitemapFromName/)
  assert.match(sitemapRoute, /geoSitemapUrls/)
  assert.match(sitemapRoute, /getGeoSitemapMarketConfig/)
  assert.match(sitemapRoute, /getStaticGeoDataset/)
  assert.match(sitemapRoute, /\/\$\{config\.market\}\/\$\{categorySlug\}\/\$\{area\.slug\}/)
  assert.match(sitemapRoute, /const dedupeKey = area\.slug/)
})

function assertSeedCount(countryCode, expectedRegions, expectedPlaces) {
  const regions = rowsFor('geo_regions', countryCode)
  const places = rowsFor('geo_places', countryCode)
  assert.equal(regions.length, expectedRegions)
  assert.equal(places.length, expectedPlaces)
  assert.equal(new Set(places.map((row) => row.code)).size, expectedPlaces)
  const regionCodes = new Set(regions.map((row) => row.code))
  for (const place of places) {
    assert.ok(regionCodes.has(place.regionCode), `${place.name} has invalid region ${place.regionCode}`)
  }
}

function rowsFor(table, countryCode) {
  const start = migration.indexOf(`insert into public.${table}`)
  const end = migration.indexOf('on conflict', start)
  assert.ok(start >= 0 && end > start, `${table} insert block missing`)
  const block = migration.slice(start, end)
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith(`('${countryCode}'`))
    .map((line) => parseTuple(line.replace(/,$/, '')))
}

function parseTuple(line) {
  const values = [...line.matchAll(/'((?:''|[^'])*)'|(\d+)|\btrue\b|\bfalse\b/g)].map((match) =>
    match[1] !== undefined ? match[1].replaceAll("''", "'") : match[0],
  )
  if (values.length >= 10) {
    return {
      countryCode: values[0],
      regionCode: values[1],
      regionName: values[2],
      code: values[3],
      name: values[4],
    }
  }
  return {
    countryCode: values[0],
    code: values[1],
    name: values[2],
  }
}

function slug(value) {
  return value
    .replaceAll('Æ', 'Ae')
    .replaceAll('Ø', 'O')
    .replaceAll('Å', 'A')
    .replaceAll('æ', 'ae')
    .replaceAll('ø', 'o')
    .replaceAll('å', 'a')
    .replaceAll('Ä', 'A')
    .replaceAll('Ö', 'O')
    .replaceAll('Ü', 'U')
    .replaceAll('ä', 'a')
    .replaceAll('ö', 'o')
    .replaceAll('ü', 'u')
    .replaceAll('ß', 'ss')
    .replaceAll('Ł', 'L')
    .replaceAll('ł', 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}
