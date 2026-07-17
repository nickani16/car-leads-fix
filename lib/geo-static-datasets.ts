import { swedishCounties, swedishMunicipalities } from './swedish-regions.generated'
import austriaRows from '../scripts/data/austria-municipalities-2026.json'
import belgiumRows from '../scripts/data/belgium-refnis-municipalities-2025.json'
import finlandRows from '../scripts/data/finland-municipalities-regions-2026.json'
import netherlandsRows from '../scripts/data/netherlands-municipalities-2026.json'

export type StaticGeoRegion = {
  code: string
  name: string
  sortOrder: number
}

export type StaticGeoPlace = {
  code: string
  name: string
  regionCode: string
  regionName: string
  city: string
  postalCode: string | null
}

export type StaticGeoDataset = {
  countryCode: string
  source: string
  expectedRegions: number
  expectedPlaces: number
  regions: StaticGeoRegion[]
  places: StaticGeoPlace[]
}

const danishMunicipalitiesByRegion: Record<string, string[]> = {
  'Region Hovedstaden': [
    'Albertslund',
    'Aller\u00f8d',
    'Ballerup',
    'Bornholm',
    'Br\u00f8ndby',
    'Drag\u00f8r',
    'Egedal',
    'Fredensborg',
    'Frederiksberg',
    'Frederikssund',
    'Fures\u00f8',
    'Gentofte',
    'Gladsaxe',
    'Glostrup',
    'Gribskov',
    'Halsn\u00e6s',
    'Helsing\u00f8r',
    'Herlev',
    'Hiller\u00f8d',
    'Hvidovre',
    'H\u00f8je-Taastrup',
    'H\u00f8rsholm',
    'Ish\u00f8j',
    'K\u00f8benhavn',
    'Lyngby-Taarb\u00e6k',
    'Rudersdal',
    'R\u00f8dovre',
    'T\u00e5rnby',
    'Vallensb\u00e6k',
  ],
  'Region Midtjylland': [
    'Favrskov',
    'Hedensted',
    'Herning',
    'Holstebro',
    'Horsens',
    'Ikast-Brande',
    'Lemvig',
    'Norddjurs',
    'Odder',
    'Randers',
    'Ringk\u00f8bing-Skjern',
    'Sams\u00f8',
    'Silkeborg',
    'Skanderborg',
    'Skive',
    'Struer',
    'Syddjurs',
    'Viborg',
    'Aarhus',
  ],
  'Region Nordjylland': [
    'Br\u00f8nderslev',
    'Frederikshavn',
    'Hj\u00f8rring',
    'Jammerbugt',
    'L\u00e6s\u00f8',
    'Mariagerfjord',
    'Mors\u00f8',
    'Rebild',
    'Thisted',
    'Vesthimmerlands',
    'Aalborg',
  ],
  'Region Sj\u00e6lland': [
    'Faxe',
    'Greve',
    'Guldborgsund',
    'Holb\u00e6k',
    'Kalundborg',
    'K\u00f8ge',
    'Lejre',
    'Lolland',
    'N\u00e6stved',
    'Odsherred',
    'Ringsted',
    'Roskilde',
    'Slagelse',
    'Solr\u00f8d',
    'Sor\u00f8',
    'Stevns',
    'Vordingborg',
  ],
  'Region Syddanmark': [
    'Assens',
    'Billund',
    'Esbjerg',
    'Fan\u00f8',
    'Faaborg-Midtfyn',
    'Fredericia',
    'Haderslev',
    'Kerteminde',
    'Kolding',
    'Langeland',
    'Middelfart',
    'Nordfyns',
    'Nyborg',
    'Odense',
    'Svendborg',
    'S\u00f8nderborg',
    'T\u00f8nder',
    'Varde',
    'Vejen',
    'Vejle',
    '\u00c6r\u00f8',
    'Aabenraa',
  ],
}

