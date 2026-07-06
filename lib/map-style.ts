import type { StyleSpecification } from 'maplibre-gl'

export const fallbackMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: 'OpenStreetMap contributors, CARTO',
    },
  },
  layers: [
    {
      id: 'carto',
      type: 'raster',
      source: 'carto',
    },
  ],
}

export function getMapStyle() {
  return process.env.NEXT_PUBLIC_MAP_STYLE_URL || fallbackMapStyle
}
