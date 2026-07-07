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

type Intent = 'sale' | 'leasing'

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

const marketOptions = [
  { code: 'SE', sv: 'Sverige', en: 'Sweden', de: 'Schweden' },
  { code: 'DE', sv: 'Tyskland', en: 'Germany', de: 'Deutschland' },
  { code: 'DK', sv: 'Danmark', en: 'Denmark', de: 'Dänemark' },
  { code: 'EU', sv: 'Europa', en: 'Europe', de: 'Europa' },
]

const copyByLocale = {
  sv: {
    title: 'Europas största utbud av fordon till salu*',
    note: '*Det är möjligt eftersom Autorell samlar fordon från flera europeiska marknader.',
    searchAgain: 'Sök igen: Bilar',
    searchAgainSub: 'Fordon till salu',
    tabs: { sale: 'Fordon till salu', leasing: 'Leasing av fordon' },
    placeholder: 'Sök fordon, ort eller kommun',
    verified: 'Visa endast verifierade säljare',
    markets: 'Marknader',
    moreFilters: 'Fler sökfilter',
    submit: 'Hitta fordon',
  },
  en: {
    title: "Europe's largest selection of vehicles for sale*",
    note: '*Possible because Autorell brings together vehicles from several European markets.',
    searchAgain: 'Search again: Cars',
    searchAgainSub: 'Vehicles for sale',
    tabs: { sale: 'Vehicles for sale', leasing: 'Vehicle leasing' },
    placeholder: 'Search vehicle, city or area',
    verified: 'Show verified sellers only',
    markets: 'Markets',
    moreFilters: 'More filters',
    submit: 'Find vehicles',
  },
  de: {
    title: 'Europas größte Auswahl an Fahrzeugen zum Verkauf*',
    note: '*Möglich, weil Autorell Fahrzeuge aus mehreren europäischen Märkten bündelt.',
    searchAgain: 'Erneut suchen: Autos',
    searchAgainSub: 'Fahrzeuge kaufen',
    tabs: { sale: 'Fahrzeuge kaufen', leasing: 'Fahrzeugleasing' },
    placeholder: 'Fahrzeug, Ort oder Gemeinde suchen',
    verified: 'Nur geprüfte Verkäufer anzeigen',
    markets: 'Märkte',
    moreFilters: 'Weitere Filter',
    submit: 'Fahrzeuge finden',
  },
} as const

