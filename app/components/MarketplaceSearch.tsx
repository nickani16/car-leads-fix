'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { ChevronDown, MapPin, Search } from 'lucide-react'

const categoryRoutes: Record<string, string> = {
  cars: '/find-cars',
  vans: '/marketplace/vans',
  bikes: '/marketplace/bikes',
  motorhomes: '/marketplace/motorhomes',
  caravans: '/marketplace/caravans',
  trucks: '/marketplace/trucks',
  farm: '/marketplace/farm',
  plant: '/marketplace/plant',
  'electric-bikes': '/marketplace/electric-bikes',
}

const popularMakes = ['Audi', 'BMW', 'Ford', 'Kia', 'Mercedes-Benz', 'Polestar', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo']

export default function MarketplaceSearch() {
  const router = useRouter()
  const [category, setCategory] = useState('cars')
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const route = categoryRoutes[category] || '/find-cars'
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (country) params.set('country', country)
    router.push(`${route}${params.size ? `?${params}` : ''}`)
  }

  return (
    <form
      onSubmit={submit}
      className="w-full min-w-0 max-w-full overflow-hidden rounded-[22px] border border-[#dce1e7] bg-white p-3 shadow-[0_22px_55px_rgba(15,23,42,.16)] sm:rounded-full"
      role="search"
    >
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[1.05fr_1.45fr_1fr_auto] sm:items-center">
        <SearchField label="Kategori">
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-7 min-w-0 max-w-full w-full appearance-none bg-transparent pr-7 text-sm font-semibold outline-none">
            <option value="cars">Bilar</option>
            <option value="vans">Transportbilar</option>
            <option value="bikes">Motorcyklar</option>
            <option value="motorhomes">Husbilar</option>
            <option value="caravans">Husvagnar</option>
            <option value="trucks">Lastbilar</option>
            <option value="farm">Lantbruk</option>
            <option value="plant">Entreprenad</option>
            <option value="electric-bikes">Elcyklar</option>
          </select>
          <ChevronDown className="pointer-events-none absolute bottom-2 right-4 h-4 w-4 text-[#667085]" />
        </SearchField>

        <SearchField label="Vad letar du efter?">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Märke eller modell"
            list="marketplace-makes"
            className="h-7 min-w-0 max-w-full w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
          />
          <datalist id="marketplace-makes">
            {popularMakes.map((make) => <option key={make} value={make} />)}
          </datalist>
        </SearchField>

        <SearchField label="Plats">
          <MapPin className="absolute bottom-2 left-4 h-4 w-4 text-[#0866ff]" />
          <select value={country} onChange={(event) => setCountry(event.target.value)} className="h-7 min-w-0 max-w-full w-full appearance-none bg-transparent pl-6 pr-7 text-sm font-semibold outline-none">
            <option value="">Hela EU</option>
            <option value="SE">Sverige</option>
            <option value="DE">Tyskland</option>
            <option value="DK">Danmark</option>
            <option value="FI">Finland</option>
            <option value="NL">Nederländerna</option>
            <option value="FR">Frankrike</option>
          </select>
          <ChevronDown className="pointer-events-none absolute bottom-2 right-4 h-4 w-4 text-[#667085]" />
        </SearchField>

        <button type="submit" className="inline-flex min-h-14 w-full min-w-0 items-center justify-center gap-2 rounded-full bg-[#0866ff] px-7 text-sm font-bold text-white transition hover:bg-[#0057e6] sm:min-h-[58px] sm:w-auto">
          <Search className="h-5 w-5" />
          Sök fordon
        </button>
      </div>
    </form>
  )
}

function SearchField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="relative block min-w-0 overflow-hidden rounded-[15px] border border-[#e5e7eb] px-4 py-2 sm:rounded-none sm:border-y-0 sm:border-l-0 sm:border-r">
      <span className="block text-[11px] font-bold text-[#344054]">{label}</span>
      {children}
    </label>
  )
}
