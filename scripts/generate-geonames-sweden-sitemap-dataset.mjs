import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const swedenPath = resolve(repoRoot, '.tmp/geonames/SE/SE.txt')
const admin1Path = resolve(repoRoot, '.tmp/geonames/admin1CodesASCII.txt')
const outputPath = resolve(repoRoot, 'scripts/data/geonames-sweden-sitemap-places-2026.json')
const sitemapPlaceLimit = 10_000

// Source: GeoNames Sweden dump (CC BY 4.0), https://download.geonames.org/export/dump/

const featureRank = new Map([
  ['PPLC', 7],
  ['PPLA', 6],
  ['PPLA2', 5],
  ['PPLA3', 4],
  ['PPLA4', 3],
  ['PPL', 2],
])

const preferredPlaceNames = new Map([
  ['2711537', 'Göteborg'],
])

const admin1Names = new Map()
for (const line of readFileSync(admin1Path, 'utf8').split('\n')) {
  if (!line.startsWith('SE.')) continue
  const [key, name] = line.split('\t')
  if (key && name) admin1Names.set(key, name)
}

const bestBySlug = new Map()
for (const line of readFileSync(swedenPath, 'utf8').split('\n')) {
  if (!line.trim()) continue
  const columns = line.split('\t')
  const featureCode = columns[7]
  if (columns[8] !== 'SE' || columns[6] !== 'P' || !featureRank.has(featureCode)) continue

  const geonameId = columns[0]
  const name = preferredPlaceNames.get(geonameId) || columns[1]
  const asciiName = columns[2]
  const admin1Key = `SE.${columns[10]}`
  const regionName = admin1Names.get(admin1Key)
  const placeSlug = slug(name)
  if (!placeSlug || !regionName) continue

  const candidate = {
    countryCode: 'SE',
    regionCode: slug(regionName),
    regionName,
    municipalityCode: `${geonameId}-${placeSlug}`,
    municipalityName: name,
    asciiName,
    population: Number(columns[14]) || 0,
    featureCode,
  }
  const current = bestBySlug.get(placeSlug)
  if (!current || score(candidate) > score(current)) bestBySlug.set(placeSlug, candidate)
}

const rows = [...bestBySlug.values()]
  .sort((left, right) =>
    score(right) - score(left) ||
    left.municipalityName.localeCompare(right.municipalityName, 'sv'),
  )
  .slice(0, sitemapPlaceLimit)
  .sort((left, right) =>
    left.regionName.localeCompare(right.regionName, 'sv') ||
    left.municipalityName.localeCompare(right.municipalityName, 'sv'),
  )

if (rows.length !== sitemapPlaceLimit) {
  throw new Error(`Sweden sitemap place count mismatch: ${rows.length}`)
}

const regionCount = new Set(rows.map((row) => row.regionCode)).size
if (regionCount !== 21) {
  throw new Error(`Sweden sitemap region count mismatch: ${regionCount}`)
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(rows, null, 2)}\n`)
console.log(`SE: ${regionCount} regions, ${rows.length} sitemap places`)

function score(row) {
  return (featureRank.get(row.featureCode) || 1) * 1_000_000_000 + row.population
}

function slug(value) {
  return foldGeoLetters(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}

function foldGeoLetters(value) {
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
}
