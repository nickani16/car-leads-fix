'use client'

import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl'
import { MapPin } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { getMapStyle } from '@/lib/map-style'

type ListingLocationMapProps = {
  latitude?: number | null
  longitude?: number | null
  title: string
  address?: string | null
  city?: string | null
  country?: string | null
  approximate?: boolean
}

export default function ListingLocationMap({
  latitude,
  longitude,
  title,
  address,
  city,
  country,
  approximate = false,
}: ListingLocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<MapLibreMarker | null>(null)
  const mapStyle = getMapStyle()
  const hasCoordinates =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  const locationText = [address, [city, country].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' · ')
  const fallbackTiles = hasCoordinates
    ? getFallbackTileUrls(latitude as number, longitude as number)
    : []

  useEffect(() => {
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !containerRef.current ||
      mapRef.current
    ) {
      return
    }
    let cancelled = false
    const coordinates: [number, number] = [longitude, latitude]

    async function loadMap() {
      const maplibregl = await import('maplibre-gl')
      if (cancelled || !containerRef.current) return

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: mapStyle,
        center: coordinates,
        zoom: 12,
        attributionControl: { compact: true },
      })
      const marker = new maplibregl.Marker({ color: '#0866ff' })
        .setLngLat(coordinates)
        .addTo(map)

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
      mapRef.current = map
      markerRef.current = marker
    }

    loadMap()

    return () => {
      cancelled = true
      markerRef.current?.remove()
      markerRef.current = null
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [latitude, longitude, mapStyle])

  if (!hasCoordinates) {
    return (
      <LocationFallback title={title} locationText={locationText} />
    )
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-[#dfe6f2] bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-[#edf1f6] px-4 py-4 sm:px-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#edf4ff] text-[#0866ff]">
          <MapPin className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#101828]">{title}</h2>
          {locationText ? (
            <p className="mt-1 text-sm font-medium leading-5 text-[#667085]">{locationText}</p>
          ) : null}
          {approximate ? (
            <p className="mt-1 text-xs font-semibold text-[#0866ff]">Ungefärlig position baserad på ort.</p>
          ) : null}
        </div>
      </div>
      <div className="relative h-[320px] w-full overflow-hidden bg-[#eef3f8] sm:h-[380px]">
        <div ref={containerRef} className="absolute inset-0 z-0" />
        {fallbackTiles.length ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 grid grid-cols-3 grid-rows-3 opacity-100">
            {fallbackTiles.map((tile) => (
              <span
                key={tile}
                className="block bg-cover bg-center"
                style={{ backgroundImage: `url(${tile})` }}
              />
            ))}
          </div>
        ) : null}
        <span className="pointer-events-none absolute left-1/2 top-1/2 z-20 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#0866ff] shadow-[0_8px_22px_rgba(16,24,40,.26)]">
          <MapPin className="h-7 w-7 fill-[#0866ff]/15" />
        </span>
      </div>
    </div>
  )
}

function LocationFallback({
  title,
  locationText,
}: {
  title: string
  locationText: string
}) {
  return (
    <div className="rounded-[16px] border border-[#dfe6f2] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#edf4ff] text-[#0866ff]">
          <MapPin className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#101828]">{title}</h2>
          <p className="mt-1 text-sm font-medium leading-6 text-[#667085]">
            {locationText || 'Plats visas av säljaren när mer information finns.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function getFallbackTileUrls(latitude: number, longitude: number, zoom = 12) {
  const tile = getTileCoordinate(latitude, longitude, zoom)
  const tiles: string[] = []

  for (let y = tile.y - 1; y <= tile.y + 1; y += 1) {
    for (let x = tile.x - 1; x <= tile.x + 1; x += 1) {
      tiles.push(`https://a.basemaps.cartocdn.com/light_all/${zoom}/${x}/${y}.png`)
    }
  }

  return tiles
}

function getTileCoordinate(latitude: number, longitude: number, zoom: number) {
  const latRad = (latitude * Math.PI) / 180
  const scale = 2 ** zoom
  const x = Math.floor(((longitude + 180) / 360) * scale)
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale,
  )

  return { x, y }
}
