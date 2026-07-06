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

const tabs: Array<{ key: SearchMode; label: string; mobileLabel: string; hint: string }> = [
  { key: 'sale', label: 'Fordon till salu', mobileLabel: 'Till salu', hint: 'Privata och företag' },
  { key: 'leasing', label: 'Leasing', mobileLabel: 'Leasing', hint: 'Företagsannonser' },
  { key: 'rental', label: 'Uthyrning', mobileLabel: 'Hyra', hint: 'Hyresfordon' },
]

const categories = [
  { key: 'all', label: 'Alla kategorier', shortLabel: 'Alla', icon: AutorellCarIcon },
  { key: 'cars', label: 'Bilar', shortLabel: 'Bilar', icon: AutorellCarIcon },
  { key: 'vans', label: 'Transportbilar', shortLabel: 'Transport', icon: AutorellVanIcon },
  { key: 'motorcycles', label: 'Motorcyklar', shortLabel: 'MC', icon: AutorellMotorbikeIcon },
  { key: 'motorhomes', label: 'Husbilar', shortLabel: 'Husbilar', icon: AutorellVanIcon },
  { key: 'caravans', label: 'Husvagnar', shortLabel: 'Husvagnar', icon: AutorellCaravanIcon },
  { key: 'trucks', label: 'Lastbilar', shortLabel: 'Lastbilar', icon: AutorellTruckIcon },
  { key: 'agriculture', label: 'Lantbruk', shortLabel: 'Lantbruk', icon: AutorellBikeIcon },
  { key: 'construction', label: 'Entreprenad', shortLabel: 'Entreprenad', icon: AutorellScooterIcon },
  { key: 'electric-bikes', label: 'Cyklar', shortLabel: 'Cyklar', icon: AutorellBikeIcon },
  { key: 'e-scooters', label: 'Sparkcyklar', shortLabel: 'Spark', icon: AutorellScooterIcon },
]

const countryCenters: Record<string, [number, number]> = {
  AT: [14.55, 47.52],
  BE: [4.47, 50.5],
  SE: [14.5, 57.8],
  FR: [2.21, 46.23],
  DE: [10.45, 51.16],
  DK: [10.0, 56.0],
  FI: [25.75, 61.92],
  IT: [12.57, 41.87],
  NL: [5.29, 52.13],
  PL: [19.14, 51.92],
  ES: [-3.75, 40.46],
  EU: [14.5, 52.0],
}

