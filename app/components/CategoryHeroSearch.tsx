'use client'

import { FormEvent, useMemo, useState } from 'react'
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
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
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
        <SearchField label={labels.make} icon={Tag}>
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
          className="inline-flex min-h-[54px] w-full min-w-0 items-center justify-center gap-2 rounded-[15px] bg-[#0866ff] px-7 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,102,255,.25)] transition hover:-translate-y-0.5 hover:bg-[#0057e6] sm:min-h-[58px] sm:w-auto"
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
}: {
  label: string
  icon: typeof Search
  children: React.ReactNode
}) {
  return (
    <label className="relative flex min-w-0 items-center gap-3 overflow-hidden rounded-[15px] border border-[#e6e9ee] bg-white px-4 py-2 transition focus-within:border-[#0866ff]/45 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0866ff]/8 sm:border-0 sm:bg-white sm:focus-within:ring-0">
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
