'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import {
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

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
  const [query, setQuery] = useState('')
  const [mileage, setMileage] = useState('')
  const [registration, setRegistration] = useState('')
  const [price, setPrice] = useState('')
  const [vat, setVat] = useState(false)
  const copy =
    locale === 'sv'
      ? {
          queryPlaceholder: 'Märke eller modell',
          mileage: 'Miltal',
          registration: 'Årsmodell från',
          price: 'Pris upp till',
          vat: 'Momsavdrag',
          search: 'Sök annonser',
          advanced: 'Avancerad sökning',
        }
      : locale === 'de'
        ? {
            queryPlaceholder: 'Marke oder Modell',
            mileage: 'Kilometerstand',
            registration: 'Erstzulassung ab',
            price: 'Preis bis',
            vat: 'MwSt. ausweisbar',
            search: 'Angebote suchen',
            advanced: 'Erweiterte Suche',
          }
        : locale === 'en'
          ? {
              queryPlaceholder: 'Make or model',
              mileage: 'Mileage',
              registration: 'Registration from',
              price: 'Price up to',
              vat: 'VAT deduction',
              search: 'Search listings',
              advanced: 'Advanced search',
            }
          : translatePublicObject(locale, {
              queryPlaceholder: 'Make or model',
              mileage: 'Mileage',
              registration: 'Registration from',
              price: 'Price up to',
              vat: 'VAT deduction',
              search: 'Search listings',
              advanced: 'Advanced search',
            })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (mileage) params.set('mileageMax', mileage)
    if (registration) params.set('yearFrom', registration)
    if (price) params.set('priceMax', price)
    if (vat) params.set('vat', '1')
    router.push(`/marketplace/cars${params.size ? `?${params}` : ''}`)
  }

  return (
    <form
      onSubmit={submit}
      className="w-full min-w-0 max-w-full overflow-hidden rounded-[22px] bg-white p-4 shadow-[0_20px_55px_rgba(8,27,74,.22)] sm:p-5"
      role="search"
    >
      <div className="grid min-w-0 gap-3 sm:grid-cols-[1fr_.54fr]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.queryPlaceholder}
          list="marketplace-makes"
          className="h-12 w-full rounded-[12px] border border-[#b8c7e6] bg-white px-4 text-sm font-semibold text-[#22304a] outline-none transition placeholder:font-medium placeholder:text-[#526179] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
        />
        <datalist id="marketplace-makes">
          {popularMakes.map((make) => (
            <option key={make} value={make} />
          ))}
        </datalist>

        <SelectField value={mileage} onChange={setMileage} label={copy.mileage}>
          <option value="">{copy.mileage}</option>
          <option value="5000">5 000 km</option>
          <option value="10000">10 000 km</option>
          <option value="30000">30 000 km</option>
          <option value="60000">60 000 km</option>
          <option value="100000">100 000 km</option>
        </SelectField>
      </div>

      <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-[.52fr_.52fr_.6fr] sm:items-center">
        <SelectField value={registration} onChange={setRegistration} label={copy.registration}>
          <option value="">{copy.registration}</option>
          <option value="2024">2024</option>
          <option value="2022">2022</option>
          <option value="2020">2020</option>
          <option value="2018">2018</option>
          <option value="2015">2015</option>
        </SelectField>

        <SelectField value={price} onChange={setPrice} label={copy.price}>
          <option value="">{copy.price}</option>
          <option value="100000">100 000 kr</option>
          <option value="200000">200 000 kr</option>
          <option value="350000">350 000 kr</option>
          <option value="500000">500 000 kr</option>
          <option value="750000">750 000 kr</option>
        </SelectField>

        <label className="inline-flex h-12 items-center gap-3 rounded-[12px] border border-[#b8c7e6] bg-white px-4 text-sm font-semibold text-[#22304a]">
          <input
            type="checkbox"
            checked={vat}
            onChange={(event) => setVat(event.target.checked)}
            className="h-5 w-5 rounded border-[#9aa8c4] text-[#0866ff] focus:ring-[#0866ff]"
          />
          {copy.vat}
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/marketplace/cars" className="inline-flex items-center gap-2 text-sm font-bold text-[#0866ff] underline underline-offset-4">
          {copy.advanced}
          <ChevronDown className="-rotate-90 h-4 w-4" />
        </Link>

        <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-[#0866ff] px-8 text-sm font-bold text-white shadow-[0_12px_28px_rgba(8,102,255,.26)] transition hover:bg-[#0057e6]">
          <Search className="h-5 w-5" />
          {copy.search}
        </button>
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
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-12 w-full appearance-none rounded-[12px] border border-[#b8c7e6] bg-white px-4 pr-10 text-sm font-semibold text-[#22304a] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#344054]" />
    </label>
  )
}
