'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Camera, Clock3, MapPin, ShieldCheck } from 'lucide-react'
import { AutorellCarIcon } from './AutorellCategoryIcons'
import CountryFlag from './CountryFlag'
import SavedListingButton from './SavedListingButton'
import type { VehicleSearchListing } from './VehicleSearchExperience'
import { getEuCountryName } from '@/lib/eu-countries'
import { formatMileageAsMil, translateListingVehicleValue } from '@/lib/listing-display'
import { buildListingPath } from '@/lib/listing-url'
import { translatePublic, type PublicLocale } from '@/lib/public-i18n'

export default function MarketplaceDesktopListingRow({
  listing,
  locale,
  onBeforeNavigate,
}: {
  listing: VehicleSearchListing
  locale: PublicLocale
  onBeforeNavigate?: () => void
}) {
  const href = buildListingPath({
    id: listing.id,
    title: listing.title,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    city: listing.city,
    country_code: listing.country,
  }, locale)
  const images = listing.imageUrls.length
    ? listing.imageUrls
    : listing.imageUrl
      ? [listing.imageUrl]
      : []
  const location = [
    listing.city || listing.municipality,
    getEuCountryName(listing.country, locale),
  ].filter(Boolean).join(', ')
  const sellerLabel = listing.sellerIsTrader
    ? listing.sellerName || translatePublic(locale, 'Business seller')
    : translatePublic(locale, 'Private seller')
  const metadata = listingRowMetadata(listing, locale)
  const photoLabel = `${images.length.toLocaleString(numberLocale(locale))} ${translatePublic(
    locale,
    images.length === 1 ? 'photo' : 'photos',
  )}`

  return (
    <article className="group relative grid min-h-[220px] grid-cols-[220px_minmax(0,1fr)] overflow-hidden rounded-[8px] border border-[#dfe5ee] bg-white transition-[border-color,box-shadow,background-color] duration-200 hover:border-[#9fc3ff] hover:shadow-[0_10px_28px_rgba(16,24,40,.08)] motion-reduce:transition-none xl:grid-cols-[280px_minmax(0,1fr)_minmax(176px,220px)]">
      <Link
        href={href}
        prefetch={false}
        onClick={onBeforeNavigate}
        aria-label={`${translatePublic(locale, 'View listing')}: ${listing.title}`}
        className="absolute inset-0 z-10 rounded-[8px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0866ff] focus-visible:ring-inset"
      />

      <div className="relative min-h-[220px] overflow-hidden bg-[#eef3f8]">
        {images.length ? (
          <Image
            src={images[0]}
            alt={listing.title}
            fill
            sizes="(min-width: 1280px) 280px, 220px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="grid h-full min-h-[220px] place-items-center bg-[#eef5ff] text-[#0866ff]">
            <div className="text-center">
              <AutorellCarIcon className="mx-auto h-12 w-12" />
              <p className="mt-2 text-xs font-semibold text-[#667085]">
                {translatePublic(locale, 'No photo available')}
              </p>
            </div>
          </div>
        )}
        {images.length ? (
          <span
            aria-label={photoLabel}
            className="pointer-events-none absolute bottom-3 left-3 z-20 inline-flex h-7 items-center gap-1.5 rounded-[6px] bg-[#101828]/82 px-2.5 text-[12px] font-semibold text-white backdrop-blur-sm"
          >
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            {images.length.toLocaleString(numberLocale(locale))}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 p-5 pr-16 xl:pr-5">
        <div className="flex flex-wrap items-center gap-2">
          {listing.offerType === 'lease' ? (
            <span className="inline-flex h-6 items-center rounded-full bg-[#ecfdf3] px-2.5 text-[11px] font-semibold text-[#027a48]">
              {translatePublic(locale, 'Leasing')}
            </span>
          ) : null}
          {listing.sellerTrust === 'verified' ? (
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-[#eef5ff] px-2.5 text-[11px] font-semibold text-[#0866ff]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {translatePublic(locale, 'Verified seller')}
            </span>
          ) : null}
        </div>

        <h2 className="mt-2 line-clamp-2 text-[18px] font-semibold leading-6 text-[#101828] group-hover:text-[#0757da]">
          {listing.title}
        </h2>
        <p className="mt-2 text-[18px] font-semibold text-[#101828] xl:hidden">
          {listing.priceLabel}
        </p>

        {metadata.length ? (
          <dl className="mt-3 flex flex-wrap gap-2">
            {metadata.map((item) => (
              <div key={item.key} className="inline-flex min-h-7 items-center rounded-[6px] bg-[#f2f4f7] px-2.5 text-[12px] font-medium text-[#475467]">
                <dt className="sr-only">{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {listing.description ? (
          <p className="mt-3 line-clamp-2 text-[13px] leading-5 text-[#667085]">
            {listing.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#edf1f6] pt-3 text-[12px] font-medium text-[#667085]">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            {listing.sellerIsTrader && listing.sellerLogoUrl ? (
              <span className="relative h-6 w-9 shrink-0 overflow-hidden rounded-[4px] bg-white ring-1 ring-[#e4e7ec]">
                <Image src={listing.sellerLogoUrl} alt="" fill sizes="36px" className="object-contain p-0.5" />
              </span>
            ) : null}
            <span className="max-w-[240px] truncate text-[#344054]">{sellerLabel}</span>
          </span>
          {location ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#0866ff]" aria-hidden="true" />
              <CountryFlag code={listing.country || 'eu'} className="h-3.5 w-3.5 shrink-0 rounded-full" />
              <span className="truncate">{location}</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="hidden min-w-0 flex-col justify-between border-l border-[#edf1f6] bg-[#fbfcfe] p-5 xl:flex">
        <div className="pr-10">
          <p className="text-[20px] font-semibold leading-7 text-[#101828]">{listing.priceLabel}</p>
          {listing.offerType === 'lease' ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#667085]">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {translatePublic(locale, 'Leasing')}
            </p>
          ) : null}
        </div>
        <span className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#b8d3ff] bg-white px-4 text-[13px] font-semibold text-[#0866ff] transition-colors group-hover:border-[#0866ff] group-hover:bg-[#f4f8ff]">
          {translatePublic(locale, 'View listing')}
        </span>
      </div>

      <SavedListingButton
        listingId={listing.id}
        label={translatePublic(locale, 'Save listing')}
        savedLabel={translatePublic(locale, 'Saved')}
        removeLabel={translatePublic(locale, 'Remove saved listing')}
        className="absolute right-3 top-3 z-20 h-10 w-10 rounded-full border border-[#d0d5dd] shadow-sm"
      />
    </article>
  )
}

export function MarketplaceDesktopListSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="grid min-h-[220px] grid-cols-[220px_minmax(0,1fr)] overflow-hidden rounded-[8px] border border-[#e4e7ec] bg-white xl:grid-cols-[280px_minmax(0,1fr)_minmax(176px,220px)]">
          <div className="animate-pulse bg-[#e8eef6] motion-reduce:animate-none" />
          <div className="space-y-4 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded bg-[#e8eef6] motion-reduce:animate-none" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-[#e8eef6] motion-reduce:animate-none" />
            <div className="flex gap-2">
              <div className="h-7 w-20 animate-pulse rounded bg-[#eef2f6] motion-reduce:animate-none" />
              <div className="h-7 w-24 animate-pulse rounded bg-[#eef2f6] motion-reduce:animate-none" />
              <div className="h-7 w-16 animate-pulse rounded bg-[#eef2f6] motion-reduce:animate-none" />
            </div>
            <div className="h-4 w-full animate-pulse rounded bg-[#eef2f6] motion-reduce:animate-none" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-[#eef2f6] motion-reduce:animate-none" />
          </div>
          <div className="hidden animate-pulse border-l border-[#edf1f6] bg-[#f4f6f9] motion-reduce:animate-none xl:block" />
        </div>
      ))}
    </div>
  )
}

function listingRowMetadata(listing: VehicleSearchListing, locale: PublicLocale) {
  const prefersHours = listing.category === 'construction' || listing.category === 'agriculture'
  const candidates = [
    listing.year
      ? { key: 'year', label: translatePublic(locale, 'Model year'), value: listing.year }
      : null,
    prefersHours && listing.operatingHours !== null
      ? {
          key: 'hours',
          label: translatePublic(locale, 'Operating hours'),
          value: `${listing.operatingHours.toLocaleString(numberLocale(locale))} h`,
        }
      : listing.mileageKm !== null
        ? {
            key: 'mileage',
            label: translatePublic(locale, 'Mileage'),
            value: formatMileageAsMil(listing.mileageKm, locale),
          }
        : null,
    listing.fuelType
      ? { key: 'fuel', label: translatePublic(locale, 'Fuel'), value: translateListingVehicleValue(locale, listing.fuelType) }
      : null,
    listing.gearbox
      ? { key: 'gearbox', label: translatePublic(locale, 'Gearbox'), value: translateListingVehicleValue(locale, listing.gearbox) }
      : null,
    listing.bodyType
      ? { key: 'body', label: translatePublic(locale, 'Body type'), value: translateListingVehicleValue(locale, listing.bodyType) }
      : null,
    listing.condition
      ? { key: 'condition', label: translatePublic(locale, 'Condition'), value: translateListingVehicleValue(locale, listing.condition) }
      : null,
  ]

  return candidates.filter((item): item is NonNullable<typeof item> => Boolean(item?.value)).slice(0, 5)
}

function numberLocale(locale: PublicLocale) {
  if (locale === 'sv') return 'sv-SE'
  if (locale === 'de') return 'de-DE'
  if (locale === 'at') return 'de-AT'
  if (locale === 'be') return 'nl-BE'
  if (locale === 'fr') return 'fr-FR'
  if (locale === 'es') return 'es-ES'
  if (locale === 'it') return 'it-IT'
  if (locale === 'pl') return 'pl-PL'
  if (locale === 'nl') return 'nl-NL'
  if (locale === 'da') return 'da-DK'
  if (locale === 'fi') return 'fi-FI'
  return 'en-GB'
}
