'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { KeyboardEvent, ReactNode } from 'react'
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl'
import {
  ArrowLeft,
  Bookmark,
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
  Star,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BrandLogo from './BrandLogo'
import CountryFlag from './CountryFlag'
import ListingCardImageCarousel from './ListingCardImageCarousel'
import SavedListingButton from './SavedListingButton'
import {
  useVehicleSmartSearchSuggestions,
  VehicleSmartSearchSuggestionPanel,
  type VehicleSmartSearchSuggestion,
} from './VehicleSmartSearchSuggestions'
import {
  AutorellAgricultureIcon,
  AutorellAllCategoriesIcon,
  AutorellBikeIcon,
  AutorellCaravanIcon,
  AutorellCarIcon,
  AutorellConstructionIcon,
  AutorellMotorhomeIcon,
  AutorellMotorbikeIcon,
  AutorellTruckIcon,
  AutorellVanIcon,
} from './AutorellCategoryIcons'
import { getMapStyle, getStandardFallbackTileUrl, type AutorellMapLayer } from '@/lib/map-style'
import { getEuCountryName } from '@/lib/eu-countries'
import { buildListingPath } from '@/lib/listing-url'
import { formatMileageAsMil } from '@/lib/listing-display'
import { marketplaceListingMatchesLocationQuery } from '@/lib/marketplace-locations'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'
import { SAVED_SEARCHES_EVENT } from '@/lib/saved-searches'
import { getVehicleSearchPlaceholder } from '@/lib/vehicle-search-placeholder'
import { fieldsForCategory } from '@/lib/listing-schema'
import { vehicleValueInEnglish } from '@/lib/vehicle-translation'

type SearchMode = 'sale' | 'leasing'
type ResultsLayout = 'single' | 'split'
type ActiveFilterChip = { key: string; label: string; icon?: ReactNode; onRemove: () => void }
type SelectedSearchSuggestion = VehicleSmartSearchSuggestion & {
  chipId: string
  dedupeKey: string
}

let selectedSearchSuggestionSequence = 0

const appStoreHref =
  process.env.NEXT_PUBLIC_APP_STORE_URL || 'https://apps.apple.com/search?term=autorell'
const playStoreHref =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
  'https://play.google.com/store/search?q=autorell&c=apps'

function searchSuggestionDedupeKey(suggestion: VehicleSmartSearchSuggestion) {
  return [
    suggestion.type || 'suggestion',
    suggestion.title.trim().toLowerCase(),
    suggestion.href || '',
  ].join('|')
}

function createSelectedSearchSuggestion(
  suggestion: VehicleSmartSearchSuggestion,
): SelectedSearchSuggestion {
  const dedupeKey = searchSuggestionDedupeKey(suggestion)
  selectedSearchSuggestionSequence += 1
  return {
    ...suggestion,
    title: suggestion.title.trim(),
    chipId: `${dedupeKey}|${selectedSearchSuggestionSequence}`,
    dedupeKey,
  }
}

type SavedVehicleSearch = {
  savedAt: string
  filters: {
    mode: SearchMode
    query: string
    categories: string[]
    markets: string[]
    make: string
    model: string
    region: string
    city: string
    municipality: string
    minPrice: string
    maxPrice: string
    minYear: string
    maxYear: string
    minMileage: string
    maxMileage: string
    minOperatingHours?: string
    maxOperatingHours?: string
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
    technicalFilters?: Record<string, string>
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
  operatingHours: number | null
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
  sellerRatingAverage?: number | null
  sellerRatingCount?: number
  condition: string | null
  color: string | null
  equipment: string | null
  offerType?: 'sale' | 'lease' | 'sale_and_lease' | null
  leaseData?: Record<string, unknown> | null
}

type MarketplaceSearchApiResponse = {
  items: Array<Record<string, unknown>>
  totalCount?: number
  page?: number
  pageSize?: number
  totalPages?: number
  hasNext?: boolean
  facets?: {
    makes?: Array<string | { value: string; count: number }>
    models?: Array<string | { value: string; count: number }>
    fuels?: Array<string | { value: string; count: number }>
    gearboxes?: Array<string | { value: string; count: number }>
    bodyTypes?: Array<string | { value: string; count: number }>
    technical?: Record<string, Array<string | { value: string; count: number }>>
  }
}

const tabs: Array<{ key: SearchMode; label: string; mobileLabel: string; hint: string }> = [
  { key: 'sale', label: 'Fordon till salu', mobileLabel: 'Fordon till salu', hint: 'Privata och företag' },
  { key: 'leasing', label: 'Leasing', mobileLabel: 'Leasing', hint: 'Företagsannonser' },
]

const MARKETPLACE_RETURN_SEARCH_STATE_KEY = 'autorell:marketplace-return-search'
const MARKETPLACE_RETURN_SEARCH_ARMED_KEY = 'autorell:marketplace-return-search-armed'
const MARKETPLACE_PERSISTED_SEARCH_STATE_KEY = 'autorell:marketplace-search-state'

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
  { value: '', label: 'All of Europe' },
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
  label: option.value ? option.label : 'All of Europe',
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
  const normalized = [
    ...new Set(
      rawValues
        .map((value) => String(value || '').trim())
        .filter((value) => categories.some((category) => category.key === value && value !== 'all')),
    ),
  ]
  return normalized.slice(0, 1)
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

function persistedMarketplaceSearchKey(locale: PublicLocale, defaultCountry: string) {
  return `${MARKETPLACE_PERSISTED_SEARCH_STATE_KEY}:${locale}:${defaultCountry || 'EU'}`
}

function readPersistedMarketplaceSearchState(locale: PublicLocale, defaultCountry: string) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(persistedMarketplaceSearchKey(locale, defaultCountry))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { locale?: PublicLocale; defaultCountry?: string; state?: MarketplaceReturnSearchState }
    if (parsed.locale && parsed.locale !== locale) return null
    if (parsed.defaultCountry && parsed.defaultCountry !== defaultCountry) return null
    return parsed.state || null
  } catch {
    return null
  }
}

function writePersistedMarketplaceSearchState(locale: PublicLocale, defaultCountry: string, state: MarketplaceReturnSearchState) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      persistedMarketplaceSearchKey(locale, defaultCountry),
      JSON.stringify({ locale, defaultCountry, state, savedAt: new Date().toISOString() }),
    )
  } catch {
    // localStorage can be unavailable; searching should still work.
  }
}

function clearPersistedMarketplaceSearchState(locale: PublicLocale, defaultCountry: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(persistedMarketplaceSearchKey(locale, defaultCountry))
  } catch {
    // localStorage can be unavailable; reset should still work.
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
  return listing.offerType === 'lease' || listing.offerType === 'sale_and_lease' || (listing.equipment || '').toLowerCase().includes('leasing')
}

function listingEquipmentChips(equipment: string | null | undefined) {
  return Array.from(
    new Set(
      (equipment || '')
        .split(/[,;\n|]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => item.length <= 28),
    ),
  ).slice(0, 2)
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
}

function uiText(locale: PublicLocale, en: string, sv: string, de?: string) {
  if (locale === 'sv') return sv
  if (locale === 'de') return de || en
  return locale === 'en' ? en : translatePublic(locale, en)
}

function buildSearchQueryFromSuggestions(
  suggestions: Array<{ title: string }>,
  input: string,
) {
  return [
    ...suggestions.map((suggestion) => suggestion.title.trim()),
    input.trim(),
  ].filter(Boolean).join(' ')
}

const marketplaceFooterDescriptions: Record<PublicLocale, string> = {
  sv: 'Autorell är en europeisk marknadsplats för fordonsannonser. Köpare kan hitta annonser och säljare kan nå rätt kunder på ett tryggt och tydligt sätt.',
  de: 'Autorell ist ein europäischer Marktplatz für Fahrzeuganzeigen. Käufer finden Anzeigen und Verkäufer erreichen die richtigen Kunden auf sichere und klare Weise.',
  en: 'Autorell is a European marketplace for vehicle listings. Buyers can find listings and sellers can reach the right customers in a safe and clear way.',
  at: 'Autorell ist ein europäischer Marktplatz für Fahrzeuganzeigen. Käufer finden Anzeigen und Verkäufer erreichen die richtigen Kunden auf sichere und klare Weise.',
  be: 'Autorell is een Europese marktplaats voor voertuigadvertenties. Kopers kunnen advertenties vinden en verkopers kunnen de juiste klanten op een veilige en duidelijke manier bereiken.',
  fr: 'Autorell est une place de marché européenne pour les annonces de véhicules. Les acheteurs peuvent trouver des annonces et les vendeurs peuvent atteindre les bons clients de manière sûre et claire.',
  es: 'Autorell es un mercado europeo de anuncios de vehículos. Los compradores pueden encontrar anuncios y los vendedores pueden llegar a los clientes adecuados de forma segura y clara.',
  it: 'Autorell è un marketplace europeo per annunci di veicoli. Gli acquirenti possono trovare annunci e i venditori possono raggiungere i clienti giusti in modo sicuro e chiaro.',
  pl: 'Autorell to europejska platforma ogłoszeń pojazdów. Kupujący mogą znaleźć ogłoszenia, a sprzedający mogą dotrzeć do właściwych klientów w bezpieczny i przejrzysty sposób.',
  nl: 'Autorell is een Europese marktplaats voor voertuigadvertenties. Kopers kunnen advertenties vinden en verkopers kunnen de juiste klanten op een veilige en duidelijke manier bereiken.',
  fi: 'Autorell on eurooppalainen ajoneuvoilmoitusten markkinapaikka. Ostajat voivat löytää ilmoituksia ja myyjät tavoittaa oikeat asiakkaat turvallisella ja selkeällä tavalla.',
  da: 'Autorell er en europæisk markedsplads for køretøjsannoncer. Købere kan finde annoncer, og sælgere kan nå de rette kunder på en sikker og tydelig måde.',
}

