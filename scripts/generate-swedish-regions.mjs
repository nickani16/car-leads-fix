import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const sourceUrl =
  'https://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0101/BE0101A/BefolkningNy'

const response = await fetch(sourceUrl)
if (!response.ok) {
  throw new Error(`SCB request failed with status ${response.status}`)
}

const data = await response.json()
const region = data.variables.find((variable) => variable.code === 'Region')
if (!region) throw new Error('SCB response did not contain Region data')

function slugify(value) {
  return value
    .toLocaleLowerCase('sv-SE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const counties = []
const municipalities = []
let currentCounty = null

for (let index = 0; index < region.values.length; index += 1) {
  const code = region.values[index]
  const name = region.valueTexts[index]

  if (code === '00') continue

  if (code.length === 2) {
    currentCounty = {
      code,
      name,
      slug: slugify(name),
    }
    counties.push(currentCounty)
    continue
  }

  if (code.length === 4 && currentCounty) {
    municipalities.push({
      code,
      name,
      slug: slugify(name),
      countyCode: currentCounty.code,
      county: currentCounty.name,
      countySlug: currentCounty.slug,
    })
  }
}

const municipalitiesBySlug = new Map()
for (const municipality of municipalities) {
  const matchingMunicipalities =
    municipalitiesBySlug.get(municipality.slug) || []
  matchingMunicipalities.push(municipality)
  municipalitiesBySlug.set(municipality.slug, matchingMunicipalities)
}

for (const matchingMunicipalities of municipalitiesBySlug.values()) {
  if (matchingMunicipalities.length < 2) continue

  for (const municipality of matchingMunicipalities) {
    municipality.slug = `${municipality.slug}-${municipality.countySlug.replace(/-lan$/, '')}`
  }
}

if (counties.length !== 21 || municipalities.length !== 290) {
  throw new Error(
    `Unexpected SCB region count: ${counties.length} counties, ${municipalities.length} municipalities`
  )
}

const header = `// Generated from SCB: ${sourceUrl}
// Do not edit manually. Run: node scripts/generate-swedish-regions.mjs

export type SwedishCounty = {
  code: string
  name: string
  slug: string
}

export type SwedishMunicipality = {
  code: string
  name: string
  slug: string
  countyCode: string
  county: string
  countySlug: string
}

`

const output = `${header}export const swedishCounties: SwedishCounty[] = ${JSON.stringify(
  counties,
  null,
  2
)}

export const swedishMunicipalities: SwedishMunicipality[] = ${JSON.stringify(
  municipalities,
  null,
  2
)}
`

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.resolve(
  currentDirectory,
  '../lib/swedish-regions.generated.ts'
)

await writeFile(outputPath, output, 'utf8')
console.log(
  `Generated ${municipalities.length} municipalities and ${counties.length} counties`
)
