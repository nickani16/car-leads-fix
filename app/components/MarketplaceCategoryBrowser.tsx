'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Heart,
  ImageIcon,
  LayoutGrid,
  List,
  MapPin,
  Scale,
  Search,
  X,
} from 'lucide-react'
import {
  localizePublicHref,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import SavedListingButton from './SavedListingButton'
import CountryFlag from './CountryFlag'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'
import { buildListingSpecChips, translateListingVehicleValue } from '@/lib/listing-display'
import { buildListingPath } from '@/lib/listing-url'

export type MarketplaceListing = {
  id: string
  make: string
  model: string
  title: string
  year: string | null
  mileageKm: number | null
  operatingHours: number | null
  fuelType: string | null
  gearbox: string | null
  bodyType: string | null
  color: string | null
  condition: string | null
  equipment: string | null
  country: string
  city?: string | null
  priceLabel: string
  priceValue: number | null
  imageAvailable: boolean
  imageUrl: string | null
  sellerName: string
  sellerIsTrader: boolean
  sellerTrust: 'verified' | 'unverified'
  messagingEnabled: boolean
}

type CategoryConfig = {
  slug: string
  label: string
  singular: string
  description: string
  filters: readonly string[]
}

type TypeCard = {
  label: string
  query: string
  image: string
  aliases: readonly string[]
}

const SAVED_SEARCHES_STORAGE_KEY = 'autorell-saved-searches'

export default function MarketplaceCategoryBrowser({
  category,
  listings,
  locale = 'sv',
  defaultCountry = '',
}: {
  category: CategoryConfig
  listings: MarketplaceListing[]
  locale?: PublicLocale
  defaultCountry?: string
}) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [modelQuery, setModelQuery] = useState(searchParams.get('model') || '')
  const [make, setMake] = useState(searchParams.get('make') || '')
  const [fuel, setFuel] = useState(searchParams.get('fuel') || '')
  const [gearbox, setGearbox] = useState(searchParams.get('gearbox') || '')
  const [bodyType, setBodyType] = useState(searchParams.get('body') || '')
  const [color, setColor] = useState(searchParams.get('color') || '')
  const [condition, setCondition] = useState(searchParams.get('condition') || '')
  const [sellerType, setSellerType] = useState(searchParams.get('sellerType') || 'all')
  const [equipmentQuery, setEquipmentQuery] = useState(searchParams.get('equipment') || '')
  const [yearFrom, setYearFrom] = useState(searchParams.get('yearFrom') || '')
  const [yearTo, setYearTo] = useState(searchParams.get('yearTo') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [minMileage, setMinMileage] = useState(searchParams.get('minMileage') || '')
  const [maxMileage, setMaxMileage] = useState(searchParams.get('maxMileage') || '')
  const [minHours, setMinHours] = useState(searchParams.get('minHours') || '')
  const [maxHours, setMaxHours] = useState(searchParams.get('maxHours') || '')
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [country, setCountry] = useState((searchParams.get('country') || defaultCountry || '').toUpperCase())
  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || '')
  const [sort, setSort] = useState('recommended')
  const [savedSearchKey, setSavedSearchKey] = useState('')
  const [listingLayout, setListingLayout] = useState<'list' | 'grid'>('list')
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [compareError, setCompareError] = useState('')
  const typeCarouselRef = useRef<HTMLDivElement>(null)
  const displayLocale = locale
  const localizedCategory = {
    ...localizeCategory(category, locale),
    filters: categoryQuickFilters(category.slug, locale),
  }
  const typeCards = useMemo(
    () => getMarketplaceTypeCards(category.slug, locale),
    [category.slug, locale],
  )
  const filterProfile = categoryFilterProfile(category.slug)
  const copy =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? marketplaceCopy[locale]
      : translatePublicObject(locale, marketplaceCopy.en)
  const allCategoryLabel = getAllCategoryLabel(localizedCategory.label, locale)
  const selectedTypeCard = typeCards.find((card) => card.query === activeFilter)
  const isMachineCategory = category.slug === 'agriculture' || category.slug === 'construction'
  const compareEnabled = category.slug === 'cars'
  const currentYear = new Date().getFullYear()

  const countries = useMemo(
    () =>
      euCountries
        .map(([code]) => code)
        .sort((a, b) => {
          if (defaultCountry && a === defaultCountry) return -1
          if (defaultCountry && b === defaultCountry) return 1
          return getEuCountryName(a, displayLocale).localeCompare(getEuCountryName(b, displayLocale), displayLocale)
        }),
    [defaultCountry, displayLocale],
  )
  const makes = useMemo(
    () => [...new Set(listings.map((listing) => listing.make).filter(Boolean))].sort((a, b) => a.localeCompare(b, displayLocale)),
    [displayLocale, listings],
  )
  const fuels = useMemo(
    () => [...new Set(listings.map((listing) => listing.fuelType).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, displayLocale)),
    [displayLocale, listings],
  )
  const gearboxes = useMemo(
    () => [...new Set(listings.map((listing) => listing.gearbox).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, displayLocale)),
    [displayLocale, listings],
  )
  const bodyTypes = useMemo(
    () => [...new Set(listings.map((listing) => listing.bodyType).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, displayLocale)),
    [displayLocale, listings],
  )
  const conditions = useMemo(
    () => [...new Set(listings.map((listing) => listing.condition).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, displayLocale)),
    [displayLocale, listings],
  )
  const colors = useMemo(
    () => [...new Set(listings.map((listing) => listing.color).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, displayLocale)),
    [displayLocale, listings],
  )
  const priceBounds = useMemo(() => {
    const prices = listings
      .map((listing) => listing.priceValue)
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0)
    const max = prices.length ? Math.max(...prices) : 1000000
    return { min: 0, max: Math.ceil(max / 10000) * 10000 }
  }, [listings])
  const mileageBounds = useMemo(() => {
    const values = listings
      .map((listing) => listing.mileageKm)
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0)
    const max = values.length ? Math.max(...values) : 200000
    return { min: 0, max: Math.max(200000, Math.ceil(max / 10000) * 10000) }
  }, [listings])
  const hoursBounds = useMemo(() => {
    const values = listings
      .map((listing) => listing.operatingHours)
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0)
    const max = values.length ? Math.max(...values) : 20000
    return { min: 0, max: Math.max(20000, Math.ceil(max / 1000) * 1000) }
  }, [listings])
  const visibleListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const normalizedModel = modelQuery.trim().toLowerCase()
    const filtered = listings.filter((listing) => {
      if (country && listing.country.toUpperCase() !== country) return false
      if (make && listing.make !== make) return false
      if (fuel && listing.fuelType !== fuel) return false
      if (gearbox && listing.gearbox !== gearbox) return false
      if (bodyType && listing.bodyType !== bodyType) return false
      if (color && listing.color !== color) return false
      if (condition && listing.condition !== condition) return false
      if (sellerType === 'business' && !listing.sellerIsTrader) return false
      if (sellerType === 'private' && listing.sellerIsTrader) return false
      if (minPrice && (listing.priceValue === null || listing.priceValue < Number(minPrice))) return false
      if (maxPrice && (listing.priceValue === null || listing.priceValue > Number(maxPrice))) return false
      if (yearFrom && Number(listing.year || 0) < Number(yearFrom)) return false
      if (yearTo && Number(listing.year || 0) > Number(yearTo)) return false
      if (minMileage && (listing.mileageKm === null || listing.mileageKm < Number(minMileage))) return false
      if (maxMileage && (listing.mileageKm === null || listing.mileageKm > Number(maxMileage))) return false
      if (minHours && (listing.operatingHours === null || listing.operatingHours < Number(minHours))) return false
      if (maxHours && (listing.operatingHours === null || listing.operatingHours > Number(maxHours))) return false
      if (
        equipmentQuery.trim() &&
        !(listing.equipment || '').toLowerCase().includes(equipmentQuery.trim().toLowerCase())
      ) return false
      const searchable = `${listing.title} ${listing.make} ${listing.model} ${listing.fuelType || ''} ${listing.gearbox || ''} ${listing.bodyType || ''} ${listing.equipment || ''}`.toLowerCase()
      if (normalizedQuery && !searchable.includes(normalizedQuery)) return false
      if (normalizedModel && !listing.model.toLowerCase().includes(normalizedModel)) return false
      if (!activeFilter) return true

      const normalizedFilter = activeFilter.toLowerCase()
      const currentYear = new Date().getFullYear()
      if (['nya', 'new', 'neu'].includes(normalizedFilter)) {
        return Number(listing.year) >= currentYear - 1
      }
      if (['begagnade', 'used', 'gebraucht'].includes(normalizedFilter)) {
        return !listing.year || Number(listing.year) < currentYear - 1
      }
      if (
        [
          'pris',
          'price',
          'preis',
          'miltal',
          'mileage',
          'kilometer',
          'drifttimmar',
          'operating hours',
          'betriebsstunden',
        ].includes(normalizedFilter)
      ) {
        return true
      }
      const selectedCard = typeCards.find((card) => card.query === activeFilter)
      if (selectedCard) return listingMatchesTypeCard(listing, selectedCard)
      return searchable.includes(normalizedFilter)
    })

    return [...filtered].sort((a, b) => {
      const localA = defaultCountry && a.country.toUpperCase() === defaultCountry ? 1 : 0
      const localB = defaultCountry && b.country.toUpperCase() === defaultCountry ? 1 : 0
      if (sort === 'recommended' && localA !== localB) return localB - localA
      if (sort === 'newest') return Number(b.year || 0) - Number(a.year || 0)
      if (sort === 'mileage') return (a.mileageKm ?? Number.MAX_SAFE_INTEGER) - (b.mileageKm ?? Number.MAX_SAFE_INTEGER)
      if (sort === 'price') return (a.priceValue ?? Number.MAX_SAFE_INTEGER) - (b.priceValue ?? Number.MAX_SAFE_INTEGER)
      if (sort === 'recommended' && (a.priceValue || b.priceValue)) {
        return (a.priceValue ?? Number.MAX_SAFE_INTEGER) - (b.priceValue ?? Number.MAX_SAFE_INTEGER)
      }
      return a.title.localeCompare(b.title, displayLocale)
    })
  }, [activeFilter, bodyType, color, condition, country, defaultCountry, displayLocale, equipmentQuery, fuel, gearbox, listings, make, maxHours, maxMileage, maxPrice, minHours, minMileage, minPrice, modelQuery, query, sellerType, sort, typeCards, yearFrom, yearTo])

  const typeCounts = useMemo(() => {
    const counts = Object.fromEntries(typeCards.map((card) => [card.query, 0])) as Record<string, number>
    for (const listing of listings) {
      const matched = typeCards.find((card) => listingMatchesTypeCard(listing, card))
      if (matched) counts[matched.query] += 1
    }
    return counts
  }, [listings, typeCards])

  const currentSearchKey = [
    'autorell-search',
    category.slug,
    query,
    country,
    activeFilter,
    make,
    modelQuery,
    minPrice,
    maxPrice,
    yearFrom,
    yearTo,
    minMileage,
    maxMileage,
    minHours,
    maxHours,
    fuel,
    gearbox,
    bodyType,
    color,
    condition,
    sellerType,
  ].join('-')
  const saved = savedSearchKey === currentSearchKey
  const compareListings = compareIds
    .map((id) => listings.find((listing) => listing.id === id))
    .filter(Boolean) as MarketplaceListing[]

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedSearches = readSavedSearches()
      setSavedSearchKey(savedSearches[currentSearchKey] ? currentSearchKey : '')
    }, 0)
    return () => window.clearTimeout(timer)
  }, [currentSearchKey])

  function toggleSavedSearch() {
    const savedSearches = readSavedSearches()
    if (saved) {
      delete savedSearches[currentSearchKey]
      window.localStorage.setItem(SAVED_SEARCHES_STORAGE_KEY, JSON.stringify(savedSearches))
      setSavedSearchKey('')
    } else {
      savedSearches[currentSearchKey] = {
        title: getSavedSearchTitle(selectedTypeCard?.label || query || localizedCategory.label),
        category: category.slug,
        categoryLabel: localizedCategory.label,
        query,
        make,
        modelQuery,
        country,
        activeFilter,
        minPrice,
        maxPrice,
        yearFrom,
        yearTo,
        minMileage,
        maxMileage,
        minHours,
        maxHours,
        fuel,
        gearbox,
        bodyType,
        color,
        condition,
        sellerType,
        resultCount: visibleListings.length,
        savedAt: new Date().toISOString(),
      }
      window.localStorage.setItem(SAVED_SEARCHES_STORAGE_KEY, JSON.stringify(savedSearches))
      setSavedSearchKey(currentSearchKey)
    }
  }

  function selectFilter(filter: string) {
    const normalized = filter.toLowerCase()
    const nextFilter = activeFilter === filter ? '' : filter
    setActiveFilter(nextFilter)
    if (['pris', 'price', 'preis'].includes(normalized)) setSort('price')
    if (['miltal', 'mileage', 'kilometer'].includes(normalized)) setSort('mileage')
  }

  function scrollTypeCarousel(direction: 'left' | 'right') {
    const carousel = typeCarouselRef.current
    if (!carousel) return

    carousel.scrollBy({
      left: direction === 'left' ? -carousel.clientWidth : carousel.clientWidth,
      behavior: 'smooth',
    })
  }

  function toggleCompare(listing: MarketplaceListing) {
    if (!compareEnabled) return
    setCompareError('')
    setCompareIds((current) => {
      if (current.includes(listing.id)) {
        return current.filter((id) => id !== listing.id)
      }
      if (current.length >= 3) {
        setCompareError(copy.compareLimit)
        return current
      }
      return [...current, listing.id]
    })
  }

  function clearCompare() {
    setCompareOpen(false)
    setCompareError('')
    setCompareIds([])
  }

  const activeChips = [
    query.trim()
      ? { label: query.trim(), onClear: () => setQuery('') }
      : null,
    activeFilter
      ? { label: selectedTypeCard?.label || activeFilter, onClear: () => setActiveFilter('') }
      : null,
    country && country !== defaultCountry
      ? { label: getEuCountryName(country, displayLocale), onClear: () => setCountry('') }
      : null,
    make
      ? { label: make, onClear: () => setMake('') }
      : null,
    modelQuery.trim()
      ? { label: modelQuery.trim(), onClear: () => setModelQuery('') }
      : null,
    minPrice || maxPrice
      ? {
          label: `${copy.priceTitle}: ${rangeChipLabel(minPrice, maxPrice, copy.minPrice, copy.maxPrice, 'kr', displayLocale)}`,
          onClear: () => {
            setMinPrice('')
            setMaxPrice('')
          },
        }
      : null,
    yearFrom || yearTo
      ? {
          label: `${copy.modelYearTitle}: ${rangeChipLabel(yearFrom, yearTo, copy.minPrice, copy.maxPrice, '', displayLocale)}`,
          onClear: () => {
            setYearFrom('')
            setYearTo('')
          },
        }
      : null,
    minMileage || maxMileage
      ? {
          label: `${copy.kilometerTitle}: ${rangeChipLabel(minMileage, maxMileage, copy.minPrice, copy.maxPrice, 'km', displayLocale)}`,
          onClear: () => {
            setMinMileage('')
            setMaxMileage('')
          },
        }
      : null,
    minHours || maxHours
      ? {
          label: `${copy.operatingHoursTitle}: ${rangeChipLabel(minHours, maxHours, copy.minPrice, copy.maxPrice, copy.hoursUnit, displayLocale)}`,
          onClear: () => {
            setMinHours('')
            setMaxHours('')
          },
        }
      : null,
    fuel
      ? { label: fuel, onClear: () => setFuel('') }
      : null,
    gearbox
      ? { label: gearbox, onClear: () => setGearbox('') }
      : null,
    bodyType
      ? { label: bodyType, onClear: () => setBodyType('') }
      : null,
    color
      ? { label: `${copy.colorTitle}: ${translateListingVehicleValue(locale, color) || color}`, onClear: () => setColor('') }
      : null,
    condition
      ? { label: condition, onClear: () => setCondition('') }
      : null,
    sellerType !== 'all'
      ? { label: sellerType === 'business' ? copy.sellerTypeBusiness : copy.sellerTypePrivate, onClear: () => setSellerType('all') }
      : null,
  ].filter((chip): chip is { label: string; onClear: () => void } => Boolean(chip))

  function clearAllFilters() {
    setActiveFilter('')
    setMake('')
    setModelQuery('')
    setFuel('')
    setGearbox('')
    setBodyType('')
    setColor('')
    setCondition('')
    setSellerType('all')
    setEquipmentQuery('')
    setYearFrom('')
    setYearTo('')
    setQuery('')
    setMinPrice('')
    setMaxPrice('')
    setMinMileage('')
    setMaxMileage('')
    setMinHours('')
    setMaxHours('')
    setCountry('')
  }

  const filterPanel = (
    <div className="rounded-[14px] border border-[#d9e1ec] bg-white shadow-[0_18px_55px_rgba(16,24,40,.08)]">
      <div className="flex items-center justify-between border-b border-[#e4e9f2] px-4 py-4">
        <div>
          <h2 className="text-lg font-bold tracking-[-0.03em]">{copy.filtersTitle}</h2>
        </div>
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-xs font-bold text-[#0866ff]"
        >
          {copy.clearAll}
        </button>
      </div>
      <div className="border-b border-[#e4e9f2] p-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={categorySearchPlaceholder(category.slug, locale)}
            className="marketplace-search-control h-12 w-full min-w-0 rounded-[8px] border border-[#9aa3b2] bg-white pl-10 pr-3.5 text-[14px] font-semibold outline-none transition placeholder:text-[#98a2b3] focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
          />
        </label>
      </div>
      <div className="border-b border-[#e4e9f2] px-4 py-4">
        <FilterGroup title={copy.categoryLabel}>
          <div className="space-y-3">
            <FilterCategoryButton
              label={allCategoryLabel}
              count={listings.length}
              active={!activeFilter}
              onClick={() => setActiveFilter('')}
            />
            {typeCards.map((card) => (
              <FilterCategoryButton
                key={card.query}
                label={card.label}
                count={typeCounts[card.query] || 0}
                active={activeFilter === card.query}
                onClick={() => selectFilter(card.query)}
              />
            ))}
          </div>
        </FilterGroup>
      </div>
      <div className="space-y-5 p-4">
        <FilterGroup title={copy.countryLabel}>
          <label className="relative block">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0866ff]" />
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="marketplace-search-control h-12 w-full min-w-0 appearance-none rounded-[8px] border border-[#cfd7e6] bg-white pl-10 pr-9 text-[14px] font-semibold text-[#202124] outline-none transition focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
            >
              <option value="">{copy.allEurope}</option>
              {countries.map((code) => (
                <option key={code} value={code}>
                  {getEuCountryName(code, displayLocale)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          </label>
        </FilterGroup>

        <FilterGroup title={copy.makeAndModel}>
          <div className="grid gap-2">
            <FilterSelect value={make} onChange={setMake} label={copy.makeLabel} options={makes} />
            <input
              value={modelQuery}
              onChange={(event) => setModelQuery(event.target.value)}
              placeholder={secondarySearchLabel(category.slug, locale)}
              className="marketplace-search-control h-12 w-full min-w-0 rounded-[8px] border border-[#cfd7e6] bg-white px-3.5 text-[14px] font-medium outline-none transition placeholder:text-[#667085] focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
            />
          </div>
        </FilterGroup>

        <RangeFilter
          title={copy.priceTitle}
          minValue={minPrice}
          maxValue={maxPrice}
          onMinChange={setMinPrice}
          onMaxChange={setMaxPrice}
          minLimit={priceBounds.min}
          maxLimit={priceBounds.max}
          minPlaceholder={copy.minPrice}
          maxPlaceholder={copy.maxPrice}
          unit="kr"
          locale={displayLocale}
          step={1000}
        />

        <RangeFilter
          title={copy.modelYearTitle}
          minValue={yearFrom}
          maxValue={yearTo}
          onMinChange={setYearFrom}
          onMaxChange={setYearTo}
          minLimit={1950}
          maxLimit={currentYear + 1}
          minPlaceholder={copy.minPrice}
          maxPlaceholder={copy.maxPrice}
          locale={displayLocale}
          step={1}
          startLabel={`${copy.beforePrefix} 1950`}
        />

        {isMachineCategory ? (
          <RangeFilter
            title={copy.operatingHoursTitle}
            minValue={minHours}
            maxValue={maxHours}
            onMinChange={setMinHours}
            onMaxChange={setMaxHours}
            minLimit={hoursBounds.min}
            maxLimit={hoursBounds.max}
            minPlaceholder={copy.minPrice}
            maxPlaceholder={copy.maxPrice}
            unit={copy.hoursUnit}
            locale={displayLocale}
            step={100}
          />
        ) : (
          <RangeFilter
            title={copy.kilometerTitle}
            minValue={minMileage}
            maxValue={maxMileage}
            onMinChange={setMinMileage}
            onMaxChange={setMaxMileage}
            minLimit={mileageBounds.min}
            maxLimit={mileageBounds.max}
            minPlaceholder={copy.minPrice}
            maxPlaceholder={copy.maxPrice}
            unit="km"
            locale={displayLocale}
            step={1000}
          />
        )}

        {filterProfile.basic.includes('fuel') ? (
          <FilterGroup title={copy.fuelTitle}>
            <FilterSelect value={fuel} onChange={setFuel} label={copy.fuel} options={fuels} />
          </FilterGroup>
        ) : null}
        {filterProfile.basic.includes('gearbox') ? (
          <FilterGroup title={copy.gearboxTitle}>
            <FilterSelect value={gearbox} onChange={setGearbox} label={copy.gearbox} options={gearboxes} />
          </FilterGroup>
        ) : null}
        {filterProfile.basic.includes('bodyType') ? (
          <FilterGroup title={copy.typeTitle}>
            <FilterSelect value={bodyType} onChange={setBodyType} label={categoryTypeLabel(category.slug, locale)} options={bodyTypes} />
          </FilterGroup>
        ) : null}
        {filterProfile.basic.includes('condition') ? (
          <FilterGroup title={copy.conditionTitle}>
            <FilterSelect value={condition} onChange={setCondition} label={copy.condition} options={conditions} />
          </FilterGroup>
        ) : null}

        <FilterGroup title={copy.colorTitle}>
          <FilterSelect value={color} onChange={setColor} label={copy.color} options={colors} />
        </FilterGroup>

        <FilterGroup title={copy.sellerTypeTitle}>
          <label className="relative block">
            <select
              value={sellerType}
              onChange={(event) => setSellerType(event.target.value)}
              className="marketplace-search-control h-12 w-full min-w-0 appearance-none rounded-[8px] border border-[#cfd7e6] bg-white px-3.5 pr-9 text-[14px] font-semibold text-[#202124] outline-none transition focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
            >
              <option value="all">{copy.sellerTypeAll}</option>
              <option value="business">{copy.sellerTypeBusiness}</option>
              <option value="private">{copy.sellerTypePrivate}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          </label>
        </FilterGroup>

        <button
          type="button"
          onClick={() => setMoreFiltersOpen((current) => !current)}
          aria-expanded={moreFiltersOpen}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[#cfd7e6] bg-[#f8fafc] px-3.5 text-[13px] font-bold text-[#344054] transition hover:border-[#98a2b3] hover:bg-white"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {moreFiltersOpen ? copy.fewerFilters : copy.moreFilters}
          <ChevronDown className={`h-4 w-4 transition ${moreFiltersOpen ? 'rotate-180' : ''}`} />
        </button>

        {moreFiltersOpen ? (
          <div className="grid gap-2.5 border-t border-[#e4e9f2] pt-4">
            {filterProfile.advanced.includes('fuel') ? (
              <FilterSelect value={fuel} onChange={setFuel} label={copy.fuel} options={fuels} />
            ) : null}
            {filterProfile.advanced.includes('gearbox') ? (
              <FilterSelect value={gearbox} onChange={setGearbox} label={copy.gearbox} options={gearboxes} />
            ) : null}
            {filterProfile.advanced.includes('bodyType') ? (
              <FilterSelect value={bodyType} onChange={setBodyType} label={categoryTypeLabel(category.slug, locale)} options={bodyTypes} />
            ) : null}
            {filterProfile.advanced.includes('condition') ? (
              <FilterSelect value={condition} onChange={setCondition} label={copy.condition} options={conditions} />
            ) : null}
            {filterProfile.advanced.includes('equipment') ? (
              <input
                value={equipmentQuery}
                onChange={(event) => setEquipmentQuery(event.target.value)}
                placeholder={equipmentLabel(category.slug, locale)}
                className="h-12 w-full rounded-[8px] border border-[#cfd7e6] bg-white px-3.5 text-[14px] font-medium outline-none focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )

  return (
    <>
      <section className="hidden">
        <div className="mx-auto max-w-[1380px] px-4 pb-7 pt-5 sm:px-8 sm:pb-9 sm:pt-7 lg:px-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0866ff]">
                {copy.marketplaceEyebrow}
              </p>
              <h1 className="mt-2 break-words text-[36px] leading-none tracking-[-0.05em] text-[#101828] sm:text-5xl">
                {localizedCategory.label}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085] sm:text-base">
                {localizedCategory.description}
              </p>
            </div>
            <div className="hidden gap-3 sm:flex">
              <Link
                href={localizePublicHref(locale, `/salj-fordon?category=${category.slug}`)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] bg-[#0866ff] px-6 text-sm font-bold text-white shadow-[0_10px_26px_rgba(8,102,255,.2)]"
              >
                {copy.sell} {localizedCategory.singular}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={localizePublicHref(locale, '/foretag')}
                className="inline-flex min-h-12 items-center justify-center rounded-[15px] border border-[#d0d5dd] bg-white px-6 text-sm font-bold"
              >
                {copy.sellBusiness}
              </Link>
            </div>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setActiveFilter('')}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition ${
                !activeFilter
                  ? 'border-[#0866ff] bg-[#0866ff] text-white'
                  : 'border-[#d8dde6] bg-white text-[#344054] hover:border-[#98a2b3]'
              }`}
            >
              {copy.all}
            </button>
            {localizedCategory.filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => selectFilter(filter)}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition ${
                  activeFilter === filter
                    ? 'border-[#0866ff] bg-[#eef4ff] text-[#075bd8]'
                    : 'border-[#d8dde6] bg-white text-[#344054] hover:border-[#98a2b3]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div
            id="marketplace-search"
            className="hidden w-full min-w-0 max-w-full scroll-mt-24 gap-2.5 rounded-[20px] border border-[#dde2ea] bg-[#f8f9fb] p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-4"
          >
            <label className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <select
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="marketplace-search-control h-12 w-full min-w-0 appearance-none rounded-[12px] border border-[#d8dde6] bg-white pl-10 pr-9 text-[14px] font-medium text-[#202124] outline-none transition focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
              >
                <option value="">{copy.allEurope}</option>
                {countries.map((code) => (
                  <option key={code} value={code}>
                    {getEuCountryName(code, displayLocale)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
            </label>
            <FilterSelect value={make} onChange={setMake} label={copy.makeLabel} options={makes} />
            <label className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.keyword}
                className="marketplace-search-control h-12 w-full min-w-0 rounded-[12px] border border-[#d8dde6] bg-white pl-10 pr-3.5 text-[14px] font-medium outline-none transition placeholder:text-[#667085] focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
              />
            </label>
            <label>
              <input
                value={modelQuery}
                onChange={(event) => setModelQuery(event.target.value)}
                placeholder={secondarySearchLabel(category.slug, locale)}
                className="marketplace-search-control h-12 w-full min-w-0 rounded-[12px] border border-[#d8dde6] bg-white px-3.5 text-[14px] font-medium outline-none transition placeholder:text-[#667085] focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
              />
            </label>
            {filterProfile.basic.includes('fuel') ? (
              <FilterSelect value={fuel} onChange={setFuel} label={copy.fuel} options={fuels} />
            ) : null}
            {filterProfile.basic.includes('gearbox') ? (
              <FilterSelect value={gearbox} onChange={setGearbox} label={copy.gearbox} options={gearboxes} />
            ) : null}
            {filterProfile.basic.includes('bodyType') ? (
              <FilterSelect value={bodyType} onChange={setBodyType} label={categoryTypeLabel(category.slug, locale)} options={bodyTypes} />
            ) : null}
            {filterProfile.basic.includes('condition') ? (
              <FilterSelect value={condition} onChange={setCondition} label={copy.condition} options={conditions} />
            ) : null}

            <button
              type="button"
              onClick={() => setMoreFiltersOpen((current) => !current)}
              aria-expanded={moreFiltersOpen}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] border border-[#d8dde6] bg-white px-3.5 text-[13px] font-semibold text-[#344054] transition hover:border-[#98a2b3] hover:bg-white"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {moreFiltersOpen ? copy.fewerFilters : copy.moreFilters}
              <ChevronDown className={`h-4 w-4 transition ${moreFiltersOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreFiltersOpen ? (
              <div className="grid gap-2.5 border-t border-[#dde2ea] pt-3 sm:col-span-2 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-4">
                {filterProfile.advanced.includes('fuel') ? (
                  <FilterSelect value={fuel} onChange={setFuel} label={copy.fuel} options={fuels} />
                ) : null}
                {filterProfile.advanced.includes('gearbox') ? (
                  <FilterSelect value={gearbox} onChange={setGearbox} label={copy.gearbox} options={gearboxes} />
                ) : null}
                {filterProfile.advanced.includes('bodyType') ? (
                  <FilterSelect value={bodyType} onChange={setBodyType} label={categoryTypeLabel(category.slug, locale)} options={bodyTypes} />
                ) : null}
                {filterProfile.advanced.includes('condition') ? (
                  <FilterSelect value={condition} onChange={setCondition} label={copy.condition} options={conditions} />
                ) : null}
                {filterProfile.advanced.includes('year') ? (
                  <label>
                    <input
                      value={yearFrom}
                      onChange={(event) => setYearFrom(event.target.value.replace(/\D/g, '').slice(0, 4))}
                      inputMode="numeric"
                      placeholder={copy.yearFrom}
                      className="h-12 w-full rounded-[12px] border border-[#d8dde6] bg-white px-3.5 text-[14px] font-medium outline-none focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
                    />
                  </label>
                ) : null}
                {filterProfile.advanced.includes('mileage') ? (
                  <label>
                    <input
                      value={maxMileage}
                      onChange={(event) => setMaxMileage(event.target.value.replace(/\D/g, '').slice(0, 7))}
                      inputMode="numeric"
                      placeholder={copy.maxMileage}
                      className="h-12 w-full rounded-[12px] border border-[#d8dde6] bg-white px-3.5 text-[14px] font-medium outline-none focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
                    />
                  </label>
                ) : null}
                {filterProfile.advanced.includes('hours') ? (
                  <label>
                    <input
                      value={maxHours}
                      onChange={(event) => setMaxHours(event.target.value.replace(/\D/g, '').slice(0, 7))}
                      inputMode="numeric"
                      placeholder={copy.maxHours}
                      className="h-12 w-full rounded-[12px] border border-[#d8dde6] bg-white px-3.5 text-[14px] font-medium outline-none focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
                    />
                  </label>
                ) : null}
                {filterProfile.advanced.includes('equipment') ? (
                  <label className="sm:col-span-2">
                    <input
                      value={equipmentQuery}
                      onChange={(event) => setEquipmentQuery(event.target.value)}
                      placeholder={equipmentLabel(category.slug, locale)}
                      className="h-12 w-full rounded-[12px] border border-[#d8dde6] bg-white px-3.5 text-[14px] font-medium outline-none focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
                    />
                  </label>
                ) : null}
              </div>
            ) : null}
            <a
              href="#marketplace-results"
              className="inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-[12px] bg-[#202124] px-4 text-center text-[13px] font-bold text-white transition hover:bg-black sm:col-span-2 lg:col-span-2"
            >
              <Search className="h-5 w-5" />
              {copy.search} {localizedCategory.label.toLowerCase()}
            </a>
          </div>
        </div>
      </section>

      <section id="marketplace-results" className="scroll-mt-24 overflow-hidden bg-white py-5 sm:py-8">
        <div className="max-w-[390px] px-5 min-[430px]:max-w-[430px] sm:mx-auto sm:max-w-[var(--autorell-page-max)] sm:px-8">
          <nav aria-label={copy.breadcrumbLabel} className="mb-7 flex flex-wrap items-center gap-2 text-sm font-bold text-[#667085]">
            <Link href={localizePublicHref(locale, '/')} className="transition hover:text-[#0866ff]">{copy.breadcrumbHome}</Link>
            <span className="text-[#98a2b3]">/</span>
            {selectedTypeCard ? (
              <>
                <Link href={localizePublicHref(locale, `/marketplace/${category.slug}`)} className="transition hover:text-[#0866ff]">
                  {localizedCategory.label}
                </Link>
                <span className="text-[#98a2b3]">/</span>
                <span className="text-[#101828]" aria-current="page">{selectedTypeCard.label}</span>
              </>
            ) : (
              <span className="text-[#101828]" aria-current="page">{localizedCategory.label}</span>
            )}
          </nav>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[34px] leading-tight tracking-[-0.045em] text-[#101828]">
                {allCategoryLabel}
              </h1>
              <p className="mt-1 text-sm text-[#667085]">
                {visibleListings.length.toLocaleString('sv-SE')} {localizedCategory.label.toLowerCase()} {copy.forSale}
              </p>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-[310px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24">{filterPanel}</div>
            </aside>
            <div className="min-w-0">
          <div className="mb-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-[-0.04em]">{copy.browseByCategory}</h2>
              {typeCards.length > 5 ? (
                <div className="hidden items-center gap-2 lg:flex">
                  <button
                    type="button"
                    onClick={() => scrollTypeCarousel('left')}
                    className="grid h-10 w-10 place-items-center rounded-full border border-[#d7dfeb] bg-white text-[#101828] shadow-sm transition hover:border-[#0866ff] hover:text-[#0866ff]"
                    aria-label="Previous categories"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTypeCarousel('right')}
                    className="grid h-10 w-10 place-items-center rounded-full border border-[#d7dfeb] bg-white text-[#101828] shadow-sm transition hover:border-[#0866ff] hover:text-[#0866ff]"
                    aria-label="Next categories"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              ) : null}
            </div>
            <div
              ref={typeCarouselRef}
              className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
            >
              {typeCards.map((card) => (
                <button
                  key={card.query}
                  type="button"
                  onClick={() => selectFilter(card.query)}
                  className={`group relative min-h-[118px] w-[228px] shrink-0 snap-start overflow-hidden rounded-[12px] border bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(16,24,40,.09)] sm:min-h-[128px] sm:p-4 lg:w-[calc((100%_-_4rem)/5)] ${
                    activeFilter === card.query ? 'border-[#0866ff]' : 'border-[#dfe6f2]'
                  }`}
                >
                  <strong className="relative z-10 block text-sm text-[#101828]">{card.label}</strong>
                  <span className="relative z-10 mt-1 block text-xs font-semibold text-[#344054]">
                    {(typeCounts[card.query] || 0).toLocaleString('sv-SE')}
                  </span>
                  <Image
                    src={card.image}
                    alt=""
                    width={180}
                    height={120}
                    className="absolute bottom-0 right-0 h-[74px] w-[106px] object-contain transition group-hover:scale-105 sm:h-[92px] sm:w-[132px]"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5 rounded-[12px] border border-[#d9e1ec] bg-white p-3 shadow-[0_14px_40px_rgba(16,24,40,.06)] sm:p-4">
          <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <p className="min-w-0 text-sm text-[#475467]">
                <strong className="text-[#101828]">{visibleListings.length}</strong>{' '}
                {copy.listings} {localizedCategory.label.toLowerCase()}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#667085]">
                {saved ? copy.savedSearchHint : copy.saveSearchHint}
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((current) => !current)}
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[8px] bg-[#0866ff] px-4 text-sm font-bold text-white lg:hidden"
              >
                {mobileFiltersOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
                {copy.filtersTitle}
              </button>
              <div className="inline-flex h-10 shrink-0 overflow-hidden rounded-[9px] border border-[#cfd7e6] bg-[#f8fafc]" aria-label={copy.viewMode}>
                <button
                  type="button"
                  onClick={() => setListingLayout('list')}
                  aria-pressed={listingLayout === 'list'}
                  className={`grid w-10 place-items-center transition ${listingLayout === 'list' ? 'bg-[#0866ff] text-white' : 'text-[#667085] hover:bg-white'}`}
                  title={copy.oneColumn}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setListingLayout('grid')}
                  aria-pressed={listingLayout === 'grid'}
                  className={`grid w-10 place-items-center border-l border-[#cfd7e6] transition ${listingLayout === 'grid' ? 'bg-[#0866ff] text-white' : 'text-[#667085] hover:bg-white'}`}
                  title={copy.twoColumns}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
              <label className="relative min-w-[160px] flex-1 sm:flex-none">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-10 w-full min-w-0 appearance-none rounded-[9px] border border-[#d0d5dd] bg-white pl-4 pr-9 text-xs font-bold outline-none"
                  aria-label={copy.sort}
                >
                  <option value="recommended">{copy.recommended}</option>
                  <option value="newest">{copy.newest}</option>
                  <option value="mileage">{copy.mileage}</option>
                  <option value="price">{copy.lowestPrice}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              </label>
              <button
                type="button"
                onClick={toggleSavedSearch}
                aria-pressed={saved}
                aria-label={saved ? copy.saved : copy.saveSearch}
                className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[9px] border px-3 text-sm font-bold transition ${
                  saved
                    ? 'border-[#0866ff] bg-[#eef4ff] text-[#0866ff]'
                    : 'border-[#cfd7e6] bg-white text-[#0866ff] hover:border-[#0866ff]'
                }`}
              >
                <span>{saved ? copy.saved : copy.saveSearch}</span>
                <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          </div>

          {activeChips.length ? (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex min-h-9 items-center rounded-full bg-[#0866ff] px-4 text-xs font-bold text-white transition hover:bg-[#075be5]"
              >
                {copy.clearAllFilters}
              </button>
              {activeChips.map((chip, index) => (
                <button
                  key={`${chip.label}-${index}`}
                  type="button"
                  onClick={chip.onClear}
                  className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-full bg-[#e6e8ee] px-3 text-xs font-bold text-[#202124] transition hover:bg-[#d9dde6]"
                >
                  <span className="truncate">{chip.label}</span>
                  <X className="h-4 w-4 shrink-0" />
                </button>
              ))}
            </div>
          ) : null}

          {compareEnabled && compareIds.length ? (
            <div className="mb-5 overflow-hidden rounded-[8px] border border-[#c9d9ef] bg-[#f7fbff] shadow-sm">
              <div className="h-1 bg-[#0866ff]" />
              <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (compareIds.length >= 2) setCompareOpen(true)
                  }}
                  className="inline-flex min-w-0 items-center gap-3 text-left"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#0866ff] shadow-sm">
                    <Scale className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[#101828]">
                      {compareIds.length} {compareIds.length === 1 ? copy.compareSelectedSingular : copy.compareSelectedPlural}
                    </span>
                    <span className="block text-xs font-semibold text-[#667085]">
                      {copy.compareHelper}
                    </span>
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  {compareError ? (
                    <p className="text-xs font-bold text-[#b42318]" role="alert">
                      {compareError}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setCompareOpen(true)}
                    disabled={compareIds.length < 2}
                    className="inline-flex min-h-10 items-center gap-2 rounded-[9px] bg-[#0866ff] px-4 text-sm font-bold text-white transition hover:bg-[#075be5] disabled:bg-[#c8d2e2] disabled:text-white"
                  >
                    <Scale className="h-4 w-4" />
                    {copy.compareAction}
                  </button>
                  <button
                    type="button"
                    onClick={clearCompare}
                    aria-label={copy.compareClear}
                    className="grid h-10 w-10 place-items-center rounded-[9px] border border-[#d5dce8] bg-white text-[#475467] transition hover:border-[#98a2b3]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {mobileFiltersOpen ? <div className="mb-4 lg:hidden">{filterPanel}</div> : null}

          {visibleListings.length ? (
            <div className={listingLayout === 'grid' ? 'grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-2' : 'grid gap-4'}>
              {visibleListings.map((listing) => {
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
                const sellerLabel = listing.sellerIsTrader ? listing.sellerName : copy.privateSeller
                const compared = compareIds.includes(listing.id)
                const specChips = buildListingSpecChips(
                  {
                    fuelType: listing.fuelType,
                    gearbox: listing.gearbox,
                    mileageKm: listing.mileageKm,
                    modelYear: listing.year,
                  },
                  locale,
                )

                return (
                <article
                  key={listing.id}
                  className={`group overflow-hidden rounded-[8px] border bg-white shadow-[0_12px_36px_rgba(16,24,40,.07)] transition hover:shadow-[0_18px_50px_rgba(16,24,40,.11)] ${
                    compared ? 'border-[#0866ff] ring-2 ring-[#0866ff]/10' : 'border-[#d9e1ec]'
                  }`}
                >
                  <div className={listingLayout === 'grid' ? 'grid min-w-0' : 'grid min-w-0 md:grid-cols-[300px_minmax(0,1fr)]'}>
                  <div
                    className={
                      listingLayout === 'grid'
                        ? 'relative aspect-[4/3] overflow-hidden bg-[linear-gradient(145deg,#edf3ff,#dce8ff)]'
                        : 'relative min-h-[230px] overflow-hidden bg-[linear-gradient(145deg,#edf3ff,#dce8ff)] md:h-full'
                    }
                  >
                    <Link href={detailHref} className="absolute inset-0 block">
                    {listing.imageUrl ? (
                      <Image
                        src={listing.imageUrl}
                        alt={listing.title}
                        fill
                        sizes={listingLayout === 'grid' ? '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw' : '(max-width: 768px) 100vw, 300px'}
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <>
                        <div className="market-blob absolute -right-16 -top-20 h-56 w-56 bg-white/65" />
                        <div className="absolute inset-0 grid place-items-center text-[#0866ff]">
                          <span className="grid h-16 w-16 place-items-center rounded-[20px] border border-white bg-white/75 shadow-sm backdrop-blur">
                            <ImageIcon className="h-7 w-7" />
                          </span>
                        </div>
                      </>
                    )}
                    </Link>
                    <div className="absolute right-4 top-4">
                      <SavedListingButton listingId={listing.id} />
                    </div>
                    {listing.sellerTrust === 'verified' ? (
                      <span className="absolute left-3 top-3 rounded-[7px] bg-[#0866ff] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        {copy.verified}
                      </span>
                    ) : null}
                    <CountryFlag
                      code={listing.country || 'eu'}
                      className="absolute bottom-3 left-3 h-7 w-7 rounded-full"
                    />
                    {compareEnabled ? (
                      <button
                        type="button"
                        onClick={() => toggleCompare(listing)}
                        aria-pressed={compared}
                        className={`absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold shadow-[0_7px_18px_rgba(16,24,40,.18)] transition ${
                          compared
                            ? 'bg-[#0866ff] text-white hover:bg-[#075be5]'
                            : 'bg-white/95 text-[#101828] hover:bg-[#f3f7ff]'
                        }`}
                      >
                        <Scale className="h-3.5 w-3.5" />
                        {compared ? copy.compareAdded : copy.compare}
                      </button>
                    ) : null}
                  </div>
                  <div className={listingLayout === 'grid' ? 'grid min-w-0 gap-3 p-3 sm:gap-4 sm:p-4 md:p-5' : 'grid min-w-0 gap-4 p-4 md:grid-cols-[minmax(0,1fr)_180px] md:p-5'}>
                    <div className="min-w-0">
                    <Link href={detailHref} className="block text-[#101828] hover:text-[#0866ff]">
                      <h2 className={listingLayout === 'grid' ? 'break-words text-base font-bold tracking-[-0.035em] sm:text-xl' : 'break-words text-xl font-bold tracking-[-0.035em] sm:text-2xl'}>{listing.title}</h2>
                    </Link>
                    <p className={listingLayout === 'grid' ? 'mt-2 text-xs text-[#667085] sm:text-sm' : 'mt-2 text-sm text-[#667085]'}>
                      {[listing.year, listing.fuelType, listing.mileageKm !== null ? `${listing.mileageKm.toLocaleString('sv-SE')} km` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    {specChips.length ? (
                      <div className={listingLayout === 'grid' ? 'mt-3 hidden flex-wrap gap-1.5 sm:flex' : 'mt-3 flex flex-wrap gap-1.5'}>
                        {specChips.map((chip) => (
                          <span
                            key={chip.key}
                            className="inline-flex min-h-7 items-center rounded-full bg-[#f3f5f8] px-2.5 text-[11px] font-bold text-[#344054]"
                          >
                            {chip.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <p className={listingLayout === 'grid' ? 'mt-2 text-xs font-semibold text-[#475467] sm:mt-3' : 'mt-3 text-xs font-semibold text-[#475467]'}>
                      {listing.sellerIsTrader ? `${copy.businessSeller} · ${sellerLabel}` : sellerLabel}
                    </p>
                    <div className={listingLayout === 'grid' ? 'mt-4 hidden items-start gap-3 border-t border-[#edf1f6] pt-4 sm:flex' : 'mt-5 flex items-start gap-3 border-t border-[#edf1f6] pt-4'}>
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#0866ff]" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#667085]">{copy.listingCountry}</p>
                        <p className="mt-1 text-sm font-bold text-[#101828]">
                          {[listing.city, getEuCountryName(listing.country, displayLocale)].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                    </div>
                    <div className={listingLayout === 'grid' ? 'flex min-w-0 flex-col items-start gap-3 border-t border-[#edf1f6] pt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:pt-4' : 'flex min-w-0 flex-row items-end justify-between gap-4 border-t border-[#edf1f6] pt-4 md:flex-col md:items-end md:border-l md:border-t-0 md:pl-5 md:pt-0'}>
                      <div className={listingLayout === 'grid' ? 'text-left' : 'text-left md:text-right'}>
                        <span className="block text-xs font-semibold text-[#667085]">{copy.fixedPrice}</span>
                        <strong className={listingLayout === 'grid' ? 'mt-1 block text-lg tracking-[-0.04em] text-[#101828] sm:text-2xl' : 'mt-1 block text-2xl tracking-[-0.04em] text-[#101828]'}>{listing.priceLabel}</strong>
                        <span className="mt-1 block text-xs font-semibold text-[#667085]">{sellerLabel}</span>
                      </div>
                      <Link
                        href={detailHref}
                        className={listingLayout === 'grid' ? 'hidden min-h-11 items-center justify-center rounded-[12px] bg-[#0866ff] px-5 text-sm font-bold text-white transition hover:bg-[#075be5] sm:inline-flex' : 'inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[#0866ff] px-5 text-sm font-bold text-white transition hover:bg-[#075be5]'}
                      >
                        {copy.viewListing}
                      </Link>
                    </div>
                  </div>
                  </div>
                </article>
                )
              })}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[28px] border border-[#dce3f2] bg-white px-6 py-16 text-center shadow-[0_18px_55px_rgba(16,24,40,.05)] sm:py-20">
              <div className="market-blob absolute -right-24 -top-28 h-80 w-80 bg-[#edf3ff]" />
              <div className="relative">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-[17px] bg-[#0866ff] text-white">
                  <Search className="h-6 w-6" />
                </span>
                <h2 className="mx-auto mt-6 max-w-2xl break-words text-2xl tracking-[-0.035em]">
                  {copy.noResults}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#667085]">
                  {copy.noResultsText} {localizedCategory.singular}.
                </p>
                <Link
                  href={localizePublicHref(locale, `/salj-fordon?category=${category.slug}`)}
                  className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-[15px] bg-[#0866ff] px-6 text-sm font-bold text-white"
                >
                  {copy.createListing}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-4 text-xs text-[#98a2b3]">
                  {copy.perListing}
                </p>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </section>
      {compareEnabled && compareOpen ? (
        <CompareOverlay
          listings={compareListings}
          locale={locale}
          copy={copy}
          onClose={() => setCompareOpen(false)}
          onRemove={(id) => setCompareIds((current) => current.filter((item) => item !== id))}
        />
      ) : null}
    </>
  )
}

function CompareOverlay({
  listings,
  locale,
  copy,
  onClose,
  onRemove,
}: {
  listings: MarketplaceListing[]
  locale: PublicLocale
  copy: MarketplaceCopy
  onClose: () => void
  onRemove: (id: string) => void
}) {
  const bestPrice = Math.min(
    ...listings.map((listing) => listing.priceValue ?? Number.MAX_SAFE_INTEGER),
  )
  const newestYear = Math.max(
    ...listings.map((listing) => Number(listing.year || 0)),
  )
  const lowestMileage = Math.min(
    ...listings.map((listing) => listing.mileageKm ?? Number.MAX_SAFE_INTEGER),
  )

  return (
    <div className="fixed inset-0 z-50 bg-white text-[#101828]">
      <div className="flex h-14 items-center justify-between border-b border-[#dfe5ef] px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black tracking-[-0.035em] sm:text-2xl">
            {copy.compareTitle}
          </h2>
          <span className="rounded-[6px] bg-[#edf4ff] px-2 py-1 text-xs font-bold text-[#0866ff]">
            {copy.compareBeta}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.compareClose}
          className="grid h-10 w-10 place-items-center rounded-full text-[#101828] transition hover:bg-[#f2f5f9]"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="h-[calc(100vh-56px)] overflow-auto">
        <div
          className="grid min-w-[780px]"
          style={{ gridTemplateColumns: `repeat(${Math.max(listings.length, 2)}, minmax(260px, 1fr))` }}
        >
          {listings.map((listing, index) => {
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
            const highlights = compareHighlights(listing, {
              bestPrice,
              newestYear,
              lowestMileage,
              copy,
            })

            return (
              <article key={listing.id} className="border-r border-[#dfe5ef]">
                <div className="p-4 sm:p-6">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-[#edf4ff]">
                    {listing.imageUrl ? (
                      <Image
                        src={listing.imageUrl}
                        alt={listing.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[#0866ff]">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemove(listing.id)}
                      aria-label={copy.compareRemove}
                      className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-[#101828] shadow-sm transition hover:bg-[#f2f5f9]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute right-3 top-3">
                      <SavedListingButton listingId={listing.id} />
                    </div>
                    <CountryFlag code={listing.country || 'eu'} className="absolute bottom-3 left-3 h-7 w-7 rounded-full" />
                  </div>

                  <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#667085]">
                    {String.fromCharCode(65 + index)}. {getEuCountryName(listing.country, locale)}
                  </p>
                  <h3 className="mt-1 line-clamp-2 min-h-[48px] text-lg font-black tracking-[-0.035em]">
                    {listing.title}
                  </h3>
                  <p className="mt-2 text-2xl font-black tracking-[-0.045em]">
                    {listing.priceLabel}
                  </p>
                  <dl className="mt-4 grid gap-2 text-sm">
                    <CompareRow label={copy.modelYearTitle} value={listing.year || '-'} />
                    <CompareRow
                      label={copy.kilometerTitle}
                      value={listing.mileageKm !== null ? `${listing.mileageKm.toLocaleString('sv-SE')} km` : '-'}
                    />
                    <CompareRow label={copy.fuelTitle} value={listing.fuelType || '-'} />
                    <CompareRow label={copy.gearboxTitle} value={listing.gearbox || '-'} />
                    <CompareRow
                      label={copy.countryLabel}
                      value={[listing.city, getEuCountryName(listing.country, locale)].filter(Boolean).join(', ')}
                    />
                  </dl>
                  <Link
                    href={detailHref}
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-[9px] border border-[#cfd7e6] px-4 text-sm font-bold text-[#0866ff] transition hover:border-[#0866ff] hover:bg-[#f8fbff]"
                  >
                    {copy.viewListing}
                  </Link>
                </div>

                <div className="border-t border-[#dfe5ef] bg-[#f5fbf8] p-4 sm:p-6">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#101828]">
                    {copy.compareStrengths}
                  </p>
                  {highlights.length ? (
                    <ul className="mt-3 grid gap-2">
                      {highlights.map((highlight) => (
                        <li key={highlight} className="text-sm font-bold text-[#101828]">
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-[#667085]">{copy.compareNoStrengths}</p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CompareRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#edf1f6] pb-2">
      <dt className="text-[#667085]">{label}</dt>
      <dd className="text-right font-bold text-[#101828]">{value}</dd>
    </div>
  )
}

function compareHighlights(
  listing: MarketplaceListing,
  {
    bestPrice,
    newestYear,
    lowestMileage,
    copy,
  }: {
    bestPrice: number
    newestYear: number
    lowestMileage: number
    copy: MarketplaceCopy
  },
) {
  const highlights: string[] = []
  if (listing.priceValue !== null && listing.priceValue === bestPrice) {
    highlights.push(`${copy.compareBestPrice} (${listing.priceLabel})`)
  }
  if (listing.year && Number(listing.year) === newestYear) {
    highlights.push(`${copy.compareNewest} (${listing.year})`)
  }
  if (listing.mileageKm !== null && listing.mileageKm === lowestMileage) {
    highlights.push(`${copy.compareLowestMileage} (${listing.mileageKm.toLocaleString('sv-SE')} km)`)
  }
  return highlights
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
  variant = 'boxed',
}: {
  value: string
  onChange: (value: string) => void
  label: string
  options: string[]
  variant?: 'boxed' | 'plain'
}) {
  return (
    <label className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={
          variant === 'plain'
            ? 'h-8 w-full appearance-none bg-transparent pr-8 text-sm font-bold text-[#202124] outline-none'
            : 'h-12 w-full appearance-none rounded-[12px] border border-[#d8dde6] bg-white px-3.5 pr-9 text-[14px] font-medium text-[#202124] outline-none transition focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10'
        }
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
    </label>
  )
}

function FilterCategoryButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-semibold transition ${
        active ? 'bg-[#edf4ff] text-[#0866ff]' : 'text-[#344054] hover:bg-[#f8fbff]'
      }`}
    >
      <span className="truncate">{label}</span>
      <span className="shrink-0 text-xs text-[#667085]">{count.toLocaleString('sv-SE')}</span>
    </button>
  )
}

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="border-b border-[#edf1f6] pb-4 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-1 text-left text-[13px] font-bold text-[#101828]"
      >
        <span>{title}</span>
        <ChevronDown className={`h-4 w-4 text-[#667085] transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </section>
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
  minPlaceholder,
  maxPlaceholder,
  unit = '',
  locale,
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
  minPlaceholder: string
  maxPlaceholder: string
  unit?: string
  locale: PublicLocale
  step: number
  startLabel?: string
}) {
  const rangeValue = Number(maxValue || maxLimit)
  const plainNumber = !unit
  const formatRangeValue = (value: string | number) =>
    plainNumber ? String(value) : formatFilterNumber(Number(value), locale)
  const minDisplay = startLabel || formatRangeValue(minValue || minLimit)
  const maxDisplay = `${formatRangeValue(maxValue || maxLimit)}+`

  return (
    <FilterGroup title={title}>
      <div className="grid gap-3">
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={rangeValue}
          onChange={(event) => onMaxChange(event.target.value)}
          className="h-2 w-full accent-[#0866ff]"
          aria-label={title}
        />
        <div className="flex items-center justify-between text-xs font-semibold text-[#667085]">
          <span>{minDisplay}</span>
          <span>{maxDisplay}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="relative">
            <input
              value={minValue}
              onChange={(event) => onMinChange(event.target.value.replace(/\D/g, '').slice(0, 9))}
              inputMode="numeric"
              placeholder={minPlaceholder}
              className={`h-12 w-full min-w-0 rounded-[8px] border border-[#cfd7e6] bg-white pl-3.5 ${unit ? 'pr-11' : 'pr-3.5'} text-[14px] font-medium outline-none transition placeholder:text-[#667085] focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10`}
            />
            {unit ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#202124]">{unit}</span> : null}
          </label>
          <label className="relative">
            <input
              value={maxValue}
              onChange={(event) => onMaxChange(event.target.value.replace(/\D/g, '').slice(0, 9))}
              inputMode="numeric"
              placeholder={maxPlaceholder}
              className={`h-12 w-full min-w-0 rounded-[8px] border border-[#cfd7e6] bg-white pl-3.5 ${unit ? 'pr-11' : 'pr-3.5'} text-[14px] font-medium outline-none transition placeholder:text-[#667085] focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10`}
            />
            {unit ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#202124]">{unit}</span> : null}
          </label>
        </div>
      </div>
    </FilterGroup>
  )
}

type SavedSearchRecord = Record<
  string,
  {
    title: string
    category: string
    categoryLabel: string
    query: string
    make: string
    modelQuery: string
    country: string
    activeFilter: string
    minPrice: string
    maxPrice: string
    yearFrom: string
    yearTo: string
    minMileage: string
    maxMileage: string
    minHours: string
    maxHours: string
    fuel: string
    gearbox: string
    bodyType: string
    color: string
    condition: string
    sellerType: string
    resultCount: number
    savedAt: string
  }
>

function readSavedSearches(): SavedSearchRecord {
  if (typeof window === 'undefined') return {}
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SAVED_SEARCHES_STORAGE_KEY) || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function getSavedSearchTitle(value: string) {
  const trimmed = value.trim()
  return trimmed || 'Autorell search'
}

function normalizeTypeMatch(value: string | null | undefined) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function listingMatchesTypeCard(listing: MarketplaceListing, card: TypeCard) {
  const searchable = normalizeTypeMatch(
    `${listing.title} ${listing.make} ${listing.model} ${listing.bodyType || ''} ${listing.equipment || ''}`,
  )
  return card.aliases.some((alias) => searchable.includes(normalizeTypeMatch(alias)))
}

function localizedType(sv: string, en: string, de: string, locale: PublicLocale) {
  return locale === 'sv' ? sv : locale === 'de' ? de : en
}

function typeCard(
  locale: PublicLocale,
  sv: string,
  en: string,
  de: string,
  query: string,
  image: string,
  aliases: readonly string[] = [],
): TypeCard {
  return { label: localizedType(sv, en, de, locale), query, image, aliases: [query, sv, en, de, ...aliases] }
}

function getMarketplaceTypeCards(slug: string, locale: PublicLocale): TypeCard[] {
  const t = (sv: string, en: string, de: string, query: string, image: string, aliases: readonly string[] = []) =>
    typeCard(locale, sv, en, de, query, image, aliases)
  const cards: Record<string, TypeCard[]> = {
    cars: [
      t('Halvkombi', 'Hatchback', 'Kompaktwagen', 'hatchback', '/category-types/cars-hatchback.png', ['halvkombi', '5-dörrar', '5 door']),
      t('Sedan', 'Sedan', 'Limousine', 'sedan', '/category-types/cars-sedan.png'),
      t('SUV', 'SUV', 'SUV', 'suv', '/category-types/cars-suv.png'),
      t('Kombi', 'Estate', 'Kombi', 'estate', '/category-types/cars-estate.png', ['kombi', 'wagon', 'touring']),
      t('Coupé', 'Coupe', 'Coupe', 'coupe', '/category-types/cars-coupe.png'),
      t('Sportbil', 'Sports car', 'Sportwagen', 'sports car', '/category-types/cars-sports-car.png'),
      t('Cabriolet', 'Convertible', 'Cabriolet', 'convertible', '/category-types/cars-convertible.png'),
      t('Antik bil', 'Classic car', 'Oldtimer', 'classic car', '/category-types/cars-classic.png'),
      t('Elbil', 'Electric', 'Elektro', 'electric', '/category-types/cars-electric.png'),
      t('Pickup', 'Pickup', 'Pickup', 'pickup', '/category-types/cars-pickup.png'),
    ],
    vans: [
      t('Skåpbil', 'Panel van', 'Kastenwagen', 'panel', '/category-types/vans-panel.png'),
      t('Crew van', 'Crew van', 'Doppelkabine', 'crew', '/category-types/vans-crew.png'),
      t('Box van', 'Box van', 'Koffer', 'box', '/category-types/vans-box.png'),
      t('Kylbil', 'Refrigerated', 'Kühlfahrzeug', 'refrigerated', '/category-types/vans-refrigerated.png'),
      t('Minibuss', 'Minibus', 'Minibus', 'minibus', '/category-types/vans-minibus.png'),
      t('Pickup', 'Pickup', 'Pickup', 'pickup', '/category-types/vans-pickup.png'),
      t('Eltransport', 'Electric', 'Elektro', 'electric', '/category-types/vans-electric.png'),
      t('Camper', 'Camper', 'Camper', 'camper', '/category-types/vans-camper.png'),
    ],
    motorcycles: [
      t('Sport', 'Sport', 'Sport', 'sport', '/category-types/motorcycles-sport.png'),
      t('Touring', 'Touring', 'Touring', 'touring', '/category-types/motorcycles-touring.png'),
      t('Naked', 'Naked', 'Naked', 'naked', '/category-types/motorcycles-naked.png'),
      t('Cruiser', 'Cruiser', 'Cruiser', 'cruiser', '/category-types/motorcycles-cruiser.png'),
      t('Adventure', 'Adventure', 'Adventure', 'adventure', '/category-types/motorcycles-adventure.png'),
      t('Scooter', 'Scooter', 'Roller', 'scooter', '/category-types/motorcycles-scooter.png'),
      t('Custom', 'Custom', 'Custom', 'custom', '/category-types/motorcycles-custom.png'),
      t('Electric', 'Electric', 'Elektro', 'electric', '/category-types/motorcycles-electric.png'),
    ],
    motorhomes: [
      t('Camper van', 'Camper van', 'Camper Van', 'camper van', '/category-types/recreation-camper-van.png'),
      t('Halvintegrerad', 'Coachbuilt', 'Teilintegriert', 'coachbuilt', '/category-types/recreation-coachbuilt.png'),
      t('Helintegrerad', 'A-class', 'Integriert', 'a-class', '/category-types/recreation-a-class.png'),
      t('Alkov', 'Overcab', 'Alkoven', 'overcab', '/category-types/recreation-overcab.png'),
      t('Kompakt', 'Compact', 'Kompakt', 'compact', '/category-types/recreation-compact-caravan.png'),
      t('Familj', 'Family', 'Familie', 'family', '/category-types/recreation-family-caravan.png'),
      t('Twin axle', 'Twin axle', 'Tandemachse', 'twin axle', '/category-types/recreation-twin-axle.png'),
      t('Teardrop', 'Teardrop', 'Teardrop', 'teardrop', '/category-types/recreation-teardrop.png'),
    ],
    caravans: [
      t('Kompakt', 'Compact', 'Kompakt', 'compact', '/category-types/recreation-compact-caravan.png'),
      t('Familj', 'Family', 'Familie', 'family', '/category-types/recreation-family-caravan.png'),
      t('Twin axle', 'Twin axle', 'Tandemachse', 'twin axle', '/category-types/recreation-twin-axle.png'),
      t('Teardrop', 'Teardrop', 'Teardrop', 'teardrop', '/category-types/recreation-teardrop.png'),
      t('Camper van', 'Camper van', 'Camper Van', 'camper van', '/category-types/recreation-camper-van.png'),
      t('Halvintegrerad', 'Coachbuilt', 'Teilintegriert', 'coachbuilt', '/category-types/recreation-coachbuilt.png'),
      t('Helintegrerad', 'A-class', 'Integriert', 'a-class', '/category-types/recreation-a-class.png'),
      t('Alkov', 'Overcab', 'Alkoven', 'overcab', '/category-types/recreation-overcab.png'),
    ],
    trucks: [
      t('Dragbil', 'Tractor unit', 'Sattelzugmaschine', 'tractor unit', '/category-types/trucks-tractor-unit.png'),
      t('Skåp', 'Rigid box', 'Koffer', 'rigid box', '/category-types/trucks-rigid-box.png'),
      t('Tippbil', 'Tipper', 'Kipper', 'tipper', '/category-types/trucks-tipper.png'),
      t('Kylbil', 'Refrigerated', 'Kühlfahrzeug', 'refrigerated', '/category-types/trucks-refrigerated.png'),
      t('Biltransport', 'Car transporter', 'Autotransporter', 'transporter', '/category-types/trucks-transporter.png'),
      t('Tankbil', 'Tanker', 'Tankwagen', 'tanker', '/category-types/trucks-tanker.png'),
      t('Flak', 'Flatbed', 'Pritsche', 'flatbed', '/category-types/trucks-flatbed.png'),
      t('Tungtransport', 'Heavy haulage', 'Schwerlast', 'heavy haulage', '/category-types/trucks-heavy-haulage.png'),
    ],
    agriculture: [
      t('Traktorer', 'Tractors', 'Traktoren', 'tractor', '/category-types/agriculture-tractor.png'),
      t('Skördare', 'Combines', 'Mähdrescher', 'combine', '/category-types/agriculture-combine.png'),
      t('Teleskoplastare', 'Telehandlers', 'Teleskoplader', 'telehandler', '/category-types/agriculture-telehandler.png'),
      t('Balpressar', 'Balers', 'Ballenpressen', 'baler', '/category-types/agriculture-baler.png'),
      t('Plogar', 'Ploughs', 'Pflüge', 'plough', '/category-types/agriculture-plough.png'),
      t('Såmaskiner', 'Seed drills', 'Sämaschinen', 'seed drill', '/category-types/agriculture-seed-drill.png'),
      t('Sprutor', 'Sprayers', 'Spritzen', 'sprayer', '/category-types/agriculture-sprayer.png'),
      t('Frontlastare', 'Front loaders', 'Frontlader', 'front loader', '/category-types/agriculture-front-loader.png'),
    ],
    construction: [
      t('Grävmaskiner', 'Excavators', 'Bagger', 'excavator', '/category-types/construction-excavator.png'),
      t('Hjullastare', 'Wheel loaders', 'Radlader', 'wheel loader', '/category-types/construction-wheel-loader.png'),
      t('Minigrävare', 'Mini excavators', 'Minibagger', 'mini excavator', '/category-types/construction-mini-excavator.png'),
      t('Grävlastare', 'Backhoe loaders', 'Baggerlader', 'backhoe', '/category-types/construction-backhoe.png'),
      t('Bulldozers', 'Bulldozers', 'Planierraupen', 'bulldozer', '/category-types/construction-bulldozer.png'),
      t('Dumprar', 'Dump trucks', 'Dumper', 'dump truck', '/category-types/construction-dump-truck.png'),
      t('Kompaktlastare', 'Skid steers', 'Kompaktlader', 'skid steer', '/category-types/construction-skid-steer.png'),
      t('Kranar', 'Cranes', 'Krane', 'crane', '/category-types/construction-crane.png'),
    ],
    'electric-bikes': [
      t('City', 'City', 'City', 'city', '/category-types/electric-bikes-city.png'),
      t('Trekking', 'Trekking', 'Trekking', 'trekking', '/category-types/electric-bikes-trekking.png'),
      t('Mountain', 'Mountain', 'Mountain', 'mountain', '/category-types/electric-bikes-mountain.png'),
      t('Cargo', 'Cargo', 'Cargo', 'cargo', '/category-types/electric-bikes-cargo.png'),
      t('Folding', 'Folding', 'Faltbar', 'folding', '/category-types/electric-bikes-folding.png'),
      t('Commuter', 'Commuter', 'Pendler', 'commuter', '/category-types/electric-bikes-commuter.png'),
      t('Speed', 'Speed', 'Speed', 'speed', '/category-types/electric-bikes-speed.png'),
      t('Kids', 'Kids', 'Kinder', 'kids', '/category-types/electric-bikes-kids.png'),
    ],
    'e-scooters': [
      t('Commuter', 'Commuter', 'Pendler', 'commuter', '/category-types/e-scooters-commuter.png'),
      t('Long range', 'Long range', 'Hohe Reichweite', 'long range', '/category-types/e-scooters-long-range.png'),
      t('Folding', 'Folding', 'Faltbar', 'folding', '/category-types/e-scooters-folding.png'),
      t('Off-road', 'Off-road', 'Offroad', 'off-road', '/category-types/e-scooters-off-road.png'),
      t('Seated', 'Seated', 'Mit Sitz', 'seated', '/category-types/e-scooters-seated.png'),
      t('Lightweight', 'Lightweight', 'Leicht', 'lightweight', '/category-types/e-scooters-lightweight.png'),
      t('Cargo', 'Cargo', 'Cargo', 'cargo', '/category-types/e-scooters-cargo.png'),
      t('Performance', 'Performance', 'Performance', 'performance', '/category-types/e-scooters-performance.png'),
    ],
  }
  return cards[slug] || cards.cars
}

const marketplaceCopy = {
  sv: {
    breadcrumbLabel: 'Brödsmulor',
    breadcrumbHome: 'Hem',
    marketplaceEyebrow: 'Sök annonser',
    sell: 'Sälj',
    all: 'Alla',
    sellBusiness: 'Sälj som företag',
    search: 'Sök',
    categoryLabel: 'Kategori',
    makeTitle: 'Märke',
    modelTitle: 'Modell',
    priceTitle: 'Pris',
    minPrice: 'Min',
    maxPrice: 'Max',
    modelYearTitle: 'Modellår',
    kilometerTitle: 'Kilometer',
    operatingHoursTitle: 'Drifttimmar',
    hoursUnit: 'tim',
    beforePrefix: 'Före',
    allModels: 'Alla modeller',
    anyPrice: 'Alla priser',
    sortBy: 'Sortera efter',
    forSale: 'till salu',
    allCategory: 'Alla fordon',
    browseByCategory: 'Bläddra efter kategori',
    viewAllCategories: 'Visa alla kategorier',
    verifiedListingsOnly: 'Endast verifierade annonser',
    verifiedListingsText: 'Alla annonser kontrolleras för kvalitet och autenticitet.',
    clearAll: 'Rensa alla',
    clearAllFilters: 'Rensa alla filter',
    makeLabel: 'Alla märken',
    keyword: 'Fritext',
    fuel: 'Alla bränslen',
    gearbox: 'Alla växellådor',
    color: 'Alla färger',
    condition: 'Alla skick',
    yearFrom: 'Årsmodell från',
    maxMileage: 'Max kilometer',
    equipment: 'Utrustning, exempelvis dragkrok eller navigation',
    maxHours: 'Max drifttimmar',
    moreFilters: 'Fler filter',
    fewerFilters: 'Färre filter',
    allEurope: 'Hela Europa',
    sort: 'Sortering',
    recommended: 'Rekommenderat',
    newest: 'Nyaste årsmodell',
    mileage: 'Lägst kilometer',
    lowestPrice: 'Lägst pris',
    listings: 'annonser i',
    saveSearch: 'Spara sökning',
    saved: 'Sökning sparad',
    saveSearchHint: 'Spara filter och sökord i den här webbläsaren.',
    savedSearchHint: 'Sökningen är sparad och finns kvar nästa gång.',
    viewMode: 'Visningsläge',
    oneColumn: 'Visa en annons per rad',
    twoColumns: 'Visa två annonser per rad',
    noResults: 'Inga publicerade annonser matchar just nu.',
    noResultsText: 'Justera sökningen, välj ett annat land eller bli först med att publicera',
    createListing: 'Skapa annons',
    perListing: 'Annonser publiceras per objekt med valbart annonspaket.',
    fixedPrice: 'Fast pris',
    listing: 'Annons',
    viewListing: 'Visa annons',
    privateSeller: 'Privat säljare',
    businessSeller: 'Företagssäljare',
    filtersTitle: 'Filter',
    euReady: 'Land, sökning och fordonsdata',
    savedTab: 'Sparade',
    recentTab: 'Historik',
    countryLabel: 'Land',
    makeAndModel: 'Märke och modell',
    keywordLabel: 'Sökord',
    fuelTitle: 'Bränsle',
    gearboxTitle: 'Växellåda',
    colorTitle: 'Färg',
    sellerTypeTitle: 'Säljartyp',
    sellerTypeAll: 'Alla annonser',
    sellerTypeBusiness: 'Endast företag',
    sellerTypePrivate: 'Endast privatpersoner',
    typeTitle: 'Typ',
    conditionTitle: 'Skick',
    buyGuideTitle: 'Trygg EU-affär med Autorell',
    findOutMore: 'Läs mer',
    verifiedListings: 'Verifierade annonser',
    verified: 'Verifierad',
    listingCountry: 'Land',
    euTradeHint: '',
    showingCountry: 'Visar annonser från',
    showingEurope: 'Visar',
    newsletterTitle: 'Få de senaste annonserna direkt till inboxen',
    newsletterText: 'Var först med att se nya fordon som matchar dina behov.',
    emailPlaceholder: 'Ange din e-postadress',
    subscribe: 'Prenumerera',
    localFirst: 'Din marknad visas först:',
    compare: 'Jämför',
    compareAdded: 'Vald',
    compareAction: 'Jämför',
    compareTitle: 'Jämför bilar',
    compareBeta: 'Beta',
    compareClose: 'Stäng jämförelse',
    compareClear: 'Rensa jämförelse',
    compareRemove: 'Ta bort från jämförelse',
    compareLimit: 'Du kan jämföra max 3 bilar.',
    compareHelper: 'Välj upp till 3 bilar och jämför nyckeldata sida vid sida.',
    compareSelectedSingular: 'annons vald',
    compareSelectedPlural: 'annonser valda',
    compareStrengths: 'Styrkor',
    compareNoStrengths: 'Inga tydliga fördelar hittades i annonsdatan.',
    compareBestPrice: 'Lägst pris',
    compareNewest: 'Nyast årsmodell',
    compareLowestMileage: 'Lägst kilometer',
  },
  en: {
    breadcrumbLabel: 'Breadcrumbs',
    breadcrumbHome: 'Home',
    marketplaceEyebrow: 'Search listings',
    sell: 'Sell',
    all: 'All',
    sellBusiness: 'Sell as a business',
    search: 'Search',
    categoryLabel: 'Category',
    makeTitle: 'Make',
    modelTitle: 'Model',
    priceTitle: 'Price',
    minPrice: 'Min',
    maxPrice: 'Max',
    modelYearTitle: 'Model year',
    kilometerTitle: 'Kilometres',
    operatingHoursTitle: 'Operating hours',
    hoursUnit: 'h',
    beforePrefix: 'Before',
    allModels: 'All models',
    anyPrice: 'Any price',
    sortBy: 'Sort by',
    forSale: 'for sale',
    allCategory: 'All vehicles',
    browseByCategory: 'Browse by category',
    viewAllCategories: 'View all categories',
    verifiedListingsOnly: 'Verified listings only',
    verifiedListingsText: 'All listings are checked for quality and authenticity.',
    clearAll: 'Clear all',
    clearAllFilters: 'Clear all filters',
    makeLabel: 'All makes',
    keyword: 'Keyword',
    fuel: 'All fuel types',
    gearbox: 'All gearboxes',
    color: 'All colours',
    condition: 'All conditions',
    yearFrom: 'Model year from',
    maxMileage: 'Maximum mileage (km)',
    equipment: 'Equipment, for example towbar or navigation',
    maxHours: 'Maximum operating hours',
    moreFilters: 'More filters',
    fewerFilters: 'Fewer filters',
    allEurope: 'All of Europe',
    sort: 'Sort',
    recommended: 'Recommended',
    newest: 'Newest model year',
    mileage: 'Lowest mileage',
    lowestPrice: 'Lowest price',
    listings: 'listings in',
    saveSearch: 'Save search',
    saved: 'Search saved',
    saveSearchHint: 'Save filters and keywords in this browser.',
    savedSearchHint: 'This search is saved for next time.',
    viewMode: 'View mode',
    oneColumn: 'Show one listing per row',
    twoColumns: 'Show two listings per row',
    noResults: 'No published listings match right now.',
    noResultsText: 'Adjust your search, choose another country or be the first to list',
    createListing: 'Create listing',
    perListing: 'Listings are published per vehicle with a selectable listing package.',
    fixedPrice: 'Fixed price',
    listing: 'Listing',
    viewListing: 'View listing',
    privateSeller: 'Private seller',
    businessSeller: 'Business seller',
    filtersTitle: 'Filter',
    euReady: 'Country, search and vehicle data',
    savedTab: 'Saved',
    recentTab: 'History',
    countryLabel: 'Country',
    makeAndModel: 'Make and model',
    keywordLabel: 'Keyword',
    fuelTitle: 'Fuel',
    gearboxTitle: 'Gearbox',
    colorTitle: 'Colour',
    sellerTypeTitle: 'Seller type',
    sellerTypeAll: 'All listings',
    sellerTypeBusiness: 'Business sellers only',
    sellerTypePrivate: 'Private sellers only',
    typeTitle: 'Type',
    conditionTitle: 'Condition',
    buyGuideTitle: 'Safer EU trading with Autorell',
    findOutMore: 'Find out more',
    verifiedListings: 'Verified listings',
    verified: 'Verified',
    listingCountry: 'Country',
    euTradeHint: '',
    showingCountry: 'Showing listings from',
    showingEurope: 'Showing',
    newsletterTitle: 'Get the latest listings delivered to your inbox',
    newsletterText: 'Be the first to see new vehicles that match your needs.',
    emailPlaceholder: 'Enter your email address',
    subscribe: 'Subscribe',
    localFirst: 'Your market is prioritised:',
    compare: 'Compare',
    compareAdded: 'Selected',
    compareAction: 'Compare',
    compareTitle: 'Compare cars',
    compareBeta: 'Beta',
    compareClose: 'Close comparison',
    compareClear: 'Clear comparison',
    compareRemove: 'Remove from comparison',
    compareLimit: 'You can compare up to 3 cars.',
    compareHelper: 'Select up to 3 cars and compare key data side by side.',
    compareSelectedSingular: 'listing selected',
    compareSelectedPlural: 'listings selected',
    compareStrengths: 'Strengths',
    compareNoStrengths: 'No clear advantages found in the listing data.',
    compareBestPrice: 'Lowest price',
    compareNewest: 'Newest model year',
    compareLowestMileage: 'Lowest kilometres',
  },
  de: {
    breadcrumbLabel: 'Breadcrumbs',
    breadcrumbHome: 'Startseite',
    marketplaceEyebrow: 'Anzeigen suchen',
    sell: 'Verkaufen:',
    all: 'Alle',
    sellBusiness: 'Als Unternehmen verkaufen',
    search: 'Suchen',
    categoryLabel: 'Kategorie',
    makeTitle: 'Marke',
    modelTitle: 'Modell',
    priceTitle: 'Preis',
    minPrice: 'Min.',
    maxPrice: 'Max.',
    modelYearTitle: 'Baujahr',
    kilometerTitle: 'Kilometer',
    operatingHoursTitle: 'Betriebsstunden',
    hoursUnit: 'Std.',
    beforePrefix: 'Vor',
    allModels: 'Alle Modelle',
    anyPrice: 'Jeder Preis',
    sortBy: 'Sortieren nach',
    forSale: 'zum Verkauf',
    allCategory: 'Alle Fahrzeuge',
    browseByCategory: 'Nach Kategorie suchen',
    viewAllCategories: 'Alle Kategorien ansehen',
    verifiedListingsOnly: 'Nur geprüfte Anzeigen',
    verifiedListingsText: 'Alle Anzeigen werden auf Qualität und Echtheit geprüft.',
    clearAll: 'Alle löschen',
    clearAllFilters: 'Alle Filter löschen',
    makeLabel: 'Alle Marken',
    keyword: 'Suchbegriff',
    fuel: 'Alle Kraftstoffe',
    gearbox: 'Alle Getriebe',
    color: 'Alle Farben',
    condition: 'Alle Zustände',
    yearFrom: 'Baujahr ab',
    maxMileage: 'Maximaler Kilometerstand',
    equipment: 'Ausstattung, zum Beispiel Anhängerkupplung oder Navigation',
    maxHours: 'Maximale Betriebsstunden',
    moreFilters: 'Mehr Filter',
    fewerFilters: 'Weniger Filter',
    allEurope: 'Ganz Europa',
    sort: 'Sortierung',
    recommended: 'Empfohlen',
    newest: 'Neuestes Baujahr',
    mileage: 'Niedrigster Kilometerstand',
    lowestPrice: 'Niedrigster Preis',
    listings: 'Anzeigen in',
    saveSearch: 'Suche speichern',
    saved: 'Suche gespeichert',
    saveSearchHint: 'Filter und Suchwörter in diesem Browser speichern.',
    savedSearchHint: 'Diese Suche ist für das nächste Mal gespeichert.',
    viewMode: 'Ansichtsmodus',
    oneColumn: 'Eine Anzeige pro Zeile anzeigen',
    twoColumns: 'Zwei Anzeigen pro Zeile anzeigen',
    noResults: 'Derzeit passen keine veröffentlichten Anzeigen.',
    noResultsText: 'Passen Sie die Suche an, wählen Sie ein anderes Land oder inserieren Sie zuerst',
    createListing: 'Anzeige erstellen',
    perListing: 'Anzeigen werden pro Fahrzeug mit einem wählbaren Anzeigenpaket veröffentlicht.',
    fixedPrice: 'Festpreis',
    listing: 'Anzeige',
    viewListing: 'Anzeige ansehen',
    privateSeller: 'Privater Verkäufer',
    businessSeller: 'Gewerblicher Verkäufer',
    filtersTitle: 'Filter',
    euReady: 'Land, Suche und Fahrzeugdaten',
    savedTab: 'Gespeichert',
    recentTab: 'Verlauf',
    countryLabel: 'Land',
    makeAndModel: 'Marke und Modell',
    keywordLabel: 'Suchwort',
    fuelTitle: 'Kraftstoff',
    gearboxTitle: 'Getriebe',
    colorTitle: 'Farbe',
    sellerTypeTitle: 'Verkäufertyp',
    sellerTypeAll: 'Alle Anzeigen',
    sellerTypeBusiness: 'Nur Unternehmen',
    sellerTypePrivate: 'Nur Privatpersonen',
    typeTitle: 'Typ',
    conditionTitle: 'Zustand',
    buyGuideTitle: 'Sicherer EU-Handel mit Autorell',
    findOutMore: 'Mehr erfahren',
    verifiedListings: 'Geprüfte Anzeigen',
    verified: 'Geprüft',
    listingCountry: 'Land',
    euTradeHint: '',
    showingCountry: 'Anzeigen aus',
    showingEurope: 'Anzeige',
    newsletterTitle: 'Neue Anzeigen direkt in Ihr Postfach',
    newsletterText: 'Sehen Sie neue Fahrzeuge, die zu Ihren Anforderungen passen.',
    emailPlaceholder: 'E-Mail-Adresse eingeben',
    subscribe: 'Abonnieren',
    localFirst: 'Ihr Markt wird priorisiert:',
    compare: 'Vergleichen',
    compareAdded: 'Ausgewählt',
    compareAction: 'Vergleichen',
    compareTitle: 'Autos vergleichen',
    compareBeta: 'Beta',
    compareClose: 'Vergleich schließen',
    compareClear: 'Vergleich löschen',
    compareRemove: 'Aus Vergleich entfernen',
    compareLimit: 'Sie können maximal 3 Autos vergleichen.',
    compareHelper: 'Wählen Sie bis zu 3 Autos und vergleichen Sie die wichtigsten Daten.',
    compareSelectedSingular: 'Anzeige ausgewählt',
    compareSelectedPlural: 'Anzeigen ausgewählt',
    compareStrengths: 'Stärken',
    compareNoStrengths: 'Keine klaren Vorteile in den Anzeigendaten gefunden.',
    compareBestPrice: 'Niedrigster Preis',
    compareNewest: 'Neuestes Baujahr',
    compareLowestMileage: 'Niedrigste Kilometer',
  },
} as const

type MarketplaceCopy = (typeof marketplaceCopy)[keyof typeof marketplaceCopy]

function getAllCategoryLabel(label: string, locale: PublicLocale) {
  if (locale === 'sv') return `Alla ${label.toLowerCase()}`
  if (locale === 'de') return `Alle ${label}`
  if (locale === 'en') return `All ${label.toLowerCase()}`
  return `${translatePublic(locale, 'All')} ${label.toLowerCase()}`
}

function formatFilterNumber(value: number, locale: PublicLocale) {
  return new Intl.NumberFormat(locale === 'sv' ? 'sv-SE' : locale === 'de' ? 'de-DE' : locale, {
    maximumFractionDigits: 0,
  }).format(value)
}

function rangeChipLabel(
  minValue: string,
  maxValue: string,
  minFallback: string,
  maxFallback: string,
  unit: string,
  locale: PublicLocale,
) {
  const plainNumber = !unit
  const min = minValue ? (plainNumber ? minValue : formatFilterNumber(Number(minValue), locale)) : minFallback
  const max = maxValue ? (plainNumber ? maxValue : formatFilterNumber(Number(maxValue), locale)) : maxFallback
  const suffix = unit ? ` ${unit}` : ''
  return `${min}-${max}${suffix}`
}

function secondarySearchLabel(slug: string, locale: PublicLocale) {
  if (['motorhomes', 'caravans'].includes(slug)) {
    return locale === 'sv'
      ? 'Modell eller sovplatser'
      : locale === 'de'
        ? 'Modell oder Schlafplätze'
        : 'Model or berths'
  }
  if (slug === 'agriculture' || slug === 'construction') {
    return locale === 'sv'
      ? 'Modell eller maskintyp'
      : locale === 'de'
        ? 'Modell oder Maschinentyp'
        : 'Model or machine type'
  }
  return 'Modell'
}

function categorySearchPlaceholder(slug: string, locale: PublicLocale) {
  const labels: Record<string, Record<'sv' | 'en' | 'de', string>> = {
    cars: {
      sv: 'Sök i bil',
      en: 'Search cars',
      de: 'Autos suchen',
    },
    vans: {
      sv: 'Sök i transportbil',
      en: 'Search vans',
      de: 'Transporter suchen',
    },
    motorcycles: {
      sv: 'Sök i motorcykel',
      en: 'Search motorcycles',
      de: 'Motorräder suchen',
    },
    motorhomes: {
      sv: 'Sök i husbil',
      en: 'Search motorhomes',
      de: 'Wohnmobile suchen',
    },
    caravans: {
      sv: 'Sök i husvagn',
      en: 'Search caravans',
      de: 'Wohnwagen suchen',
    },
    trucks: {
      sv: 'Sök i lastbil',
      en: 'Search trucks',
      de: 'Lkw suchen',
    },
    agriculture: {
      sv: 'Sök i maskin',
      en: 'Search machinery',
      de: 'Maschinen suchen',
    },
    construction: {
      sv: 'Sök i maskin',
      en: 'Search machinery',
      de: 'Maschinen suchen',
    },
    'electric-bikes': {
      sv: 'Sök i cykel',
      en: 'Search bikes',
      de: 'Fahrräder suchen',
    },
    'e-scooters': {
      sv: 'Sök i sparkcykel',
      en: 'Search scooters',
      de: 'Scooter suchen',
    },
  }
  const language = locale === 'sv' || locale === 'de' ? locale : 'en'
  const label = labels[slug]?.[language] || labels.cars[language]
  return language === 'en' && locale !== 'en' ? translatePublic(locale, label) : label
}

function categoryTypeLabel(slug: string, locale: PublicLocale) {
  const machine = slug === 'agriculture' || slug === 'construction'
  if (locale === 'sv') return machine ? 'Alla maskintyper' : 'Alla karosstyper'
  if (locale === 'de') return machine ? 'Alle Maschinentypen' : 'Alle Karosserieformen'
  return machine ? 'All machine types' : 'All body types'
}

type FilterKey =
  | 'fuel'
  | 'gearbox'
  | 'bodyType'
  | 'condition'
  | 'year'
  | 'mileage'
  | 'hours'
  | 'equipment'

function categoryFilterProfile(slug: string): {
  basic: FilterKey[]
  advanced: FilterKey[]
} {
  if (slug === 'caravans') {
    return {
      basic: ['condition'],
      advanced: ['bodyType', 'year', 'equipment'],
    }
  }
  if (slug === 'agriculture' || slug === 'construction') {
    return {
      basic: ['bodyType'],
      advanced: ['condition', 'fuel', 'gearbox', 'year', 'hours', 'equipment'],
    }
  }
  if (slug === 'electric-bikes' || slug === 'e-scooters') {
    return {
      basic: ['condition'],
      advanced: ['bodyType', 'year', 'mileage', 'equipment'],
    }
  }
  if (slug === 'motorcycles') {
    return {
      basic: ['condition'],
      advanced: ['fuel', 'gearbox', 'bodyType', 'year', 'mileage', 'equipment'],
    }
  }
  return {
    basic: ['fuel'],
    advanced: ['gearbox', 'bodyType', 'condition', 'year', 'mileage', 'equipment'],
  }
}

function categoryQuickFilters(slug: string, locale: PublicLocale) {
  const values: Record<string, Record<'sv' | 'en' | 'de', string[]>> = {
    cars: {
      sv: ['Nya', 'Begagnade', 'El', 'Hybrid', 'Pris', 'Kilometer'],
      en: ['New', 'Used', 'Electric', 'Hybrid', 'Price', 'Mileage'],
      de: ['Neu', 'Gebraucht', 'Elektro', 'Hybrid', 'Preis', 'Kilometer'],
    },
    vans: {
      sv: ['Nya', 'Begagnade', 'El', 'Automat', 'Pris', 'Kilometer'],
      en: ['New', 'Used', 'Electric', 'Automatic', 'Price', 'Mileage'],
      de: ['Neu', 'Gebraucht', 'Elektro', 'Automatik', 'Preis', 'Kilometer'],
    },
    motorcycles: {
      sv: ['Nya', 'Begagnade', 'El', 'Touring', 'Pris', 'Kilometer'],
      en: ['New', 'Used', 'Electric', 'Touring', 'Price', 'Mileage'],
      de: ['Neu', 'Gebraucht', 'Elektro', 'Touring', 'Preis', 'Kilometer'],
    },
    motorhomes: {
      sv: ['Nya', 'Begagnade', 'Automat', 'Helintegrerad', 'Pris', 'Kilometer'],
      en: ['New', 'Used', 'Automatic', 'A-class', 'Price', 'Mileage'],
      de: ['Neu', 'Gebraucht', 'Automatik', 'Vollintegriert', 'Preis', 'Kilometer'],
    },
    caravans: {
      sv: ['Nya', 'Begagnade', 'Enkelaxel', 'Dubbelaxel', 'Pris'],
      en: ['New', 'Used', 'Single axle', 'Twin axle', 'Price'],
      de: ['Neu', 'Gebraucht', 'Einachser', 'Tandemachser', 'Preis'],
    },
    trucks: {
      sv: ['Nya', 'Begagnade', 'Dragbil', 'Lastväxlare', 'Pris', 'Kilometer'],
      en: ['New', 'Used', 'Tractor unit', 'Hook lift', 'Price', 'Mileage'],
      de: ['Neu', 'Gebraucht', 'Sattelzugmaschine', 'Abrollkipper', 'Preis', 'Kilometer'],
    },
    agriculture: {
      sv: ['Traktorer', 'Skörd', 'Redskap', 'Pris', 'Drifttimmar'],
      en: ['Tractors', 'Harvesting', 'Implements', 'Price', 'Operating hours'],
      de: ['Traktoren', 'Erntetechnik', 'Anbaugeräte', 'Preis', 'Betriebsstunden'],
    },
    construction: {
      sv: ['Grävmaskiner', 'Lastare', 'Dumprar', 'Pris', 'Drifttimmar'],
      en: ['Excavators', 'Loaders', 'Dumpers', 'Price', 'Operating hours'],
      de: ['Bagger', 'Lader', 'Dumper', 'Preis', 'Betriebsstunden'],
    },
    'electric-bikes': {
      sv: ['Nya', 'Begagnade', 'City', 'Lastcykel', 'Pris'],
      en: ['New', 'Used', 'City', 'Cargo bike', 'Price'],
      de: ['Neu', 'Gebraucht', 'City', 'Lastenrad', 'Preis'],
    },
    'e-scooters': {
      sv: ['Nya', 'Begagnade', 'Pendling', 'Pris'],
      en: ['New', 'Used', 'Commuting', 'Price'],
      de: ['Neu', 'Gebraucht', 'Pendeln', 'Preis'],
    },
  }
  const language = locale === 'sv' || locale === 'de' ? locale : 'en'
  const filters = values[slug]?.[language] || values.cars[language]
  return language === 'en' && locale !== 'en'
    ? filters.map((filter) => translatePublic(locale, filter))
    : filters
}

function equipmentLabel(slug: string, locale: PublicLocale) {
  const machine = slug === 'agriculture' || slug === 'construction'
  const leisure = slug === 'motorhomes' || slug === 'caravans'
  if (locale === 'sv') {
    if (machine) return 'Utrustning, redskap eller tillbehör'
    if (leisure) return 'Utrustning, exempelvis solpanel, markis eller värme'
    return 'Utrustning, exempelvis dragkrok eller navigation'
  }
  if (locale === 'de') {
    if (machine) return 'Ausstattung, Anbaugeräte oder Zubehör'
    if (leisure) return 'Ausstattung, z. B. Solaranlage, Markise oder Heizung'
    return 'Ausstattung, z. B. Anhängerkupplung oder Navigation'
  }
  const label = machine
    ? 'Equipment, implements or attachments'
    : leisure
      ? 'Equipment, for example solar panels, awning or heating'
      : 'Equipment, for example towbar or navigation'
  return locale === 'en' ? label : translatePublic(locale, label)
}

function localizeCategory(category: CategoryConfig, locale: PublicLocale) {
  if (locale === 'sv') return category
  if (locale !== 'en' && locale !== 'de') return category
  const labels: Record<string, { en: [string, string]; de: [string, string] }> = {
    cars: { en: ['Cars', 'a car'], de: ['Autos', 'ein Auto'] },
    vans: { en: ['Vans', 'a van'], de: ['Transporter', 'einen Transporter'] },
    motorcycles: { en: ['Motorcycles', 'a motorcycle'], de: ['Motorräder', 'ein Motorrad'] },
    motorhomes: { en: ['Motorhomes', 'a motorhome'], de: ['Wohnmobile', 'ein Wohnmobil'] },
    caravans: { en: ['Caravans', 'a caravan'], de: ['Wohnwagen', 'einen Wohnwagen'] },
    trucks: { en: ['Trucks', 'a truck'], de: ['Lkw', 'einen Lkw'] },
    agriculture: { en: ['Agricultural machinery', 'agricultural machinery'], de: ['Landmaschinen', 'eine Landmaschine'] },
    construction: { en: ['Construction machinery', 'construction machinery'], de: ['Baumaschinen', 'eine Baumaschine'] },
    'electric-bikes': { en: ['Bikes', 'a bike'], de: ['Fahrräder', 'ein Fahrrad'] },
    'e-scooters': { en: ['Scooters', 'a scooter'], de: ['Scooter', 'einen Scooter'] },
  }
  const translated = labels[category.slug]?.[locale] || [category.label, category.singular]
  return {
    ...category,
    label: translated[0],
    singular: translated[1],
    description:
      locale === 'en'
        ? `Browse ${translated[0].toLowerCase()} from private and business sellers across Europe.`
        : `${translated[0]} von privaten und gewerblichen Verkäufern in ganz Europa.`,
    filters:
      locale === 'en'
        ? ['New', 'Used', 'Electric', 'Hybrid', 'Price', 'Mileage']
        : ['Neu', 'Gebraucht', 'Elektro', 'Hybrid', 'Preis', 'Kilometer'],
  }
}
