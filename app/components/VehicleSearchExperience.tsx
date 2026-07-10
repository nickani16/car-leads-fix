'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl'
import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronDown,
  Columns2,
  Expand,
  Heart,
  Layers,
  List,
  Map,
  MapPin,
  Search,
  Scale,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import BrandLogo from './BrandLogo'
import CountryFlag from './CountryFlag'
import ListingCardImageCarousel from './ListingCardImageCarousel'
import SavedListingButton from './SavedListingButton'
import {
  AutorellAgricultureIcon,
  AutorellAllCategoriesIcon,
  AutorellBikeIcon,
  AutorellCaravanIcon,
  AutorellCarIcon,
  AutorellConstructionIcon,
  AutorellMotorhomeIcon,
  AutorellMotorbikeIcon,
  AutorellScooterIcon,
  AutorellTruckIcon,
  AutorellVanIcon,
} from './AutorellCategoryIcons'
import { getMapStyle, type AutorellMapLayer } from '@/lib/map-style'
import { getEuCountryName } from '@/lib/eu-countries'
import { buildListingPath } from '@/lib/listing-url'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'
import { SAVED_SEARCHES_EVENT } from '@/lib/saved-searches'

type SearchMode = 'sale' | 'leasing'
type ResultsLayout = 'single' | 'split'
type ActiveFilterChip = { key: string; label: string; icon?: ReactNode; onRemove: () => void }
type SavedVehicleSearch = {
  savedAt: string
  filters: {
    mode: SearchMode
    query: string
    categories: string[]
    markets: string[]
    make: string
    model: string
    minPrice: string
    maxPrice: string
    minYear: string
    maxYear: string
    maxMileage: string
    fuel: string
    gearbox: string
    bodyType: string
    condition: string
    color: string
    sellerType: string
    verifiedOnly: boolean
    fourWheelDrive: boolean
    leasingPossible: boolean
    equipmentQuery: string
    sortBy?: string
  }
}

type MarketplaceReturnSearchState = SavedVehicleSearch['filters']

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
  imageUrls: string[]
  sellerLogoUrl: string | null
  sellerTrust: 'verified' | 'unverified'
  sellerName: string
  sellerIsTrader: boolean
  condition: string | null
  color: string | null
  equipment: string | null
}

const tabs: Array<{ key: SearchMode; label: string; mobileLabel: string; hint: string }> = [
  { key: 'sale', label: 'Fordon till salu', mobileLabel: 'Fordon till salu', hint: 'Privata och företag' },
  { key: 'leasing', label: 'Leasing', mobileLabel: 'Leasing', hint: 'Företagsannonser' },
]

const MARKETPLACE_RETURN_SEARCH_STATE_KEY = 'autorell:marketplace-return-search'
const MARKETPLACE_RETURN_SEARCH_ARMED_KEY = 'autorell:marketplace-return-search-armed'

const categories = [
  { key: 'all', label: 'Alla kategorier', shortLabel: 'Alla', icon: AutorellAllCategoriesIcon },
  { key: 'cars', label: 'Bilar', shortLabel: 'Bilar', icon: AutorellCarIcon },
  { key: 'vans', label: 'Transportbilar', shortLabel: 'Transport', icon: AutorellVanIcon },
  { key: 'motorcycles', label: 'Motorcyklar', shortLabel: 'MC', icon: AutorellMotorbikeIcon },
  { key: 'motorhomes', label: 'Husbilar', shortLabel: 'Husbilar', icon: AutorellMotorhomeIcon },
  { key: 'caravans', label: 'Husvagnar', shortLabel: 'Husvagnar', icon: AutorellCaravanIcon },
  { key: 'trucks', label: 'Lastbilar', shortLabel: 'Lastbilar', icon: AutorellTruckIcon },
  { key: 'agriculture', label: 'Lantbruk', shortLabel: 'Lantbruk', icon: AutorellAgricultureIcon },
  { key: 'construction', label: 'Entreprenad', shortLabel: 'Entreprenad', icon: AutorellConstructionIcon },
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
  { value: '', label: 'Hela Europa' },
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

const countryFilterOptions = marketOptions.map((option) => ({
  ...option,
  label: option.value ? option.label : 'Hela Europa',
}))

const selectableMarketCodes = new Set(marketOptions.map((option) => option.value).filter(Boolean))
const allMarketCodes = new Set(['EU', 'ALL'])

function normalizeMarketSelection(values: string[], fallback = '') {
  const rawValues = values
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean)
  const normalized = [
    ...new Set(
      rawValues.filter((value) => selectableMarketCodes.has(value)),
    ),
  ]
  if (normalized.length) return normalized
  if (rawValues.some((value) => allMarketCodes.has(value))) return []
  const fallbackCode = fallback.trim().toUpperCase()
  return selectableMarketCodes.has(fallbackCode) ? [fallbackCode] : []
}

function sameMarketSelection(left: string[], right: string[]) {
  const a = normalizeMarketSelection(left).sort()
  const b = normalizeMarketSelection(right).sort()
  return a.length === b.length && a.every((value, index) => value === b[index])
}

function matchesSelectedMarkets(country: string, markets: string[]) {
  const selected = normalizeMarketSelection(markets)
  return !selected.length || selected.includes(country)
}

function normalizeSavedCategories(values: unknown) {
  const rawValues = Array.isArray(values) ? values : []
  return [
    ...new Set(
      rawValues
        .map((value) => String(value || '').trim())
        .filter((value) => categories.some((category) => category.key === value && value !== 'all')),
    ),
  ]
}

function readMarketplaceReturnSearchState(locale: PublicLocale) {
  if (typeof window === 'undefined') return null
  try {
    if (window.sessionStorage.getItem(MARKETPLACE_RETURN_SEARCH_ARMED_KEY) !== '1') return null
    const raw = window.sessionStorage.getItem(MARKETPLACE_RETURN_SEARCH_STATE_KEY)
    window.sessionStorage.removeItem(MARKETPLACE_RETURN_SEARCH_ARMED_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { locale?: PublicLocale; state?: MarketplaceReturnSearchState }
    if (parsed.locale && parsed.locale !== locale) return null
    return parsed.state || null
  } catch {
    return null
  }
}

function writeMarketplaceReturnSearchState(locale: PublicLocale, state: MarketplaceReturnSearchState) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(
      MARKETPLACE_RETURN_SEARCH_STATE_KEY,
      JSON.stringify({ locale, state, savedAt: new Date().toISOString() }),
    )
    window.sessionStorage.setItem(MARKETPLACE_RETURN_SEARCH_ARMED_KEY, '1')
  } catch {
    // sessionStorage can be unavailable; navigation should still work.
  }
}

function isLeasingListing(listing: VehicleSearchListing) {
  return (listing.equipment || '').toLowerCase().includes('leasing')
}

const categoryEnglishLabels: Record<string, string> = {
  all: 'All vehicles',
  cars: 'Cars',
  vans: 'Vans',
  motorcycles: 'Motorcycles',
  motorhomes: 'Motorhomes',
  caravans: 'Caravans',
  trucks: 'Trucks',
  agriculture: 'Agricultural machinery',
  construction: 'Construction machinery',
  'electric-bikes': 'Bikes',
  'e-scooters': 'Scooters',
}

function uiText(locale: PublicLocale, en: string, sv: string, de?: string) {
  if (locale === 'sv') return sv
  if (locale === 'de') return de || en
  return locale === 'en' ? en : translatePublic(locale, en)
}

function categoryText(item: (typeof categories)[number], locale: PublicLocale, short = false) {
  if (locale === 'sv') return short ? item.shortLabel : item.label
  if (locale === 'de') {
    const deLabels: Record<string, string> = {
      all: 'Alle Fahrzeuge',
      cars: 'Autos',
      vans: 'Transporter',
      motorcycles: 'Motorräder',
      motorhomes: 'Wohnmobile',
      caravans: 'Wohnwagen',
      trucks: 'Lkw',
      agriculture: 'Landmaschinen',
      construction: 'Baumaschinen',
      'electric-bikes': 'Fahrräder',
      'e-scooters': 'Scooter',
    }
    return deLabels[item.key] || item.label
  }
  const en = categoryEnglishLabels[item.key] || item.label
  return locale === 'en' ? en : translatePublic(locale, en)
}

function sortOptionLabel(value: string, fallback: string, locale: PublicLocale) {
  const labels: Record<string, [string, string, string]> = {
    relevant: ['Most relevant', 'Mest relevanta', 'Relevanteste'],
    'mileage-desc': ['Mileage high-low', 'Mil högt-lågt', 'Kilometer hoch-niedrig'],
    'mileage-asc': ['Mileage low-high', 'Mil lågt-högt', 'Kilometer niedrig-hoch'],
    model: ['Model', 'Modell', 'Modell'],
    nearest: ['Nearest', 'Närmaste', 'Nächste'],
    'price-desc': ['Price high-low', 'Pris högt-lågt', 'Preis hoch-niedrig'],
    'price-asc': ['Price low-high', 'Pris lågt-högt', 'Preis niedrig-hoch'],
    published: ['Published', 'Publicerad', 'Veröffentlicht'],
    'year-desc': ['Year newest-oldest', 'År nyast-äldst', 'Jahr neu-alt'],
    'year-asc': ['Year oldest-newest', 'År äldst-nyast', 'Jahr alt-neu'],
  }
  const label = labels[value]
  if (!label) return locale === 'sv' || locale === 'de' || locale === 'en'
    ? fallback
    : translatePublic(locale, fallback)
  return uiText(locale, label[0], label[1], label[2])
}

const SAVED_SEARCHES_STORAGE_KEY = 'autorell-saved-vehicle-searches'

