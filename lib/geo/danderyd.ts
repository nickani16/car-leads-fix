import 'server-only'

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { GeoArea, GeoJsonFeature } from './geojson'

const danderydFeature = JSON.parse(
  readFileSync(join(process.cwd(), 'data/geo/se/municipalities/danderyd.geojson'), 'utf8').replace(/^\uFEFF/, ''),
) as GeoJsonFeature
const danderydBounds =
  danderydFeature.bbox || ([17.9914981, 59.3654089, 18.1224934, 59.4413844] as const)

export const danderydGeoArea: GeoArea = {
  id: 'SE:municipality:danderyd',
  countryCode: 'SE',
  municipalityCode: '0162',
  name: 'Danderyd',
  slug: 'danderyd',
  bounds: [danderydBounds[0], danderydBounds[1], danderydBounds[2], danderydBounds[3]],
  center: [18.0373, 59.4057],
  geometry: danderydFeature.geometry,
  source:
    typeof danderydFeature.properties.source === 'string'
      ? danderydFeature.properties.source
      : 'OpenStreetMap boundary relation 398034 via Nominatim polygon_geojson',
}

export const danderydMarketplaceBounds = {
  west: danderydGeoArea.bounds[0],
  south: danderydGeoArea.bounds[1],
  east: danderydGeoArea.bounds[2],
  north: danderydGeoArea.bounds[3],
}
