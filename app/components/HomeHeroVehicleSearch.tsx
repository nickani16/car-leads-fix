'use client'

import { FormEvent, useMemo, useState, type ComponentType, type SVGProps } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bike,
  BusFront,
  CarFront,
  ChevronDown,
  Clock3,
  Search,
  Tractor,
  Truck,
  Warehouse,
} from 'lucide-react'
import {
  AutorellCaravanIcon,
  AutorellMotorbikeIcon,
  AutorellVanIcon,
} from './AutorellCategoryIcons'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'

type Intent = 'sale' | 'leasing' | 'dealers'

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

const categories = [
  { slug: 'cars', label: 'Bilar', icon: CarFront },
  { slug: 'vans', label: 'Transportbilar', icon: AutorellVanIcon },
  { slug: 'motorcycles', label: 'Motorcyklar', icon: AutorellMotorbikeIcon },
  { slug: 'motorhomes', label: 'Husbilar', icon: BusFront },
  { slug: 'caravans', label: 'Husvagnar', icon: AutorellCaravanIcon },
  { slug: 'trucks', label: 'Lastbilar', icon: Truck },
  { slug: 'agriculture', label: 'Lantbruk', icon: Tractor },
  { slug: 'construction', label: 'Entreprenad', icon: Warehouse },
  { slug: 'electric-bikes', label: 'Cyklar', icon: Bike },
] satisfies Array<{
  slug: MarketplaceCategorySlug
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}>

const copyByLocale = {
  sv: {
    title: 'Europas största utbud av fordon till salu*',
    note: '*Det är möjligt eftersom Autorell samlar fordon från flera europeiska marknader.',
    searchAgain: 'Sök igen: Bilar',
    searchAgainSub: 'Till salu',
    tabs: { sale: 'Till salu', leasing: 'Leasing', dealers: 'Säljare' },
    placeholder: 'Sök fordon, ort eller kommun',
    verified: 'Visa endast verifierade säljare',
    radius: 'Utöka sökområde',
    radiusValue: '0 km',
    moreFilters: 'Fler sökfilter',
    submit: 'Hitta fordon',
  },
  en: {
    title: "Europe's largest selection of vehicles for sale*",
    note: '*Possible because Autorell brings together vehicles from several European markets.',
    searchAgain: 'Search again: Cars',
    searchAgainSub: 'For sale',
    tabs: { sale: 'For sale', leasing: 'Leasing', dealers: 'Sellers' },
    placeholder: 'Search vehicle, city or area',
    verified: 'Show verified sellers only',
    radius: 'Expand search area',
    radiusValue: '0 km',
    moreFilters: 'More filters',
    submit: 'Find vehicles',
  },
  de: {
    title: 'Europas größte Auswahl an Fahrzeugen zum Verkauf*',
    note: '*Möglich, weil Autorell Fahrzeuge aus mehreren europäischen Märkten bündelt.',
    searchAgain: 'Erneut suchen: Autos',
    searchAgainSub: 'Kaufen',
    tabs: { sale: 'Kaufen', leasing: 'Leasing', dealers: 'Verkäufer' },
    placeholder: 'Fahrzeug, Ort oder Gemeinde suchen',
    verified: 'Nur geprüfte Verkäufer anzeigen',
    radius: 'Suchgebiet erweitern',
    radiusValue: '0 km',
    moreFilters: 'Weitere Filter',
    submit: 'Fahrzeuge finden',
  },
} as const