const danishRegions: StaticGeoRegion[] = Object.keys(danishMunicipalitiesByRegion).map((name, index) => ({
  code: slug(name),
  name,
  sortOrder: index + 1,
}))

const denmarkDataset: StaticGeoDataset = {
  countryCode: 'DK',
  source: 'danish-regions-and-municipalities-complete-98',
  expectedRegions: 5,
  expectedPlaces: 98,
  regions: danishRegions,
  places: danishRegions.flatMap((region) =>
    (danishMunicipalitiesByRegion[region.name] || []).map((name) => ({
      code: `${region.code}:${slug(name)}`,
      name,
      regionCode: region.code,
      regionName: region.name,
      city: name,
      postalCode: null,
    })),
  ),
}

const swedenRegions = swedishCounties.map((county, index) => ({
  code: county.slug,
  name: repairMojibake(county.name),
  sortOrder: index + 1,
}))

const swedenDataset: StaticGeoDataset = {
  countryCode: 'SE',
  source: 'scb-generated-swedish-regions-complete-290',
  expectedRegions: 21,
  expectedPlaces: 290,
  regions: swedenRegions,
  places: swedishMunicipalities.map((municipality) => ({
    code: `${municipality.countySlug}:${municipality.slug}`,
    name: repairMojibake(municipality.name),
    regionCode: municipality.countySlug,
    regionName: repairMojibake(municipality.county),
    city: repairMojibake(municipality.name),
    postalCode: null,
  })),
}

const finlandRegionsByCode = new Map<string, StaticGeoRegion & { municipalities: string[] }>()
for (const row of finlandRows as FinlandGeoRow[]) {
  const regionName = classificationName(row.targetItem)
  const municipalityName = classificationName(row.sourceItem)
  const regionCode = slug(regionName)
  if (!finlandRegionsByCode.has(regionCode)) {
    finlandRegionsByCode.set(regionCode, {
      code: regionCode,
      name: regionName,
      sortOrder: finlandRegionsByCode.size + 1,
      municipalities: [],
    })
  }
  finlandRegionsByCode.get(regionCode)?.municipalities.push(municipalityName)
}

const finlandRegions = [...finlandRegionsByCode.values()]
  .sort((a, b) => a.name.localeCompare(b.name, 'en'))
  .map((region, index) => ({ ...region, sortOrder: index + 1 }))

const finlandDataset: StaticGeoDataset = {
  countryCode: 'FI',
  source: 'statistics-finland-2026-complete-308',
  expectedRegions: 19,
  expectedPlaces: 308,
  regions: finlandRegions.map(({ municipalities, ...region }) => region),
  places: finlandRegions.flatMap((region) =>
    region.municipalities.map((name) => ({
      code: `${region.code}:${slug(name)}`,
      name,
      regionCode: region.code,
      regionName: region.name,
      city: name,
      postalCode: null,
    })),
  ),
}

const netherlandsDataset = buildSmallMarketDataset({
  countryCode: 'NL',
  source: 'cbs-netherlands-municipalities-2026-complete-342',
  expectedRegions: 12,
  expectedPlaces: 342,
  rows: netherlandsRows as SmallMarketGeoRow[],
})

const belgiumDataset = buildSmallMarketDataset({
  countryCode: 'BE',
  source: 'statbel-refnis-2025-active-municipalities-complete-564',
  expectedRegions: 11,
  expectedPlaces: 564,
  rows: belgiumRows as SmallMarketGeoRow[],
})

const austriaDataset = buildSmallMarketDataset({
  countryCode: 'AT',
  source: 'statistik-austria-gemeinden-2026-complete-2114',
  expectedRegions: 9,
  expectedPlaces: 2114,
  rows: austriaRows as SmallMarketGeoRow[],
})

