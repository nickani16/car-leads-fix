import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const citiesPath = resolve(repoRoot, '.tmp/geonames/cities500/cities500.txt')
const admin1Path = resolve(repoRoot, '.tmp/geonames/admin1CodesASCII.txt')
const outputPath = resolve(repoRoot, 'scripts/data/geonames-large-market-places-2026.json')

const targetCountries = new Set(['DE', 'FR', 'IT', 'ES', 'PL'])
const featureRank = new Map([
  ['PPLC', 7],
  ['PPLA', 6],
  ['PPLA2', 5],
  ['PPLA3', 4],
  ['PPLA4', 3],
  ['PPL', 2],
])

const regionNameOverrides = new Map(Object.entries({
  'DE.01': 'Baden-Württemberg',
  'DE.02': 'Bayern',
  'DE.05': 'Hessen',
  'DE.06': 'Niedersachsen',
  'DE.07': 'Nordrhein-Westfalen',
  'DE.13': 'Sachsen',
  'DE.14': 'Sachsen-Anhalt',
  'DE.15': 'Thüringen',
  'DE.16': 'Berlin',
  'ES.07': 'Illes Balears',
  'ES.51': 'Andalucía',
  'ES.52': 'Aragón',
  'ES.53': 'Canarias',
  'ES.54': 'Castilla-La Mancha',
  'ES.55': 'Castilla y León',
  'ES.56': 'Cataluña',
  'ES.59': 'País Vasco',
  'ES.60': 'Comunitat Valenciana',
  'FR.27': 'Bourgogne-Franche-Comté',
  'FR.28': 'Normandie',
  'FR.53': 'Bretagne',
  'FR.75': 'Nouvelle-Aquitaine',
  'FR.84': 'Auvergne-Rhône-Alpes',
  'FR.94': 'Corse',
  'IT.02': 'Basilicata',
  'IT.10': 'Marche',
  'IT.12': 'Piemonte',
  'IT.13': 'Puglia',
  'IT.16': 'Toscana',
  'IT.19': "Valle d'Aosta",
  'PL.72': 'Dolnośląskie',
  'PL.74': 'Łódzkie',
  'PL.75': 'Lubelskie',
  'PL.77': 'Małopolskie',
  'PL.78': 'Mazowieckie',
  'PL.79': 'Opolskie',
  'PL.80': 'Podkarpackie',
  'PL.81': 'Podlaskie',
  'PL.82': 'Pomorskie',
  'PL.83': 'Śląskie',
  'PL.85': 'Warmińsko-Mazurskie',
  'PL.86': 'Wielkopolskie',
  'PL.87': 'Zachodniopomorskie',
}))

const preferredPlaceNames = new Map(Object.entries({
  '2867714': 'München',
  '2861650': 'Nürnberg',
  '3165524': 'Torino',
  '3169070': 'Roma',
  '3172394': 'Napoli',
  '3173435': 'Milano',
  '3176959': 'Firenze',
  '3164603': 'Venezia',
  '756135': 'Warszawa',
}))

const admin1Names = new Map()
for (const line of readFileSync(admin1Path, 'utf8').split('\n')) {
  if (!line.trim()) continue
  const [key, name] = line.split('\t')
  if (key && name) admin1Names.set(key, name)
}

const bestByCountryAndSlug = new Map()
for (const line of readFileSync(citiesPath, 'utf8').split('\n')) {
  if (!line.trim()) continue
  const columns = line.split('\t')
  const countryCode = columns[8]
  if (!targetCountries.has(countryCode) || columns[6] !== 'P') continue

  const geonameId = columns[0]
  const name = preferredPlaceNames.get(geonameId) || columns[1]
  const asciiName = columns[2]
  const featureCode = columns[7]
  const admin1Code = columns[10]
  const population = Number(columns[14]) || 0
  const admin1Key = `${countryCode}.${admin1Code}`
  const regionName = regionNameOverrides.get(admin1Key) || admin1Names.get(admin1Key) || admin1Code || 'Unknown'
  const placeSlug = slug(name)
  if (!placeSlug || !regionName || regionName === 'Unknown') continue

  const candidate = {
    countryCode,
    regionCode: slug(regionName),
    regionName,
    municipalityCode: `${geonameId}-${placeSlug}`,
    municipalityName: name,
    asciiName,
    population,
    featureCode,
  }
  const key = `${countryCode}:${placeSlug}`
  const current = bestByCountryAndSlug.get(key)
  if (!current || score(candidate) > score(current)) bestByCountryAndSlug.set(key, candidate)
}

const rows = [...bestByCountryAndSlug.values()].sort((left, right) => {
  const countryCompare = left.countryCode.localeCompare(right.countryCode, 'en')
  if (countryCompare) return countryCompare
  const regionCompare = left.regionName.localeCompare(right.regionName, 'en')
  if (regionCompare) return regionCompare
  return left.municipalityName.localeCompare(right.municipalityName, 'en')
})

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(rows, null, 2)}\n`)

const summary = rows.reduce((acc, row) => {
  acc[row.countryCode] ||= { regions: new Set(), places: 0 }
  acc[row.countryCode].regions.add(row.regionCode)
  acc[row.countryCode].places += 1
  return acc
}, {})

console.log(
  Object.entries(summary)
    .map(([country, value]) => `${country}: ${value.regions.size} regions, ${value.places} places`)
    .join('\n'),
)

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
    .replaceAll('Ł', 'L')
    .replaceAll('ł', 'l')
}
