import { swedishCounties } from './swedish-locations'

type SwedishLocationInput = {
  city?: string | null
  municipality?: string | null
  country?: string | null
  countryCode?: string | null
}

type SwedishLocationMatch = {
  municipality: string
  county: string
}

const localityToMunicipality: Record<string, string> = {
  alta: 'Nacka',
  alvsjo: 'Stockholm',
  alsten: 'Stockholm',
  bagarmossen: 'Stockholm',
  bandhagen: 'Stockholm',
  boo: 'Nacka',
  bromma: 'Stockholm',
  enskede: 'Stockholm',
  farsta: 'Stockholm',
  gustavsberg: 'Varmdo',
  hammarbyhojden: 'Stockholm',
  hasselby: 'Stockholm',
  hagersten: 'Stockholm',
  kista: 'Stockholm',
  kungsholmen: 'Stockholm',
  liljeholmen: 'Stockholm',
  'nacka strand': 'Nacka',
  orminge: 'Nacka',
  'saltsjo-boo': 'Nacka',
  saltsjoboo: 'Nacka',
  saltsjobaden: 'Nacka',
  skarpnack: 'Stockholm',
  sodermalm: 'Stockholm',
  'taby centrum': 'Taby',
  vasastan: 'Stockholm',
  vallingby: 'Stockholm',
  arsta: 'Stockholm',
  ostermalm: 'Stockholm',
}

const municipalityNames = swedishCounties.flatMap((county) => county.municipalities)
const municipalityByNormalized = new Map(
  municipalityNames.map((municipality) => [normalizeSwedishLocationKey(municipality), municipality]),
)
const countyByMunicipality = new Map(
  swedishCounties.flatMap((county) =>
    county.municipalities.map((municipality) => [
      normalizeSwedishLocationKey(municipality),
      county.name,
    ] as const),
  ),
)
const countyByNormalized = new Map(
  swedishCounties.flatMap((county) => {
    const key = normalizeSwedishCountyKey(county.name)
    return [
      [key, county],
    ] as const
  }),
)

const aliasesByMunicipality = Object.entries(localityToMunicipality).reduce((map, [locality, municipality]) => {
  const normalizedMunicipality = normalizeSwedishLocationKey(municipality)
  const values = map.get(normalizedMunicipality) || []
  values.push(locality)
  map.set(normalizedMunicipality, values)
  return map
}, new Map<string, string[]>())

export function normalizeSwedishLocationKey(value: string) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('sv-SE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function inferSwedishLocation(input: SwedishLocationInput): SwedishLocationMatch {
  const country = String(input.countryCode || input.country || '').toUpperCase()
  if (country && country !== 'SE') return emptySwedishLocationMatch()

  const candidates = [
    input.municipality,
    input.city,
    ...splitLocationParts(input.municipality),
    ...splitLocationParts(input.city),
  ]

  for (const candidate of candidates) {
    const key = normalizeSwedishLocationKey(candidate || '')
    if (!key) continue
    const municipality = municipalityByNormalized.get(key)
    if (municipality) return locationMatchForMunicipality(municipality)
  }

  for (const candidate of candidates) {
    const key = normalizeSwedishLocationKey(candidate || '')
    if (!key) continue
    const municipality = localityToMunicipality[key]
    if (municipality) {
      return locationMatchForMunicipality(
        municipalityByNormalized.get(normalizeSwedishLocationKey(municipality)) || municipality,
      )
    }
  }

  return emptySwedishLocationMatch()
}

export function inferSwedishMunicipality(input: SwedishLocationInput) {
  return inferSwedishLocation(input).municipality
}

export function swedishMunicipalitySearchTerms(municipality: string) {
  const key = normalizeSwedishLocationKey(municipality)
  const official = municipalityByNormalized.get(key) || municipality.trim()
  if (!official) return []

  return [...new Set([official, ...(aliasesByMunicipality.get(normalizeSwedishLocationKey(official)) || [])])]
}

export function swedishCountyMunicipalitySearchTerms(county: string) {
  const key = normalizeSwedishCountyKey(county)
  const countyMatch = countyByNormalized.get(key)
  if (!countyMatch) return []

  return [
    ...new Set(
      countyMatch.municipalities.flatMap((municipality) =>
        swedishMunicipalitySearchTerms(municipality),
      ),
    ),
  ]
}

function normalizeSwedishCountyKey(value: string) {
  const key = normalizeSwedishLocationKey(value).replace(/\s+lan$/, '')
  return key.endsWith('s') ? key.slice(0, -1) : key
}

function locationMatchForMunicipality(municipality: string): SwedishLocationMatch {
  const key = normalizeSwedishLocationKey(municipality)
  return {
    municipality,
    county: countyByMunicipality.get(key) || '',
  }
}

function emptySwedishLocationMatch(): SwedishLocationMatch {
  return {
    municipality: '',
    county: '',
  }
}

function splitLocationParts(value?: string | null) {
  return String(value || '')
    .split(/[\/,|]+|\s+-\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
}