const largeRegionDatasets = [
  buildRegionOnlyDataset('FR', 'autorell-region-only-large-market', [
    'Auvergne-Rh\u00f4ne-Alpes',
    'Bourgogne-Franche-Comt\u00e9',
    'Bretagne',
    'Centre-Val de Loire',
    'Corse',
    'Grand Est',
    'Hauts-de-France',
    '\u00cele-de-France',
    'Normandie',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Pays de la Loire',
    'Provence-Alpes-C\u00f4te d\u2019Azur',
  ]),
  buildRegionOnlyDataset('DE', 'autorell-region-only-large-market', [
    'Baden-W\u00fcrttemberg',
    'Bayern',
    'Berlin',
    'Brandenburg',
    'Bremen',
    'Hamburg',
    'Hessen',
    'Mecklenburg-Vorpommern',
    'Niedersachsen',
    'Nordrhein-Westfalen',
    'Rheinland-Pfalz',
    'Saarland',
    'Sachsen',
    'Sachsen-Anhalt',
    'Schleswig-Holstein',
    'Th\u00fcringen',
  ]),
  buildRegionOnlyDataset('ES', 'autorell-region-only-large-market', [
    'Andaluc\u00eda',
    'Arag\u00f3n',
    'Asturias',
    'Illes Balears',
    'Canarias',
    'Cantabria',
    'Castilla-La Mancha',
    'Castilla y Le\u00f3n',
    'Catalu\u00f1a',
    'Comunitat Valenciana',
    'Extremadura',
    'Galicia',
    'La Rioja',
    'Madrid',
    'Murcia',
    'Navarra',
    'Pa\u00eds Vasco',
  ]),
  buildRegionOnlyDataset('IT', 'autorell-region-only-large-market', [
    'Abruzzo',
    'Basilicata',
    'Calabria',
    'Campania',
    'Emilia-Romagna',
    'Friuli-Venezia Giulia',
    'Lazio',
    'Liguria',
    'Lombardia',
    'Marche',
    'Molise',
    'Piemonte',
    'Puglia',
    'Sardegna',
    'Sicilia',
    'Toscana',
    'Trentino-Alto Adige',
    'Umbria',
    'Valle d\u2019Aosta',
    'Veneto',
  ]),
  buildRegionOnlyDataset('PL', 'autorell-region-only-large-market', [
    'Dolno\u015bl\u0105skie',
    'Kujawsko-Pomorskie',
    'Lubelskie',
    'Lubuskie',
    '\u0141\u00f3dzkie',
    'Ma\u0142opolskie',
    'Mazowieckie',
    'Opolskie',
    'Podkarpackie',
    'Podlaskie',
    'Pomorskie',
    '\u015al\u0105skie',
    '\u015awi\u0119tokrzyskie',
    'Warmi\u0144sko-Mazurskie',
    'Wielkopolskie',
    'Zachodniopomorskie',
  ]),
]
const datasets = new Map([
  [austriaDataset.countryCode, austriaDataset],
  [belgiumDataset.countryCode, belgiumDataset],
  [denmarkDataset.countryCode, denmarkDataset],
  [swedenDataset.countryCode, swedenDataset],
  [finlandDataset.countryCode, finlandDataset],
  [netherlandsDataset.countryCode, netherlandsDataset],
  ...largeRegionDatasets.map((dataset) => [dataset.countryCode, dataset] as const),
])

for (const dataset of datasets.values()) {
  if (dataset.regions.length !== dataset.expectedRegions) {
    throw new Error(`${dataset.countryCode} geo dataset has ${dataset.regions.length} regions, expected ${dataset.expectedRegions}`)
  }
  if (dataset.places.length !== dataset.expectedPlaces) {
    throw new Error(`${dataset.countryCode} geo dataset has ${dataset.places.length} places, expected ${dataset.expectedPlaces}`)
  }
}

export function getStaticGeoDataset(countryCode: string) {
  return datasets.get(countryCode.toUpperCase()) || null
}

export function staticGeoDatasets() {
  return [...datasets.values()]
}

