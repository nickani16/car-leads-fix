'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode, type SVGProps } from 'react'
import {
  BusFront,
  Check,
  ChevronDown,
  Construction,
  Search,
  Tractor,
} from 'lucide-react'
import {
  AutorellBikeIcon,
  AutorellCaravanIcon,
  AutorellCarIcon,
  AutorellMotorbikeIcon,
  AutorellScooterIcon,
  AutorellTruckIcon,
  AutorellVanIcon,
} from './AutorellCategoryIcons'
import CountryFlag from './CountryFlag'
import {
  localizePublicHref,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'

type ListingIntent = 'sale' | 'leasing' | 'rent'

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
  'e-scooters': '/marketplace/e-scooters',
}

const categoryOptions: Array<{
  value: MarketplaceCategorySlug
  sv: string
  en: string
  de: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}> = [
  { value: 'cars', sv: 'Bilar', en: 'Cars', de: 'Autos', icon: AutorellCarIcon },
  { value: 'vans', sv: 'Transportbilar', en: 'Vans', de: 'Transporter', icon: AutorellVanIcon },
  { value: 'motorcycles', sv: 'Motorcyklar', en: 'Motorcycles', de: 'Motorräder', icon: AutorellMotorbikeIcon },
  { value: 'motorhomes', sv: 'Husbilar', en: 'Motorhomes', de: 'Wohnmobile', icon: BusFront },
  { value: 'caravans', sv: 'Husvagnar', en: 'Caravans', de: 'Wohnwagen', icon: AutorellCaravanIcon },
  { value: 'trucks', sv: 'Lastbilar', en: 'Trucks', de: 'Lkw', icon: AutorellTruckIcon },
  { value: 'agriculture', sv: 'Lantbruksmaskiner', en: 'Agricultural machinery', de: 'Landmaschinen', icon: Tractor },
  { value: 'construction', sv: 'Entreprenadmaskiner', en: 'Construction machinery', de: 'Baumaschinen', icon: Construction },
  { value: 'electric-bikes', sv: 'Cyklar', en: 'Bikes', de: 'Fahrräder', icon: AutorellBikeIcon },
  { value: 'e-scooters', sv: 'Sparkcyklar', en: 'Scooters', de: 'Scooter', icon: AutorellScooterIcon },
]

