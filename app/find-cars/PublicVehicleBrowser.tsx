'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  Fuel,
  Gauge,
  Globe2,
  LockKeyhole,
  Search,
  ShieldCheck,
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
  image: string | null
}

type Locale = 'sv' | 'de' | 'en'

const copy = {
  sv: {
    search: 'Sök märke eller modell',
    allCountries: 'Alla länder',
    allFormats: 'Alla format',
    auction: 'Auktion',
    marketplace: 'Fast pris',
    vehicles: 'fordon',
    view: 'Visa fordon',
    year: 'Modellår',
    mileage: 'Mätarställning',
    fuel: 'Drivlina',
    origin: 'Ursprungsland',
    locked: 'Fullständig fordonsinformation är låst',
    modalTitle: 'Vill du köpa det här fordonet?',
    modalText:
      'Ansök som bilhandlare för att se registrering, VIN, fullständig skickrapport, alla bilder, pris och budgivning.',
    signupEyebrow: 'Få tillgång inom 24 timmar',
    signup: 'Ansök som bilhandlare',
    existing: 'Är du redan kund?',
    loginText: 'Logga in för att se hela fordonet och köpa eller lägga bud.',
    login: 'Logga in',
    emptyTitle: 'Nya fordon publiceras snart',
    emptyText:
      'Godkända fordon från Sverige och fler europeiska marknader visas här så snart de publiceras.',
    reset: 'Rensa filter',
    accessItems: [
      'VIN och registreringsnummer',
      'Skickrapport och fullständigt bildgalleri',
      'Pris, bud och köpknappar',
    ],
  },
  de: {
    search: 'Marke oder Modell suchen',
    allCountries: 'Alle Länder',
    allFormats: 'Alle Formate',
    auction: 'Auktion',
    marketplace: 'Festpreis',
    vehicles: 'Fahrzeuge',
    view: 'Fahrzeug ansehen',
    year: 'Modelljahr',
    mileage: 'Kilometerstand',
    fuel: 'Antrieb',
    origin: 'Herkunftsland',
    locked: 'Vollständige Fahrzeugdaten sind geschützt',
    modalTitle: 'Möchten Sie dieses Fahrzeug kaufen?',
    modalText:
      'Registrieren Sie sich als Händler, um Kennzeichen, VIN, Zustandsbericht, alle Bilder, Preis und Gebote zu sehen.',
    signupEyebrow: 'Zugang innerhalb von 24 Stunden',
    signup: 'Händlerzugang beantragen',
    existing: 'Sind Sie bereits Kunde?',
    loginText:
      'Melden Sie sich an, um das vollständige Fahrzeug zu sehen und zu kaufen oder zu bieten.',
    login: 'Anmelden',
    emptyTitle: 'Neue Fahrzeuge folgen in Kürze',
    emptyText:
      'Freigegebene Fahrzeuge aus Schweden und weiteren europäischen Märkten erscheinen hier nach Veröffentlichung.',
    reset: 'Filter zurücksetzen',
    accessItems: [
      'VIN und Kennzeichen',
      'Zustandsbericht und vollständige Bilder',
      'Preis, Gebote und Kaufaktionen',
    ],
  },
  en: {
    search: 'Search make or model',
    allCountries: 'All countries',
    allFormats: 'All formats',
    auction: 'Auction',
    marketplace: 'Fixed price',
    vehicles: 'vehicles',
    view: 'View vehicle',
    year: 'Model year',
    mileage: 'Mileage',
    fuel: 'Powertrain',
    origin: 'Origin',
    locked: 'Complete vehicle information is protected',
    modalTitle: 'Do you want to buy this vehicle?',
    modalText:
      'Apply as a dealer to see registration, VIN, the complete condition report, all images, price and bidding.',
    signupEyebrow: 'Get access within 24 hours',
    signup: 'Apply for dealer access',
    existing: 'Are you already a customer?',
    loginText:
      'Log in to view the complete vehicle and buy or place a bid.',
    login: 'Log in',
    emptyTitle: 'New vehicles are coming soon',
    emptyText:
      'Approved vehicles from Sweden and additional European markets will appear here when published.',
    reset: 'Reset filters',
    accessItems: [
      'VIN & registration',
      'Condition report & full gallery',
      'Price, bids & purchase actions',
    ],
  },
} as const

