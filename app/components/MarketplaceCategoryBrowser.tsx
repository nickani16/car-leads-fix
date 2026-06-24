'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  SlidersHorizontal,
  Heart,
  ImageIcon,
  MapPin,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import {
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import MessageSellerButton from './MessageSellerButton'
import SavedListingButton from './SavedListingButton'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'

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
  messagingEnabled: boolean
}

type CategoryConfig = {
  slug: string
  label: string
  singular: string
  description: string
  filters: readonly string[]
}

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
  const [condition, setCondition] = useState(searchParams.get('condition') || '')
  const [equipmentQuery, setEquipmentQuery] = useState(searchParams.get('equipment') || '')
  const [yearFrom, setYearFrom] = useState(searchParams.get('yearFrom') || '')
  const [maxMileage, setMaxMileage] = useState(searchParams.get('maxMileage') || '')
  const [maxHours, setMaxHours] = useState(searchParams.get('maxHours') || '')
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [country, setCountry] = useState((searchParams.get('country') || defaultCountry || '').toUpperCase())
  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || '')
  const [sort, setSort] = useState('recommended')
  const [savedSearchKey, setSavedSearchKey] = useState('')
  const displayLocale = locale
  const localizedCategory = {
    ...localizeCategory(category, locale),
    filters: categoryQuickFilters(category.slug, locale),
  }
  const filterProfile = categoryFilterProfile(category.slug)
  const copy =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? marketplaceCopy[locale]
      : translatePublicObject(locale, marketplaceCopy.en)

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
  const visibleListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const normalizedModel = modelQuery.trim().toLowerCase()
    const filtered = listings.filter((listing) => {
      if (country && listing.country.toUpperCase() !== country) return false
      if (make && listing.make !== make) return false
      if (fuel && listing.fuelType !== fuel) return false
      if (gearbox && listing.gearbox !== gearbox) return false
      if (bodyType && listing.bodyType !== bodyType) return false
      if (condition && listing.condition !== condition) return false
      if (yearFrom && Number(listing.year || 0) < Number(yearFrom)) return false
      if (maxMileage && (listing.mileageKm === null || listing.mileageKm > Number(maxMileage))) return false
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
  }, [activeFilter, bodyType, condition, country, defaultCountry, displayLocale, equipmentQuery, fuel, gearbox, listings, make, maxHours, maxMileage, modelQuery, query, sort, yearFrom])

  const currentSearchKey = `autorell-search-${category.slug}-${query}-${country}-${activeFilter}`
  const saved = savedSearchKey === currentSearchKey

  function toggleSavedSearch() {
    if (saved) {
      window.localStorage.removeItem(currentSearchKey)
      setSavedSearchKey('')
    } else {
      window.localStorage.setItem(currentSearchKey, 'saved')
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

  const filterPanel = (
    <div className="rounded-[8px] border border-[#d9e1ec] bg-white shadow-[0_18px_55px_rgba(16,24,40,.08)]">
      <div className="flex items-center justify-between border-b border-[#e4e9f2] px-4 py-4">
        <div>
          <h2 className="text-lg font-bold tracking-[-0.03em]">{copy.filtersTitle}</h2>
          <p className="mt-1 text-xs font-semibold text-[#667085]">{copy.euReady}</p>
        </div>
        <SlidersHorizontal className="h-5 w-5 text-[#0866ff]" />
      </div>
      <div className="grid grid-cols-3 border-b border-[#e4e9f2] text-center text-[12px] font-bold">
        <button type="button" className="border-b-[3px] border-[#0866ff] px-2 py-3 text-[#0866ff]">{copy.all}</button>
        <button type="button" className="px-2 py-3 text-[#667085]">{copy.savedTab}</button>
        <button type="button" className="px-2 py-3 text-[#667085]">{copy.recentTab}</button>
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

        <FilterGroup title={copy.keywordLabel}>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.keyword}
              className="marketplace-search-control h-12 w-full min-w-0 rounded-[8px] border border-[#cfd7e6] bg-white pl-10 pr-3.5 text-[14px] font-medium outline-none transition placeholder:text-[#667085] focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
            />
          </label>
        </FilterGroup>

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
            {filterProfile.advanced.includes('year') ? (
              <input
                value={yearFrom}
                onChange={(event) => setYearFrom(event.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                placeholder={copy.yearFrom}
                className="h-12 w-full rounded-[8px] border border-[#cfd7e6] bg-white px-3.5 text-[14px] font-medium outline-none focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
              />
            ) : null}
            {filterProfile.advanced.includes('mileage') ? (
              <input
                value={maxMileage}
                onChange={(event) => setMaxMileage(event.target.value.replace(/\D/g, '').slice(0, 7))}
                inputMode="numeric"
                placeholder={copy.maxMileage}
                className="h-12 w-full rounded-[8px] border border-[#cfd7e6] bg-white px-3.5 text-[14px] font-medium outline-none focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
              />
            ) : null}
            {filterProfile.advanced.includes('hours') ? (
              <input
                value={maxHours}
                onChange={(event) => setMaxHours(event.target.value.replace(/\D/g, '').slice(0, 7))}
                inputMode="numeric"
                placeholder={copy.maxHours}
                className="h-12 w-full rounded-[8px] border border-[#cfd7e6] bg-white px-3.5 text-[14px] font-medium outline-none focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
              />
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
      <section className="border-b border-[#e4e7ec] bg-white">
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
                href={`/salj-fordon?category=${category.slug}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] bg-[#0866ff] px-6 text-sm font-bold text-white shadow-[0_10px_26px_rgba(8,102,255,.2)]"
              >
                {copy.sell} {localizedCategory.singular}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/foretag"
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

      <section id="marketplace-results" className="scroll-mt-24 overflow-hidden bg-[#eef3fb] py-5 sm:py-8">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-5 lg:grid-cols-[310px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24">{filterPanel}</div>
            </aside>
            <div className="min-w-0">
          <div className="mb-4 rounded-[8px] border border-[#d9e1ec] bg-white p-3 shadow-[0_14px_40px_rgba(16,24,40,.06)] sm:p-4">
            <div className="mb-4 flex items-center justify-between gap-3 rounded-[8px] bg-[#f8fbff] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#0866ff]" />
                <p className="min-w-0 text-sm font-bold text-[#101828]">{copy.buyGuideTitle}</p>
              </div>
              <Link href="/hjalpcenter" className="hidden rounded-[8px] border border-[#cfd7e6] px-4 py-2 text-xs font-bold text-[#344054] sm:inline-flex">
                {copy.findOutMore}
              </Link>
            </div>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
            <p className="min-w-0 text-sm text-[#475467]">
              <strong className="text-[#101828]">{visibleListings.length}</strong>{' '}
              {copy.listings} {localizedCategory.label.toLowerCase()}
            </p>
            <div className="flex w-full items-center justify-between gap-4 sm:ml-auto sm:w-auto sm:shrink-0 sm:justify-start">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((current) => !current)}
                className="inline-flex min-h-10 items-center gap-2 rounded-[8px] bg-[#0866ff] px-4 text-sm font-bold text-white lg:hidden"
              >
                {mobileFiltersOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
                {copy.filtersTitle}
              </button>
              <label className="relative">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-10 appearance-none rounded-[13px] border border-[#d0d5dd] bg-white pl-4 pr-9 text-xs font-semibold outline-none"
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
                className="ml-auto inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#0866ff]"
              >
                {saved ? copy.saved : copy.saveSearch}
                <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          </div>

          {mobileFiltersOpen ? <div className="mb-4 lg:hidden">{filterPanel}</div> : null}

          {visibleListings.length ? (
            <div className="grid gap-4">
              {visibleListings.map((listing) => (
                <article
                  key={listing.id}
                  className="group overflow-hidden rounded-[8px] border border-[#d9e1ec] bg-white shadow-[0_12px_36px_rgba(16,24,40,.07)] transition hover:shadow-[0_18px_50px_rgba(16,24,40,.11)]"
                >
                  <div className="grid min-w-0 md:grid-cols-[300px_minmax(0,1fr)]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(145deg,#edf3ff,#dce8ff)] md:aspect-auto md:min-h-[218px]">
                    {listing.imageUrl ? (
                      // Supabase public URLs are user-generated and intentionally
                      // rendered without Next image-domain coupling.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
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
                    <div className="absolute right-4 top-4">
                      <SavedListingButton listingId={listing.id} />
                    </div>
                    <span className="absolute left-3 top-3 rounded-[7px] bg-[#0866ff] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                      {copy.verified}
                    </span>
                  </div>
                  <div className="grid min-w-0 gap-4 p-4 md:grid-cols-[minmax(0,1fr)_180px] md:p-5">
                    <div className="min-w-0">
                    <h2 className="break-words text-xl font-bold tracking-[-0.035em] text-[#101828] sm:text-2xl">{listing.title}</h2>
                    <p className="mt-2 text-sm text-[#667085]">
                      {[listing.year, listing.fuelType, listing.mileageKm !== null ? `${listing.mileageKm.toLocaleString('sv-SE')} km` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-[#475467]">
                      {listing.sellerIsTrader ? copy.businessSeller : copy.privateSeller} · {listing.sellerName}
                    </p>
                    <div className="mt-5 flex items-start gap-3 border-t border-[#edf1f6] pt-4">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#0866ff]" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#667085]">{copy.listingCountry}</p>
                        <p className="mt-1 text-sm font-bold text-[#101828]">
                          {[listing.city, getEuCountryName(listing.country, displayLocale)].filter(Boolean).join(', ')}
                        </p>
                        <p className="mt-1 text-xs text-[#667085]">{copy.euTradeHint}</p>
                      </div>
                    </div>
                    </div>
                    <div className="flex min-w-0 flex-row items-end justify-between gap-4 border-t border-[#edf1f6] pt-4 md:flex-col md:items-end md:border-l md:border-t-0 md:pl-5 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="block text-xs font-semibold text-[#667085]">{copy.fixedPrice}</span>
                        <strong className="mt-1 block text-2xl tracking-[-0.04em] text-[#101828]">{listing.priceLabel}</strong>
                        <span className="mt-1 block text-xs font-semibold text-[#667085]">{listing.sellerName}</span>
                      </div>
                      <MessageSellerButton listingId={listing.id} enabled={listing.messagingEnabled} />
                    </div>
                  </div>
                  </div>
                </article>
              ))}
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
                  href={`/salj-fordon?category=${category.slug}`}
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
    </>
  )
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  options: string[]
}) {
  return (
    <label className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-[12px] border border-[#d8dde6] bg-white px-3.5 pr-9 text-[14px] font-medium text-[#202124] outline-none transition focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
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

function FilterGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#101828]">
        {title}
      </h3>
      {children}
    </section>
  )
}

const marketplaceCopy = {
  sv: {
    marketplaceEyebrow: 'Sök annonser',
    sell: 'Sälj',
    all: 'Alla',
    sellBusiness: 'Sälj som företag',
    search: 'Sök',
    makeLabel: 'Alla märken',
    keyword: 'Fritext',
    fuel: 'Alla bränslen',
    gearbox: 'Alla växellådor',
    condition: 'Alla skick',
    yearFrom: 'Årsmodell från',
    maxMileage: 'Max miltal (km)',
    equipment: 'Utrustning, exempelvis dragkrok eller navigation',
    maxHours: 'Max drifttimmar',
    moreFilters: 'Fler filter',
    fewerFilters: 'Färre filter',
    allEurope: 'Hela Europa',
    sort: 'Sortering',
    recommended: 'Rekommenderat',
    newest: 'Nyaste årsmodell',
    mileage: 'Lägst miltal',
    lowestPrice: 'Lägst pris',
    listings: 'annonser i',
    saveSearch: 'Spara sökning',
    saved: 'Sökning sparad',
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
    typeTitle: 'Typ',
    conditionTitle: 'Skick',
    buyGuideTitle: 'Trygg EU-affär med Autorell',
    findOutMore: 'Läs mer',
    verifiedListings: 'Verifierade annonser',
    verified: 'Verifierad',
    listingCountry: 'Annonsland',
    euTradeHint: 'Anpassad för köpare i hela EU.',
    showingCountry: 'Visar annonser från',
    showingEurope: 'Visar',
    localFirst: 'Din marknad visas först:',
  },
  en: {
    marketplaceEyebrow: 'Search listings',
    sell: 'Sell',
    all: 'All',
    sellBusiness: 'Sell as a business',
    search: 'Search',
    makeLabel: 'All makes',
    keyword: 'Keyword',
    fuel: 'All fuel types',
    gearbox: 'All gearboxes',
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
    typeTitle: 'Type',
    conditionTitle: 'Condition',
    buyGuideTitle: 'Safer EU trading with Autorell',
    findOutMore: 'Find out more',
    verifiedListings: 'Verified listings',
    verified: 'Verified',
    listingCountry: 'Listing country',
    euTradeHint: 'Built for buyers across the EU.',
    showingCountry: 'Showing listings from',
    showingEurope: 'Showing',
    localFirst: 'Your market is prioritised:',
  },
  de: {
    marketplaceEyebrow: 'Anzeigen suchen',
    sell: 'Verkaufen:',
    all: 'Alle',
    sellBusiness: 'Als Unternehmen verkaufen',
    search: 'Suchen',
    makeLabel: 'Alle Marken',
    keyword: 'Suchbegriff',
    fuel: 'Alle Kraftstoffe',
    gearbox: 'Alle Getriebe',
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
    typeTitle: 'Typ',
    conditionTitle: 'Zustand',
    buyGuideTitle: 'Sicherer EU-Handel mit Autorell',
    findOutMore: 'Mehr erfahren',
    verifiedListings: 'Geprüfte Anzeigen',
    verified: 'Geprüft',
    listingCountry: 'Anzeigenland',
    euTradeHint: 'Für Käufer in der ganzen EU gebaut.',
    showingCountry: 'Anzeigen aus',
    showingEurope: 'Anzeige',
    localFirst: 'Ihr Markt wird priorisiert:',
  },
} as const

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
      sv: ['Nya', 'Begagnade', 'El', 'Hybrid', 'Pris', 'Miltal'],
      en: ['New', 'Used', 'Electric', 'Hybrid', 'Price', 'Mileage'],
      de: ['Neu', 'Gebraucht', 'Elektro', 'Hybrid', 'Preis', 'Kilometer'],
    },
    vans: {
      sv: ['Nya', 'Begagnade', 'El', 'Automat', 'Pris', 'Miltal'],
      en: ['New', 'Used', 'Electric', 'Automatic', 'Price', 'Mileage'],
      de: ['Neu', 'Gebraucht', 'Elektro', 'Automatik', 'Preis', 'Kilometer'],
    },
    motorcycles: {
      sv: ['Nya', 'Begagnade', 'El', 'Touring', 'Pris', 'Miltal'],
      en: ['New', 'Used', 'Electric', 'Touring', 'Price', 'Mileage'],
      de: ['Neu', 'Gebraucht', 'Elektro', 'Touring', 'Preis', 'Kilometer'],
    },
    motorhomes: {
      sv: ['Nya', 'Begagnade', 'Automat', 'Helintegrerad', 'Pris', 'Miltal'],
      en: ['New', 'Used', 'Automatic', 'A-class', 'Price', 'Mileage'],
      de: ['Neu', 'Gebraucht', 'Automatik', 'Vollintegriert', 'Preis', 'Kilometer'],
    },
    caravans: {
      sv: ['Nya', 'Begagnade', 'Enkelaxel', 'Dubbelaxel', 'Pris'],
      en: ['New', 'Used', 'Single axle', 'Twin axle', 'Price'],
      de: ['Neu', 'Gebraucht', 'Einachser', 'Tandemachser', 'Preis'],
    },
    trucks: {
      sv: ['Nya', 'Begagnade', 'Dragbil', 'Lastväxlare', 'Pris', 'Miltal'],
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
    'electric-bikes': { en: ['Electric bikes', 'an electric bike'], de: ['E-Bikes', 'ein E-Bike'] },
    'e-scooters': { en: ['E-scooters', 'an e-scooter'], de: ['E-Scooter', 'einen E-Scooter'] },
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
