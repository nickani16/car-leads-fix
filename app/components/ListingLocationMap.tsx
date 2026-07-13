'use client'

import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl'
import { Layers, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getMapStyle, getStandardFallbackTileUrl, type AutorellMapLayer } from '@/lib/map-style'

type ListingLocationMapProps = {
  latitude?: number | null
  longitude?: number | null
  title: string
  listingId?: string
  address?: string | null
  postalCode?: string | null
  city?: string | null
  country?: string | null
  approximate?: boolean
  mapSource?: string | null
  mapQuery?: string | null
}

export default function ListingLocationMap({
  latitude,
  longitude,
  title,
  listingId,
  address,
  postalCode,
  city,
  country,
  approximate = false,
  mapSource = null,
  mapQuery = null,
}: ListingLocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<MapLibreMarker | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapFailed, setMapFailed] = useState(false)
  const [mapLayer, setMapLayer] = useState<AutorellMapLayer>('standard')
  const [actualMapCenter, setActualMapCenter] = useState<{ latitude: number; longitude: number } | null>(null)
  const hasCoordinates =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    !(latitude === 0 && longitude === 0)
  const locationText = [address, [postalCode, city].filter(Boolean).join(' '), country]
    .filter(Boolean)
    .join(', ')
  const fallbackTiles = hasCoordinates
    ? getFallbackTileUrls(latitude as number, longitude as number, 12, mapLayer)
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

      try {
        const map = new maplibregl.Map({
          container: containerRef.current,
          style: getMapStyle(mapLayer),
          center: coordinates,
          zoom: approximate ? 11 : 12.5,
          attributionControl: { compact: true },
        })
        const marker = new maplibregl.Marker({ color: '#0866ff' })
          .setLngLat(coordinates)
          .addTo(map)

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
        const updateActualCenter = () => {
          const center = map.getCenter()
          setActualMapCenter({ latitude: center.lat, longitude: center.lng })
        }
        map.once('load', () => {
          if (!cancelled) {
            setMapReady(true)
            setMapFailed(false)
            updateActualCenter()
          }
        })
        map.on('moveend', updateActualCenter)
        mapRef.current = map
        markerRef.current = marker
      } catch {
        if (!cancelled) {
          setMapReady(false)
          setMapFailed(true)
        }
      }
    }

    loadMap()

    return () => {
      cancelled = true
      markerRef.current?.remove()
      markerRef.current = null
      mapRef.current?.remove()
      mapRef.current = null
      setActualMapCenter(null)
      setMapReady(false)
      setMapFailed(false)
    }
  }, [approximate, latitude, longitude, mapLayer])

  if (!hasCoordinates) {
    return (
      <LocationFallback
        title={title}
        listingId={listingId}
        locationText={locationText}
        address={address}
        postalCode={postalCode}
        city={city}
        country={country}
      />
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
            <p className="mt-1 text-xs font-semibold text-[#0866ff]">Ungefärlig position baserad på annonsens postnummer, ort och land.</p>
          ) : null}
        </div>
      </div>
      <div className="relative h-[320px] w-full overflow-hidden bg-[#eef3f8] sm:h-[380px]">
        {fallbackTiles.length ? (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-0 grid grid-cols-3 grid-rows-3 transition-opacity duration-300 ${
              mapReady && !mapFailed ? 'opacity-0' : 'opacity-100'
            } ${mapLayer === 'satellite' ? 'brightness-[.82] saturate-[1.08]' : ''}`}
          >
            {fallbackTiles.map((tile) => (
              <span
                key={tile}
                className="block bg-cover bg-center"
                style={{ backgroundImage: `url(${tile})` }}
              />
            ))}
          </div>
        ) : null}
        <div ref={containerRef} className="absolute inset-0 z-10 h-full w-full" />
        <div className="absolute right-3 top-3 z-20">
          <ListingMapLayerPicker mapLayer={mapLayer} onMapLayerChange={setMapLayer} />
        </div>
        {!mapReady || mapFailed ? (
          <span className="pointer-events-none absolute left-1/2 top-1/2 z-20 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#0866ff] shadow-[0_8px_22px_rgba(16,24,40,.26)]">
            <MapPin className="h-7 w-7 fill-[#0866ff]/15" />
          </span>
        ) : null}
        <span className="pointer-events-none absolute left-4 top-4 z-20 hidden rounded-[8px] bg-white/95 px-3 py-2 text-xs font-semibold text-[#101828] shadow-[0_10px_24px_rgba(16,24,40,.16)] backdrop-blur sm:inline-flex">
          <MapPin className="h-7 w-7 fill-[#0866ff]/15" />
          <span className="ml-2">{city || country}</span>
        </span>
      </div>
      <ListingMapDebug
        listingId={listingId}
        address={address}
        postalCode={postalCode}
        city={city}
        country={country}
        latitude={latitude}
        longitude={longitude}
        actualMapCenter={actualMapCenter}
        mapSource={mapSource}
        mapQuery={mapQuery}
      />
    </div>
  )
}

function ListingMapLayerPicker({
  mapLayer,
  onMapLayerChange,
}: {
  mapLayer: AutorellMapLayer
  onMapLayerChange: (layer: AutorellMapLayer) => void
}) {
  return (
    <div className="inline-flex h-11 overflow-hidden rounded-[8px] border border-[#0866ff] bg-white p-1 shadow-lg shadow-[#0866ff]/15">
      <button
        type="button"
        onClick={() => onMapLayerChange('standard')}
        className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 text-sm font-semibold transition ${
          mapLayer === 'standard'
            ? 'bg-[#0866ff] text-white'
            : 'bg-white text-[#0866ff] hover:bg-[#eef5ff]'
        }`}
      >
        <Layers className="h-4 w-4" />
        Karta
      </button>
      <button
        type="button"
        onClick={() => onMapLayerChange('satellite')}
        className={`inline-flex items-center rounded-[8px] px-3 text-sm font-semibold transition ${
          mapLayer === 'satellite'
            ? 'bg-[#0866ff] text-white'
            : 'bg-white text-[#0866ff] hover:bg-[#eef5ff]'
        }`}
      >
        Satellit
      </button>
    </div>
  )
}