function formatCountry(countryCode: string, locale: Locale) {
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

export default function PublicVehicleBrowser({
  vehicles,
  locale,
}: {
  vehicles: PublicVehicle[]
  locale: Locale
}) {
  const t = copy[locale]
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [format, setFormat] = useState('')
  const [selectedVehicle, setSelectedVehicle] =
    useState<PublicVehicle | null>(null)

  const countries = useMemo(
    () =>
      Array.from(new Set(vehicles.map((vehicle) => vehicle.originCountry))).sort(),
    [vehicles]
  )

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase()
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !query ||
        [vehicle.make, vehicle.model, vehicle.fuelType, vehicle.bodyType].some(
          (value) => value?.toLowerCase().includes(query)
        )
      return (
        matchesSearch &&
        (!country || vehicle.originCountry === country) &&
        (!format || vehicle.saleFormat === format)
      )
    })
  }, [country, format, search, vehicles])

  function resetFilters() {
    setSearch('')
    setCountry('')
    setFormat('')
  }

  return (
    <>
      <section className="border-y border-[#dfe5e7] bg-white">
        <div className="mx-auto grid max-w-[1320px] gap-3 px-5 py-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1fr_230px_230px_auto] lg:px-12">
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#849098]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.search}
              className="h-12 w-full rounded-full border border-[#d8dfe2] bg-[#f9faf8] pl-11 pr-4 text-sm outline-none transition focus:border-[#8dbdd8] focus:bg-white focus:ring-4 focus:ring-[#B4D9EF]/30"
            />
          </label>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="h-12 rounded-full border border-[#d8dfe2] bg-[#f9faf8] px-4 text-sm outline-none focus:border-[#8dbdd8]"
          >
            <option value="">{t.allCountries}</option>
            {countries.map((countryCode) => (
              <option key={countryCode} value={countryCode}>
                {formatCountry(countryCode, locale)}
              </option>
            ))}
          </select>
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value)}
            className="h-12 rounded-full border border-[#d8dfe2] bg-[#f9faf8] px-4 text-sm outline-none focus:border-[#8dbdd8]"
          >
            <option value="">{t.allFormats}</option>
            <option value="auction">{t.auction}</option>
            <option value="marketplace">{t.marketplace}</option>
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="h-12 rounded-full border border-[#d8dfe2] px-5 text-sm transition hover:border-[#242424]"
          >
            {t.reset}
          </button>
        </div>
      </section>

      <section className="bg-[#f7f5f0] py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="mb-6 flex items-center justify-between">
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
                  className="group overflow-hidden rounded-[22px] border border-[#dde4e6] bg-white shadow-[0_16px_48px_rgba(32,33,36,.055)] transition hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(42,68,80,.11)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#e8edef]">
                    {vehicle.image ? (
                      <Image
                        src={vehicle.image}
                        alt={`${vehicle.make || 'Vehicle'} ${vehicle.model || ''}`}
                        fill
                        unoptimized
                        className="object-cover transition duration-500 group-hover:scale-[1.025]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[#92a0a7]">
                        <CarFront className="h-12 w-12" />
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#202124] shadow-sm backdrop-blur">
                      {vehicle.saleFormat === 'marketplace'
                        ? t.marketplace
                        : t.auction}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/65 to-transparent px-4 pb-4 pt-12 text-xs text-white">
                      <Globe2 className="h-4 w-4" />
                      {formatCountry(vehicle.originCountry, locale)}
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-xl font-semibold tracking-[-0.035em]">
                      {vehicle.make || 'Vehicle'} {vehicle.model || ''}
                    </h2>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <VehicleFact
                        icon={CalendarDays}
                        label={t.year}
                        value={vehicle.modelYear || '—'}
                      />
                      <VehicleFact
                        icon={Gauge}
                        label={t.mileage}
                        value={
                          vehicle.mileageKm
                            ? `${vehicle.mileageKm.toLocaleString()} km`
                            : '—'
                        }
                      />
                      <VehicleFact
                        icon={Fuel}
                        label={t.fuel}
                        value={vehicle.fuelType || '—'}
                      />
                      <VehicleFact
                        icon={Globe2}
                        label={t.origin}
                        value={formatCountry(vehicle.originCountry, locale)}
                      />
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[#e7ebec] pt-4">
                      <span className="inline-flex items-center gap-2 text-xs text-[#71818a]">
                        <LockKeyhole className="h-4 w-4" />
                        {t.locked}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="inline-flex items-center gap-2 text-sm font-semibold"
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
                <CarFront className="h-6 w-6" />
              </span>
              <h2 className="mt-6 text-2xl font-semibold">{t.emptyTitle}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#68767c]">
                {t.emptyText}
              </p>
              <Link
                href="/dealer-apply"
                className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#242424] px-6 text-sm font-medium text-white"
              >
                {t.signup}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {selectedVehicle && (
        <div
          className="fixed inset-0 z-[150] grid place-items-center overflow-y-auto bg-[#152028]/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vehicle-access-title"
        >
          <div className="relative w-full max-w-[820px] overflow-hidden rounded-[26px] bg-white shadow-[0_35px_110px_rgba(0,0,0,.32)]">
            <button
              type="button"
              onClick={() => setSelectedVehicle(null)}
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid md:grid-cols-[.86fr_1.14fr]">
              <div className="relative min-h-[260px] bg-[#e7edef] md:min-h-full">
                {selectedVehicle.image ? (
                  <Image
                    src={selectedVehicle.image}
                    alt={`${selectedVehicle.make || 'Vehicle'} ${selectedVehicle.model || ''}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-[#92a0a7]">
                    <CarFront className="h-14 w-14" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/65">
                    {selectedVehicle.saleFormat === 'marketplace'
                      ? t.marketplace
                      : t.auction}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-9">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f3f8] px-3 py-1.5 text-xs font-semibold text-[#426d82]">
                  <LockKeyhole className="h-4 w-4" />
                  {t.signupEyebrow}
                </span>
                <h2
                  id="vehicle-access-title"
                  className="mt-5 text-3xl font-semibold tracking-[-0.045em]"
                >
                  {t.modalTitle}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#65747b]">
                  {t.modalText}
                </p>

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
                  href="/dealer-apply"
                  className="mt-7 flex min-h-13 items-center justify-between rounded-full bg-[#242424] px-6 text-sm font-semibold text-white"
                >
                  {t.signup}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="mt-7 border-t border-[#e2e7e9] pt-6">
                  <p className="font-semibold">{t.existing}</p>
                  <p className="mt-2 text-sm leading-6 text-[#718087]">
                    {t.loginText}
                  </p>
                  <Link
                    href="/login"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                  >
                    {t.login}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
    <div className="rounded-[13px] bg-[#f6f7f4] p-3">
      <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#849098]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <strong className="mt-2 block truncate text-sm font-medium">{value}</strong>
    </div>
  )
}
