'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useState, type ComponentType, type ReactNode, type SVGProps } from 'react'
import {
  BusFront,
  ChevronDown,
  Construction,
  MapPin,
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
import {
  localizePublicHref,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'

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
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState(() =>
    resolveDefaultCountry(defaultCountry, locale),
  )
  const selectedCategory =
    categoryOptions.find((option) => option.value === category) ||
    categoryOptions[0]
  const searchPlaceholders = useMemo(
    () => getSearchPlaceholders(category, locale),
    [category, locale],
  )
  const countryLocale = locale
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const route = categoryRoutes[category] || '/marketplace/cars'
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (country) params.set('country', country)
    router.push(localizePublicHref(locale, `${route}${params.size ? `?${params}` : ''}`))
  }

  return (
    <form
      onSubmit={submit}
      className="w-full min-w-0 max-w-full overflow-hidden rounded-[22px] border border-white bg-white p-2 shadow-[0_20px_54px_rgba(15,23,42,.16)] backdrop-blur-xl sm:rounded-[26px]"
      role="search"
    >
      <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-[1.55fr_1.05fr_1fr_auto] sm:items-center">
        <SearchField label={copy.query} icon={Search} className="col-span-2 sm:col-span-1">
          <AnimatedSearchInput
            value={query}
            onChange={setQuery}
            placeholders={searchPlaceholders}
          />
        </SearchField>

        <SearchField label={copy.category} icon={selectedCategory.icon}>
          <select value={category} onChange={(event) => setCategory(event.target.value as MarketplaceCategorySlug)} className="marketplace-search-control h-7 min-w-0 max-w-full w-full appearance-none bg-transparent pr-7 text-sm font-semibold outline-none">
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {locale === 'sv' || locale === 'de' || locale === 'en'
                  ? option[locale]
                  : translatePublic(locale, option.en)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute bottom-2 right-4 h-4 w-4 text-[#667085]" />
        </SearchField>

        <SearchField label={copy.place} icon={MapPin}>
          <select value={country} onChange={(event) => setCountry(event.target.value)} className="marketplace-search-control h-7 min-w-0 max-w-full w-full appearance-none bg-transparent pr-7 text-sm font-semibold outline-none">
            <option value="">{copy.allEurope}</option>
            {euCountries
              .map(([code]) => code)
              .sort((a, b) => getEuCountryName(a, countryLocale).localeCompare(getEuCountryName(b, countryLocale), countryLocale))
              .map((code) => (
                <option key={code} value={code.toUpperCase()}>
                  {getEuCountryName(code, countryLocale)}
                </option>
              ))}
          </select>
          <ChevronDown className="pointer-events-none absolute bottom-2 right-4 h-4 w-4 text-[#667085]" />
        </SearchField>

        <button type="submit" className="col-span-2 inline-flex min-h-[54px] w-full min-w-0 items-center justify-center gap-2 rounded-[17px] bg-[#0866ff] px-7 text-sm font-bold text-white shadow-[0_14px_30px_rgba(8,102,255,.22)] ring-1 ring-[#005ee8]/10 transition hover:bg-[#0057e6] sm:col-span-1 sm:min-h-[58px] sm:w-auto sm:min-w-[148px] sm:rounded-[20px] lg:rounded-[22px]">
          <Search className="h-5 w-5" />
          {getSearchCta(category, locale)}
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

function getSearchCta(category: MarketplaceCategorySlug, locale: PublicLocale) {
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
  children,
  className = '',
}: {
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`relative flex min-w-0 items-center gap-3 overflow-hidden rounded-[15px] border border-[#e6e9ee] bg-white px-4 py-2 transition focus-within:border-[#0866ff]/45 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0866ff]/8 sm:border-0 sm:focus-within:ring-0 ${className}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#eaf1ff] text-[#0866ff]">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#98a2b3]">{label}</span>
        {children}
      </span>
    </label>
  )
}
