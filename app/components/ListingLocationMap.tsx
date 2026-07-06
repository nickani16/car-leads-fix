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
      <div ref={containerRef} className="h-[320px] w-full bg-[#eef3f8] sm:h-[380px]" />
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
