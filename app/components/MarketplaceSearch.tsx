'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import {
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'

const categories = [
  { value: 'cars', sv: 'Bilar', en: 'Cars', de: 'Autos' },
  { value: 'vans', sv: 'Transportbilar', en: 'Vans', de: 'Transporter' },
  { value: 'motorcycles', sv: 'Motorcyklar', en: 'Motorcycles', de: 'Motorräder' },
  { value: 'motorhomes', sv: 'Husbilar', en: 'Motorhomes', de: 'Wohnmobile' },
  { value: 'caravans', sv: 'Husvagnar', en: 'Caravans', de: 'Wohnwagen' },
  { value: 'trucks', sv: 'Lastbilar', en: 'Trucks', de: 'Lkw' },
  { value: 'agriculture', sv: 'Lantbruk', en: 'Agriculture', de: 'Landmaschinen' },
  { value: 'construction', sv: 'Entreprenad', en: 'Construction', de: 'Baumaschinen' },
  { value: 'electric-bikes', sv: 'Elcyklar', en: 'Electric bikes', de: 'E-Bikes' },
  { value: 'e-scooters', sv: 'Elsparkcyklar', en: 'E-scooters', de: 'E-Scooter' },
] as const

const popularMakes = [
  'Audi',
  'BMW',
  'Ford',
  'Kia',
  'Mercedes-Benz',
  'Polestar',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
]

export default function MarketplaceSearch({
  locale = 'sv',
}: {
  locale?: PublicLocale
}) {
  const router = useRouter()
  const [category, setCategory] = useState('cars')
  const [country, setCountry] = useState('')
  const [query, setQuery] = useState('')
  const [price, setPrice] = useState('')
  const copy =
    locale === 'sv'
      ? {
          category: 'Fordonskategori',
          country: 'Land',
          allEurope: 'Hela Europa',
          queryPlaceholder: 'Märke eller modell',
          price: 'Pris upp till',
          search: 'Sök fordon',
          advanced: 'Fler filter',
        }
      : locale === 'de'
        ? {
            category: 'Fahrzeugkategorie',
            country: 'Land',
            allEurope: 'Ganz Europa',
            queryPlaceholder: 'Marke oder Modell',
            price: 'Preis bis',
            search: 'Fahrzeuge suchen',
            advanced: 'Mehr Filter',
          }
        : locale === 'en'
          ? {
              category: 'Vehicle category',
              country: 'Country',
              allEurope: 'All of Europe',
              queryPlaceholder: 'Make or model',
              price: 'Price up to',
              search: 'Search vehicles',
              advanced: 'More filters',
            }
          : translatePublicObject(locale, {
              category: 'Vehicle category',
              country: 'Country',
              allEurope: 'All of Europe',
              queryPlaceholder: 'Make or model',
              price: 'Price up to',
              search: 'Search vehicles',
              advanced: 'More filters',
            })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (country) params.set('country', country)
    if (query.trim()) params.set('q', query.trim())
    if (price) params.set('priceMax', price)
    router.push(`/marketplace/${category}${params.size ? `?${params}` : ''}`)
  }

  return (
    <form
      onSubmit={submit}
      className="w-full rounded-[22px] border border-white/80 bg-white p-4 shadow-[0_18px_45px_rgba(8,27,74,.20)] sm:p-5"
      role="search"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.15fr_.8fr_auto] md:items-end">
        <SelectField value={category} onChange={setCategory} label={copy.category}>
          {categories.map((item) => (
            <option key={item.value} value={item.value}>
              {locale === 'sv' || locale === 'de' || locale === 'en'
                ? item[locale]
                : translatePublic(locale, item.en)}
            </option>
          ))}
        </SelectField>

        <SelectField value={country} onChange={setCountry} label={copy.country}>
          <option value="">{copy.allEurope}</option>
          {euCountries
            .map(([code]) => code)
            .sort((a, b) =>
              getEuCountryName(a, locale).localeCompare(getEuCountryName(b, locale), locale),
            )
            .map((code) => (
              <option key={code} value={code.toUpperCase()}>
                {getEuCountryName(code, locale)}
              </option>
            ))}
        </SelectField>

        <label className="block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
            {copy.queryPlaceholder}
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.queryPlaceholder}
            list="marketplace-makes"
            className="h-12 w-full rounded-[12px] border border-[#cfd8ea] bg-white px-4 text-sm font-semibold text-[#22304a] outline-none transition placeholder:font-medium placeholder:text-[#667085] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
          />
          <datalist id="marketplace-makes">
            {popularMakes.map((make) => (
              <option key={make} value={make} />
            ))}
          </datalist>
        </label>

        <SelectField value={price} onChange={setPrice} label={copy.price}>
          <option value="">{copy.price}</option>
          <option value="100000">100 000</option>
          <option value="250000">250 000</option>
          <option value="500000">500 000</option>
          <option value="750000">750 000</option>
          <option value="1000000">1 000 000</option>
        </SelectField>

        <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#0866ff] px-6 text-sm font-bold text-white shadow-[0_10px_22px_rgba(8,102,255,.24)] transition hover:bg-[#0057e6]">
          <Search className="h-5 w-5" />
          {copy.search}
        </button>
      </div>

      <div className="mt-4 flex justify-end">
        <Link href={`/marketplace/${category}`} className="text-sm font-bold text-[#0866ff] underline underline-offset-4">
          {copy.advanced}
        </Link>
      </div>
    </form>
  )
}

function SelectField({
  value,
  onChange,
  label,
  children,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="relative block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-[12px] border border-[#cfd8ea] bg-white px-4 pr-10 text-sm font-semibold text-[#22304a] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 text-[#344054]" />
    </label>
  )
}
