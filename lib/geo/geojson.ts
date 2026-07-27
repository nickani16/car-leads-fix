export type GeoJsonPosition = [number, number] | [number, number, number]

export type GeoJsonPolygon = {
  type: 'Polygon'
  coordinates: GeoJsonPosition[][]
}

export type GeoJsonMultiPolygon = {
  type: 'MultiPolygon'
  coordinates: GeoJsonPosition[][][]
}

export type GeoJsonGeometry = GeoJsonPolygon | GeoJsonMultiPolygon

export type GeoJsonFeature = {
  type: 'Feature'
  bbox?: [number, number, number, number]
  properties: Record<string, unknown>
  geometry: GeoJsonGeometry
}

export type GeoJsonFeatureCollection = {
  type: 'FeatureCollection'
  features: GeoJsonFeature[]
}

export type GeoArea = {
  id: 'SE:municipality:danderyd'
  countryCode: 'SE'
  municipalityCode: '0162'
  name: 'Danderyd'
  slug: 'danderyd'
  bounds: [number, number, number, number]
  center: [number, number]
  geometry: GeoJsonGeometry
  source: string
}

export function geoAreaToFeature(area: GeoArea): GeoJsonFeature {
  return {
    type: 'Feature',
    bbox: area.bounds,
    properties: {
      id: area.id,
      countryCode: area.countryCode,
      municipalityCode: area.municipalityCode,
      name: area.name,
      slug: area.slug,
      source: area.source,
    },
    geometry: area.geometry,
  }
}

export function geoAreaToFeatureCollection(area: GeoArea): GeoJsonFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [geoAreaToFeature(area)],
  }
}
