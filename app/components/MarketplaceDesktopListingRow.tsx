'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Camera, MapPin, Scale, ShieldCheck, Star } from 'lucide-react'
import {
  AutorellAgricultureIcon,
  AutorellBikeIcon,
  AutorellCaravanIcon,
  AutorellCarIcon,
  AutorellConstructionIcon,
  AutorellMotorhomeIcon,
  AutorellMotorbikeIcon,
  AutorellTruckIcon,
  AutorellVanIcon,
} from './AutorellCategoryIcons'
import CountryFlag from './CountryFlag'
import ListingCardImageCarousel from './ListingCardImageCarousel'
import SavedListingButton from './SavedListingButton'
import type { VehicleSearchListing } from './VehicleSearchExperience'
import { getEuCountryName } from '@/lib/eu-countries'
import { formatMileageAsMil, translateListingVehicleValue } from '@/lib/listing-display'
import { buildListingPath } from '@/lib/listing-url'
import type { PublicLocale } from '@/lib/public-i18n'

type OfferBadge = {
  label: string
  className: string
}

type DesktopListCopy = {
  uploadedPhotos: string
  previousPhoto: string
  nextPhoto: string
  noPhotoAvailable: string
  viewListing: string
  compare: string
  saveListing: string
  saved: string
  removeSavedListing: string
  verified: string
  businessSeller: string
  privateSeller: string
  modelYear: string
  operatingHours: string
  mileage: string
  fuel: string
  gearbox: string
  bodyType: string
  condition: string
  colour: string
  conditionNew: string
  conditionUsed: string
  conditionDefective: string
  conditionParts: string
}