const marketOptions = [
  { value: '', label: 'Alla marknader' },
  { value: 'AT', label: 'Austria' },
  { value: 'BE', label: 'Belgique / Belgie' },
  { value: 'DK', label: 'Danmark' },
  { value: 'FI', label: 'Suomi' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Deutschland' },
  { value: 'IT', label: 'Italia' },
  { value: 'NL', label: 'Nederland' },
  { value: 'PL', label: 'Polska' },
  { value: 'ES', label: 'España' },
  { value: 'SE', label: 'Sverige' },
]

export default function VehicleSearchExperience({
  listings,
  locale = 'sv',
  defaultCountry = 'SE',
  initialCategory = 'all',
  initialQuery = '',
  initialMake = '',
  initialModel = '',
  initialMinPrice = '',
  initialMaxPrice = '',
}: {
  listings: VehicleSearchListing[]
  locale?: PublicLocale
  defaultCountry?: string
  initialCategory?: string
  initialQuery?: string
  initialMake?: string
  initialModel?: string
  initialMinPrice?: string
  initialMaxPrice?: string
}) {
  const safeInitialCategory = categories.some((item) => item.key === initialCategory) ? initialCategory : 'all'
  const safeInitialCountry = (defaultCountry || '').toUpperCase()
  const [mode, setMode] = useState<SearchMode>('sale')
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(safeInitialCategory)
  const [country, setCountry] = useState(safeInitialCountry)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [quickFilter, setQuickFilter] = useState<string | null>(null)
  const [mobileMapOpen, setMobileMapOpen] = useState(false)
  const [sortBy, setSortBy] = useState('latest')
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)
  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')
  const [maxMileage, setMaxMileage] = useState('')
  const [make, setMake] = useState(initialMake)
  const [model, setModel] = useState(initialModel)
  const [fuel, setFuel] = useState('')
  const [gearbox, setGearbox] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [sellerType, setSellerType] = useState('all')
  const [equipmentQuery, setEquipmentQuery] = useState('')
  const [compareIds, setCompareIds] = useState<string[]>([])

  const optionListings = useMemo(
    () => listings.filter((listing) => (category === 'all' || listing.category === category) && (!country || listing.country === country)),
    [category, country, listings],
  )
  const fuels = useMemo(
    () => [...new Set(optionListings.map((listing) => listing.fuelType).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'sv-SE')),
    [optionListings],
  )
  const makes = useMemo(
    () =>
      [
        ...new Set(
          optionListings.map((listing) => listing.make)
            .filter((value): value is string => Boolean(value)),
        ),
      ].sort((a, b) => a.localeCompare(b, 'sv-SE')),
    [optionListings],
  )
  const models = useMemo(
    () =>
      [
        ...new Set(
          optionListings
            .filter((listing) => !make || listing.make === make)
            .map((listing) => listing.model)
            .filter((value): value is string => Boolean(value)),
        ),
      ].sort((a, b) => a.localeCompare(b, 'sv-SE')),
    [make, optionListings],
  )
  const gearboxes = useMemo(
    () => [...new Set(optionListings.map((listing) => listing.gearbox).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'sv-SE')),
    [optionListings],
  )
  const bodyTypes = useMemo(
    () => [...new Set(optionListings.map((listing) => listing.bodyType).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'sv-SE')),
    [optionListings],
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
      if (make && listing.make !== make) return false
      if (model && listing.model !== model) return false
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
        listing.bodyType,
        listing.fuelType,
        listing.gearbox,
        listing.condition,
        listing.equipment,
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
  }, [bodyType, category, country, equipmentQuery, fuel, gearbox, listings, make, maxMileage, maxPrice, maxYear, minPrice, minYear, mode, model, query, sellerType, sortBy])

  const resetFilters = () => {
    setQuery(initialQuery)
    setCategory(safeInitialCategory)
    setCountry(safeInitialCountry)
    setMinPrice(initialMinPrice)
    setMaxPrice(initialMaxPrice)
    setMinYear('')
    setMaxYear('')
    setMaxMileage('')
    setMake(initialMake)
    setModel(initialModel)
    setFuel('')
    setGearbox('')
    setBodyType('')
    setSellerType('all')
    setEquipmentQuery('')
    setSortBy('latest')
    setQuickFilter(null)
  }

  const toggleCompare = (listingId: string) => {
    setCompareIds((current) =>
      current.includes(listingId)
        ? current.filter((id) => id !== listingId)
        : [...current, listingId].slice(-4),
    )
  }

  const currentTab = tabs.find((tab) => tab.key === mode) || tabs[0]
  const currentCategory = categories.find((item) => item.key === category) || categories[0]
  const visibleCount = filteredListings.length
  const countryName = country ? getEuCountryName(country, locale) : 'alla marknader'

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#101828]">
      <div className="flex min-h-screen min-w-0 w-full max-w-full flex-col overflow-x-hidden lg:h-screen lg:overflow-hidden">
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

        <section className="relative z-30 border-b border-[#d7dde7] bg-white">
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto px-3 py-2 scrollbar-none sm:px-4">
            <label className="flex h-10 min-w-[300px] items-center gap-2 rounded-full border border-[#d0d5dd] bg-white px-4 text-[#667085] shadow-sm">
              <Search className="h-4 w-4 shrink-0 text-[#101828]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Sök fordon, ort eller kommun"
                className="vehicle-search-control min-w-0 flex-1 bg-transparent text-sm font-medium text-[#101828] outline-none placeholder:text-[#667085]"
              />
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#101828] shadow-sm transition hover:border-[#0866ff] hover:text-[#0866ff]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>
            <SegmentedMode mode={mode} onModeChange={setMode} />
            <FilterChip label={currentCategory.shortLabel} active={category !== 'all'} open={quickFilter === 'category'} onClick={() => setQuickFilter((current) => (current === 'category' ? null : 'category'))} />
            <FilterChip label={make || 'Märke'} active={Boolean(make)} open={quickFilter === 'make'} onClick={() => setQuickFilter((current) => (current === 'make' ? null : 'make'))} />
            <FilterChip label={formatPriceChip(minPrice, maxPrice)} active={Boolean(minPrice || maxPrice)} open={quickFilter === 'price'} onClick={() => setQuickFilter((current) => (current === 'price' ? null : 'price'))} />
            <FilterChip label={formatYearChip(minYear, maxYear)} active={Boolean(minYear || maxYear)} open={quickFilter === 'year'} onClick={() => setQuickFilter((current) => (current === 'year' ? null : 'year'))} />
            <FilterChip label={maxMileage ? `Max ${formatFilterNumber(Number(maxMileage))} km` : 'Miltal'} active={Boolean(maxMileage)} open={quickFilter === 'mileage'} onClick={() => setQuickFilter((current) => (current === 'mileage' ? null : 'mileage'))} />
            <FilterChip label={fuel || 'Drivmedel'} active={Boolean(fuel)} open={quickFilter === 'fuel'} onClick={() => setQuickFilter((current) => (current === 'fuel' ? null : 'fuel'))} />
            <FilterChip label={gearbox || 'Växellåda'} active={Boolean(gearbox)} open={quickFilter === 'gearbox'} onClick={() => setQuickFilter((current) => (current === 'gearbox' ? null : 'gearbox'))} />
            <button
              type="button"
              onClick={() => setMobileMapOpen(true)}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#101828] shadow-sm transition hover:border-[#0866ff] hover:text-[#0866ff] lg:hidden"
            >
              <MapPin className="h-4 w-4" />
              Karta
            </button>
            <button type="button" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[7px] bg-[#ffbf00] px-4 text-sm font-semibold text-[#101828] shadow-sm transition hover:bg-[#f1b400]">
              <Bookmark className="h-4 w-4" />
              Spara sökning
            </button>
          </div>
          {quickFilter ? (
            <QuickFilterPopover
              filter={quickFilter}
              category={category}
              onCategoryChange={(nextCategory) => {
                setCategory(nextCategory)
                setMake('')
                setModel('')
              }}
              make={make}
              makes={makes}
              onMakeChange={(value) => {
                setMake(value)
                setModel('')
              }}
              model={model}
              models={models}
              onModelChange={setModel}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              priceBounds={priceBounds}
              minYear={minYear}
              maxYear={maxYear}
              onMinYearChange={setMinYear}
              onMaxYearChange={setMaxYear}
              maxMileage={maxMileage}
              onMaxMileageChange={setMaxMileage}
              mileageBounds={mileageBounds}
              fuel={fuel}
              fuels={fuels}
              onFuelChange={setFuel}
              gearbox={gearbox}
              gearboxes={gearboxes}
              onGearboxChange={setGearbox}
              onClose={() => setQuickFilter(null)}
            />
          ) : null}
          {filtersOpen ? (
            <FullFilterModal
              mode={mode}
              onModeChange={setMode}
              category={category}
              onCategoryChange={(value) => {
                setCategory(value)
                setMake('')
                setModel('')
              }}
              country={country}
              onCountryChange={(value) => {
                setCountry(value)
                setMake('')
                setModel('')
              }}
              make={make}
              makes={makes}
              onMakeChange={(value) => {
                setMake(value)
                setModel('')
              }}
              model={model}
              models={models}
              onModelChange={setModel}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              priceBounds={priceBounds}
              minYear={minYear}
              maxYear={maxYear}
              onMinYearChange={setMinYear}
              onMaxYearChange={setMaxYear}
              maxMileage={maxMileage}
              onMaxMileageChange={setMaxMileage}
              mileageBounds={mileageBounds}
              fuel={fuel}
              fuels={fuels}
              onFuelChange={setFuel}
              gearbox={gearbox}
              gearboxes={gearboxes}
              onGearboxChange={setGearbox}
              bodyType={bodyType}
              bodyTypes={bodyTypes}
              onBodyTypeChange={setBodyType}
              sellerType={sellerType}
              onSellerTypeChange={setSellerType}
              equipmentQuery={equipmentQuery}
              onEquipmentQueryChange={setEquipmentQuery}
              onReset={resetFilters}
              onClose={() => setFiltersOpen(false)}
              resultCount={visibleCount}
            />
          ) : null}
        </section>

        <section className="grid min-h-0 min-w-0 w-full max-w-full flex-1 overflow-x-hidden lg:grid-cols-[minmax(560px,clamp(600px,37vw,720px))_minmax(620px,1fr)]">
          <div className="min-h-0 min-w-0 w-full max-w-full overflow-x-hidden overflow-y-auto border-r border-[#eceff4] bg-white">
            <div className="hidden w-full max-w-full overflow-hidden border-b border-[#eceff4] px-5 pt-3 sm:px-6 lg:px-7">
              <div className="grid grid-cols-3 border-b border-[#dfe4ec]">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMode(tab.key)}
                    className={`relative min-h-[58px] min-w-0 px-1 text-center text-[14px] font-medium transition sm:px-2 sm:text-[15px] ${
                      mode === tab.key ? 'text-[#101828]' : 'text-[#475467] hover:text-[#101828]'
                    }`}
                  >
                    <span className="block sm:hidden">{tab.mobileLabel}</span>
                    <span className="hidden sm:block">{tab.label}</span>
                    {mode === tab.key ? <span className="absolute inset-x-0 -bottom-px h-[3px] bg-[#0866ff]" /> : null}
                  </button>
                ))}
              </div>

            </div>

            <div className="min-w-0 max-w-full">
              <div className="min-w-0 max-w-full overflow-hidden">
                <div className="hidden w-full max-w-full overflow-hidden border-b border-[#eceff4] px-5 py-5 sm:px-6">
                <label className="flex h-12 items-center gap-3 rounded-[8px] bg-[#f1f2f4] px-4 text-[#667085] sm:h-[50px]">
                  <span className="sr-only">Sök</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Sök fordon, ort eller kommun"
                    className="vehicle-search-control min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-[#7b828d]"
                  />
                  <Search className="h-6 w-6 shrink-0 text-[#101828]" />
                </label>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((open) => !open)}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border px-3 text-[14px] font-medium shadow-sm transition sm:gap-3 sm:px-4 sm:text-[15px] ${
                      filtersOpen ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]' : 'border-[#d0d5dd] bg-white hover:border-[#0866ff]'
                    }`}
                  >
                    <Filter className="h-5 w-5" />
                    {filtersOpen ? 'Filter öppna' : 'Sökfilter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileMapOpen(true)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-[14px] font-medium text-[#101828] shadow-sm transition hover:border-[#0866ff] sm:gap-3 sm:px-4 sm:text-[15px] lg:hidden"
                  >
                    <MapPin className="h-5 w-5" />
                    <span className="sm:hidden">Karta</span>
                    <span className="hidden sm:inline">Visa karta</span>
                  </button>
                  <button
                    type="button"
                    className="col-span-2 inline-flex min-h-11 items-center justify-center gap-3 rounded-[8px] bg-[#d1d3d8] px-5 text-[15px] font-medium text-white lg:col-span-1"
                  >
                    <Bookmark className="h-6 w-6" />
                    Spara sökning
                  </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px] lg:grid-cols-1">
                  <label className="relative lg:hidden">
                    <span className="sr-only">Kategori</span>
                    <select
                      value={category}
                      onChange={(event) => {
                        setCategory(event.target.value)
                        setMake('')
                        setModel('')
                      }}
                      className="h-11 w-full appearance-none rounded-[8px] border border-[#d0d5dd] bg-white px-4 pr-10 text-sm font-medium outline-none focus:border-[#0866ff]"
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
                      onChange={(event) => {
                        setCountry(event.target.value)
                        setMake('')
                        setModel('')
                      }}
                      className="h-11 w-full appearance-none rounded-[8px] border border-[#d0d5dd] bg-white px-4 pr-10 text-sm font-medium outline-none focus:border-[#0866ff]"
                    >
                      {marketOptions.map((option) => (
                        <option key={option.value || 'all'} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                  </label>
                </div>
                {filtersOpen ? (
                  <div className="mt-4 grid gap-4 rounded-[6px] border border-[#b8d2ff] bg-[#fbfdff] p-4 shadow-[0_16px_36px_rgba(16,24,40,.10)]">
                    <div className="flex items-center justify-between border-b border-[#e1e9f5] pb-3">
                      <div>
                        <p className="text-sm font-semibold text-[#101828]">Sökfilter</p>
                        <p className="mt-0.5 text-xs font-medium text-[#667085]">Avgränsa på fordon, marknad och utrustning.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFiltersOpen(false)}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#101828] shadow-sm ring-1 ring-[#d0d5dd] transition hover:text-[#0866ff]"
                        aria-label="Stäng filter"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FilterSelect label="Märke" value={make} onChange={(value) => {
                        setMake(value)
                        setModel('')
                      }} options={makes} />
                      <FilterSelect label="Modell" value={model} onChange={setModel} options={models} />
                    </div>
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
                    className="h-11 appearance-none rounded-[8px] border border-[#d0d5dd] bg-white px-4 pr-10 text-sm font-medium shadow-sm outline-none focus:border-[#0866ff]"
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

        </section>
      </div>
    </main>
  )
}

function SegmentedMode({
  mode,
  onModeChange,
}: {
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
}) {
  return (
    <div className="inline-flex h-9 shrink-0 overflow-hidden rounded-full border border-[#008b97] bg-white">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onModeChange(tab.key)}
          className={`min-w-[88px] px-4 text-sm font-medium transition ${
            mode === tab.key ? 'bg-[#d8fbff] text-[#005b66]' : 'bg-white text-[#101828] hover:bg-[#f7fafc]'
          }`}
        >
          {tab.mobileLabel}
        </button>
      ))}
    </div>
  )
}

function FilterChip({
  label,
  active,
  open,
  onClick,
}: {
  label: string
  active?: boolean
  open?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium shadow-sm transition ${
        active || open
          ? 'border-[#008b97] bg-[#d8fbff] text-[#005b66]'
          : 'border-[#d0d5dd] bg-white text-[#101828] hover:border-[#0866ff]'
      }`}
    >
      <span className="max-w-[150px] truncate">{label}</span>
      <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
    </button>
  )
}