function marketLabel(
  option: (typeof marketOptions)[number],
  locale: PublicLocale,
) {
  if (locale === 'sv') return option.sv
  if (locale === 'de') return option.de
  return option.en
}

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
  const [markets, setMarkets] = useState<string[]>(() => [
    locale === 'de' ? 'DE' : locale === 'sv' ? 'SE' : 'EU',
  ])
  const [marketsOpen, setMarketsOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const selectedRoute = useMemo(() => categoryRoutes[category] || '/marketplace/vehicles', [category])
  const selectedCategory = categories.find((item) => item.slug === category) || categories[0]
  const SelectedCategoryIcon = selectedCategory.icon

  function toggleMarket(code: string) {
    setMarkets((current) => {
      if (current.includes(code)) {
        const next = current.filter((item) => item !== code)
        return next.length ? next : current
      }
      return [...current, code]
    })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (intent === 'leasing') params.set('intent', 'leasing')
    if (markets.length) params.set('markets', markets.join(','))
    router.push(localizePublicHref(locale, `${selectedRoute}${params.size ? `?${params}` : ''}`))
  }

  const selectedMarketsLabel = marketOptions
    .filter((option) => markets.includes(option.code))
    .map((option) => marketLabel(option, locale))
    .join(', ')

  return (
    <div className="mx-auto grid w-full max-w-[342px] -translate-x-6 gap-0 min-[430px]:max-w-[398px] lg:max-w-none lg:translate-x-0 lg:grid-cols-[minmax(520px,560px)_380px] lg:items-start lg:justify-center lg:gap-10">
      <div className="contents lg:hidden">
        <div className="rounded-t-[12px] bg-white px-5 py-5 text-center shadow-[0_8px_26px_rgba(15,23,42,.17)]">
          <h1 className="text-[25px] font-semibold leading-[1.16] tracking-[-0.04em] text-[#101828]">
            {t.title}
          </h1>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="rounded-b-[12px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,.18)] lg:rounded-[12px] lg:p-6"
        role="search"
      >
        <div className="grid grid-cols-2 gap-2 rounded-[11px] bg-[#f3f7ff] p-1">
          {(['sale', 'leasing'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setIntent(tab)}
              className={`min-h-11 rounded-[9px] px-2 text-center text-[13px] font-semibold leading-tight transition sm:text-sm ${
                intent === tab
                  ? 'bg-[#0866ff] text-white shadow-[0_8px_18px_rgba(8,102,255,.22)]'
                  : 'text-[#101828] hover:bg-white'
              }`}
            >
              {t.tabs[tab]}
            </button>
          ))}
        </div>

        <label className="mt-4 flex min-h-[50px] items-center gap-3 rounded-[10px] bg-[#f0f3f7] px-4 ring-1 ring-[#e2e8f0] focus-within:ring-[#0866ff]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.placeholder}
            className="min-w-0 flex-1 appearance-none rounded-none !bg-transparent text-[15px] font-normal text-[#101828] outline-none placeholder:text-[#667085] [background:transparent]"
          />
          <Search className="h-5 w-5 shrink-0 text-[#101828]" strokeWidth={2.1} />
        </label>

        <label className="mt-5 flex items-center gap-2 text-sm font-normal text-[#101828]">
          <input
            type="checkbox"
            className="h-[18px] w-[18px] rounded-[4px] border border-[#c5ccd8] accent-[#0866ff]"
          />
          <span>{t.verified}</span>
        </label>

        <div className="mt-7 hidden lg:block">
          <button
            type="button"
            onClick={() => setMarketsOpen((current) => !current)}
            className="flex min-h-[48px] w-full items-center justify-between rounded-[10px] border border-[#d8e0ec] bg-white px-3 text-left transition hover:border-[#0866ff]"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#101828]">
                {locale === 'sv' ? 'Utöka sökområde' : locale === 'de' ? 'Suchgebiet erweitern' : 'Expand search area'}
              </span>
              <span className="mt-0.5 block truncate text-xs font-medium text-[#667085]">
                {selectedMarketsLabel}
              </span>
            </span>
            <ChevronDown className={`h-5 w-5 shrink-0 transition ${marketsOpen ? 'rotate-180 text-[#0866ff]' : ''}`} />
          </button>
          {marketsOpen ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {marketOptions.map((option) => {
                const selected = markets.includes(option.code)
                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => toggleMarket(option.code)}
                    className={`flex min-h-[44px] items-center justify-center rounded-[10px] border px-3 text-center text-sm font-semibold transition ${
                      selected
                        ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                        : 'border-[#d8e0ec] bg-white text-[#101828] hover:border-[#0866ff]'
                    }`}
                  >
                    <span className="truncate">{marketLabel(option, locale)}</span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="mt-7 lg:hidden">
          <button
            type="button"
            onClick={() => setCategoryOpen((current) => !current)}
            className="flex min-h-[48px] w-full items-center justify-between rounded-[10px] border border-[#d8e0ec] bg-white px-3 text-left transition hover:border-[#0866ff]"
          >
            <span className="flex min-w-0 items-center gap-2">
              <SelectedCategoryIcon className="h-4 w-4 shrink-0 text-[#0866ff]" />
              <span className="truncate text-sm font-semibold text-[#101828]">
                {selectedCategory.label}
              </span>
            </span>
            <ChevronDown className={`h-5 w-5 shrink-0 transition ${categoryOpen ? 'rotate-180 text-[#0866ff]' : ''}`} />
          </button>
          {categoryOpen ? (
            <div className="mt-2 grid gap-2 rounded-[12px] border border-[#d8e0ec] bg-white p-2 shadow-[0_14px_32px_rgba(15,23,42,.10)]">
              {categories.map(({ slug, label, icon: Icon }) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => {
                    setCategory(slug)
                    setCategoryOpen(false)
                  }}
                  className={`flex min-h-[44px] items-center gap-2 rounded-[10px] px-3 text-left text-sm font-semibold transition ${
                    category === slug
                      ? 'bg-[#eef5ff] text-[#0866ff]'
                      : 'text-[#101828] hover:bg-[#f6f9ff]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-8 hidden grid-cols-3 gap-2 lg:grid">
          {categories.slice(0, 6).map(({ slug, label, icon: Icon }) => (
            <button
              key={slug}
              type="button"
              onClick={() => setCategory(slug)}
              className={`flex min-h-[46px] items-center gap-2 rounded-[10px] border px-3 text-left text-sm font-semibold transition ${
                category === slug
                  ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                  : 'border-[#d8e0ec] bg-white text-[#101828] hover:border-[#0866ff]'
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
          className="mt-6 flex min-h-[50px] w-full items-center justify-center rounded-[10px] bg-[#0866ff] px-5 text-[15px] font-semibold text-white shadow-[0_14px_28px_rgba(8,102,255,.22)] transition hover:bg-[#0057e6]"
        >
          {t.submit}
        </button>

        <p className="mt-4 text-sm leading-6 text-[#101828] lg:hidden">{t.note}</p>
      </form>

      <div className="hidden lg:block">
        <div className="rounded-[12px] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,.18)]">
          <h1 className="text-[40px] font-semibold leading-[1.28] tracking-[-0.045em] text-[#101828]">
            {t.title}
          </h1>
          <p className="mt-5 text-[15px] leading-6 text-[#101828]">{t.note}</p>
        </div>

        <button
          type="button"
          onClick={() => router.push(localizePublicHref(locale, '/marketplace/cars'))}
          className="mt-4 flex min-h-[66px] w-full items-center justify-between rounded-[12px] bg-white px-6 text-left shadow-[0_8px_24px_rgba(15,23,42,.16)] transition hover:translate-x-0.5"
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
