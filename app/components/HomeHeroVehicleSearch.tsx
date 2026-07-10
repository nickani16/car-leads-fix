'use client'

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BusFront,
  Check,
  ChevronDown,
  Clock3,
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
import {
  localizePublicHref,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import {
  getMarketplaceCategory,
  marketplaceLanguage,
  type MarketplaceCategorySlug,
} from '@/lib/marketplace'
import { defaultSearchCountryForLocale } from '@/lib/market-locale'

type Intent = 'sale' | 'leasing'

type LastSearch = {
  label: string
  subLabel: string
  href: string
}

type AdvancedFilters = {
  make: string
  model: string
  priceMax: string
  yearMin: string
  mileageMax: string
  fuel: string
  gearbox: string
}

type AdvancedFilterLabels = {
  make: string
  model: string
  priceMax: string
  yearMin: string
  mileageMax: string
  fuel: string
  gearbox: string
  all: string
  petrol: string
  diesel: string
  hybrid: string
  electric: string
  automatic: string
  manual: string
}

const lastSearchStorageKey = 'autorell:last-home-search'

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
  { slug: 'cars', label: 'Bilar', icon: AutorellCarIcon },
  { slug: 'vans', label: 'Transportbilar', icon: AutorellVanIcon },
  { slug: 'motorcycles', label: 'Motorcyklar', icon: AutorellMotorbikeIcon },
  { slug: 'motorhomes', label: 'Husbilar', icon: BusFront },
  { slug: 'caravans', label: 'Husvagnar', icon: AutorellCaravanIcon },
  { slug: 'trucks', label: 'Lastbilar', icon: AutorellTruckIcon },
  { slug: 'agriculture', label: 'Lantbruksmaskiner', icon: Tractor },
  { slug: 'construction', label: 'Entreprenadmaskiner', icon: Construction },
  { slug: 'electric-bikes', label: 'Cyklar', icon: AutorellBikeIcon },
  { slug: 'e-scooters', label: 'Sparkcyklar', icon: AutorellScooterIcon },
] satisfies Array<{
  slug: MarketplaceCategorySlug
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}>

const marketOptions = [
  { code: 'AT', sv: 'Österrike', en: 'Austria', de: 'Österreich' },
  { code: 'BE', sv: 'Belgien', en: 'Belgium', de: 'Belgien' },
  { code: 'ES', sv: 'Spanien', en: 'Spain', de: 'Spanien' },
  { code: 'FR', sv: 'Frankrike', en: 'France', de: 'Frankreich' },
  { code: 'IT', sv: 'Italien', en: 'Italy', de: 'Italien' },
  { code: 'PL', sv: 'Polen', en: 'Poland', de: 'Polen' },
  { code: 'NL', sv: 'Nederlander', en: 'Netherlands', de: 'Niederlande' },
  { code: 'FI', sv: 'Finland', en: 'Finland', de: 'Finnland' },
  { code: 'SE', sv: 'Sverige', en: 'Sweden', de: 'Schweden' },
  { code: 'DE', sv: 'Tyskland', en: 'Germany', de: 'Deutschland' },
  { code: 'DK', sv: 'Danmark', en: 'Denmark', de: 'Dänemark' },
  { code: 'EU', sv: 'Europa', en: 'Europe', de: 'Europa' },
]

