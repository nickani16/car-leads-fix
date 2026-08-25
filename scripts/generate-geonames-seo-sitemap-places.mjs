import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const dumpRoot = resolve(process.env.GEONAMES_DUMP_ROOT || resolve(repoRoot, '.tmp/geonames'))
const admin1Path = resolve(dumpRoot, 'admin1CodesASCII.txt')
const outputPath = resolve(repoRoot, 'scripts/data/geonames-seo-sitemap-places-2026.json')
const countries = ['AT', 'BE', 'DK', 'ES', 'FI', 'NL', 'PL']
const sitemapPlaceLimit = 10_000

// Source: GeoNames country dumps (CC BY 4.0), https://download.geonames.org/export/dump/
const featureRank = new Map([
  ['PPLC', 14],
  ['PPLA', 13],
  ['PPLA2', 12],
  ['PPLA3', 11],
  ['PPLA4', 10],
  ['PPLA5', 9],
  ['PPL', 8],
  ['PPLL', 7],
  ['PPLX', 6],
  ['PPLF', 5],
  ['PPLG', 4],
  ['PPLR', 3],
  ['PPLS', 2],
  ['PPLCH', 1],
])

const admin1Names = new Map()
for (const line of readFileSync(admin1Path, 'utf8').split('\n')) {
  const [key, name] = line.split('\t')
  if (key && name) admin1Names.set(key, name)
}

const output = {}
for (const country of countries) {
  const countryPath = resolve(dumpRoot, country, `${country}.txt`)
  const bestBySlug = new Map()

  for (const line of readFileSync(countryPath, 'utf8').split('\n')) {
    if (!line.trim()) continue
    const columns = line.split('\t')
    const featureCode = columns[7]
    if (columns[8] !== country || columns[6] !== 'P' || !featureRank.has(featureCode)) continue

    const geonameId = columns[0]
    const name = columns[1]
    const regionCode = columns[10]
    const regionName = admin1Names.get(`${country}.${regionCode}`)
    const placeSlug = slug(name)
    if (!placeSlug || !regionName) continue

    const candidate = {
      geonameId,
      name,
      regionCode,
      regionName,
      population: Number(columns[14]) || 0,
      featureCode,
    }
    const current = bestBySlug.get(placeSlug)
    if (!current || score(candidate) > score(current)) bestBySlug.set(placeSlug, candidate)
  }

  const rows = [...bestBySlug.values()]
    .sort((left, right) =>
      score(right) - score(left) || left.name.localeCompare(right.name, localeForCountry(country)),
    )
    .slice(0, sitemapPlaceLimit)
    .sort((left, right) =>
      left.regionName.localeCompare(right.regionName, localeForCountry(country)) ||
      left.name.localeCompare(right.name, localeForCountry(country)),
    )
    .map((row) => [row.geonameId, row.name, row.regionCode, row.regionName])

  if (rows.length !== Math.min(sitemapPlaceLimit, bestBySlug.size)) {
    throw new Error(`${country} sitemap place count mismatch: ${rows.length}`)
  }

  output[country] = rows
  console.log(`${country}: ${rows.length} sitemap places`)
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(output)}\n`)

function score(row) {
  return (featureRank.get(row.featureCode) || 0) * 1_000_000_000 + row.population
}

function localeForCountry(country) {
  return ({ AT: 'de', BE: 'nl', DK: 'da', ES: 'es', FI: 'fi', NL: 'nl', PL: 'pl' })[country] || 'en'
}

function slug(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}