function QuickFilterPopover({
  filter,
  category,
  onCategoryChange,
  make,
  makes,
  onMakeChange,
  model,
  models,
  onModelChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  priceBounds,
  minYear,
  maxYear,
  onMinYearChange,
  onMaxYearChange,
  maxMileage,
  onMaxMileageChange,
  mileageBounds,
  fuel,
  fuels,
  onFuelChange,
  gearbox,
  gearboxes,
  onGearboxChange,
  onClose,
}: {
  filter: string
  category: string
  onCategoryChange: (value: string) => void
  make: string
  makes: string[]
  onMakeChange: (value: string) => void
  model: string
  models: string[]
  onModelChange: (value: string) => void
  minPrice: string
  maxPrice: string
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  priceBounds: { min: number; max: number }
  minYear: string
  maxYear: string
  onMinYearChange: (value: string) => void
  onMaxYearChange: (value: string) => void
  maxMileage: string
  onMaxMileageChange: (value: string) => void
  mileageBounds: { min: number; max: number }
  fuel: string
  fuels: string[]
  onFuelChange: (value: string) => void
  gearbox: string
  gearboxes: string[]
  onGearboxChange: (value: string) => void
  onClose: () => void
}) {
  return (
    <div className="absolute left-3 top-[calc(100%+4px)] z-40 w-[min(520px,calc(100vw-24px))] rounded-[8px] border border-[#d0d5dd] bg-white p-4 shadow-[0_24px_70px_rgba(16,24,40,.22)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#101828]">
          {filter === 'price' ? 'Pris' : filter === 'year' ? 'Modellår' : filter === 'mileage' ? 'Miltal' : filter === 'category' ? 'Kategori' : filter === 'make' ? 'Märke och modell' : filter === 'fuel' ? 'Drivmedel' : 'Växellåda'}
        </p>
        <button type="button" onClick={onClose} className="text-sm font-semibold text-[#008b97]">Stäng</button>
      </div>
      {filter === 'category' ? (
        <div className="grid max-h-[320px] gap-2 overflow-y-auto sm:grid-cols-2">
          {categories.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onCategoryChange(item.key)
                  onClose()
                }}
                className={`flex items-center gap-2 rounded-[8px] border px-3 py-2 text-left text-sm font-medium ${
                  category === item.key ? 'border-[#008b97] bg-[#d8fbff]' : 'border-[#d0d5dd] bg-white'
                }`}
              >
                <Icon className="h-4 w-4 text-[#0866ff]" />
                {item.label}
              </button>
            )
          })}
        </div>
      ) : null}
      {filter === 'make' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <FilterSelect label="Märke" value={make} onChange={onMakeChange} options={makes} />
          <FilterSelect label="Modell" value={model} onChange={onModelChange} options={models} />
          <button type="button" onClick={onClose} className="h-11 rounded-[7px] bg-[#008b97] px-4 text-sm font-semibold text-white sm:col-span-2">Tillämpa</button>
        </div>
      ) : null}
      {filter === 'price' ? (
        <RangeFilter title="Pris" minValue={minPrice} maxValue={maxPrice} onMinChange={onMinPriceChange} onMaxChange={onMaxPriceChange} minLimit={priceBounds.min} maxLimit={priceBounds.max} unit="SEK" step={1000} />
      ) : null}
      {filter === 'year' ? (
        <RangeFilter title="Modellår" minValue={minYear} maxValue={maxYear} onMinChange={onMinYearChange} onMaxChange={onMaxYearChange} minLimit={1950} maxLimit={new Date().getFullYear() + 1} step={1} startLabel="Före 1950" />
      ) : null}
      {filter === 'mileage' ? (
        <RangeFilter title="Miltal" minValue="" maxValue={maxMileage} onMinChange={() => undefined} onMaxChange={onMaxMileageChange} minLimit={mileageBounds.min} maxLimit={mileageBounds.max} unit="km" step={1000} />
      ) : null}
      {filter === 'fuel' ? (
        <FilterSelect label="Drivmedel" value={fuel} onChange={onFuelChange} options={fuels} />
      ) : null}
      {filter === 'gearbox' ? (
        <FilterSelect label="Växellåda" value={gearbox} onChange={onGearboxChange} options={gearboxes} />
      ) : null}
    </div>
  )
}

