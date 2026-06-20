'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  Fuel,
  Gauge,
  Globe2,
  LockKeyhole,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react'

export type PublicVehicle = {
  id: string
  make: string | null
  model: string | null
  modelYear: string | null
  mileageKm: number | null
  fuelType: string | null
  bodyType: string | null
  originCountry: string
  saleFormat: 'auction' | 'marketplace'
  priceBand: 'under-15' | '15-30' | '30-50' | '50-plus' | null
  imageAvailable: boolean
}

import {
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

const copy = {
  sv: {
    filterEyebrow: 'Filtrera fordonsutbudet',
    filterTitle: 'Hitta rätt bil snabbare.',
    filterText:
      'Kombinera märke, modell, drivlina, prisnivå, årsmodell och miltal. Fullständigt pris och fordonsdata visas efter godkänt handlarlogin.',
    search: 'Sök märke eller modell',
    allMakes: 'Alla märken',
    allModels: 'Alla modeller',
    allFuel: 'Alla drivlinor',
    allBodies: 'Alla karosser',
    allCountries: 'Alla länder',
    allFormats: 'Alla säljformat',
    allPrices: 'Alla prisnivåer',
    minYear: 'Från årsmodell',
    maxMileage: 'Max miltal',
    auction: 'Auktion',
    marketplace: 'Fast pris',
    under15: 'Under €15 000',
    between15And30: '€15 000–30 000',
    between30And50: '€30 000–50 000',
    over50: 'Över €50 000',
    electric: 'El',
    hybrid: 'Hybrid',
    diesel: 'Diesel',
    petrol: 'Bensin',
    vehicles: 'fordon',
    view: 'Visa fordon',
    year: 'Modellår',
    mileage: 'Mätarställning',
    fuel: 'Drivlina',
    origin: 'Ursprungsland',
    locked: 'Fullständig fordonsinformation är låst',
    imageLocked: 'Fordonsbild skyddad',
    noPublicImage: 'Bilder visas endast för godkända handlare',
    modalTitle: 'Vill du köpa det här fordonet?',
    modalText:
      'Ansök som bilhandlare för att se registrering, VIN, fullständig skickrapport, alla bilder, pris och budgivning.',
    signupEyebrow: 'Få tillgång inom 24 timmar',
    signup: 'Ansök som bilhandlare',
    existing: 'Är du redan kund?',
    loginText: 'Logga in för att se hela fordonet och köpa eller lägga bud.',
    login: 'Logga in',
    emptyTitle: 'Inga fordon matchar filtren',
    emptyText: 'Prova att ta bort ett eller flera filter för att bredda sökningen.',
    reset: 'Rensa alla filter',
    activeFilters: 'Aktiva filter',
    filters: 'Filter',
    accessItems: [
      'VIN och registreringsnummer',
      'Skickrapport och fullständigt bildgalleri',
      'Pris, bud och köpknappar',
    ],
  },
  de: {
    filterEyebrow: 'Fahrzeugangebot filtern',
    filterTitle: 'Schneller das passende Fahrzeug finden.',
    filterText:
      'Kombinieren Sie Marke, Modell, Antrieb, Preisstufe, Modelljahr und Kilometerstand. Vollständige Preise und Daten sind nach Händlerfreigabe sichtbar.',
    search: 'Marke oder Modell suchen',
    allMakes: 'Alle Marken',
    allModels: 'Alle Modelle',
    allFuel: 'Alle Antriebe',
    allBodies: 'Alle Karosserien',
    allCountries: 'Alle Länder',
    allFormats: 'Alle Verkaufsarten',
    allPrices: 'Alle Preisstufen',
    minYear: 'Ab Modelljahr',
    maxMileage: 'Max. Kilometer',
    auction: 'Auktion',
    marketplace: 'Festpreis',
    under15: 'Unter €15.000',
    between15And30: '€15.000–30.000',
    between30And50: '€30.000–50.000',
    over50: 'Über €50.000',
    electric: 'Elektro',
    hybrid: 'Hybrid',
    diesel: 'Diesel',
    petrol: 'Benzin',
    vehicles: 'Fahrzeuge',
    view: 'Fahrzeug ansehen',
    year: 'Modelljahr',
    mileage: 'Kilometerstand',
    fuel: 'Antrieb',
    origin: 'Herkunftsland',
    locked: 'Vollständige Fahrzeugdaten sind geschützt',
    imageLocked: 'Fahrzeugbild geschützt',
    noPublicImage: 'Bilder sind nur für freigegebene Händler sichtbar',
    modalTitle: 'Möchten Sie dieses Fahrzeug kaufen?',
    modalText:
      'Registrieren Sie sich als Händler, um Kennzeichen, VIN, Zustandsbericht, alle Bilder, Preis und Gebote zu sehen.',
    signupEyebrow: 'Zugang innerhalb von 24 Stunden',
    signup: 'Händlerzugang beantragen',
    existing: 'Sind Sie bereits Kunde?',
    loginText:
      'Melden Sie sich an, um das vollständige Fahrzeug zu sehen und zu kaufen oder zu bieten.',
    login: 'Anmelden',
    emptyTitle: 'Keine Fahrzeuge entsprechen den Filtern',
    emptyText: 'Entfernen Sie einen oder mehrere Filter, um die Suche zu erweitern.',
    reset: 'Alle Filter löschen',
    activeFilters: 'Aktive Filter',
    filters: 'Filter',
    accessItems: [
      'VIN und Kennzeichen',
      'Zustandsbericht und vollständige Bilder',
      'Preis, Gebote und Kaufaktionen',
    ],
  },
  en: {
    filterEyebrow: 'Filter available vehicles',
    filterTitle: 'Find the right vehicle faster.',
    filterText:
      'Combine make, model, powertrain, price band, model year and mileage. Complete pricing and vehicle data are available after dealer approval.',
    search: 'Search make or model',
    allMakes: 'All makes',
    allModels: 'All models',
    allFuel: 'All powertrains',
    allBodies: 'All body types',
    allCountries: 'All countries',
    allFormats: 'All sale formats',
    allPrices: 'All price bands',
    minYear: 'Minimum model year',
    maxMileage: 'Maximum mileage',
    auction: 'Auction',
    marketplace: 'Fixed price',
    under15: 'Under €15,000',
    between15And30: '€15,000–30,000',
    between30And50: '€30,000–50,000',
    over50: 'Over €50,000',
    electric: 'Electric',
    hybrid: 'Hybrid',
    diesel: 'Diesel',
    petrol: 'Petrol',
    vehicles: 'vehicles',
    view: 'View vehicle',
    year: 'Model year',
    mileage: 'Mileage',
    fuel: 'Powertrain',
    origin: 'Origin',
    locked: 'Complete vehicle information is protected',
    imageLocked: 'Vehicle image protected',
    noPublicImage: 'Images are available to approved dealers only',
    modalTitle: 'Do you want to buy this vehicle?',
    modalText:
      'Apply as a dealer to see registration, VIN, the complete condition report, all images, price and bidding.',
    signupEyebrow: 'Get access within 24 hours',
    signup: 'Apply for dealer access',
    existing: 'Are you already a customer?',
    loginText:
      'Log in to view the complete vehicle and buy or place a bid.',
    login: 'Log in',
    emptyTitle: 'No vehicles match your filters',
    emptyText: 'Remove one or more filters to broaden the search.',
    reset: 'Clear all filters',
    activeFilters: 'Active filters',
    filters: 'Filters',
    accessItems: [
      'VIN & registration',
      'Condition report & full gallery',
      'Price, bids & purchase actions',
    ],
  },
} as const

function formatCountry(countryCode: string, locale: PublicLocale) {
  try {
    return (
      new Intl.DisplayNames(
        [locale === 'sv' ? 'sv' : locale === 'de' ? 'de' : 'en'],
        { type: 'region' }
      ).of(countryCode) || countryCode
    )
  } catch {
    return countryCode
  }
}

function normalizedFuel(value: string | null) {
  const fuel = (value || '').toLowerCase()
  if (fuel.includes('electric') || fuel.includes('elektr') || fuel === 'el') return 'electric'
  if (fuel.includes('hybrid')) return 'hybrid'
  if (fuel.includes('diesel')) return 'diesel'
  if (fuel.includes('petrol') || fuel.includes('gasoline') || fuel.includes('bensin')) return 'petrol'
  return fuel
}

export default function PublicVehicleBrowser({
  vehicles,
  locale,
}: {
  vehicles: PublicVehicle[]
  locale: PublicLocale
}) {
  const t =
    locale === 'sv'
      ? copy.sv
      : locale === 'de'
        ? copy.de
        : translatePublicObject(locale, copy.en)
  const [search, setSearch] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [fuel, setFuel] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [country, setCountry] = useState('')
  const [format, setFormat] = useState('')
  const [priceBand, setPriceBand] = useState('')
  const [minYear, setMinYear] = useState('')
  const [maxMileage, setMaxMileage] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<PublicVehicle | null>(null)

  const makes = useMemo(
    () => Array.from(new Set(vehicles.map((vehicle) => vehicle.make).filter(Boolean) as string[])).sort(),
    [vehicles]
  )
  const models = useMemo(
    () =>
      Array.from(
        new Set(
          vehicles
            .filter((vehicle) => !make || vehicle.make === make)
            .map((vehicle) => vehicle.model)
            .filter(Boolean) as string[]
        )
      ).sort(),
    [make, vehicles]
  )
  const bodyTypes = useMemo(
    () => Array.from(new Set(vehicles.map((vehicle) => vehicle.bodyType).filter(Boolean) as string[])).sort(),
    [vehicles]
  )
  const countries = useMemo(
    () => Array.from(new Set(vehicles.map((vehicle) => vehicle.originCountry))).sort(),
    [vehicles]
  )

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase()
    const yearFloor = Number(minYear)
    const mileageCeiling = Number(maxMileage)

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !query ||
        [vehicle.make, vehicle.model, vehicle.fuelType, vehicle.bodyType].some(
          (value) => value?.toLowerCase().includes(query)
        )

      return (
        matchesSearch &&
        (!make || vehicle.make === make) &&
        (!model || vehicle.model === model) &&
        (!fuel || normalizedFuel(vehicle.fuelType) === fuel) &&
        (!bodyType || vehicle.bodyType === bodyType) &&
        (!country || vehicle.originCountry === country) &&
        (!format || vehicle.saleFormat === format) &&
        (!priceBand || vehicle.priceBand === priceBand) &&
        (!yearFloor || Number(vehicle.modelYear) >= yearFloor) &&
        (!mileageCeiling ||
          (vehicle.mileageKm !== null && vehicle.mileageKm <= mileageCeiling))
      )
    })
  }, [
    bodyType,
    country,
    format,
    fuel,
    make,
    maxMileage,
    minYear,
    model,
    priceBand,
    search,
    vehicles,
  ])

  const activeFilterCount = [
    search,
    make,
    model,
    fuel,
    bodyType,
    country,
    format,
    priceBand,
    minYear,
    maxMileage,
  ].filter(Boolean).length

  useEffect(() => {
    if (!selectedVehicle) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedVehicle(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedVehicle])

  function resetFilters() {
    setSearch('')
    setMake('')
    setModel('')
    setFuel('')
    setBodyType('')
    setCountry('')
    setFormat('')
    setPriceBand('')
    setMinYear('')
    setMaxMileage('')
  }

  return (
    <>
      <section className="border-y border-[#dfe5e7] bg-[#eef5f7] py-8 sm:py-12">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="overflow-hidden rounded-[24px] border border-[#d5e1e5] bg-white shadow-[0_24px_70px_rgba(37,63,75,.1)] sm:rounded-[30px]">
            <div className="grid gap-6 border-b border-[#dce7eb] bg-[linear-gradient(135deg,#f8fcfd_0%,#e8f4f8_100%)] p-6 text-[#202124] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4f8298]">
                  <SlidersHorizontal className="h-4 w-4" />
                  {t.filterEyebrow}
                </p>
                <h2 className="mt-3 text-3xl tracking-[-0.045em] sm:text-4xl">
                  {t.filterTitle}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#60747e]">
                  {t.filterText}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-[#c8dce4] bg-white/75 px-4 py-2 text-xs text-[#60747e]">
                  {activeFilterCount} {t.activeFilters.toLowerCase()}
                </span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full bg-[#B4D9EF] px-4 py-2 text-xs font-semibold text-[#202124] shadow-sm transition hover:bg-white"
                >
                  {t.reset}
                </button>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
              <label className="relative sm:col-span-2">
                <span className="mb-2 block text-xs font-semibold text-[#52616b]">
                  {t.search}
                </span>
                <Search className="pointer-events-none absolute bottom-3.5 left-4 h-4 w-4 text-[#849098]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.search}
                  className="h-12 w-full rounded-[14px] border border-[#d8dfe2] bg-[#f8faf9] pl-11 pr-4 text-sm outline-none transition focus:border-[#8dbdd8] focus:bg-white focus:ring-4 focus:ring-[#B4D9EF]/30"
                />
              </label>
              <FilterSelect value={make} onChange={(value) => {
                setMake(value)
                setModel('')
              }} label={t.allMakes} options={makes} />
              <FilterSelect value={model} onChange={setModel} label={t.allModels} options={models} disabled={!models.length} />
              <FilterSelect
                value={fuel}
                onChange={setFuel}
                label={t.allFuel}
                options={[
                  ['electric', t.electric],
                  ['hybrid', t.hybrid],
                  ['diesel', t.diesel],
                  ['petrol', t.petrol],
                ]}
              />
              <FilterSelect value={bodyType} onChange={setBodyType} label={t.allBodies} options={bodyTypes} />
              <FilterSelect
                value={priceBand}
                onChange={setPriceBand}
                label={t.allPrices}
                options={[
                  ['under-15', t.under15],
                  ['15-30', t.between15And30],
                  ['30-50', t.between30And50],
                  ['50-plus', t.over50],
                ]}
              />
              <FilterSelect
                value={format}
                onChange={setFormat}
                label={t.allFormats}
                options={[
                  ['auction', t.auction],
                  ['marketplace', t.marketplace],
                ]}
              />
              <FilterSelect
                value={country}
                onChange={setCountry}
                label={t.allCountries}
                options={countries.map(
                  (code): [string, string] => [
                    code,
                    formatCountry(code, locale),
                  ]
                )}
              />
              <label>
                <span className="mb-2 block text-xs font-semibold text-[#52616b]">
                  {t.minYear}
                </span>
                <input
                  type="number"
                  min="1990"
                  max="2035"
                  value={minYear}
                  onChange={(event) => setMinYear(event.target.value)}
                  placeholder="2020"
                  className="h-12 w-full rounded-[14px] border border-[#d8dfe2] bg-[#f8faf9] px-4 text-sm outline-none focus:border-[#8dbdd8] focus:ring-4 focus:ring-[#B4D9EF]/30"
                />
              </label>
              <label>
                <span className="mb-2 block text-xs font-semibold text-[#52616b]">
                  {t.maxMileage}
                </span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={maxMileage}
                  onChange={(event) => setMaxMileage(event.target.value)}
                  placeholder="100000"
                  className="h-12 w-full rounded-[14px] border border-[#d8dfe2] bg-[#f8faf9] px-4 text-sm outline-none focus:border-[#8dbdd8] focus:ring-4 focus:ring-[#B4D9EF]/30"
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5f0] py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#67757c]">
              <strong className="text-[#202124]">{filteredVehicles.length}</strong>{' '}
              {t.vehicles}
            </p>
            <span className="inline-flex items-center gap-2 text-xs text-[#71818a]">
              <ShieldCheck className="h-4 w-4 text-[#4f8298]" />
              {t.locked}
            </span>
          </div>

          {filteredVehicles.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredVehicles.map((vehicle) => (
                <article
                  key={vehicle.id}
                  className="group min-w-0 overflow-hidden rounded-[22px] border border-[#dde4e6] bg-white shadow-[0_12px_34px_rgba(32,33,36,.055)] transition hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(42,68,80,.11)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(145deg,#dce5e8_0%,#eef3f4_48%,#cbd7dc_100%)]">
                    <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_25%_20%,white_0,transparent_34%),linear-gradient(120deg,transparent_30%,rgba(79,110,124,.14)_31%,transparent_62%)]" />
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="flex flex-col items-center text-center text-[#62757f]">
                        <span className="grid h-16 w-16 place-items-center rounded-full border border-white/80 bg-white/55 shadow-sm backdrop-blur">
                          <CarFront className="h-8 w-8" />
                        </span>
                        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#bfd4dd] bg-white/88 px-4 py-2 text-xs font-semibold text-[#3f6577] shadow-md backdrop-blur-md">
                          <LockKeyhole className="h-4 w-4" />
                          {t.imageLocked}
                        </span>
                        {vehicle.imageAvailable && (
                          <span className="mt-2 text-[10px] font-medium text-[#62757f]">
                            {t.noPublicImage}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-semibold text-[#202124] shadow-sm backdrop-blur">
                      {vehicle.saleFormat === 'marketplace'
                        ? t.marketplace
                        : t.auction}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-[#456878]/68 to-transparent px-4 pb-4 pt-12 text-xs text-white">
                      <span className="flex min-w-0 items-center gap-2">
                        <Globe2 className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {formatCountry(vehicle.originCountry, locale)}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold">
                        {vehicle.mileageKm !== null
                          ? `${Math.round(vehicle.mileageKm / 1000)}k km`
                          : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="truncate text-xl font-semibold tracking-[-0.035em]">
                      {vehicle.make || 'Vehicle'} {vehicle.model || ''}
                    </h2>
                    <div className="mt-5 grid min-w-0 grid-cols-2 gap-3">
                      <VehicleFact icon={CalendarDays} label={t.year} value={vehicle.modelYear || '—'} />
                      <VehicleFact
                        icon={Gauge}
                        label={t.mileage}
                        value={vehicle.mileageKm !== null ? `${vehicle.mileageKm.toLocaleString()} km` : '—'}
                      />
                      <VehicleFact icon={Fuel} label={t.fuel} value={vehicle.fuelType || '—'} />
                      <VehicleFact icon={Globe2} label={t.origin} value={formatCountry(vehicle.originCountry, locale)} />
                    </div>

                    <div className="mt-5 flex min-w-0 items-center justify-between gap-4 border-t border-[#e7ebec] pt-4">
                      <span className="flex min-w-0 items-center gap-2 text-xs text-[#71818a]">
                        <LockKeyhole className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-2">{t.locked}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold"
                      >
                        {t.view}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-[#dce4e7] bg-white px-6 py-16 text-center shadow-[0_18px_55px_rgba(32,33,36,.045)]">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e7f2f7] text-[#4f8298]">
                <Search className="h-6 w-6" />
              </span>
              <h2 className="mt-6 text-2xl font-semibold">{t.emptyTitle}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#68767c]">
                {t.emptyText}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#242424] px-6 text-sm font-medium text-white"
              >
                {t.reset}
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {selectedVehicle && (
        <div
          className="fixed inset-0 z-[150] overflow-y-auto overscroll-contain bg-[#152028]/75 px-3 py-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vehicle-access-title"
          onClick={() => setSelectedVehicle(null)}
        >
          <div className="flex min-h-full items-start justify-center py-[max(0.5rem,env(safe-area-inset-top))] sm:items-center">
            <div
              className="relative my-auto w-full max-w-[820px] overflow-hidden rounded-[22px] bg-white shadow-[0_35px_110px_rgba(0,0,0,.32)] sm:rounded-[26px]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#e2e7e9] bg-white/95 px-4 backdrop-blur md:absolute md:inset-x-0 md:border-0 md:bg-transparent md:backdrop-blur-none">
                <span className="text-xs font-semibold text-[#60747e] md:sr-only">
                  {selectedVehicle.make} {selectedVehicle.model}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedVehicle(null)}
                  className="ml-auto grid h-11 w-11 place-items-center rounded-full border border-[#d7e1e5] bg-white text-[#202124] shadow-sm transition active:scale-95"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-[.86fr_1.14fr]">
                <div className="relative grid min-h-[250px] place-items-center overflow-hidden bg-[linear-gradient(145deg,#dce5e8,#c8d5da)] p-7 text-center sm:min-h-[300px] sm:p-8">
                  <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_25%_20%,white_0,transparent_34%)]" />
                  <div className="relative">
                    <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/60 text-[#62757f] shadow sm:h-20 sm:w-20">
                      <CarFront className="h-8 w-8 sm:h-10 sm:w-10" />
                    </span>
                    <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#bfd4dd] bg-white/88 px-4 py-2 text-xs font-semibold text-[#3f6577] shadow-md backdrop-blur-md sm:mt-5">
                      <LockKeyhole className="h-4 w-4" />
                      {t.imageLocked}
                    </span>
                    <p className="mt-3 text-sm text-[#526873] sm:mt-4">{t.noPublicImage}</p>
                    <p className="mt-5 text-2xl font-semibold text-[#202124] sm:mt-7">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </p>
                  </div>
                </div>

                <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-9">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f3f8] px-3 py-1.5 text-xs font-semibold text-[#426d82]">
                    <LockKeyhole className="h-4 w-4" />
                    {t.signupEyebrow}
                  </span>
                  <h2 id="vehicle-access-title" className="mt-5 text-3xl font-semibold tracking-[-0.045em]">
                    {t.modalTitle}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#65747b]">{t.modalText}</p>

                  <ul className="mt-6 grid gap-3 text-sm text-[#52616b]">
                    {t.accessItems.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#B4D9EF] text-[#202124]">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={
                      locale === 'sv'
                        ? '/bli-bilhandlare'
                        : locale === 'de'
                          ? '/haendlerzugang'
                          : '/dealer-apply'
                    }
                    className="mt-7 flex min-h-13 items-center justify-between rounded-full bg-[#242424] px-6 text-sm font-semibold text-white"
                  >
                    {t.signup}
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <div className="mt-7 border-t border-[#e2e7e9] pt-6">
                    <p className="font-semibold">{t.existing}</p>
                    <p className="mt-2 text-sm leading-6 text-[#718087]">{t.loginText}</p>
                    <Link href="/login" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                      {t.login}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string
  value: string
  options: string[] | Array<[string, string]>
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <label className="min-w-0">
      <span className="mb-2 block truncate text-xs font-semibold text-[#52616b]">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-12 w-full appearance-none rounded-[14px] border border-[#d8dfe2] bg-[#f8faf9] px-4 pr-10 text-sm outline-none transition focus:border-[#8dbdd8] focus:ring-4 focus:ring-[#B4D9EF]/30 disabled:opacity-50"
        >
          <option value="">{label}</option>
          {options.map((option) => {
            const [optionValue, optionLabel] = Array.isArray(option)
              ? option
              : [option, option]
            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            )
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#738087]" />
      </span>
    </label>
  )
}

function VehicleFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[13px] bg-[#f6f7f4] p-3">
      <span className="flex min-w-0 items-start gap-2 text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-[#849098]">
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 break-words">{label}</span>
      </span>
      <strong className="mt-2 block min-w-0 truncate text-sm font-medium">
        {value}
      </strong>
    </div>
  )
}
