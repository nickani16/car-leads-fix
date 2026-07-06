'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState, type ComponentType, type SVGProps } from 'react'
import {
  BusFront,
  ChevronDown,
  Construction,
  Search,
  SlidersHorizontal,
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
import { euCountries, getEuCountryName } from '@/lib/eu-countries'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

type SearchMode = 'sale' | 'leasing' | 'rent'
type HeroCategory = MarketplaceCategorySlug | 'all'

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
  value: HeroCategory
  sv: string
  en: string
  de: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}> = [
  { value: 'all', sv: 'Alla kategorier', en: 'All categories', de: 'Alle Kategorien', icon: AutorellCarIcon },
  { value: 'cars', sv: 'Bilar', en: 'Cars', de: 'Autos', icon: AutorellCarIcon },
  { value: 'vans', sv: 'Transportbilar', en: 'Vans', de: 'Transporter', icon: AutorellVanIcon },
  { value: 'motorcycles', sv: 'Motorcyklar', en: 'Motorcycles', de: 'Motorrader', icon: AutorellMotorbikeIcon },
  { value: 'motorhomes', sv: 'Husbilar', en: 'Motorhomes', de: 'Wohnmobile', icon: BusFront },
  { value: 'caravans', sv: 'Husvagnar', en: 'Caravans', de: 'Wohnwagen', icon: AutorellCaravanIcon },
  { value: 'trucks', sv: 'Lastbilar', en: 'Trucks', de: 'Lkw', icon: AutorellTruckIcon },
  { value: 'agriculture', sv: 'Lantbruk', en: 'Agriculture', de: 'Landmaschinen', icon: Tractor },
  { value: 'construction', sv: 'Entreprenad', en: 'Construction', de: 'Baumaschinen', icon: Construction },
  { value: 'electric-bikes', sv: 'Cyklar', en: 'Bikes', de: 'Fahrrader', icon: AutorellBikeIcon },
  { value: 'e-scooters', sv: 'Sparkcyklar', en: 'Scooters', de: 'Scooter', icon: AutorellScooterIcon },
]

const homeSearchCopy = {
  sv: {
    tabs: {
      sale: 'Fordon till salu',
      leasing: 'Leasing',
      rent: 'Hyra',
    },
    query: 'Sök fordon, märke eller modell',
    category: 'Kategori',
    make: 'Märke',
    model: 'Modell',
    place: 'Plats',
    allEurope: 'Hela Europa',
    moreFilters: 'Fler filter',
    lessFilters: 'Dölj filter',
    priceFrom: 'Pris från',
    priceTo: 'Pris till',
    yearFrom: 'Årsmodell från',
    fuel: 'Drivmedel',
    fuelAny: 'Alla drivmedel',
    search: 'Sök fordon',
  },
  en: {
    tabs: {
      sale: 'Vehicles for sale',
      leasing: 'Leasing',
      rent: 'Rent',
    },
    query: 'Search vehicle, make or model',
    category: 'Category',
    make: 'Make',
    model: 'Model',
    place: 'Location',
    allEurope: 'All of Europe',
    moreFilters: 'More filters',
    lessFilters: 'Hide filters',
    priceFrom: 'Price from',
    priceTo: 'Price to',
    yearFrom: 'Model year from',
    fuel: 'Fuel',
    fuelAny: 'Any fuel',
    search: 'Search vehicles',
  },
  de: {
    tabs: {
      sale: 'Fahrzeuge kaufen',
      leasing: 'Leasing',
      rent: 'Mieten',
    },
    query: 'Fahrzeug, Marke oder Modell suchen',
    category: 'Kategorie',
    make: 'Marke',
    model: 'Modell',
    place: 'Standort',
    allEurope: 'Ganz Europa',
    moreFilters: 'Weitere Filter',
    lessFilters: 'Filter ausblenden',
    priceFrom: 'Preis ab',
    priceTo: 'Preis bis',
    yearFrom: 'Baujahr ab',
    fuel: 'Kraftstoff',
    fuelAny: 'Alle Kraftstoffe',
    search: 'Fahrzeuge suchen',
  },
} as const

