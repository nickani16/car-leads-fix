'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl'
import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  Expand,
  Filter,
  Heart,
  Layers,
  MapPin,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import BrandLogo from './BrandLogo'
import CountryFlag from './CountryFlag'
import {
  AutorellBikeIcon,
  AutorellCaravanIcon,
  AutorellCarIcon,
  AutorellMotorbikeIcon,
  AutorellScooterIcon,
  AutorellTruckIcon,
  AutorellVanIcon,
} from './AutorellCategoryIcons'
import { getMapStyle } from '@/lib/map-style'
import { getEuCountryName } from '@/lib/eu-countries'
import { buildListingPath } from '@/lib/listing-url'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

type SearchMode = 'sale' | 'leasing' | 'rental'

export type VehicleSearchListing = {
  id: string
  category: string
  title: string
  make: string
  model: string
  year: string | null
  mileageKm: number | null
  fuelType: string | null
  gearbox: string | null
  bodyType: string | null
  country: string
  city: string | null
  municipality: string | null
  latitude: number | null
  longitude: number | null
  priceLabel: string
  priceValue: number
  imageUrl: string | null
  sellerName: string
  sellerIsTrader: boolean
}

const tabs: Array<{ key: SearchMode; label: string; hint: string }> = [
  { key: 'sale', label: 'Fordon till salu', hint: 'Privata och företag' },
  { key: 'leasing', label: 'Leasing', hint: 'Företagsannonser' },
  { key: 'rental', label: 'Uthyrning', hint: 'Hyresfordon' },
]

const categories = [
  { key: 'all', label: 'Alla kategorier', icon: AutorellCarIcon },
  { key: 'cars', label: 'Bilar', icon: AutorellCarIcon },
  { key: 'vans', label: 'Transportbilar', icon: AutorellVanIcon },
  { key: 'motorcycles', label: 'Motorcyklar', icon: AutorellMotorbikeIcon },
  { key: 'motorhomes', label: 'Husbilar', icon: AutorellVanIcon },
  { key: 'caravans', label: 'Husvagnar', icon: AutorellCaravanIcon },
  { key: 'trucks', label: 'Lastbilar', icon: AutorellTruckIcon },
  { key: 'agriculture', label: 'Lantbruk', icon: AutorellBikeIcon },
  { key: 'construction', label: 'Entreprenad', icon: AutorellScooterIcon },
]

const countryCenters: Record<string, [number, number]> = {
  SE: [14.5, 57.8],
  FR: [2.21, 46.23],
  DE: [10.45, 51.16],
  DK: [10.0, 56.0],
  NL: [5.29, 52.13],
  EU: [14.5, 52.0],
}

