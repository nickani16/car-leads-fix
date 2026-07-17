import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const marketSourcePath = resolve(root, 'lib/marketplace-locations.ts')
const swedenSourcePath = resolve(root, 'lib/swedish-regions.generated.ts')
const austriaSourcePath = resolve(root, 'scripts/data/austria-municipalities-2026.json')
const belgiumSourcePath = resolve(root, 'scripts/data/belgium-refnis-municipalities-2025.json')
const finlandSourcePath = resolve(root, 'scripts/data/finland-municipalities-regions-2026.json')
const netherlandsSourcePath = resolve(root, 'scripts/data/netherlands-municipalities-2026.json')
const migrationPath = resolve(root, 'supabase/migrations/20260717093000_marketplace_geo_directory.sql')
const marketSource = readFileSync(marketSourcePath, 'utf8')
const swedenSource = readFileSync(swedenSourcePath, 'utf8')
const austriaSource = JSON.parse(readFileSync(austriaSourcePath, 'utf8'))
const belgiumSource = JSON.parse(readFileSync(belgiumSourcePath, 'utf8'))
const finlandSource = JSON.parse(readFileSync(finlandSourcePath, 'utf8'))
const netherlandsSource = JSON.parse(readFileSync(netherlandsSourcePath, 'utf8'))
const migration = readFileSync(migrationPath, 'utf8')

const largeManualPlaceCountries = ['DE', 'FR', 'IT', 'ES', 'PL']
const countries = [
  ...largeManualPlaceCountries.map(readCurrentMarketCountryRegionsOnly),
  readSmallMarket('AT', austriaSource, 'statistik-austria-gemeinden-2026-complete-2114', 9, 2114),
  readSmallMarket('BE', belgiumSource, 'statbel-refnis-2025-active-municipalities-complete-564', 11, 564),
  readSweden(),
  readDenmark(),
  readFinland(),
  readSmallMarket('NL', netherlandsSource, 'cbs-netherlands-municipalities-2026-complete-342', 12, 342),
]

const statements = []
statements.push('-- Initial Autorell geo seed.')
statements.push('-- Small and medium markets are complete region-to-municipality datasets.')
statements.push('-- Large markets seed region level only; place/city is stored manually unless a verified directory match exists later.')
statements.push('insert into public.geo_regions (country_code, code, name, name_ascii, level, sort_order, active, source)')
statements.push('values')
statements.push(
  countries
    .flatMap((country) =>
      country.regions.map((region, index) =>
        `  (${sql(country.countryCode)}, ${sql(region.code || slug(region.name))}, ${sql(region.name)}, ${sql(asciiName(region.name))}, 'region', ${index + 1}, true, ${sql(country.source)})`,
      ),
    )
    .join(',\n') + '\n' +
    'on conflict (country_code, code) do update set\n' +
    '  name = excluded.name,\n' +
    '  name_ascii = excluded.name_ascii,\n' +
    '  sort_order = excluded.sort_order,\n' +
    '  active = excluded.active,\n' +
    '  source = excluded.source,\n' +
    '  updated_at = now();',
)

statements.push('')
statements.push('insert into public.geo_places (country_code, region_code, region_name, code, name, name_ascii, city, place_type, active, source)')
statements.push('values')
statements.push(
  countries
    .flatMap((country) =>
      country.regions.flatMap((region) =>
        region.municipalities.map((municipality) => {
          const regionCode = region.code || slug(region.name)
          const placeCode = `${regionCode}:${slug(municipality)}`
          return `  (${sql(country.countryCode)}, ${sql(regionCode)}, ${sql(region.name)}, ${sql(placeCode)}, ${sql(municipality)}, ${sql(asciiName(municipality))}, ${sql(municipality)}, 'municipality', true, ${sql(country.source)})`
        }),
      ),
    )
    .join(',\n') + '\n' +
    'on conflict (country_code, code) do update set\n' +
    '  region_code = excluded.region_code,\n' +
    '  region_name = excluded.region_name,\n' +
    '  name = excluded.name,\n' +
    '  name_ascii = excluded.name_ascii,\n' +
    '  city = excluded.city,\n' +
    '  place_type = excluded.place_type,\n' +
    '  active = excluded.active,\n' +
    '  source = excluded.source,\n' +
    '  updated_at = now();',
)

