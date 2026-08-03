'use client'

import {
  type ComponentType,
  type FormEvent,
  type SVGProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BusFront,
  ChevronDown,
  Construction,
  LayoutGrid,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tractor,
  X,
} from 'lucide-react'
import {
  AutorellBikeIcon,
  AutorellCaravanIcon,
  AutorellCarIcon,
  AutorellMotorbikeIcon,
  AutorellTruckIcon,
  AutorellVanIcon,
} from './AutorellCategoryIcons'
import HomeSearchAnimatedPlaceholder from './HomeSearchAnimatedPlaceholder'
import {
  useVehicleSmartSearchSuggestions,
  VehicleSmartSearchSuggestionPanel,
  type VehicleSmartSearchSuggestion,
} from './VehicleSmartSearchSuggestions'
import {
  localizePublicHref,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import {
  currencyForCountry,
  getMarketplaceCategory,
  isLeasingMarketplaceCategory,
  marketplaceLanguage,
  type MarketplaceCategorySlug,
} from '@/lib/marketplace'
import { getEuCountryName } from '@/lib/eu-countries'
import { defaultSearchCountryForLocale } from '@/lib/market-locale'
import { translateListingVehicleValue } from '@/lib/listing-display'

type Intent = 'sale' | 'leasing'

type HomeSearchFilters = {
  make: string
  model: string
  minYear: string
  maxPrice: string
  maxMileage: string
  maxOperatingHours: string
  fuel: string
  gearbox: string
  bodyType: string
  condition: string
  technical_axleCount: string
  technical_engineCc: string
  technical_payloadKg: string
  technical_cargoVolumeM3: string
  technical_operatingWeightKg: string
  technical_totalWeightKg: string
  technical_batteryCapacityWh: string
}

type HomeSearchFilterKey = keyof HomeSearchFilters
type HomeSearchSlot = HomeSearchFilterKey | 'mode' | 'location'

type CategorySearchLayout = {
  top: [HomeSearchFilterKey, HomeSearchFilterKey, HomeSearchFilterKey, HomeSearchFilterKey]
  bottom: [HomeSearchSlot, HomeSearchSlot, HomeSearchSlot]
  advanced: HomeSearchFilterKey[]
}

type FacetOption = { value: string; count: number }

type HomeSearchFacets = {
  makes: FacetOption[]
  models: FacetOption[]
  municipalities: FacetOption[]
  fuels: FacetOption[]
  gearboxes: FacetOption[]
  bodyTypes: FacetOption[]
  technical: Record<string, FacetOption[]>
}

type SelectedSearchSuggestion = VehicleSmartSearchSuggestion & {
  chipId: string
  dedupeKey: string
}

type CategoryDefinition = {
  slug: MarketplaceCategorySlug
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const emptyFilters: HomeSearchFilters = {
  make: '',
  model: '',
  minYear: '',
  maxPrice: '',
  maxMileage: '',
  maxOperatingHours: '',
  fuel: '',
  gearbox: '',
  bodyType: '',
  condition: '',
  technical_axleCount: '',
  technical_engineCc: '',
  technical_payloadKg: '',
  technical_cargoVolumeM3: '',
  technical_operatingWeightKg: '',
  technical_totalWeightKg: '',
  technical_batteryCapacityWh: '',
}

const emptyFacets: HomeSearchFacets = {
  makes: [],
  models: [],
  municipalities: [],
  fuels: [],
  gearboxes: [],
  bodyTypes: [],
  technical: {},
}

const categoryRoutes: Record<MarketplaceCategorySlug, string> = {
  cars: '/marketplace/cars',
  vans: '/marketplace/vans',
  motorcycles: '/marketplace/motorcycles',
  motorhomes: '/marketplace/motorhomes',
  caravans: '/marketplace/caravans',
  trucks: '/marketplace/trucks',
  agriculture: '/marketplace/agriculture',
  construction: '/marketplace/construction',
  'electric-bikes': '/marketplace/electric-bikes',
}

const categoryDefinitions: CategoryDefinition[] = [
  { slug: 'cars', icon: AutorellCarIcon },
  { slug: 'vans', icon: AutorellVanIcon },
  { slug: 'trucks', icon: AutorellTruckIcon },
  { slug: 'motorcycles', icon: AutorellMotorbikeIcon },
  { slug: 'construction', icon: Construction },
  { slug: 'motorhomes', icon: BusFront },
  { slug: 'caravans', icon: AutorellCaravanIcon },
  { slug: 'agriculture', icon: Tractor },
  { slug: 'electric-bikes', icon: AutorellBikeIcon },
]

const primaryCategorySlugs = new Set<MarketplaceCategorySlug>([
  'cars',
  'vans',
  'trucks',
  'motorcycles',
  'construction',
])

const categoryLayouts: Record<MarketplaceCategorySlug, CategorySearchLayout> = {
  cars: {
    top: ['make', 'model', 'minYear', 'maxMileage'],
    bottom: ['mode', 'maxPrice', 'location'],
    advanced: ['fuel', 'gearbox', 'bodyType', 'condition'],
  },
  vans: {
    top: ['make', 'model', 'minYear', 'bodyType'],
    bottom: ['mode', 'maxPrice', 'location'],
    advanced: [
      'fuel',
      'gearbox',
      'maxMileage',
      'technical_payloadKg',
      'technical_cargoVolumeM3',
      'condition',
    ],
  },
  trucks: {
    top: ['make', 'model', 'minYear', 'technical_axleCount'],
    bottom: ['mode', 'bodyType', 'location'],
    advanced: ['maxPrice', 'technical_payloadKg', 'fuel', 'gearbox', 'condition'],
  },
  motorcycles: {
    top: ['make', 'model', 'minYear', 'bodyType'],
    bottom: ['technical_engineCc', 'maxMileage', 'location'],
    advanced: ['maxPrice', 'fuel', 'gearbox', 'condition'],
  },
  construction: {
    top: ['bodyType', 'make', 'model', 'minYear'],
    bottom: ['mode', 'maxOperatingHours', 'location'],
    advanced: ['maxPrice', 'technical_operatingWeightKg', 'fuel', 'condition'],
  },
  motorhomes: {
    top: ['make', 'model', 'minYear', 'bodyType'],
    bottom: ['maxPrice', 'maxMileage', 'location'],
    advanced: ['fuel', 'gearbox', 'technical_totalWeightKg', 'condition'],
  },
  caravans: {
    top: ['make', 'model', 'minYear', 'bodyType'],
    bottom: ['maxPrice', 'technical_totalWeightKg', 'location'],
    advanced: ['condition'],
  },
  agriculture: {
    top: ['bodyType', 'make', 'model', 'minYear'],
    bottom: ['mode', 'maxOperatingHours', 'location'],
    advanced: ['maxPrice', 'fuel', 'condition'],
  },
  'electric-bikes': {
    top: ['make', 'model', 'bodyType', 'maxPrice'],
    bottom: ['technical_batteryCapacityWh', 'condition', 'location'],
    advanced: [],
  },
}

const bodyTypeOptions: Record<MarketplaceCategorySlug, string[]> = {
  cars: ['Halvkombi', 'Sedan', 'SUV', 'Kombi', 'Coupé', 'Cabriolet', 'Pickup'],
  vans: ['Skåpbil', 'Crew van', 'Box van', 'Kylbil', 'Minibuss', 'Pickup', 'Flak', 'Chassi'],
  trucks: ['Dragbil', 'Skåp', 'Flak', 'Tipp', 'Kranbil', 'Kylbil', 'Chassi', 'Tankbil', 'Lastväxlare', 'Betongbil', 'Buss'],
  motorcycles: ['Sport', 'Touring', 'Custom', 'Scooter', 'Cross / enduro', 'Naked', 'Adventure', 'Moped', 'ATV'],
  construction: ['Grävmaskin', 'Minigrävare', 'Hjullastare', 'Dumper', 'Dozer', 'Vält', 'Lift', 'Kran', 'Kompaktor'],
  motorhomes: ['Helintegrerad', 'Halvintegrerad', 'Alkov', 'Camper van', 'Plåtis'],
  caravans: ['Enkelaxel', 'Boggie', 'Familjevagn', 'Vintervagn', 'Liten husvagn'],
  agriculture: ['Traktor', 'Skördetröska', 'Redskap', 'Press', 'Vagn', 'Spruta', 'Lastare'],
  'electric-bikes': ['City', 'Hybrid', 'Mountainbike', 'Cargo', 'Folding', 'Speedbike', 'Racer', 'Barncykel'],
}

const marketOptions = ['EU', 'SE', 'DE', 'AT', 'BE', 'DK', 'ES', 'FI', 'FR', 'IT', 'NL', 'PL']

const copyByLocale = {
  sv: {
    title: 'Hitta rätt fordon. En enklare sökning.',
    searchLabel: 'Beskriv fordonet du letar efter',
    searchButton: 'Sök',
    categoriesLabel: 'Fordonskategori',
    moreCategories: 'Visa fler',
    moreCategoriesTitle: 'Alla fordonskategorier',
    close: 'Stäng',
    purchaseType: 'Annonstyp',
    buy: 'Köp',
    leasing: 'Leasing',
    location: 'Plats eller postnummer',
    reset: 'Återställ',
    moreFilters: 'Fler filter',
    moreFiltersTitle: 'Fler sökfilter',
    applyFilters: 'Visa valda filter',
    verified: 'Endast verifierade säljare',
    market: 'Marknad',
    allEurope: 'Hela Europa',
    all: 'Alla',
    showCount: 'Visa {count} fordon',
    showVehicles: 'Visa fordon',
    updatingCount: 'Uppdaterar annonsantal',
    removeSuggestion: 'Ta bort valt sökförslag',
    fields: {
      make: 'Märke',
      model: 'Modell',
      minYear: 'Modellår från',
      maxPrice: 'Pris upp till',
      maxMileage: 'Körsträcka upp till',
      maxOperatingHours: 'Drifttimmar upp till',
      fuel: 'Drivmedel',
      gearbox: 'Växellåda',
      bodyType: 'Typ',
      condition: 'Skick',
      technical_axleCount: 'Antal axlar',
      technical_engineCc: 'Cylindervolym',
      technical_payloadKg: 'Lastvikt upp till',
      technical_cargoVolumeM3: 'Lastutrymme upp till',
      technical_operatingWeightKg: 'Maskinvikt upp till',
      technical_totalWeightKg: 'Totalvikt upp till',
      technical_batteryCapacityWh: 'Batterikapacitet från',
    },
    examples: [
      'Volvo V70 diesel',
      'Honda Civic i Stockholm',
      'Elektrisk transportbil',
      'Lastbil med kran',
      'Grävmaskin under 500 000 kr',
      'Motorcykel med ABS',
    ],
  },
  en: {
    title: 'Find the right vehicle. One simpler search.',
    searchLabel: 'Describe the vehicle you are looking for',
    searchButton: 'Search',
    categoriesLabel: 'Vehicle category',
    moreCategories: 'Show more',
    moreCategoriesTitle: 'All vehicle categories',
    close: 'Close',
    purchaseType: 'Listing type',
    buy: 'Buy',
    leasing: 'Leasing',
    location: 'Location or postcode',
    reset: 'Reset',
    moreFilters: 'More filters',
    moreFiltersTitle: 'More search filters',
    applyFilters: 'Show selected filters',
    verified: 'Verified sellers only',
    market: 'Market',
    allEurope: 'All of Europe',
    all: 'Any',
    showCount: 'View {count} vehicles',
    showVehicles: 'View vehicles',
    updatingCount: 'Updating listing count',
    removeSuggestion: 'Remove selected search suggestion',
    fields: {
      make: 'Make',
      model: 'Model',
      minYear: 'Model year from',
      maxPrice: 'Price up to',
      maxMileage: 'Mileage up to',
      maxOperatingHours: 'Operating hours up to',
      fuel: 'Fuel',
      gearbox: 'Gearbox',
      bodyType: 'Type',
      condition: 'Condition',
      technical_axleCount: 'Number of axles',
      technical_engineCc: 'Engine capacity',
      technical_payloadKg: 'Payload up to',
      technical_cargoVolumeM3: 'Cargo space up to',
      technical_operatingWeightKg: 'Operating weight up to',
      technical_totalWeightKg: 'Total weight up to',
      technical_batteryCapacityWh: 'Battery capacity from',
    },
    examples: [
      'Volvo V70 diesel',
      'Honda Civic in Stockholm',
      'Electric delivery van',
      'Truck with a crane',
      'Excavator under 50,000 euros',
      'Motorcycle with ABS',
    ],
  },
  de: {
    title: 'Das richtige Fahrzeug. Einfacher gesucht.',
    searchLabel: 'Beschreiben Sie das gesuchte Fahrzeug',
    searchButton: 'Suchen',
    categoriesLabel: 'Fahrzeugkategorie',
    moreCategories: 'Mehr anzeigen',
    moreCategoriesTitle: 'Alle Fahrzeugkategorien',
    close: 'Schließen',
    purchaseType: 'Angebotsart',
    buy: 'Kaufen',
    leasing: 'Leasing',
    location: 'Ort oder Postleitzahl',
    reset: 'Zurücksetzen',
    moreFilters: 'Mehr Filter',
    moreFiltersTitle: 'Weitere Suchfilter',
    applyFilters: 'Ausgewählte Filter anzeigen',
    verified: 'Nur verifizierte Verkäufer',
    market: 'Markt',
    allEurope: 'Ganz Europa',
    all: 'Alle',
    showCount: '{count} Fahrzeuge anzeigen',
    showVehicles: 'Fahrzeuge anzeigen',
    updatingCount: 'Anzeigenanzahl wird aktualisiert',
    removeSuggestion: 'Ausgewählten Suchvorschlag entfernen',
    fields: {
      make: 'Marke',
      model: 'Modell',
      minYear: 'Modelljahr ab',
      maxPrice: 'Preis bis',
      maxMileage: 'Kilometerstand bis',
      maxOperatingHours: 'Betriebsstunden bis',
      fuel: 'Kraftstoff',
      gearbox: 'Getriebe',
      bodyType: 'Typ',
      condition: 'Zustand',
      technical_axleCount: 'Anzahl Achsen',
      technical_engineCc: 'Hubraum',
      technical_payloadKg: 'Nutzlast bis',
      technical_cargoVolumeM3: 'Ladevolumen bis',
      technical_operatingWeightKg: 'Einsatzgewicht bis',
      technical_totalWeightKg: 'Gesamtgewicht bis',
      technical_batteryCapacityWh: 'Batteriekapazität ab',
    },
    examples: [
      'Volvo V70 Diesel',
      'Honda Civic in Berlin',
      'Elektrischer Transporter',
      'Lkw mit Kran',
      'Bagger unter 50.000 Euro',
      'Motorrad mit ABS',
    ],
  },
} as const

let selectedSearchSuggestionSequence = 0

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

function categoryLabel(slug: MarketplaceCategorySlug, locale: PublicLocale) {
  const category = getMarketplaceCategory(slug)
  const language = marketplaceLanguage(locale)
  if (locale === 'sv' || locale === 'de' || locale === 'en') {
    return category.labels[language]
  }
  if (locale === 'at') return category.labels.de
  return translatePublic(locale, category.labels.en)
}

function publicNumberLocale(locale: PublicLocale) {
  if (locale === 'sv') return 'sv-SE'
  if (locale === 'de') return 'de-DE'
  if (locale === 'at') return 'de-AT'
  if (locale === 'be') return 'nl-BE'
  if (locale === 'fr') return 'fr-FR'
  if (locale === 'es') return 'es-ES'
  if (locale === 'it') return 'it-IT'
  if (locale === 'pl') return 'pl-PL'
  if (locale === 'nl') return 'nl-NL'
  if (locale === 'fi') return 'fi-FI'
  if (locale === 'da') return 'da-DK'
  return 'en-GB'
}

function localizedCopy(locale: PublicLocale) {
  if (locale === 'sv') return copyByLocale.sv
  if (locale === 'de' || locale === 'at') return copyByLocale.de
  if (locale === 'en') return copyByLocale.en
  return translatePublicObject(locale, copyByLocale.en)
}

function isPostalCode(value: string) {
  return /^[A-Za-z]{0,2}\s*\d[\d\s-]{2,8}$/.test(value.trim())
}

function setNonEmptyParam(params: URLSearchParams, key: string, value: string) {
  const cleanValue = value.trim()
  if (cleanValue) params.set(key, cleanValue)
}

function buildHomeSearchParams({
  category,
  intent,
  query,
  selectedSuggestions,
  filters,
  location,
  geoAreaId,
  market,
  verifiedOnly,
}: {
  category: MarketplaceCategorySlug
  intent: Intent
  query: string
  selectedSuggestions: SelectedSearchSuggestion[]
  filters: HomeSearchFilters
  location: string
  geoAreaId: string
  market: string
  verifiedOnly: boolean
}) {
  const params = new URLSearchParams()
  params.set('categories', category)
  params.set('mode', intent)
  params.set('offerType', intent === 'leasing' ? 'lease' : 'sale')
  if (intent === 'leasing') params.set('leasingPossible', '1')
  if (market) params.set('markets', market)

  const locationValue = location.trim()
  const queryValue = [query.trim(), isPostalCode(locationValue) ? locationValue : '']
    .filter(Boolean)
    .join(' ')
  setNonEmptyParam(params, 'q', queryValue)
  if (selectedSuggestions.length) {
    params.set('chips', selectedSuggestions.map((suggestion) => suggestion.title).join(','))
  }

  if (geoAreaId) {
    params.set('geoAreaId', geoAreaId)
    params.set('geoFilterMode', 'strict')
  } else if (locationValue && !isPostalCode(locationValue)) {
    params.set('municipality', locationValue)
  }

  Object.entries(filters).forEach(([key, value]) => setNonEmptyParam(params, key, value))
  if (verifiedOnly) params.set('verifiedOnly', '1')
  return params
}

function uniqueOptions(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function facetValues(values: FacetOption[] | undefined) {
  return (values || []).map((option) => option.value)
}

function priceThresholds(currency: string) {
  if (currency === 'SEK' || currency === 'DKK' || currency === 'NOK') {
    return ['50000', '100000', '150000', '250000', '400000', '600000', '1000000', '1500000']
  }
  if (currency === 'PLN') {
    return ['25000', '50000', '75000', '100000', '150000', '250000', '400000', '600000']
  }
  return ['5000', '10000', '15000', '20000', '30000', '50000', '75000', '100000']
}

function years() {
  const currentYear = new Date().getFullYear() + 1
  return Array.from({ length: currentYear - 1979 }, (_, index) => String(currentYear - index))
}

function filterOptions(
  key: HomeSearchFilterKey,
  category: MarketplaceCategorySlug,
  facets: HomeSearchFacets,
  market: string,
) {
  if (key === 'make') return facetValues(facets.makes)
  if (key === 'model') return facetValues(facets.models)
  if (key === 'minYear') return years()
  if (key === 'maxPrice') return priceThresholds(currencyForCountry(market === 'EU' ? '' : market))
  if (key === 'maxMileage') return ['25000', '50000', '75000', '100000', '150000', '200000', '300000']
  if (key === 'maxOperatingHours') return ['1000', '2500', '5000', '7500', '10000', '20000', '40000']
  if (key === 'fuel') {
    return uniqueOptions([...facetValues(facets.fuels), 'Bensin', 'Diesel', 'El', 'Hybrid', 'Annat'])
  }
  if (key === 'gearbox') {
    return uniqueOptions([...facetValues(facets.gearboxes), 'Automat', 'Manuell'])
  }
  if (key === 'bodyType') {
    return uniqueOptions([...facetValues(facets.bodyTypes), ...bodyTypeOptions[category]])
  }
  if (key === 'condition') return ['Ny', 'Begagnad', 'Renoverad', 'Projekt']
  if (key === 'technical_axleCount') {
    return uniqueOptions([...facetValues(facets.technical.axleCount), '2', '3', '4', '5', '6+'])
  }
  if (key === 'technical_engineCc') return ['125', '300', '500', '750', '1000', '1500', '2000']
  if (key === 'technical_payloadKg') return ['1000', '2500', '5000', '10000', '20000', '40000', '60000']
  if (key === 'technical_cargoVolumeM3') return ['5', '10', '20', '40', '60', '80']
  if (key === 'technical_operatingWeightKg') return ['1500', '3500', '7500', '15000', '25000', '50000', '100000']
  if (key === 'technical_totalWeightKg') return ['1500', '2500', '3500', '5000', '7500', '12000']
  if (key === 'technical_batteryCapacityWh') return ['250', '400', '500', '625', '750', '1000']
  return []
}

function filterOptionLabel({
  key,
  value,
  locale,
  market,
}: {
  key: HomeSearchFilterKey
  value: string
  locale: PublicLocale
  market: string
}) {
  const number = Number(value)
  const formatter = new Intl.NumberFormat(publicNumberLocale(locale), { maximumFractionDigits: 0 })
  if (key === 'maxPrice') {
    return new Intl.NumberFormat(publicNumberLocale(locale), {
      style: 'currency',
      currency: currencyForCountry(market === 'EU' ? '' : market),
      maximumFractionDigits: 0,
    }).format(number)
  }
  if (key === 'maxMileage') {
    return locale === 'sv'
      ? `${formatter.format(Math.round(number / 10))} mil`
      : `${formatter.format(number)} km`
  }
  if (key === 'maxOperatingHours') return `${formatter.format(number)} h`
  if (key === 'technical_engineCc') return `${formatter.format(number)} cc`
  if (
    key === 'technical_payloadKg' ||
    key === 'technical_operatingWeightKg' ||
    key === 'technical_totalWeightKg'
  ) {
    return `${formatter.format(number)} kg`
  }
  if (key === 'technical_cargoVolumeM3') return `${formatter.format(number)} m³`
  if (key === 'technical_batteryCapacityWh') return `${formatter.format(number)} Wh`
  if (key === 'fuel' || key === 'gearbox' || key === 'bodyType' || key === 'condition') {
    return translateListingVehicleValue(locale, value)
  }
  return value
}

function marketLabel(code: string, locale: PublicLocale, allEuropeLabel: string) {
  return code === 'EU' ? allEuropeLabel : getEuCountryName(code, locale)
}

export default function HomeHeroVehicleSearch({
  locale,
  localListingCount,
  europeListingCount,
}: {
  locale: PublicLocale
  localListingCount?: number | null
  europeListingCount?: number | null
}) {
  const router = useRouter()
  const t = localizedCopy(locale)
  const defaultMarket = defaultSearchCountryForLocale(locale) || 'EU'
  const [category, setCategory] = useState<MarketplaceCategorySlug>('cars')
  const [intent, setIntent] = useState<Intent>('sale')
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [geoAreaId, setGeoAreaId] = useState('')
  const [market, setMarket] = useState(defaultMarket)
  const [filters, setFilters] = useState<HomeSearchFilters>(emptyFilters)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState<SelectedSearchSuggestion[]>([])
  const [facets, setFacets] = useState<HomeSearchFacets>(emptyFacets)
  const [listingCount, setListingCount] = useState<number | null>(
    localListingCount ?? europeListingCount ?? null,
  )
  const [countLoading, setCountLoading] = useState(false)
  const [countError, setCountError] = useState(false)
  const categoryMenuRef = useRef<HTMLDivElement>(null)
  const moreFiltersTriggerRef = useRef<HTMLButtonElement>(null)
  const moreFiltersDialogRef = useRef<HTMLElement>(null)
  const moreFiltersCloseRef = useRef<HTMLButtonElement>(null)

  const categoryLayout = categoryLayouts[category]
  const visibleCategories = categoryDefinitions.filter(({ slug }) =>
    intent === 'leasing' ? isLeasingMarketplaceCategory(slug) : true,
  )
  const primaryCategories = visibleCategories.filter(({ slug }) => primaryCategorySlugs.has(slug))
  const extraCategories = visibleCategories.filter(({ slug }) => !primaryCategorySlugs.has(slug))
  const selectedExtraCategory = extraCategories.find((item) => item.slug === category)
  const MoreCategoryIcon = selectedExtraCategory?.icon || LayoutGrid

  const countParams = useMemo(
    () =>
      buildHomeSearchParams({
        category,
        intent,
        query,
        selectedSuggestions,
        filters,
        location,
        geoAreaId,
        market,
        verifiedOnly,
      }).toString(),
    [category, filters, geoAreaId, intent, location, market, query, selectedSuggestions, verifiedOnly],
  )

  useEffect(() => {
    if (!categoryMenuOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node) || categoryMenuRef.current?.contains(target)) return
      setCategoryMenuOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCategoryMenuOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [categoryMenuOpen])

  useEffect(() => {
    if (!moreFiltersOpen) return
    const triggerElement = moreFiltersTriggerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    moreFiltersCloseRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreFiltersOpen(false)
        return
      }
      if (event.key !== 'Tab') return

      const dialog = moreFiltersDialogRef.current
      if (!dialog) return
      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
        ),
      )
      if (!focusableElements.length) return
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && (activeElement === firstElement || !dialog.contains(activeElement))) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      triggerElement?.focus()
    }
  }, [moreFiltersOpen])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setCountLoading(true)
      setCountError(false)
      const params = new URLSearchParams(countParams)
      params.set('limit', '1')
      params.set('page', '1')
      params.set('locale', locale)
      params.set('displayMarket', market)

      try {
        const response = await fetch(`/api/marketplace/search-v2?${params.toString()}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Search count failed')
        const payload = (await response.json()) as {
          totalCount?: number
          facets?: Partial<HomeSearchFacets>
        }
        setListingCount(typeof payload.totalCount === 'number' ? payload.totalCount : null)
        setFacets({
          ...emptyFacets,
          ...payload.facets,
          technical: payload.facets?.technical || {},
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setCountError(true)
          setListingCount(null)
        }
      } finally {
        if (!controller.signal.aborted) setCountLoading(false)
      }
    }, query.trim() || location.trim() ? 420 : 180)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [countParams, locale, location, market, query])

  const smartSearch = useVehicleSmartSearchSuggestions({
    query,
    locale,
    marketCode: market === 'EU' ? undefined : market,
    active: searchFocused,
  })

  function updateFilter(key: HomeSearchFilterKey, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === 'make' ? { model: '' } : {}),
    }))
  }

  function selectCategory(nextCategory: MarketplaceCategorySlug) {
    setCategory(nextCategory)
    setFilters(emptyFilters)
    setIntent((current) =>
      current === 'leasing' && !isLeasingMarketplaceCategory(nextCategory) ? 'sale' : current,
    )
    setSelectedSuggestions([])
    setCategoryMenuOpen(false)
  }

  function changeIntent(nextIntent: Intent) {
    setIntent(nextIntent)
    if (nextIntent === 'leasing' && !isLeasingMarketplaceCategory(category)) {
      setCategory('cars')
      setFilters(emptyFilters)
      setSelectedSuggestions([])
    }
  }

  function resetSearch() {
    setQuery('')
    setLocation('')
    setGeoAreaId('')
    setIntent('sale')
    setFilters(emptyFilters)
    setVerifiedOnly(false)
    setMarket(defaultMarket)
    setSelectedSuggestions([])
    setMoreFiltersOpen(false)
  }

  function selectSmartSearchSuggestion(suggestion: VehicleSmartSearchSuggestion) {
    if (suggestion.type === 'listing') return true
    const nextSuggestion = createSelectedSearchSuggestion(suggestion)
    setSelectedSuggestions((current) =>
      current.some((item) => item.dedupeKey === nextSuggestion.dedupeKey)
        ? current
        : [...current, nextSuggestion],
    )

    try {
      const url = new URL(suggestion.href, window.location.origin)
      const params = url.searchParams
      const nextCategories = params.get('categories')?.split(',').filter(Boolean) || []
      const nextCategory = nextCategories[0] as MarketplaceCategorySlug | undefined
      if (nextCategory && categoryDefinitions.some((item) => item.slug === nextCategory)) {
        setCategory(nextCategory)
      }
      const nextMarket = params.get('markets')?.split(',').filter(Boolean)[0]
      if (nextMarket) setMarket(nextMarket)
      const nextGeoAreaId = params.get('geoAreaId') || params.get('geoPlaceCode') || ''
      if (nextGeoAreaId) {
        setGeoAreaId(nextGeoAreaId)
        setLocation(suggestion.title)
      }
      setFilters((current) => ({
        ...current,
        make: params.get('make') || current.make,
        model: params.get('model') || current.model,
        fuel: params.get('fuel') || params.get('fuelType') || current.fuel,
        minYear: params.get('minYear') || current.minYear,
        bodyType: params.get('bodyType') || current.bodyType,
      }))
    } catch {
      // Keep the selected chip if an external suggestion contains a malformed URL.
    }

    setQuery('')
    setSearchFocused(true)
    return false
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = buildHomeSearchParams({
      category,
      intent,
      query,
      selectedSuggestions,
      filters,
      location,
      geoAreaId,
      market,
      verifiedOnly,
    })
    const href = localizePublicHref(
      locale,
      `${categoryRoutes[category]}?${params.toString()}`,
    )
    router.push(href)
  }

  const countLabel =
    !countError && listingCount !== null
      ? t.showCount.replace(
          '{count}',
          new Intl.NumberFormat(publicNumberLocale(locale), { maximumFractionDigits: 0 }).format(listingCount),
        )
      : t.showVehicles

  return (
    <form onSubmit={submit} role="search" className="mx-auto w-full">
      <section className="mx-auto max-w-[900px] border border-[#cfd8e4] bg-white px-4 py-5 sm:rounded-[8px] sm:px-7 sm:py-6 lg:px-10">
        <h1 className="text-center text-[22px] font-semibold leading-tight text-[#101828] sm:text-[26px] lg:text-[28px]">
          {t.title}
        </h1>
        <div className="relative mt-4">
          <div className="relative flex min-h-[58px] items-center gap-2 rounded-[8px] border border-[#98a2b3] bg-white px-3 pr-[62px] transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10 sm:px-4 sm:pr-[66px]">
            <Sparkles className="h-5 w-5 shrink-0 text-[#667085]" aria-hidden="true" />
            {selectedSuggestions.map((suggestion) => (
              <span
                key={suggestion.chipId}
                className="inline-flex min-w-0 max-w-[180px] items-center gap-1 rounded-[6px] bg-[#eef5ff] px-2 py-1 text-[12px] font-medium text-[#101828]"
              >
                <span className="truncate">{suggestion.title}</span>
                <button
                  type="button"
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() =>
                    setSelectedSuggestions((current) =>
                      current.filter((item) => item.chipId !== suggestion.chipId),
                    )
                  }
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[#475467] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff]"
                  aria-label={t.removeSuggestion}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            ))}
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setSearchFocused(false), 140)}
              aria-label={t.searchLabel}
              autoComplete="off"
              className="h-10 min-w-[80px] flex-1 bg-transparent text-[15px] font-normal text-[#101828] outline-none sm:text-[16px]"
            />
            {!query && !selectedSuggestions.length ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-11 right-[64px] truncate text-[14px] font-normal text-[#7b8493] sm:left-12 sm:right-[70px] sm:text-[15px]"
              >
              <HomeSearchAnimatedPlaceholder examples={t.examples} paused={searchFocused} />
              </span>
            ) : null}
            <button
              type="submit"
              title={t.searchButton}
              aria-label={t.searchButton}
              className="absolute right-2 grid h-11 w-11 place-items-center rounded-[7px] bg-[#0866ff] text-white transition hover:bg-[#0057e6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/25"
            >
              <ArrowRight className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
          <VehicleSmartSearchSuggestionPanel
            query={query}
            suggestions={smartSearch.suggestions}
            loading={smartSearch.loading}
            searched={smartSearch.searched}
            locale={locale}
            onSelect={selectSmartSearchSuggestion}
            active={searchFocused}
          />
        </div>
      </section>

      <section className="relative mx-auto mt-3 max-w-[1120px] border border-[#cfd8e4] bg-white sm:rounded-[8px]">
        <div ref={categoryMenuRef} className="relative border-b border-[#d8e0ea]">
          <div
            role="tablist"
            aria-label={t.categoriesLabel}
            className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="grid min-w-[690px] grid-cols-6 lg:min-w-0">
              {primaryCategories.map(({ slug, icon: Icon }) => {
                const selected = category === slug
                return (
                  <button
                    key={slug}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => selectCategory(slug)}
                    className={`relative flex min-h-[70px] flex-col items-center justify-center gap-1 px-2 py-2 text-center text-[12px] font-medium transition focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0866ff] sm:text-[13px] ${
                      selected
                        ? 'bg-[#f5f9ff] text-[#0866ff]'
                        : 'text-[#475467] hover:bg-[#f8fafc] hover:text-[#101828]'
                    }`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                    <span className="max-w-full truncate">{categoryLabel(slug, locale)}</span>
                    {selected ? <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#0866ff]" /> : null}
                  </button>
                )
              })}
              <button
                type="button"
                role="tab"
                aria-selected={Boolean(selectedExtraCategory)}
                aria-expanded={categoryMenuOpen}
                aria-controls="home-search-category-menu"
                onClick={() => setCategoryMenuOpen((current) => !current)}
                className={`relative flex min-h-[70px] flex-col items-center justify-center gap-1 px-2 py-2 text-center text-[12px] font-medium transition focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0866ff] sm:text-[13px] ${
                  selectedExtraCategory
                    ? 'bg-[#f5f9ff] text-[#0866ff]'
                    : 'text-[#475467] hover:bg-[#f8fafc] hover:text-[#101828]'
                }`}
              >
                <MoreCategoryIcon className="h-6 w-6" aria-hidden="true" />
                <span className="max-w-full truncate">
                  {selectedExtraCategory ? categoryLabel(selectedExtraCategory.slug, locale) : t.moreCategories}
                </span>
                {selectedExtraCategory ? <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#0866ff]" /> : null}
              </button>
            </div>
          </div>

          {categoryMenuOpen ? (
            <div
              id="home-search-category-menu"
              role="dialog"
              aria-modal="false"
              aria-labelledby="home-search-category-title"
              className="fixed inset-x-3 bottom-3 z-[130] border border-[#cfd8e4] bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,.24)] sm:left-1/2 sm:right-auto sm:w-[540px] sm:-translate-x-1/2 sm:rounded-[8px] lg:absolute lg:bottom-auto lg:left-auto lg:right-3 lg:top-[calc(100%+8px)] lg:w-[520px] lg:translate-x-0"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 id="home-search-category-title" className="text-[17px] font-semibold text-[#101828]">
                  {t.moreCategoriesTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => setCategoryMenuOpen(false)}
                  className="grid h-11 w-11 place-items-center text-[#475467] hover:text-[#101828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff]"
                  aria-label={t.close}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {extraCategories.map(({ slug, icon: Icon }) => {
                  const selected = category === slug
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => selectCategory(slug)}
                      className={`flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-[7px] border px-2 py-2 text-center text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] ${
                        selected
                          ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                          : 'border-[#d8e0ea] text-[#344054] hover:border-[#0866ff]'
                      }`}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                      <span>{categoryLabel(slug, locale)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-4 lg:gap-x-4">
            {categoryLayout.top.map((key) => (
              <HomeFilterControl
                key={key}
                filterKey={key}
                label={t.fields[key]}
                value={filters[key]}
                options={filterOptions(key, category, facets, market)}
                allLabel={t.all}
                locale={locale}
                market={market}
                disabled={key === 'model' && !filters.make}
                onChange={(value) => updateFilter(key, value)}
              />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-4 lg:gap-x-4">
            {categoryLayout.bottom.map((slot) => {
              if (slot === 'mode') {
                return (
                  <PurchaseTypeControl
                    key={slot}
                    label={t.purchaseType}
                    buyLabel={t.buy}
                    leasingLabel={t.leasing}
                    value={intent}
                    onChange={changeIntent}
                  />
                )
              }
              if (slot === 'location') {
                return (
                  <LocationControl
                    key={slot}
                    label={t.location}
                    value={location}
                    suggestions={facetValues(facets.municipalities)}
                    onChange={(value) => {
                      setLocation(value)
                      setGeoAreaId('')
                    }}
                  />
                )
              }
              return (
                <HomeFilterControl
                  key={slot}
                  filterKey={slot}
                  label={t.fields[slot]}
                  value={filters[slot]}
                  options={filterOptions(slot, category, facets, market)}
                  allLabel={t.all}
                  locale={locale}
                  market={market}
                  onChange={(value) => updateFilter(slot, value)}
                />
              )
            })}

            <SearchSubmitButton
              className="hidden lg:flex"
              label={countLabel}
              loading={countLoading}
              loadingLabel={t.updatingCount}
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-5">
            <button
              ref={moreFiltersTriggerRef}
              type="button"
              onClick={resetSearch}
              className="inline-flex min-h-11 items-center gap-2 text-[13px] font-medium text-[#475467] transition hover:text-[#0866ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {t.reset}
            </button>
            <button
              type="button"
              onClick={() => setMoreFiltersOpen(true)}
              aria-expanded={moreFiltersOpen}
              aria-controls="home-search-more-filters"
              className="inline-flex min-h-11 items-center gap-2 text-[13px] font-medium text-[#475467] transition hover:text-[#0866ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff]"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              {t.moreFilters}
            </button>
          </div>

          <SearchSubmitButton
            className="mt-2 flex w-full lg:hidden"
            label={countLabel}
            loading={countLoading}
            loadingLabel={t.updatingCount}
          />
        </div>
      </section>

      {moreFiltersOpen ? (
        <div
          id="home-search-more-filters"
          className="fixed inset-0 z-[150] flex items-end justify-center bg-[#101828]/55 sm:items-center sm:p-6"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setMoreFiltersOpen(false)
          }}
        >
          <section
            ref={moreFiltersDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-search-more-filters-title"
            className="max-h-[88dvh] w-full overflow-y-auto rounded-t-[8px] bg-white px-4 pb-5 pt-4 shadow-[0_24px_64px_rgba(15,23,42,.28)] sm:max-w-[760px] sm:rounded-[8px] sm:px-6 sm:pb-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 id="home-search-more-filters-title" className="text-[20px] font-semibold text-[#101828]">
                {t.moreFiltersTitle}
              </h2>
              <button
                ref={moreFiltersCloseRef}
                type="button"
                onClick={() => setMoreFiltersOpen(false)}
                className="grid h-11 w-11 place-items-center text-[#475467] hover:text-[#101828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff]"
                aria-label={t.close}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3">
              {categoryLayout.advanced.map((key) => (
                <HomeFilterControl
                  key={key}
                  filterKey={key}
                  label={t.fields[key]}
                  value={filters[key]}
                  options={filterOptions(key, category, facets, market)}
                  allLabel={t.all}
                  locale={locale}
                  market={market}
                  onChange={(value) => updateFilter(key, value)}
                />
              ))}
              <HomeSelectControl
                id="home-search-market"
                label={t.market}
                value={market}
                options={marketOptions.map((code) => ({
                  value: code,
                  label: marketLabel(code, locale, t.allEurope),
                }))}
                onChange={setMarket}
              />
            </div>

            <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 text-[14px] font-medium text-[#344054]">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(event) => setVerifiedOnly(event.target.checked)}
                className="h-5 w-5 rounded-[4px] border-[#98a2b3] accent-[#0866ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff]"
              />
              {t.verified}
            </label>

            <button
              type="button"
              onClick={() => setMoreFiltersOpen(false)}
              className="mt-6 min-h-12 w-full rounded-[7px] bg-[#0866ff] px-5 text-[15px] font-semibold text-white transition hover:bg-[#0057e6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/25"
            >
              {t.applyFilters}
            </button>
          </section>
        </div>
      ) : null}
    </form>
  )
}

function HomeFilterControl({
  filterKey,
  label,
  value,
  options,
  allLabel,
  locale,
  market,
  disabled = false,
  onChange,
}: {
  filterKey: HomeSearchFilterKey
  label: string
  value: string
  options: string[]
  allLabel: string
  locale: PublicLocale
  market: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <HomeSelectControl
      id={`home-search-${filterKey}`}
      label={label}
      value={value}
      disabled={disabled}
      options={uniqueOptions([value, ...options]).map((option) => ({
        value: option,
        label: filterOptionLabel({ key: filterKey, value: option, locale, market }),
      }))}
      placeholder={allLabel}
      onChange={onChange}
    />
  )
}

function HomeSelectControl({
  id,
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label htmlFor={id} className="min-w-0 text-[12px] font-semibold leading-4 text-[#344054] sm:text-[13px]">
      <span className="flex min-h-8 items-end pb-1">{label}</span>
      <span className="relative block">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full appearance-none rounded-[7px] border border-[#98a2b3] bg-white px-3 pr-9 text-[13px] font-normal text-[#101828] outline-none transition hover:border-[#667085] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10 disabled:cursor-not-allowed disabled:border-[#d0d5dd] disabled:bg-[#f2f4f7] disabled:text-[#98a2b3] sm:text-[14px]"
        >
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]"
          aria-hidden="true"
        />
      </span>
    </label>
  )
}

function PurchaseTypeControl({
  label,
  buyLabel,
  leasingLabel,
  value,
  onChange,
}: {
  label: string
  buyLabel: string
  leasingLabel: string
  value: Intent
  onChange: (value: Intent) => void
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="flex min-h-8 items-end pb-1 text-[12px] font-semibold leading-4 text-[#344054] sm:text-[13px]">
        {label}
      </legend>
      <div className="grid min-h-11 grid-cols-2 overflow-hidden rounded-[7px] border border-[#98a2b3] bg-white">
        {([
          ['sale', buyLabel],
          ['leasing', leasingLabel],
        ] as const).map(([option, optionLabel]) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`min-h-11 px-2 text-[13px] font-medium transition focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0866ff] sm:text-[14px] ${
              value === option
                ? 'bg-[#0866ff] text-white'
                : 'bg-white text-[#475467] hover:bg-[#f5f9ff] hover:text-[#0866ff]'
            }`}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function LocationControl({
  label,
  value,
  suggestions,
  onChange,
}: {
  label: string
  value: string
  suggestions: string[]
  onChange: (value: string) => void
}) {
  return (
    <label htmlFor="home-search-location" className="col-span-2 min-w-0 text-[12px] font-semibold leading-4 text-[#344054] sm:text-[13px] lg:col-span-1">
      <span className="flex min-h-8 items-end pb-1">{label}</span>
      <span className="relative block">
        <input
          id="home-search-location"
          list="home-search-location-options"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="address-level2"
          className="min-h-11 w-full rounded-[7px] border border-[#98a2b3] bg-white px-3 pr-9 text-[13px] font-normal text-[#101828] outline-none transition placeholder:text-[#98a2b3] hover:border-[#667085] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10 sm:text-[14px]"
        />
        <MapPin
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]"
          aria-hidden="true"
        />
        <datalist id="home-search-location-options">
          {uniqueOptions(suggestions).map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </span>
    </label>
  )
}

function SearchSubmitButton({
  label,
  loading,
  loadingLabel,
  className,
}: {
  label: string
  loading: boolean
  loadingLabel: string
  className: string
}) {
  return (
    <button
      type="submit"
      className={`${className} min-h-11 items-center justify-center gap-2 rounded-[7px] bg-[#0866ff] px-4 text-center text-[13px] font-semibold leading-5 text-white transition hover:bg-[#0057e6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/25 sm:text-[14px]`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" aria-label={loadingLabel} />
      ) : (
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span>{label}</span>
    </button>
  )
}