function FullFilterModal({
  mode,
  onModeChange,
  category,
  onCategoryChange,
  country,
  onCountryChange,
  make,
  makes,
  onMakeChange,
  model,
  models,
  onModelChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  priceBounds,
  minYear,
  maxYear,
  onMinYearChange,
  onMaxYearChange,
  maxMileage,
  onMaxMileageChange,
  mileageBounds,
  fuel,
  fuels,
  onFuelChange,
  gearbox,
  gearboxes,
  onGearboxChange,
  bodyType,
  bodyTypes,
  onBodyTypeChange,
  sellerType,
  onSellerTypeChange,
  equipmentQuery,
  onEquipmentQueryChange,
  onReset,
  onClose,
  resultCount,
}: {
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
  category: string
  onCategoryChange: (value: string) => void
  country: string
  onCountryChange: (value: string) => void
  make: string
  makes: string[]
  onMakeChange: (value: string) => void
  model: string
  models: string[]
  onModelChange: (value: string) => void
  minPrice: string
  maxPrice: string
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  priceBounds: { min: number; max: number }
  minYear: string
  maxYear: string
  onMinYearChange: (value: string) => void
  onMaxYearChange: (value: string) => void
  maxMileage: string
  onMaxMileageChange: (value: string) => void
  mileageBounds: { min: number; max: number }
  fuel: string
  fuels: string[]
  onFuelChange: (value: string) => void
  gearbox: string
  gearboxes: string[]
  onGearboxChange: (value: string) => void
  bodyType: string
  bodyTypes: string[]
  onBodyTypeChange: (value: string) => void
  sellerType: string
  onSellerTypeChange: (value: string) => void
  equipmentQuery: string
  onEquipmentQueryChange: (value: string) => void
  onReset: () => void
  onClose: () => void
  resultCount: number
}) {
  return (
    <div className="fixed inset-0 z-[90] bg-black/25 backdrop-blur-[3px]">
      <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-[14px] bg-white shadow-2xl sm:inset-y-4 sm:left-6 sm:right-auto sm:w-[500px] sm:rounded-[8px]">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-4">
          <p className="text-lg font-semibold text-[#101828]">Filter</p>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f4f7] text-[#101828]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(88vh-132px)] overflow-y-auto px-4 py-4">
          <SegmentedMode mode={mode} onModeChange={onModeChange} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <FilterSelect label="Kategori" value={category} onChange={onCategoryChange} options={categories.map((item) => ({ value: item.key, label: item.label }))} />
            <FilterSelect label="Marknad" value={country} onChange={onCountryChange} options={marketOptions} />
            <FilterSelect label="Märke" value={make} onChange={onMakeChange} options={makes} />
            <FilterSelect label="Modell" value={model} onChange={onModelChange} options={models} />
          </div>
          <div className="mt-5 grid gap-5">
            <RangeFilter title="Pris" minValue={minPrice} maxValue={maxPrice} onMinChange={onMinPriceChange} onMaxChange={onMaxPriceChange} minLimit={priceBounds.min} maxLimit={priceBounds.max} unit="SEK" step={1000} />
            <RangeFilter title="Modellår" minValue={minYear} maxValue={maxYear} onMinChange={onMinYearChange} onMaxChange={onMaxYearChange} minLimit={1950} maxLimit={new Date().getFullYear() + 1} step={1} startLabel="Före 1950" />
            <RangeFilter title="Miltal" minValue="" maxValue={maxMileage} onMinChange={() => undefined} onMaxChange={onMaxMileageChange} minLimit={mileageBounds.min} maxLimit={mileageBounds.max} unit="km" step={1000} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <FilterSelect label="Drivmedel" value={fuel} onChange={onFuelChange} options={fuels} />
            <FilterSelect label="Växellåda" value={gearbox} onChange={onGearboxChange} options={gearboxes} />
            <FilterSelect label="Kaross / typ" value={bodyType} onChange={onBodyTypeChange} options={bodyTypes} />
            <FilterSelect label="Säljartyp" value={sellerType} onChange={onSellerTypeChange} options={[{ value: 'all', label: 'Alla säljare' }, { value: 'business', label: 'Företag' }, { value: 'private', label: 'Privatperson' }]} />
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-[#475467]">Utrustning, drag m.m.</span>
              <input value={equipmentQuery} onChange={(event) => onEquipmentQueryChange(event.target.value)} placeholder="Ex. Dragkrok, navigation, fyrhjulsdrift" className="h-11 w-full rounded-[5px] border border-[#d0d5dd] bg-white px-3 text-sm font-medium outline-none transition placeholder:text-[#98a2b3] focus:border-[#0866ff]" />
            </label>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[#e5e7eb] bg-white px-4 py-3">
          <button type="button" onClick={onReset} className="h-10 rounded-[7px] bg-[#f2f4f7] px-5 text-sm font-semibold text-[#008b97]">Reset</button>
          <button type="button" onClick={onClose} className="h-10 flex-1 rounded-[7px] bg-[#008b97] px-5 text-sm font-semibold text-white">
            Visa {resultCount.toLocaleString('sv-SE')} resultat
          </button>
        </div>
      </div>
    </div>
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
    <article className="group relative mx-0 overflow-hidden border-b border-[#e5ebf3] bg-white px-4 py-5 transition hover:bg-[#fbfdff] sm:mx-6 sm:px-0">
      <Link href={href} aria-label={`Visa annons: ${listing.title}`} className="absolute inset-0 z-10" />
      <div className="pointer-events-none relative z-20 grid gap-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start">
        <div className="relative h-[246px] overflow-hidden rounded-[8px] bg-[#eef3f8] sm:h-[174px]">
          {listing.imageUrl ? (
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 100vw, 260px"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="grid h-full place-items-center text-[#0866ff]">
              <AutorellCarIcon className="h-12 w-12" />
            </div>
          )}
          {listing.sellerTrust === 'verified' ? (
            <span className="absolute left-3 top-3 rounded-[8px] bg-[#0866ff] px-2.5 py-1 text-xs font-semibold text-white">
              Verifierad
            </span>
          ) : null}
          <button
            type="button"
            aria-label="Spara annons"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
            className="pointer-events-auto absolute right-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-full bg-white text-[#101828] shadow-md transition hover:text-[#0866ff]"
          >
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
            className={`pointer-events-auto absolute bottom-3 right-3 z-30 hidden h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold shadow-md transition sm:inline-flex ${
              compareActive ? 'bg-[#0866ff] text-white' : 'bg-white text-[#101828] hover:text-[#0866ff]'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>Jämför</span>
          </button>
        </div>

        <div className="min-w-0">
          <div className="grid min-w-0 gap-1.5">
            <span className="line-clamp-1 text-[18px] font-semibold leading-tight text-[#101828] underline-offset-2 group-hover:text-[#0866ff] group-hover:underline">
              {listing.title}
            </span>
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
                  <span className="relative hidden h-7 w-28 overflow-hidden rounded-[8px] bg-[#eef3f8] sm:block">
                  <Image src={listing.sellerLogoUrl} alt={listing.sellerName} fill sizes="112px" className="object-contain" />
                </span>
              ) : null}
            </div>
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
          <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-[8px] bg-[#f1f2f4] px-3 text-[#667085]">
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
            className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-sm font-semibold text-[#101828] shadow-sm"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Sökfilter</span>
          </button>
          <MapLayerPicker mapLayer={mapLayer} onMapLayerChange={setMapLayer} />
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#101828] text-white shadow-sm"
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
            className="inline-flex h-12 items-center gap-2 rounded-[8px] bg-[#101828] px-4 text-sm font-semibold text-white shadow-lg"
          >
            <Expand className="h-5 w-5" />
            Fullskärm
          </button>
          <MapLayerPicker mapLayer={mapLayer} onMapLayerChange={setMapLayer} />
        </div>
      )}
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
    <div className="inline-flex h-12 overflow-hidden rounded-[8px] bg-[#101828] p-1 shadow-lg">
      <button
        type="button"
        onClick={() => onMapLayerChange('standard')}
        className={`inline-flex items-center gap-2 rounded-[7px] px-3 text-sm font-semibold transition ${
          mapLayer === 'standard' ? 'bg-white text-[#101828]' : 'text-white hover:bg-white/10'
        }`}
      >
        <Layers className="h-4 w-4" />
        <span className="hidden sm:inline">Karta</span>
      </button>
      <button
        type="button"
        onClick={() => onMapLayerChange('satellite')}
        className={`inline-flex items-center rounded-[7px] px-3 text-sm font-semibold transition ${
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

function formatPriceChip(minPrice: string, maxPrice: string) {
  if (minPrice && maxPrice) return `${formatFilterNumber(Number(minPrice))}-${formatFilterNumber(Number(maxPrice))}`
  if (minPrice) return `Från ${formatFilterNumber(Number(minPrice))}`
  if (maxPrice) return `Till ${formatFilterNumber(Number(maxPrice))}`
  return 'Pris'
}

function formatYearChip(minYear: string, maxYear: string) {
  if (minYear && maxYear) return `${minYear}-${maxYear}`
  if (minYear) return `Från ${minYear}`
  if (maxYear) return `Till ${maxYear}`
  return 'Modellår'
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
