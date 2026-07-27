import { cleanSeoText } from './market-seo'
import {
  resolveMarketplaceGeoArea,
  type MarketplaceGeoArea,
} from './marketplace-search-state'

type SwedishCarGeoLanding = {
  market: 'se'
  category: 'cars'
  municipalitySlug: string
  municipalityName: string
  municipalityOfficialName: string
  makeSlug: string | null
  make: string | null
  geoArea: MarketplaceGeoArea
  canonicalPath: string
  h1: string
  title: string
  description: string
  zeroResultsText: string
}

const swedishMunicipalityLandings = {
  danderyd: {
    name: 'Danderyd',
    officialName: 'Danderyds kommun',
    geoAreaId: 'SE:municipality:danderyd',
  },
  goteborg: {
    name: 'G\u00f6teborg',
    officialName: 'G\u00f6teborgs kommun',
    geoAreaId: 'SE:municipality:goteborg',
  },
  kramfors: {
    name: 'Kramfors',
    officialName: 'Kramfors kommun',
    geoAreaId: 'SE:municipality:kramfors',
  },
} as const

const swedishMakeLandings = {
  bmw: 'BMW',
} as const

export function resolveSwedishCarGeoLanding(
  market: string,
  segments: string[] | undefined,
): SwedishCarGeoLanding | null {
  if (market !== 'se' || !segments?.length) return null
  if (segments.length !== 1 && segments.length !== 2) return null

  const [first, second] = segments.map((segment) => normalizeSeoSegment(segment))
  const makeSlug = segments.length === 2 ? first : null
  const municipalitySlug = segments.length === 2 ? second : first

  if (!municipalitySlug || !(municipalitySlug in swedishMunicipalityLandings)) {
    return null
  }
  if (makeSlug && !(makeSlug in swedishMakeLandings)) {
    return null
  }

  const municipality =
    swedishMunicipalityLandings[
      municipalitySlug as keyof typeof swedishMunicipalityLandings
    ]
  const geoArea = resolveMarketplaceGeoArea(municipality.geoAreaId)
  if (!geoArea) return null

  const make = makeSlug
    ? swedishMakeLandings[makeSlug as keyof typeof swedishMakeLandings]
    : null
  const baseLabel = make || 'Bilar'
  const h1 = `${baseLabel} till salu i ${municipality.name}`
  const canonicalPath = makeSlug
    ? `/se/bilar/${makeSlug}/${municipalitySlug}`
    : `/se/bilar/${municipalitySlug}`
  const descriptionSubject = make ? make : 'bilar'

  return {
    market: 'se',
    category: 'cars',
    municipalitySlug,
    municipalityName: municipality.name,
    municipalityOfficialName: municipality.officialName,
    makeSlug,
    make,
    geoArea,
    canonicalPath,
    h1,
    title: cleanSeoText(`${h1} | Autorell`, 60),
    description: cleanSeoText(
      `Se ${descriptionSubject} till salu i ${municipality.officialName}. J\u00e4mf\u00f6r fordon fr\u00e5n privata s\u00e4ljare och f\u00f6retag p\u00e5 Autorell.`,
      155,
    ),
    zeroResultsText: make
      ? `Inga ${make} till salu i ${municipality.name} just nu`
      : `Inga bilar till salu i ${municipality.name} just nu`,
  }
}

function normalizeSeoSegment(value: string | undefined) {
  return String(value || '').trim().toLowerCase()
}