const generated = statements.join('\n')
const begin = '-- BEGIN AUTORELL INITIAL GEO SEED'
const end = '-- END AUTORELL INITIAL GEO SEED'
const beginIndex = migration.indexOf(begin)
const endIndex = migration.indexOf(end)
if (beginIndex < 0 || endIndex < 0 || endIndex < beginIndex) {
  throw new Error('Seed markers not found in migration')
}

const nextMigration = [
  migration.slice(0, beginIndex + begin.length),
  '\n',
  generated,
  '\n',
  migration.slice(endIndex),
].join('')

writeFileSync(migrationPath, nextMigration)

function readCurrentMarketCountryRegionsOnly(countryCode) {
  const start = marketSource.indexOf(`countryCode: '${countryCode}'`)
  const next = marketSource.indexOf("countryCode: '", start + 1)
  const end = next > 0 ? next : marketSource.indexOf('] as const', start)
  if (start < 0 || end < 0) throw new Error(`Could not find ${countryCode}`)
  const block = marketSource.slice(start, end)
  const regions = [...block.matchAll(/\{ name: '([^']+)', municipalities: \[([^\]]*)\]/g)].map((match) => ({
    name: repairMojibake(match[1]),
    municipalities: [],
  }))
  return { countryCode, regions, source: 'autorell-region-seed-manual-place-market' }
}