const copyByLocale = {
  sv: {
    title: 'Ett större utbud av fordon till salu',
    note: 'Autorell samlar annonser från flera europeiska marknader på ett ställe.',
    searchAgain: 'Sök igen: Bilar',
    searchAgainSub: 'Fordon till salu',
    tabs: { sale: 'Fordon till salu', leasing: 'Leasing av fordon' },
    placeholder: 'Sök fordon, ort eller kommun',
    verified: 'Visa endast verifierade säljare',
    expandArea: 'Utöka sökområde',
    markets: 'Marknader',
    moreCategories: 'Fler fordonskategorier',
    moreFilters: 'Fler sökfilter',
    advanced: {
      make: 'Märke',
      model: 'Modell',
      priceMax: 'Maxpris',
      yearMin: 'Årsmodell från',
      mileageMax: 'Miltal max',
      fuel: 'Drivmedel',
      gearbox: 'Växellåda',
      all: 'Visa allt',
      petrol: 'Bensin',
      diesel: 'Diesel',
      hybrid: 'Hybrid',
      electric: 'El',
      automatic: 'Automat',
      manual: 'Manuell',
    },
    submit: 'Hitta fordon',
  },
  en: {
    title: 'A wider selection of vehicles for sale',
    note: 'Autorell gathers listings from several European markets in one place.',
    searchAgain: 'Search again: Cars',
    searchAgainSub: 'Vehicles for sale',
    tabs: { sale: 'Vehicles for sale', leasing: 'Vehicle leasing' },
    placeholder: 'Search vehicle, city or area',
    verified: 'Show verified sellers only',
    expandArea: 'Expand search area',
    markets: 'Markets',
    moreCategories: 'More vehicle categories',
    moreFilters: 'More filters',
    advanced: {
      make: 'Make',
      model: 'Model',
      priceMax: 'Max price',
      yearMin: 'Year from',
      mileageMax: 'Mileage max',
      fuel: 'Fuel',
      gearbox: 'Gearbox',
      all: 'Show all',
      petrol: 'Petrol',
      diesel: 'Diesel',
      hybrid: 'Hybrid',
      electric: 'Electric',
      automatic: 'Automatic',
      manual: 'Manual',
    },
    submit: 'Find vehicles',
  },
  de: {
    title: 'Eine größere Auswahl an Fahrzeugen',
    note: 'Autorell bündelt Anzeigen aus mehreren europäischen Märkten an einem Ort.',
    searchAgain: 'Erneut suchen: Autos',
    searchAgainSub: 'Fahrzeuge kaufen',
    tabs: { sale: 'Fahrzeuge kaufen', leasing: 'Fahrzeugleasing' },
    placeholder: 'Fahrzeug, Ort oder Gemeinde suchen',
    verified: 'Nur geprüfte Verkäufer anzeigen',
    expandArea: 'Suchgebiet erweitern',
    markets: 'Märkte',
    moreCategories: 'Weitere Fahrzeugkategorien',
    moreFilters: 'Weitere Filter',
    advanced: {
      make: 'Marke',
      model: 'Modell',
      priceMax: 'Max. Preis',
      yearMin: 'Baujahr ab',
      mileageMax: 'Kilometer max.',
      fuel: 'Kraftstoff',
      gearbox: 'Getriebe',
      all: 'Alle anzeigen',
      petrol: 'Benzin',
      diesel: 'Diesel',
      hybrid: 'Hybrid',
      electric: 'Elektro',
      automatic: 'Automatik',
      manual: 'Manuell',
    },
    submit: 'Fahrzeuge finden',
  },
} as const

function marketLabel(
  option: (typeof marketOptions)[number],
  locale: PublicLocale,
) {
  if (locale === 'sv') return option.sv
  if (locale === 'de') return option.de
  return locale === 'en' ? option.en : translatePublic(locale, option.en)
}

function localizedLabel(
  locale: PublicLocale,
  sv: string,
  de: string,
  en: string,
) {
  if (locale === 'sv') return sv
  if (locale === 'de') return de
  return locale === 'en' ? en : translatePublic(locale, en)
}

function categoryLabel(slug: MarketplaceCategorySlug, locale: PublicLocale) {
  const category = getMarketplaceCategory(slug)
  const language = marketplaceLanguage(locale)
  const label = category.labels[language]
  return locale === 'sv' || locale === 'de' || locale === 'en'
    ? label
    : translatePublic(locale, category.labels.en)
}

