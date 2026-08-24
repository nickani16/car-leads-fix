'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Camera, MapPin, Scale, ShieldCheck } from 'lucide-react'
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
  showMoreEquipment: string
  vatIncluded: string
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
  const metadata = listingRowMetadata(listing, locale)
  const photoLabel = `${images.length.toLocaleString(numberLocale(locale))} ${copy.uploadedPhotos}`
  const sellerLabel = listing.sellerIsTrader ? copy.businessSeller : copy.privateSeller
  const contactLabel = contactListingLabel(locale)

  return (
    <article
      data-marketplace-listing-row
      className="group relative grid min-h-[260px] grid-cols-[minmax(320px,37%)_minmax(0,1fr)] overflow-hidden rounded-[7px] border border-[#d6dde8] bg-white shadow-[0_1px_3px_rgba(16,24,40,.04)] transition-[border-color,box-shadow,transform] duration-200 [contain-intrinsic-size:260px] [content-visibility:auto] hover:-translate-y-px hover:border-[#8eb8ff] hover:shadow-[0_8px_22px_rgba(16,24,40,.075)] motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="relative min-h-[260px] min-w-0 overflow-hidden border-r border-[#e2e7ef] bg-[#f4f6f8]">
        <div className="absolute inset-0 overflow-hidden bg-white">
          <ListingCardImageCarousel
            images={images}
            title={listing.title}
            href={href}
            onNavigate={onBeforeNavigate}
            sizes="(min-width: 1536px) 440px, 360px"
            previousLabel={copy.previousPhoto}
            nextLabel={copy.nextPhoto}
            showControlsOnDesktop
            showDotsOnMobile={false}
            enableTouchSwipe={false}
            placeholder={(
              <div className="grid h-full min-h-[140px] place-items-center bg-[#f7faff] text-[#0866ff]">
                <div className="text-center">
                  {renderCategoryIcon(listing.category, 'mx-auto h-10 w-10')}
                  <p className="mt-1.5 text-[11px] font-semibold text-[#667085]">
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
              className="pointer-events-none absolute bottom-2.5 left-2.5 z-20 inline-flex h-6 items-center gap-1.5 rounded-[5px] bg-[#101828]/82 px-2 text-[11px] font-semibold text-white backdrop-blur-sm"
            >
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
              {images.length.toLocaleString(numberLocale(locale))}
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative flex min-w-0 flex-col px-5 py-4 2xl:px-6">
        <SavedListingButton
          listingId={listing.id}
          label={copy.saveListing}
          savedLabel={copy.saved}
          removeLabel={copy.removeSavedListing}
          className="absolute right-4 top-4 !h-10 !w-10 !rounded-[6px] border border-[#d0d5dd] bg-white !shadow-none"
          iconClassName="h-[20px] w-[20px]"
        />
        <div className="min-w-0 pr-12">
          <Link
            href={href}
            prefetch
            onClick={onBeforeNavigate}
            className="block rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] focus-visible:ring-offset-2"
          >
            <h2 className="line-clamp-1 text-[20px] font-semibold leading-7 text-[#101828] transition-colors group-hover:text-[#0757da] 2xl:text-[22px]">
              {listing.title}
            </h2>
          </Link>
          <p className="mt-0.5 text-[19px] font-semibold leading-7 text-[#101828]">
            {listing.priceLabel}
            <span className="ml-2 text-[11px] font-normal text-[#667085]">{copy.vatIncluded}</span>
          </p>
        </div>

        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className={`inline-flex w-max max-w-full rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4 ring-1 ${offerBadge.className}`}>
            {offerBadge.label}
          </span>
          {listing.sellerTrust === 'verified' ? (
            <span className="inline-flex h-5 items-center gap-1 rounded-full bg-[#eef5ff] px-2 text-[10px] font-semibold text-[#0866ff] ring-1 ring-[#c7dbff]">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              {copy.verified}
            </span>
          ) : null}
          {insuranceLabel ? (
            <span className="min-w-0 truncate text-[10px] font-medium text-[#667085]">{insuranceLabel}</span>
          ) : null}
        </div>

        {metadata.length ? (
          <dl className="mt-3 flex min-w-0 flex-wrap items-center gap-y-1.5">
            {metadata.map((item) => (
              <div key={item.key} className="inline-flex min-w-0 items-center border-r border-[#b9c1cd] px-2.5 first:pl-0 last:border-r-0">
                <dt className="sr-only">{item.label}</dt>
                <dd className="max-w-[180px] truncate text-[13px] font-medium text-[#344054]" title={`${item.label}: ${item.value}`}>
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {equipmentChips.length ? (
          <div className="relative mt-2 min-w-0 overflow-hidden pr-16">
            <div className="flex min-w-max gap-1.5 whitespace-nowrap">
              {equipmentChips.map((item) => (
                <span key={item} className="max-w-[180px] shrink-0 truncate rounded-full bg-[#eef5ff] px-2 py-0.5 text-[10px] font-medium text-[#0757da]">
                  {item}
                </span>
              ))}
            </div>
            {equipmentChips.length > 3 ? (
              <Link
                href={href}
                prefetch
                onClick={onBeforeNavigate}
                className="absolute inset-y-0 right-0 z-10 inline-flex items-center bg-white/90 pl-3 text-[10px] font-semibold text-[#0757da] backdrop-blur-[3px] [box-shadow:-12px_0_16px_rgba(255,255,255,.94)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff]"
              >
                {copy.showMoreEquipment}
              </Link>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex min-w-0 items-end justify-between gap-4 border-t border-[#dfe4eb] pt-3">
          <div className="flex min-w-0 items-center gap-3">
            {listing.sellerIsTrader && listing.sellerLogoUrl ? (
              <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[5px] border border-[#dfe4eb] bg-white">
                <Image src={listing.sellerLogoUrl} alt="" fill sizes="48px" className="object-contain p-1" />
              </span>
            ) : null}
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-[#101828]">{listing.sellerName || sellerLabel}</p>
              <span className="mt-1 inline-flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-[#667085]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#0866ff]" aria-hidden="true" />
              <span className="truncate">{location}</span>
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              aria-pressed={compareActive}
              onClick={onCompare}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-[7px] border px-3 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] focus-visible:ring-offset-2 ${
                compareActive
                  ? 'border-[#0866ff] bg-[#eef5ff] text-[#0866ff]'
                  : 'border-[#d0d5dd] bg-white text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]'
              }`}
            >
              <Scale className="h-3 w-3" aria-hidden="true" />
              {copy.compare}
            </button>
            <Link
              href={href}
              prefetch
              onClick={onBeforeNavigate}
              className="inline-flex h-10 min-w-[126px] items-center justify-center rounded-[7px] bg-[#0866ff] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#0757da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] focus-visible:ring-offset-2"
            >
              {contactLabel}
            </Link>
            <Link
              href={href}
              prefetch
              onClick={onBeforeNavigate}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[7px] border border-[#344054] bg-white px-4 text-[12px] font-semibold text-[#101828] transition-colors hover:border-[#0866ff] hover:text-[#0866ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866ff] focus-visible:ring-offset-2"
            >
              {copy.viewListing}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
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

  return candidates.filter((item): item is NonNullable<typeof item> => Boolean(item?.value)).slice(0, 5)
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

function contactListingLabel(locale: PublicLocale) {
  const labels: Record<PublicLocale, string> = {
    sv: 'Kontakta',
    en: 'Contact',
    de: 'Kontaktieren',
    at: 'Kontaktieren',
    be: 'Contacteer',
    nl: 'Contact opnemen',
    fr: 'Contacter',
    es: 'Contactar',
    it: 'Contatta',
    pl: 'Kontakt',
    fi: 'Ota yhteyttä',
    da: 'Kontakt',
  }
  return labels[locale]
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
    showMoreEquipment: 'View more',
    vatIncluded: 'incl. VAT',
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
    showMoreEquipment: 'Visa fler',
    vatIncluded: 'inkl. moms',
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
    showMoreEquipment: 'Mehr anzeigen',
    vatIncluded: 'inkl. MwSt.',
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
    showMoreEquipment: 'Mehr anzeigen',
    vatIncluded: 'inkl. MwSt.',
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
    showMoreEquipment: 'Meer tonen',
    vatIncluded: 'incl. btw',
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
    showMoreEquipment: 'Voir plus',
    vatIncluded: 'TVA incluse',
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
    showMoreEquipment: 'Ver más',
    vatIncluded: 'IVA incluido',
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
    showMoreEquipment: 'Mostra altro',
    vatIncluded: 'IVA inclusa',
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
    showMoreEquipment: 'Pokaż więcej',
    vatIncluded: 'z VAT',
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
    showMoreEquipment: 'Meer tonen',
    vatIncluded: 'incl. btw',
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
    showMoreEquipment: 'Näytä lisää',
    vatIncluded: 'sis. ALV',
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
    showMoreEquipment: 'Vis mere',
    vatIncluded: 'inkl. moms',
  },
}