const sortOptions = [
  { value: 'relevant', label: 'Mest relevanta' },
  { value: 'mileage-desc', label: 'Mil högt-lågt' },
  { value: 'mileage-asc', label: 'Mil lågt-högt' },
  { value: 'model', label: 'Model' },
  { value: 'nearest', label: 'Närmaste' },
  { value: 'price-desc', label: 'Pris högt-lågt' },
  { value: 'price-asc', label: 'Pris lågt-högt' },
  { value: 'published', label: 'Publicerad' },
  { value: 'year-desc', label: 'År nyast-äldst' },
  { value: 'year-asc', label: 'År äldst-nyast' },
]

export default function VehicleSearchExperience({
  listings,
  locale = 'sv',
  defaultCountry = 'SE',
  automaticCountry,
  initialMarkets = [],
  initialCategories = [],
  initialCategory = 'all',
  initialQuery = '',
  initialMake = '',
  initialModel = '',
  initialMinPrice = '',
  initialMaxPrice = '',
  initialMode = 'sale',
  initialMinYear = '',
  initialMaxYear = '',
  initialMaxMileage = '',
  initialFuel = '',
  initialGearbox = '',
  initialBodyType = '',
  initialCondition = '',
  initialColor = '',
  initialSellerType = 'all',
  initialVerifiedOnly = false,
  initialFourWheelDrive = false,
  initialLeasingPossible = false,
  initialEquipmentQuery = '',
  initialSortBy = 'published',
}: {
  listings: VehicleSearchListing[]
  locale?: PublicLocale
  defaultCountry?: string
  automaticCountry?: string
  initialMarkets?: string[]
  initialCategories?: string[]
  initialCategory?: string
  initialQuery?: string
  initialMake?: string
  initialModel?: string
  initialMinPrice?: string
  initialMaxPrice?: string
  initialMode?: SearchMode
  initialMinYear?: string
  initialMaxYear?: string
  initialMaxMileage?: string
  initialFuel?: string
  initialGearbox?: string
  initialBodyType?: string
  initialCondition?: string
  initialColor?: string
  initialSellerType?: string
  initialVerifiedOnly?: boolean
  initialFourWheelDrive?: boolean
  initialLeasingPossible?: boolean
  initialEquipmentQuery?: string
  initialSortBy?: string
}) {
  const safeInitialCategory = categories.some((item) => item.key === initialCategory) ? initialCategory : 'all'
  const safeInitialCategories = initialCategories.length
    ? [...new Set(initialCategories.filter((item) => categories.some((category) => category.key === item && item !== 'all')))]
    : safeInitialCategory === 'all' ? [] : [safeInitialCategory]
  const safeInitialCountry = (defaultCountry || '').toUpperCase()
  const safeAutomaticCountry = (automaticCountry || safeInitialCountry).toUpperCase()
  const safeInitialMarkets = normalizeMarketSelection(
    initialMarkets.length ? initialMarkets : [safeInitialCountry],
    safeAutomaticCountry,
  )
  const hasExplicitInitialFilters = Boolean(
    initialMarkets.length ||
      initialCategories.length ||
      safeInitialCategory !== 'all' ||
      initialQuery ||
      initialMake ||
      initialModel ||
      initialMinPrice ||
      initialMaxPrice ||
      initialMode !== 'sale' ||
      initialMinYear ||
      initialMaxYear ||
      initialMaxMileage ||
      initialFuel ||
      initialGearbox ||
      initialBodyType ||
      initialCondition ||
      initialColor ||
      (initialSellerType && initialSellerType !== 'all') ||
      initialVerifiedOnly ||
      initialFourWheelDrive ||
      initialLeasingPossible ||
      initialEquipmentQuery ||
      (initialSortBy && initialSortBy !== 'published'),
  )
  const [mode, setMode] = useState<SearchMode>(initialMode === 'leasing' ? 'leasing' : 'sale')
  const [query, setQuery] = useState(initialQuery)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(safeInitialCategories)
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(safeInitialMarkets)
  const [marketOverride, setMarketOverride] = useState(!sameMarketSelection(safeInitialMarkets, [safeAutomaticCountry]))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [marketOpen, setMarketOpen] = useState(false)
  const [mobileMapOpen, setMobileMapOpen] = useState(false)
  const [mobileDockVisible, setMobileDockVisible] = useState(true)
  const [sortBy, setSortBy] = useState(initialSortBy || 'published')
  const [resultsLayout, setResultsLayout] = useState<ResultsLayout>('single')
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)
  const [minYear, setMinYear] = useState(initialMinYear)
  const [maxYear, setMaxYear] = useState(initialMaxYear)
  const [maxMileage, setMaxMileage] = useState(initialMaxMileage)
  const [make, setMake] = useState(initialMake)
  const [model, setModel] = useState(initialModel)
  const [fuel, setFuel] = useState(initialFuel)
  const [gearbox, setGearbox] = useState(initialGearbox)
  const [bodyType, setBodyType] = useState(initialBodyType)
  const [condition, setCondition] = useState(initialCondition)
  const [color, setColor] = useState(initialColor)
  const [sellerType, setSellerType] = useState(initialSellerType || 'all')
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly)
  const [fourWheelDrive, setFourWheelDrive] = useState(initialFourWheelDrive)
  const [leasingPossible, setLeasingPossible] = useState(initialLeasingPossible)
  const [equipmentQuery, setEquipmentQuery] = useState(initialEquipmentQuery)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [savedSearchMessage, setSavedSearchMessage] = useState('')
  const [savingSearch, setSavingSearch] = useState(false)

  useEffect(() => {
    if (hasExplicitInitialFilters) return
    const restored = readMarketplaceReturnSearchState(locale)
    if (!restored) return

    const timer = window.setTimeout(() => {
      setMode(restored.mode === 'leasing' ? 'leasing' : 'sale')
      setQuery(restored.query || '')
      setSelectedCategories(normalizeSavedCategories(restored.categories))
      setSelectedMarkets((restored.markets || []).length ? normalizeMarketSelection(restored.markets || [], safeAutomaticCountry) : [])
      setMarketOverride(true)
      setMinPrice(restored.minPrice || '')
      setMaxPrice(restored.maxPrice || '')
      setMinYear(restored.minYear || '')
      setMaxYear(restored.maxYear || '')
      setMaxMileage(restored.maxMileage || '')
      setMake(restored.make || '')
      setModel(restored.model || '')
      setFuel(restored.fuel || '')
      setGearbox(restored.gearbox || '')
      setBodyType(restored.bodyType || '')
      setCondition(restored.condition || '')
      setColor(restored.color || '')
      setSellerType(restored.sellerType || 'all')
      setVerifiedOnly(Boolean(restored.verifiedOnly))
      setFourWheelDrive(Boolean(restored.fourWheelDrive))
      setLeasingPossible(Boolean(restored.leasingPossible))
      setEquipmentQuery(restored.equipmentQuery || '')
      setSortBy(restored.sortBy || 'published')
    }, 0)
    return () => window.clearTimeout(timer)
  }, [hasExplicitInitialFilters, locale, safeAutomaticCountry])
  const selectedCategoryItems = selectedCategories
    .map((key) => categories.find((item) => item.key === key))
    .filter((item): item is (typeof categories)[number] => Boolean(item))
  const filterProfile = [
    ...new Set((selectedCategories.length ? selectedCategories : ['all']).flatMap(categoryFilterProfile)),
  ]

  const optionListings = useMemo(
    () =>
      listings.filter(
        (listing) =>
          (!selectedCategories.length || selectedCategories.includes(listing.category)) &&
          matchesSelectedMarkets(listing.country, selectedMarkets),
      ),
    [listings, selectedCategories, selectedMarkets],
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
  const conditions = useMemo(
    () => [...new Set(optionListings.map((listing) => listing.condition).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'sv-SE')),
    [optionListings],
  )
  const colors = useMemo(
    () => [...new Set(optionListings.map((listing) => listing.color).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'sv-SE')),
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
    const normalizedQuery = query.trim().toLowerCase()
    const minPriceValue = parseOptionalNumber(minPrice)
    const maxPriceValue = parseOptionalNumber(maxPrice)
    const minYearValue = parseOptionalNumber(minYear)
    const maxYearValue = parseOptionalNumber(maxYear)
    const maxMileageValue = parseOptionalNumber(maxMileage)
    const matches = listings.filter((listing) => {
      if (mode === 'leasing' && !isLeasingListing(listing)) return false
      if (selectedCategories.length && !selectedCategories.includes(listing.category)) return false
      if (!matchesSelectedMarkets(listing.country, selectedMarkets)) return false
      if (make && listing.make !== make) return false
      if (model && listing.model !== model) return false
      if (fuel && listing.fuelType !== fuel) return false
      if (gearbox && listing.gearbox !== gearbox) return false
      if (bodyType && listing.bodyType !== bodyType) return false
      if (condition && listing.condition !== condition) return false
      if (color && listing.color !== color) return false
      if (sellerType === 'business' && !listing.sellerIsTrader) return false
      if (sellerType === 'private' && listing.sellerIsTrader) return false
      if (verifiedOnly && listing.sellerTrust !== 'verified') return false
      if (fourWheelDrive && !(listing.equipment || '').toLowerCase().includes('fyrhjuls')) return false
      if (leasingPossible && !(listing.equipment || '').toLowerCase().includes('leasing')) return false
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
      if (sortBy === 'mileage-asc') return (a.mileageKm ?? Number.MAX_SAFE_INTEGER) - (b.mileageKm ?? Number.MAX_SAFE_INTEGER)
      if (sortBy === 'mileage-desc') return (b.mileageKm ?? -1) - (a.mileageKm ?? -1)
      if (sortBy === 'model') return [a.make, a.model].filter(Boolean).join(' ').localeCompare([b.make, b.model].filter(Boolean).join(' '), 'sv-SE')
      if (sortBy === 'price-asc') return a.priceValue - b.priceValue
      if (sortBy === 'price-desc') return b.priceValue - a.priceValue
      if (sortBy === 'year-desc') return (parseOptionalNumber(b.year) || 0) - (parseOptionalNumber(a.year) || 0)
      if (sortBy === 'year-asc') return (parseOptionalNumber(a.year) || Number.MAX_SAFE_INTEGER) - (parseOptionalNumber(b.year) || Number.MAX_SAFE_INTEGER)
      return 0
    })
  }, [bodyType, color, condition, equipmentQuery, fourWheelDrive, fuel, gearbox, leasingPossible, listings, make, maxMileage, maxPrice, maxYear, minPrice, minYear, mode, model, query, selectedCategories, selectedMarkets, sellerType, sortBy, verifiedOnly])

  const resetFilters = () => {
    setQuery(initialQuery)
    setSelectedCategories(safeInitialCategories)
    setSelectedMarkets(normalizeMarketSelection([safeAutomaticCountry], safeAutomaticCountry))
    setMarketOverride(false)
    setMinPrice(initialMinPrice)
    setMaxPrice(initialMaxPrice)
    setMinYear(initialMinYear)
    setMaxYear(initialMaxYear)
    setMaxMileage(initialMaxMileage)
    setMake(initialMake)
    setModel(initialModel)
    setFuel(initialFuel)
    setGearbox(initialGearbox)
    setBodyType(initialBodyType)
    setCondition(initialCondition)
    setColor(initialColor)
    setSellerType(initialSellerType || 'all')
    setVerifiedOnly(initialVerifiedOnly)
    setFourWheelDrive(initialFourWheelDrive)
    setLeasingPossible(initialLeasingPossible)
    setEquipmentQuery(initialEquipmentQuery)
    setSortBy(initialSortBy || 'published')
    setSavedSearchMessage('')
  }

  function toggleCategory(nextCategory: string) {
    setMake('')
    setModel('')
    setSelectedCategories((current) => {
      if (nextCategory === 'all') return []
      return current.includes(nextCategory)
        ? current.filter((item) => item !== nextCategory)
        : [...current, nextCategory]
    })
  }

  function toggleMarket(value: string) {
    setMake('')
    setModel('')
    if (!value) {
      setSelectedMarkets([])
      setMarketOverride(true)
      return
    }
    setSelectedMarkets((current) => {
      const normalized = normalizeMarketSelection(current)
      const next = normalized.includes(value)
        ? normalized.filter((item) => item !== value)
        : [...normalized, value]
      setMarketOverride(true)
      return next
    })
  }

  function removeMarket(value: string) {
    setMake('')
    setModel('')
    setSelectedMarkets((current) => {
      const next = normalizeMarketSelection(current).filter((item) => item !== value)
      setMarketOverride(true)
      return next
    })
  }

  async function saveCurrentSearch() {
    if (savingSearch) return
    setSavingSearch(true)
    setSavedSearchMessage('')
    const params = new URLSearchParams()
    const setParam = (key: string, value: string) => {
      const cleanValue = value.trim()
      if (cleanValue) params.set(key, cleanValue)
    }
    if (mode !== 'sale') params.set('mode', mode)
    setParam('q', query)
    if (selectedCategories.length) params.set('categories', selectedCategories.join(','))
    if (marketOverride) {
      params.set('markets', selectedMarkets.length ? selectedMarkets.join(',') : 'EU')
    } else if (selectedMarkets.length) {
      params.set('markets', selectedMarkets.join(','))
    }
    setParam('make', make)
    setParam('model', model)
    setParam('minPrice', minPrice)
    setParam('maxPrice', maxPrice)
    setParam('minYear', minYear)
    setParam('maxYear', maxYear)
    setParam('maxMileage', maxMileage)
    setParam('fuel', fuel)
    setParam('gearbox', gearbox)
    setParam('bodyType', bodyType)
    setParam('condition', condition)
    setParam('color', color)
    if (sellerType !== 'all') params.set('sellerType', sellerType)
    if (verifiedOnly) params.set('verifiedOnly', '1')
    if (fourWheelDrive) params.set('fourWheelDrive', '1')
    if (leasingPossible) params.set('leasingPossible', '1')
    setParam('equipment', equipmentQuery)
    if (sortBy && sortBy !== 'published') params.set('sort', sortBy)

    const href = `/marketplace${params.size ? `?${params.toString()}` : ''}`
    const filterSnapshot = {
      mode,
      query: query.trim(),
      categories: selectedCategories,
      markets: selectedMarkets,
      make,
      model,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      maxMileage,
      fuel,
      gearbox,
      bodyType,
      condition,
      color,
      sellerType,
      verifiedOnly,
      fourWheelDrive,
      leasingPossible,
      equipmentQuery: equipmentQuery.trim(),
      sortBy,
    }
    const name = query.trim() || selectedCategoryItems.map((item) => categoryText(item, locale, true)).join(', ') || marketSummary || uiText(locale, 'All vehicles', 'Alla fordon', 'Alle Fahrzeuge')

    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          href,
          locale,
          marketCode: selectedMarkets[0] || '',
          filters: filterSnapshot,
        }),
      })
      if (response.status === 401) {
        window.dispatchEvent(
          new CustomEvent('autorell:open-auth', {
            detail: { mode: 'login', destination: localizePublicHref(locale, '/saved-searches') },
          }),
        )
        setSavedSearchMessage(uiText(locale, 'Log in to save', 'Logga in för att spara', 'Zum Speichern anmelden'))
        return
      }
      if (!response.ok) throw new Error('Could not save search')
      window.dispatchEvent(new CustomEvent(SAVED_SEARCHES_EVENT))
      setSavedSearchMessage(uiText(locale, 'Search saved', 'Sökningen är sparad', 'Suche gespeichert'))
      return
    } catch {
      setSavedSearchMessage(uiText(locale, 'Could not save search', 'Kunde inte spara sökningen', 'Suche konnte nicht gespeichert werden'))
      return
    } finally {
      setSavingSearch(false)
    }

    const savedSearch: SavedVehicleSearch = {
      savedAt: new Date().toISOString(),
      filters: {
        mode,
        query: query.trim(),
        categories: selectedCategories,
        markets: selectedMarkets,
        make,
        model,
        minPrice,
        maxPrice,
        minYear,
        maxYear,
        maxMileage,
        fuel,
        gearbox,
        bodyType,
        condition,
        color,
        sellerType,
        verifiedOnly,
        fourWheelDrive,
        leasingPossible,
        equipmentQuery: equipmentQuery.trim(),
      },
    }

    try {
      const current = window.localStorage.getItem(SAVED_SEARCHES_STORAGE_KEY)
      const searches = current ? (JSON.parse(current || '[]') as SavedVehicleSearch[]) : []
      window.localStorage.setItem(
        SAVED_SEARCHES_STORAGE_KEY,
        JSON.stringify([savedSearch, ...searches].slice(0, 20)),
      )
      setSavedSearchMessage(uiText(locale, 'Search saved', 'Sökningen är sparad', 'Suche gespeichert'))
    } catch {
      setSavedSearchMessage(uiText(locale, 'Could not save search', 'Kunde inte spara sökningen', 'Suche konnte nicht gespeichert werden'))
    }
  }

  function rememberSearchBeforeListingNavigation() {
    writeMarketplaceReturnSearchState(locale, {
      mode,
      query: query.trim(),
      categories: selectedCategories,
      markets: marketOverride ? selectedMarkets : selectedMarkets.length ? selectedMarkets : safeInitialMarkets,
      make,
      model,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      maxMileage,
      fuel,
      gearbox,
      bodyType,
      condition,
      color,
      sellerType,
      verifiedOnly,
      fourWheelDrive,
      leasingPossible,
      equipmentQuery: equipmentQuery.trim(),
      sortBy,
    })
  }

  const toggleCompare = (listingId: string) => {
    setCompareIds((current) =>
      current.includes(listingId)
        ? current.filter((id) => id !== listingId)
        : [...current, listingId].slice(-4),
    )
  }

  const currentTabLabel = mode === 'sale'
    ? uiText(locale, 'Vehicles for sale', 'Fordon till salu', 'Fahrzeuge kaufen')
    : uiText(locale, 'Leasing', 'Leasing', 'Leasing')
  const visibleCount = filteredListings.length
  const selectedMarketCodes = selectedMarkets.filter(Boolean)
  const primaryMapCountry = selectedMarketCodes.length === 1 ? selectedMarketCodes[0] : 'EU'
  const marketSummary = selectedMarketCodes.length
    ? selectedMarketCodes.map((code) => getEuCountryName(code, locale)).join(', ')
    : uiText(locale, 'All of Europe', 'Hela Europa', 'Ganz Europa')
  const countryName = selectedMarketCodes.length === 1
    ? getEuCountryName(selectedMarketCodes[0], locale)
    : selectedMarketCodes.length > 1
      ? uiText(locale, 'selected markets', 'valda marknader', 'ausgewählte Märkte')
      : uiText(locale, 'All markets', 'alla marknader', 'alle Märkte')
  const resultLocationName = getResultLocationName(query, filteredListings, countryName)
  const activeFilterCandidates: Array<ActiveFilterChip | null> = [
    ...selectedCategoryItems.map((item) => {
      const Icon = item.icon
      return {
        key: `category-${item.key}`,
        label: categoryText(item, locale, true),
        icon: <Icon className="h-4 w-4" />,
        onRemove: () => {
          setSelectedCategories((current) => current.filter((category) => category !== item.key))
          setMake('')
          setModel('')
        },
      }
    }),
    ...(marketOverride
      ? selectedMarketCodes.length
        ? selectedMarketCodes.map((code) => ({
            key: `market-${code}`,
            label: getEuCountryName(code, locale),
            icon: <CountryFlag code={code} className="h-4 w-4 rounded-full" />,
            onRemove: () => removeMarket(code),
          }))
        : [{
            key: 'market-eu',
            label: uiText(locale, 'All of Europe', 'Hela Europa', 'Ganz Europa'),
            icon: <CountryFlag code="eu" className="h-4 w-4 rounded-full" />,
            onRemove: () => {
              setSelectedMarkets(normalizeMarketSelection([safeAutomaticCountry], safeAutomaticCountry))
              setMarketOverride(false)
              setMake('')
              setModel('')
            },
          }]
      : []),
    make ? { key: 'make', label: make, onRemove: () => {
      setMake('')
      setModel('')
    } } : null,
    model ? { key: 'model', label: model, onRemove: () => setModel('') } : null,
    fuel ? { key: 'fuel', label: fuel, onRemove: () => setFuel('') } : null,
    gearbox ? { key: 'gearbox', label: gearbox, onRemove: () => setGearbox('') } : null,
    bodyType ? { key: 'bodyType', label: bodyType, onRemove: () => setBodyType('') } : null,
    condition ? { key: 'condition', label: condition, onRemove: () => setCondition('') } : null,
    color ? { key: 'color', label: color, onRemove: () => setColor('') } : null,
    sellerType !== 'all'
      ? { key: 'sellerType', label: sellerType === 'business' ? uiText(locale, 'Business', 'Företag', 'Unternehmen') : uiText(locale, 'Private seller', 'Privatperson', 'Privatperson'), onRemove: () => setSellerType('all') }
      : null,
    minPrice || maxPrice
      ? { key: 'price', label: uiText(locale, 'Price', 'Pris', 'Preis') + ' ' + (minPrice || '0') + '-' + (maxPrice || 'max') + ' SEK', onRemove: () => {
        setMinPrice('')
        setMaxPrice('')
      } }
      : null,
    minYear || maxYear
      ? { key: 'year', label: uiText(locale, 'Model year', 'Årsmodell', 'Baujahr') + ' ' + (minYear || '1950') + '-' + (maxYear || uiText(locale, 'newest', 'nyast', 'neueste')), onRemove: () => {
        setMinYear('')
        setMaxYear('')
      } }
      : null,
    maxMileage ? { key: 'mileage', label: `Max ${Number(maxMileage).toLocaleString('sv-SE')} km`, onRemove: () => setMaxMileage('') } : null,
    verifiedOnly ? { key: 'verified', label: uiText(locale, 'Verified', 'Verifierade', 'Verifiziert'), onRemove: () => setVerifiedOnly(false) } : null,
    fourWheelDrive ? { key: 'fourWheelDrive', label: uiText(locale, 'Four-wheel drive', 'Fyrhjulsdrift', 'Allrad'), onRemove: () => setFourWheelDrive(false) } : null,
    leasingPossible ? { key: 'leasingPossible', label: uiText(locale, 'Leasing possible', 'Leasing möjlig', 'Leasing möglich'), onRemove: () => setLeasingPossible(false) } : null,
    equipmentQuery.trim() ? { key: 'equipment', label: equipmentQuery.trim(), onRemove: () => setEquipmentQuery('') } : null,
  ]
  const activeFilters = activeFilterCandidates.filter((filter): filter is ActiveFilterChip => filter !== null)
  const saveSearchButtonLabel = savedSearchMessage || (
    activeFilters.length
      ? uiText(locale, 'Save', 'Spara', 'Speichern') + ' ' + activeFilters.length + ' ' + uiText(locale, 'filters', 'filter', 'Filter')
      : uiText(locale, 'Save search', 'Spara sökning', 'Suche speichern')
  )
  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isNearTop = currentScrollY < 24
      const scrollingUp = currentScrollY < lastScrollY
      const scrollingDown = currentScrollY > lastScrollY + 6

      if (isNearTop || scrollingUp) {
        setMobileDockVisible(true)
      } else if (scrollingDown) {
        setMobileDockVisible(false)
      }

      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-[calc(100dvh-56px)] w-screen max-w-[100vw] overflow-x-hidden bg-white pb-[calc(18px+env(safe-area-inset-bottom))] text-[#101828] min-[1120px]:h-[calc(100dvh-58px)] min-[1120px]:min-h-[calc(100dvh-58px)] min-[1120px]:w-full min-[1120px]:overflow-hidden min-[1120px]:pb-0">
      <div className="flex min-h-[calc(100dvh-56px)] min-w-0 w-screen max-w-[100vw] flex-col overflow-x-hidden min-[1120px]:h-full min-[1120px]:min-h-0 min-[1120px]:w-full min-[1120px]:overflow-hidden">
        <header className="hidden min-h-[62px] items-center justify-between border-b border-[#eceff4] bg-white px-5 sm:px-7">
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
              <CountryFlag code={primaryMapCountry || 'SE'} className="h-5 w-5" />
              <span>{primaryMapCountry || 'EU'}</span>
            </span>
          </div>
        </header>

        <section className="grid min-h-0 min-w-0 w-screen max-w-[100vw] flex-1 overflow-x-hidden lg:w-full lg:max-w-full lg:grid-cols-[minmax(640px,clamp(680px,38vw,760px))_minmax(620px,1fr)]">
          <div className="relative min-h-0 min-w-0 w-screen max-w-[100vw] overflow-x-hidden overflow-y-auto border-r border-[#eceff4] bg-white lg:w-full lg:max-w-full">
            <div className="w-full max-w-full overflow-hidden border-b border-[#eceff4] px-5 pt-0 sm:px-6 lg:px-7">
              <div className="grid grid-cols-2 border-b border-[#dfe4ec]">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMode(tab.key)}
                    className={`relative min-h-[40px] min-w-0 px-1 text-center text-[12px] !font-medium transition sm:min-h-[44px] sm:px-2 sm:text-[14px] ${
                      mode === tab.key ? 'text-[#101828]' : 'text-[#475467] hover:text-[#101828]'
                    }`}
                  >
                    <span className="block sm:hidden">
                      {tab.key === 'sale'
                        ? uiText(locale, 'Vehicles for sale', 'Fordon till salu', 'Fahrzeuge kaufen')
                        : uiText(locale, 'Leasing', 'Leasing', 'Leasing')}
                    </span>
                    <span className="hidden sm:block">
                      {tab.key === 'sale'
                        ? uiText(locale, 'Vehicles for sale', 'Fordon till salu', 'Fahrzeuge kaufen')
                        : uiText(locale, 'Leasing', 'Leasing', 'Leasing')}
                    </span>
                    {mode === tab.key ? <span className="absolute inset-x-0 -bottom-px h-[3px] bg-[#0866ff]" /> : null}
                  </button>
                ))}
              </div>

            </div>

            <div>
              <div className="min-w-0 max-w-full overflow-hidden">
                <div className="w-full max-w-full overflow-hidden border-b border-[#eceff4] px-4 py-3 sm:px-6">
                <label className="group relative flex h-[50px] items-center justify-start gap-3 rounded-[8px] bg-[#f1f2f4] px-4 text-[#667085] transition-all duration-200 focus-within:ring-1 focus-within:ring-[#101828]">
                  <span className="sr-only">{uiText(locale, 'Search', 'Sök', 'Suche')}</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder=""
                    aria-label={uiText(locale, 'Search vehicle, city or area', 'Sök fordon, ort eller kommun', 'Fahrzeug, Ort oder Gemeinde suchen')}
                    className="vehicle-search-control w-full min-w-0 bg-transparent pr-10 text-[14px] font-normal text-[#101828] outline-none [background:transparent]"
                  />
                  {query ? null : (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 max-w-[calc(100%-64px)] -translate-y-1/2 truncate whitespace-nowrap text-[14px] font-normal text-[#767676]"
                    >
                      {uiText(locale, 'Search vehicle, city or area', 'Sök fordon, ort eller kommun', 'Fahrzeug, Ort oder Gemeinde suchen')}
                    </span>
                  )}
                  <Search className="absolute right-4 top-1/2 h-5 w-5 shrink-0 -translate-y-1/2 text-[#101828]" />
                </label>

                <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((open) => !open)}
                    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border px-3 text-[14px] font-medium shadow-sm transition sm:min-h-10 sm:gap-2 sm:px-4 ${
                      filtersOpen ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]' : 'border-[#d0d5dd] bg-white hover:border-[#0866ff]'
                    }`}
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                    {filtersOpen
                      ? uiText(locale, 'Filters open', 'Filter öppna', 'Filter geöffnet')
                      : uiText(locale, 'Search filters', 'Sökfilter', 'Suchfilter')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileMapOpen(true)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-[14px] font-medium text-[#101828] shadow-sm transition hover:border-[#0866ff] sm:min-h-10 sm:gap-2 sm:px-4 lg:hidden"
                  >
                    <Map className="h-5 w-5" />
                    <span className="sm:hidden">{uiText(locale, 'Map', 'Karta', 'Karte')}</span>
                    <span className="hidden sm:inline">{uiText(locale, 'Show map', 'Visa karta', 'Karte anzeigen')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={saveCurrentSearch}
                    disabled={savingSearch}
                    className={`col-span-2 inline-flex min-h-10 items-center justify-center gap-3 rounded-[8px] px-5 text-[14px] font-medium text-white transition lg:col-span-1 ${
                      savedSearchMessage
                        ? 'bg-[#079455]'
                        : activeFilters.length
                          ? 'bg-[#0866ff] hover:bg-[#0757da]'
                          : 'bg-[#d1d3d8]'
                    }`}
                  >
                    <Bookmark className="h-5 w-5" strokeWidth={1.8} />
                    {saveSearchButtonLabel}
                  </button>
                </div>

                {filtersOpen ? (
                  <div className="fixed inset-0 z-[180] bg-white lg:absolute lg:inset-0 lg:z-50">
                    <div data-filter-profile={filterProfile.join(' ')} className="flex h-full min-h-0 flex-col bg-white">
                    <div className="flex items-center justify-between border-b border-[#e1e9f5] px-4 py-4 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">
                        <SlidersHorizontal className="h-5 w-5 shrink-0 text-[#101828]" />
                        <p className="min-w-0 text-xl font-semibold text-[#101828]">{uiText(locale, 'Search filters', 'Sökfilter', 'Suchfilter')}</p>
                        {activeFilters.length ? (
                          <span className="grid h-7 min-w-7 place-items-center rounded-full bg-[#101828] px-2 text-sm font-semibold text-white">
                            {activeFilters.length}
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => setFiltersOpen(false)}
                        className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#101828] ring-1 ring-[#d0d5dd] transition hover:text-[#0866ff]"
                        aria-label="Stäng filter"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="border-b border-[#edf1f6] px-4 py-3 sm:px-6">
                      {activeFilters.length ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <ActiveFilterChips filters={activeFilters} />
                          <button
                            type="button"
                            onClick={resetFilters}
                            className="h-8 rounded-[6px] px-2 text-sm font-medium text-[#101828] underline underline-offset-2 hover:text-[#0866ff]"
                          >
                            {uiText(locale, 'Clear filters', 'Rensa filter', 'Filter löschen')}
                          </button>
                        </div>
                      ) : (
                         <p className="text-sm font-normal text-[#667085]">{uiText(locale, 'Narrow by vehicle, market and equipment.', 'Avgränsa på fordon, marknad och utrustning.', 'Nach Fahrzeug, Markt und Ausstattung eingrenzen.')}</p>
                      )}
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                    <CollapsibleFilterSection
                      title={uiText(locale, 'Market', 'Marknad', 'Markt')}
                      summary={marketSummary}
                      open={marketOpen}
                      onToggle={() => setMarketOpen((open) => !open)}
                    >
                      <MarketOptionGrid
                        markets={selectedMarkets}
                        locale={locale}
                        onToggle={toggleMarket}
                      />
                    </CollapsibleFilterSection>
                    <FilterSection title={uiText(locale, 'Vehicle type', 'Fordonstyp', 'Fahrzeugtyp')}>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((item) => {
                          const Icon = item.icon
                          const active = item.key === 'all'
                            ? selectedCategories.length === 0
                            : selectedCategories.includes(item.key)
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => toggleCategory(item.key)}
                              className={`flex min-h-12 items-center gap-2 rounded-[8px] border px-2 text-left transition sm:min-h-14 sm:gap-3 sm:px-3 ${
                                active
                                  ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                                  : 'border-[#d0d5dd] bg-white text-[#101828] hover:border-[#0866ff]'
                              }`}
                            >
                              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[8px] sm:h-9 sm:w-9 ${active ? 'bg-white' : 'bg-[#f3f6fb]'}`}>
                                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </span>
                              <span className="block min-w-0 text-[12px] font-semibold leading-tight sm:text-sm">{categoryText(item, locale)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </FilterSection>
                    <FilterSection title={uiText(locale, 'Vehicle', 'Fordon', 'Fahrzeug')}>
                    <div className="grid grid-cols-2 gap-3">
                      <FilterSelect label={uiText(locale, 'Make', 'Märke', 'Marke')} value={make} onChange={(value) => {
                        setMake(value)
                        setModel('')
                      }} options={makes} />
                      <FilterSelect label={uiText(locale, 'Model', 'Modell', 'Modell')} value={model} onChange={setModel} options={models} />
                    </div>
                    </FilterSection>
                    <RangeFilter
                      title={uiText(locale, 'Price', 'Pris', 'Preis')}
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
                      title={uiText(locale, 'Model year', 'Modellår', 'Baujahr')}
                      minValue={minYear}
                      maxValue={maxYear}
                      onMinChange={setMinYear}
                      onMaxChange={setMaxYear}
                      minLimit={1950}
                      maxLimit={new Date().getFullYear() + 1}
                      step={1}
                      startLabel={uiText(locale, 'Before 1950', 'Före 1950', 'Vor 1950')}
                    />
                    <RangeFilter
                      title={uiText(locale, 'Mileage', 'Miltal', 'Kilometerstand')}
                      minValue=""
                      maxValue={maxMileage}
                      onMinChange={() => undefined}
                      onMaxChange={setMaxMileage}
                      minLimit={mileageBounds.min}
                      maxLimit={mileageBounds.max}
                      unit="km"
                      step={1000}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FilterSelect label={uiText(locale, 'Fuel', 'Drivmedel', 'Kraftstoff')} value={fuel} onChange={setFuel} options={fuels} />
                      <FilterSelect label={uiText(locale, 'Gearbox', 'Växellåda', 'Getriebe')} value={gearbox} onChange={setGearbox} options={gearboxes} />
                      <FilterSelect label={uiText(locale, 'Body type', 'Kaross / typ', 'Karosserie / Typ')} value={bodyType} onChange={setBodyType} options={bodyTypes} />
                      <FilterSelect label={uiText(locale, 'Condition', 'Skick', 'Zustand')} value={condition} onChange={setCondition} options={conditions} />
                      <FilterSelect label={uiText(locale, 'Color', 'Färg', 'Farbe')} value={color} onChange={setColor} options={colors} />
                      <FilterSelect
                        label={uiText(locale, 'Seller type', 'Säljartyp', 'Verkäufertyp')}
                        value={sellerType}
                        onChange={setSellerType}
                        options={[
                          { value: 'all', label: uiText(locale, 'All sellers', 'Alla säljare', 'Alle Verkäufer') },
                          { value: 'business', label: uiText(locale, 'Business', 'Företag', 'Unternehmen') },
                          { value: 'private', label: uiText(locale, 'Private seller', 'Privatperson', 'Privatperson') },
                        ]}
                      />
                      <ToggleFilter label={uiText(locale, 'Verified listings', 'Verifierade annonser', 'Verifizierte Anzeigen')} checked={verifiedOnly} onChange={setVerifiedOnly} />
                      <ToggleFilter label={uiText(locale, 'Four-wheel drive', 'Fyrhjulsdrift', 'Allrad')} checked={fourWheelDrive} onChange={setFourWheelDrive} />
                      <ToggleFilter label={uiText(locale, 'Leasing possible', 'Leasing möjlig', 'Leasing möglich')} checked={leasingPossible} onChange={setLeasingPossible} />
                      <label className="col-span-2 block">
                        <span className="mb-1.5 block text-xs font-semibold text-[#475467]">{uiText(locale, 'Equipment, tow bar etc.', 'Utrustning, drag m.m.', 'Ausstattung, Anhängerkupplung usw.')}</span>
                        <input
                          value={equipmentQuery}
                          onChange={(event) => setEquipmentQuery(event.target.value)}
                          placeholder={uiText(locale, 'E.g. tow bar, navigation, four-wheel drive', 'Ex. Dragkrok, navigation, fyrhjulsdrift', 'z.B. Anhängerkupplung, Navigation, Allrad')}
                          className="h-11 w-full rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-sm font-medium outline-none transition placeholder:text-[#98a2b3] focus:border-[#0866ff]"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="h-11 rounded-[8px] border border-[#d0d5dd] bg-[#f8fafc] px-4 text-sm font-medium text-[#0866ff] transition hover:border-[#0866ff]"
                      >
                        {uiText(locale, 'Clear filters', 'Rensa filter', 'Filter löschen')}
                      </button>
                    </div>
                  </div>
                      <div className="grid grid-cols-[minmax(110px,160px)_1fr] gap-3 border-t border-[#edf1f6] bg-white px-4 py-3 shadow-[0_-10px_30px_rgba(16,24,40,.08)] sm:px-6">
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="h-12 rounded-[8px] border border-[#d0d5dd] bg-white px-4 text-sm font-medium text-[#101828] transition hover:border-[#0866ff]"
                        >
                          {uiText(locale, 'Clear', 'Rensa', 'Zurücksetzen')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFiltersOpen(false)}
                          className="h-12 rounded-[8px] bg-[#0866ff] px-4 text-sm font-medium text-white transition hover:bg-[#0757da]"
                        >
                          {uiText(locale, 'Show', 'Visa', 'Anzeigen')} {visibleCount.toLocaleString(locale === 'sv' ? 'sv-SE' : undefined)} {uiText(locale, 'vehicles for sale', 'fordon till salu', 'Fahrzeuge')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

            <div className="px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium leading-6">
                  {mode === 'sale' ? (
                    <>
                      {uiText(locale, 'Vehicles for sale', 'Fordon till salu', 'Fahrzeuge kaufen')}{' '}
                      {uiText(locale, 'in', 'i', 'in')}{' '}
                      <strong className="font-semibold">{resultLocationName}</strong>.{' '}
                      <strong className="font-semibold">{visibleCount.toLocaleString(locale === 'sv' ? 'sv-SE' : undefined)}</strong>{' '}
                      {uiText(locale, 'listings shown', 'annonser visas', 'Anzeigen werden angezeigt')}.
                    </>
                  ) : (
                    <>
                      {currentTabLabel} {uiText(locale, 'in', 'i', 'in')} <strong className="font-semibold">{countryName}</strong>.
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResultsLayout((layout) => (layout === 'single' ? 'split' : 'single'))}
                  className={`grid h-10 w-10 place-items-center rounded-[8px] border text-[#101828] shadow-sm transition ${
                    resultsLayout === 'split'
                      ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                      : 'border-[#d0d5dd] bg-white hover:border-[#0866ff]'
                  }`}
                  aria-label={resultsLayout === 'split' ? uiText(locale, 'Show listings in one column', 'Visa annonser i en kolumn', 'Anzeigen in einer Spalte anzeigen') : uiText(locale, 'Show two listings per row', 'Visa två annonser per rad', 'Zwei Anzeigen pro Zeile anzeigen')}
                  title={resultsLayout === 'split' ? uiText(locale, 'One listing per row', 'En annons per rad', 'Eine Anzeige pro Zeile') : uiText(locale, 'Two listings per row', 'Två annonser per rad', 'Zwei Anzeigen pro Zeile')}
                >
                  {resultsLayout === 'split' ? <List className="h-5 w-5" /> : <Columns2 className="h-5 w-5" />}
                </button>
                <label className="relative">
                  <span className="sr-only">{uiText(locale, 'Sorting', 'Sortering', 'Sortierung')}</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-10 min-w-[136px] appearance-none truncate rounded-[8px] border border-[#d0d5dd] bg-white px-3 pr-8 text-[13px] font-medium shadow-sm outline-none transition focus:border-[#0866ff] sm:min-w-[148px]"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {sortOptionLabel(option.value, option.label, locale)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                </label>
                </div>
              </div>
            </div>

            <div className="border-t border-[#eceff4]">
              {filteredListings.length ? (
                <div className={resultsLayout === 'split' ? 'grid grid-cols-1 min-[560px]:grid-cols-2' : ''}>
                  {filteredListings.map((listing) => (
                    <VehicleResultCard
                      key={listing.id}
                      listing={listing}
                      locale={locale}
                      compareActive={compareIds.includes(listing.id)}
                      onCompare={() => toggleCompare(listing.id)}
                      onBeforeNavigate={rememberSearchBeforeListingNavigation}
                      layout={resultsLayout}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-8 py-14">
                  <div className="rounded-[8px] border border-[#d9e1ec] bg-[#f8fbff] p-7">
                    <p className="text-xl font-semibold text-[#101828]">{currentTabLabel}</p>
                    <p className="mt-3 max-w-xl text-base leading-7 text-[#667085]">
                      {uiText(locale, 'Here vehicles for sale will appear when listings have the correct listing type in the database.', 'Här kommer fordon till salu visas när annonserna har rätt annonstyp i databasen.', 'Hier erscheinen Fahrzeuge, sobald Anzeigen den richtigen Anzeigentyp in der Datenbank haben.')}
                    </p>
                  </div>
                </div>
              )}
              <VehicleSearchFooter locale={locale} />
            </div>
              </div>
            </div>
          </div>

          {!mobileMapOpen ? (
            <button
              type="button"
              onClick={() => setMobileMapOpen(true)}
              className={`${mobileDockVisible ? 'bottom-[calc(4.25rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]'} fixed left-1/2 z-[80] inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#0866ff] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(8,102,255,.30)] transition-[bottom,transform] duration-200 active:scale-[.98] lg:hidden`}
            >
              <MapPin className="h-4 w-4" />
              {uiText(locale, 'Map', 'Karta', 'Karte')}
            </button>
          ) : null}

          <div className={`${mobileMapOpen ? 'fixed inset-0 z-[140] block bg-white' : 'hidden'} lg:relative lg:block lg:h-full`}>
            <VehicleSearchMap
              listings={filteredListings}
              country={primaryMapCountry}
              locale={locale}
              query={query}
              onQueryChange={setQuery}
              mobileOverlay={mobileMapOpen}
              onCloseMobileMap={() => setMobileMapOpen(false)}
              onOpenFilters={() => {
                setFiltersOpen(true)
              }}
              onSaveSearch={saveCurrentSearch}
              onBeforeListingNavigate={rememberSearchBeforeListingNavigation}
              saveSearchButtonLabel={saveSearchButtonLabel}
              saveSearchActive={Boolean(savedSearchMessage || activeFilters.length)}
              saveSearchBusy={savingSearch}
            />
            {mobileMapOpen && filtersOpen ? (
              <div className="absolute inset-x-0 bottom-0 top-[calc(7.25rem+env(safe-area-inset-top))] z-30 overflow-hidden rounded-t-[8px] border-t border-[#d9e6ff] bg-white shadow-[0_-18px_42px_rgba(16,24,40,.18)] lg:hidden">
                <div className="flex items-center justify-between border-b border-[#edf1f6] px-4 py-3">
                  <div>
                    <p className="text-[15px] font-semibold text-[#101828]">Sökfilter</p>
                    <p className="mt-0.5 text-xs font-medium text-[#667085]">Filtren uppdaterar kartan direkt.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-[#f8fafc] text-[#101828] ring-1 ring-[#d0d5dd]"
                        aria-label="Stäng filter"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-[calc(100%-116px)] overflow-y-auto px-4 py-4">
                  <CollapsibleFilterSection
                    title="Marknad"
                    summary={marketSummary}
                    open={marketOpen}
                    onToggle={() => setMarketOpen((open) => !open)}
                  >
                    <MarketOptionGrid
                      markets={selectedMarkets}
                      locale={locale}
                      onToggle={toggleMarket}
                    />
                  </CollapsibleFilterSection>
                  <FilterSection title="Fordonstyp">
                    <div className="grid gap-2">
                      {categories.map((item) => {
                        const Icon = item.icon
                        const active = item.key === 'all'
                          ? selectedCategories.length === 0
                          : selectedCategories.includes(item.key)
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => toggleCategory(item.key)}
                            className={`flex min-h-12 items-center gap-3 rounded-[8px] border px-3 text-left transition ${
                              active
                                ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                                : 'border-[#d0d5dd] bg-white text-[#101828]'
                            }`}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            <span className="text-sm font-semibold">{item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </FilterSection>
                  <FilterSection title="Fordon">
                    <div className="grid gap-3">
                      <FilterSelect label="Märke" value={make} onChange={(value) => {
                        setMake(value)
                        setModel('')
                      }} options={makes} />
                      <FilterSelect label="Modell" value={model} onChange={setModel} options={models} />
                      <FilterSelect label="Drivmedel" value={fuel} onChange={setFuel} options={fuels} />
                      <FilterSelect label="Växellåda" value={gearbox} onChange={setGearbox} options={gearboxes} />
                      <FilterSelect label="Miltal" value={maxMileage} onChange={setMaxMileage} options={[
                        { value: '', label: 'Alla' },
                        { value: '5000', label: 'Upp till 5 000 km' },
                        { value: '20000', label: 'Upp till 20 000 km' },
                        { value: '100000', label: 'Upp till 100 000 km' },
                      ]} />
                    </div>
                  </FilterSection>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3 border-t border-[#edf1f6] bg-white px-4 py-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-11 rounded-[8px] bg-[#f2f4f7] text-sm font-semibold text-[#0866ff]"
                  >
                    Rensa
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="h-11 rounded-[8px] bg-[#0866ff] text-sm font-semibold text-white"
                  >
                    Visa karta
                  </button>
                </div>
              </div>
            ) : null}
          </div>

        </section>
      </div>
    </main>
  )
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="border-b border-[#edf1f6] pb-4 last:border-b-0">
      <h3 className="mb-3 text-sm font-semibold text-[#101828]">{title}</h3>
      {children}
    </section>
  )
}

function CollapsibleFilterSection({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string
  summary: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section className="border-b border-[#edf1f6] pb-4 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 rounded-[8px] bg-white px-0 py-1 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block text-sm font-semibold text-[#101828]">{title}</span>
          <span className="mt-1 block text-xs font-medium text-[#667085]">{summary}</span>
        </span>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-[#f3f6fb] text-[#667085] transition ${open ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </section>
  )
}

function MarketOptionGrid({
  markets,
  locale,
  onToggle,
}: {
  markets: string[]
  locale: PublicLocale
  onToggle: (value: string) => void
}) {
  const selectedMarkets = normalizeMarketSelection(markets)
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {countryFilterOptions.map((option) => {
        const selected = option.value ? selectedMarkets.includes(option.value) : selectedMarkets.length === 0
        return (
          <button
            key={option.value || 'eu'}
            type="button"
            onClick={() => onToggle(option.value)}
            className={`flex h-11 items-center gap-2 rounded-[8px] border px-3 text-left text-sm font-medium transition ${
              selected
                ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                : 'border-[#d0d5dd] bg-white text-[#101828] hover:border-[#0866ff]'
            }`}
          >
            <CountryFlag code={option.value || 'eu'} className="h-5 w-5 rounded-full" />
            <span className="min-w-0 flex-1 truncate">
              {option.value ? getEuCountryName(option.value, locale) : option.label}
            </span>
            {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
          </button>
        )
      })}
    </div>
  )
}

function ActiveFilterChips({
  filters,
}: {
  filters: ActiveFilterChip[]
}) {
  if (!filters.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={filter.onRemove}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#eef5ff] px-3 text-xs font-semibold text-[#0866ff] transition hover:bg-[#dceaff]"
          aria-label={`Ta bort filter ${filter.label}`}
        >
          {filter.icon}
          <span>{filter.label}</span>
          <X className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}

function ToggleFilter({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex h-11 items-center justify-between rounded-[8px] border px-3 text-left text-sm font-medium transition ${
        checked
          ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
          : 'border-[#d0d5dd] bg-white text-[#101828] hover:border-[#0866ff]'
      }`}
      aria-pressed={checked}
    >
      {label}
      <span className={`h-4 w-4 rounded-[4px] border ${checked ? 'border-[#0866ff] bg-[#0866ff]' : 'border-[#98a2b3]'}`} />
    </button>
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
      <span className="flex h-11 items-center rounded-[8px] border border-[#d0d5dd] bg-white px-3 focus-within:border-[#0866ff]">
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
        className="h-11 w-full appearance-none rounded-[8px] border border-[#d0d5dd] bg-white px-3 pr-9 text-sm font-medium outline-none transition focus:border-[#0866ff]"
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

function VehicleSearchFooter({ locale }: { locale: PublicLocale }) {
  const columns = [
    {
      title: uiText(locale, 'Services', 'Tjänster', 'Dienste'),
      links: [
        [uiText(locale, 'All vehicles', 'Alla fordon', 'Alle Fahrzeuge'), '/marketplace'],
        [uiText(locale, 'Cars', 'Bilar', 'Autos'), '/marketplace/cars'],
        [uiText(locale, 'Vans', 'Transportbilar', 'Transporter'), '/marketplace/vans'],
        [uiText(locale, 'Compare vehicles', 'Jämför fordon', 'Fahrzeuge vergleichen'), '/compare-vehicles'],
      ],
    },
    {
      title: uiText(locale, 'Sell vehicle', 'Sälj fordon', 'Fahrzeug verkaufen'),
      links: [
        [uiText(locale, 'Sell your vehicle', 'Sälj ditt fordon', 'Fahrzeug verkaufen'), '/sell-vehicle'],
        [uiText(locale, 'For businesses', 'Företag', 'Für Unternehmen'), '/business'],
        [uiText(locale, 'Pricing', 'Priser', 'Preise'), '/pricing'],
        [uiText(locale, 'Safety tips', 'Trygg affär', 'Sicherheitstipps'), '/safety-tips'],
      ],
    },
    {
      title: uiText(locale, 'About us', 'Om oss', 'Über uns'),
      links: [
        [uiText(locale, 'About Autorell', 'Om Autorell', 'Über Autorell'), '/about'],
        [uiText(locale, 'Contact us', 'Kontakt', 'Kontakt'), '/contact'],
        [uiText(locale, 'Help center', 'Hjälpcenter', 'Hilfe'), '/help-center'],
        [uiText(locale, 'Terms of Service', 'Villkor', 'Nutzungsbedingungen'), '/terms'],
      ],
    },
  ]

  return (
    <footer className="border-t border-[#dfe5ee] bg-white px-5 pb-8 pt-8 text-[#101828] sm:px-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-7 min-[560px]:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-[15px] font-semibold">{column.title}</p>
            <nav className="mt-3 grid gap-2.5 text-[13px] font-medium text-[#475467]">
              {column.links.map(([label, href]) => (
                <Link key={href} href={localizePublicHref(locale, href)} className="transition hover:text-[#0866ff]">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
      <div className="mt-8 border-t border-[#dfe5ee] pt-6">
        <BrandLogo compact underline={false} />
        <p className="mt-4 max-w-xl text-[13px] leading-6 text-[#475467]">
          {uiText(locale, 'Autorell is a European marketplace for vehicle listings. Buyers can find listings and sellers can reach the right customers in a safe and clear way.', 'Autorell är en europeisk marknadsplats för fordon. Här kan köpare hitta annonser och säljare nå rätt kunder på ett tryggt och tydligt sätt.', 'Autorell ist ein europäischer Marktplatz für Fahrzeuganzeigen. Käufer finden Anzeigen und Verkäufer erreichen passende Kunden sicher und klar.')}
        </p>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-semibold text-[#475467]">
          <Link href={localizePublicHref(locale, '/privacy')} className="hover:text-[#0866ff]">{uiText(locale, 'Privacy Policy', 'Integritet', 'Datenschutz')}</Link>
          <Link href={localizePublicHref(locale, '/cookies')} className="hover:text-[#0866ff]">Cookies</Link>
          <Link href={localizePublicHref(locale, '/refund-policy')} className="hover:text-[#0866ff]">{uiText(locale, 'Refund policy', 'Återbetalning', 'Erstattung')}</Link>
        </div>
        <p className="mt-5 text-[12px] text-[#667085]">© 2026 Autorell</p>
      </div>
    </footer>
  )
}

function VehicleResultCard({
  listing,
  locale,
  compareActive,
  onCompare,
  onBeforeNavigate,
  layout = 'single',
}: {
  listing: VehicleSearchListing
  locale: PublicLocale
  compareActive: boolean
  onCompare: () => void
  onBeforeNavigate: () => void
  layout?: ResultsLayout
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
    <article className={`group relative overflow-hidden border-b border-[#e5ebf3] bg-white transition hover:bg-[#fbfdff] ${
      layout === 'split' ? 'mx-0 px-3 py-4 min-[560px]:border-r sm:px-4' : 'mx-0 px-4 py-5 sm:mx-6 sm:px-0'
    }`}>
      <Link href={href} onClick={onBeforeNavigate} aria-label={`Visa annons: ${listing.title}`} className="absolute inset-0 z-10" />
      <div className={`pointer-events-none relative z-20 grid gap-4 ${
        layout === 'split' ? 'grid-cols-1' : 'sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start'
      }`}>
        <div className={`relative overflow-hidden rounded-[8px] bg-[#eef3f8] ${
          layout === 'split' ? 'aspect-[4/3] min-h-[138px]' : 'h-[246px] sm:h-[174px]'
        }`}>
          {listing.imageUrls.length ? (
            <ListingCardImageCarousel
              images={listing.imageUrls}
              title={listing.title}
              href={href}
              onNavigate={onBeforeNavigate}
              sizes={layout === 'split' ? '(max-width: 560px) 100vw, 50vw' : '(max-width: 640px) 100vw, 260px'}
              previousLabel={uiText(locale, 'Previous photo', 'Föregående bild', 'Vorheriges Foto')}
              nextLabel={uiText(locale, 'Next photo', 'Nästa bild', 'Nächstes Foto')}
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
          <div className="pointer-events-auto absolute right-3 top-3 z-30 scale-[.91] origin-top-right">
            <SavedListingButton listingId={listing.id} />
          </div>
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
            <span className={`${layout === 'split' ? 'text-[16px]' : 'text-[18px]'} line-clamp-1 font-semibold leading-tight text-[#101828] underline-offset-2 group-hover:text-[#0866ff] group-hover:underline`}>
              {listing.title}
            </span>
            <MetaSeparatorList items={meta} className="text-[14px] font-medium leading-5 text-[#667085]" />
            <p className="text-[17px] font-semibold leading-6 text-[#101828]">
              {listing.priceLabel}
            </p>
            <p className="line-clamp-1 text-[14px] font-medium leading-5 text-[#101828]">
              {importantInfo.join('   ')}
            </p>
            <p className="line-clamp-1 text-[14px] font-medium leading-5 text-[#475467]">
              {listing.sellerIsTrader
                ? listing.sellerName
                  ? `${uiText(locale, 'Business seller', 'Företagssäljare', 'Gewerblicher Verkäufer')} | ${listing.sellerName}`
                  : uiText(locale, 'Business seller', 'Företagssäljare', 'Gewerblicher Verkäufer')
                : 'Privat'}
            </p>
            <div className="mt-1 flex min-w-0 flex-wrap items-end justify-between gap-3">
              <p className="flex min-w-0 items-center gap-2 text-[14px] font-medium text-[#101828]">
                <MapPin className="h-4 w-4 shrink-0 text-[#0866ff]" />
                <span className="truncate">{location}</span>
              </p>
              {listing.sellerIsTrader && listing.sellerLogoUrl ? (
                  <span className={`${layout === 'split' ? 'hidden' : 'relative hidden h-7 w-28 overflow-hidden rounded-[8px] bg-[#eef3f8] sm:block'}`}>
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
  mobileOverlay = false,
  onCloseMobileMap,
  onOpenFilters,
  onSaveSearch,
  onBeforeListingNavigate,
  saveSearchButtonLabel,
  saveSearchActive,
  saveSearchBusy,
}: {
  listings: VehicleSearchListing[]
  country: string
  locale: PublicLocale
  query: string
  onQueryChange: (value: string) => void
  mobileOverlay?: boolean
  onCloseMobileMap?: () => void
  onOpenFilters: () => void
  onSaveSearch: () => void
  onBeforeListingNavigate: () => void
  saveSearchButtonLabel: string
  saveSearchActive: boolean
  saveSearchBusy: boolean
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<MapLibreMarker[]>([])
  const [mapReady, setMapReady] = useState(false)
  const [mapFailed, setMapFailed] = useState(false)
  const [mapLayer, setMapLayer] = useState<AutorellMapLayer>('standard')
  const [fullscreen, setFullscreen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<VehicleSearchListing | null>(null)
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
        markerElement.addEventListener('click', () => {
          setSelectedListing(listing)
        })
        return new maplibregl.Marker({ element: markerElement })
          .setLngLat(coordinates)
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
  }, [country, mapListings, mapReady])

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-[240] h-screen min-h-screen' : mobileOverlay ? 'relative h-[100dvh] min-h-[100dvh]' : 'relative h-[calc(100vh-62px)] min-h-[520px] lg:h-full lg:min-h-[calc(100vh-62px)]'} bg-[#dce7ed]`}>
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
      {mobileOverlay && !fullscreen ? (
        <>
          <div className="absolute inset-x-0 top-0 z-20 bg-white/96 px-3 pb-3 pt-[calc(.75rem+env(safe-area-inset-top))] shadow-[0_1px_12px_rgba(16,24,40,.14)] backdrop-blur">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCloseMobileMap}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-[#d0d5dd] bg-white text-[#101828] shadow-sm"
                aria-label="Visa lista"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <label className="group relative flex h-[50px] min-w-0 flex-1 items-center justify-start gap-3 rounded-[8px] bg-[#f1f2f4] px-4 text-[#667085] transition-all duration-200 focus-within:ring-1 focus-within:ring-[#101828]">
                <span className="sr-only">Sök</span>
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder=""
                  aria-label="Sök fordon, ort eller kommun"
                  className="vehicle-search-control w-full min-w-0 bg-transparent pr-10 text-[14px] font-normal text-[#101828] outline-none [background:transparent]"
                />
                {query ? null : (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 max-w-[calc(100%-64px)] -translate-y-1/2 truncate whitespace-nowrap text-[14px] font-normal text-[#767676]"
                  >
                    Sök fordon, ort eller kommun
                  </span>
                )}
                <Search className="absolute right-4 top-1/2 h-5 w-5 shrink-0 -translate-y-1/2 text-[#101828]" />
              </label>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenFilters}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-sm font-semibold text-[#101828] shadow-sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Sökfilter
              </button>
              <MapLayerPicker mapLayer={mapLayer} onMapLayerChange={setMapLayer} compact />
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobileMap}
            className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#0866ff] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(8,102,255,.30)]"
          >
            Visa lista
          </button>
        </>
      ) : fullscreen ? (
        <>
          <div className="absolute inset-x-0 top-0 z-20 flex min-h-[64px] items-center gap-2 bg-white/96 px-3 shadow-[0_1px_10px_rgba(16,24,40,.14)] backdrop-blur sm:gap-3 sm:px-4">
            <label className="relative flex h-[50px] min-w-0 flex-1 items-center gap-3 rounded-[8px] bg-[#f1f2f4] px-4 text-[#667085]">
              <BrandLogo compact underline={false} />
              <span className="sr-only">Sök</span>
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Sök på fordon, ort eller kommun"
                aria-label="Sök på fordon, ort eller kommun"
                className="vehicle-search-control min-w-0 flex-1 bg-transparent text-[16px] font-normal text-[#101828] outline-none placeholder:text-[#767676] sm:text-sm"
              />
              <Search className="h-5 w-5 shrink-0 text-[#101828]" />
            </label>
            <button
              type="button"
              onClick={() => {
                setFullscreen(false)
                window.setTimeout(onOpenFilters, 0)
              }}
              className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-sm font-semibold text-[#101828] shadow-sm transition hover:border-[#0866ff]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Sökfilter</span>
            </button>
            <button
              type="button"
              onClick={onSaveSearch}
              disabled={saveSearchBusy}
              className={`hidden h-11 items-center gap-2 rounded-[8px] px-4 text-sm font-semibold text-white shadow-sm transition sm:inline-flex ${
                saveSearchActive ? 'bg-[#0866ff] hover:bg-[#0757da]' : 'bg-[#d1d3d8]'
              }`}
            >
              <Bookmark className="h-4 w-4" />
              {saveSearchButtonLabel}
            </button>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#0866ff] px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0757da]"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Visa lista</span>
            </button>
          </div>
          <div className="absolute right-4 top-[78px] z-20 flex gap-2">
            <MapLayerPicker mapLayer={mapLayer} onMapLayerChange={setMapLayer} />
          </div>
        </>
      ) : (
        <div className="absolute right-4 top-4 z-20 flex gap-2">
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="inline-flex h-12 items-center gap-2 rounded-[8px] bg-[#0866ff] px-4 text-sm font-semibold text-white shadow-lg shadow-[#0866ff]/20 transition hover:bg-[#0757da]"
          >
            <Expand className="h-5 w-5" />
            Fullskärm
          </button>
          <MapLayerPicker mapLayer={mapLayer} onMapLayerChange={setMapLayer} />
        </div>
      )}
      <div className={`${fullscreen ? 'top-[74px]' : mobileOverlay ? 'top-[calc(7.5rem+env(safe-area-inset-top))] hidden sm:block' : 'top-4'} hidden absolute left-4 z-20 rounded-[8px] bg-white/95 px-4 py-3 text-sm font-medium shadow-lg backdrop-blur`}>
        {listings.length.toLocaleString('sv-SE')} fordon i kartvyn
      </div>
      <button className={`${mobileOverlay ? 'bottom-[calc(4.75rem+env(safe-area-inset-bottom))]' : 'bottom-5'} hidden absolute left-1/2 z-20 -translate-x-1/2 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0866ff] shadow-lg`}>
        <SlidersHorizontal className="h-4 w-4" />
        Sök i detta område
      </button>
      {selectedListing ? (
        <MapListingPreview
          listing={selectedListing}
          locale={locale}
          onClose={() => setSelectedListing(null)}
          onBeforeNavigate={onBeforeListingNavigate}
          mobileOverlay={mobileOverlay}
        />
      ) : null}
    </div>
  )
}

function MapListingPreview({
  listing,
  locale,
  onClose,
  onBeforeNavigate,
  mobileOverlay,
}: {
  listing: VehicleSearchListing
  locale: PublicLocale
  onClose: () => void
  onBeforeNavigate: () => void
  mobileOverlay?: boolean
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
  const facts = [
    listing.year,
    listing.mileageKm !== null ? `${listing.mileageKm.toLocaleString('sv-SE')} km` : null,
    listing.fuelType,
    listing.gearbox,
  ].filter(Boolean)

  return (
    <div className={`${mobileOverlay ? 'bottom-[calc(1rem+env(safe-area-inset-bottom))]' : 'bottom-6'} absolute left-1/2 z-30 w-[min(680px,calc(100%-2rem))] -translate-x-1/2 overflow-hidden rounded-[8px] bg-white shadow-[0_18px_50px_rgba(16,24,40,.24)]`}>
      <div className="flex justify-end border-b border-[#edf1f6] px-3 py-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-xs font-semibold text-[#101828] transition hover:bg-[#eef5ff] hover:text-[#0866ff]"
        >
          Stäng
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-4 p-3 sm:grid-cols-[260px_minmax(0,1fr)] sm:p-4">
        <div className="relative block aspect-[4/3] overflow-hidden rounded-[8px] bg-[#eef3f8]">
          {listing.imageUrls.length ? (
            <ListingCardImageCarousel
              images={listing.imageUrls}
              title={listing.title}
              href={href}
              onNavigate={onBeforeNavigate}
              sizes="(max-width: 640px) 100vw, 260px"
              previousLabel={uiText(locale, 'Previous photo', 'Föregående bild', 'Vorheriges Foto')}
              nextLabel={uiText(locale, 'Next photo', 'Nästa bild', 'Nächstes Foto')}
            />
          ) : (
            <div className="grid h-full place-items-center text-[#0866ff]">
              <AutorellCarIcon className="h-12 w-12" />
            </div>
          )}
          <CountryFlag code={listing.country} className="absolute bottom-3 left-3 h-7 w-7 rounded-full" />
        </div>
        <div className="min-w-0 pb-1 sm:py-1">
          <div className="flex items-start justify-between gap-3">
            <Link href={href} onClick={onBeforeNavigate} className="min-w-0">
              <p className="line-clamp-1 text-[17px] font-semibold text-[#101828] hover:text-[#0866ff]">{listing.title}</p>
              <p className="mt-1 line-clamp-1 text-sm font-medium text-[#667085]">{location}</p>
            </Link>
            <div className="shrink-0 scale-[.91] origin-top-right">
              <SavedListingButton listingId={listing.id} />
            </div>
          </div>
          <p className="mt-4 text-[18px] font-semibold text-[#101828]">{listing.priceLabel}</p>
          <MetaSeparatorList items={facts} className="mt-3 text-sm font-medium text-[#475467]" />
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="line-clamp-1 text-sm font-medium text-[#667085]">{listing.sellerIsTrader ? listing.sellerName : 'Privat'}</p>
            {listing.sellerIsTrader && listing.sellerLogoUrl ? (
              <span className="relative hidden h-8 w-28 overflow-hidden rounded-[8px] bg-[#eef3f8] sm:block">
                <Image src={listing.sellerLogoUrl} alt={listing.sellerName} fill sizes="112px" className="object-contain" />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaSeparatorList({
  items,
  className = '',
}: {
  items: Array<string | number | null | undefined>
  className?: string
}) {
  const visibleItems = items.filter((item): item is string | number => item !== null && item !== undefined && item !== '')

  return (
    <p className={`flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap ${className}`}>
      {visibleItems.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
          {index > 0 ? (
            <span aria-hidden="true" className="shrink-0 px-0.5 font-semibold text-[#98a2b3]">
              |
            </span>
          ) : null}
          <span className="min-w-0 truncate">{item}</span>
        </span>
      ))}
    </p>
  )
}

function MapLayerPicker({
  mapLayer,
  onMapLayerChange,
  compact = false,
}: {
  mapLayer: AutorellMapLayer
  onMapLayerChange: (layer: AutorellMapLayer) => void
  compact?: boolean
}) {
  return (
    <div className={`${compact ? 'h-10 border border-[#0866ff] bg-white shadow-sm' : 'h-12 border border-[#0866ff] bg-white shadow-lg shadow-[#0866ff]/15'} inline-flex overflow-hidden rounded-[8px] p-1`}>
      <button
        type="button"
        onClick={() => onMapLayerChange('standard')}
        className={`inline-flex items-center gap-2 rounded-[8px] px-3 text-sm font-semibold transition ${
          mapLayer === 'standard'
            ? 'bg-[#0866ff] text-white'
            : 'bg-white text-[#0866ff] hover:bg-[#eef5ff]'
        }`}
      >
        <Layers className="h-4 w-4" />
        <span>{compact ? 'Karta' : <span className="hidden sm:inline">Karta</span>}</span>
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

type VehicleFilterKey = 'fuel' | 'gearbox' | 'bodyType' | 'condition' | 'year' | 'mileage'

function categoryFilterProfile(category: string): VehicleFilterKey[] {
  if (category === 'caravans') return ['condition', 'bodyType', 'year']
  if (category === 'agriculture' || category === 'construction') {
    return ['bodyType', 'condition', 'fuel', 'gearbox', 'year']
  }
  if (category === 'electric-bikes' || category === 'e-scooters') {
    return ['condition', 'bodyType', 'year', 'mileage']
  }
  if (category === 'motorcycles') {
    return ['condition', 'fuel', 'gearbox', 'bodyType', 'year', 'mileage']
  }
  return ['fuel', 'gearbox', 'bodyType', 'condition', 'year', 'mileage']
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

function getResultLocationName(query: string, listings: VehicleSearchListing[], fallback: string) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return fallback

  const municipalityMatch = listings.find((listing) => {
    const municipality = normalizeSearchText(listing.municipality)
    return municipality && (municipality === normalizedQuery || municipality.includes(normalizedQuery))
  })?.municipality

  if (municipalityMatch) return `${titleCaseLocation(municipalityMatch)} kommun`

  const cityMatch = listings.find((listing) => {
    const city = normalizeSearchText(listing.city)
    return city && (city === normalizedQuery || city.includes(normalizedQuery))
  })?.city

  if (cityMatch) return titleCaseLocation(cityMatch)

  if (normalizedQuery.endsWith(' kommun')) return titleCaseLocation(query.trim())

  return fallback
}

function normalizeSearchText(value: string | null | undefined) {
  return (value || '')
    .trim()
    .toLocaleLowerCase('sv-SE')
    .replace(/\s+/g, ' ')
}

function titleCaseLocation(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) =>
      part
        .split('-')
        .map((piece) => (piece ? piece.charAt(0).toLocaleUpperCase('sv-SE') + piece.slice(1).toLocaleLowerCase('sv-SE') : piece))
        .join('-'),
    )
    .join(' ')
}


