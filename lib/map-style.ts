import type { StyleSpecification } from 'maplibre-gl'

export const fallbackMapStyle = 'https://tiles.openfreemap.org/styles/liberty'

export const fallbackSatelliteMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    imagery: {
      type: 'raster',
      tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    },
    transportation: {
      type: 'raster',
      tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
    },
    places: {
      type: 'raster',
      tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: 'imagery',
      type: 'raster',
      source: 'imagery',
      paint: {
        'raster-opacity': 0.92,
        'raster-saturation': -0.08,
        'raster-contrast': -0.04,
      },
    },
    {
      id: 'transportation',
      type: 'raster',
      source: 'transportation',
    },
    {
      id: 'places',
      type: 'raster',
      source: 'places',
    },
  ],
}

export type AutorellMapLayer = 'standard' | 'satellite'

export function getMapStyle(layer: AutorellMapLayer = 'standard') {
  if (layer === 'satellite') {
    return process.env.NEXT_PUBLIC_SATELLITE_MAP_STYLE_URL || fallbackSatelliteMapStyle
  }

  return process.env.NEXT_PUBLIC_MAP_STYLE_URL || fallbackMapStyle
}