export default function MarketplaceDesktopListingRow({
  listing,
  locale,
  offerBadge,
  insuranceLabel,
  equipmentChips,
  compareActive,
  onCompare,
  onBeforeNavigate,
}: {
  listing: VehicleSearchListing
  locale: PublicLocale
  offerBadge: OfferBadge
  insuranceLabel: string | null
  equipmentChips: string[]
  compareActive: boolean
  onCompare: () => void
  onBeforeNavigate?: () => void
}) {
  const copy = desktopListCopy[locale]
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
    ? listing.sellerName || copy.businessSeller
    : copy.privateSeller
  const metadata = listingRowMetadata(listing, locale)
  const photoLabel = `${images.length.toLocaleString(numberLocale(locale))} ${copy.uploadedPhotos}`

  return (
    <article
      data-marketplace-listing-row
      className="group relative grid min-h-[226px] grid-cols-[minmax(270px,306px)_minmax(0,1fr)] overflow-hidden rounded-[8px] border border-[#d8e0eb] bg-white shadow-[0_2px_7px_rgba(16,24,40,.035)] transition-[border-color,box-shadow,transform] duration-200 [contain-intrinsic-size:226px] [content-visibility:auto] hover:-translate-y-px hover:border-[#9fc3ff] hover:shadow-[0_10px_26px_rgba(16,24,40,.08)] motion-reduce:transform-none motion-reduce:transition-none 2xl:grid-cols-[330px_minmax(0,1fr)]"
    >
      <div className="relative min-h-[226px] overflow-hidden border-r border-[#e8edf4] bg-white">
        <ListingCardImageCarousel
          images={images}
          title={listing.title}
          href={href}
          onNavigate={onBeforeNavigate}
          sizes="(min-width: 1536px) 330px, 306px"
          previousLabel={copy.previousPhoto}
          nextLabel={copy.nextPhoto}
          showControlsOnDesktop
          showDotsOnDesktop
          showDotsOnMobile={false}
          enableTouchSwipe={false}
          placeholder={(
            <div className="grid h-full min-h-[226px] place-items-center bg-[#f7faff] text-[#0866ff]">
              <div className="text-center">
                {renderCategoryIcon(listing.category, 'mx-auto h-12 w-12')}
                <p className="mt-2 text-xs font-semibold text-[#667085]">
                  {copy.noPhotoAvailable}
                </p>
              </div>
            </div>
          )}
        />
        {images.length ? (
          <span
            aria-label={photoLabel}
            title={photoLabel}
            className="pointer-events-none absolute bottom-3 left-3 z-20 inline-flex h-7 items-center gap-1.5 rounded-[6px] bg-[#101828]/82 px-2.5 text-[12px] font-semibold text-white backdrop-blur-sm"
          >
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            {images.length.toLocaleString(numberLocale(locale))}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col px-5 py-4 2xl:px-6">
        <div className="min-w-0 pr-12">
          <Link
            href={href}
            prefetch={false}
            onClick={onBeforeNavigate}
            className="block rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] focus-visible:ring-offset-2"
          >
            <h2 className="line-clamp-1 text-[18px] font-semibold leading-6 text-[#101828] transition-colors group-hover:text-[#0757da] 2xl:text-[19px]">
              {listing.title}
            </h2>
          </Link>
        </div>

        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <p className="shrink-0 text-[24px] font-semibold leading-7 text-[#101828]">{listing.priceLabel}</p>
          <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold ring-1 ${offerBadge.className}`}>
            {offerBadge.label}
          </span>
          {listing.sellerTrust === 'verified' ? (
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-[#eef5ff] px-2.5 text-[11px] font-semibold text-[#0866ff] ring-1 ring-[#c7dbff]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.verified}
            </span>
          ) : null}
          {insuranceLabel ? (
            <span className="min-w-0 truncate text-[11px] font-medium text-[#667085]">{insuranceLabel}</span>
          ) : null}
        </div>

        {metadata.length ? (
          <dl className="mt-3 flex min-w-0 flex-wrap gap-1.5">
            {metadata.map((item) => (
              <div key={item.key} className="inline-flex min-w-0 items-center gap-1.5 rounded-[6px] border border-[#e4e9f1] bg-[#f8fafc] px-2.5 py-1.5">
                <dt className="sr-only">{item.label}</dt>
                <dd className="max-w-[170px] truncate text-[12px] font-semibold text-[#344054]" title={`${item.label}: ${item.value}`}>
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {listing.description ? (
          <p className="mt-3 line-clamp-2 text-[12px] font-normal leading-[18px] text-[#667085]">
            {listing.description}
          </p>
        ) : null}

        {equipmentChips.length ? (
          <div className="mt-2.5 flex min-w-0 gap-1.5 overflow-hidden">
            {equipmentChips.slice(0, 3).map((item) => (
              <span key={item} className="max-w-[180px] shrink truncate rounded-full bg-[#eef5ff] px-2.5 py-1 text-[11px] font-medium text-[#0757da]">
                {item}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex min-w-0 items-center justify-between gap-4 border-t border-[#edf1f6] pt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-[#667085]">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              {listing.sellerIsTrader && listing.sellerLogoUrl ? (
                <span className="relative h-5 w-8 shrink-0 overflow-hidden rounded-[4px] bg-white ring-1 ring-[#e4e7ec]">
                  <Image src={listing.sellerLogoUrl} alt="" fill sizes="32px" className="object-contain p-0.5" />
                </span>
              ) : null}
              <span className="max-w-[220px] truncate text-[#344054]">{sellerLabel}</span>
            </span>
            {listing.sellerRatingAverage && listing.sellerRatingCount ? (
              <span className="inline-flex items-center gap-1 text-[#475467]">
                <Star className="h-3.5 w-3.5 text-[#0866ff]" fill="currentColor" aria-hidden="true" />
                {formatRating(listing.sellerRatingAverage, locale)} ({listing.sellerRatingCount})
              </span>
            ) : null}
            {location ? (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#0866ff]" aria-hidden="true" />
                <CountryFlag code={listing.country || 'eu'} className="h-3.5 w-3.5 shrink-0 rounded-full" />
                <span className="max-w-[260px] truncate">{location}</span>
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-pressed={compareActive}
              onClick={onCompare}
              className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-[8px] border px-3 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] focus-visible:ring-offset-2 ${
                compareActive
                  ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                  : 'border-[#d0d5dd] bg-white text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]'
              }`}
            >
              <Scale className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.compare}
            </button>
            <Link
              href={href}
              prefetch={false}
              onClick={onBeforeNavigate}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[8px] bg-[#0866ff] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#0757da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] focus-visible:ring-offset-2"
            >
              {copy.viewListing}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <SavedListingButton
        listingId={listing.id}
        label={copy.saveListing}
        savedLabel={copy.saved}
        removeLabel={copy.removeSavedListing}
        className="absolute right-3 top-3 z-20 h-9 w-9 rounded-full border border-[#d0d5dd] bg-white shadow-sm"
      />
    </article>
  )
}

function listingRowMetadata(listing: VehicleSearchListing, locale: PublicLocale) {
  const copy = desktopListCopy[locale]
  const prefersHours = listing.category === 'construction' || listing.category === 'agriculture'
  const candidates = [
    listing.year
      ? { key: 'year', label: copy.modelYear, value: listing.year }
      : null,
    prefersHours && listing.operatingHours !== null
      ? {
          key: 'hours',
          label: copy.operatingHours,
          value: `${listing.operatingHours.toLocaleString(numberLocale(locale))} h`,
        }
      : listing.mileageKm !== null
        ? {
            key: 'mileage',
            label: copy.mileage,
            value: formatMileageAsMil(listing.mileageKm, locale),
          }
        : null,
    listing.fuelType
      ? { key: 'fuel', label: copy.fuel, value: translateListingVehicleValue(locale, listing.fuelType) }
      : null,
    listing.gearbox
      ? { key: 'gearbox', label: copy.gearbox, value: translateListingVehicleValue(locale, listing.gearbox) }
      : null,
    listing.bodyType
      ? { key: 'body', label: copy.bodyType, value: translateListingVehicleValue(locale, listing.bodyType) }
      : null,
    listing.condition
      ? { key: 'condition', label: copy.condition, value: listingConditionLabel(listing.condition, locale, copy) }
      : null,
    listing.color
      ? { key: 'color', label: copy.colour, value: translateListingVehicleValue(locale, listing.color) }
      : null,
  ]

  return candidates.filter((item): item is NonNullable<typeof item> => Boolean(item?.value)).slice(0, 8)
}

function listingConditionLabel(value: string, locale: PublicLocale, copy: DesktopListCopy) {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'new' || normalized === 'ny') return copy.conditionNew
  if (normalized === 'used' || normalized === 'begagnad') return copy.conditionUsed
  if (normalized === 'defective' || normalized === 'defekt' || normalized === 'damaged') {
    return copy.conditionDefective
  }
  if (normalized === 'parts vehicle' || normalized === 'reservdelsobjekt' || normalized === 'for parts') {
    return copy.conditionParts
  }
  return translateListingVehicleValue(locale, value)
}