function readSmallMarket(countryCode, rows, source, expectedRegions, expectedPlaces) {
  const regionsByCode = new Map()
  for (const row of rows) {
    if (!regionsByCode.has(row.regionCode)) {
      regionsByCode.set(row.regionCode, {
        code: slug(row.regionCode),
        name: row.regionName,
        municipalities: [],
      })
    }
    regionsByCode.get(row.regionCode).municipalities.push(row.municipalityName)
  }
  const regions = [...regionsByCode.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'))
  const placeCount = regions.reduce((sum, region) => sum + region.municipalities.length, 0)
  if (regions.length !== expectedRegions) throw new Error(`${countryCode} region count mismatch: ${regions.length}`)
  if (placeCount !== expectedPlaces) throw new Error(`${countryCode} municipality count mismatch: ${placeCount}`)
  return { countryCode, regions, source }
}

function readSweden() {
  const countyBySlug = new Map()
  for (const match of swedenSource.matchAll(/"name": "([^"]+)",\s+"slug": "([^"]+)"/g)) {
    const name = repairMojibake(match[1])
    const slugValue = match[2]
    if (name.endsWith('l\u00e4n')) {
      countyBySlug.set(slugValue, {
        code: slugValue,
        name,
        municipalities: [],
      })
    }
  }

  for (const match of swedenSource.matchAll(/"name": "([^"]+)",\s+"slug": "([^"]+)",\s+"countyCode": "[^"]+",\s+"county": "([^"]+)",\s+"countySlug": "([^"]+)"/g)) {
    const municipality = repairMojibake(match[1])
    const countySlug = match[4]
    const region = countyBySlug.get(countySlug)
    if (region) region.municipalities.push(municipality)
  }

  const regions = [...countyBySlug.values()]
  if (regions.length !== 21) throw new Error(`Sweden region count mismatch: ${regions.length}`)
  const placeCount = regions.reduce((sum, region) => sum + region.municipalities.length, 0)
  if (placeCount !== 290) throw new Error(`Sweden municipality count mismatch: ${placeCount}`)
  return { countryCode: 'SE', regions, source: 'scb-generated-swedish-regions-complete-290' }
}

function readDenmark() {
  const regions = [
    ['Region Hovedstaden', ['Albertslund', 'Aller\u00f8d', 'Ballerup', 'Bornholm', 'Br\u00f8ndby', 'Drag\u00f8r', 'Egedal', 'Fredensborg', 'Frederiksberg', 'Frederikssund', 'Fures\u00f8', 'Gentofte', 'Gladsaxe', 'Glostrup', 'Gribskov', 'Halsn\u00e6s', 'Helsing\u00f8r', 'Herlev', 'Hiller\u00f8d', 'Hvidovre', 'H\u00f8je-Taastrup', 'H\u00f8rsholm', 'Ish\u00f8j', 'K\u00f8benhavn', 'Lyngby-Taarb\u00e6k', 'Rudersdal', 'R\u00f8dovre', 'T\u00e5rnby', 'Vallensb\u00e6k']],
    ['Region Midtjylland', ['Favrskov', 'Hedensted', 'Herning', 'Holstebro', 'Horsens', 'Ikast-Brande', 'Lemvig', 'Norddjurs', 'Odder', 'Randers', 'Ringk\u00f8bing-Skjern', 'Sams\u00f8', 'Silkeborg', 'Skanderborg', 'Skive', 'Struer', 'Syddjurs', 'Viborg', 'Aarhus']],
    ['Region Nordjylland', ['Br\u00f8nderslev', 'Frederikshavn', 'Hj\u00f8rring', 'Jammerbugt', 'L\u00e6s\u00f8', 'Mariagerfjord', 'Mors\u00f8', 'Rebild', 'Thisted', 'Vesthimmerlands', 'Aalborg']],
    ['Region Sj\u00e6lland', ['Faxe', 'Greve', 'Guldborgsund', 'Holb\u00e6k', 'Kalundborg', 'K\u00f8ge', 'Lejre', 'Lolland', 'N\u00e6stved', 'Odsherred', 'Ringsted', 'Roskilde', 'Slagelse', 'Solr\u00f8d', 'Sor\u00f8', 'Stevns', 'Vordingborg']],
    ['Region Syddanmark', ['Assens', 'Billund', 'Esbjerg', 'Fan\u00f8', 'Faaborg-Midtfyn', 'Fredericia', 'Haderslev', 'Kerteminde', 'Kolding', 'Langeland', 'Middelfart', 'Nordfyns', 'Nyborg', 'Odense', 'Svendborg', 'S\u00f8nderborg', 'T\u00f8nder', 'Varde', 'Vejen', 'Vejle', '\u00c6r\u00f8', 'Aabenraa']],
  ].map(([name, municipalities]) => ({
    code: slug(name),
    name,
    municipalities,
  }))
  const placeCount = regions.reduce((sum, region) => sum + region.municipalities.length, 0)
  if (regions.length !== 5) throw new Error(`Denmark region count mismatch: ${regions.length}`)
  if (placeCount !== 98) throw new Error(`Denmark municipality count mismatch: ${placeCount}`)
  return { countryCode: 'DK', regions, source: 'danish-regions-and-municipalities-complete-98' }
}

function readFinland() {
  const regionsByCode = new Map()
  for (const row of finlandSource) {
    const regionName = itemName(row.targetItem)
    const municipalityName = itemName(row.sourceItem)
    const regionCode = slug(regionName)
    if (!regionsByCode.has(regionCode)) {
      regionsByCode.set(regionCode, {
        code: regionCode,
        name: regionName,
        municipalities: [],
      })
    }
    regionsByCode.get(regionCode).municipalities.push(municipalityName)
  }
  const regions = [...regionsByCode.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'))
  const placeCount = regions.reduce((sum, region) => sum + region.municipalities.length, 0)
  if (regions.length !== 19) throw new Error(`Finland region count mismatch: ${regions.length}`)
  if (placeCount !== 308) throw new Error(`Finland municipality count mismatch: ${placeCount}`)
  return { countryCode: 'FI', regions, source: 'statistics-finland-2026-complete-308' }
}

function itemName(item) {
  const name = item?.classificationItemNames?.find((entry) => entry.lang === 'en')?.name
  if (!name) throw new Error('Missing Finland classification item name')
  return name
}

function sql(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function slug(value) {
  return asciiName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function asciiName(value) {
  return repairMojibake(String(value))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00e6/g, 'ae')
    .replace(/\u00f8/g, 'o')
    .replace(/\u00e5/g, 'a')
    .replace(/\u00c6/g, 'Ae')
    .replace(/\u00d8/g, 'O')
    .replace(/\u00c5/g, 'A')
}

function repairMojibake(value) {
  return String(value)
    .replaceAll('Ã¥', '\u00e5')
    .replaceAll('Ã¤', '\u00e4')
    .replaceAll('Ã¶', '\u00f6')
    .replaceAll('Ã…', '\u00c5')
    .replaceAll('Ã„', '\u00c4')
    .replaceAll('Ã–', '\u00d6')
    .replaceAll('Ã¸', '\u00f8')
    .replaceAll('Ã¦', '\u00e6')
    .replaceAll('Ã†', '\u00c6')
    .replaceAll('Ã©', '\u00e9')
    .replaceAll('Ã¨', '\u00e8')
    .replaceAll('Ãª', '\u00ea')
    .replaceAll('Ã¼', '\u00fc')
    .replaceAll('Ã´', '\u00f4')
    .replaceAll('Ã§', '\u00e7')
}