export default function VehicleSearchExperience({
  listings,
  locale = 'sv',
  defaultCountry = 'SE',
}: {
  listings: VehicleSearchListing[]
  locale?: PublicLocale
  defaultCountry?: string
}) {
  const [mode, setMode] = useState<SearchMode>('sale')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [country, setCountry] = useState(defaultCountry || 'SE')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [mobileMapOpen, setMobileMapOpen] = useState(false)
  const [sortBy, setSortBy] = useState('latest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')
  const [maxMileage, setMaxMileage] = useState('')

  const filteredListings = useMemo(() => {
    if (mode !== 'sale') return []
    const normalizedQuery = query.trim().toLowerCase()
    const minPriceValue = parseOptionalNumber(minPrice)
    const maxPriceValue = parseOptionalNumber(maxPrice)
    const minYearValue = parseOptionalNumber(minYear)
    const maxYearValue = parseOptionalNumber(maxYear)
    const maxMileageValue = parseOptionalNumber(maxMileage)
    const matches = listings.filter((listing) => {
      if (category !== 'all' && listing.category !== category) return false
      if (country && listing.country !== country) return false
      if (minPriceValue !== null && listing.priceValue < minPriceValue) return false
      if (maxPriceValue !== null && listing.priceValue > maxPriceValue) return false
      const listingYear = parseOptionalNumber(listing.year)
      if (minYearValue !== null && (listingYear === null || listingYear < minYearValue)) return false
      if (maxYearValue !== null && (listingYear === null || listingYear > maxYearValue)) return false
      if (maxMileageValue !== null && (listing.mileageKm === null || listing.mileageKm > maxMileageValue)) return false
      if (!normalizedQuery) return true
      return [
        listing.title,
        listing.make,
        listing.model,
        listing.city,
        listing.municipality,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
    return matches.sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceValue - b.priceValue
      if (sortBy === 'price-desc') return b.priceValue - a.priceValue
      if (sortBy === 'year-desc') return (parseOptionalNumber(b.year) || 0) - (parseOptionalNumber(a.year) || 0)
      return 0
    })
  }, [category, country, listings, maxMileage, maxPrice, maxYear, minPrice, minYear, mode, query, sortBy])

  const resetFilters = () => {
    setQuery('')
    setCategory('all')
    setMinPrice('')
    setMaxPrice('')
    setMinYear('')
    setMaxYear('')
    setMaxMileage('')
    setSortBy('latest')
  }

  const currentTab = tabs.find((tab) => tab.key === mode) || tabs[0]
  const visibleCount = filteredListings.length
  const countryName = getEuCountryName(country || 'SE', locale)

  return (
    <main className="min-h-screen bg-white text-[#101828]">
      <div className="flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
        <header className="flex min-h-[62px] items-center justify-between border-b border-[#eceff4] bg-white px-5 sm:px-7">
          <Link href={localizePublicHref(locale, '/')} aria-label="Autorell" className="shrink-0">
            <BrandLogo compact underline={false} />
          </Link>
          <nav className="hidden items-center gap-7 text-[14px] font-medium text-[#101828] md:flex">
            <span className="text-[#0866ff]">Sök fordon</span>
            <Link href={localizePublicHref(locale, '/sell-vehicle')} className="transition hover:text-[#0866ff]">
              Sälj fordon
            </Link>
            <Link href={localizePublicHref(locale, '/business')} className="transition hover:text-[#0866ff]">
              Företag
            </Link>
          </nav>
          <div className="flex items-center gap-4 text-sm font-medium text-[#101828]">
            <span className="hidden items-center gap-2 md:inline-flex">
              <Heart className="h-5 w-5" />
              Sparade
            </span>
            <span className="hidden items-center gap-2 md:inline-flex">
              <Bookmark className="h-5 w-5" />
              Sökningar
            </span>
            <span className="inline-flex items-center gap-2">
              <CountryFlag code={country || 'SE'} className="h-5 w-5" />
              <span>{country}</span>
            </span>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 lg:grid-cols-[minmax(520px,clamp(560px,38vw,720px))_minmax(560px,1fr)]">
          <div className="min-h-0 overflow-y-auto border-r border-[#eceff4] bg-white">
            <div className="border-b border-[#eceff4] px-5 pt-3 sm:px-6">
              <div className="flex overflow-x-auto border-b border-[#dfe4ec] sm:grid sm:grid-cols-3 sm:overflow-visible">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMode(tab.key)}
                    className={`relative min-h-[58px] min-w-[155px] px-2 text-center text-[15px] font-medium transition sm:min-w-0 ${
                      mode === tab.key ? 'text-[#101828]' : 'text-[#475467] hover:text-[#101828]'
                    }`}
                  >
                    <span className="block">{tab.label}</span>
                    <span className="mt-1 hidden text-xs font-medium text-[#667085] sm:block">{tab.hint}</span>
                    {mode === tab.key ? <span className="absolute inset-x-0 -bottom-px h-[3px] bg-[#0866ff]" /> : null}
                  </button>
                ))}
              </div>

              <div className="py-5">
                <label className="flex h-12 items-center gap-3 rounded-[5px] bg-[#f1f2f4] px-4 text-[#667085] sm:h-[50px]">
                  <span className="sr-only">Sök</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Sök fordon, ort eller kommun"
                    className="min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-[#7b828d]"
                  />
                  <Search className="h-6 w-6 shrink-0 text-[#101828]" />
                </label>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((open) => !open)}
                    className="inline-flex min-h-11 items-center justify-center gap-3 rounded-[5px] border border-[#d0d5dd] bg-white px-5 text-[15px] font-medium shadow-sm transition hover:border-[#0866ff]"
                  >
                    <Filter className="h-5 w-5" />
                    Sökfilter
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center justify-center gap-3 rounded-[5px] bg-[#d1d3d8] px-5 text-[15px] font-medium text-white"
                  >
                    <Bookmark className="h-6 w-6" />
                    Spara sökning
                  </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px]">
                  <label className="relative">
                    <span className="sr-only">Kategori</span>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="h-11 w-full appearance-none rounded-[5px] border border-[#d0d5dd] bg-white px-4 pr-10 text-sm font-medium outline-none focus:border-[#0866ff]"
                    >
                      {categories.map((option) => (
                        <option key={option.key} value={option.key}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                  </label>
                  <label className="relative">
                    <span className="sr-only">Land</span>
                    <select
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      className="h-11 w-full appearance-none rounded-[5px] border border-[#d0d5dd] bg-white px-4 pr-10 text-sm font-medium outline-none focus:border-[#0866ff]"
                    >
                      <option value="SE">Sverige</option>
                      <option value="FR">Frankrike</option>
                      <option value="DE">Tyskland</option>
                      <option value="DK">Danmark</option>
                      <option value="NL">Nederländerna</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                  </label>
                </div>
                {filtersOpen ? (
                  <div className="mt-3 grid gap-3 rounded-[6px] border border-[#d9e1ec] bg-white p-4 shadow-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FilterInput label="Pris min" value={minPrice} onChange={setMinPrice} suffix="SEK" />
                      <FilterInput label="Pris max" value={maxPrice} onChange={setMaxPrice} suffix="SEK" />
                      <FilterInput label="Årsmodell från" value={minYear} onChange={setMinYear} />
                      <FilterInput label="Årsmodell till" value={maxYear} onChange={setMaxYear} />
                      <FilterInput label="Max miltal" value={maxMileage} onChange={setMaxMileage} suffix="km" />
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="h-11 rounded-[5px] border border-[#d0d5dd] bg-[#f8fafc] px-4 text-sm font-medium text-[#0866ff] transition hover:border-[#0866ff]"
                      >
                        Rensa filter
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-base font-medium leading-7">
                  {mode === 'sale' ? (
                    <>
                      Fordon till salu i <strong className="font-semibold">{countryName}</strong>.{' '}
                      <strong className="font-semibold">{visibleCount.toLocaleString('sv-SE')}</strong> annonser visas.
                    </>
                  ) : (
                    <>
                      {currentTab.label} i <strong className="font-semibold">{countryName}</strong>. Datamodellen kopplas i nästa steg.
                    </>
                  )}
                </p>
                <label className="relative">
                  <span className="sr-only">Sortering</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-11 appearance-none rounded-[5px] border border-[#d0d5dd] bg-white px-4 pr-10 text-sm font-medium shadow-sm outline-none focus:border-[#0866ff]"
                  >
                    <option value="latest">Nyast</option>
                    <option value="price-asc">Pris lägst</option>
                    <option value="price-desc">Pris högst</option>
                    <option value="year-desc">Nyast årsmodell</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                </label>
              </div>
            </div>

            <div className="border-t border-[#eceff4]">
              {filteredListings.length ? (
                filteredListings.map((listing) => (
                  <VehicleResultCard key={listing.id} listing={listing} locale={locale} mode={mode} />
                ))
              ) : (
                <div className="px-8 py-14">
                  <div className="rounded-[8px] border border-[#d9e1ec] bg-[#f8fbff] p-7">
                    <p className="text-xl font-semibold text-[#101828]">{currentTab.label}</p>
                    <p className="mt-3 max-w-xl text-base leading-7 text-[#667085]">
                      Här kommer {currentTab.label.toLowerCase()} visas när annonserna har rätt annonstyp i databasen.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`${mobileMapOpen ? 'fixed inset-0 z-50 block bg-white' : 'hidden'} lg:relative lg:block lg:h-full`}>
            {mobileMapOpen ? (
              <button
                type="button"
                onClick={() => setMobileMapOpen(false)}
                className="absolute left-4 top-4 z-20 inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#101828] shadow-lg lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
                Lista
              </button>
            ) : null}
            <VehicleSearchMap listings={filteredListings} country={country} locale={locale} />
          </div>

          <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMapOpen((open) => !open)}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0866ff] px-5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(8,102,255,.32)]"
            >
              <MapPin className="h-4 w-4" />
              {mobileMapOpen ? 'Visa lista' : 'Visa karta'}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

function FilterInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  suffix?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#475467]">{label}</span>
      <span className="flex h-11 items-center rounded-[5px] border border-[#d0d5dd] bg-white px-3 focus-within:border-[#0866ff]">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="numeric"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
        />
        {suffix ? <span className="ml-2 text-xs font-semibold text-[#667085]">{suffix}</span> : null}
      </span>
    </label>
  )
}

function VehicleResultCard({
  listing,
  locale,
  mode,
}: {
  listing: VehicleSearchListing
  locale: PublicLocale
  mode: SearchMode
}) {
  const href = localizePublicHref(
    locale,
    buildListingPath({
      id: listing.id,
      title: listing.title,
      make: listing.make,
      model: listing.model,
      year: listing.year,
      city: listing.city,
    }),
  )
  const location = [listing.city || listing.municipality, getEuCountryName(listing.country, locale)]
    .filter(Boolean)
    .join(', ')
  const meta = [
    listing.year,
    listing.mileageKm !== null ? `${listing.mileageKm.toLocaleString('sv-SE')} km` : null,
    listing.fuelType,
    listing.gearbox,
  ].filter(Boolean)

  return (
    <article className="grid gap-4 border-b border-[#eceff4] px-5 py-5 sm:grid-cols-[220px_minmax(0,1fr)] sm:px-6">
      <Link href={href} className="group relative aspect-[16/9] overflow-hidden rounded-[6px] bg-[#eef3f8]">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, 220px"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#0866ff]">
            <AutorellCarIcon className="h-12 w-12" />
          </div>
        )}
        <button className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white text-[#101828] shadow-md">
          <Heart className="h-5 w-5" />
        </button>
      </Link>

      <div className="min-w-0">
        <Link href={href} className="text-xl font-medium tracking-[-0.01em] text-[#101828] hover:text-[#0866ff]">
          {listing.title}
        </Link>
        <p className="mt-1.5 text-base font-medium text-[#667085]">{location}</p>
        <p className="mt-4 text-xl font-semibold text-[#101828]">
          {mode === 'leasing' ? 'från ' : ''}
          {listing.priceLabel}
          {mode === 'leasing' ? '/mån' : mode === 'rental' ? '/dag' : ''}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[#101828]">
          {meta.map((item) => (
            <span key={String(item)}>{item}</span>
          ))}
        </div>
        <p className="mt-5 text-sm font-medium text-[#475467]">
          {listing.sellerIsTrader ? listing.sellerName : 'Privat säljare'}
        </p>
      </div>
    </article>
  )
}

function VehicleSearchMap({
  listings,
  country,
  locale,
}: {
  listings: VehicleSearchListing[]
  country: string
  locale: PublicLocale
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<MapLibreMarker[]>([])
  const [mapReady, setMapReady] = useState(false)
  const [mapFailed, setMapFailed] = useState(false)
  const mapListings = useMemo(
    () =>
      listings.slice(0, 150).map((listing, index) => ({
        listing,
        coordinates: listingCoordinates(listing, country, index),
      })),
    [country, listings],
  )
  const fallbackCenter = mapListings[0]?.coordinates || countryCenters[country] || countryCenters.SE
  const fallbackTiles = getFallbackTileUrls(fallbackCenter[1], fallbackCenter[0], mapListings.length ? 11 : 5)

  useEffect(() => {
    let cancelled = false

    async function loadMap() {
      if (!containerRef.current || mapRef.current) return
      const maplibregl = await import('maplibre-gl')
      if (cancelled || !containerRef.current) return
      const center = countryCenters[country] || countryCenters.SE
      try {
        const map = new maplibregl.Map({
          container: containerRef.current,
          style: getMapStyle(),
          center,
          zoom: country === 'SE' ? 4.6 : 4.2,
          attributionControl: { compact: true },
        })
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
        map.once('load', () => {
          if (!cancelled) {
            setMapReady(true)
            setMapFailed(false)
          }
        })
        mapRef.current = map
      } catch {
        setMapFailed(true)
      }
    }

    loadMap()
    return () => {
      cancelled = true
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      mapRef.current?.remove()
      mapRef.current = null
      setMapReady(false)
      setMapFailed(false)
    }
  }, [country])

  useEffect(() => {
    let cancelled = false

    async function syncMarkers() {
      const map = mapRef.current
      if (!mapReady || !map) return
      const maplibregl = await import('maplibre-gl')
      if (cancelled) return
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = mapListings.map(({ listing, coordinates }) => {
        const markerElement = document.createElement('button')
        markerElement.type = 'button'
        markerElement.className = 'h-3.5 w-3.5 rounded-full border border-white bg-[#0866ff] shadow-[0_2px_8px_rgba(8,102,255,.38)]'
        markerElement.setAttribute('aria-label', listing.title)
        const popup = new maplibregl.Popup({ offset: 10 }).setHTML(
          `<div class="autorell-map-popup"><strong>${escapeHtml(listing.title)}</strong><span>${escapeHtml([listing.city || listing.municipality, getEuCountryName(listing.country, locale)].filter(Boolean).join(', '))}</span><b>${escapeHtml(listing.priceLabel)}</b></div>`,
        )
        return new maplibregl.Marker({ element: markerElement })
          .setLngLat(coordinates)
          .setPopup(popup)
          .addTo(map)
      })
      if (mapListings.length) {
        const bounds = new maplibregl.LngLatBounds()
        mapListings.forEach(({ coordinates }) => bounds.extend(coordinates))
        map.fitBounds(bounds, { padding: 70, maxZoom: 8.8, duration: 500 })
      } else {
        map.flyTo({ center: countryCenters[country] || countryCenters.SE, zoom: country === 'SE' ? 4.6 : 4.2, duration: 400 })
      }
    }

    syncMarkers()
    return () => {
      cancelled = true
    }
  }, [country, locale, mapListings, mapReady])

  return (
    <div className="relative h-[calc(100vh-62px)] min-h-[520px] bg-[#dce7ed] lg:h-full lg:min-h-[calc(100vh-62px)]">
      <div className={`${mapReady && !mapFailed ? 'opacity-0' : 'opacity-100'} absolute inset-0 grid grid-cols-3 grid-rows-3 transition-opacity duration-300`}>
        {fallbackTiles.map((tile) => (
          <span
            key={tile}
            className="block bg-cover bg-center"
            style={{ backgroundImage: `url(${tile})` }}
          />
        ))}
      </div>
      {!mapReady || mapFailed ? (
        <button
          type="button"
          className="absolute left-1/2 top-1/2 z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#0866ff] text-xs font-semibold text-white shadow-[0_8px_22px_rgba(16,24,40,.28)]"
        >
          {mapListings.length ? mapListings.length : <MapPin className="h-5 w-5" />}
        </button>
      ) : null}
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute right-4 top-4 flex gap-2">
        <button className="inline-flex h-12 items-center gap-2 rounded-[5px] bg-[#101828] px-4 text-sm font-semibold text-white shadow-lg">
          <Expand className="h-5 w-5" />
          Fullskärm
        </button>
        <button className="inline-flex h-12 items-center gap-2 rounded-[5px] bg-[#101828] px-4 text-sm font-semibold text-white shadow-lg">
          <Layers className="h-5 w-5" />
          Kartval
        </button>
      </div>
      <div className="absolute left-4 top-4 rounded-[5px] bg-white/95 px-4 py-3 text-sm font-medium shadow-lg backdrop-blur">
        {listings.length.toLocaleString('sv-SE')} fordon i kartvyn
      </div>
      <button className="absolute bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0866ff] shadow-lg">
        <SlidersHorizontal className="h-4 w-4" />
        Sök i detta område
      </button>
    </div>
  )
}

function getFallbackTileUrls(latitude: number, longitude: number, zoom = 11) {
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

function listingCoordinates(listing: VehicleSearchListing, country: string, index: number): [number, number] {
  if (typeof listing.longitude === 'number' && typeof listing.latitude === 'number') {
    return [listing.longitude, listing.latitude]
  }
  const base = countryCenters[listing.country] || countryCenters[country] || countryCenters.SE
  const ring = (index % 18) / 18
  const radius = 0.7 + (index % 5) * 0.28
  return [
    base[0] + Math.cos(ring * Math.PI * 2) * radius,
    base[1] + Math.sin(ring * Math.PI * 2) * radius * 0.55,
  ]
}

function parseOptionalNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const normalized = String(value).replace(/[^\d.-]/g, '')
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
