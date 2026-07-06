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
  Scale,
  SlidersHorizontal,
  X,
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
import { getMapStyle, type AutorellMapLayer } from '@/lib/map-style'
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
  sellerLogoUrl: string | null
  sellerTrust: 'verified' | 'unverified'
  sellerName: string
  sellerIsTrader: boolean
  condition: string | null
  color: string | null
  equipment: string | null
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
  const [fuel, setFuel] = useState('')
  const [gearbox, setGearbox] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [sellerType, setSellerType] = useState('all')
  const [equipmentQuery, setEquipmentQuery] = useState('')
  const [compareIds, setCompareIds] = useState<string[]>([])

  const fuels = useMemo(
    () => [...new Set(listings.map((listing) => listing.fuelType).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'sv-SE')),
    [listings],
  )
  const gearboxes = useMemo(
    () => [...new Set(listings.map((listing) => listing.gearbox).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'sv-SE')),
    [listings],
  )
  const bodyTypes = useMemo(
    () => [...new Set(listings.map((listing) => listing.bodyType).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'sv-SE')),
    [listings],
  )
  const priceBounds = useMemo(() => {
    const prices = listings.map((listing) => listing.priceValue).filter((value) => Number.isFinite(value) && value > 0)
    const max = prices.length ? Math.max(...prices) : 700000
    return { min: 0, max: Math.max(700000, Math.ceil(max / 10000) * 10000) }
  }, [listings])
  const mileageBounds = useMemo(() => {
    const mileages = listings.map((listing) => listing.mileageKm).filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0)
    const max = mileages.length ? Math.max(...mileages) : 200000
    return { min: 0, max: Math.max(200000, Math.ceil(max / 10000) * 10000) }
  }, [listings])

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
      if (fuel && listing.fuelType !== fuel) return false
      if (gearbox && listing.gearbox !== gearbox) return false
      if (bodyType && listing.bodyType !== bodyType) return false
      if (sellerType === 'business' && !listing.sellerIsTrader) return false
      if (sellerType === 'private' && listing.sellerIsTrader) return false
      if (equipmentQuery.trim() && !(listing.equipment || '').toLowerCase().includes(equipmentQuery.trim().toLowerCase())) return false
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
  }, [bodyType, category, country, equipmentQuery, fuel, gearbox, listings, maxMileage, maxPrice, maxYear, minPrice, minYear, mode, query, sellerType, sortBy])

  const resetFilters = () => {
    setQuery('')
    setCategory('all')
    setMinPrice('')
    setMaxPrice('')
    setMinYear('')
    setMaxYear('')
    setMaxMileage('')
    setFuel('')
    setGearbox('')
    setBodyType('')
    setSellerType('all')
    setEquipmentQuery('')
    setSortBy('latest')
  }

  const toggleCompare = (listingId: string) => {
    setCompareIds((current) =>
      current.includes(listingId)
        ? current.filter((id) => id !== listingId)
        : [...current, listingId].slice(-4),
    )
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

        <section className="grid min-h-0 flex-1 lg:grid-cols-[minmax(640px,clamp(680px,42vw,820px))_minmax(520px,1fr)]">
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
                    className="vehicle-search-control min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-[#7b828d]"
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
                  <div className="mt-3 grid gap-4 rounded-[6px] border border-[#d9e1ec] bg-white p-4 shadow-sm">
                    <RangeFilter
                      title="Pris"
                      minValue={minPrice}
                      maxValue={maxPrice}
                      onMinChange={setMinPrice}
                      onMaxChange={setMaxPrice}
                      minLimit={priceBounds.min}
                      maxLimit={priceBounds.max}
                      unit="SEK"
                      step={1000}
                    />
                    <RangeFilter
                      title="Modellår"
                      minValue={minYear}
                      maxValue={maxYear}
                      onMinChange={setMinYear}
                      onMaxChange={setMaxYear}
                      minLimit={1950}
                      maxLimit={new Date().getFullYear() + 1}
                      step={1}
                      startLabel="Före 1950"
                    />
                    <RangeFilter
                      title="Miltal"
                      minValue=""
                      maxValue={maxMileage}
                      onMinChange={() => undefined}
                      onMaxChange={setMaxMileage}
                      minLimit={mileageBounds.min}
                      maxLimit={mileageBounds.max}
                      unit="km"
                      step={1000}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FilterSelect label="Drivmedel" value={fuel} onChange={setFuel} options={fuels} />
                      <FilterSelect label="Växellåda" value={gearbox} onChange={setGearbox} options={gearboxes} />
                      <FilterSelect label="Kaross / typ" value={bodyType} onChange={setBodyType} options={bodyTypes} />
                      <FilterSelect
                        label="Säljartyp"
                        value={sellerType}
                        onChange={setSellerType}
                        options={[
                          { value: 'all', label: 'Alla säljare' },
                          { value: 'business', label: 'Företag' },
                          { value: 'private', label: 'Privatperson' },
                        ]}
                      />
                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-xs font-semibold text-[#475467]">Utrustning, drag m.m.</span>
                        <input
                          value={equipmentQuery}
                          onChange={(event) => setEquipmentQuery(event.target.value)}
                          placeholder="Ex. Dragkrok, navigation, fyrhjulsdrift"
                          className="h-11 w-full rounded-[5px] border border-[#d0d5dd] bg-white px-3 text-sm font-medium outline-none transition placeholder:text-[#98a2b3] focus:border-[#0866ff]"
                        />
                      </label>
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
                  <VehicleResultCard
                    key={listing.id}
                    listing={listing}
                    locale={locale}
                    compareActive={compareIds.includes(listing.id)}
                    onCompare={() => toggleCompare(listing.id)}
                  />
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
            <VehicleSearchMap
              listings={filteredListings}
              country={country}
              locale={locale}
              query={query}
              onQueryChange={setQuery}
              onOpenFilters={() => {
                setFiltersOpen(true)
                setMobileMapOpen(false)
              }}
            />
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

function RangeFilter({
  title,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minLimit,
  maxLimit,
  unit = '',
  step,
  startLabel,
}: {
  title: string
  minValue: string
  maxValue: string
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
  minLimit: number
  maxLimit: number
  unit?: string
  step: number
  startLabel?: string
}) {
  const rangeValue = Number(maxValue || maxLimit)

  return (
    <section className="border-b border-[#edf1f6] pb-4 last:border-b-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#101828]">{title}</h3>
        {maxValue || minValue ? (
          <button
            type="button"
            onClick={() => {
              onMinChange('')
              onMaxChange('')
            }}
            className="text-xs font-semibold text-[#0866ff]"
          >
            Rensa
          </button>
        ) : null}
      </div>
      <input
        type="range"
        min={minLimit}
        max={maxLimit}
        step={step}
        value={rangeValue}
        onChange={(event) => onMaxChange(event.target.value)}
        className="autorell-range h-7 w-full accent-[#0866ff]"
      />
      <div className="mt-1 flex items-center justify-between text-xs font-semibold text-[#667085]">
        <span>{startLabel || formatFilterNumber(Number(minValue || minLimit))}</span>
        <span>{formatFilterNumber(Number(maxValue || maxLimit))}{unit ? ` ${unit}` : ''}+</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <FilterInput label="Min" value={minValue} onChange={onMinChange} suffix={unit} />
        <FilterInput label="Max" value={maxValue} onChange={onMaxChange} suffix={unit} />
      </div>
    </section>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<string | { value: string; label: string }>
}) {
  return (
    <label className="relative block">
      <span className="mb-1.5 block text-xs font-semibold text-[#475467]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-[5px] border border-[#d0d5dd] bg-white px-3 pr-9 text-sm font-medium outline-none transition focus:border-[#0866ff]"
      >
        <option value="">Alla</option>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          )
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-3.5 right-3 h-4 w-4 text-[#667085]" />
    </label>
  )
}

function VehicleResultCard({
  listing,
  locale,
  compareActive,
  onCompare,
}: {
  listing: VehicleSearchListing
  locale: PublicLocale
  compareActive: boolean
  onCompare: () => void
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
  const importantInfo = [
    listing.mileageKm !== null ? `${listing.mileageKm.toLocaleString('sv-SE')} km` : null,
    listing.fuelType,
    listing.gearbox,
  ].filter(Boolean)

  return (
    <article className="mx-3 overflow-hidden border-b border-[#e5ebf3] bg-white py-5 sm:mx-6">
      <div className="grid gap-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start">
        <Link href={href} className="group relative h-[246px] overflow-hidden rounded-[6px] bg-[#eef3f8] sm:h-[174px]">
          {listing.imageUrl ? (
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 100vw, 260px"
              className="object-contain transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="grid h-full place-items-center text-[#0866ff]">
              <AutorellCarIcon className="h-12 w-12" />
            </div>
          )}
          {listing.sellerTrust === 'verified' ? (
            <span className="absolute left-3 top-3 rounded-[5px] bg-[#0866ff] px-2.5 py-1 text-xs font-semibold text-white">
              Verifierad
            </span>
          ) : null}
          <button type="button" aria-label="Spara annons" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white text-[#101828] shadow-md transition hover:text-[#0866ff]">
            <Heart className="h-5 w-5" />
          </button>
          <CountryFlag code={listing.country} className="absolute bottom-3 left-3 h-7 w-7 rounded-full max-[420px]:h-6 max-[420px]:w-6" />
          <button
            type="button"
            aria-pressed={compareActive}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onCompare()
            }}
            className={`absolute bottom-3 right-3 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold shadow-md transition max-[420px]:h-8 max-[420px]:px-2 ${
              compareActive ? 'bg-[#0866ff] text-white' : 'bg-white text-[#101828] hover:text-[#0866ff]'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span className="max-[420px]:sr-only">Jämför</span>
          </button>
        </Link>

        <div className="min-w-0">
          <div className="grid min-w-0 gap-1.5">
            <Link href={href} className="line-clamp-1 text-[18px] font-semibold leading-tight text-[#101828] underline-offset-2 hover:text-[#0866ff] hover:underline">
              {listing.title}
            </Link>
            <p className="line-clamp-1 text-[14px] font-medium leading-5 text-[#667085]">
              {meta.join(' · ')}
            </p>
            <p className="text-[17px] font-semibold leading-6 text-[#101828]">
              {listing.priceLabel}
            </p>
            <p className="line-clamp-1 text-[14px] font-medium leading-5 text-[#101828]">
              {importantInfo.join('   ')}
            </p>
            <p className="line-clamp-1 text-[14px] font-medium leading-5 text-[#475467]">
              {listing.sellerIsTrader ? 'Företagssäljare' : 'Privatperson'} · {listing.sellerName || 'Privatperson'}
            </p>
            <div className="mt-1 flex min-w-0 flex-wrap items-end justify-between gap-3">
              <p className="flex min-w-0 items-center gap-2 text-[14px] font-medium text-[#101828]">
                <MapPin className="h-4 w-4 shrink-0 text-[#0866ff]" />
                <span className="truncate">{location}</span>
              </p>
              {listing.sellerIsTrader && listing.sellerLogoUrl ? (
                <span className="relative hidden h-7 w-28 overflow-hidden rounded-[4px] bg-[#eef3f8] sm:block">
                  <Image src={listing.sellerLogoUrl} alt={listing.sellerName} fill sizes="112px" className="object-contain" />
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
            <span className="text-xs font-semibold text-[#667085]">Fast pris</span>
            <Link
              href={href}
              className="inline-flex h-10 w-full items-center justify-center rounded-[5px] bg-[#0866ff] px-4 text-sm font-semibold text-white transition hover:bg-[#0052d6] sm:h-9 sm:w-auto"
            >
              Visa annons
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

function VehicleSearchMap({
  listings,
  country,
  locale,
  query,
  onQueryChange,
  onOpenFilters,
}: {
  listings: VehicleSearchListing[]
  country: string
  locale: PublicLocale
  query: string
  onQueryChange: (value: string) => void
  onOpenFilters: () => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<MapLibreMarker[]>([])
  const [mapReady, setMapReady] = useState(false)
  const [mapFailed, setMapFailed] = useState(false)
  const [mapLayer, setMapLayer] = useState<AutorellMapLayer>('standard')
  const [fullscreen, setFullscreen] = useState(false)
  const mapListings = useMemo(
    () =>
      listings.slice(0, 150).map((listing, index) => ({
        listing,
        coordinates: listingCoordinates(listing, country, index),
      })),
    [country, listings],
  )
  const fallbackCenter = mapListings[0]?.coordinates || countryCenters[country] || countryCenters.SE
  const fallbackTiles = getFallbackTileUrls(fallbackCenter[1], fallbackCenter[0], mapListings.length ? 11 : 5, mapLayer)

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
          style: getMapStyle(mapLayer),
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
  }, [country, mapLayer])

  useEffect(() => {
    if (!fullscreen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [fullscreen])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      mapRef.current?.resize()
    }, 80)
    return () => window.clearTimeout(timer)
  }, [fullscreen])

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
        const detailHref = localizePublicHref(
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
        const popup = new maplibregl.Popup({ offset: 10 }).setHTML(
          `<div class="autorell-map-popup"><strong>${escapeHtml(listing.title)}</strong><span>${escapeHtml([listing.city || listing.municipality, getEuCountryName(listing.country, locale)].filter(Boolean).join(', '))}</span><b>${escapeHtml(listing.priceLabel)}</b><a href="${escapeHtml(detailHref)}">Gå till annons</a></div>`,
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
    <div className={`${fullscreen ? 'fixed inset-0 z-[80] h-screen min-h-screen' : 'relative h-[calc(100vh-62px)] min-h-[520px] lg:h-full lg:min-h-[calc(100vh-62px)]'} bg-[#dce7ed]`}>
      <div className={`${mapReady && !mapFailed ? 'opacity-0' : 'opacity-100'} absolute inset-0 grid grid-cols-3 grid-rows-3 transition-opacity duration-300 ${mapLayer === 'satellite' ? 'brightness-[.82] saturate-[1.08]' : ''}`}>
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
      {fullscreen ? (
        <div className="absolute inset-x-0 top-0 z-20 flex min-h-[58px] items-center gap-3 bg-white/96 px-3 shadow-[0_1px_10px_rgba(16,24,40,.14)] backdrop-blur sm:px-4">
          <Link href={localizePublicHref(locale, '/')} aria-label="Autorell" className="hidden shrink-0 sm:block">
            <BrandLogo compact underline={false} />
          </Link>
          <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-[5px] bg-[#f1f2f4] px-3 text-[#667085]">
            <span className="sr-only">Sök</span>
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Sök på fordon, ort eller kommun"
              className="vehicle-search-control min-w-0 flex-1 bg-transparent text-sm font-medium text-[#101828] outline-none placeholder:text-[#667085]"
            />
            <Search className="h-5 w-5 shrink-0 text-[#101828]" />
          </label>
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex h-10 items-center gap-2 rounded-[5px] border border-[#d0d5dd] bg-white px-3 text-sm font-semibold text-[#101828] shadow-sm"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Sökfilter</span>
          </button>
          <MapLayerPicker mapLayer={mapLayer} onMapLayerChange={setMapLayer} />
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="grid h-10 w-10 place-items-center rounded-[5px] bg-[#101828] text-white shadow-sm"
            aria-label="Stäng fullskärm"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="absolute right-4 top-4 z-20 flex gap-2">
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="inline-flex h-12 items-center gap-2 rounded-[5px] bg-[#101828] px-4 text-sm font-semibold text-white shadow-lg"
          >
            <Expand className="h-5 w-5" />
            Fullskärm
          </button>
          <MapLayerPicker mapLayer={mapLayer} onMapLayerChange={setMapLayer} />
        </div>
      )}
      <div className={`${fullscreen ? 'top-[74px]' : 'top-4'} absolute left-4 z-20 rounded-[5px] bg-white/95 px-4 py-3 text-sm font-medium shadow-lg backdrop-blur`}>
        {listings.length.toLocaleString('sv-SE')} fordon i kartvyn
      </div>
      <button className="absolute bottom-5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0866ff] shadow-lg">
        <SlidersHorizontal className="h-4 w-4" />
        Sök i detta område
      </button>
    </div>
  )
}

function MapLayerPicker({
  mapLayer,
  onMapLayerChange,
}: {
  mapLayer: AutorellMapLayer
  onMapLayerChange: (layer: AutorellMapLayer) => void
}) {
  return (
    <div className="inline-flex h-12 overflow-hidden rounded-[5px] bg-[#101828] p-1 shadow-lg">
      <button
        type="button"
        onClick={() => onMapLayerChange('standard')}
        className={`inline-flex items-center gap-2 rounded-[4px] px-3 text-sm font-semibold transition ${
          mapLayer === 'standard' ? 'bg-white text-[#101828]' : 'text-white hover:bg-white/10'
        }`}
      >
        <Layers className="h-4 w-4" />
        <span className="hidden sm:inline">Karta</span>
      </button>
      <button
        type="button"
        onClick={() => onMapLayerChange('satellite')}
        className={`inline-flex items-center rounded-[4px] px-3 text-sm font-semibold transition ${
          mapLayer === 'satellite' ? 'bg-white text-[#101828]' : 'text-white hover:bg-white/10'
        }`}
      >
        Satellit
      </button>
    </div>
  )
}

function getFallbackTileUrls(latitude: number, longitude: number, zoom = 11, layer: AutorellMapLayer = 'standard') {
  const tile = getTileCoordinate(latitude, longitude, zoom)
  const tiles: string[] = []

  for (let y = tile.y - 1; y <= tile.y + 1; y += 1) {
    for (let x = tile.x - 1; x <= tile.x + 1; x += 1) {
      tiles.push(
        layer === 'satellite'
          ? `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`
          : `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${x}/${y}.png`,
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

function formatFilterNumber(value: number) {
  return new Intl.NumberFormat('sv-SE', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(value))
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
