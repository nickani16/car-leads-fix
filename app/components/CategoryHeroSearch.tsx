'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, MapPin, Search, Tag } from 'lucide-react'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'

type CategoryHeroSearchProps = {
  locale: PublicLocale
  slug: MarketplaceCategorySlug
  defaultCountry?: string
  labels: {
    make: string
    makePlaceholder: string
    model: string
    modelPlaceholder: string
    price: string
    anyPrice: string
    minPrice: string
    maxPrice: string
    clear: string
    apply: string
    location: string
    allEurope: string
    search: string
  }
}

export default function CategoryHeroSearch({
  locale,
  slug,
  defaultCountry,
  labels,
}: CategoryHeroSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [country, setCountry] = useState(() =>
    resolveDefaultCountry(defaultCountry, locale),
  )
  const countries = useMemo(
    () =>
      euCountries
        .map(([code]) => code.toUpperCase())
        .sort((a, b) => getEuCountryName(a, locale).localeCompare(getEuCountryName(b, locale), locale)),
    [locale],
  )
  const placeholders = useMemo(
    () => getSearchPlaceholders(slug, locale),
    [locale, slug],
  )

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (make.trim()) params.set('make', make.trim())
    if (model.trim()) params.set('model', model.trim())
    if (country) params.set('country', country)
    router.push(localizePublicHref(locale, `/marketplace/${slug}${params.size ? `?${params}` : ''}`))
  }

  return (
    <form
      onSubmit={submit}
      className="w-full min-w-0 max-w-full overflow-visible rounded-[22px] border border-white bg-white p-2 shadow-[0_20px_54px_rgba(15,23,42,.16)] sm:rounded-[24px]"
      role="search"
    >
      <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto] sm:items-center">
        <SearchField label={searchLabel(locale)} icon={Search} className="col-span-2 sm:col-span-1">
          <AnimatedSearchInput
            value={query}
            onChange={setQuery}
            placeholders={placeholders}
          />
        </SearchField>

        <SearchField label={labels.make} icon={Tag} className="col-span-2 sm:col-span-1">
          <input
            value={make}
            onChange={(event) => setMake(event.target.value)}
            placeholder={labels.makePlaceholder}
            className="h-6 min-w-0 max-w-full w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
          />
        </SearchField>

        <SearchField label={labels.model} icon={Search}>
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder={labels.modelPlaceholder}
            className="h-6 min-w-0 max-w-full w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
          />
        </SearchField>

        <SearchField label={labels.location} icon={MapPin}>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="h-6 min-w-0 max-w-full w-full appearance-none bg-transparent pr-7 text-sm font-semibold outline-none"
          >
            <option value="">{labels.allEurope}</option>
            {countries.map((code) => (
              <option key={code} value={code}>
                {getEuCountryName(code, locale)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute bottom-2 right-4 h-4 w-4 text-[#667085]" />
        </SearchField>

        <button
          type="submit"
          className="col-span-2 inline-flex min-h-[54px] w-full min-w-0 items-center justify-center gap-2 rounded-[15px] bg-[#0866ff] px-7 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,102,255,.25)] transition hover:-translate-y-0.5 hover:bg-[#0057e6] sm:col-span-1 sm:min-h-[58px] sm:w-auto"
        >
          <Search className="h-5 w-5" />
          {labels.search}
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
  className = '',
}: {
  label: string
  icon: typeof Search
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`relative flex min-w-0 items-center gap-3 overflow-hidden rounded-[15px] border border-[#e6e9ee] bg-white px-4 py-2 transition focus-within:border-[#0866ff]/45 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0866ff]/8 sm:border-0 sm:bg-white sm:focus-within:ring-0 ${className}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#eaf1ff] text-[#0866ff]">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#667085]">{label}</span>
        {children}
      </span>
    </label>
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
  const activePlaceholder = placeholders[index % placeholders.length] || ''

  useEffect(() => {
    if (placeholders.length < 2) return
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % placeholders.length)
    }, 1900)
    return () => window.clearInterval(interval)
  }, [placeholders.length])

  return (
    <span className="relative block">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={activePlaceholder}
        className="relative z-20 h-6 min-w-0 max-w-full w-full bg-transparent text-sm font-semibold outline-none placeholder:text-transparent"
      />
      {!value ? (
        <span
          key={activePlaceholder}
          aria-hidden="true"
          className="hero-word-rotate pointer-events-none absolute inset-x-0 top-0 z-10 block h-6 truncate text-sm font-normal leading-6 text-[#98a2b3]"
        >
          {activePlaceholder}
        </span>
      ) : null}
    </span>
  )
}

function searchLabel(locale: PublicLocale) {
  if (locale === 'sv') return 'Sök'
  if (locale === 'de') return 'Suche'
  return 'Search'
}

function getSearchPlaceholders(
  slug: MarketplaceCategorySlug,
  locale: PublicLocale,
) {
  const sv = {
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
  } satisfies Record<MarketplaceCategorySlug, string[]>

  const en = {
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
  } satisfies Record<MarketplaceCategorySlug, string[]>

  const de = {
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
  } satisfies Record<MarketplaceCategorySlug, string[]>

  if (locale === 'sv') return sv[slug]
  if (locale === 'de') return de[slug]
  return en[slug]
}