function renderCategoryIcon(category: string, className: string) {
  if (category === 'vans') return <AutorellVanIcon className={className} />
  if (category === 'trucks') return <AutorellTruckIcon className={className} />
  if (category === 'motorcycles') return <AutorellMotorbikeIcon className={className} />
  if (category === 'motorhomes') return <AutorellMotorhomeIcon className={className} />
  if (category === 'caravans') return <AutorellCaravanIcon className={className} />
  if (category === 'agriculture') return <AutorellAgricultureIcon className={className} />
  if (category === 'construction') return <AutorellConstructionIcon className={className} />
  if (category === 'electric-bikes') return <AutorellBikeIcon className={className} />
  return <AutorellCarIcon className={className} />
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

function formatRating(value: number, locale: PublicLocale) {
  return value.toLocaleString(numberLocale(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

const desktopListCopy: Record<PublicLocale, DesktopListCopy> = {
  en: {
    uploadedPhotos: 'uploaded photos',
    previousPhoto: 'Previous photo',
    nextPhoto: 'Next photo',
    noPhotoAvailable: 'No photo available',
    viewListing: 'View listing',
    compare: 'Compare',
    saveListing: 'Save listing',
    saved: 'Saved',
    removeSavedListing: 'Remove saved listing',
    verified: 'Verified',
    businessSeller: 'Business seller',
    privateSeller: 'Private seller',
    modelYear: 'Model year',
    operatingHours: 'Operating hours',
    mileage: 'Mileage',
    fuel: 'Fuel',
    gearbox: 'Gearbox',
    bodyType: 'Body type',
    condition: 'Condition',
    colour: 'Colour',
    conditionNew: 'New',
    conditionUsed: 'Used',
    conditionDefective: 'Defective',
    conditionParts: 'For parts',
  },
  sv: {
    uploadedPhotos: 'uppladdade bilder',
    previousPhoto: 'Föregående bild',
    nextPhoto: 'Nästa bild',
    noPhotoAvailable: 'Ingen bild tillgänglig',
    viewListing: 'Visa annons',
    compare: 'Jämför',
    saveListing: 'Spara annons',
    saved: 'Sparad',
    removeSavedListing: 'Ta bort sparad annons',
    verified: 'Verifierad',
    businessSeller: 'Företagssäljare',
    privateSeller: 'Privat säljare',
    modelYear: 'Årsmodell',
    operatingHours: 'Drifttimmar',
    mileage: 'Miltal',
    fuel: 'Drivmedel',
    gearbox: 'Växellåda',
    bodyType: 'Karosstyp',
    condition: 'Skick',
    colour: 'Färg',
    conditionNew: 'Ny',
    conditionUsed: 'Begagnad',
    conditionDefective: 'Defekt',
    conditionParts: 'Reservdelsobjekt',
  },
  de: {
    uploadedPhotos: 'hochgeladene Fotos',
    previousPhoto: 'Vorheriges Foto',
    nextPhoto: 'Nächstes Foto',
    noPhotoAvailable: 'Kein Foto verfügbar',
    viewListing: 'Anzeige öffnen',
    compare: 'Vergleichen',
    saveListing: 'Anzeige speichern',
    saved: 'Gespeichert',
    removeSavedListing: 'Gespeicherte Anzeige entfernen',
    verified: 'Verifiziert',
    businessSeller: 'Gewerblicher Anbieter',
    privateSeller: 'Privatanbieter',
    modelYear: 'Modelljahr',
    operatingHours: 'Betriebsstunden',
    mileage: 'Kilometerstand',
    fuel: 'Kraftstoff',
    gearbox: 'Getriebe',
    bodyType: 'Karosserie',
    condition: 'Zustand',
    colour: 'Farbe',
    conditionNew: 'Neu',
    conditionUsed: 'Gebraucht',
    conditionDefective: 'Defekt',
    conditionParts: 'Ersatzteilfahrzeug',
  },
  at: {
    uploadedPhotos: 'hochgeladene Fotos',
    previousPhoto: 'Vorheriges Foto',
    nextPhoto: 'Nächstes Foto',
    noPhotoAvailable: 'Kein Foto verfügbar',
    viewListing: 'Anzeige öffnen',
    compare: 'Vergleichen',
    saveListing: 'Anzeige speichern',
    saved: 'Gespeichert',
    removeSavedListing: 'Gespeicherte Anzeige entfernen',
    verified: 'Verifiziert',
    businessSeller: 'Gewerblicher Anbieter',
    privateSeller: 'Privatanbieter',
    modelYear: 'Modelljahr',
    operatingHours: 'Betriebsstunden',
    mileage: 'Kilometerstand',
    fuel: 'Kraftstoff',
    gearbox: 'Getriebe',
    bodyType: 'Karosserie',
    condition: 'Zustand',
    colour: 'Farbe',
    conditionNew: 'Neu',
    conditionUsed: 'Gebraucht',
    conditionDefective: 'Defekt',
    conditionParts: 'Ersatzteilfahrzeug',
  },
  be: {
    uploadedPhotos: "geüploade foto's",
    previousPhoto: 'Vorige foto',
    nextPhoto: 'Volgende foto',
    noPhotoAvailable: 'Geen foto beschikbaar',
    viewListing: 'Advertentie bekijken',
    compare: 'Vergelijken',
    saveListing: 'Advertentie opslaan',
    saved: 'Opgeslagen',
    removeSavedListing: 'Opgeslagen advertentie verwijderen',
    verified: 'Geverifieerd',
    businessSeller: 'Zakelijke verkoper',
    privateSeller: 'Particuliere verkoper',
    modelYear: 'Modeljaar',
    operatingHours: 'Bedrijfsuren',
    mileage: 'Kilometerstand',
    fuel: 'Brandstof',
    gearbox: 'Versnellingsbak',
    bodyType: 'Carrosserietype',
    condition: 'Staat',
    colour: 'Kleur',
    conditionNew: 'Nieuw',
    conditionUsed: 'Gebruikt',
    conditionDefective: 'Defect',
    conditionParts: 'Voor onderdelen',
  },
  fr: {
    uploadedPhotos: 'photos téléchargées',
    previousPhoto: 'Photo précédente',
    nextPhoto: 'Photo suivante',
    noPhotoAvailable: 'Aucune photo disponible',
    viewListing: "Voir l'annonce",
    compare: 'Comparer',
    saveListing: "Enregistrer l'annonce",
    saved: 'Enregistrée',
    removeSavedListing: "Supprimer l'annonce enregistrée",
    verified: 'Vérifié',
    businessSeller: 'Vendeur professionnel',
    privateSeller: 'Vendeur particulier',
    modelYear: 'Année modèle',
    operatingHours: 'Heures de fonctionnement',
    mileage: 'Kilométrage',
    fuel: 'Carburant',
    gearbox: 'Boîte de vitesses',
    bodyType: 'Carrosserie',
    condition: 'État',
    colour: 'Couleur',
    conditionNew: 'Neuf',
    conditionUsed: 'Occasion',
    conditionDefective: 'Défectueux',
    conditionParts: 'Pour pièces',
  },
  es: {
    uploadedPhotos: 'fotos subidas',
    previousPhoto: 'Foto anterior',
    nextPhoto: 'Foto siguiente',
    noPhotoAvailable: 'Sin foto disponible',
    viewListing: 'Ver anuncio',
    compare: 'Comparar',
    saveListing: 'Guardar anuncio',
    saved: 'Guardado',
    removeSavedListing: 'Eliminar anuncio guardado',
    verified: 'Verificado',
    businessSeller: 'Vendedor profesional',
    privateSeller: 'Vendedor particular',
    modelYear: 'Año del modelo',
    operatingHours: 'Horas de funcionamiento',
    mileage: 'Kilometraje',
    fuel: 'Combustible',
    gearbox: 'Caja de cambios',
    bodyType: 'Carrocería',
    condition: 'Estado',
    colour: 'Color',
    conditionNew: 'Nuevo',
    conditionUsed: 'Usado',
    conditionDefective: 'Defectuoso',
    conditionParts: 'Para repuestos',
  },
  it: {
    uploadedPhotos: 'foto caricate',
    previousPhoto: 'Foto precedente',
    nextPhoto: 'Foto successiva',
    noPhotoAvailable: 'Nessuna foto disponibile',
    viewListing: "Vedi l'annuncio",
    compare: 'Confronta',
    saveListing: 'Salva annuncio',
    saved: 'Salvato',
    removeSavedListing: 'Rimuovi annuncio salvato',
    verified: 'Verificato',
    businessSeller: 'Venditore professionale',
    privateSeller: 'Venditore privato',
    modelYear: 'Anno modello',
    operatingHours: 'Ore di esercizio',
    mileage: 'Chilometraggio',
    fuel: 'Carburante',
    gearbox: 'Cambio',
    bodyType: 'Carrozzeria',
    condition: 'Condizioni',
    colour: 'Colore',
    conditionNew: 'Nuovo',
    conditionUsed: 'Usato',
    conditionDefective: 'Difettoso',
    conditionParts: 'Per ricambi',
  },
  pl: {
    uploadedPhotos: 'przesłane zdjęcia',
    previousPhoto: 'Poprzednie zdjęcie',
    nextPhoto: 'Następne zdjęcie',
    noPhotoAvailable: 'Brak zdjęcia',
    viewListing: 'Zobacz ogłoszenie',
    compare: 'Porównaj',
    saveListing: 'Zapisz ogłoszenie',
    saved: 'Zapisano',
    removeSavedListing: 'Usuń zapisane ogłoszenie',
    verified: 'Zweryfikowany',
    businessSeller: 'Sprzedawca firmowy',
    privateSeller: 'Sprzedawca prywatny',
    modelYear: 'Rok modelowy',
    operatingHours: 'Motogodziny',
    mileage: 'Przebieg',
    fuel: 'Paliwo',
    gearbox: 'Skrzynia biegów',
    bodyType: 'Typ nadwozia',
    condition: 'Stan',
    colour: 'Kolor',
    conditionNew: 'Nowy',
    conditionUsed: 'Używany',
    conditionDefective: 'Uszkodzony',
    conditionParts: 'Na części',
  },
  nl: {
    uploadedPhotos: "geüploade foto's",
    previousPhoto: 'Vorige foto',
    nextPhoto: 'Volgende foto',
    noPhotoAvailable: 'Geen foto beschikbaar',
    viewListing: 'Advertentie bekijken',
    compare: 'Vergelijken',
    saveListing: 'Advertentie opslaan',
    saved: 'Opgeslagen',
    removeSavedListing: 'Opgeslagen advertentie verwijderen',
    verified: 'Geverifieerd',
    businessSeller: 'Zakelijke verkoper',
    privateSeller: 'Particuliere verkoper',
    modelYear: 'Modeljaar',
    operatingHours: 'Bedrijfsuren',
    mileage: 'Kilometerstand',
    fuel: 'Brandstof',
    gearbox: 'Versnellingsbak',
    bodyType: 'Carrosserietype',
    condition: 'Staat',
    colour: 'Kleur',
    conditionNew: 'Nieuw',
    conditionUsed: 'Gebruikt',
    conditionDefective: 'Defect',
    conditionParts: 'Voor onderdelen',
  },
  fi: {
    uploadedPhotos: 'ladatut kuvat',
    previousPhoto: 'Edellinen kuva',
    nextPhoto: 'Seuraava kuva',
    noPhotoAvailable: 'Ei kuvaa saatavilla',
    viewListing: 'Näytä ilmoitus',
    compare: 'Vertaa',
    saveListing: 'Tallenna ilmoitus',
    saved: 'Tallennettu',
    removeSavedListing: 'Poista tallennettu ilmoitus',
    verified: 'Vahvistettu',
    businessSeller: 'Yritysmyyjä',
    privateSeller: 'Yksityinen myyjä',
    modelYear: 'Mallivuosi',
    operatingHours: 'Käyttötunnit',
    mileage: 'Ajokilometrit',
    fuel: 'Polttoaine',
    gearbox: 'Vaihteisto',
    bodyType: 'Korityyppi',
    condition: 'Kunto',
    colour: 'Väri',
    conditionNew: 'Uusi',
    conditionUsed: 'Käytetty',
    conditionDefective: 'Viallinen',
    conditionParts: 'Varaosiksi',
  },
  da: {
    uploadedPhotos: 'uploadede billeder',
    previousPhoto: 'Forrige billede',
    nextPhoto: 'Næste billede',
    noPhotoAvailable: 'Intet foto tilgængeligt',
    viewListing: 'Se annonce',
    compare: 'Sammenlign',
    saveListing: 'Gem annonce',
    saved: 'Gemt',
    removeSavedListing: 'Fjern gemt annonce',
    verified: 'Verificeret',
    businessSeller: 'Erhvervssælger',
    privateSeller: 'Privat sælger',
    modelYear: 'Modelår',
    operatingHours: 'Driftstimer',
    mileage: 'Kilometertal',
    fuel: 'Brændstof',
    gearbox: 'Gearkasse',
    bodyType: 'Karrosseritype',
    condition: 'Stand',
    colour: 'Farve',
    conditionNew: 'Ny',
    conditionUsed: 'Brugt',
    conditionDefective: 'Defekt',
    conditionParts: 'Til reservedele',
  },
}