export default function HomeHeroVehicleSearch({
  locale,
}: {
  locale: PublicLocale
}) {
  const router = useRouter()
  const t = locale === 'de' ? copyByLocale.de : locale === 'en' ? copyByLocale.en : copyByLocale.sv
  const [intent, setIntent] = useState<Intent>('sale')
  const [category, setCategory] = useState<MarketplaceCategorySlug>('cars')
  const [query, setQuery] = useState('')
  const selectedRoute = useMemo(() => categoryRoutes[category] || '/marketplace/vehicles', [category])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (intent === 'leasing') params.set('intent', 'leasing')
    router.push(localizePublicHref(locale, `${selectedRoute}${params.size ? `?${params}` : ''}`))
  }

  return (
    <div className="grid w-full gap-3 lg:grid-cols-[minmax(520px,560px)_380px] lg:items-start lg:justify-center lg:gap-10">
      <div className="contents lg:hidden">
        <div className="rounded-[6px] bg-white px-5 pb-0 pt-5 text-center shadow-[0_6px_18px_rgba(15,23,42,.16)]">
          <h1 className="text-[26px] font-semibold leading-[1.16] tracking-[-0.04em] text-[#101828]">
            {t.title}
          </h1>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="rounded-[6px] bg-white p-4 shadow-[0_8px_26px_rgba(15,23,42,.17)] lg:p-6"
        role="search"
      >
        <div className="-mx-1 grid grid-cols-3 border-b border-[#d9dee8]">
          {(['sale', 'leasing', 'dealers'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setIntent(tab)}
              className={`relative min-h-11 px-2 text-center text-sm font-medium text-[#101828] transition ${
                intent === tab ? 'text-[#0866ff]' : 'hover:text-[#0866ff]'
              }`}
            >
              {t.tabs[tab]}
              {intent === tab ? (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#0866ff]" />
              ) : null}
            </button>
          ))}
        </div>

        <label className="mt-4 flex min-h-[50px] items-center gap-3 rounded-[3px] bg-[#f0f1f3] px-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.placeholder}
            className="min-w-0 flex-1 bg-transparent text-[15px] font-normal text-[#101828] outline-none placeholder:text-[#6b7280]"
          />
          <Search className="h-5 w-5 shrink-0 text-[#101828]" strokeWidth={2.1} />
        </label>

        <label className="mt-5 flex items-center gap-2 text-sm font-normal text-[#101828]">
          <input
            type="checkbox"
            className="h-[18px] w-[18px] rounded-[2px] border border-[#c5ccd8] accent-[#0866ff]"
          />
          <span>{t.verified}</span>
        </label>

        <div className="mt-7">
          <label className="block text-sm font-semibold text-[#101828]">{t.radius}</label>
          <button
            type="button"
            className="mt-3 flex min-h-[48px] w-full max-w-[248px] items-center justify-between rounded-[3px] border border-[#c9ced8] bg-white px-3 text-left text-[15px] font-normal text-[#101828] max-lg:max-w-full"
          >
            {t.radiusValue}
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 hidden grid-cols-3 gap-2 lg:grid">
          {categories.slice(0, 6).map(({ slug, label, icon: Icon }) => (
            <button
              key={slug}
              type="button"
              onClick={() => setCategory(slug)}
              className={`flex min-h-[46px] items-center gap-2 rounded-[3px] border px-3 text-left text-sm font-normal transition ${
                category === slug
                  ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                  : 'border-[#c9ced8] bg-white text-[#101828] hover:border-[#0866ff]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-[#101828]"
        >
          {t.moreFilters}
          <ChevronDown className="h-4 w-4" />
        </button>

        <button
          type="submit"
          className="mt-6 flex min-h-[48px] w-full items-center justify-center rounded-[3px] bg-[#0866ff] px-5 text-[15px] font-semibold text-white shadow-[0_14px_28px_rgba(8,102,255,.22)] transition hover:bg-[#0057e6] lg:bg-[#151515] lg:hover:bg-[#0866ff]"
        >
          {t.submit}
        </button>

        <p className="mt-4 text-sm leading-6 text-[#101828] lg:hidden">{t.note}</p>
      </form>

      <div className="hidden lg:block">
        <div className="rounded-[6px] bg-white p-6 shadow-[0_8px_26px_rgba(15,23,42,.17)]">
          <h1 className="text-[40px] font-semibold leading-[1.28] tracking-[-0.045em] text-[#101828]">
            {t.title}
          </h1>
          <p className="mt-5 text-[15px] leading-6 text-[#101828]">{t.note}</p>
        </div>

        <button
          type="button"
          onClick={() => router.push(localizePublicHref(locale, '/marketplace/cars'))}
          className="mt-4 flex min-h-[66px] w-full items-center justify-between rounded-[6px] bg-white px-6 text-left shadow-[0_6px_18px_rgba(15,23,42,.16)] transition hover:translate-x-0.5"
        >
          <span>
            <span className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
              <Clock3 className="h-4 w-4" />
              {t.searchAgain}
            </span>
            <span className="mt-1 block text-sm text-[#667085]">{t.searchAgainSub}</span>
          </span>
          <ChevronDown className="-rotate-90 h-5 w-5 text-[#101828]" />
        </button>
      </div>
    </div>
  )
}