export default function HomeHeroVehicleSearch({
  locale,
}: {
  locale: PublicLocale
}) {
  const router = useRouter()
  const t =
    locale === 'de'
      ? copyByLocale.de
      : locale === 'en'
        ? copyByLocale.en
        : locale === 'sv'
          ? copyByLocale.sv
          : translatePublicObject(locale, copyByLocale.en)
  const [intent, setIntent] = useState<Intent>('sale')
  const [selectedCategories, setSelectedCategories] = useState<MarketplaceCategorySlug[]>([])
  const [query, setQuery] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    make: '',
    model: '',
    priceMax: '',
    yearMin: '',
    mileageMax: '',
    fuel: '',
    gearbox: '',
  })
  const [markets, setMarkets] = useState<string[]>(() => [
    defaultSearchCountryForLocale(locale) || 'EU',
  ])
  const [marketsOpen, setMarketsOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [moreCategoriesOpen, setMoreCategoriesOpen] = useState(false)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [lastSearch, setLastSearch] = useState<LastSearch | null>(null)
  const moreFiltersRef = useRef<HTMLDivElement>(null)

  const selectedRoute = useMemo(() => {
    if (selectedCategories.length === 1) {
      return categoryRoutes[selectedCategories[0]] || '/marketplace'
    }
    return '/marketplace'
  }, [selectedCategories])
  const selectedCategory =
    categories.find((item) => item.slug === selectedCategories[0]) || categories[0]
  const SelectedCategoryIcon = selectedCategory.icon
  const allVehiclesLabel = localizedLabel(
    locale,
    'Alla fordon',
    'Alle Fahrzeuge',
    'All vehicles',
  )
  const chooseCategoryLabel = localizedLabel(
    locale,
    'Välj kategori',
    'Kategorie wählen',
    'Choose category',
  )
  const selectedCategoryLabel =
    selectedCategories.length === 1
      ? categoryLabel(selectedCategory.slug, locale)
      : selectedCategories.length > 1
        ? `${selectedCategories.length} ${localizedLabel(locale, 'kategorier', 'Kategorien', 'categories')}`
        : chooseCategoryLabel

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(lastSearchStorageKey)
        if (!stored) return
        const parsed = JSON.parse(stored) as LastSearch
        if (parsed?.label && parsed?.href) setLastSearch(parsed)
      } catch {
        setLastSearch(null)
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!moreFiltersOpen) return

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node)) return
      if (moreFiltersRef.current?.contains(target)) return
      setMoreFiltersOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [moreFiltersOpen])

  function toggleMarket(code: string) {
    setMarkets((current) => {
      if (current.includes(code)) {
        const next = current.filter((item) => item !== code)
        return next.length ? next : current
      }
      return [...current, code]
    })
  }

  function toggleCategory(slug: MarketplaceCategorySlug) {
    setSelectedCategories((current) => {
      if (current.includes(slug)) {
        const next = current.filter((item) => item !== slug)
        return next
      }
      return [...current, slug]
    })
  }

  function updateAdvancedFilter(
    key: keyof AdvancedFilters,
    value: string,
  ) {
    setAdvancedFilters((current) => ({ ...current, [key]: value }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    const trimmedQuery = query.trim()
    if (trimmedQuery) params.set('q', trimmedQuery)
    if (intent === 'leasing') params.set('intent', 'leasing')
    if (markets.length) params.set('markets', markets.join(','))
    if (verifiedOnly) params.set('verified', 'true')
    if (selectedCategories.length > 1) params.set('categories', selectedCategories.join(','))
    Object.entries(advancedFilters).forEach(([key, value]) => {
      const trimmedValue = value.trim()
      if (trimmedValue) params.set(key, trimmedValue)
    })

    const href = localizePublicHref(
      locale,
      `${selectedRoute}${params.size ? `?${params}` : ''}`,
    )
    const savedSearch = {
      label: `${localizedLabel(locale, 'Sök igen', 'Erneut suchen', 'Search again')}: ${
        trimmedQuery || (selectedCategories.length ? selectedCategoryLabel : allVehiclesLabel)
      }`,
      subLabel: t.tabs[intent],
      href,
    }

    try {
      window.localStorage.setItem(lastSearchStorageKey, JSON.stringify(savedSearch))
    } catch {
      // localStorage can be unavailable in private modes. Navigation should still work.
    }
    setLastSearch(savedSearch)
    router.push(href)
  }

  const selectedMarketsLabel = marketOptions
    .filter((option) => markets.includes(option.code))
    .map((option) => marketLabel(option, locale))
    .join(', ')

  const searchAgain = lastSearch || {
    label: t.searchAgain,
    subLabel: t.searchAgainSub,
    href: localizePublicHref(locale, '/marketplace/cars'),
  }
  const titleText =
    locale === 'sv'
      ? { before: 'Ett större utbud av fordon till ', highlight: 'salu' }
      : locale === 'en'
        ? { before: 'A wider selection of vehicles for ', highlight: 'sale' }
        : null
  const noteText = t.note.startsWith('Autorell')
    ? { brand: 'Autorell', rest: t.note.slice('Autorell'.length) }
    : null

  return (
    <div className="mx-auto grid w-full max-w-[calc(100dvw-16px)] gap-0 min-[390px]:max-w-[374px] min-[430px]:max-w-[410px] lg:max-w-none lg:grid-cols-[minmax(520px,560px)_380px] lg:items-start lg:justify-center lg:gap-10">
      <div className="contents lg:hidden">
        <div className="rounded-t-[12px] bg-white px-5 py-5 text-center">
          <h1 className="mx-auto max-w-[320px] text-[21px] !font-medium leading-[1.17] tracking-[-0.04em] text-[#101828]">
            {titleText ? (
              <>
                {titleText.before}
                <span className="text-[#0866ff]">
                  {titleText.highlight}
                </span>
              </>
            ) : (
              t.title
            )}
          </h1>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="relative rounded-b-[12px] bg-white p-4 shadow-none lg:rounded-[12px] lg:px-6 lg:pb-6 lg:pt-3 lg:shadow-[0_2px_10px_rgba(15,23,42,.18)]"
        role="search"
      >
        <div className="-mx-4 -mt-4 border-b border-[#d9e2ef] bg-transparent lg:mx-0 lg:mt-0 lg:bg-white lg:border-[#d8d8d8]">
          <div className="grid grid-cols-2">
            {(['sale', 'leasing'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setIntent(tab)}
                className={`relative min-h-[56px] px-2 text-center text-[14px] transition lg:min-h-[46px] ${
                  intent === tab
                    ? '!font-medium text-[#101828]'
                    : '!font-normal text-[#344054] hover:text-[#0866ff]'
                }`}
              >
                {t.tabs[tab]}
                {intent === tab ? (
                  <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t-full bg-[#0866ff] lg:h-[2px]" />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <label className="group relative mt-4 flex min-h-[50px] items-center gap-3 rounded-[8px] bg-[#f0f3f7] px-4 ring-1 ring-[#e2e8f0] transition-all duration-200 focus-within:ring-[#0866ff] lg:mt-4 lg:min-h-[50px] lg:justify-center lg:bg-[#f0f0f0] lg:px-4 lg:ring-0 lg:focus-within:justify-between lg:focus-within:ring-1 lg:focus-within:ring-[#101828]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder=""
            aria-label={t.placeholder}
            className="min-w-0 flex-1 appearance-none rounded-none !bg-transparent text-[15px] font-normal text-[#101828] outline-none [background:transparent] lg:flex-none lg:w-[190px] lg:text-left lg:text-[14px] lg:transition-[width] lg:duration-200 lg:ease-out lg:focus:w-[calc(100%-36px)]"
          />
          {query ? null : (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-normal text-[#767676] transition-all duration-200 lg:left-1/2 lg:-translate-x-1/2 lg:text-[14px] lg:group-focus-within:left-4 lg:group-focus-within:translate-x-0"
            >
              {t.placeholder}
            </span>
          )}
          <Search className="h-5 w-5 shrink-0 text-[#101828] transition-all duration-200 lg:absolute lg:left-[calc(50%+124px)] lg:top-1/2 lg:-translate-y-1/2 lg:group-focus-within:left-auto lg:group-focus-within:right-4" strokeWidth={2.1} />
        </label>

        <label className="group mt-5 flex cursor-pointer items-center gap-2 text-sm !font-normal text-[#101828] lg:mt-7 lg:text-[14px] [&_*]:!font-normal">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(event) => setVerifiedOnly(event.target.checked)}
            className="peer sr-only"
          />
          <span
            className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[4px] border transition duration-200 ease-out group-hover:border-[#0866ff] peer-focus-visible:ring-4 peer-focus-visible:ring-[#0866ff]/15 lg:h-[18px] lg:w-[18px]"
            style={{
              backgroundColor: verifiedOnly ? '#0866ff' : '#ffffff',
              borderColor: verifiedOnly ? '#0866ff' : '#8d96a6',
              transform: verifiedOnly ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <Check
              className={`h-3.5 w-3.5 text-white transition duration-200 ease-out ${
                verifiedOnly ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
              }`}
              strokeWidth={3}
            />
          </span>
          <span>{t.verified}</span>
        </label>

        <div className="relative mt-7 hidden lg:block">
          <div className="mb-2 text-[14px] font-semibold text-[#101828]">
            {t.expandArea}
          </div>
          <button
            type="button"
            onClick={() => setMarketsOpen((current) => !current)}
            className="flex min-h-[48px] w-[247px] items-center justify-between rounded-[8px] border border-[#c9c9c9] bg-white px-3 text-left text-[15px] !font-normal text-[#101828] transition hover:border-[#0866ff] [&_*]:!font-normal"
          >
            <span className="truncate !font-normal">{selectedMarketsLabel}</span>
            <ChevronDown className={`h-5 w-5 shrink-0 transition ${marketsOpen ? 'rotate-180 text-[#0866ff]' : ''}`} />
          </button>
          {marketsOpen ? (
            <MarketPicker
              locale={locale}
              markets={markets}
              onToggle={toggleMarket}
              className="absolute left-0 top-[calc(100%+8px)] z-50 w-[247px]"
            />
          ) : null}
        </div>

        <div className="relative mt-7 lg:hidden">
          <button
            type="button"
            onClick={() => setCategoryOpen((current) => !current)}
            className="flex min-h-[48px] w-full items-center justify-between rounded-[10px] border border-[#d8e0ec] bg-white px-3 text-left transition hover:border-[#0866ff]"
          >
            <span className="flex min-w-0 items-center gap-2">
              <SelectedCategoryIcon className="h-4 w-4 shrink-0 text-[#0866ff]" />
              <span className="truncate text-sm font-semibold text-[#101828]">
                {selectedCategoryLabel}
              </span>
            </span>
            <ChevronDown className={`h-5 w-5 shrink-0 transition ${categoryOpen ? 'rotate-180 text-[#0866ff]' : ''}`} />
          </button>
          {categoryOpen ? (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 grid max-h-[310px] gap-2 overflow-auto rounded-[12px] border border-[#d8e0ec] bg-white p-2 shadow-[0_20px_42px_rgba(15,23,42,.18)]">
              {categories.map(({ slug, icon: Icon }) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => toggleCategory(slug)}
                  className={`flex min-h-[44px] items-center gap-2 rounded-[10px] px-3 text-left text-sm !font-normal transition [&_*]:!font-normal ${
                    selectedCategories.includes(slug)
                      ? 'bg-[#eef5ff] text-[#0866ff]'
                      : 'text-[#101828] hover:bg-[#f6f9ff]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate !font-normal">{categoryLabel(slug, locale)}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-8 hidden grid-cols-3 gap-2 lg:grid">
          {categories.slice(0, 6).map(({ slug, icon: Icon }) => (
            <button
              key={slug}
              type="button"
              onClick={() => toggleCategory(slug)}
              aria-pressed={selectedCategories.includes(slug)}
              className={`flex min-h-[45px] items-center gap-2 rounded-[8px] border px-3 text-left text-[14px] !font-normal transition [&_*]:!font-normal ${
                selectedCategories.includes(slug)
                  ? 'border-[#0866ff] bg-white text-[#101828]'
                  : 'border-[#c9c9c9] bg-white text-[#101828] hover:border-[#0866ff]'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${selectedCategories.includes(slug) ? 'text-[#0866ff]' : 'text-[#101828]'}`} />
              <span className="truncate !font-normal">{categoryLabel(slug, locale)}</span>
            </button>
          ))}
        </div>

        {!moreCategoriesOpen ? (
          <div className="mt-3 hidden lg:block">
            <button
              type="button"
              onClick={() => setMoreCategoriesOpen(true)}
              aria-expanded={moreCategoriesOpen}
              className="group inline-flex items-center gap-2 text-[14px] !font-medium text-[#0866ff] transition hover:text-[#0057e6]"
            >
              {t.moreCategories}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
                strokeWidth={2.2}
              />
            </button>
          </div>
        ) : null}

        {moreCategoriesOpen ? (
          <div className="mt-3 hidden grid-cols-3 gap-2 lg:grid">
            {categories.slice(6).map(({ slug, icon: Icon }) => (
              <button
                key={slug}
                type="button"
                onClick={() => toggleCategory(slug)}
                aria-pressed={selectedCategories.includes(slug)}
                className={`flex min-h-[45px] items-center gap-2 rounded-[8px] border px-3 text-left text-[14px] !font-normal transition [&_*]:!font-normal ${
                  selectedCategories.includes(slug)
                    ? 'border-[#0866ff] bg-white text-[#101828]'
                    : 'border-[#c9c9c9] bg-white text-[#101828] hover:border-[#0866ff]'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${selectedCategories.includes(slug) ? 'text-[#0866ff]' : 'text-[#101828]'}`} />
                <span className="truncate !font-normal">{categoryLabel(slug, locale)}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div ref={moreFiltersRef} className="relative mt-7 lg:mt-6">
          <button
            type="button"
            onClick={() => setMoreFiltersOpen((current) => !current)}
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#101828] lg:text-[16px]"
          >
            {t.moreFilters}
            <ChevronDown className={`h-4 w-4 transition ${moreFiltersOpen ? 'rotate-180 text-[#0866ff]' : ''}`} />
          </button>
          {moreFiltersOpen ? (
            <AdvancedFiltersPanel
              labels={t.advanced}
              values={advancedFilters}
              onChange={updateAdvancedFilter}
            />
          ) : null}
        </div>

        <button
          type="submit"
          className="mt-6 flex min-h-[50px] w-full items-center justify-center rounded-[14px] bg-[#0866ff] px-5 text-[15px] !font-medium text-white shadow-[0_14px_28px_rgba(8,102,255,.22)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#0057e6] hover:shadow-[0_18px_34px_rgba(8,102,255,.26)] active:translate-y-0 lg:min-h-[48px] lg:shadow-none lg:hover:shadow-[0_10px_20px_rgba(8,102,255,.18)]"
        >
          {t.submit}
        </button>

        <p className="mt-4 text-sm leading-6 text-[#101828] lg:hidden">
          {noteText ? (
            <>
              <span className="font-medium text-[#0866ff]">{noteText.brand}</span>
              {noteText.rest}
            </>
          ) : (
            t.note
          )}
        </p>
      </form>

      <button
        type="button"
        onClick={() => router.push(searchAgain.href)}
        className="mt-3 flex min-h-[62px] w-full items-center justify-between rounded-[12px] bg-white px-5 text-left shadow-none transition active:scale-[.99] lg:hidden"
      >
        <span>
          <span className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
            <Clock3 className="h-4 w-4" />
            {searchAgain.label}
          </span>
          <span className="mt-1 block text-sm text-[#667085]">
            {searchAgain.subLabel}
          </span>
        </span>
        <ChevronDown className="-rotate-90 h-5 w-5 text-[#101828]" />
      </button>

      <div className="hidden lg:block">
        <div className="rounded-[12px] bg-white/95 p-6 shadow-[0_18px_46px_rgba(15,23,42,.20)] backdrop-blur-md">
          <h1 className="text-[40px] !font-medium leading-[1.28] tracking-[-0.045em] text-[#101828]">
            {titleText ? (
              <>
                {titleText.before}
                <span className="text-[#0866ff] underline decoration-[#0866ff] decoration-2 underline-offset-[4px]">
                  {titleText.highlight}
                </span>
              </>
            ) : (
              t.title
            )}
          </h1>
          <p className="mt-5 text-[15px] leading-6 text-[#101828]">
            {noteText ? (
              <>
                <span className="font-medium text-[#0866ff]">{noteText.brand}</span>
                {noteText.rest}
              </>
            ) : (
              t.note
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push(searchAgain.href)}
          className="mt-4 flex min-h-[66px] w-full items-center justify-between rounded-[12px] bg-white px-6 text-left shadow-[0_8px_24px_rgba(15,23,42,.16)] transition hover:translate-x-0.5"
        >
          <span>
            <span className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
              <Clock3 className="h-4 w-4" />
              {searchAgain.label}
            </span>
            <span className="mt-1 block text-sm text-[#667085]">
              {searchAgain.subLabel}
            </span>
          </span>
          <ChevronDown className="-rotate-90 h-5 w-5 text-[#101828]" />
        </button>
      </div>
    </div>
  )
}

function MarketPicker({
  locale,
  markets,
  onToggle,
  className = '',
}: {
  locale: PublicLocale
  markets: string[]
  onToggle: (code: string) => void
  className?: string
}) {
  return (
    <div className={`grid grid-cols-2 gap-2 rounded-[12px] bg-white p-2 ${className}`}>
      {marketOptions.map((option) => {
        const selected = markets.includes(option.code)
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => onToggle(option.code)}
            className={`flex min-h-[44px] items-center justify-center rounded-[10px] border px-3 text-center text-sm !font-normal transition [&_*]:!font-normal ${
              selected
                ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                : 'border-[#d8e0ec] bg-white text-[#101828] hover:border-[#0866ff]'
            }`}
          >
            <span className="truncate !font-normal">{marketLabel(option, locale)}</span>
          </button>
        )
      })}
    </div>
  )
}

function AdvancedFiltersPanel({
  labels,
  values,
  onChange,
}: {
  labels: AdvancedFilterLabels
  values: AdvancedFilters
  onChange: (key: keyof AdvancedFilters, value: string) => void
}) {
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[80] rounded-[12px] border border-[#d8e0ec] bg-white p-4 shadow-[0_22px_46px_rgba(15,23,42,.20)]">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
        <SlidersHorizontal className="h-4 w-4 text-[#0866ff]" />
        {labels.make}, {labels.model}, {labels.priceMax}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <FilterField
          label={labels.make}
          value={values.make}
          onChange={(value) => onChange('make', value)}
        />
        <FilterField
          label={labels.model}
          value={values.model}
          onChange={(value) => onChange('model', value)}
        />
        <HomeRangeField
          className="lg:col-span-2"
          label={labels.priceMax}
          value={values.priceMax}
          min={0}
          max={1500000}
          step={10000}
          suffix="kr"
          onChange={(value) => onChange('priceMax', value)}
        />
        <HomeRangeField
          className="lg:col-span-2"
          label={labels.yearMin}
          value={values.yearMin}
          min={1980}
          max={new Date().getFullYear()}
          step={1}
          onChange={(value) => onChange('yearMin', value)}
        />
        <HomeRangeField
          className="lg:col-span-2"
          label={labels.mileageMax}
          value={values.mileageMax}
          min={0}
          max={250000}
          step={5000}
          suffix="km"
          onChange={(value) => onChange('mileageMax', value)}
        />
        <label className="grid gap-1.5 text-[13px] font-medium text-[#344054]">
          {labels.fuel}
          <select
            value={values.fuel}
            onChange={(event) => onChange('fuel', event.target.value)}
            className="min-h-[42px] rounded-[8px] border border-[#d8e0ec] bg-white px-3 text-[14px] font-normal text-[#101828] outline-none transition hover:border-[#0866ff] focus:border-[#0866ff]"
          >
            <option value="">{labels.all}</option>
            <option value="petrol">{labels.petrol}</option>
            <option value="diesel">{labels.diesel}</option>
            <option value="hybrid">{labels.hybrid}</option>
            <option value="electric">{labels.electric}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-[13px] font-medium text-[#344054]">
          {labels.gearbox}
          <select
            value={values.gearbox}
            onChange={(event) => onChange('gearbox', event.target.value)}
            className="min-h-[42px] rounded-[8px] border border-[#d8e0ec] bg-white px-3 text-[14px] font-normal text-[#101828] outline-none transition hover:border-[#0866ff] focus:border-[#0866ff]"
          >
            <option value="">{labels.all}</option>
            <option value="automatic">{labels.automatic}</option>
            <option value="manual">{labels.manual}</option>
          </select>
        </label>
      </div>
    </div>
  )
}

function HomeRangeField({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  className = '',
  onChange,
}: {
  label: string
  value: string
  min: number
  max: number
  step: number
  suffix?: string
  className?: string
  onChange: (value: string) => void
}) {
  const rangeValue = Number(value || max)
  const formattedValue = value ? formatHomeFilterNumber(Number(value)) : label
  const displaySuffix = value && suffix ? ` ${suffix}` : ''

  return (
    <label className={`grid gap-1.5 text-[13px] font-medium text-[#344054] ${className}`}>
      {label}
      <div className="rounded-[8px] border border-[#d8e0ec] bg-white px-3 py-2 transition hover:border-[#0866ff] focus-within:border-[#0866ff]">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={rangeValue}
          onChange={(event) => onChange(event.target.value)}
          className="autorell-range h-6 w-full accent-[#0866ff]"
        />
        <div className="mt-1 flex items-center justify-between text-xs font-semibold text-[#667085]">
          <span>{formatHomeFilterNumber(min)}</span>
          <span>{formatHomeFilterNumber(max)}{suffix ? ` ${suffix}` : ''}+</span>
        </div>
        <div className={`mt-2 text-[14px] font-normal ${value ? 'text-[#101828]' : 'text-[#767676]'}`}>
          {formattedValue}{displaySuffix}
        </div>
      </div>
    </label>
  )
}

function FilterField({
  label,
  value,
  inputMode,
  onChange,
}: {
  label: string
  value: string
  inputMode?: 'numeric'
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1.5 text-[13px] font-medium text-[#344054]">
      {label}
      <input
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        className="home-filter-text-control min-h-[42px] rounded-[8px] border border-[#d8e0ec] bg-white px-3 text-[14px] font-normal text-[#101828] outline-none transition placeholder:text-[#767676] hover:border-[#0866ff] focus:border-[#0866ff]"
      />
    </label>
  )
}

function formatHomeFilterNumber(value: number) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(value)
}