export default function MarketplaceSearch({
  locale = 'sv',
  defaultCountry,
}: {
  locale?: PublicLocale
  defaultCountry?: string
}) {
  const router = useRouter()
  const [category, setCategory] = useState<MarketplaceCategorySlug>('cars')
  const [listingIntent, setListingIntent] = useState<ListingIntent>('sale')
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState(() =>
    resolveDefaultCountry(defaultCountry, locale),
  )
  const [openPicker, setOpenPicker] = useState<'category' | 'country' | null>(null)
  const pickerRef = useRef<HTMLFormElement>(null)
  const countryLocale = locale
  const selectedCategory =
    categoryOptions.find((option) => option.value === category) ||
    categoryOptions[0]
  const selectedCategoryLabel = getCategoryOptionLabel(selectedCategory, locale)
  const countryOptions = useMemo(
    () =>
      euCountries
        .map(([code]) => code.toUpperCase())
        .sort((a, b) =>
          getEuCountryName(a, countryLocale).localeCompare(
            getEuCountryName(b, countryLocale),
            countryLocale,
          ),
        ),
    [countryLocale],
  )
  const selectedCountryLabel = country
    ? getEuCountryName(country, countryLocale)
    : copyAllEurope(locale)
  const searchPlaceholders = useMemo(
    () => getSearchPlaceholders(category, locale),
    [category, locale],
  )
  const copy =
    locale === 'sv'
      ? {
          category: 'Kategori',
          query: 'Sök',
          place: 'Plats',
          allEurope: 'Hela Europa',
        }
      : locale === 'de'
        ? {
            category: 'Kategorie',
            query: 'Suche',
            place: 'Standort',
            allEurope: 'Ganz Europa',
          }
        : locale === 'en'
          ? {
            category: 'Category',
            query: 'Search',
            place: 'Location',
            allEurope: 'All of Europe',
          }
          : translatePublicObject(locale, {
              category: 'Category',
              query: 'Search',
              place: 'Location',
            allEurope: 'All of Europe',
          })
  const intentLabels = getIntentLabels(locale)

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setOpenPicker(null)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOpenPicker(null)
    const route = categoryRoutes[category] || '/marketplace/vehicles'
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (country) params.set('country', country)
    if (listingIntent !== 'sale') params.set('intent', listingIntent)
    router.push(localizePublicHref(locale, `${route}${params.size ? `?${params}` : ''}`))
  }

  return (
    <form
      ref={pickerRef}
      onSubmit={submit}
      className="relative w-full min-w-0 max-w-full overflow-visible rounded-[22px] border border-white bg-white p-2 shadow-[0_20px_54px_rgba(15,23,42,.16)] backdrop-blur-xl sm:rounded-[26px]"
      role="search"
    >
      <div className="absolute left-8 top-[-46px] z-30 hidden items-end gap-2 sm:flex">
        {(['sale', 'leasing', 'rent'] as const).map((intent) => {
          const selected = listingIntent === intent
          return (
            <button
              key={intent}
              type="button"
              onClick={() => setListingIntent(intent)}
              className={`min-h-[48px] min-w-[118px] rounded-t-[13px] border px-5 text-sm font-semibold transition ${
                selected
                  ? 'translate-y-[1px] border-white bg-white text-[#0866ff] shadow-[0_-8px_24px_rgba(15,23,42,.12)]'
                  : 'border-white/70 bg-white/86 text-[#344054] shadow-[0_-6px_18px_rgba(15,23,42,.10)] backdrop-blur-xl hover:bg-white hover:text-[#0866ff]'
              }`}
            >
              {intentLabels[intent]}
            </button>
          )
        })}
      </div>
      <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-[1.55fr_1.05fr_1fr_auto] sm:items-center">
        <SearchField label={copy.query} icon={Search} className="col-span-2 sm:col-span-1">
          <AnimatedSearchInput
            value={query}
            onChange={setQuery}
            placeholders={searchPlaceholders}
          />
        </SearchField>

        <SearchField
          label={copy.category}
          icon={selectedCategory.icon}
          active={openPicker === 'category'}
        >
          <button
            type="button"
            aria-expanded={openPicker === 'category'}
            onClick={() => setOpenPicker((current) => (current === 'category' ? null : 'category'))}
            className="marketplace-search-control flex h-7 w-full min-w-0 items-center justify-between gap-2 bg-transparent text-left text-sm font-semibold text-[#101828] outline-none"
          >
            <span className="truncate">{selectedCategoryLabel}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-[#667085] transition ${openPicker === 'category' ? 'rotate-180 text-[#0866ff]' : ''}`} />
          </button>
          {openPicker === 'category' ? (
            <div className="absolute left-0 top-[calc(100%+12px)] z-50 w-[min(92vw,560px)] overflow-hidden rounded-[22px] border border-[#d9e4f2] bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,.22)] ring-1 ring-white/70">
              <div className="px-3 pb-2 pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0866ff]">
                  {copy.category}
                </p>
              </div>
              <div className="grid max-h-[360px] gap-1 overflow-y-auto pr-1 sm:grid-cols-2">
                {categoryOptions.map((option) => {
                  const Icon = option.icon
                  const label = getCategoryOptionLabel(option, locale)
                  const selected = option.value === category
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setCategory(option.value)
                        setOpenPicker(null)
                      }}
                      className={`flex min-h-[58px] items-center gap-3 rounded-[16px] px-3 text-left transition hover:bg-[#f5f9ff] ${
                        selected ? 'bg-[#eef5ff] ring-1 ring-[#bcd5ff]' : 'bg-white'
                      }`}
                    >
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[13px] ${
                        selected ? 'bg-[#0866ff] text-white' : 'bg-[#eef4ff] text-[#0866ff]'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[#101828]">
                          {label}
                        </span>
                        <span className="mt-0.5 block text-[12px] font-semibold text-[#667085]">
                          {getCategoryHint(option.value, locale)}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </SearchField>

        <SearchField
          label={copy.place}
          leading={
            <CountryFlag
              code={country || 'eu'}
              className="h-6 w-6 rounded-full shadow-sm ring-1 ring-black/5"
            />
          }
          active={openPicker === 'country'}
        >
          <button
            type="button"
            aria-expanded={openPicker === 'country'}
            onClick={() => setOpenPicker((current) => (current === 'country' ? null : 'country'))}
            className="marketplace-search-control flex h-7 w-full min-w-0 items-center justify-between gap-2 bg-transparent text-left text-sm font-semibold text-[#101828] outline-none"
          >
            <span className="truncate">{selectedCountryLabel}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-[#667085] transition ${openPicker === 'country' ? 'rotate-180 text-[#0866ff]' : ''}`} />
          </button>
          {openPicker === 'country' ? (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(92vw,500px)] overflow-hidden rounded-[18px] border border-[#d8e2f1] bg-white p-3 shadow-[0_22px_62px_rgba(15,23,42,.18)] ring-1 ring-white/80">
              <div className="px-2 pb-3 pt-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0866ff]">
                  {copy.place}
                </p>
                <p className="mt-1 text-xs font-medium text-[#667085]">
                  {locale === 'sv'
                    ? 'Välj marknad för annonser och valuta.'
                    : locale === 'de'
                      ? 'Markt fuer Anzeigen und Waehrung waehlen.'
                      : 'Choose market for listings and currency.'}
                </p>
              </div>
              <div className="grid max-h-[360px] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                <CountryOptionButton
                  code=""
                  label={copy.allEurope}
                  selected={!country}
                  onSelect={() => {
                    setCountry('')
                    setOpenPicker(null)
                  }}
                />
                {countryOptions.map((code) => (
                  <CountryOptionButton
                    key={code}
                    code={code}
                    label={getEuCountryName(code, countryLocale)}
                    selected={country === code}
                    onSelect={() => {
                      setCountry(code)
                      setOpenPicker(null)
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </SearchField>

        <button type="submit" className="col-span-2 inline-flex min-h-[54px] w-full min-w-0 items-center justify-center gap-2 rounded-[17px] bg-[#0866ff] px-7 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(8,102,255,.22)] ring-1 ring-[#005ee8]/10 transition hover:bg-[#0057e6] sm:col-span-1 sm:min-h-[58px] sm:w-auto sm:min-w-[148px] sm:rounded-[20px] lg:rounded-[22px]">
          <Search className="h-5 w-5" />
          {getSearchCta(category, locale, listingIntent)}
        </button>
      </div>
    </form>
  )
}

function AnimatedSearchInput({
  value,
  onChange,
  placeholders,
}: {
  value: string
  onChange: (value: string) => void
  placeholders: string[]
}) {
  const [index, setIndex] = useState(0)
  const [visibleLetters, setVisibleLetters] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const activePlaceholder = placeholders[index % placeholders.length] || ''
  const typedPlaceholder = activePlaceholder.slice(0, visibleLetters)

  useEffect(() => {
    if (!activePlaceholder) return

    const delay =
      !deleting && visibleLetters >= activePlaceholder.length
        ? 1150
        : deleting
          ? 32
          : 52

    const timeout = window.setTimeout(() => {
      if (!deleting && visibleLetters < activePlaceholder.length) {
        setVisibleLetters((current) => current + 1)
        return
      }

      if (!deleting && visibleLetters >= activePlaceholder.length) {
        setDeleting(true)
        return
      }

      if (deleting && visibleLetters > 0) {
        setVisibleLetters((current) => current - 1)
        return
      }

      setDeleting(false)
      setIndex((current) => (current + 1) % placeholders.length)
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [activePlaceholder, deleting, placeholders.length, visibleLetters])

  return (
    <span className="relative block">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={activePlaceholder}
        className="marketplace-search-control relative z-10 h-7 min-w-0 max-w-full w-full bg-transparent text-sm font-semibold text-[#101828] outline-none placeholder:text-transparent"
      />
      {!value ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-7 min-w-0 items-center text-sm font-normal leading-7 text-[#98a2b3]"
        >
          <span className="truncate">{typedPlaceholder}</span>
          <span className="hero-typing-caret ml-0.5 h-4 w-px shrink-0 rounded-full bg-[#98a2b3]/75" />
        </span>
      ) : null}
    </span>
  )
}

function getIntentLabels(locale: PublicLocale): Record<ListingIntent, string> {
  if (locale === 'sv') {
    return {
      sale: 'Till salu',
      leasing: 'Leasing',
      rent: 'Uthyrning',
    }
  }
  if (locale === 'de') {
    return {
      sale: 'Kaufen',
      leasing: 'Leasing',
      rent: 'Mieten',
    }
  }
  return {
    sale: 'For sale',
    leasing: 'Leasing',
    rent: 'Rental',
  }
}

function getSearchCta(
  category: MarketplaceCategorySlug,
  locale: PublicLocale,
  intent: ListingIntent,
) {
  if (intent === 'leasing') {
    if (locale === 'sv') return 'SÃ¶k leasing'
    if (locale === 'de') return 'Leasing suchen'
    return 'Search leasing'
  }
  if (intent === 'rent') {
    if (locale === 'sv') return 'SÃ¶k uthyrning'
    if (locale === 'de') return 'Miete suchen'
    return 'Search rentals'
  }

  const sv: Record<MarketplaceCategorySlug, string> = {
    cars: 'Sök bil',
    vans: 'Sök transportbil',
    motorcycles: 'Sök motorcykel',
    motorhomes: 'Sök husbil',
    caravans: 'Sök husvagn',
    trucks: 'Sök lastbil',
    agriculture: 'Sök maskin',
    construction: 'Sök maskin',
    'electric-bikes': 'Sök cykel',
    'e-scooters': 'Sök sparkcykel',
  }
  const en: Record<MarketplaceCategorySlug, string> = {
    cars: 'Search cars',
    vans: 'Search vans',
    motorcycles: 'Search motorcycles',
    motorhomes: 'Search motorhomes',
    caravans: 'Search caravans',
    trucks: 'Search trucks',
    agriculture: 'Search machines',
    construction: 'Search machines',
    'electric-bikes': 'Search bikes',
    'e-scooters': 'Search scooters',
  }
  const de: Record<MarketplaceCategorySlug, string> = {
    cars: 'Autos suchen',
    vans: 'Transporter suchen',
    motorcycles: 'Motorräder suchen',
    motorhomes: 'Wohnmobile suchen',
    caravans: 'Wohnwagen suchen',
    trucks: 'Lkw suchen',
    agriculture: 'Maschinen suchen',
    construction: 'Maschinen suchen',
    'electric-bikes': 'Fahrräder suchen',
    'e-scooters': 'Scooter suchen',
  }

  if (locale === 'sv') return sv[category]
  if (locale === 'de') return de[category]
  return en[category]
}

function getCategoryOptionLabel(
  option: (typeof categoryOptions)[number],
  locale: PublicLocale,
) {
  if (locale === 'sv' || locale === 'de' || locale === 'en') {
    return option[locale]
  }
  return translatePublic(locale, option.en)
}

function copyAllEurope(locale: PublicLocale) {
  if (locale === 'sv') return 'Hela Europa'
  if (locale === 'de') return 'Ganz Europa'
  if (locale === 'en') return 'All of Europe'
  return translatePublic(locale, 'All of Europe')
}

function getCategoryHint(category: MarketplaceCategorySlug, locale: PublicLocale) {
  const sv: Record<MarketplaceCategorySlug, string> = {
    cars: 'Personbilar och elbilar',
    vans: 'Skåp, pickup och transport',
    motorcycles: 'MC och touring',
    motorhomes: 'Resefordon och camper',
    caravans: 'Husvagnar för semester',
    trucks: 'Tunga fordon',
    agriculture: 'Traktorer och redskap',
    construction: 'Maskiner och entreprenad',
    'electric-bikes': 'Elcyklar och cyklar',
    'e-scooters': 'Elsparkcyklar',
  }
  const en: Record<MarketplaceCategorySlug, string> = {
    cars: 'Passenger cars and EVs',
    vans: 'Vans, pickups and transport',
    motorcycles: 'Motorcycles and touring',
    motorhomes: 'Travel vehicles and campers',
    caravans: 'Caravans for holidays',
    trucks: 'Heavy vehicles',
    agriculture: 'Tractors and equipment',
    construction: 'Machines and construction',
    'electric-bikes': 'E-bikes and bicycles',
    'e-scooters': 'Electric scooters',
  }
  const de: Record<MarketplaceCategorySlug, string> = {
    cars: 'Pkw und Elektroautos',
    vans: 'Transporter und Pickups',
    motorcycles: 'Motorräder und Touring',
    motorhomes: 'Reisefahrzeuge und Camper',
    caravans: 'Wohnwagen für Reisen',
    trucks: 'Schwere Fahrzeuge',
    agriculture: 'Traktoren und Geräte',
    construction: 'Maschinen und Bau',
    'electric-bikes': 'E-Bikes und Fahrräder',
    'e-scooters': 'E-Scooter',
  }

  if (locale === 'sv') return sv[category]
  if (locale === 'de') return de[category]
  return en[category]
}

function CountryOptionButton({
  code,
  label,
  selected,
  onSelect,
}: {
  code: string
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-h-[46px] items-center gap-3 rounded-[12px] px-3 text-left transition hover:bg-[#f7faff] ${
        selected ? 'bg-[#f0f6ff] ring-1 ring-[#acd0ff]' : 'bg-white'
      }`}
    >
      <CountryFlag code={code || 'eu'} className="h-5 w-7 shrink-0 rounded-[5px] shadow-sm ring-1 ring-black/5" />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#101828]">
        {label}
      </span>
      {selected ? (
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#0866ff] text-white">
          <Check className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </button>
  )
}

function getSearchPlaceholders(
  category: MarketplaceCategorySlug,
  locale: PublicLocale,
) {
  const sv: Record<MarketplaceCategorySlug, string[]> = {
    cars: ['Sök efter märke...', 'Sök efter modell...', 'Sök efter växellåda...', 'Sök efter drivmedel...', 'Sök efter årsmodell...'],
    vans: ['Sök efter märke...', 'Sök efter modell...', 'Sök efter skåp...', 'Sök efter drivmedel...', 'Sök efter årsmodell...'],
    motorcycles: ['Sök efter märke...', 'Sök efter modell...', 'Sök efter motor...', 'Sök efter körsträcka...', 'Sök efter årsmodell...'],
    motorhomes: ['Sök efter märke...', 'Sök efter modell...', 'Sök efter bäddar...', 'Sök efter drivmedel...', 'Sök efter årsmodell...'],
    caravans: ['Sök efter märke...', 'Sök efter modell...', 'Sök efter bäddar...', 'Sök efter längd...', 'Sök efter årsmodell...'],
    trucks: ['Sök efter märke...', 'Sök efter modell...', 'Sök efter axlar...', 'Sök efter drivmedel...', 'Sök efter årsmodell...'],
    agriculture: ['Sök efter märke...', 'Sök efter modell...', 'Sök efter redskap...', 'Sök efter timmar...', 'Sök efter årsmodell...'],
    construction: ['Sök efter märke...', 'Sök efter modell...', 'Sök efter maskintyp...', 'Sök efter timmar...', 'Sök efter årsmodell...'],
    'electric-bikes': ['Sök efter märke...', 'Sök efter modell...', 'Sök efter batteri...', 'Sök efter räckvidd...', 'Sök efter årsmodell...'],
    'e-scooters': ['Sök efter märke...', 'Sök efter modell...', 'Sök efter batteri...', 'Sök efter räckvidd...', 'Sök efter årsmodell...'],
  }
  const en: Record<MarketplaceCategorySlug, string[]> = {
    cars: ['Search by make...', 'Search by model...', 'Search by gearbox...', 'Search by fuel...', 'Search by year...'],
    vans: ['Search by make...', 'Search by model...', 'Search by body...', 'Search by fuel...', 'Search by year...'],
    motorcycles: ['Search by make...', 'Search by model...', 'Search by engine...', 'Search by mileage...', 'Search by year...'],
    motorhomes: ['Search by make...', 'Search by model...', 'Search by beds...', 'Search by fuel...', 'Search by year...'],
    caravans: ['Search by make...', 'Search by model...', 'Search by beds...', 'Search by length...', 'Search by year...'],
    trucks: ['Search by make...', 'Search by model...', 'Search by axles...', 'Search by fuel...', 'Search by year...'],
    agriculture: ['Search by make...', 'Search by model...', 'Search by implement...', 'Search by hours...', 'Search by year...'],
    construction: ['Search by make...', 'Search by model...', 'Search by machine type...', 'Search by hours...', 'Search by year...'],
    'electric-bikes': ['Search by make...', 'Search by model...', 'Search by battery...', 'Search by range...', 'Search by year...'],
    'e-scooters': ['Search by make...', 'Search by model...', 'Search by battery...', 'Search by range...', 'Search by year...'],
  }
  const de: Record<MarketplaceCategorySlug, string[]> = {
    cars: ['Nach Marke suchen...', 'Nach Modell suchen...', 'Nach Getriebe suchen...', 'Nach Kraftstoff suchen...', 'Nach Baujahr suchen...'],
    vans: ['Nach Marke suchen...', 'Nach Modell suchen...', 'Nach Aufbau suchen...', 'Nach Kraftstoff suchen...', 'Nach Baujahr suchen...'],
    motorcycles: ['Nach Marke suchen...', 'Nach Modell suchen...', 'Nach Motor suchen...', 'Nach Laufleistung suchen...', 'Nach Baujahr suchen...'],
    motorhomes: ['Nach Marke suchen...', 'Nach Modell suchen...', 'Nach Betten suchen...', 'Nach Kraftstoff suchen...', 'Nach Baujahr suchen...'],
    caravans: ['Nach Marke suchen...', 'Nach Modell suchen...', 'Nach Betten suchen...', 'Nach Länge suchen...', 'Nach Baujahr suchen...'],
    trucks: ['Nach Marke suchen...', 'Nach Modell suchen...', 'Nach Achsen suchen...', 'Nach Kraftstoff suchen...', 'Nach Baujahr suchen...'],
    agriculture: ['Nach Marke suchen...', 'Nach Modell suchen...', 'Nach Gerät suchen...', 'Nach Stunden suchen...', 'Nach Baujahr suchen...'],
    construction: ['Nach Marke suchen...', 'Nach Modell suchen...', 'Nach Maschinentyp suchen...', 'Nach Stunden suchen...', 'Nach Baujahr suchen...'],
    'electric-bikes': ['Nach Marke suchen...', 'Nach Modell suchen...', 'Nach Akku suchen...', 'Nach Reichweite suchen...', 'Nach Baujahr suchen...'],
    'e-scooters': ['Nach Marke suchen...', 'Nach Modell suchen...', 'Nach Akku suchen...', 'Nach Reichweite suchen...', 'Nach Baujahr suchen...'],
  }

  if (locale === 'sv') return sv[category]
  if (locale === 'de') return de[category]
  return en[category]
}

function resolveDefaultCountry(
  defaultCountry: string | undefined,
  locale: PublicLocale,
) {
  const requested = (defaultCountry || '').toUpperCase()
  const validCountries = new Set(euCountries.map(([code]) => code.toUpperCase()))
  if (validCountries.has(requested)) return requested
  if (locale === 'sv') return 'SE'
  if (locale === 'de') return 'DE'
  return ''
}

function SearchField({
  label,
  icon: Icon,
  leading,
  children,
  className = '',
  active = false,
}: {
  label: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  leading?: ReactNode
  children: ReactNode
  className?: string
  active?: boolean
}) {
  return (
    <div className={`relative flex min-w-0 items-center gap-3 overflow-visible rounded-[15px] border border-[#e6e9ee] bg-white px-4 py-2 transition focus-within:border-[#0866ff]/45 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0866ff]/8 sm:border-0 sm:focus-within:ring-0 ${active ? 'z-40' : 'z-0'} ${className}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#eaf1ff] text-[#0866ff]">
        {leading || (Icon ? <Icon className="h-[18px] w-[18px]" /> : null)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#98a2b3]">{label}</span>
        {children}
      </span>
    </div>
  )
}
