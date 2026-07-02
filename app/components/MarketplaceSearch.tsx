'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import {
  Bike,
  BusFront,
  CarFront,
  ChevronDown,
  Construction,
  MapPin,
  Search,
  Scooter,
  Tractor,
  Truck,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import {
  localizePublicHref,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'

const categoryRoutes: Record<string, string> = {
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
  value: string
  sv: string
  en: string
  de: string
  icon: LucideIcon
}> = [
  { value: 'cars', sv: 'Bilar', en: 'Cars', de: 'Autos', icon: CarFront },
  { value: 'vans', sv: 'Transportbilar', en: 'Vans', de: 'Transporter', icon: BusFront },
  { value: 'motorcycles', sv: 'Motorcyklar', en: 'Motorcycles', de: 'Motorräder', icon: Bike },
  { value: 'motorhomes', sv: 'Husbilar', en: 'Motorhomes', de: 'Wohnmobile', icon: BusFront },
  { value: 'caravans', sv: 'Husvagnar', en: 'Caravans', de: 'Wohnwagen', icon: Warehouse },
  { value: 'trucks', sv: 'Lastbilar', en: 'Trucks', de: 'Lkw', icon: Truck },
  { value: 'agriculture', sv: 'Lantbruksmaskiner', en: 'Agricultural machinery', de: 'Landmaschinen', icon: Tractor },
  { value: 'construction', sv: 'Entreprenadmaskiner', en: 'Construction machinery', de: 'Baumaschinen', icon: Construction },
  { value: 'electric-bikes', sv: 'Cyklar', en: 'Bikes', de: 'Fahrräder', icon: Bike },
  { value: 'e-scooters', sv: 'Sparkcyklar', en: 'Scooters', de: 'Scooter', icon: Scooter },
]

const popularMakes = ['Audi', 'BMW', 'Ford', 'Kia', 'Mercedes-Benz', 'Polestar', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo']

export default function MarketplaceSearch({
  locale = 'sv',
  defaultCountry,
}: {
  locale?: PublicLocale
  defaultCountry?: string
}) {
  const router = useRouter()
  const [category, setCategory] = useState('cars')
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState(() =>
    resolveDefaultCountry(defaultCountry, locale),
  )
  const selectedCategory =
    categoryOptions.find((option) => option.value === category) ||
    categoryOptions[0]
  const countryLocale = locale
  const copy =
    locale === 'sv'
      ? {
          category: 'Kategori',
          query: 'Vad letar du efter?',
          queryPlaceholder: 'Märke eller modell',
          place: 'Plats',
          allEurope: 'Hela Europa',
          search: 'Sök fordon',
        }
      : locale === 'de'
        ? {
            category: 'Kategorie',
            query: 'Was suchen Sie?',
            queryPlaceholder: 'Marke oder Modell',
            place: 'Standort',
            allEurope: 'Ganz Europa',
            search: 'Fahrzeuge suchen',
          }
        : locale === 'en'
          ? {
            category: 'Category',
            query: 'What are you looking for?',
            queryPlaceholder: 'Make or model',
            place: 'Location',
            allEurope: 'All of Europe',
            search: 'Search vehicles',
          }
          : translatePublicObject(locale, {
              category: 'Category',
              query: 'What are you looking for?',
              queryPlaceholder: 'Make or model',
              place: 'Location',
              allEurope: 'All of Europe',
              search: 'Search vehicles',
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
      className="w-full min-w-0 max-w-full overflow-hidden rounded-[24px] border border-white/80 bg-white/96 p-2.5 shadow-[0_24px_65px_rgba(15,23,42,.18)] backdrop-blur-xl sm:rounded-[26px]"
      role="search"
    >
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[1.05fr_1.55fr_1fr_auto] sm:items-center">
        <SearchField label={copy.category} icon={selectedCategory.icon}>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="marketplace-search-control h-7 min-w-0 max-w-full w-full appearance-none bg-transparent pr-7 text-sm font-semibold outline-none">
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

        <SearchField label={copy.query} icon={Search}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.queryPlaceholder}
            list="marketplace-makes"
            className="marketplace-search-control h-7 min-w-0 max-w-full w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
          />
          <datalist id="marketplace-makes">
            {popularMakes.map((make) => <option key={make} value={make} />)}
          </datalist>
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

        <button type="submit" className="inline-flex min-h-14 w-full min-w-0 items-center justify-center gap-2 rounded-[16px] bg-[#0866ff] px-7 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,102,255,.25)] transition hover:-translate-y-0.5 hover:bg-[#0057e6] sm:min-h-[62px] sm:w-auto">
          <Search className="h-5 w-5" />
          {copy.search}
        </button>
      </div>
    </form>
  )
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
}: {
  label: string
  icon: typeof Search
  children: React.ReactNode
}) {
  return (
    <label className="relative flex min-w-0 items-center gap-3 overflow-hidden rounded-[17px] border border-[#e6e9ee] bg-[#f8fafc] px-4 py-2.5 transition focus-within:border-[#0866ff]/45 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0866ff]/8 sm:border-0 sm:bg-transparent sm:focus-within:ring-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#eaf1ff] text-[#0866ff]">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#667085]">{label}</span>
        {children}
      </span>
    </label>
  )
}