export function normalizeGeoName(value: string) {
  return foldGeoLetters(repairMojibake(value))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function slug(value: string) {
  return normalizeGeoName(value).replace(/\s+/g, '-')
}

function buildSmallMarketDataset({
  countryCode,
  source,
  expectedRegions,
  expectedPlaces,
  rows,
}: {
  countryCode: string
  source: string
  expectedRegions: number
  expectedPlaces: number
  rows: SmallMarketGeoRow[]
}): StaticGeoDataset {
  const regionsByCode = new Map<string, StaticGeoRegion>()
  for (const row of rows) {
    if (!regionsByCode.has(row.regionCode)) {
      regionsByCode.set(row.regionCode, {
        code: slug(row.regionCode),
        name: row.regionName,
        sortOrder: regionsByCode.size + 1,
      })
    }
  }
  const regions = [...regionsByCode.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'))
  regions.forEach((region, index) => {
    region.sortOrder = index + 1
  })
  const regionCodeBySourceCode = new Map(
    [...regionsByCode.entries()].map(([sourceCode, region]) => [sourceCode, region.code]),
  )
  const regionNameBySourceCode = new Map(
    [...regionsByCode.entries()].map(([sourceCode, region]) => [sourceCode, region.name]),
  )

  return {
    countryCode,
    source,
    expectedRegions,
    expectedPlaces,
    regions,
    places: rows.map((row) => ({
      code: `${regionCodeBySourceCode.get(row.regionCode)}:${slug(row.municipalityCode || row.municipalityName)}`,
      name: row.municipalityName,
      regionCode: regionCodeBySourceCode.get(row.regionCode) || slug(row.regionCode),
      regionName: regionNameBySourceCode.get(row.regionCode) || row.regionName,
      city: row.municipalityName,
      postalCode: null,
    })),
  }
}

function buildRegionOnlyDataset(countryCode: string, source: string, regionNames: string[]): StaticGeoDataset {
  return {
    countryCode,
    source,
    expectedRegions: regionNames.length,
    expectedPlaces: 0,
    regions: regionNames.map((name, index) => ({
      code: slug(name),
      name,
      sortOrder: index + 1,
    })),
    places: [],
  }
}

function foldGeoLetters(value: string) {
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

function repairMojibake(value: string) {
  return value
    .replaceAll('ÃƒÂ¥', '\u00e5')
    .replaceAll('ÃƒÂ¤', '\u00e4')
    .replaceAll('ÃƒÂ¶', '\u00f6')
    .replaceAll('Ãƒâ€¦', '\u00c5')
    .replaceAll('Ãƒâ€ž', '\u00c4')
    .replaceAll('Ãƒâ€“', '\u00d6')
    .replaceAll('ÃƒÂ¸', '\u00f8')
    .replaceAll('ÃƒÂ¦', '\u00e6')
    .replaceAll('Ãƒâ€ ', '\u00c6')
    .replaceAll('ÃƒÂ©', '\u00e9')
    .replaceAll('ÃƒÂ¨', '\u00e8')
    .replaceAll('ÃƒÂª', '\u00ea')
    .replaceAll('ÃƒÂ¼', '\u00fc')
    .replaceAll('ÃƒÂ´', '\u00f4')
    .replaceAll('ÃƒÂ§', '\u00e7')
}

type FinlandGeoRow = {
  sourceItem: FinlandGeoItem
  targetItem: FinlandGeoItem
}

type FinlandGeoItem = {
  classificationItemNames?: Array<{
    lang?: string
    name?: string
  }>
}

type SmallMarketGeoRow = {
  regionCode: string
  regionName: string
  municipalityCode: string
  municipalityName: string
}

function classificationName(item: FinlandGeoItem) {
  const name = item.classificationItemNames?.find((entry) => entry.lang === 'en')?.name
  if (!name) throw new Error('Missing Finland geo classification name')
  return name
}






