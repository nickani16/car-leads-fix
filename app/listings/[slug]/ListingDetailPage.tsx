import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { notFound, permanentRedirect } from 'next/navigation'
import {
  CalendarDays,
  ExternalLink,
  Fuel,
  Gauge,
  Info,
  Map as MapIcon,
  MapPin,
  ShieldCheck,
  Settings2,
  TrendingDown,
} from 'lucide-react'
import ListingImageGallery from '@/app/components/ListingImageGallery'
import ListingContactFormButton from '@/app/components/ListingContactFormButton'
import ListingMobileContactBar from '@/app/components/ListingMobileContactBar'
import ListingPageTopReset from '@/app/components/ListingPageTopReset'
import CountryFlag from '@/app/components/CountryFlag'
import ListingEquipmentSection from '@/app/components/ListingEquipmentSection'
import ListingBackLink from '@/app/components/ListingBackLink'
import ListingReportButton from '@/app/components/ListingReportButton'
import ListingLocationMap from '@/app/components/ListingLocationMap'
import MessageSellerButton from '@/app/components/MessageSellerButton'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import RevealPhoneButton from '@/app/components/RevealPhoneButton'
import SavedListingButton from '@/app/components/SavedListingButton'
import SellerDescriptionClamp from '@/app/components/SellerDescriptionClamp'
import SellerDescriptionTranslationButton from '@/app/components/SellerDescriptionTranslationButton'
import ListingViewTracker from '@/app/components/ListingViewTracker'
import ShareListingButton from '@/app/components/ShareListingButton'
import { displayCurrencyForMarket, formatMarketplacePriceDisplay } from '@/lib/currency-rates'
import { getEuCountryName } from '@/lib/eu-countries'
import { buildListingPath, buildListingSlug, extractListingIdFromSlug } from '@/lib/listing-url'
import {
  getMarketplaceCategory,
  marketplaceLanguage,
  type MarketplaceCategorySlug,
} from '@/lib/marketplace'
import { localizePublicHref, translatePublic, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { getRequestLocale } from '@/lib/request-locale'
import { getMarketplaceListingForPublicDetail } from '@/lib/marketplace-public-data'
import { resolveListingMapLocation } from '@/lib/listing-map-location'
import { selectedEquipmentGroups } from '@/lib/listing-equipment'
import { formatMileageAsMil, translateListingVehicleValue } from '@/lib/listing-display'
import { cleanSeoText } from '@/lib/market-seo'
import { publicSellerName } from '@/lib/public-seller'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { vehicleValueInEnglish } from '@/lib/vehicle-translation'

type ListingRouteParams = Promise<{ slug: string; market?: string }>

type ListingRow = {
  id: string
  listing_number: string | null
  reference_number: string | null
  category: MarketplaceCategorySlug
  title: string
  description: string | null
  make: string | null
  model: string | null
  variant: string | null
  model_year: number | null
  mileage_km: number | null
  operating_hours: number | null
  fuel_type: string | null
  gearbox: string | null
  body_type: string | null
  color: string | null
  condition: string | null
  known_faults: string | null
  service_history: string | null
  equipment: string | null
  equipment_keys: string[] | null
  country_code: string
  country: string | null
  city: string
  municipality: string | null
  address: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  price: number | string
  currency: string
  original_price: number | string | null
  edited_at: string | null
  last_price_change_at: string | null
  images: string[] | null
  image_variants?: Array<{
    listingUrl: string
    fullscreenUrl: string
  }>
  seller_user_id: string | null
  seller_name: string
  seller_type: 'private' | 'business'
  phone_visibility: 'public' | 'registered_only' | null
  package_id: string | null
  priority: number | null
  status: 'published' | 'sold' | string
  created_at: string
  published_at: string | null
  sold_at: string | null
  expires_at: string | null
}

type ListingTechnicalDetails = {
  registrationNumber: string | null
  vin: string | null
  chassisNumber: string | null
  technicalData: Record<string, string | number | string[] | null>
}

type SellerVerification = {
  label: string
  tone: 'verified' | 'pending' | 'unverified'
}

type SellerDetails = SellerVerification & {
  websiteUrl: string | null
  logoUrl: string | null
  address: string | null
  ratingAverage: number | null
  ratingCount: number
  memberSinceYear: number | null
}

export async function generateListingMetadata({
  params,
}: {
  params: ListingRouteParams
}): Promise<Metadata> {
  const { slug } = await params
  const listing = await fetchListingFromSlug(slug)
  if (!listing) {
    return {
      title: 'Annons hittades inte | Autorell',
      robots: { index: false, follow: false },
    }
  }

  const locale = await getRequestLocale()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const canonicalPath = buildListingPath(listing)
  const canonical = `https://www.autorell.com${canonicalPath}`
  const location = [listing.city, getEuCountryName(listing.country_code, locale)].filter(Boolean).join(', ')
  const title = `${listing.title} | ${location} | Autorell`
  const description = [
    listing.model_year,
    listing.make,
    listing.model,
    listing.mileage_km !== null ? formatMileageAsMil(listing.mileage_km, locale) : null,
    location,
  ]
    .filter(Boolean)
    .join(' | ')
  const seoTitle = cleanSeoText(title, 65)
  const seoDescription = cleanSeoText(description, 150)
  const image = listing.images?.[0] || undefined

  return {
    title: { absolute: seoTitle },
    description: seoDescription,
    alternates: {
      canonical,
    },
    robots: { index: listing.status === 'published', follow: true },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: 'Autorell',
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: seoTitle,
      description: seoDescription,
      images: image ? [image] : undefined,
    },
    other: {
      'autorell-market': marketCode || 'EU',
    },
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: ListingRouteParams
}) {
  const { slug } = await params
  const listing = await fetchListingFromSlug(slug)
  if (!listing) notFound()

  const locale = await getRequestLocale()
  const requestHeaders = await headers()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const canonicalPath = buildListingPath(listing, locale)
  const requestPathname = requestHeaders.get('x-autorell-pathname') || ''
  if (
    slug !== buildListingSlug(listing) ||
    requestPathname.includes('/listings/') ||
    (requestPathname && normalizePathname(requestPathname) !== normalizePathname(canonicalPath))
  ) {
    permanentRedirect(canonicalPath)
  }
  const isSold = listing.status === 'sold'

  const category = getMarketplaceCategory(listing.category)
  const language = marketplaceLanguage(locale)
  const categoryLabel =
    locale === 'sv' || locale === 'de' || locale === 'at' || locale === 'en'
      ? category.labels[language]
      : translatePublic(locale, category.labels.en)
  const displayCurrency = displayCurrencyForMarket(marketCode)
  const price = await formatMarketplacePriceDisplay({
    amount: Number(listing.price),
    currency: listing.currency,
    locale,
    targetCurrency: displayCurrency,
  })
  const currentPrice = Number(listing.price)
  const originalPrice = listing.original_price ? Number(listing.original_price) : null
  const hasPriceDrop =
    originalPrice !== null &&
    Number.isFinite(originalPrice) &&
    Number.isFinite(currentPrice) &&
    originalPrice - currentPrice >= 5000
  const priceDropAmount = hasPriceDrop && originalPrice !== null ? originalPrice - currentPrice : 0
  const originalPriceDisplay = hasPriceDrop
    ? await formatMarketplacePriceDisplay({
        amount: originalPrice ?? currentPrice,
        currency: listing.currency,
        locale,
        targetCurrency: displayCurrency,
      })
    : null
  const priceDropPercent = hasPriceDrop
    ? Math.max(1, Math.round((priceDropAmount / (originalPrice ?? currentPrice)) * 100))
    : null
  const countryName =
    listing.country && listing.country.length > 2
      ? listing.country
      : getEuCountryName(listing.country || listing.country_code, locale)
  const location = [listing.city, listing.municipality, countryName].filter(Boolean).join(', ')
  const sellerDetails = await getSellerDetails(listing.id, listing.seller_type, locale)
  const sellerVerification: SellerVerification = {
    label: sellerDetails.label,
    tone: sellerDetails.tone,
  }
  const sellerLabel =
    listing.seller_type === 'business'
      ? publicSellerName({ seller_type: listing.seller_type, sellerName: listing.seller_name })
      : publicSellerName({ seller_type: listing.seller_type, sellerName: listing.seller_name }, localizedLabel(locale, 'Privat säljare', 'Private seller', 'Privatverkäufer'))
  const sellerTypeLabel =
    listing.seller_type === 'business'
      ? localizedLabel(locale, 'Företag', 'Company', 'Unternehmen')
      : localizedLabel(locale, 'Privat annons', 'Private listing', 'Private Anzeige')
  const sellerDisplayLabel = sellerLabel
  const publishedDate = listing.published_at || listing.created_at
  const publicUrl = `https://www.autorell.com${canonicalPath}`
  const daysLeft = getDaysLeft(listing.expires_at)
  const isListingOwner = user
    ? await isUserListingOwner(listing.id, user.id)
    : false
  const equipmentKeys = Array.isArray(listing.equipment_keys)
    ? listing.equipment_keys.map(String)
    : []
  const equipmentGroups = selectedEquipmentGroups(equipmentKeys, locale)
  const fallbackEquipment = equipmentKeys.length ? [] : splitCsv(listing.equipment).map((item) => translateSpecValue(locale, item) || item)
  const technicalDetails = await getListingTechnicalDetails(listing.id)
  const specs = buildSpecs(listing, locale, categoryLabel, countryName, technicalDetails)
  const technicalData = technicalDetails?.technicalData || {}
  const headlineSubtitle = [
    listing.variant,
    translateSpecValue(locale, listing.body_type),
    formatTechnicalValue(technicalData.powerHp, 'HK'),
    translateSpecValue(locale, listing.gearbox),
  ]
    .filter(Boolean)
    .join(' | ')
  const headlineFacts = [
    {
      label: localizedLabel(locale, 'Modellår', 'Model year', 'Baujahr'),
      value: listing.model_year ? String(listing.model_year) : '',
      icon: CalendarDays,
    },
    {
      label: localizedLabel(locale, 'Miltal', 'Mileage', 'Kilometerstand'),
      value: formatMileageAsMil(listing.mileage_km, locale),
      icon: Gauge,
    },
    {
      label: localizedLabel(locale, 'Växellåda', 'Gearbox', 'Getriebe'),
      value: translateListingVehicleValue(locale, listing.gearbox),
      icon: Settings2,
    },
    {
      label: localizedLabel(locale, 'Drivmedel', 'Fuel', 'Kraftstoff'),
      value: translateListingVehicleValue(locale, listing.fuel_type),
      icon: Fuel,
    },
    {
      label: localizedLabel(locale, 'Effekt', 'Power', 'Leistung'),
      value: formatTechnicalValue(technicalData.powerHp, 'HK'),
      icon: Gauge,
    },
    {
      label: localizedLabel(locale, 'Drivhjul', 'Driven wheels', 'Antriebsräder'),
      value: translateListingVehicleValue(locale, formatTechnicalValue(technicalData.drivetrain, '')),
      icon: Settings2,
    },
    {
      label: localizedLabel(locale, 'Land', 'Country', 'Land'),
      value: countryName || listing.country_code,
      icon: MapPin,
    },
    {
      label: localizedLabel(locale, 'Tid kvar', 'Time left', 'Restzeit'),
      value: formatDaysLeft(daysLeft, locale),
      icon: CalendarDays,
    },
  ].filter((fact) => Boolean(fact.value))
  const copy = getListingDetailCopy(locale)
  const listingIdentity =
    listing.listing_number || listing.reference_number || listing.id.slice(0, 8).toUpperCase()
  const listingJsonLd = buildListingJsonLd({
    listing,
    price: Number(listing.price),
    url: publicUrl,
    location,
    sellerLabel,
    includeOffer: !isSold,
    breadcrumbs: [
      { label: copy.home, href: `https://www.autorell.com${localizePublicHref(locale, '/')}` },
      { label: categoryLabel, href: `https://www.autorell.com${localizePublicHref(locale, `/marketplace/${listing.category}`)}` },
      { label: listing.title, href: publicUrl },
    ],
  })
  const mapCoordinates = await resolveListingMapLocation({
    id: listing.id,
    address: listing.address,
    postalCode: listing.postal_code,
    latitude: listing.latitude,
    longitude: listing.longitude,
    city: listing.city,
    country: listing.country,
    countryCode: listing.country_code,
  })
  const galleryImages = listing.image_variants?.length
    ? listing.image_variants.map((image) => image.listingUrl)
    : listing.images || []
  const fullscreenImages = listing.image_variants?.length
    ? listing.image_variants.map((image) => image.fullscreenUrl || image.listingUrl)
    : galleryImages

  return (
    <main className="min-h-screen bg-white text-[#101828]">
      <ListingPageTopReset />
      {listing.status === 'published' ? <ListingViewTracker listingId={listing.id} /> : null}
      <PublicHeader
        locale={locale}
        marketCode={marketCode}
        marketplaceChannel={{ label: categoryLabel, slug: category.slug }}
      />
      <div className="mx-0 box-border w-full max-w-full px-4 py-3 min-[430px]:max-w-[430px] min-[430px]:px-5 sm:mx-auto sm:max-w-[1010px] sm:px-8 xl:max-w-[1060px] lg:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ListingBackLink
            fallbackHref={localizePublicHref(locale, `/marketplace/${listing.category}`)}
            label={copy.backToListings}
          />
          <div className="flex min-w-0 items-center gap-4">
            <ShareListingButton
              title={listing.title}
              url={publicUrl}
              label={copy.shareListing}
              copiedLabel={copy.shareCopied}
              variant="plain"
              className="max-w-[56%] overflow-hidden whitespace-nowrap text-[#101828] hover:text-[#101828] sm:max-w-none"
              labelClassName="truncate"
              iconClassName="h-4 w-4 text-[#101828]"
            />
            <div className="hidden lg:inline-flex">
              <SavedListingButton
                listingId={listing.id}
                label={copy.favoriteListing}
                savedLabel={copy.favoriteSaved}
                removeLabel={copy.favoriteRemove}
                variant="plain"
                className="text-[#101828] hover:text-[#101828]"
                iconClassName="h-4 w-4 text-[#101828]"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-4 sm:mt-4 sm:space-y-6">
          <div className="grid w-[calc(100vw-2rem)] gap-4 sm:w-auto sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-3 sm:space-y-6">
            <ListingImageGallery
              images={galleryImages}
              fullscreenImages={fullscreenImages}
              title={listing.title}
              listingId={listing.id}
              locale={locale}
            />

            <div className="flex w-full items-center gap-3 sm:hidden">
              <a
                href="#listing-location-map"
                className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[8px] border border-[#d0d5dd] bg-white px-2.5 text-[13px] font-semibold text-[#101828] shadow-sm transition hover:border-[#0866ff] hover:text-[#0866ff]"
              >
                <MapIcon className="h-4 w-4" />
                <span className="truncate whitespace-nowrap">{copy.mapLabel}</span>
              </a>
              <SavedListingButton
                listingId={listing.id}
                label={copy.favoriteListing}
                savedLabel={copy.favoriteSaved}
                removeLabel={copy.favoriteRemove}
                variant="button"
                className="!min-h-10 min-w-0 flex-1 !gap-1.5 rounded-[8px] !px-2.5 !text-[13px] shadow-sm"
                labelClassName="truncate whitespace-nowrap text-[13px]"
                iconClassName="h-4 w-4"
              />
            </div>

            <div className="hidden">
              <a
                href="#listing-location-map"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#101828] shadow-sm transition hover:border-[#0866ff] hover:text-[#0866ff]"
              >
                <MapIcon className="h-4 w-4" />
                {localizedLabel(locale, 'Karta', 'Map', 'Karte')}
              </a>
              <div className="flex items-center gap-3">
                <ShareListingButton
                  title={listing.title}
                  url={publicUrl}
                  label={copy.shareListing}
                  copiedLabel={copy.shareCopied}
                  variant="button"
                  className="rounded-[8px] shadow-sm"
                />
                <SavedListingButton
                  listingId={listing.id}
                  label={copy.favoriteListing}
                  savedLabel={copy.favoriteSaved}
                  removeLabel={copy.favoriteRemove}
                  variant="button"
                />
              </div>
            </div>

              <div className="min-w-0 space-y-4 sm:space-y-6">
                <section className="rounded-[12px] border border-[#dfe6f2] bg-white p-4 shadow-sm sm:rounded-[18px] sm:p-7">
              {isSold ? (
                <div className="mb-5 rounded-[12px] border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#9a3412]">
                  {localizedLabel(locale, 'Den här annonsen är såld', 'This listing is sold', 'Diese Anzeige ist verkauft')}
                </div>
              ) : null}
              <div className="flex flex-col items-stretch gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="max-w-4xl text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl sm:tracking-[-0.04em]">
                    {listing.title}
                  </h1>
                  {headlineSubtitle ? (
                    <p className="mt-2 max-w-3xl text-sm font-medium leading-5 text-[#475467] sm:mt-3 sm:text-lg sm:leading-7">
                      {headlineSubtitle}
                    </p>
                  ) : null}
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-[#667085] sm:mt-4 sm:text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#0866ff] sm:h-4 sm:w-4" />
                      {location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-[#0866ff] sm:h-4 sm:w-4" />
                      {formatDate(publishedDate, locale)}
                    </span>
                  </p>
                </div>
              </div>
              {headlineFacts.length ? (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 xl:grid-cols-4">
                  {headlineFacts.slice(0, 8).map((fact) => {
                    const Icon = fact.icon
                    return (
                      <div key={fact.label} className="flex min-w-0 items-center gap-2 rounded-[10px] border border-[#edf1f6] bg-[#f8fbff] px-2.5 py-2 sm:gap-3 sm:rounded-[14px] sm:px-4 sm:py-3">
                        <Icon className="h-4 w-4 shrink-0 text-[#202124] sm:h-5 sm:w-5" />
                        <div className="min-w-0">
                          <p className="break-words text-[11px] font-medium leading-3.5 text-[#667085] sm:text-xs sm:leading-4">{fact.label}</p>
                          <p title={String(fact.value)} className="mt-0.5 break-words text-[13px] font-semibold leading-4 text-[#101828] sm:text-sm sm:leading-5">{fact.value}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null}
                </section>

                <section className="rounded-[12px] border border-[#dfe6f2] bg-white p-4 shadow-sm sm:rounded-[18px] sm:p-7">
              <h2 className="text-xl font-semibold tracking-[-0.025em] sm:text-2xl sm:tracking-[-0.03em]">
                {localizedLabel(locale, 'Specifikationer', 'Specifications', 'Spezifikationen')}
              </h2>
              <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-2.5 xl:grid-cols-3">
                {specs.map((spec) => (
                  <div key={spec.label} className="rounded-[9px] border border-[#e4eaf3] bg-[#f8fbff] px-3 py-2.5 sm:rounded-[10px] sm:px-3.5 sm:py-3">
                    <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#667085] sm:text-[10px] sm:tracking-[0.13em]">
                      {spec.label}
                    </p>
                    <p className="mt-1 break-words text-[13px] font-semibold leading-4 text-[#101828] sm:mt-1.5 sm:text-[14px] sm:leading-5">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
                </section>

                <ListingEquipmentSection
              title={localizedLabel(locale, 'Utrustning', 'Equipment', 'Ausstattung')}
              groups={equipmentGroups}
              fallbackItems={fallbackEquipment}
              showMoreLabel={localizedLabel(locale, 'Läs mer', 'Show more', 'Mehr anzeigen')}
              showLessLabel={localizedLabel(locale, 'Visa mindre', 'Show less', 'Weniger anzeigen')}
                />

                {listing.description ? (
                  <section className="rounded-[12px] border border-[#dfe6f2] bg-white p-4 shadow-sm sm:rounded-[18px] sm:p-7">
                <h2 className="text-xl font-semibold tracking-[-0.025em] sm:text-2xl sm:tracking-[-0.03em]">
                  {copy.sellerDescription}
                </h2>
                <p className="mt-1.5 text-xs font-medium text-[#667085] sm:mt-2 sm:text-sm">{copy.originalLanguage}</p>
                <SellerDescriptionClamp
                  text={listing.description}
                  readMoreLabel={localizedLabel(locale, 'Läs mer', 'Read more', 'Mehr anzeigen')}
                  showLessLabel={localizedLabel(locale, 'Visa mindre', 'Show less', 'Weniger anzeigen')}
                />
                <SellerDescriptionTranslationButton text={listing.description} locale={locale} />
                  </section>
                ) : null}

                <div id="listing-location-map" className="scroll-mt-24">
              <ListingLocationMap
                title={localizedLabel(locale, 'Plats', 'Location', 'Standort')}
                listingId={listing.id}
                address={listing.address}
                postalCode={listing.postal_code}
                city={listing.city}
                country={countryName || listing.country_code}
                latitude={mapCoordinates?.latitude}
                longitude={mapCoordinates?.longitude}
                approximate={mapCoordinates?.approximate}
                mapSource={mapCoordinates?.source}
                mapQuery={mapCoordinates?.query}
              />
                </div>
            </div>
            </div>

              <section className="scroll-mt-24 w-[calc(100vw-2rem)] sm:w-auto lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start">
            <div id="listing-contact-card" className="overflow-hidden rounded-[14px] border border-[#dfe6f2] bg-white shadow-[0_12px_32px_rgba(16,24,40,.09)] sm:rounded-[18px] sm:shadow-[0_18px_48px_rgba(16,24,40,.10)] lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-color:#c5cfdd_transparent] lg:[scrollbar-width:thin]">
              <div className="border-b border-[#edf1f6] p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#667085] sm:text-xs">
                  {copy.priceLabel}
                </p>
                {originalPriceDisplay ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold text-[#98a2b3] line-through">
                      {originalPriceDisplay.original}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf3] px-2.5 py-1 text-xs font-semibold text-[#027a48]">
                      <TrendingDown className="h-3.5 w-3.5" />
                      {copy.priceReduced} {priceDropPercent}%
                    </span>
                  </div>
                ) : null}
                <div className="mt-1 text-3xl font-semibold tracking-[-0.035em] sm:text-[34px]">
                  {price.original}
                </div>
                {price.approximate ? (
                  <p className="mt-1.5 text-sm font-medium text-[#667085]">{price.approximate}</p>
                ) : null}
                <p className="mt-2 rounded-[10px] bg-[#f3f7ff] px-3 py-2 text-[11px] font-medium leading-4 text-[#475467]">
                  {copy.vatInfo}
                </p>
              </div>

              <div className="grid gap-2.5 p-4 sm:p-5">
                {isListingOwner ? (
                  <Link
                    href={localizePublicHref(locale, `/account/listings/${listing.id}/edit`)}
                    className="inline-flex min-h-11 items-center justify-center rounded-[12px] border border-[#c9d7ec] bg-white px-3 text-sm font-semibold text-[#0866ff] transition hover:bg-[#f5f9ff] sm:min-h-12 sm:rounded-[14px] sm:px-4"
                  >
                    {localizedLabel(locale, 'Redigera annons', 'Edit listing', 'Anzeige bearbeiten')}
                  </Link>
                ) : null}
                {isSold ? (
                  <Link
                    href={localizePublicHref(locale, `/marketplace/${listing.category}`)}
                    className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#d0d5dd] bg-white px-3 text-sm font-semibold text-[#101828] sm:h-12 sm:rounded-[12px] sm:px-4"
                  >
                    {localizedLabel(locale, 'Visa liknande annonser', 'View similar listings', 'Ähnliche Anzeigen ansehen')}
                  </Link>
                ) : (
                  <>
                    <RevealPhoneButton listingId={listing.id} locale={locale} />
                    <MessageSellerButton listingId={listing.id} enabled locale={locale} variant="button" />
                    <ListingContactFormButton
                      listingId={listing.id}
                      listingTitle={listing.title}
                      locale={locale}
                    />
                  </>
                )}
                <div className="flex justify-start pt-0.5">
                  <ShareListingButton
                    title={listing.title}
                    url={publicUrl}
                    label={copy.shareListing}
                    copiedLabel={copy.shareCopied}
                    variant="plain"
                  />
                </div>
              </div>

              <div className="border-t border-[#edf1f6] p-4 sm:p-5">
                {listing.seller_type === 'private' ? (
                  <PrivateSellerProfileCard
                    name={sellerDisplayLabel}
                    locale={locale}
                    verification={sellerVerification}
                    ratingAverage={sellerDetails.ratingAverage}
                    ratingCount={sellerDetails.ratingCount}
                    memberSinceYear={sellerDetails.memberSinceYear || yearFromDate(listing.created_at)}
                  />
                ) : (
                  <div className="grid gap-4">
                    {sellerDetails.logoUrl ? (
                      <div className="inline-flex w-fit max-w-full rounded-[14px] border border-[#dfe6f2] bg-white px-4 py-3 shadow-sm">
                        <Image
                          src={sellerDetails.logoUrl}
                          alt={sellerLabel}
                          width={190}
                          height={64}
                          className="max-h-14 w-auto max-w-[210px] object-contain"
                        />
                      </div>
                    ) : (
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#edf4ff] text-[#0866ff]">
                        <ShieldCheck className="h-6 w-6" />
                      </span>
                    )}
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.02em]">
                        {sellerDisplayLabel}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium text-[#667085]">
                        <span>{sellerTypeLabel}</span>
                        <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#dfe6f2] bg-[#f8faff] px-2.5 py-1 text-xs font-semibold text-[#344054]">
                          <CountryFlag code={listing.country_code || 'eu'} className="h-4 w-5 shrink-0 rounded-[4px]" />
                          {countryName || listing.country_code}
                        </span>
                      </div>
                      <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${sellerBadgeClass(sellerVerification.tone)}`}>
                        {sellerVerification.label}
                      </span>
                      {sellerDetails.ratingAverage && sellerDetails.ratingCount ? (
                        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#475467]">
                          <span className="text-[#0866ff]">★</span>
                          {sellerDetails.ratingAverage.toLocaleString(locale === 'sv' ? 'sv-SE' : locale, { maximumFractionDigits: 1 })} ({sellerDetails.ratingCount})
                        </p>
                      ) : (
                        <p className="mt-3 text-sm font-semibold text-[#475467]">{copy.noReviewsYet}</p>
                      )}
                      <div className="mt-4 grid gap-3 text-sm font-medium text-[#475467]">
                        {sellerDetails.address ? (
                          <p className="inline-flex min-w-0 items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0866ff]" />
                            <span>{sellerDetails.address}</span>
                          </p>
                        ) : null}
                        {sellerDetails.websiteUrl ? (
                          <a
                            href={sellerDetails.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-[#c9d7ec] bg-white px-4 text-sm font-semibold text-[#0866ff] transition hover:bg-[#f5f9ff]"
                          >
                            {localizedLabel(locale, 'Till handlarens webbsida', 'Dealer website', 'Zur Händlerwebsite')}
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#667085]">
                        {localizedLabel(
                          locale,
                          'Kontakt sker via Autorell så att köpare och säljare får en tydlig historik.',
                          'Contact happens through Autorell so buyers and sellers have a clear history.',
                          'Kontakt erfolgt über Autorell, damit Käufer und Verkäufer eine klare Historie haben.',
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
              </section>
          </div>
        </div>

        <section className="mt-6 w-[calc(100vw-2rem)] rounded-[16px] border border-[#dfe6f2] bg-white p-4 shadow-sm sm:w-auto sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#0866ff]">
                {copy.noticeEyebrow}
              </p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
                {copy.noticeTitle}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-5 text-[#667085]">
                {copy.noticeIntro}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <ListingReportButton listingId={listing.id} listingTitle={listing.title} locale={locale} />
            </div>
          </div>

          <dl className="mt-4 grid gap-2.5 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <InfoLine label={copy.adId} value={listingIdentity} />
            <InfoLine label={copy.updated} value={formatDateTime(listing.edited_at || publishedDate, locale)} />
            <InfoLine label={copy.reference} value={listing.reference_number || listingIdentity} />
            <InfoLine label={copy.country} value={countryName || listing.country_code} />
          </dl>

          {listing.edited_at ? (
            <div className="mt-3 rounded-[12px] border border-[#d8e6ff] bg-[#f3f7ff] px-4 py-3 text-sm font-medium text-[#475467]">
              {localizedLabel(locale, 'Annonsen har redigerats av säljaren.', 'The listing has been edited by the seller.', 'Die Anzeige wurde vom Verkäufer bearbeitet.')}
            </div>
          ) : null}

          <div className="mt-4 rounded-[12px] border border-[#edf1f6] bg-[#f8fafc] px-4 py-3 text-sm leading-5 text-[#475467]">
            {copy.euDisclaimer}
          </div>
        </section>
      </div>
      {!isSold ? (
        <ListingMobileContactBar
          listingId={listing.id}
          locale={locale}
          contactTargetId="listing-contact-card"
        />
      ) : null}
      <PublicFooter locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(listingJsonLd) }}
      />
    </main>
  )
}

async function fetchListingFromSlug(slug: string) {
  const id = extractListingIdFromSlug(slug)
  if (!id) return null

  const data = await getMarketplaceListingForPublicDetail(id)

  return (data || null) as ListingRow | null
}

async function getSellerDetails(
  listingId: string,
  sellerType: 'private' | 'business',
  locale: PublicLocale,
): Promise<SellerDetails> {
  const copy = getListingDetailCopy(locale)
  const empty: SellerDetails = {
    label: copy.unverifiedEmail,
    tone: 'unverified',
    websiteUrl: null,
    logoUrl: null,
    address: null,
    ratingAverage: null,
    ratingCount: 0,
    memberSinceYear: null,
  }
  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('seller_user_id')
    .eq('id', listingId)
    .maybeSingle()

  if (!listing?.seller_user_id) return empty

  const [{ data: profile }, { data: reviews }] = await Promise.all([
    admin
      .from('marketplace_profiles')
      .select('website_url,logo_url,identity_status,business_verification_status,address_line_1,postal_code,city,region,created_at')
      .eq('user_id', listing.seller_user_id)
      .maybeSingle(),
    admin
      .from('marketplace_reviews')
      .select('rating')
      .eq('reviewee_id', listing.seller_user_id)
      .eq('status', 'visible'),
  ])

  const visibleRatings = (reviews || [])
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating))
  const ratingCount = visibleRatings.length
  const ratingAverage = ratingCount
    ? Math.round((visibleRatings.reduce((sum, rating) => sum + rating, 0) / ratingCount) * 10) / 10
    : null

  const addressLine = [
    textOrNull(profile?.address_line_1),
    [textOrNull(profile?.postal_code), textOrNull(profile?.city)].filter(Boolean).join(' '),
    textOrNull(profile?.region),
  ].filter(Boolean).join(', ')

  const base = {
    websiteUrl: sellerType === 'business' ? textOrNull(profile?.website_url) : null,
    logoUrl: sellerType === 'business' ? textOrNull(profile?.logo_url) : null,
    address: sellerType === 'business' ? textOrNull(addressLine) : null,
    ratingAverage,
    ratingCount,
    memberSinceYear: yearFromDate(profile?.created_at),
  }

  if (sellerType === 'business') {
    const status = profile?.business_verification_status
    if (status === 'verified' || status === 'vat_validated') {
      return {
        ...base,
        label: copy.verifiedCompany,
        tone: 'verified',
      }
    }
    if (status === 'pending_review' || status === 'pending' || status === 'needs_review') {
      return {
        ...base,
        label: copy.companyVerificationPending,
        tone: 'pending',
      }
    }
    return {
      ...base,
      label: copy.unverifiedCompany,
      tone: 'unverified',
    }
  }

  const verified = profile?.identity_status === 'verified' || profile?.identity_status === 'basic_checked'
  return verified
    ? {
        ...base,
        label: copy.verifiedEmail,
        tone: 'verified',
      }
    : {
        ...base,
        label: copy.unverifiedEmail,
        tone: 'unverified',
      }
}

function sellerBadgeClass(tone: SellerVerification['tone']) {
  if (tone === 'verified') return 'bg-emerald-50 text-emerald-700'
  if (tone === 'pending') return 'bg-amber-50 text-amber-800'
  return 'bg-[#f2f4f7] text-[#475467]'
}

function PrivateSellerProfileCard({
  name,
  locale,
  verification,
  ratingAverage,
  ratingCount,
  memberSinceYear,
}: {
  name: string
  locale: PublicLocale
  verification: SellerVerification
  ratingAverage: number | null
  ratingCount: number
  memberSinceYear: number | null
}) {
  const copy = getListingDetailCopy(locale)
  const reviewLabel =
    ratingCount === 1
      ? localizedLabel(locale, '1 omdöme', '1 review', '1 Bewertung')
    : ratingCount > 1
      ? localizedLabel(locale, `${ratingCount} omdömen`, `${ratingCount} reviews`, `${ratingCount} Bewertungen`)
        : copy.noReviewsYet
  const memberSince = memberSinceYear
    ? memberSinceLabel(locale, memberSinceYear)
    : copy.privateSellerFallback

  return (
    <div className="flex items-start gap-3 border-y border-[#dfe6f2] py-4">
      <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-full border border-[#c7d3e2] bg-[#edf3f9]">
        <div className="absolute left-1/2 top-[12px] h-[28px] w-[28px] -translate-x-1/2 rounded-full border-[3px] border-[#b9c6d4] bg-[#f8fbff]" />
        <div className="absolute left-1/2 top-[44px] h-[42px] w-[54px] -translate-x-1/2 rounded-t-full border-[3px] border-[#b9c6d4] bg-[#f8fbff]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="flex min-w-0 items-center gap-1.5 text-base font-semibold leading-5 text-[#0866ff]">
          <span className="truncate">{name}</span>
          <Info className="h-3.5 w-3.5 shrink-0 text-[#344054]" />
          </p>
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${sellerBadgeClass(verification.tone)}`}>
            <ShieldCheck className="h-3 w-3" />
            {verification.label}
          </span>
        </div>
        <div className="mt-2 grid gap-1.5 text-[13px] font-medium leading-4 text-[#344054]">
          <p>{memberSince}</p>
          <p className="font-semibold text-[#101828]">{reviewLabel}</p>
        </div>
        {ratingAverage && ratingCount ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-[7px] bg-[#eef5ff] px-2 py-1 text-sm font-semibold leading-none text-[#0866ff]">
              {ratingAverage.toLocaleString(locale === 'sv' ? 'sv-SE' : locale, { maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs font-semibold text-[#475467]">{reviewLabel}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function memberSinceLabel(locale: PublicLocale, year: number) {
  if (locale === 'sv') return `På Autorell sedan ${year}`
  if (locale === 'de' || locale === 'at') return `Bei Autorell seit ${year}`
  if (locale === 'es') return `En Autorell desde ${year}`
  if (locale === 'fr') return `Sur Autorell depuis ${year}`
  if (locale === 'it') return `Su Autorell dal ${year}`
  if (locale === 'nl' || locale === 'be') return `Op Autorell sinds ${year}`
  if (locale === 'pl') return `Na Autorell od ${year}`
  if (locale === 'da') return `På Autorell siden ${year}`
  if (locale === 'fi') return `Autorellissa vuodesta ${year}`
  return `On Autorell since ${year}`
}

async function getListingTechnicalDetails(listingId: string): Promise<ListingTechnicalDetails | null> {
  const { data } = await createAdminClient()
    .from('marketplace_listing_identifiers')
    .select('registration_number,vin,chassis_number,total_weight_kg,axle_configuration,machine_type,metadata')
    .eq('listing_id', listingId)
    .maybeSingle()

  if (!data) return null

  const metadata = isRecord(data.metadata) ? data.metadata : {}
  const technicalData = isRecord(metadata.technical_data)
    ? (metadata.technical_data as Record<string, string | number | string[] | null>)
    : {}

  return {
    registrationNumber: textOrNull(data.registration_number),
    vin: textOrNull(data.vin),
    chassisNumber: textOrNull(data.chassis_number),
    technicalData: {
      ...technicalData,
      totalWeightKg: technicalData.totalWeightKg ?? data.total_weight_kg ?? null,
      axleConfiguration: technicalData.axleConfiguration ?? data.axle_configuration ?? null,
      machineType: technicalData.machineType ?? data.machine_type ?? null,
    },
  }
}

async function isUserListingOwner(listingId: string, userId: string) {
  const { data } = await createAdminClient()
    .from('marketplace_listings')
    .select('id')
    .eq('id', listingId)
    .eq('seller_user_id', userId)
    .maybeSingle()

  return Boolean(data)
}

function localizedLabel(
  locale: PublicLocale,
  sv: string,
  en: string,
  de: string,
) {
  if (locale === 'sv') return sv
  if (locale === 'de' || locale === 'at') return de
  return translatePublic(locale, en)
}

function buildSpecs(
  listing: ListingRow,
  locale: PublicLocale,
  categoryLabel: string,
  countryName: string,
  technicalDetails: ListingTechnicalDetails | null,
) {
  const technical = technicalDetails?.technicalData || {}
  const specs: Array<{ label: string; value: string | number | null | undefined }> = [
    { label: localizedLabel(locale, 'Kategori', 'Category', 'Kategorie'), value: categoryLabel },
    { label: localizedLabel(locale, 'Märke', 'Make', 'Marke'), value: listing.make },
    { label: localizedLabel(locale, 'Modell', 'Model', 'Modell'), value: [listing.model, listing.variant].filter(Boolean).join(' ') },
    { label: localizedLabel(locale, 'Årsmodell', 'Model year', 'Modelljahr'), value: listing.model_year },
    { label: localizedLabel(locale, 'Bilens plats', 'Vehicle location', 'Fahrzeugstandort'), value: countryName },
    { label: localizedLabel(locale, 'Kommun', 'Municipality', 'Gemeinde'), value: listing.municipality },
    {
      label: localizedLabel(locale, 'Miltal', 'Mileage', 'Kilometerstand'),
      value: formatMileageAsMil(listing.mileage_km, locale),
    },
    {
      label: localizedLabel(locale, 'Drifttimmar', 'Operating hours', 'Betriebsstunden'),
      value: listing.operating_hours !== null ? `${Number(listing.operating_hours).toLocaleString('sv-SE')} h` : null,
    },
    { label: localizedLabel(locale, 'Bränsle / drivlina', 'Fuel / drivetrain', 'Kraftstoff / Antrieb'), value: translateSpecValue(locale, listing.fuel_type) },
    { label: localizedLabel(locale, 'Effekt', 'Power', 'Leistung'), value: formatTechnicalValue(technical.powerHp, 'HK') },
    { label: localizedLabel(locale, 'Motorvolym', 'Engine size', 'Hubraum'), value: formatTechnicalValue(technical.engineLiters, 'L') },
    { label: localizedLabel(locale, 'Växellåda', 'Gearbox', 'Getriebe'), value: translateSpecValue(locale, listing.gearbox) },
    { label: localizedLabel(locale, 'Max trailervikt', 'Maximum trailer weight', 'Maximale Anhängelast'), value: formatTechnicalValue(technical.maxTrailerWeightKg, 'kg') },
    { label: localizedLabel(locale, 'Totalvikt', 'Total weight', 'Gesamtgewicht'), value: formatTechnicalValue(technical.totalWeightKg, 'kg') },
    { label: localizedLabel(locale, 'Lastvikt', 'Payload', 'Nutzlast'), value: formatTechnicalValue(technical.payloadKg, 'kg') },
    { label: localizedLabel(locale, 'Lastvolym', 'Cargo volume', 'Ladevolumen'), value: formatTechnicalValue(technical.cargoVolumeM3, 'm³') },
    { label: localizedLabel(locale, 'Lastutrymme längd', 'Load length', 'Laderaumlänge'), value: formatTechnicalValue(technical.loadLengthCm, 'cm') },
    { label: localizedLabel(locale, 'Tågvikt', 'Gross combination weight', 'Zuggesamtgewicht'), value: formatTechnicalValue(technical.grossCombinationWeightKg, 'kg') },
    { label: localizedLabel(locale, 'Axelkonfiguration', 'Axle configuration', 'Achskonfiguration'), value: translateSpecValue(locale, formatTechnicalValue(technical.axleConfiguration, '')) },
    { label: localizedLabel(locale, 'Antal axlar', 'Axle count', 'Achsenanzahl'), value: translateSpecValue(locale, formatTechnicalValue(technical.axleCount, '')) },
    { label: localizedLabel(locale, 'Drivhjul', 'Driven wheels', 'Antriebsräder'), value: translateSpecValue(locale, formatTechnicalValue(technical.drivetrain, '')) },
    { label: localizedLabel(locale, 'Säten', 'Seats', 'Sitze'), value: formatTechnicalValue(technical.seats, '') },
    { label: localizedLabel(locale, 'Sovplatser', 'Sleeping places', 'Schlafplätze'), value: formatTechnicalValue(technical.sleepingPlaces, '') },
    { label: localizedLabel(locale, 'Längd', 'Length', 'Länge'), value: formatTechnicalValue(technical.lengthCm, 'cm') },
    { label: localizedLabel(locale, 'Motoreffekt', 'Motor power', 'Motorleistung'), value: formatTechnicalValue(technical.motorPowerW, 'W') },
    { label: localizedLabel(locale, 'Batterikapacitet', 'Battery capacity', 'Batteriekapazität'), value: formatTechnicalValue(technical.batteryCapacityWh, 'Wh') },
    { label: localizedLabel(locale, 'Batterispänning', 'Battery voltage', 'Batteriespannung'), value: formatTechnicalValue(technical.batteryVoltageV, 'V') },
    { label: localizedLabel(locale, 'Räckvidd', 'Range', 'Reichweite'), value: formatTechnicalValue(technical.rangeKm, 'km') },
    { label: localizedLabel(locale, 'Maxhastighet', 'Maximum speed', 'Höchstgeschwindigkeit'), value: formatTechnicalValue(technical.maxSpeedKmh, 'km/h') },
    { label: localizedLabel(locale, 'Maskintyp', 'Machine type', 'Maschinentyp'), value: translateSpecValue(locale, formatTechnicalValue(technical.machineType, '')) },
    { label: localizedLabel(locale, 'Maskinvikt', 'Operating weight', 'Betriebsgewicht'), value: formatTechnicalValue(technical.operatingWeightKg, 'kg') },
    { label: localizedLabel(locale, 'Grävdjup', 'Digging depth', 'Grabtiefe'), value: formatTechnicalValue(technical.diggingDepthCm, 'cm') },
    { label: localizedLabel(locale, 'Kaross / typ', 'Body type', 'Karosserie / Typ'), value: translateSpecValue(locale, listing.body_type) },
    { label: localizedLabel(locale, 'Färg', 'Colour', 'Farbe'), value: translateSpecValue(locale, listing.color) },
    { label: localizedLabel(locale, 'Färgbeskrivning', 'Colour description', 'Farbbeschreibung'), value: translateSpecValue(locale, formatTechnicalValue(technical.colorDescription, '')) },
    { label: localizedLabel(locale, 'Avgiftsklass', 'Tax class', 'Gebührenklasse'), value: translateSpecValue(locale, formatTechnicalValue(technical.feeClass, '')) },
    { label: localizedLabel(locale, 'Registreringsnummer', 'Registration number', 'Kennzeichen'), value: technicalDetails?.registrationNumber },
    { label: localizedLabel(locale, 'VIN-nummer', 'VIN number', 'FIN / VIN'), value: technicalDetails?.vin },
    { label: localizedLabel(locale, 'Registreringsdatum', 'Registration date', 'Erstzulassung'), value: formatTechnicalValue(technical.firstRegistrationDate, '') },
    { label: localizedLabel(locale, 'Försäljningsform', 'Sale type', 'Verkaufsform'), value: saleFormLabel(listing, locale) },
    { label: localizedLabel(locale, 'Skick', 'Condition', 'Zustand'), value: translateSpecValue(locale, listing.condition) },
    { label: localizedLabel(locale, 'Servicehistorik', 'Service history', 'Servicehistorie'), value: translateSpecValue(locale, listing.service_history) },
    { label: localizedLabel(locale, 'Skador / fel', 'Damage / faults', 'Schäden / Mängel'), value: translateSpecValue(locale, listing.known_faults) },
  ]

  return specs.filter(
    (item): item is { label: string; value: string | number } =>
      item.value !== null && item.value !== undefined && item.value !== '',
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#edf1f6] bg-white px-4 py-3">
      <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#667085]">
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-[15px] font-semibold text-[#101828]">{value}</dd>
    </div>
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function textOrNull(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function formatTechnicalValue(value: unknown, suffix: string) {
  if (value === null || value === undefined || value === '') return null
  const text = typeof value === 'number' ? value.toLocaleString('sv-SE') : String(value)
  return suffix ? `${text} ${suffix}` : text
}

function translateSpecValue(locale: PublicLocale, value?: string | null) {
  if (!value) return value
  if (locale === 'sv') return value
  const englishValue = vehicleValueInEnglish(value)
  return translatePublic(locale, englishValue || value)
}

function saleFormLabel(listing: ListingRow, locale: PublicLocale) {
  const condition = String(listing.condition || '').toLowerCase()
  const isNew = condition.includes('ny') || condition.includes('new')

  if (locale === 'sv') return isNew ? 'Nytt fordon till salu' : 'Begagnat fordon till salu'
  if (locale === 'de' || locale === 'at') return isNew ? 'Neues Fahrzeug zum Verkauf' : 'Gebrauchtes Fahrzeug zum Verkauf'
  if (locale === 'es') return isNew ? 'Vehículo nuevo en venta' : 'Vehículo usado en venta'
  if (locale === 'fr') return isNew ? 'Véhicule neuf à vendre' : "Véhicule d'occasion à vendre"
  if (locale === 'it') return isNew ? 'Veicolo nuovo in vendita' : 'Veicolo usato in vendita'
  if (locale === 'nl' || locale === 'be') return isNew ? 'Nieuw voertuig te koop' : 'Tweedehands voertuig te koop'
  if (locale === 'pl') return isNew ? 'Nowy pojazd na sprzedaÅ¼' : 'UÅ¼ywany pojazd na sprzedaÅ¼'
  if (locale === 'da') return isNew ? 'Nyt køretøj til salg' : 'Brugt køretøj til salg'
  if (locale === 'fi') return isNew ? 'Uusi ajoneuvo myytävänä' : 'Käytetty ajoneuvo myytävänä'
  return isNew ? 'New vehicle for sale' : 'Used vehicle for sale'
}

function splitCsv(value?: string | null) {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatDate(value: string, locale: PublicLocale) {
  return new Intl.DateTimeFormat(detailNumberLocale(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function formatDateTime(value: string, locale: PublicLocale) {
  return new Intl.DateTimeFormat(detailNumberLocale(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function detailNumberLocale(locale: PublicLocale) {
  if (locale === 'sv') return 'sv-SE'
  if (locale === 'de') return 'de-DE'
  if (locale === 'at') return 'de-AT'
  if (locale === 'be') return 'nl-BE'
  if (locale === 'da') return 'da-DK'
  if (locale === 'fi') return 'fi-FI'
  if (locale === 'fr') return 'fr-FR'
  if (locale === 'it') return 'it-IT'
  if (locale === 'nl') return 'nl-NL'
  if (locale === 'pl') return 'pl-PL'
  if (locale === 'es') return 'es-ES'
  return 'en-GB'
}

function getDaysLeft(value?: string | null) {
  if (!value) return null
  const expiresAt = new Date(value).getTime()
  if (!Number.isFinite(expiresAt)) return null
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 86_400_000))
}

function yearFromDate(value?: string | null) {
  if (!value) return null
  const year = new Date(value).getFullYear()
  return Number.isFinite(year) ? year : null
}

function formatDaysLeft(days: number | null, locale: PublicLocale) {
  if (days === null) return ''
  if (days === 0) {
    return localizedLabel(locale, 'Försvinner idag', 'Expires today', 'Läuft heute ab')
  }
  if (locale === 'sv') return days === 1 ? '1 dag kvar' : `${days} dagar kvar`
  if (locale === 'de' || locale === 'at') return days === 1 ? '1 Tag übrig' : `${days} Tage übrig`
  const label = days === 1 ? 'day left' : 'days left'
  return translatePublic(locale, `${days} ${label}`)
}

const listingDetailCopy = {
  sv: {
    sellerDescription: 'Säljarens information',
    originalLanguage: 'Säljarens fritext visas på det språk som säljaren själv har skrivit.',
    noticeEyebrow: 'Annonsuppgifter',
    noticeTitle: 'ID och granskning',
    noticeIntro:
      'Spara annons-ID om du kontaktar säljaren eller vill att Autorell granskar annonsen.',
    adId: 'Annons-ID',
    updated: 'Uppdaterad',
    reference: 'Referens',
    country: 'Land',
    priceLabel: 'Pris',
    priceReduced: 'Sänkt',
    vatInfo: 'Moms visas enligt säljarens uppgifter och landets regler.',
    mapLabel: 'Karta',
    shareListing: 'Dela annons',
    shareAction: 'Dela',
    shareCopied: 'Länk kopierad',
    favoriteListing: 'Lägg till i favoriter',
    favoriteSaved: 'Sparad i favoriter',
    favoriteRemove: 'Ta bort från favoriter',
    verifiedEmail: 'Verifierad e-post',
    unverifiedEmail: 'Ej verifierad e-post',
    verifiedCompany: 'Verifierat företag',
    unverifiedCompany: 'Ej verifierat företag',
    companyVerificationPending: 'Företagsverifiering pågår',
    noReviewsYet: 'Inga omdömen ännu',
    privateSellerFallback: 'Privat säljare på Autorell',
    breadcrumbLabel: 'Brödsmulor',
    backToListings: 'Tillbaka',
    home: 'Hem',
    euDisclaimer:
      'Annonsen kan vara ofullständig eller inaktuell. Säljaren ansvarar för att lämna korrekta och fullständiga uppgifter enligt tillämplig upplysningsplikt i EU och nationell lag. Autorell kontrollerar inte varje uppgift och ansvarar inte för informationen i annonsen.',
  },
  en: {
    sellerDescription: 'Seller information',
    originalLanguage: 'The seller text is shown in the language provided by the seller.',
    noticeEyebrow: 'Listing details',
    noticeTitle: 'ID and reporting',
    noticeIntro:
      'Keep the listing ID when contacting the seller or reporting a listing for Autorell review.',
    adId: 'Listing ID',
    updated: 'Updated',
    reference: 'Reference',
    country: 'Country',
    priceLabel: 'Price',
    priceReduced: 'Reduced',
    vatInfo: "VAT is shown according to the seller's information and local rules.",
    mapLabel: 'Map',
    shareListing: 'Share listing',
    shareAction: 'Share',
    shareCopied: 'Link copied',
    favoriteListing: 'Add to favourites',
    favoriteSaved: 'Saved to favourites',
    favoriteRemove: 'Remove from favourites',
    verifiedEmail: 'Verified email',
    unverifiedEmail: 'Unverified email',
    verifiedCompany: 'Verified company',
    unverifiedCompany: 'Unverified company',
    companyVerificationPending: 'Company verification in progress',
    noReviewsYet: 'No reviews yet',
    privateSellerFallback: 'Private seller on Autorell',
    breadcrumbLabel: 'Breadcrumb',
    backToListings: 'Back',
    home: 'Home',
    euDisclaimer:
      'The listing may be incomplete or out of date. The seller is responsible for providing correct and complete information under applicable EU and national disclosure obligations. Autorell does not verify every statement and is not responsible for the accuracy of the information in the listing.',
  },
  de: {
    sellerDescription: 'Information des Verkäufers',
    originalLanguage: 'Freitext des Verkäufers wird in der Originalsprache angezeigt.',
    noticeEyebrow: 'Anzeigenangaben',
    noticeTitle: 'ID und Meldung',
    noticeIntro:
      'Speichern Sie die Anzeigen-ID, wenn Sie mit dem Verkäufer sprechen oder eine Anzeige zur Prüfung melden.',
    adId: 'Anzeigen-ID',
    updated: 'Aktualisiert',
    reference: 'Referenz',
    country: 'Land',
    priceLabel: 'Preis',
    priceReduced: 'Reduziert',
    vatInfo: 'MwSt. wird gemäß Verkäuferangaben und lokalen Regeln angezeigt.',
    mapLabel: 'Karte',
    shareListing: 'Anzeige teilen',
    shareAction: 'Teilen',
    shareCopied: 'Link kopiert',
    favoriteListing: 'Zu Favoriten hinzufügen',
    favoriteSaved: 'In Favoriten gespeichert',
    favoriteRemove: 'Aus Favoriten entfernen',
    verifiedEmail: 'Verifizierte E-Mail',
    unverifiedEmail: 'Nicht verifizierte E-Mail',
    verifiedCompany: 'Verifiziertes Unternehmen',
    unverifiedCompany: 'Nicht verifiziertes Unternehmen',
    companyVerificationPending: 'Unternehmen wird geprüft',
    noReviewsYet: 'Noch keine Bewertungen',
    privateSellerFallback: 'Privater Verkäufer bei Autorell',
    breadcrumbLabel: 'Breadcrumb',
    backToListings: 'Zurück',
    home: 'Startseite',
    euDisclaimer:
      'Die Anzeige kann unvollständig oder veraltet sein. Der Verkäufer ist dafür verantwortlich, korrekte und vollständige Informationen gemäß der geltenden EU- und nationalen Aufklärungspflichten bereitzustellen. Autorell prüft nicht alle Angaben und übernimmt keine Verantwortung für die Richtigkeit der Informationen in der Anzeige.',
  },
} as const

function getListingDetailCopy(locale: PublicLocale) {
  if (locale === 'sv' || locale === 'de' || locale === 'at' || locale === 'en') {
    return listingDetailCopy[locale === 'at' ? 'de' : locale]
  }

  return {
    ...translatePublicObject(locale, listingDetailCopy.en),
    mapLabel: localizedMapLabels[locale],
  }
}

const localizedMapLabels: Record<PublicLocale, string> = {
  sv: 'Karta',
  de: 'Karte',
  en: 'Map',
  at: 'Karte',
  be: 'Kaart',
  fr: 'Carte',
  es: 'Mapa',
  it: 'Mappa',
  pl: 'Mapa',
  nl: 'Kaart',
  fi: 'Kartta',
  da: 'Kort',
}

function buildListingJsonLd({
  listing,
  price,
  url,
  location,
  sellerLabel,
  breadcrumbs,
  includeOffer,
}: {
  listing: ListingRow
  price: number
  url: string
  location: string
  sellerLabel: string
  breadcrumbs: Array<{ label: string; href: string }>
  includeOffer: boolean
}) {
  const offer = includeOffer
    ? {
        '@type': 'Offer',
        price,
        priceCurrency: listing.currency,
        availability: 'https://schema.org/InStock',
        url,
        seller:
          listing.seller_type === 'business'
            ? { '@type': 'Organization', name: sellerLabel }
            : { '@type': 'Person', name: 'Private seller' },
      }
    : undefined

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Product', 'Vehicle'],
        name: listing.title,
        description: listing.description || `${listing.title} - ${location}`,
        image: listing.images || [],
        brand: listing.make ? { '@type': 'Brand', name: listing.make } : undefined,
        model: listing.model || undefined,
        vehicleModelDate: listing.model_year || undefined,
        mileageFromOdometer:
          listing.mileage_km !== null
            ? { '@type': 'QuantitativeValue', value: listing.mileage_km, unitCode: 'KMT' }
            : undefined,
        vehicleTransmission: listing.gearbox || undefined,
        fuelType: listing.fuel_type || undefined,
        color: listing.color || undefined,
        itemCondition:
          listing.condition?.toLowerCase().includes('ny') || listing.condition?.toLowerCase().includes('new')
            ? 'https://schema.org/NewCondition'
            : 'https://schema.org/UsedCondition',
        offers: offer,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          item: item.href,
        })),
      },
    ],
  }
}

function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/'
}

function sanitizeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