export default function HomeHeroSearch({
  locale = 'sv',
  defaultCountry,
}: {
  locale?: PublicLocale
  defaultCountry?: string
}) {
  const router = useRouter()
  const [mode, setMode] = useState<SearchMode>('sale')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<HeroCategory>('all')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [country, setCountry] = useState(() => resolveDefaultCountry(defaultCountry, locale))
  const [moreOpen, setMoreOpen] = useState(false)

  const copy =
    locale === 'sv'
      ? homeSearchCopy.sv
      : locale === 'de'
        ? homeSearchCopy.de
        : locale === 'en'
          ? homeSearchCopy.en
          : translatePublicObject(locale, homeSearchCopy.en)

  const countryOptions = useMemo(
    () =>
      euCountries
        .map(([code]) => code.toUpperCase())
        .sort((a, b) =>
          getEuCountryName(a, locale).localeCompare(getEuCountryName(b, locale), locale),
        ),
    [locale],
  )

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()

    if (query.trim()) params.set('q', query.trim())
    if (make.trim()) params.set('make', make.trim())
    if (model.trim()) params.set('model', model.trim())
    if (country) params.set('country', country)
    if (mode !== 'sale') params.set('mode', mode)

    const route =
      category === 'all'
        ? '/marketplace/vehicles'
        : categoryRoutes[category] || '/marketplace/vehicles'

    router.push(localizePublicHref(locale, `${route}${params.size ? `?${params}` : ''}`))
  }

  return (
    <form
      onSubmit={submit}
      className="w-full min-w-0 rounded-[12px] border border-white/80 bg-white/95 p-4 shadow-[0_28px_80px_rgba(15,23,42,.28)] backdrop-blur-md sm:p-5 lg:p-6"
      role="search"
    >
      <div className="mb-5 lg:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0866ff]">
          {locale === 'sv'
            ? 'Europas fordonsmarknad'
            : locale === 'de'
              ? 'Europas Fahrzeugmarkt'
              : "Europe's vehicle marketplace"}
        </p>
        <h1 className="mt-2 text-[27px] leading-[1.08] tracking-[-0.045em] text-[#101828]">
          {locale === 'sv'
            ? 'Europas största utbud av fordon.'
            : locale === 'de'
              ? 'Europas groesste Fahrzeugauswahl.'
              : "Europe's largest vehicle selection."}
        </h1>
      </div>

      <div className="grid grid-cols-3 border-b border-[#dde5f0]">
        {(['sale', 'leasing', 'rent'] as SearchMode[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`relative min-h-12 px-2 text-center text-sm font-semibold transition sm:text-[15px] ${
              mode === item ? 'text-[#101828]' : 'text-[#475467] hover:text-[#101828]'
            }`}
          >
            {copy.tabs[item]}
            <span
              className={`absolute bottom-[-1px] left-0 h-[3px] w-full rounded-full bg-[#0866ff] transition ${
                mode === item ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </button>
        ))}
      </div>

      <div className="mt-5">
        <label className="relative block">
          <span className="sr-only">{copy.query}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.query}
            className="h-14 w-full rounded-[8px] border-0 bg-[#f0f2f5] pl-5 pr-14 text-[16px] font-medium text-[#101828] outline-none ring-1 ring-transparent transition placeholder:text-[#667085] focus:bg-white focus:ring-[#0866ff]"
          />
          <Search className="pointer-events-none absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#101828]" />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SelectField
          label={copy.category}
          value={category}
          onChange={(value) => setCategory(value as HeroCategory)}
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {getCategoryLabel(option, locale)}
            </option>
          ))}
        </SelectField>

        <TextField label={copy.make} value={make} onChange={setMake} />
        <TextField label={copy.model} value={model} onChange={setModel} />

        <SelectField label={copy.place} value={country} onChange={setCountry} flagCode={country}>
          <option value="">{copy.allEurope}</option>
          {countryOptions.map((code) => (
            <option key={code} value={code}>
              {getEuCountryName(code, locale)}
            </option>
          ))}
        </SelectField>
      </div>

      <button
        type="button"
        aria-expanded={moreOpen}
        onClick={() => setMoreOpen((current) => !current)}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[8px] px-1 text-sm font-semibold text-[#101828] transition hover:text-[#0866ff]"
      >
        <SlidersHorizontal className="h-5 w-5" />
        {moreOpen ? copy.lessFilters : copy.moreFilters}
        <ChevronDown className={`h-4 w-4 transition ${moreOpen ? 'rotate-180' : ''}`} />
      </button>

      {moreOpen ? (
        <div className="mt-2 grid gap-3 rounded-[10px] border border-[#dbe5f2] bg-[#f8fbff] p-3 sm:grid-cols-2">
          <TextField label={copy.priceFrom} inputMode="numeric" />
          <TextField label={copy.priceTo} inputMode="numeric" />
          <TextField label={copy.yearFrom} inputMode="numeric" />
          <SelectField label={copy.fuel} value="" onChange={() => undefined}>
            <option value="">{copy.fuelAny}</option>
            <option value="electric">El</option>
            <option value="hybrid">Hybrid</option>
            <option value="diesel">Diesel</option>
            <option value="petrol">Bensin</option>
          </SelectField>
        </div>
      ) : null}

      <button
        type="submit"
        className="mt-5 flex min-h-14 w-full items-center justify-center rounded-[8px] bg-[#0866ff] px-5 text-[15px] font-semibold text-white shadow-[0_16px_32px_rgba(8,102,255,.25)] transition hover:bg-[#0057df] focus:outline-none focus:ring-2 focus:ring-[#0866ff] focus:ring-offset-2"
      >
        {copy.search}
      </button>
    </form>
  )
}

function TextField({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string
  value?: string
  onChange?: (value: string) => void
  inputMode?: 'numeric'
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        inputMode={inputMode}
        placeholder={label}
        className="h-12 w-full rounded-[8px] border border-[#cfd8e6] bg-white px-4 text-sm font-semibold text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#0866ff] focus:ring-2 focus:ring-[#d8e7ff]"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  children,
  flagCode,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  flagCode?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085]">
        {label}
      </span>
      <span className="relative block">
        {flagCode ? (
          <CountryFlag
            code={flagCode || 'eu'}
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-5 -translate-y-1/2 rounded-[4px]"
          />
        ) : null}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-12 w-full appearance-none rounded-[8px] border border-[#cfd8e6] bg-white px-4 pr-10 text-sm font-semibold text-[#101828] outline-none transition focus:border-[#0866ff] focus:ring-2 focus:ring-[#d8e7ff] ${
            flagCode ? 'pl-11' : ''
          }`}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#344054]" />
      </span>
    </label>
  )
}

function getCategoryLabel(
  option: (typeof categoryOptions)[number],
  locale: PublicLocale,
) {
  if (locale === 'sv') return option.sv
  if (locale === 'de') return option.de
  return option.en
}

function resolveDefaultCountry(defaultCountry: string | undefined, locale: PublicLocale) {
  const normalized = defaultCountry?.toUpperCase()
  if (normalized && normalized !== 'EU') return normalized
  if (locale === 'sv') return 'SE'
  if (locale === 'de') return 'DE'
  return ''
}
