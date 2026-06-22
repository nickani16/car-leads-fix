'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { CarFront, ChevronDown, MapPin, Search } from 'lucide-react'

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
      className="w-full min-w-0 max-w-full overflow-hidden rounded-[24px] border border-white/80 bg-white/96 p-2.5 shadow-[0_24px_65px_rgba(15,23,42,.18)] backdrop-blur-xl sm:rounded-[26px]"
      role="search"
    >
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[1.05fr_1.55fr_1fr_auto] sm:items-center">
        <SearchField label="Kategori" icon={CarFront}>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="marketplace-search-control h-7 min-w-0 max-w-full w-full appearance-none bg-transparent pr-7 text-sm font-semibold outline-none">
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

        <SearchField label="Vad letar du efter?" icon={Search}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Märke eller modell"
            list="marketplace-makes"
            className="marketplace-search-control h-7 min-w-0 max-w-full w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
          />
          <datalist id="marketplace-makes">
            {popularMakes.map((make) => <option key={make} value={make} />)}
          </datalist>
        </SearchField>

        <SearchField label="Plats" icon={MapPin}>
          <select value={country} onChange={(event) => setCountry(event.target.value)} className="marketplace-search-control h-7 min-w-0 max-w-full w-full appearance-none bg-transparent pr-7 text-sm font-semibold outline-none">
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

        <button type="submit" className="inline-flex min-h-14 w-full min-w-0 items-center justify-center gap-2 rounded-[18px] bg-[#0866ff] px-7 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,102,255,.25)] transition hover:-translate-y-0.5 hover:bg-[#0057e6] sm:min-h-[62px] sm:w-auto sm:rounded-[20px]">
          <Search className="h-5 w-5" />
          Sök fordon
        </button>
      </div>
    </form>
  )
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