function formatRating(value: number, locale: PublicLocale) {
  return value.toLocaleString(locale === 'sv' ? 'sv-SE' : locale, {
    maximumFractionDigits: 1,
  })
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
  initialSearchChips = [],
  initialMake = '',
  initialModel = '',
  initialRegion = '',
  initialCity = '',
  initialMunicipality = '',
  initialMinPrice = '',
  initialMaxPrice = '',
  initialMode = 'sale',
  initialMinYear = '',
  initialMaxYear = '',
  initialMinMileage = '',
  initialMaxMileage = '',
  initialMinOperatingHours = '',
  initialMaxOperatingHours = '',
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
  initialSearchChips?: string[]
  initialMake?: string
  initialModel?: string
  initialRegion?: string
  initialCity?: string
  initialMunicipality?: string
  initialMinPrice?: string
  initialMaxPrice?: string
  initialMode?: SearchMode
  initialMinYear?: string
  initialMaxYear?: string
  initialMinMileage?: string
  initialMaxMileage?: string
  initialMinOperatingHours?: string
  initialMaxOperatingHours?: string
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
  const safeInitialCategory = categories.some((item) => item.key === initialCategory && item.key !== 'all') ? initialCategory : 'cars'
  const normalizedInitialCategories = initialCategories.length ? normalizeSavedCategories(initialCategories) : []
  const safeInitialCategories = normalizedInitialCategories.length ? normalizedInitialCategories : [safeInitialCategory]
  const safeInitialCountry = (defaultCountry || '').toUpperCase()
  const safeAutomaticCountry = (automaticCountry || safeInitialCountry).toUpperCase()
  const safeInitialMarkets = normalizeMarketSelection(
    initialMarkets.length ? initialMarkets : [safeInitialCountry],
    safeAutomaticCountry,
  )
  const initialSearchSuggestions = useMemo(
    () =>
      initialSearchChips
        .map((title) => title.trim())
        .filter(Boolean)
        .map((title) =>
          createSelectedSearchSuggestion({
            href: '#',
            title,
            description: '',
            type: 'place',
          }),
        ),
    [initialSearchChips],
  )
  const initialChipQuery = buildSearchQueryFromSuggestions(initialSearchSuggestions, initialQuery)
  const hasExplicitInitialFilters = Boolean(
    initialMarkets.length ||
      initialCategories.length ||
      safeInitialCategory !== 'all' ||
      initialChipQuery ||
      initialMake ||
      initialModel ||
      initialRegion ||
      initialCity ||
      initialMunicipality ||
      initialMinPrice ||
      initialMaxPrice ||
      initialMode !== 'sale' ||
      initialMinYear ||
      initialMaxYear ||
      initialMinMileage ||
      initialMaxMileage ||
      initialMinOperatingHours ||
      initialMaxOperatingHours ||
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
  const [query, setQuery] = useState(initialChipQuery)
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [debouncedSearchInput, setDebouncedSearchInput] = useState(initialQuery)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(safeInitialCategories)
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(safeInitialMarkets)
  const [marketOverride, setMarketOverride] = useState(!sameMarketSelection(safeInitialMarkets, [safeAutomaticCountry]))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [priceYearOpen, setPriceYearOpen] = useState(true)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [sellerFiltersOpen, setSellerFiltersOpen] = useState(false)
  const [mobileMapOpen, setMobileMapOpen] = useState(false)
  const [mobileDockVisible, setMobileDockVisible] = useState(true)
  const [sortBy, setSortBy] = useState(initialSortBy || 'published')
  const [resultsLayout, setResultsLayout] = useState<ResultsLayout>('single')
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)
  const [minYear, setMinYear] = useState(initialMinYear)
  const [maxYear, setMaxYear] = useState(initialMaxYear)
  const [minMileage, setMinMileage] = useState(initialMinMileage)
  const [maxMileage, setMaxMileage] = useState(initialMaxMileage)
  const [minOperatingHours, setMinOperatingHours] = useState(initialMinOperatingHours)
  const [maxOperatingHours, setMaxOperatingHours] = useState(initialMaxOperatingHours)
  const [make, setMake] = useState(initialMake)
  const [model, setModel] = useState(initialModel)
  const [region, setRegion] = useState(initialRegion)
  const [city, setCity] = useState(initialCity)
  const [municipality, setMunicipality] = useState(initialMunicipality)
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
  const [technicalFilters, setTechnicalFilters] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {}
    return Object.fromEntries(
      Array.from(new URLSearchParams(window.location.search).entries())
        .filter(([key, value]) => key.startsWith('technical_') && value.trim())
        .map(([key, value]) => [key.slice('technical_'.length), value.trim()]),
    )
  })
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [savedSearchMessage, setSavedSearchMessage] = useState('')
  const [savingSearch, setSavingSearch] = useState(false)
  const [searchStateReady, setSearchStateReady] = useState(hasExplicitInitialFilters)
  const [searchFocused, setSearchFocused] = useState(false)
  const [mobileMapSearchFocused, setMobileMapSearchFocused] = useState(false)
  const [selectedSearchSuggestions, setSelectedSearchSuggestions] = useState<SelectedSearchSuggestion[]>(initialSearchSuggestions)
  const [searchListings, setSearchListings] = useState<VehicleSearchListing[]>(listings)
  const [searchFacets, setSearchFacets] = useState<MarketplaceSearchApiResponse['facets']>({})
  const [, setSearchTotalCount] = useState(listings.length)
  const [searchPage, setSearchPage] = useState(1)
  const [searchTotalPages, setSearchTotalPages] = useState(1)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(false)

  const currentSearchState = useMemo<MarketplaceReturnSearchState>(() => ({
    mode,
    query: query.trim(),
    categories: selectedCategories,
    markets: marketOverride ? selectedMarkets : selectedMarkets.length ? selectedMarkets : safeInitialMarkets,
    make,
    model,
    region,
    city,
    municipality,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    minMileage,
    maxMileage,
    minOperatingHours,
    maxOperatingHours,
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
    technicalFilters,
    sortBy,
  }), [bodyType, city, color, condition, equipmentQuery, fuel, gearbox, leasingPossible, make, marketOverride, maxMileage, maxOperatingHours, maxPrice, maxYear, minMileage, minOperatingHours, minPrice, minYear, mode, model, municipality, query, region, safeInitialMarkets, selectedCategories, selectedMarkets, sellerType, sortBy, technicalFilters, verifiedOnly, fourWheelDrive])

  const marketplaceSearchParams = useMemo(() => {
    const params = new URLSearchParams()
    const setParam = (key: string, value: string) => {
      const cleanValue = value.trim()
      if (cleanValue) params.set(key, cleanValue)
    }
    if (mode !== 'sale') params.set('mode', mode)
    setParam('q', debouncedSearchInput)
    if (selectedSearchSuggestions.length) {
      params.set('chips', selectedSearchSuggestions.map((suggestion) => suggestion.title).join(','))
    }
    if (selectedCategories.length) params.set('categories', selectedCategories.join(','))
    if (marketOverride) {
      params.set('markets', selectedMarkets.length ? selectedMarkets.join(',') : 'EU')
    } else if (selectedMarkets.length && !sameMarketSelection(selectedMarkets, [safeAutomaticCountry])) {
      params.set('markets', selectedMarkets.join(','))
    }
    setParam('make', make)
    setParam('model', model)
    setParam('region', region)
    setParam('city', city)
    setParam('municipality', municipality)
    setParam('minPrice', minPrice)
    setParam('maxPrice', maxPrice)
    setParam('minYear', minYear)
    setParam('maxYear', maxYear)
    setParam('minMileage', minMileage)
    setParam('maxMileage', maxMileage)
    setParam('minOperatingHours', minOperatingHours)
    setParam('maxOperatingHours', maxOperatingHours)
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
    Object.entries(technicalFilters).forEach(([key, value]) => setParam(`technical_${key}`, value))
    if (sortBy && sortBy !== 'published') params.set('sort', sortBy)
    return params
  }, [bodyType, city, color, condition, debouncedSearchInput, equipmentQuery, fourWheelDrive, fuel, gearbox, leasingPossible, make, marketOverride, maxMileage, maxOperatingHours, maxPrice, maxYear, minMileage, minOperatingHours, minPrice, minYear, mode, model, municipality, region, safeAutomaticCountry, selectedCategories, selectedMarkets, selectedSearchSuggestions, sellerType, sortBy, technicalFilters, verifiedOnly])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchInput(searchInput.trim().replace(/\s+/g, ' '))
    }, searchInput.trim() ? 700 : 250)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (hasExplicitInitialFilters) {
      const timer = window.setTimeout(() => setSearchStateReady(true), 0)
      return () => window.clearTimeout(timer)
    }
    const restored =
      readMarketplaceReturnSearchState(locale) ||
      readPersistedMarketplaceSearchState(locale, safeAutomaticCountry)
    if (!restored) {
      const timer = window.setTimeout(() => setSearchStateReady(true), 0)
      return () => window.clearTimeout(timer)
    }

    const timer = window.setTimeout(() => {
      setMode(restored.mode === 'leasing' ? 'leasing' : 'sale')
      setSelectedSearchSuggestions([])
      setSearchInput(restored.query || '')
      setDebouncedSearchInput(restored.query || '')
      setQuery(restored.query || '')
      setSelectedCategories(normalizeSavedCategories(restored.categories).length ? normalizeSavedCategories(restored.categories) : ['cars'])
      setSelectedMarkets((restored.markets || []).length ? normalizeMarketSelection(restored.markets || [], safeAutomaticCountry) : [])
      setMarketOverride(true)
      setMinPrice(restored.minPrice || '')
      setMaxPrice(restored.maxPrice || '')
      setMinYear(restored.minYear || '')
      setMaxYear(restored.maxYear || '')
      setMinMileage(restored.minMileage || '')
      setMaxMileage(restored.maxMileage || '')
      setMinOperatingHours(restored.minOperatingHours || '')
      setMaxOperatingHours(restored.maxOperatingHours || '')
      setMake(restored.make || '')
      setModel(restored.model || '')
      setRegion(restored.region || '')
      setCity(restored.city || '')
      setMunicipality(restored.municipality || '')
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
      setTechnicalFilters(restored.technicalFilters || {})
      setSortBy(restored.sortBy || 'published')
      setSearchStateReady(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [hasExplicitInitialFilters, locale, safeAutomaticCountry])

  useEffect(() => {
    if (!searchStateReady) return
    writePersistedMarketplaceSearchState(locale, safeAutomaticCountry, currentSearchState)
  }, [currentSearchState, locale, safeAutomaticCountry, searchStateReady])

  useEffect(() => {
    if (!searchStateReady || typeof window === 'undefined') return
    const timer = window.setTimeout(() => {
      const nextQuery = marketplaceSearchParams.toString()
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
      if (nextUrl !== currentUrl) {
        try {
          window.history.replaceState(window.history.state, '', nextUrl)
        } catch (error) {
          console.warn('[marketplace] skipped URL sync after browser history limit', error)
        }
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [marketplaceSearchParams, searchStateReady])

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchPage(1), 0)
    return () => window.clearTimeout(timer)
  }, [marketplaceSearchParams])

  useEffect(() => {
    if (!filtersOpen) return undefined
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll
    }
  }, [filtersOpen])

  useEffect(() => {
    if (!searchStateReady) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearchLoading(true)
      setSearchError(false)
      const params = new URLSearchParams(marketplaceSearchParams)
      params.set('page', String(searchPage))
      params.set('limit', '48')
      params.set('locale', locale)
      params.set('displayMarket', safeAutomaticCountry || safeInitialCountry || 'EU')

      try {
        const response = await fetch(`/api/marketplace/search-v2?${params.toString()}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Search failed')
        const payload = (await response.json()) as MarketplaceSearchApiResponse
        const nextListings = payload.items.map((item) => mapApiListingToVehicleSearchListing(item, locale))
        setSearchListings((current) => searchPage > 1 ? [...current, ...nextListings] : nextListings)
        setSearchTotalCount(payload.totalCount ?? nextListings.length)
        setSearchTotalPages(payload.totalPages ?? 1)
        setSearchFacets(payload.facets || {})
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setSearchError(true)
        }
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false)
      }
    }, debouncedSearchInput.trim() || equipmentQuery.trim() ? 420 : 120)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [debouncedSearchInput, equipmentQuery, locale, marketplaceSearchParams, safeAutomaticCountry, safeInitialCountry, searchPage, searchStateReady])
  const selectedCategoryItems = selectedCategories
    .map((key) => categories.find((item) => item.key === key))
    .filter((item): item is (typeof categories)[number] => Boolean(item))
  const selectableCategories = categories.filter((item) => item.key !== 'all')
  const activeCategoryItem = selectedCategoryItems[0] || categories.find((item) => item.key === 'cars')!
  const activeCategoryKey = activeCategoryItem.key
  const filterProfile = [
    ...new Set(categoryFilterProfile(activeCategoryKey).map((filter) => filter.key)),
  ]

  const optionListings = useMemo(
    () =>
      searchListings.filter(
        (listing) =>
          (!selectedCategories.length || selectedCategories.includes(listing.category)) &&
          matchesSelectedMarkets(listing.country, selectedMarkets),
      ),
    [searchListings, selectedCategories, selectedMarkets],
  )
  const priceBounds = useMemo(() => {
    const prices = searchListings.map((listing) => listing.priceValue).filter((value) => Number.isFinite(value) && value > 0)
    const max = prices.length ? Math.max(...prices) : 700000
    return { min: 0, max: Math.max(700000, Math.ceil(max / 10000) * 10000) }
  }, [searchListings])
  const mileageBounds = useMemo(() => {
    const mileages = searchListings.map((listing) => listing.mileageKm).filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0)
    const max = mileages.length ? Math.max(...mileages) : 200000
    return { min: 0, max: Math.max(200000, Math.ceil(max / 10000) * 10000) }
  }, [searchListings])

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const queryLocationScopes = selectedMarkets.length ? selectedMarkets : safeInitialMarkets
    const minPriceValue = parseOptionalNumber(minPrice)
    const maxPriceValue = parseOptionalNumber(maxPrice)
    const minYearValue = parseOptionalNumber(minYear)
    const maxYearValue = parseOptionalNumber(maxYear)
    const minMileageValue = parseOptionalNumber(minMileage)
    const maxMileageValue = parseOptionalNumber(maxMileage)
    const minOperatingHoursValue = parseOptionalNumber(minOperatingHours)
    const maxOperatingHoursValue = parseOptionalNumber(maxOperatingHours)
    const matches = searchListings.filter((listing) => {
      if (mode === 'leasing' && !isLeasingListing(listing)) return false
      if (selectedCategories.length && !selectedCategories.includes(listing.category)) return false
      if (!matchesSelectedMarkets(listing.country, selectedMarkets)) return false
      if (make && listing.make !== make) return false
      if (model && listing.model !== model) return false
      if (region && !marketplaceListingMatchesLocationQuery({
        query: region,
        countryCode: listing.country,
        city: listing.city,
        municipality: listing.municipality,
        countryCodes: selectedMarkets.length ? selectedMarkets : safeInitialMarkets,
      })) return false
      if (city && normalizeSearchText(listing.city) !== normalizeSearchText(city)) return false
      if (municipality && normalizeSearchText(listing.municipality) !== normalizeSearchText(municipality)) return false
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
      if (minMileageValue !== null && (listing.mileageKm === null || listing.mileageKm < minMileageValue)) return false
      if (maxMileageValue !== null && (listing.mileageKm === null || listing.mileageKm > maxMileageValue)) return false
      if (minOperatingHoursValue !== null && (listing.operatingHours === null || listing.operatingHours < minOperatingHoursValue)) return false
      if (maxOperatingHoursValue !== null && (listing.operatingHours === null || listing.operatingHours > maxOperatingHoursValue)) return false
      if (!normalizedQuery) return true
      const searchableMatches = [
        listing.title,
        listing.make,
        listing.model,
        listing.year,
        listing.bodyType,
        listing.fuelType,
        listing.gearbox,
        listing.condition,
        listing.color,
        listing.equipment,
        listing.city,
        listing.municipality,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
      return searchableMatches || marketplaceListingMatchesLocationQuery({
        query,
        countryCode: listing.country,
        city: listing.city,
        municipality: listing.municipality,
        countryCodes: queryLocationScopes,
      })
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
  }, [bodyType, city, color, condition, equipmentQuery, fourWheelDrive, fuel, gearbox, leasingPossible, make, maxMileage, maxOperatingHours, maxPrice, maxYear, minMileage, minOperatingHours, minPrice, minYear, mode, model, municipality, query, region, safeInitialMarkets, searchListings, selectedCategories, selectedMarkets, sellerType, sortBy, verifiedOnly])

  const resetFilters = () => {
    clearPersistedMarketplaceSearchState(locale, safeAutomaticCountry)
    setSelectedSearchSuggestions(initialSearchSuggestions)
    setSearchInput(initialQuery)
    setDebouncedSearchInput(initialQuery)
    setQuery(initialChipQuery)
    setSelectedCategories(safeInitialCategories)
    setSelectedMarkets(normalizeMarketSelection([safeAutomaticCountry], safeAutomaticCountry))
    setMarketOverride(false)
    setMinPrice(initialMinPrice)
    setMaxPrice(initialMaxPrice)
    setMinYear(initialMinYear)
    setMaxYear(initialMaxYear)
    setMinMileage(initialMinMileage)
    setMaxMileage(initialMaxMileage)
    setMinOperatingHours(initialMinOperatingHours)
    setMaxOperatingHours(initialMaxOperatingHours)
    setMake(initialMake)
    setModel(initialModel)
    setRegion(initialRegion)
    setCity(initialCity)
    setMunicipality(initialMunicipality)
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
    setTechnicalFilters({})
    setSortBy(initialSortBy || 'published')
    setSavedSearchMessage('')
  }

  function clearUnsupportedCategoryFilters(nextCategories: string[]) {
    const supported = new Set(nextCategories.flatMap((category) => categoryFilterProfile(category).map((filter) => filter.key)))
    const clearAllTechnical = nextCategories.length === 0
    if (clearAllTechnical || !supported.has('mileage')) setMaxMileage('')
    if (clearAllTechnical || !supported.has('operatingHours')) setMaxOperatingHours('')
    if (clearAllTechnical || !supported.has('fuel')) setFuel('')
    if (clearAllTechnical || !supported.has('gearbox')) setGearbox('')
    if (clearAllTechnical || !supported.has('bodyType')) setBodyType('')
    if (clearAllTechnical || !supported.has('color')) setColor('')
    if (clearAllTechnical || !supported.has('fourWheelDrive')) setFourWheelDrive(false)
    if (clearAllTechnical || !supported.has('leasingPossible')) setLeasingPossible(false)
    if (clearAllTechnical || !supported.has('equipment')) setEquipmentQuery('')
  }

  function toggleCategory(nextCategory: string) {
    if (nextCategory === 'all') return
    if (nextCategory === activeCategoryKey) {
      return
    }
    setMake('')
    setModel('')
    setMaxMileage('')
    setMaxOperatingHours('')
    setFuel('')
    setGearbox('')
    setBodyType('')
    setColor('')
    setFourWheelDrive(false)
    setLeasingPossible(false)
    setEquipmentQuery('')
    setTechnicalFilters({})
    const next = [nextCategory]
    clearUnsupportedCategoryFilters(next)
    setSelectedCategories(next)
    setMoreFiltersOpen(false)
  }

  function selectMarket(value: string) {
    setMake('')
    setModel('')
    setRegion('')
    setCity('')
    setMunicipality('')
    setSelectedMarkets(value ? [value] : [])
    setMarketOverride(true)
  }

  async function saveCurrentSearch() {
    if (savingSearch) return
    setSavingSearch(true)
    setSavedSearchMessage('')

    const params = marketplaceSearchParams
    const href = `/marketplace${params.size ? `?${params.toString()}` : ''}`
    const filterSnapshot = currentSearchState
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
      const payload = (await response.json()) as { duplicate?: boolean }
      window.dispatchEvent(new CustomEvent(SAVED_SEARCHES_EVENT))
      setSavedSearchMessage(
        payload.duplicate
          ? uiText(locale, 'Search already saved', 'Sökningen är redan sparad', 'Suche bereits gespeichert')
          : uiText(locale, 'Search saved', 'Sökningen är sparad', 'Suche gespeichert'),
      )
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
        region,
        city,
        municipality,
        minPrice,
        maxPrice,
        minYear,
        maxYear,
        minMileage,
        maxMileage,
        minOperatingHours,
        maxOperatingHours,
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
    writeMarketplaceReturnSearchState(locale, currentSearchState)
  }

  const toggleCompare = (listingId: string) => {
    setCompareIds((current) =>
      current.includes(listingId)
        ? current.filter((id) => id !== listingId)
        : [...current, listingId].slice(-4),
    )
  }

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
  const resultCountSummary = formatSearchResultCountSummary({
    locale,
    count: visibleCount,
    make,
    model,
    minYear,
    maxYear,
    selectedCategoryItems,
    marketSummary,
    resultLocationName,
    city,
    municipality,
    region,
  })
  const smartSearchMarketCode = selectedMarketCodes.length === 1 ? selectedMarketCodes[0] : safeAutomaticCountry
  const smartSearch = useVehicleSmartSearchSuggestions({
    query: searchInput,
    locale,
    marketCode: smartSearchMarketCode,
    active: searchFocused,
  })
  const searchPlaceholder = getVehicleSearchPlaceholder(locale)
  const mobileMapSmartSearch = useVehicleSmartSearchSuggestions({
    query: searchInput,
    locale,
    marketCode: smartSearchMarketCode,
    active: mobileMapOpen && mobileMapSearchFocused,
  })

  function selectMarketplaceSuggestion(suggestion: VehicleSmartSearchSuggestion) {
    if (suggestion.type === 'listing') return true

    const nextSuggestion = createSelectedSearchSuggestion(suggestion)
    setSelectedSearchSuggestions((current) => {
      const nextSuggestions = current.some((item) => item.dedupeKey === nextSuggestion.dedupeKey)
        ? current
        : [...current, nextSuggestion]
      setQuery(buildSearchQueryFromSuggestions(nextSuggestions, ''))
      return nextSuggestions
    })
    setSearchInput('')
    try {
      const url = new URL(suggestion.href, window.location.origin)
      const params = url.searchParams
      if (params.has('make')) setMake(params.get('make') || '')
      if (params.has('model')) setModel(params.get('model') || '')
      if (params.has('fuel') || params.has('fuelType')) setFuel(params.get('fuel') || params.get('fuelType') || '')
      if (params.has('minYear')) setMinYear(params.get('minYear') || '')
      if (params.has('maxYear')) setMaxYear(params.get('maxYear') || '')
      if (params.has('minMileage')) setMinMileage(params.get('minMileage') || '')
      if (params.has('maxMileage')) setMaxMileage(params.get('maxMileage') || '')
      if (params.has('minOperatingHours')) setMinOperatingHours(params.get('minOperatingHours') || '')
      if (params.has('maxOperatingHours')) setMaxOperatingHours(params.get('maxOperatingHours') || '')
      if (params.has('region') || params.has('county')) setRegion(params.get('region') || params.get('county') || '')
      if (params.has('city')) setCity(params.get('city') || '')
      if (params.has('municipality')) setMunicipality(params.get('municipality') || '')
      const nextCategories = params.get('categories')
      if (nextCategories !== null) setSelectedCategories(normalizeSavedCategories(nextCategories.split(',')).length ? normalizeSavedCategories(nextCategories.split(',')) : ['cars'])
      const nextMarkets = params.get('markets')
      if (nextMarkets !== null) {
        setSelectedMarkets(normalizeMarketSelection(nextMarkets.split(','), safeAutomaticCountry))
        setMarketOverride(true)
      }
      setSearchFocused(true)
      setMobileMapSearchFocused(true)
      window.setTimeout(() => {
        setSearchFocused(true)
        setMobileMapSearchFocused(true)
      }, 150)
    } catch {
      setSearchFocused(false)
      setMobileMapSearchFocused(false)
    }
    return false
  }

  const priceYearSummary = [
    minPrice || maxPrice ? uiText(locale, 'Price', 'Pris', 'Preis') : '',
    minYear || maxYear ? uiText(locale, 'Model year', 'Årsmodell', 'Baujahr') : '',
  ].filter(Boolean).join(' · ') || uiText(locale, 'Price and model year', 'Pris och årsmodell', 'Preis und Baujahr')

  const sellerSummary = [
    condition ? uiText(locale, 'Condition', 'Skick', 'Zustand') : '',
    sellerType !== 'all' ? uiText(locale, 'Seller type', 'Säljartyp', 'Verkäufertyp') : '',
    verifiedOnly ? uiText(locale, 'Verified', 'Verifierade', 'Verifiziert') : '',
  ].filter(Boolean).join(' · ') || uiText(locale, 'Condition, seller and verified listings', 'Skick, säljartyp och verifierade annonser', 'Zustand, Verkäufer und verifizierte Anzeigen')

  function categoryScopedOptions(categoryKey: string, field: 'fuelType' | 'gearbox' | 'bodyType' | 'condition' | 'color') {
    const facetKey = field === 'fuelType' ? 'fuels' : field === 'gearbox' ? 'gearboxes' : field === 'bodyType' ? 'bodyTypes' : null
    const dynamicValues = facetKey
      ? (searchFacets?.[facetKey] || []).map((item) => typeof item === 'string'
        ? { value: item, label: item }
        : { value: item.value, label: `${item.value} (${item.count})` })
      : []
    if (dynamicValues.length) return dynamicValues
    const values = optionListings
      .filter((listing) => !categoryKey || listing.category === categoryKey)
      .map((listing) => listing[field])
      .filter((value): value is string => Boolean(value))
    return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'sv-SE'))
  }

  function technicalFacetLabel(key: string) {
    const definition = fieldsForCategory(activeCategoryKey as Parameters<typeof fieldsForCategory>[0], { bodyType }).find((field) => field.id === key)
    const label = definition?.label || key.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase())
    const normalized = label.includes('\u00c3') ? decodeURIComponent(escape(label)) : label
    const english = vehicleValueInEnglish(label) || vehicleValueInEnglish(normalized) || normalized
    return translatePublic(locale, english)
  }

  function renderDynamicTechnicalFacets() {
    const knownKeys = new Set(['fuelType', 'gearbox', 'bodyType', 'condition', 'color', 'equipment'])
    const entries = Object.entries(searchFacets?.technical || {})
      .filter(([key, options]) => !knownKeys.has(key) && options.length > 0)
      .filter(([key]) => fieldsForCategory(activeCategoryKey as Parameters<typeof fieldsForCategory>[0], { bodyType }).some((field) => field.id === key))
    if (!entries.length) return null

    return (
      <div className="grid gap-3 sm:grid-cols-2 sm:col-span-2">
        {entries.map(([key, options]) => (
          <FilterSelect
            key={key}
            label={technicalFacetLabel(key)}
            value={technicalFilters[key] || ''}
            onChange={(value) => setTechnicalFilters((current) => ({ ...current, ...(value ? { [key]: value } : (() => { const next = { ...current }; delete next[key]; return next })()) }))}
            options={options.map((item) => typeof item === 'string' ? { value: item, label: item } : { value: item.value, label: `${item.value} (${item.count})` })}
          />
        ))}
      </div>
    )
  }

  function activeTechnicalFilterCount(filters: CategoryFilterDefinition[]) {
    return filters.reduce((count, filter) => count + (isTechnicalFilterActive(filter.key) ? 1 : 0), 0)
  }

  function isTechnicalFilterActive(key: VehicleFilterKey) {
    if (key === 'mileage') return Boolean(minMileage || maxMileage)
    if (key === 'operatingHours') return Boolean(minOperatingHours || maxOperatingHours)
    if (key === 'fuel') return Boolean(fuel)
    if (key === 'gearbox') return Boolean(gearbox)
    if (key === 'bodyType') return Boolean(bodyType)
    if (key === 'condition') return Boolean(condition)
    if (key === 'color') return Boolean(color)
    if (key === 'fourWheelDrive') return fourWheelDrive
    if (key === 'leasingPossible') return leasingPossible
    if (key === 'equipment') return Boolean(equipmentQuery.trim())
    return false
  }

  function renderTechnicalFilterControl(filter: CategoryFilterDefinition, categoryKey = '') {
    if (filter.key === 'mileage') {
      return (
        <RangeFilter
          key={filter.key}
          title={filterLabel(filter, locale)}
          minValue={minMileage}
          maxValue={maxMileage}
          onMinChange={setMinMileage}
          onMaxChange={setMaxMileage}
          minLimit={mileageBounds.min}
          maxLimit={mileageBounds.max}
          unit={filter.unit || 'km'}
          step={1000}
        />
      )
    }
    if (filter.key === 'operatingHours') {
      return (
        <RangeFilter
          key={filter.key}
          title={filterLabel(filter, locale)}
          minValue={minOperatingHours}
          maxValue={maxOperatingHours}
          onMinChange={setMinOperatingHours}
          onMaxChange={setMaxOperatingHours}
          minLimit={0}
          maxLimit={20000}
          unit={filter.unit || 'h'}
          step={100}
        />
      )
    }
    if (filter.key === 'fuel') {
      return <FilterSelect key={filter.key} label={filterLabel(filter, locale)} value={fuel} onChange={setFuel} options={categoryScopedOptions(categoryKey, 'fuelType')} />
    }
    if (filter.key === 'gearbox') {
      return <FilterSelect key={filter.key} label={filterLabel(filter, locale)} value={gearbox} onChange={setGearbox} options={categoryScopedOptions(categoryKey, 'gearbox')} />
    }
    if (filter.key === 'bodyType') {
      return <FilterSelect key={filter.key} label={filterLabel(filter, locale)} value={bodyType} onChange={setBodyType} options={categoryScopedOptions(categoryKey, 'bodyType')} />
    }
    if (filter.key === 'condition') {
      return <FilterSelect key={filter.key} label={filterLabel(filter, locale)} value={condition} onChange={setCondition} options={categoryScopedOptions(categoryKey, 'condition')} />
    }
    if (filter.key === 'color') {
      return <FilterSelect key={filter.key} label={filterLabel(filter, locale)} value={color} onChange={setColor} options={categoryScopedOptions(categoryKey, 'color')} />
    }
    if (filter.key === 'fourWheelDrive') {
      return <ToggleFilter key={filter.key} label={filterLabel(filter, locale)} checked={fourWheelDrive} onChange={setFourWheelDrive} />
    }
    if (filter.key === 'leasingPossible') {
      return <ToggleFilter key={filter.key} label={filterLabel(filter, locale)} checked={leasingPossible} onChange={setLeasingPossible} />
    }
    if (filter.key === 'equipment') {
      return (
        <label key={filter.key} className="block sm:col-span-2">
          <span className="mb-1.5 block text-[13px] font-semibold text-[#101828]">{filterLabel(filter, locale)}</span>
          <input
            value={equipmentQuery}
            onChange={(event) => setEquipmentQuery(event.target.value)}
            placeholder={uiText(locale, 'E.g. tow bar, navigation, four-wheel drive', 'Ex. dragkrok, navigation, fyrhjulsdrift', 'z.B. Anhängerkupplung, Navigation, Allrad')}
            className="h-11 w-full rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-[12px] font-normal outline-none transition placeholder:text-[#98a2b3] focus:border-[#0866ff]"
          />
        </label>
      )
    }
    return null
  }

  function renderCategoryFilterSections() {
    const profile = categoryFilterProfile(activeCategoryKey)
    const primaryKeys = new Set(categoryPrimaryFilterKeys(activeCategoryKey))
    const primaryFilters = profile.filter((filter) => primaryKeys.has(filter.key))
    const moreFilters = profile.filter((filter) => !primaryKeys.has(filter.key))
    const moreCount = activeTechnicalFilterCount(moreFilters)

    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextFilterInput label={uiText(locale, 'Make', 'Märke', 'Marke')} value={make} onChange={(value) => {
            setMake(value)
            setModel('')
          }} />
          <TextFilterInput label={uiText(locale, 'Model', 'Modell', 'Modell')} value={model} onChange={setModel} />
          <div className="grid gap-3 sm:col-span-2">
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
              title={uiText(locale, 'Model year', 'Årsmodell', 'Baujahr')}
              minValue={minYear}
              maxValue={maxYear}
              onMinChange={setMinYear}
              onMaxChange={setMaxYear}
              minLimit={1950}
              maxLimit={new Date().getFullYear() + 1}
              step={1}
              startLabel={uiText(locale, 'Before 1950', 'Före 1950', 'Vor 1950')}
            />
          </div>
          {primaryFilters.map((filter) => renderTechnicalFilterControl(filter, activeCategoryKey))}
        </div>
        {moreFilters.length ? (
          <CollapsibleFilterSection
            title={uiText(locale, 'Show more filters', 'Visa fler filter', 'Weitere Filter anzeigen')}
            summary={moreCount ? `${moreCount} ${uiText(locale, 'active filters', 'aktiva filter', 'aktive Filter')}` : uiText(locale, 'More details for this vehicle type', 'Fler detaljer för vald fordonstyp', 'Weitere Details für diese Fahrzeugart')}
            open={moreFiltersOpen}
            onToggle={() => setMoreFiltersOpen((open) => !open)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {moreFilters.map((filter) => renderTechnicalFilterControl(filter, activeCategoryKey))}
              {renderDynamicTechnicalFacets()}
            </div>
          </CollapsibleFilterSection>
        ) : null}
      </div>
    )
  }

  function renderQuickFilterSelectors(compact = false) {
    const marketValue = selectedMarketCodes.length === 1 ? selectedMarketCodes[0] : ''

    return (
      <div className={`grid min-w-0 gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <label className="relative min-w-0">
          <span className="sr-only">{uiText(locale, 'Category', 'Kategori', 'Kategorie')}</span>
          <select
            value={activeCategoryKey}
            onChange={(event) => toggleCategory(event.target.value)}
            className="h-11 w-full min-w-0 appearance-none rounded-full border border-[#d9e2ef] bg-white py-0 pl-4 pr-9 text-[14px] font-medium text-[#101828] outline-none shadow-[0_1px_2px_rgba(16,24,40,.04)] transition hover:border-[#b8c7dc] hover:bg-[#fbfdff] focus:border-[#0866ff] focus:ring-2 focus:ring-[#dbeafe]"
          >
            {selectableCategories.map((item) => (
              <option key={item.key} value={item.key}>
                {categoryText(item, locale)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
        </label>
        <label className="relative min-w-0">
          <span className="sr-only">{uiText(locale, 'Market', 'Marknad', 'Markt')}</span>
          <select
            value={marketValue}
            onChange={(event) => selectMarket(event.target.value)}
            className="h-11 w-full min-w-0 appearance-none rounded-full border border-[#d9e2ef] bg-white py-0 pl-4 pr-9 text-[14px] font-medium text-[#101828] outline-none shadow-[0_1px_2px_rgba(16,24,40,.04)] transition hover:border-[#b8c7dc] hover:bg-[#fbfdff] focus:border-[#0866ff] focus:ring-2 focus:ring-[#dbeafe]"
          >
            {countryFilterOptions.map((option) => (
              <option key={option.value || 'eu'} value={option.value}>
                {option.value ? getEuCountryName(option.value, locale) : uiText(locale, 'All markets', 'Alla marknader', 'Alle Märkte')}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
        </label>
      </div>
    )
  }

  const activeFilterCandidates: Array<ActiveFilterChip | null> = [
    make ? { key: 'make', label: make, onRemove: () => {
      setMake('')
      setModel('')
    } } : null,
    model ? { key: 'model', label: model, onRemove: () => setModel('') } : null,
    region ? { key: 'region', label: region, onRemove: () => setRegion('') } : null,
    city ? { key: 'city', label: city, onRemove: () => setCity('') } : null,
    municipality ? { key: 'municipality', label: `${municipality} kommun`, onRemove: () => setMunicipality('') } : null,
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
    minMileage || maxMileage ? { key: 'mileage', label: `${uiText(locale, 'Mileage', 'Miltal', 'Kilometerstand')} ${formatMileageRangeLabel(minMileage, maxMileage, locale)}`, onRemove: () => {
      setMinMileage('')
      setMaxMileage('')
    } } : null,
    minOperatingHours || maxOperatingHours ? { key: 'operatingHours', label: `${uiText(locale, 'Operating hours', 'Drifttimmar', 'Betriebsstunden')} ${formatNumberRangeLabel(minOperatingHours, maxOperatingHours, 'h', locale)}`, onRemove: () => {
      setMinOperatingHours('')
      setMaxOperatingHours('')
    } } : null,
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
            <Link href={localizePublicHref(locale, '/account/listings/new')} className="transition hover:text-[#0866ff]">
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
          <div className={`relative min-h-0 min-w-0 w-screen max-w-[100vw] overflow-x-hidden border-r border-[#eceff4] bg-white lg:w-full lg:max-w-full ${filtersOpen ? 'overflow-y-hidden' : 'overflow-y-auto'}`}>
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
              <div className="min-w-0 max-w-full overflow-visible">
                <div className="w-full max-w-full overflow-visible border-b border-[#eceff4] px-4 py-3 sm:px-6">
                <div className="relative">
                <div className="group relative flex min-h-[50px] items-center justify-start gap-2 rounded-[8px] bg-[#f1f2f4] px-3 py-2 pr-11 text-[#667085] transition-all duration-200 focus-within:ring-1 focus-within:ring-[#101828]">
                  <span className="sr-only">{uiText(locale, 'Search', 'Sök', 'Suche')}</span>
                  {selectedSearchSuggestions.map((suggestion) => (
                    <span
                      key={suggestion.chipId}
                      className="inline-flex max-w-[calc(50%-4px)] shrink-0 items-center gap-1 rounded-[5px] bg-white px-2 py-1 text-[12px] font-medium leading-5 text-[#101828] shadow-[0_1px_2px_rgba(16,24,40,.10)] ring-1 ring-[#d0d5dd] sm:max-w-[calc(33.333%-6px)]"
                    >
                      <span className="truncate">{suggestion.title}</span>
                      <button
                        type="button"
                        onPointerDown={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                        }}
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          setSelectedSearchSuggestions((current) => {
                            const next = current.filter((item) => item.chipId !== suggestion.chipId)
                            setQuery(buildSearchQueryFromSuggestions(next, searchInput))
                            return next
                          })
                        }}
                        className="-mr-1 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[#475467] transition hover:bg-[#eef2f7] hover:text-[#101828]"
                        aria-label={uiText(locale, 'Remove selected search suggestion', 'Ta bort valt sökförslag', 'Ausgewählten Suchvorschlag entfernen')}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={searchInput}
                    onChange={(event) => {
                      const nextInput = event.target.value
                      setSearchInput(nextInput)
                      setQuery(buildSearchQueryFromSuggestions(selectedSearchSuggestions, nextInput))
                    }}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                    placeholder=""
                    aria-label={searchPlaceholder}
                    className="vehicle-search-control h-7 min-w-0 basis-full bg-transparent text-[14px] font-normal text-[#101828] outline-none [background:transparent]"
                  />
                  {searchInput || selectedSearchSuggestions.length ? null : (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 max-w-[calc(100%-64px)] -translate-y-1/2 truncate whitespace-nowrap text-[14px] font-normal text-[#767676]"
                    >
                      {searchPlaceholder}
                    </span>
                  )}
                  <Search className="absolute right-4 top-1/2 h-5 w-5 shrink-0 -translate-y-1/2 text-[#101828]" />
                </div>
                <VehicleSmartSearchSuggestionPanel
                  query={searchInput}
                  suggestions={smartSearch.suggestions}
                  loading={smartSearch.loading}
                  searched={smartSearch.searched}
                  locale={locale}
                  onSelect={selectMarketplaceSuggestion}
                  active={searchFocused}
                />
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((open) => !open)}
                    style={{ fontWeight: 500 }}
                    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border px-3 text-[14px] font-[500] shadow-sm transition sm:min-h-10 sm:gap-2 sm:px-4 ${
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
                    style={{ fontWeight: 500 }}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-[14px] font-[500] text-[#101828] shadow-sm transition hover:border-[#0866ff] sm:min-h-10 sm:gap-2 sm:px-4 lg:hidden"
                  >
                    <Map className="h-5 w-5" />
                    <span className="sm:hidden">{uiText(locale, 'Map', 'Karta', 'Karte')}</span>
                    <span className="hidden sm:inline">{uiText(locale, 'Show map', 'Visa karta', 'Karte anzeigen')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={saveCurrentSearch}
                    disabled={savingSearch}
                    style={{ fontWeight: 500 }}
                    className={`col-span-2 inline-flex min-h-10 items-center justify-center gap-3 rounded-[8px] px-5 text-[14px] font-[500] text-white transition lg:col-span-1 ${
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

                  <div
                    aria-hidden={!filtersOpen}
                    className={`fixed inset-x-0 bottom-0 z-[180] h-[min(88vh,820px)] overflow-hidden rounded-t-[18px] border-t border-[#d9e6ff] bg-white shadow-[0_-18px_48px_rgba(16,24,40,.18)] transition-[transform,opacity] duration-300 ease-out lg:absolute lg:inset-0 lg:z-50 lg:h-auto lg:rounded-none lg:border-t-0 lg:shadow-none ${
                      filtersOpen
                        ? 'translate-y-0 opacity-100'
                        : 'pointer-events-none translate-y-full opacity-0 lg:translate-y-6'
                    }`}
                  >
                    <div data-filter-profile={filterProfile.join(' ')} className="flex h-full min-h-0 flex-col bg-white">
                    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e9f5] bg-white px-4 pb-3 pt-6 sm:px-6 sm:py-4 relative">
                      <div className="flex min-w-0 items-center gap-3">
                        <SlidersHorizontal className="h-5 w-5 shrink-0 text-[#101828]" />
                        <p className="min-w-0 text-[19px] font-semibold text-[#101828]">{uiText(locale, 'Search filters', 'Sökfilter', 'Suchfilter')}</p>
                        {activeFilters.length ? (
                          <span className="grid h-7 min-w-7 place-items-center rounded-full bg-[#101828] px-2 text-sm font-semibold text-white">
                            {activeFilters.length}
                          </span>
                        ) : null}
                      </div>
                      <div className="order-3 w-full min-w-0 pr-12 sm:order-none sm:w-[min(420px,48%)] sm:pr-0">
                        {renderQuickFilterSelectors()}
                      </div>
                      <button
                        type="button"
                        onClick={() => setFiltersOpen(false)}
                        className="absolute bottom-3 right-4 grid h-10 w-10 place-items-center rounded-full bg-white text-[#101828] ring-1 ring-[#d0d5dd] transition hover:text-[#0866ff] sm:hidden"
                        aria-label="Stäng filter"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFiltersOpen(false)}
                        className="hidden h-10 w-10 place-items-center rounded-full bg-white text-[#101828] ring-1 ring-[#d0d5dd] transition hover:text-[#0866ff] sm:grid"
                        aria-label="Stäng filter"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="border-b border-[#edf1f6] px-4 py-2.5 sm:px-6">
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
                         <p className="hidden text-sm font-normal text-[#667085] sm:block">{uiText(locale, 'Narrow by vehicle, market and equipment.', 'Avgränsa på fordon, marknad och utrustning.', 'Nach Fahrzeug, Markt und Ausstattung eingrenzen.')}</p>
                      )}
                    </div>
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:space-y-4 sm:px-6">
                    {renderCategoryFilterSections()}
                    <div className="hidden">
                      <CollapsibleFilterSection
                        title={uiText(locale, 'Price and model year', 'Pris och årsmodell', 'Preis und Baujahr')}
                        summary={priceYearSummary}
                        open={priceYearOpen}
                        onToggle={() => setPriceYearOpen((open) => !open)}
                      >
                        <div className="grid gap-3">
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
                            title={uiText(locale, 'Model year', 'Årsmodell', 'Baujahr')}
                            minValue={minYear}
                            maxValue={maxYear}
                            onMinChange={setMinYear}
                            onMaxChange={setMaxYear}
                            minLimit={1950}
                            maxLimit={new Date().getFullYear() + 1}
                            step={1}
                            startLabel={uiText(locale, 'Before 1950', 'Före 1950', 'Vor 1950')}
                          />
                        </div>
                      </CollapsibleFilterSection>
                    </div>
                    <CollapsibleFilterSection
                      title={uiText(locale, 'Condition, seller type and verified listings', 'Skick, säljartyp och verifierade annonser', 'Zustand, Verkäufer und verifizierte Anzeigen')}
                      summary={sellerSummary}
                      open={sellerFiltersOpen}
                      onToggle={() => setSellerFiltersOpen((open) => !open)}
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FilterSelect label={uiText(locale, 'Condition', 'Skick', 'Zustand')} value={condition} onChange={setCondition} options={categoryScopedOptions(activeCategoryKey, 'condition')} />
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
                      </div>
                    </CollapsibleFilterSection>
                  </div>
                      <div className="grid grid-cols-[minmax(110px,160px)_1fr] gap-3 border-t border-[#edf1f6] bg-white px-4 py-3 shadow-[0_-10px_30px_rgba(16,24,40,.08)] sm:px-7 sm:py-4">
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
              </div>

            <div className="px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="min-h-6 text-sm font-medium leading-6">
                  {searchLoading && searchPage === 1 ? (
                    <span className="inline-block h-4 w-[min(320px,78vw)] animate-pulse rounded bg-[#e8eef6]" />
                  ) : searchError ? (
                    <span>{uiText(locale, 'Could not update search count', 'Kunde inte uppdatera antal', 'Anzahl konnte nicht aktualisiert werden')}</span>
                  ) : (
                    resultCountSummary
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
                    <p className="text-xl font-semibold text-[#101828]">
                      {uiText(locale, 'No listings match your search', 'Inga annonser matchar din sökning', 'Keine Anzeigen passen zu Ihrer Suche')}
                    </p>
                    <p className="mt-3 max-w-xl text-base leading-7 text-[#667085]">
                      {uiText(locale, '0 listings', '0 annonser', '0 Anzeigen')}
                    </p>
                  </div>
                </div>
              )}
              {filteredListings.length > 0 && searchPage < searchTotalPages ? (
                <div className="border-t border-[#eceff4] px-5 py-5 text-center sm:px-6">
                  <button
                    type="button"
                    onClick={() => setSearchPage((page) => page + 1)}
                    disabled={searchLoading}
                    className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#d0d5dd] bg-white px-5 text-sm font-semibold text-[#101828] shadow-sm transition hover:border-[#0866ff] disabled:cursor-wait disabled:opacity-60"
                  >
                    {searchLoading
                      ? uiText(locale, 'Loading...', 'Laddar...', 'Wird geladen...')
                      : uiText(locale, 'Show more listings', 'Visa fler annonser', 'Mehr Anzeigen zeigen')}
                  </button>
                </div>
              ) : null}
              <VehicleSearchFooter locale={locale} />
            </div>
              </div>
            </div>
          </div>

          {!mobileMapOpen ? (
            <button
              type="button"
              onClick={() => setMobileMapOpen(true)}
              style={{ fontWeight: 500 }}
              className={`${mobileDockVisible ? 'bottom-[calc(4.25rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]'} fixed left-1/2 z-[80] inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#0866ff] px-5 py-3 text-sm font-[500] text-white shadow-[0_14px_34px_rgba(8,102,255,.30)] transition-[bottom,transform] duration-200 active:scale-[.98] lg:hidden`}
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
              searchPlaceholder={searchPlaceholder}
              query={query}
              onQueryChange={(value) => {
                setSearchInput(value)
                setQuery(buildSearchQueryFromSuggestions(selectedSearchSuggestions, value))
              }}
              searchInput={searchInput}
              selectedSearchSuggestions={selectedSearchSuggestions}
              onRemoveSearchSuggestion={(suggestion) => {
                setSelectedSearchSuggestions((current) => {
                  const next = current.filter((item) => item.chipId !== suggestion.chipId)
                  setQuery(buildSearchQueryFromSuggestions(next, searchInput))
                  return next
                })
              }}
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
              smartSearchSuggestions={mobileMapSmartSearch.suggestions}
              smartSearchLoading={mobileMapSmartSearch.loading}
              smartSearchSearched={mobileMapSmartSearch.searched}
              onSearchFocusChange={setMobileMapSearchFocused}
              onSmartSearchSelect={selectMarketplaceSuggestion}
            />
            {mobileMapOpen && filtersOpen ? (
              <div className="absolute inset-x-0 bottom-0 top-[calc(7.25rem+env(safe-area-inset-top))] z-30 overflow-hidden rounded-t-[8px] border-t border-[#d9e6ff] bg-white shadow-[0_-18px_42px_rgba(16,24,40,.18)] lg:hidden">
                <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1f6] bg-white px-4 pb-3 pt-6 relative">
                  <div>
                    <p className="text-[15px] font-semibold text-[#101828]">Sökfilter</p>
                    <p className="mt-0.5 text-xs font-medium text-[#667085]">Filtren uppdaterar kartan direkt.</p>
                  </div>
                  <div className="w-full min-w-0 pr-12">{renderQuickFilterSelectors()}</div>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="absolute bottom-3 right-4 grid h-10 w-10 place-items-center rounded-full bg-white text-[#101828] ring-1 ring-[#d0d5dd]"
                    aria-label="Stäng filter"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="h-[calc(100%-156px)] space-y-7 overflow-y-auto px-4 py-5">
                  {renderCategoryFilterSections()}
                  <div className="hidden">
                    <CollapsibleFilterSection
                      title={uiText(locale, 'Price and model year', 'Pris och årsmodell', 'Preis und Baujahr')}
                      summary={priceYearSummary}
                      open={priceYearOpen}
                      onToggle={() => setPriceYearOpen((open) => !open)}
                    >
                      <div className="grid gap-3">
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
                          title={uiText(locale, 'Model year', 'Årsmodell', 'Baujahr')}
                          minValue={minYear}
                          maxValue={maxYear}
                          onMinChange={setMinYear}
                          onMaxChange={setMaxYear}
                          minLimit={1950}
                          maxLimit={new Date().getFullYear() + 1}
                          step={1}
                          startLabel={uiText(locale, 'Before 1950', 'Före 1950', 'Vor 1950')}
                        />
                      </div>
                    </CollapsibleFilterSection>
                  </div>
                  <CollapsibleFilterSection
                    title={uiText(locale, 'Condition, seller type and verified listings', 'Skick, säljartyp och verifierade annonser', 'Zustand, Verkäufer und verifizierte Anzeigen')}
                    summary={sellerSummary}
                    open={sellerFiltersOpen}
                    onToggle={() => setSellerFiltersOpen((open) => !open)}
                  >
                    <div className="grid gap-3">
                      <FilterSelect label={uiText(locale, 'Condition', 'Skick', 'Zustand')} value={condition} onChange={setCondition} options={categoryScopedOptions(activeCategoryKey, 'condition')} />
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
                    </div>
                  </CollapsibleFilterSection>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3 border-t border-[#edf1f6] bg-white px-4 py-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-11 rounded-[8px] bg-[#f2f4f7] text-sm font-semibold text-[#0866ff]"
                  >
                    {uiText(locale, 'Clear', 'Rensa', 'Löschen')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="h-11 rounded-[8px] bg-[#0866ff] text-sm font-semibold text-white"
                  >
                    {uiText(locale, 'Show map', 'Visa karta', 'Karte anzeigen')}
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

function CollapsibleFilterSection({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string
  summary?: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section className="border-b border-[#edf1f6] pb-3 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 rounded-[8px] bg-white px-0 py-0.5 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block text-[14px] font-semibold text-[#101828]">{title}</span>
          {summary ? <span className="mt-0.5 block text-xs font-normal text-[#667085]">{summary}</span> : null}
        </span>
        <span className={`grid h-8 w-8 shrink-0 place-items-center text-[#667085] transition ${open ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </section>
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
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#eef5ff] px-3 text-[12px] font-normal text-[#0866ff] transition hover:bg-[#dceaff]"
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
      className={`flex h-11 items-center justify-between rounded-[8px] border px-3 text-left text-[12px] font-normal transition ${
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
      <span className="mb-1.5 hidden text-[13px] font-semibold text-[#101828] sm:block">{label}</span>
      <span className="flex h-11 items-center rounded-[8px] border border-[#d0d5dd] bg-white px-3 focus-within:border-[#0866ff]">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="numeric"
          className="min-w-0 flex-1 bg-transparent text-[12px] font-normal outline-none"
        />
        {suffix ? <span className="ml-2 text-xs font-normal text-[#667085]">{suffix}</span> : null}
      </span>
    </label>
  )
}

function TextFilterInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-[#101828]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        className="h-11 w-full rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-[12px] font-normal outline-none transition placeholder:text-[#98a2b3] focus:border-[#0866ff]"
      />
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
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeHandle, setActiveHandle] = useState<'min' | 'max' | null>(null)
  const parsedMin = parseOptionalNumber(minValue)
  const parsedMax = parseOptionalNumber(maxValue)
  const safeMinLimit = Math.min(minLimit, maxLimit)
  const safeMaxLimit = Math.max(minLimit, maxLimit)
  const minHandleValue = clampNumber(parsedMin ?? safeMinLimit, safeMinLimit, safeMaxLimit)
  const maxHandleValue = clampNumber(parsedMax ?? safeMaxLimit, safeMinLimit, safeMaxLimit)
  const lowerValue = Math.min(minHandleValue, maxHandleValue)
  const upperValue = Math.max(minHandleValue, maxHandleValue)
  const rangeSpan = Math.max(safeMaxLimit - safeMinLimit, 1)
  const lowerPercent = ((lowerValue - safeMinLimit) / rangeSpan) * 100
  const upperPercent = ((upperValue - safeMinLimit) / rangeSpan) * 100
  const trackBackground = `linear-gradient(to right, #e8eef6 0%, #e8eef6 ${lowerPercent}%, #0866ff ${lowerPercent}%, #0866ff ${upperPercent}%, #e8eef6 ${upperPercent}%, #e8eef6 100%)`

  const normalizeMinChange = useCallback((nextValue: string) => {
    const nextNumber = clampNumber(Number(nextValue), safeMinLimit, upperValue)
    onMinChange(nextNumber <= safeMinLimit ? '' : String(nextNumber))
  }, [onMinChange, safeMinLimit, upperValue])

  const normalizeMaxChange = useCallback((nextValue: string) => {
    const nextNumber = clampNumber(Number(nextValue), lowerValue, safeMaxLimit)
    onMaxChange(nextNumber >= safeMaxLimit ? '' : String(nextNumber))
  }, [lowerValue, onMaxChange, safeMaxLimit])

  const valueFromClientX = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width <= 0) return safeMinLimit
    const ratio = clampNumber((clientX - rect.left) / rect.width, 0, 1)
    const rawValue = safeMinLimit + ratio * (safeMaxLimit - safeMinLimit)
    return snapToStep(rawValue, step, safeMinLimit, safeMaxLimit)
  }, [safeMaxLimit, safeMinLimit, step])

  const updateHandleFromClientX = useCallback((handle: 'min' | 'max', clientX: number) => {
    const nextValue = valueFromClientX(clientX)
    if (handle === 'min') {
      normalizeMinChange(String(nextValue))
    } else {
      normalizeMaxChange(String(nextValue))
    }
  }, [normalizeMaxChange, normalizeMinChange, valueFromClientX])

  useEffect(() => {
    if (!activeHandle) return
    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault()
      updateHandleFromClientX(activeHandle, event.clientX)
    }
    const handlePointerUp = () => setActiveHandle(null)
    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [activeHandle, lowerValue, upperValue, safeMinLimit, safeMaxLimit, step, updateHandleFromClientX])

  return (
    <section className="border-b border-[#edf1f6] pb-4 last:border-b-0 sm:col-span-2">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[#101828]">{title}</h3>
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
      <div
        ref={trackRef}
        className="relative h-9 touch-none"
        onPointerDown={(event) => {
          const nextValue = valueFromClientX(event.clientX)
          const nextHandle = Math.abs(nextValue - lowerValue) <= Math.abs(nextValue - upperValue) ? 'min' : 'max'
          setActiveHandle(nextHandle)
          updateHandleFromClientX(nextHandle, event.clientX)
        }}
      >
        <div className="absolute left-0 right-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full" style={{ background: trackBackground }} />
        <button
          type="button"
          className="absolute top-1/2 z-20 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-0 bg-[#0866ff] shadow-[0_2px_7px_rgba(8,102,255,.20)] outline-none transition focus-visible:ring-[3px] focus-visible:ring-[#dbeafe]"
          style={{ left: `${lowerPercent}%` }}
          aria-label={`${title} min`}
          aria-valuemin={safeMinLimit}
          aria-valuemax={upperValue}
          aria-valuenow={lowerValue}
          role="slider"
          onPointerDown={(event) => {
            event.stopPropagation()
            setActiveHandle('min')
          }}
          onKeyDown={(event) => handleRangeHandleKeyDown(event, lowerValue, step, safeMinLimit, upperValue, normalizeMinChange)}
        />
        <button
          type="button"
          className="absolute top-1/2 z-30 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-0 bg-[#0866ff] shadow-[0_2px_7px_rgba(8,102,255,.20)] outline-none transition focus-visible:ring-[3px] focus-visible:ring-[#dbeafe]"
          style={{ left: `${upperPercent}%` }}
          aria-label={`${title} max`}
          aria-valuemin={lowerValue}
          aria-valuemax={safeMaxLimit}
          aria-valuenow={upperValue}
          role="slider"
          onPointerDown={(event) => {
            event.stopPropagation()
            setActiveHandle('max')
          }}
          onKeyDown={(event) => handleRangeHandleKeyDown(event, upperValue, step, lowerValue, safeMaxLimit, normalizeMaxChange)}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[13px] font-semibold text-[#101828]">
        <span>{!minValue && startLabel ? startLabel : formatFilterNumber(lowerValue)}</span>
        <span>{formatFilterNumber(upperValue)}{unit ? ` ${unit}` : ''}{!maxValue ? '+' : ''}</span>
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
      <span className="mb-1.5 block text-[13px] font-semibold text-[#101828]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-[8px] border border-[#d0d5dd] bg-white px-3 pr-9 text-[12px] font-normal outline-none transition focus:border-[#0866ff]"
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
  const termsHref = localizePublicHref(locale, '/terms')
  const columns = [
    {
      title: uiText(locale, 'Services', 'Tjänster', 'Dienste'),
      links: [
        [uiText(locale, 'All vehicles', 'Alla fordon', 'Alle Fahrzeuge'), '/marketplace'],
        [uiText(locale, 'Cars', 'Bilar', 'Autos'), '/marketplace/cars'],
        [uiText(locale, 'Vans', 'Transportbilar', 'Transporter'), '/marketplace/vans'],
      ],
    },
    {
      title: uiText(locale, 'Sell vehicle', 'Sälj fordon', 'Fahrzeug verkaufen'),
      links: [
        [uiText(locale, 'Create listing', 'Skapa annons', 'Anzeige erstellen'), '/account/listings/new'],
        [uiText(locale, 'For businesses', 'Företag', 'Für Unternehmen'), '/business'],
        [uiText(locale, 'Pricing', 'Priser', 'Preise'), '/pricing'],
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
      <div className="mt-8 grid gap-7 border-t border-[#dfe5ee] pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <div className="inline-flex w-[112px] flex-col items-center">
            <BrandLogo compact underline={false} />
            <span className="mt-1 block text-center text-[8px] font-semibold uppercase leading-none tracking-[0.26em] text-[#101828]">
              Marketplace
            </span>
          </div>
          <p className="mt-4 max-w-xl text-[13px] leading-6 text-[#475467]">
            {marketplaceFooterDescriptions[locale]}
          </p>
        </div>
        <div className="flex flex-col gap-5 lg:items-end">
          <MarketplaceAppBadges locale={locale} />
          <MarketplaceSocialLinks />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 border-t border-[#eef2f6] pt-5 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between">
        <p className="text-[12px] text-[#667085]">© 2026 Autorell</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-semibold text-[#475467]">
          <Link href={termsHref} className="hover:text-[#0866ff]">
            {uiText(locale, 'Terms', 'Villkor', 'Nutzungsbedingungen')}
          </Link>
          <Link href={`${termsHref}#purchase-terms`} className="hover:text-[#0866ff]">
            {uiText(locale, 'Purchase terms', 'Köpvillkor', 'Kaufbedingungen')}
          </Link>
          <Link href={localizePublicHref(locale, '/privacy')} className="hover:text-[#0866ff]">
            {uiText(locale, 'Privacy Policy', 'Integritet', 'Datenschutz')}
          </Link>
          <Link href={localizePublicHref(locale, '/cookies')} className="hover:text-[#0866ff]">
            {uiText(locale, 'Cookie policy', 'Cookiepolicy', 'Cookie-Richtlinie')}
          </Link>
          <Link href={localizePublicHref(locale, '/refund-policy')} className="hover:text-[#0866ff]">
            {uiText(locale, 'Refund policy', 'Återbetalning', 'Erstattung')}
          </Link>
        </nav>
      </div>
    </footer>
  )
}

function MarketplaceAppBadges({ locale }: { locale: PublicLocale }) {
  return (
    <div className="grid gap-2.5">
      <p className="text-right text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0866ff] max-lg:text-left">
        {uiText(locale, 'Download Autorell', 'Ladda ner Autorell', 'Autorell herunterladen')}
      </p>
      <div className="flex flex-wrap items-center gap-2.5">
        <MarketplaceStoreBadge href={appStoreHref} src="/app-store-badge.svg" alt="Download on the App Store" width={120} height={36} />
        <MarketplaceStoreBadge href={playStoreHref} src="/google-play-badge.svg" alt="Get it on Google Play" width={135} height={40} />
      </div>
    </div>
  )
}

function MarketplaceStoreBadge({
  href,
  src,
  alt,
  width,
  height,
}: {
  href: string
  src: string
  alt: string
  width: number
  height: number
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center transition hover:-translate-y-0.5 hover:opacity-85"
      aria-label={alt}
    >
      <Image src={src} alt={alt} width={width} height={height} className="block h-full w-auto" />
    </Link>
  )
}

function MarketplaceSocialLinks() {
  const links = [
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/autorell',
      path: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.762 0 2.077.149 2.612.298v3.325a15.39 15.39 0 0 0-1.55-.075c-1.969 0-2.731.745-2.731 2.683v1.327h3.922l-.674 3.667H13.29v7.98H9.101Z',
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/autorell',
      path: 'M7.8 2h8.4A5.806 5.806 0 0 1 22 7.8v8.4a5.806 5.806 0 0 1-5.8 5.8H7.8A5.806 5.806 0 0 1 2 16.2V7.8A5.806 5.806 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7.25A4.75 4.75 0 1 1 12 16.75 4.75 4.75 0 0 1 12 7.25Zm0 2A2.75 2.75 0 1 0 12 14.75 2.75 2.75 0 0 0 12 9.25Z',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/autorell',
      path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.554V9h3.565v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z',
    },
  ]

  return (
    <nav className="flex items-center gap-4 lg:justify-end" aria-label="Social media">
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          aria-label={link.label}
          className="text-[#101828] transition hover:-translate-y-0.5 hover:text-[#0866ff]"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[22px] w-[22px] fill-current">
            <path d={link.path} />
          </svg>
        </Link>
      ))}
    </nav>
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
  const href = buildListingPath({
    id: listing.id,
    title: listing.title,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    city: listing.city,
    country_code: listing.country,
  }, locale)
  const location = Array.from(new Set([listing.city, listing.municipality, getEuCountryName(listing.country, locale)].filter(Boolean)))
    .join(', ')
  const categoryLabel = categoryText(
    categories.find((item) => item.key === listing.category) || categories[0],
    locale,
  )
  const subtitle = [categoryLabel, location].filter(Boolean).join(' · ')
  const equipmentChips = listingEquipmentChips(listing.equipment)
  const sellerTypeLabel = listing.sellerIsTrader
    ? uiText(locale, 'Business seller', 'Företagssäljare', 'Gewerblicher Verkäufer')
    : uiText(locale, 'Private seller', 'Privat säljare', 'Privatverkäufer')
  const countryLabel = getEuCountryName(listing.country, locale)
  const meta = [
    listing.year,
    listing.mileageKm !== null ? formatMileageAsMil(listing.mileageKm, locale) : null,
    listing.fuelType,
    listing.gearbox,
  ].filter(Boolean)
  const sellerTrustLabel = uiText(locale, 'Verified', 'Verifierad', 'Verifiziert')

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
            <span className="absolute left-3 top-3 rounded-[8px] bg-[#0866ff] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              {sellerTrustLabel}
            </span>
          ) : null}
          <div className="pointer-events-auto absolute right-3 top-3 z-30 scale-[.91] origin-top-right">
            <SavedListingButton listingId={listing.id} />
          </div>
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
            <p className="line-clamp-1 text-[14px] font-light leading-5 text-[#667085]">
              {subtitle}
            </p>
            <p className="text-[17px] font-semibold leading-6 text-[#101828]">
              {listing.priceLabel}
            </p>
            <MetaSeparatorList items={meta} className="text-[14px] font-light leading-5 text-[#101828]" />
            <p className="hidden">
              {listing.sellerIsTrader
                ? listing.sellerName
                  ? `${uiText(locale, 'Business seller', 'Företagssäljare', 'Gewerblicher Verkäufer')} | ${listing.sellerName}`
                  : uiText(locale, 'Business seller', 'Företagssäljare', 'Gewerblicher Verkäufer')
                : uiText(locale, 'Private seller', 'Privat säljare', 'Privatverkäufer')}
            </p>
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {equipmentChips.map((item) => (
                <span key={item} className="max-w-[150px] truncate rounded-[6px] bg-[#f2f4f7] px-2 py-1 text-[12px] font-medium leading-4 text-[#344054]">
                  {item}
                </span>
              ))}
              <span className="rounded-[6px] bg-[#f2f4f7] px-2 py-1 text-[12px] font-medium leading-4 text-[#344054]">
                {sellerTypeLabel}
              </span>
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-[6px] bg-[#f2f4f7] px-2 py-1 text-[12px] font-medium leading-4 text-[#344054]">
                <CountryFlag code={listing.country || 'eu'} className="h-3.5 w-3.5 shrink-0 rounded-full shadow-sm ring-1 ring-black/5" />
                <span className="truncate">{countryLabel}</span>
              </span>
            </div>
            {listing.sellerRatingAverage && listing.sellerRatingCount ? (
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475467]">
                <Star className="h-3.5 w-3.5 text-[#0866ff]" fill="currentColor" />
                {formatRating(listing.sellerRatingAverage, locale)} ({listing.sellerRatingCount})
              </p>
            ) : null}
            <div className="mt-1 flex min-w-0 flex-wrap items-end justify-between gap-3">
              <p className="hidden">
                <CountryFlag code={listing.country || 'eu'} className="h-4 w-4 shrink-0 rounded-full shadow-sm ring-1 ring-black/5" />
                <span className="truncate">{location}</span>
              </p>
              {listing.sellerIsTrader && listing.sellerLogoUrl ? (
                  <span className={`${layout === 'split' ? 'hidden' : 'relative hidden h-8 w-32 overflow-hidden rounded-[8px] bg-[#eef3f8] sm:block'}`}>
                  <Image src={listing.sellerLogoUrl} alt={listing.sellerName} fill sizes="128px" className="object-contain" />
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
  searchPlaceholder,
  query,
  onQueryChange,
  searchInput,
  selectedSearchSuggestions,
  onRemoveSearchSuggestion,
  mobileOverlay = false,
  onCloseMobileMap,
  onOpenFilters,
  onSaveSearch,
  onBeforeListingNavigate,
  saveSearchButtonLabel,
  saveSearchActive,
  saveSearchBusy,
  smartSearchSuggestions,
  smartSearchLoading,
  smartSearchSearched,
  onSearchFocusChange,
  onSmartSearchSelect,
}: {
  listings: VehicleSearchListing[]
  country: string
  locale: PublicLocale
  searchPlaceholder: string
  query: string
  onQueryChange: (value: string) => void
  searchInput: string
  selectedSearchSuggestions: SelectedSearchSuggestion[]
  onRemoveSearchSuggestion: (suggestion: SelectedSearchSuggestion) => void
  mobileOverlay?: boolean
  onCloseMobileMap?: () => void
  onOpenFilters: () => void
  onSaveSearch: () => void
  onBeforeListingNavigate: () => void
  saveSearchButtonLabel: string
  saveSearchActive: boolean
  saveSearchBusy: boolean
  smartSearchSuggestions: VehicleSmartSearchSuggestion[]
  smartSearchLoading: boolean
  smartSearchSearched: boolean
  onSearchFocusChange: (focused: boolean) => void
  onSmartSearchSelect: (suggestion: VehicleSmartSearchSuggestion) => void | boolean
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
        const markerElement = createAutorellMapMarker(listing, selectedListing?.id === listing.id)
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
  }, [country, mapListings, mapReady, selectedListing?.id])

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
              <div className="relative min-w-0 flex-1">
              <div className="group relative flex min-h-[50px] min-w-0 flex-1 items-center justify-start gap-2 rounded-[8px] bg-[#f1f2f4] px-3 py-2 pr-11 text-[#667085] transition-all duration-200 focus-within:ring-1 focus-within:ring-[#101828]">
                <span className="sr-only">Sök</span>
                {selectedSearchSuggestions.map((suggestion) => (
                  <span
                    key={suggestion.chipId}
                    className="inline-flex max-w-[calc(50%-4px)] shrink-0 items-center gap-1 rounded-[5px] bg-white px-2 py-1 text-[12px] font-medium leading-5 text-[#101828] shadow-[0_1px_2px_rgba(16,24,40,.10)] ring-1 ring-[#d0d5dd] sm:max-w-[calc(33.333%-6px)]"
                  >
                    <span className="truncate">{suggestion.title}</span>
                    <button
                      type="button"
                      onPointerDown={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        onRemoveSearchSuggestion(suggestion)
                      }}
                      className="-mr-1 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[#475467] transition hover:bg-[#eef2f7] hover:text-[#101828]"
                      aria-label="Ta bort valt sökförslag"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                <input
                  value={searchInput}
                  onChange={(event) => onQueryChange(event.target.value)}
                  onFocus={() => onSearchFocusChange(true)}
                  onBlur={() => window.setTimeout(() => onSearchFocusChange(false), 120)}
                  placeholder=""
                  aria-label={searchPlaceholder}
                  className="vehicle-search-control h-7 min-w-0 basis-full bg-transparent text-[14px] font-normal text-[#101828] outline-none [background:transparent]"
                />
                {searchInput || selectedSearchSuggestions.length ? null : (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 max-w-[calc(100%-64px)] -translate-y-1/2 truncate whitespace-nowrap text-[14px] font-normal text-[#767676]"
                  >
                    {searchPlaceholder}
                  </span>
                )}
                <Search className="absolute right-4 top-1/2 h-5 w-5 shrink-0 -translate-y-1/2 text-[#101828]" />
              </div>
              <VehicleSmartSearchSuggestionPanel
                query={searchInput}
                suggestions={smartSearchSuggestions}
                loading={smartSearchLoading}
                searched={smartSearchSearched}
                locale={locale}
                onSelect={onSmartSearchSelect}
                active={mobileOverlay}
                className="left-0 right-0"
              />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenFilters}
                style={{ fontWeight: 500 }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-[14px] font-[500] text-[#101828] shadow-sm"
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
              <span className="sr-only">{uiText(locale, 'Search', 'Sök', 'Suche')}</span>
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
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
              style={{ fontWeight: 500 }}
              className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-[14px] font-[500] text-[#101828] shadow-sm transition hover:border-[#0866ff]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Sökfilter</span>
            </button>
            <button
              type="button"
              onClick={onSaveSearch}
              disabled={saveSearchBusy}
              style={{ fontWeight: 500 }}
              className={`hidden h-11 items-center gap-2 rounded-[8px] px-4 text-[14px] font-[500] text-white shadow-sm transition sm:inline-flex ${
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
            className="inline-flex h-10 min-w-[112px] items-center justify-center gap-1.5 rounded-[8px] bg-[#0866ff] px-3 text-[13px] font-semibold text-white shadow-lg shadow-[#0866ff]/20 transition hover:bg-[#0757da]"
          >
            <Expand className="h-4 w-4" />
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
  const href = buildListingPath({
    id: listing.id,
    title: listing.title,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    city: listing.city,
    country_code: listing.country,
  }, locale)
  const location = [listing.city || listing.municipality, getEuCountryName(listing.country, locale)]
    .filter(Boolean)
    .join(', ')
  const facts = [
    listing.year,
    listing.mileageKm !== null ? formatMileageAsMil(listing.mileageKm, locale) : null,
    listing.fuelType,
    listing.gearbox,
  ].filter(Boolean)
  const sellerTrustLabel = uiText(locale, 'Verified', 'Verifierad', 'Verifiziert')

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
          {listing.sellerTrust === 'verified' ? (
            <span className="absolute left-3 top-3 rounded-[8px] bg-[#0866ff] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              {sellerTrustLabel}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 pb-1 sm:py-1">
          <div className="flex items-start justify-between gap-3">
            <Link href={href} onClick={onBeforeNavigate} className="min-w-0">
              <p className="line-clamp-1 text-[17px] font-semibold text-[#101828] hover:text-[#0866ff]">{listing.title}</p>
              <p className="mt-1 flex min-w-0 items-center gap-2 text-sm font-medium text-[#667085]">
                <CountryFlag code={listing.country || 'eu'} className="h-4 w-4 shrink-0 rounded-full shadow-sm ring-1 ring-black/5" />
                <span className="truncate">{location}</span>
              </p>
            </Link>
            <div className="shrink-0 scale-[.91] origin-top-right">
              <SavedListingButton listingId={listing.id} />
            </div>
          </div>
          <p className="mt-4 text-[18px] font-semibold text-[#101828]">{listing.priceLabel}</p>
          <MetaSeparatorList items={facts} className="mt-3 text-sm font-medium text-[#475467]" />
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-medium text-[#667085]">{listing.sellerIsTrader ? listing.sellerName : uiText(locale, 'Private seller', 'Privat säljare', 'Privatverkäufer')}</p>
              {listing.sellerRatingAverage && listing.sellerRatingCount ? (
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#475467]">
                  <Star className="h-3.5 w-3.5 text-[#0866ff]" fill="currentColor" />
                  {formatRating(listing.sellerRatingAverage, locale)} ({listing.sellerRatingCount})
                </p>
              ) : null}
            </div>
            {listing.sellerIsTrader && listing.sellerLogoUrl ? (
              <span className="relative hidden h-8 w-32 overflow-hidden rounded-[8px] bg-[#eef3f8] sm:block">
                <Image src={listing.sellerLogoUrl} alt={listing.sellerName} fill sizes="128px" className="object-contain" />
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
    <div className={`${compact ? 'h-10 w-full min-w-0 border border-[#0866ff] bg-white shadow-sm' : 'h-10 border border-[#0866ff] bg-white shadow-lg shadow-[#0866ff]/15'} inline-flex overflow-hidden rounded-[8px] p-1`}>
      <button
        type="button"
        onClick={() => onMapLayerChange('standard')}
        style={{ fontWeight: 500 }}
        className={`inline-flex ${compact ? 'min-w-0 flex-1 px-2' : 'min-w-[112px] px-2.5'} items-center justify-center gap-1.5 rounded-[7px] text-[13px] font-[500] transition ${
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
        className={`inline-flex ${compact ? 'min-w-0 flex-1 px-2' : 'min-w-[112px] px-2.5'} items-center justify-center rounded-[7px] text-[13px] font-semibold transition ${
          mapLayer === 'satellite'
            ? 'bg-[#0866ff] text-white'
            : 'bg-white text-[#0866ff] hover:bg-[#eef5ff]'
        }`}
      >
        <span className="truncate">Satellit</span>
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
          : getStandardFallbackTileUrl(zoom, x, y),
      )
    }
  }

  return tiles
}

function createAutorellMapMarker(listing: VehicleSearchListing, active: boolean) {
  const leasing = isLeasingListing(listing)
  const baseColorClass = leasing ? 'bg-[#16a34a] group-hover:bg-[#15803d]' : 'bg-[#0866ff] group-hover:bg-[#0757da]'
  const pointColorClass = leasing ? 'bg-[#16a34a] group-hover:bg-[#15803d]' : 'bg-[#0866ff] group-hover:bg-[#0757da]'
  const markerElement = document.createElement('button')
  markerElement.type = 'button'
  markerElement.setAttribute('aria-label', listing.title)
  markerElement.className = [
    'group relative grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-[#0866ff]/30',
  ].filter(Boolean).join(' ')

  const dot = document.createElement('span')
  dot.className = [
    'relative z-10 block h-5 w-5 rounded-full border-2 border-white shadow-[0_8px_22px_rgba(16,24,40,.25)] transition-[background-color,box-shadow] duration-200 group-hover:shadow-[0_14px_34px_rgba(16,24,40,.28)]',
    baseColorClass,
    active ? 'bg-[#101828] shadow-[0_18px_40px_rgba(16,24,40,.34)]' : '',
  ].filter(Boolean).join(' ')
  markerElement.appendChild(dot)

  const point = document.createElement('span')
  point.className = [
    'absolute left-1/2 top-[31px] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-white transition-colors duration-200',
    pointColorClass,
    active ? 'bg-[#101828]' : '',
  ].filter(Boolean).join(' ')
  markerElement.appendChild(point)

  return markerElement
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
  if (
    typeof listing.longitude === 'number' &&
    typeof listing.latitude === 'number' &&
    !isGenericCountryCoordinate(listing.latitude, listing.longitude, listing.country)
  ) {
    return [listing.longitude, listing.latitude]
  }
  const city = cityCenters[normalizeSearchMapLocationName(listing.city || listing.municipality || '')]
  if (city) return city
  const base = countryCenters[listing.country] || countryCenters[country] || countryCenters.SE
  const ring = (index % 18) / 18
  const radius = 0.7 + (index % 5) * 0.28
  return [
    base[0] + Math.cos(ring * Math.PI * 2) * radius,
    base[1] + Math.sin(ring * Math.PI * 2) * radius * 0.55,
  ]
}

function isGenericCountryCoordinate(latitude: number, longitude: number, countryCode: string) {
  const country = countryCenters[countryCode.toUpperCase()]
  return Boolean(
    country &&
      Math.abs(latitude - country[1]) < 0.000001 &&
      Math.abs(longitude - country[0]) < 0.000001,
  )
}

const cityCenters: Record<string, [number, number]> = {
  barcelona: [2.177073, 41.3825802],
}

function normalizeSearchMapLocationName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

type VehicleFilterKey = 'mileage' | 'operatingHours' | 'fuel' | 'gearbox' | 'bodyType' | 'condition' | 'color' | 'fourWheelDrive' | 'leasingPossible' | 'equipment'

type CategoryFilterDefinition = {
  key: VehicleFilterKey
  type: 'range' | 'select' | 'toggle' | 'text'
  label: {
    en: string
    sv: string
    de: string
  }
  apiParam: string
  order: number
  unit?: string
}

const categoryFilterDefinitions: Record<string, CategoryFilterDefinition[]> = {
  cars: [
    { key: 'mileage', type: 'range', label: { en: 'Mileage', sv: 'Miltal', de: 'Kilometerstand' }, apiParam: 'maxMileage', order: 10, unit: 'km' },
    { key: 'fuel', type: 'select', label: { en: 'Fuel', sv: 'Drivmedel', de: 'Kraftstoff' }, apiParam: 'fuel', order: 20 },
    { key: 'gearbox', type: 'select', label: { en: 'Gearbox', sv: 'Växellåda', de: 'Getriebe' }, apiParam: 'gearbox', order: 30 },
    { key: 'bodyType', type: 'select', label: { en: 'Body type', sv: 'Kaross', de: 'Karosserie' }, apiParam: 'bodyType', order: 40 },
    { key: 'fourWheelDrive', type: 'toggle', label: { en: 'Four-wheel drive', sv: 'Fyrhjulsdrift', de: 'Allrad' }, apiParam: 'fourWheelDrive', order: 50 },
    { key: 'leasingPossible', type: 'toggle', label: { en: 'Leasing possible', sv: 'Leasing möjlig', de: 'Leasing möglich' }, apiParam: 'leasingPossible', order: 60 },
    { key: 'color', type: 'select', label: { en: 'Color', sv: 'Färg', de: 'Farbe' }, apiParam: 'color', order: 70 },
    { key: 'equipment', type: 'text', label: { en: 'Equipment', sv: 'Utrustning', de: 'Ausstattung' }, apiParam: 'equipment', order: 80 },
  ],
  vans: [
    { key: 'mileage', type: 'range', label: { en: 'Mileage', sv: 'Miltal', de: 'Kilometerstand' }, apiParam: 'maxMileage', order: 10, unit: 'km' },
    { key: 'fuel', type: 'select', label: { en: 'Fuel', sv: 'Drivmedel', de: 'Kraftstoff' }, apiParam: 'fuel', order: 20 },
    { key: 'gearbox', type: 'select', label: { en: 'Gearbox', sv: 'Växellåda', de: 'Getriebe' }, apiParam: 'gearbox', order: 30 },
    { key: 'bodyType', type: 'select', label: { en: 'Van type', sv: 'Transportbilstyp', de: 'Transportertyp' }, apiParam: 'bodyType', order: 40 },
    { key: 'fourWheelDrive', type: 'toggle', label: { en: 'Four-wheel drive', sv: 'Fyrhjulsdrift', de: 'Allrad' }, apiParam: 'fourWheelDrive', order: 50 },
    { key: 'leasingPossible', type: 'toggle', label: { en: 'Leasing possible', sv: 'Leasing möjlig', de: 'Leasing möglich' }, apiParam: 'leasingPossible', order: 60 },
    { key: 'color', type: 'select', label: { en: 'Color', sv: 'Färg', de: 'Farbe' }, apiParam: 'color', order: 70 },
    { key: 'equipment', type: 'text', label: { en: 'Cargo equipment', sv: 'Lastutrustning', de: 'Ladeausstattung' }, apiParam: 'equipment', order: 80 },
  ],
  motorcycles: [
    { key: 'mileage', type: 'range', label: { en: 'Mileage', sv: 'Miltal', de: 'Kilometerstand' }, apiParam: 'maxMileage', order: 10, unit: 'km' },
    { key: 'bodyType', type: 'select', label: { en: 'Motorcycle type', sv: 'Motorcykeltyp', de: 'Motorradtyp' }, apiParam: 'bodyType', order: 20 },
    { key: 'fuel', type: 'select', label: { en: 'Fuel', sv: 'Drivmedel', de: 'Kraftstoff' }, apiParam: 'fuel', order: 30 },
    { key: 'gearbox', type: 'select', label: { en: 'Transmission', sv: 'Transmission', de: 'Getriebe' }, apiParam: 'gearbox', order: 40 },
    { key: 'color', type: 'select', label: { en: 'Color', sv: 'Färg', de: 'Farbe' }, apiParam: 'color', order: 50 },
    { key: 'equipment', type: 'text', label: { en: 'Accessories', sv: 'Tillbehör', de: 'Zubehör' }, apiParam: 'equipment', order: 60 },
  ],
  motorhomes: [
    { key: 'mileage', type: 'range', label: { en: 'Mileage', sv: 'Miltal', de: 'Kilometerstand' }, apiParam: 'maxMileage', order: 10, unit: 'km' },
    { key: 'bodyType', type: 'select', label: { en: 'Motorhome type', sv: 'Husbilstyp', de: 'Wohnmobiltyp' }, apiParam: 'bodyType', order: 20 },
    { key: 'fuel', type: 'select', label: { en: 'Fuel', sv: 'Drivmedel', de: 'Kraftstoff' }, apiParam: 'fuel', order: 30 },
    { key: 'gearbox', type: 'select', label: { en: 'Gearbox', sv: 'Växellåda', de: 'Getriebe' }, apiParam: 'gearbox', order: 40 },
    { key: 'leasingPossible', type: 'toggle', label: { en: 'Leasing possible', sv: 'Leasing möjlig', de: 'Leasing möglich' }, apiParam: 'leasingPossible', order: 50 },
    { key: 'equipment', type: 'text', label: { en: 'Living equipment', sv: 'Boendeutrustning', de: 'Wohnraumausstattung' }, apiParam: 'equipment', order: 60 },
  ],
  caravans: [
    { key: 'bodyType', type: 'select', label: { en: 'Caravan type', sv: 'Husvagnstyp', de: 'Wohnwagentyp' }, apiParam: 'bodyType', order: 10 },
    { key: 'equipment', type: 'text', label: { en: 'Living equipment', sv: 'Boendeutrustning', de: 'Wohnraumausstattung' }, apiParam: 'equipment', order: 20 },
  ],
  trucks: [
    { key: 'mileage', type: 'range', label: { en: 'Mileage', sv: 'Miltal', de: 'Kilometerstand' }, apiParam: 'maxMileage', order: 10, unit: 'km' },
    { key: 'bodyType', type: 'select', label: { en: 'Truck type', sv: 'Lastbilstyp', de: 'Lkw-Typ' }, apiParam: 'bodyType', order: 20 },
    { key: 'fuel', type: 'select', label: { en: 'Fuel', sv: 'Drivmedel', de: 'Kraftstoff' }, apiParam: 'fuel', order: 30 },
    { key: 'gearbox', type: 'select', label: { en: 'Gearbox', sv: 'Växellåda', de: 'Getriebe' }, apiParam: 'gearbox', order: 40 },
    { key: 'leasingPossible', type: 'toggle', label: { en: 'Leasing possible', sv: 'Leasing möjlig', de: 'Leasing möglich' }, apiParam: 'leasingPossible', order: 50 },
    { key: 'equipment', type: 'text', label: { en: 'Body and equipment', sv: 'Påbyggnad och utrustning', de: 'Aufbau und Ausstattung' }, apiParam: 'equipment', order: 60 },
  ],
  agriculture: [
    { key: 'bodyType', type: 'select', label: { en: 'Machine type', sv: 'Maskintyp', de: 'Maschinentyp' }, apiParam: 'bodyType', order: 10 },
    { key: 'operatingHours', type: 'range', label: { en: 'Operating hours', sv: 'Drifttimmar', de: 'Betriebsstunden' }, apiParam: 'maxOperatingHours', order: 20, unit: 'h' },
    { key: 'fuel', type: 'select', label: { en: 'Drive / fuel', sv: 'Drift / drivmedel', de: 'Antrieb / Kraftstoff' }, apiParam: 'fuel', order: 30 },
    { key: 'gearbox', type: 'select', label: { en: 'Transmission', sv: 'Transmission', de: 'Getriebe' }, apiParam: 'gearbox', order: 40 },
    { key: 'equipment', type: 'text', label: { en: 'Implements and equipment', sv: 'Redskap och utrustning', de: 'Anbaugeräte und Ausstattung' }, apiParam: 'equipment', order: 50 },
  ],
  construction: [
    { key: 'bodyType', type: 'select', label: { en: 'Machine type', sv: 'Maskintyp', de: 'Maschinentyp' }, apiParam: 'bodyType', order: 10 },
    { key: 'operatingHours', type: 'range', label: { en: 'Operating hours', sv: 'Drifttimmar', de: 'Betriebsstunden' }, apiParam: 'maxOperatingHours', order: 20, unit: 'h' },
    { key: 'fuel', type: 'select', label: { en: 'Drive / fuel', sv: 'Drift / drivmedel', de: 'Antrieb / Kraftstoff' }, apiParam: 'fuel', order: 30 },
    { key: 'gearbox', type: 'select', label: { en: 'Transmission', sv: 'Transmission', de: 'Getriebe' }, apiParam: 'gearbox', order: 40 },
    { key: 'equipment', type: 'text', label: { en: 'Attachments and equipment', sv: 'Tillbehör och utrustning', de: 'Anbaugeräte und Ausstattung' }, apiParam: 'equipment', order: 50 },
  ],
  'electric-bikes': [
    { key: 'bodyType', type: 'select', label: { en: 'Bike type', sv: 'Cykeltyp', de: 'Fahrradtyp' }, apiParam: 'bodyType', order: 10 },
    { key: 'equipment', type: 'text', label: { en: 'Equipment', sv: 'Utrustning', de: 'Ausstattung' }, apiParam: 'equipment', order: 20 },
  ],
}

const categoryPrimaryFilterDefinitions: Record<string, VehicleFilterKey[]> = {
  cars: ['bodyType', 'fuel', 'gearbox', 'mileage'],
  vans: ['bodyType', 'fuel', 'gearbox', 'mileage'],
  motorcycles: ['bodyType', 'mileage', 'fuel'],
  motorhomes: ['bodyType', 'mileage', 'fuel'],
  caravans: ['bodyType'],
  trucks: ['bodyType', 'mileage', 'fuel', 'gearbox'],
  agriculture: ['bodyType', 'operatingHours', 'fuel'],
  construction: ['bodyType', 'operatingHours', 'fuel'],
  'electric-bikes': ['bodyType'],
}

function categoryFilterProfile(category: string): CategoryFilterDefinition[] {
  return [...(categoryFilterDefinitions[category] || [])].sort((a, b) => a.order - b.order)
}

function categoryPrimaryFilterKeys(category: string): VehicleFilterKey[] {
  return categoryPrimaryFilterDefinitions[category] || categoryFilterProfile(category).slice(0, 4).map((filter) => filter.key)
}

function filterLabel(filter: CategoryFilterDefinition, locale: PublicLocale) {
  if (locale === 'sv') return filter.label.sv
  if (locale === 'de') return filter.label.de
  return filter.label.en
}

function mapApiListingToVehicleSearchListing(
  listing: Record<string, unknown>,
  locale: PublicLocale,
): VehicleSearchListing {
  const priceValue = Number(listing.price || 0)
  const currency = String(listing.currency || 'EUR')
  const images = Array.isArray(listing.images)
    ? listing.images.filter((image): image is string => typeof image === 'string' && Boolean(image))
    : []

  return {
    id: String(listing.id || ''),
    category: String(listing.category || ''),
    title: String(listing.title || ''),
    make: String(listing.make || ''),
    model: String(listing.model || ''),
    year: listing.model_year ? String(listing.model_year) : null,
    mileageKm: numberOrNull(listing.mileage_km),
    operatingHours: numberOrNull(listing.operating_hours),
    fuelType: stringOrNull(listing.fuel_type),
    gearbox: stringOrNull(listing.gearbox),
    bodyType: stringOrNull(listing.body_type),
    country: String(listing.country_code || ''),
    city: stringOrNull(listing.city),
    municipality: stringOrNull(listing.municipality),
    latitude: numberOrNull(listing.latitude),
    longitude: numberOrNull(listing.longitude),
    priceLabel: stringOrNull(listing.price_label) || formatApiPrice(priceValue, currency, locale),
    priceValue,
    imageUrl: images[0] || null,
    imageUrls: images,
    sellerLogoUrl: null,
    sellerTrust: 'unverified',
    sellerName: String(listing.seller_name || ''),
    sellerIsTrader: listing.seller_type === 'business',
    sellerRatingAverage: null,
    sellerRatingCount: 0,
    condition: stringOrNull(listing.condition),
    color: stringOrNull(listing.color),
    equipment: stringOrNull(listing.equipment),
    offerType: listing.offer_type === 'lease' || listing.offer_type === 'sale_and_lease' || listing.offer_type === 'sale'
      ? listing.offer_type
      : null,
    leaseData: listing.lease_data && typeof listing.lease_data === 'object' && !Array.isArray(listing.lease_data)
      ? listing.lease_data as Record<string, unknown>
      : null,
  }
}

function formatApiPrice(amount: number, currency: string, locale: PublicLocale) {
  if (!Number.isFinite(amount) || amount <= 0) return uiText(locale, 'Price on request', 'Pris på begäran', 'Preis auf Anfrage')
  return `${amount.toLocaleString(countNumberLocale(locale), { maximumFractionDigits: 0 })} ${currency.toUpperCase()}`
}

function formatSearchResultCountSummary({
  locale,
  count,
  make,
  model,
  minYear,
  maxYear,
  selectedCategoryItems,
  marketSummary,
  resultLocationName,
  city,
  municipality,
  region,
}: {
  locale: PublicLocale
  count: number
  make: string
  model: string
  minYear: string
  maxYear: string
  selectedCategoryItems: Array<(typeof categories)[number]>
  marketSummary: string
  resultLocationName: string
  city: string
  municipality: string
  region: string
}) {
  if (count === 0) return uiText(locale, 'No listings match your search', 'Inga annonser matchar din sökning', 'Keine Anzeigen passen zu Ihrer Suche')

  const formatted = count.toLocaleString(countNumberLocale(locale))
  const subject =
    [make, model].filter(Boolean).join(' ') ||
    (selectedCategoryItems.length === 1
      ? countCategoryLabel(selectedCategoryItems[0], locale, count)
      : count === 1
        ? uiText(locale, 'vehicle', 'fordon', 'Fahrzeug')
        : uiText(locale, 'vehicles', 'fordon', 'Fahrzeuge'))
  const location = city || municipality || region
    ? resultLocationName
    : marketSummary
  const yearText = minYear || maxYear
    ? countYearRangeText(locale, minYear, maxYear)
    : ''

  if (locale === 'sv') {
    return `${formatted} ${subject} till salu${location ? ` i ${location}` : ''}${yearText}`
  }
  if (locale === 'de') {
    return `${formatted} ${subject} zum Verkauf${location ? ` in ${location}` : ''}${yearText}`
  }
  return `${formatted} ${subject} for sale${location ? ` in ${location}` : ''}${yearText}`
}

function countCategoryLabel(item: (typeof categories)[number], locale: PublicLocale, count: number) {
  if (locale === 'sv') {
    const singular: Record<string, string> = {
      cars: 'bil',
      vans: 'transportbil',
      motorcycles: 'motorcykel',
      motorhomes: 'husbil',
      caravans: 'husvagn',
      trucks: 'lastbil',
      agriculture: 'lantbruksmaskin',
        construction: 'entreprenadmaskin',
        'electric-bikes': 'cykel',
    }
    return count === 1 ? singular[item.key] || 'fordon' : categoryText(item, locale, true).toLocaleLowerCase('sv-SE')
  }
  return count === 1
    ? categoryText(item, locale, true).replace(/s$/i, '').toLocaleLowerCase()
    : categoryText(item, locale, true).toLocaleLowerCase()
}

function countYearRangeText(locale: PublicLocale, minYear: string, maxYear: string) {
  if (locale === 'sv') {
    if (minYear && maxYear) return ` från ${minYear} till ${maxYear}`
    if (minYear) return ` från ${minYear}`
    return ` till ${maxYear}`
  }
  if (locale === 'de') {
    if (minYear && maxYear) return ` von ${minYear} bis ${maxYear}`
    if (minYear) return ` ab ${minYear}`
    return ` bis ${maxYear}`
  }
  if (minYear && maxYear) return ` from ${minYear} to ${maxYear}`
  if (minYear) return ` from ${minYear}`
  return ` up to ${maxYear}`
}

function countNumberLocale(locale: PublicLocale) {
  if (locale === 'sv') return 'sv-SE'
  if (locale === 'de' || locale === 'at') return 'de-DE'
  if (locale === 'fr') return 'fr-FR'
  if (locale === 'es') return 'es-ES'
  if (locale === 'it') return 'it-IT'
  if (locale === 'pl') return 'pl-PL'
  if (locale === 'nl' || locale === 'be') return 'nl-NL'
  if (locale === 'da') return 'da-DK'
  if (locale === 'fi') return 'fi-FI'
  return 'en-GB'
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function stringOrNull(value: unknown) {
  return typeof value === 'string' && value ? value : null
}

function parseOptionalNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const normalized = String(value).replace(/[^\d.-]/g, '')
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}

function snapToStep(value: number, step: number, min: number, max: number) {
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1
  const snapped = Math.round((value - min) / safeStep) * safeStep + min
  return clampNumber(snapped, min, max)
}

function handleRangeHandleKeyDown(
  event: KeyboardEvent<HTMLButtonElement>,
  currentValue: number,
  step: number,
  min: number,
  max: number,
  onChange: (value: string) => void,
) {
  if (!['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  if (event.key === 'Home') {
    onChange(String(min))
    return
  }
  if (event.key === 'End') {
    onChange(String(max))
    return
  }
  const direction = event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 1
  onChange(String(snapToStep(currentValue + direction * step, step, min, max)))
}

function formatNumberRangeLabel(minValue: string, maxValue: string, unit: string, locale: PublicLocale) {
  const minText = minValue ? Number(minValue).toLocaleString(countNumberLocale(locale)) : '0'
  const maxText = maxValue ? Number(maxValue).toLocaleString(countNumberLocale(locale)) : 'max'
  return `${minText}-${maxText}${unit ? ` ${unit}` : ''}`
}

function formatMileageRangeLabel(minValue: string, maxValue: string, locale: PublicLocale) {
  const minText = minValue ? formatMileageAsMil(Number(minValue), locale) : '0'
  const maxText = maxValue ? formatMileageAsMil(Number(maxValue), locale) : 'max'
  return `${minText}-${maxText}`
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
