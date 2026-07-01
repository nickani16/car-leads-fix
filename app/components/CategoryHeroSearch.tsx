'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, MapPin, Search, SlidersHorizontal, Tag } from 'lucide-react'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'

const PRICE_MIN = 0
const PRICE_MAX = 700000
const PRICE_STEP = 10000

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
  const [priceOpen, setPriceOpen] = useState(false)
  const [minPrice, setMinPrice] = useState(PRICE_MIN)
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX)
  const [priceTouched, setPriceTouched] = useState(false)
  const countries = useMemo(
    () =>
      euCountries
        .map(([code]) => code.toUpperCase())
        .sort((a, b) => getEuCountryName(a, locale).localeCompare(getEuCountryName(b, locale), locale)),
    [locale],
  )
  const priceLabel =
    priceTouched
      ? `${minPrice.toLocaleString('sv-SE')} - ${maxPrice >= PRICE_MAX ? `${PRICE_MAX.toLocaleString('sv-SE')}+` : maxPrice.toLocaleString('sv-SE')}`
      : labels.anyPrice
  const minPercent = ((minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const maxPercent = ((maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (make.trim()) params.set('make', make.trim())
    if (model.trim()) params.set('model', model.trim())
    if (priceTouched && minPrice > PRICE_MIN) params.set('minPrice', String(minPrice))
    if (priceTouched && maxPrice < PRICE_MAX) params.set('maxPrice', String(maxPrice))
    if (country) params.set('country', country)
    router.push(localizePublicHref(locale, `/marketplace/${slug}${params.size ? `?${params}` : ''}`))
  }

  function setMin(value: number) {
    setPriceTouched(true)
    setMinPrice(Math.min(Math.max(PRICE_MIN, value), maxPrice - PRICE_STEP))
  }

  function setMax(value: number) {
    setPriceTouched(true)
    setMaxPrice(Math.max(Math.min(PRICE_MAX, value), minPrice + PRICE_STEP))
  }

  return (
    <form
      onSubmit={submit}
      className="w-full min-w-0 max-w-full overflow-visible rounded-[24px] border border-white bg-white p-2.5 shadow-[0_24px_65px_rgba(15,23,42,.18)] sm:rounded-[26px]"
      role="search"
    >
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-center">
        <SearchField label={labels.make} icon={Tag}>
          <input
            value={make}
            onChange={(event) => setMake(event.target.value)}
            placeholder={labels.makePlaceholder}
            className="h-7 min-w-0 max-w-full w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
          />
        </SearchField>

        <SearchField label={labels.model} icon={Search}>
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder={labels.modelPlaceholder}
            className="h-7 min-w-0 max-w-full w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
          />
        </SearchField>

        <div className="relative min-w-0">
          <button
            type="button"
            onClick={() => setPriceOpen((open) => !open)}
            className="relative flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-[17px] border border-[#e6e9ee] bg-white px-4 py-2.5 text-left transition hover:bg-white focus:border-[#0866ff]/45 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0866ff]/8 sm:border-0 sm:bg-white sm:focus:ring-0"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#eaf1ff] text-[#0866ff]">
              <SlidersHorizontal className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#667085]">{labels.price}</span>
              <span className="block truncate text-sm font-semibold text-[#101828]">{priceLabel}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#667085]" />
          </button>

          {priceOpen && (
            <div className="absolute left-1/2 top-[calc(100%+10px)] z-30 w-[min(340px,calc(100vw-2rem))] -translate-x-1/2 rounded-[20px] border border-[#dfe6f2] bg-white p-5 shadow-[0_24px_60px_rgba(16,24,40,.18)] sm:left-0 sm:w-[340px] sm:translate-x-0">
              <p className="text-sm font-black text-[#101828]">{labels.price}</p>
              <div className="relative isolate mt-5 h-8">
                <div className="absolute left-0 right-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full bg-[#dbe7fb]" />
                <div
                  className="absolute top-1/2 h-[5px] -translate-y-1/2 rounded-full bg-[#0866ff]"
                  style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                />
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={minPrice}
                  onChange={(event) => setMin(Number(event.target.value))}
                  className="category-price-range"
                  style={{ zIndex: minPrice > PRICE_MAX - PRICE_STEP * 2 ? 5 : 3 }}
                  aria-label={labels.minPrice}
                />
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={maxPrice}
                  onChange={(event) => setMax(Number(event.target.value))}
                  className="category-price-range"
                  style={{ zIndex: 4 }}
                  aria-label={labels.maxPrice}
                />
              </div>
              <div className="mt-1 flex justify-between text-sm font-semibold text-[#667085]">
                <span>0</span>
                <span>{PRICE_MAX.toLocaleString('sv-SE')}+</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex h-14 items-center rounded-[6px] border border-[#98a2b3] bg-white px-3">
                  <input
                    inputMode="numeric"
                    value={priceTouched ? String(minPrice) : ''}
                    placeholder={labels.minPrice}
                    onChange={(event) => setMin(Number(event.target.value.replace(/[^\d]/g, '') || PRICE_MIN))}
                    className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#475467]"
                  />
                  <span className="text-sm font-bold text-[#101828]">kr</span>
                </label>
                <label className="flex h-14 items-center rounded-[6px] border border-[#98a2b3] bg-white px-3">
                  <input
                    inputMode="numeric"
                    value={priceTouched ? String(maxPrice) : ''}
                    placeholder={labels.maxPrice}
                    onChange={(event) => setMax(Number(event.target.value.replace(/[^\d]/g, '') || PRICE_MAX))}
                    className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#475467]"
                  />
                  <span className="text-sm font-bold text-[#101828]">kr</span>
                </label>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice(PRICE_MIN)
                    setMaxPrice(PRICE_MAX)
                    setPriceTouched(false)
                    setPriceOpen(false)
                  }}
                  className="min-h-11 flex-1 rounded-[13px] border border-[#d8e0ec] px-4 text-sm font-bold text-[#344054] transition hover:bg-[#f8fafc]"
                >
                  {labels.clear}
                </button>
                <button
                  type="button"
                  onClick={() => setPriceOpen(false)}
                  className="min-h-11 flex-1 rounded-[13px] bg-[#0866ff] px-4 text-sm font-bold text-white transition hover:bg-[#0057e6]"
                >
                  {labels.apply}
                </button>
              </div>
            </div>
          )}
        </div>

        <SearchField label={labels.location} icon={MapPin}>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="h-7 min-w-0 max-w-full w-full appearance-none bg-transparent pr-7 text-sm font-semibold outline-none"
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
          className="inline-flex min-h-14 w-full min-w-0 items-center justify-center gap-2 rounded-[16px] bg-[#0866ff] px-7 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,102,255,.25)] transition hover:-translate-y-0.5 hover:bg-[#0057e6] sm:min-h-[62px] sm:w-auto"
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
    <label className="relative flex min-w-0 items-center gap-3 overflow-hidden rounded-[17px] border border-[#e6e9ee] bg-white px-4 py-2.5 transition focus-within:border-[#0866ff]/45 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0866ff]/8 sm:border-0 sm:bg-white sm:focus-within:ring-0">
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