function LocationFallback({
  title,
  listingId,
  locationText,
  address,
  postalCode,
  city,
  country,
}: {
  title: string
  listingId?: string
  locationText: string
  address?: string | null
  postalCode?: string | null
  city?: string | null
  country?: string | null
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
            {locationText || 'Ingen kartposition kan visas eftersom annonsen saknar tillräcklig sparad platsdata.'}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Kartan visas först när annonsen har egna koordinater eller en adress/postnummer som kan geokodas.
          </p>
        </div>
      </div>
      <ListingMapDebug
        listingId={listingId}
        address={address}
        postalCode={postalCode}
        city={city}
        country={country}
        latitude={null}
        longitude={null}
        actualMapCenter={null}
        mapSource="no_listing_location"
        mapQuery={null}
      />
    </div>
  )
}

function ListingMapDebug({
  listingId,
  address,
  postalCode,
  city,
  country,
  latitude,
  longitude,
  actualMapCenter,
  mapSource,
  mapQuery,
}: {
  listingId?: string
  address?: string | null
  postalCode?: string | null
  city?: string | null
  country?: string | null
  latitude?: number | null
  longitude?: number | null
  actualMapCenter: { latitude: number; longitude: number } | null
  mapSource?: string | null
  mapQuery?: string | null
}) {
  if (process.env.NODE_ENV === 'production') return null

  return (
    <details className="border-t border-[#edf1f6] bg-[#f8fafc] px-4 py-3 text-xs leading-5 text-[#475467]">
      <summary className="cursor-pointer font-semibold text-[#101828]">Listing map debug</summary>
      <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
        <DebugLine label="listing id" value={listingId} />
        <DebugLine label="address" value={address} />
        <DebugLine label="postal code" value={postalCode} />
        <DebugLine label="city" value={city} />
        <DebugLine label="country" value={country} />
        <DebugLine label="latitude" value={formatDebugNumber(latitude)} />
        <DebugLine label="longitude" value={formatDebugNumber(longitude)} />
        <DebugLine
          label="actual map center"
          value={
            actualMapCenter
              ? `${formatDebugNumber(actualMapCenter.latitude)}, ${formatDebugNumber(actualMapCenter.longitude)}`
              : null
          }
        />
        <DebugLine label="map source" value={mapSource} />
        <DebugLine label="geocode query" value={mapQuery} />
      </dl>
    </details>
  )
}

function DebugLine({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-2">
      <dt className="font-semibold">{label}</dt>
      <dd className="min-w-0 break-words">{value ?? 'null'}</dd>
    </div>
  )
}

function formatDebugNumber(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(6) : null
}

function getFallbackTileUrls(
  latitude: number,
  longitude: number,
  zoom = 12,
  layer: AutorellMapLayer = 'standard',
) {
  const tile = getTileCoordinate(latitude, longitude, zoom)
  const tiles: string[] = []

  for (let y = tile.y - 1; y <= tile.y + 1; y += 1) {
    for (let x = tile.x - 1; x <= tile.x + 1; x += 1) {
      tiles.push(
        layer === 'satellite'
          ? `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`
          : getStandardFallbackTileUrl(zoom, x, y),
      )
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

