import type { StyleSpecification } from 'maplibre-gl'

export const fallbackMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: 'OpenStreetMap contributors, CARTO',
    },
  },
  layers: [
    {
      id: 'carto',
      type: 'raster',
      source: 'carto',
      paint: {
        'raster-opacity': 1,
        'raster-saturation': 0.08,
        'raster-contrast': -0.03,
      },
    },
  ],
}

export const fallbackSatelliteMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: 'raster',
      tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    },
  },
  layers: [
    {
      id: 'esri',
      type: 'raster',
      source: 'esri',
      paint: {
        'raster-opacity': 0.92,
        'raster-saturation': -0.08,
        'raster-contrast': -0.04,
      },
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
