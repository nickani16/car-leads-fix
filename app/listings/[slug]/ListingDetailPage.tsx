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
  MapPin,
  ShieldCheck,
  Settings2,
  TrendingDown,
} from 'lucide-react'
import ListingImageGallery from '@/app/components/ListingImageGallery'
import ListingEquipmentSection from '@/app/components/ListingEquipmentSection'
import ListingReportButton from '@/app/components/ListingReportButton'
import ListingLocationMap from '@/app/components/ListingLocationMap'
import MessageSellerButton from '@/app/components/MessageSellerButton'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import RevealPhoneButton from '@/app/components/RevealPhoneButton'
import SavedListingButton from '@/app/components/SavedListingButton'
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
import { getPublishedMarketplaceListingById } from '@/lib/marketplace-public-data'
import { selectedEquipmentGroups } from '@/lib/listing-equipment'
import { formatMileageAsMil, translateListingVehicleValue } from '@/lib/listing-display'
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
  latitude: number | null
  longitude: number | null
  price: number | string
  currency: string
  original_price: number | string | null
  edited_at: string | null
  last_price_change_at: string | null
  images: string[] | null
  seller_name: string
  seller_type: 'private' | 'business'
  phone_visibility: 'public' | 'registered_only' | null
  package_id: string | null
  priority: number | null
  created_at: string
  published_at: string | null
  expires_at: string | null
}

type ListingTechnicalDetails = {
  registrationNumber: string | null
  vin: string | null
  chassisNumber: string | null
  technicalData: Record<string, string | number | string[]>
}

type SellerVerification = {
  label: string
  tone: 'verified' | 'pending' | 'unverified'
}

type SellerDetails = SellerVerification & {
  websiteUrl: string | null
  logoUrl: string | null
  address: string | null
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
  const canonicalPath = localizePublicHref(locale, buildListingPath(listing))
  const canonical = `https://www.autorell.com${canonicalPath}`
  const location = [listing.city, getEuCountryName(listing.country_code, locale)].filter(Boolean).join(', ')
  const title = `${listing.title} | ${location} | Autorell`
  const description = [
    listing.model_year,
    listing.make,
    listing.model,
    listing.mileage_km !== null ? `${Number(listing.mileage_km).toLocaleString('sv-SE')} km` : null,
    location,
  ]
    .filter(Boolean)
    .join(' · ')
  const image = listing.images?.[0] || undefined

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Autorell',
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
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
  const isLoggedIn = Boolean(user)
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const canonicalPath = localizePublicHref(locale, buildListingPath(listing))
  if (slug !== buildListingSlug(listing)) {
    permanentRedirect(canonicalPath)
  }

  const category = getMarketplaceCategory(listing.category)
  const language = marketplaceLanguage(locale)
  const categoryLabel =
    locale === 'sv' || locale === 'de' || locale === 'en'
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
      ? listing.seller_name || localizedLabel(locale, 'Företagssäljare', 'Business seller', 'Gewerblicher Verkäufer')
      : localizedLabel(locale, 'Verifierad privat säljare', 'Verified private seller', 'Verifizierter privater Verkäufer')
  const sellerTypeLabel =
    listing.seller_type === 'business'
      ? localizedLabel(locale, 'Företag', 'Company', 'Unternehmen')
      : localizedLabel(locale, 'Privat annons', 'Private listing', 'Private Anzeige')
  const hidePrivateSellerIdentity = !isLoggedIn && listing.seller_type === 'private'
  const sellerDisplayLabel = hidePrivateSellerIdentity ? localizedLabel(locale, 'Logga in för att se säljaren', 'Log in to view the seller', 'Anmelden, um den Verkäufer zu sehen') : sellerLabel
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
    .join(' · ')
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
  const vehicleSchema = buildVehicleSchema({
    listing,
    price: Number(listing.price),
    url: publicUrl,
    location,
    sellerLabel,
  })

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#101828]">
      <PublicHeader
        locale={locale}
        marketCode={marketCode}
        marketplaceChannel={{ label: categoryLabel, slug: category.slug }}
      />
      <div className="mx-auto max-w-[var(--autorell-page-max)] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        <nav aria-label={copy.breadcrumbLabel} className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#667085]">
          <Link href={localizePublicHref(locale, '/')} className="transition hover:text-[#0866ff]">
            {copy.home}
          </Link>
          <span className="text-[#98a2b3]">/</span>
          <Link
            href={localizePublicHref(locale, `/marketplace/${listing.category}`)}
            className="transition hover:text-[#0866ff]"
          >
            {categoryLabel}
          </Link>
          <span className="text-[#98a2b3]">/</span>
          <span className="text-[#101828]" aria-current="page">
            {listing.title}
          </span>
        </nav>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_410px]">
          <div className="min-w-0 space-y-6">
            <ListingImageGallery images={listing.images || []} title={listing.title} />

            <section className="rounded-[18px] border border-[#dfe6f2] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-[-0.055em] sm:text-5xl">
                    {listing.title}
                  </h1>
                  {headlineSubtitle ? (
                    <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[#475467] sm:text-lg">
                      {headlineSubtitle}
                    </p>
                  ) : null}
                  <p className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-[#667085]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#0866ff]" />
                      {location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-[#0866ff]" />
                      {formatDate(publishedDate, locale)}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2 self-start">
                  <SavedListingButton listingId={listing.id} />
                  <ShareListingButton
                    title={listing.title}
                    url={publicUrl}
                    label={copy.shareListing}
                  />
                </div>
              </div>
              {headlineFacts.length ? (
                <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {headlineFacts.slice(0, 8).map((fact) => {
                    const Icon = fact.icon
                    return (
                      <div key={fact.label} className="flex min-w-0 items-center gap-2.5 rounded-[14px] border border-[#edf1f6] bg-[#f8fbff] px-3 py-3 sm:gap-3 sm:px-4">
                        <Icon className="h-5 w-5 shrink-0 text-[#202124]" />
                        <div className="min-w-0">
                          <p className="break-words text-xs font-semibold leading-4 text-[#667085]">{fact.label}</p>
                          <p title={String(fact.value)} className="mt-0.5 break-words text-sm font-black leading-5 text-[#101828]">{fact.value}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </section>

            <section className="rounded-[18px] border border-[#dfe6f2] bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-2xl font-black tracking-[-0.04em]">
                {localizedLabel(locale, 'Specifikationer', 'Specifications', 'Spezifikationen')}
              </h2>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {specs.map((spec) => (
                  <div key={spec.label} className="rounded-[10px] border border-[#e4eaf3] bg-[#f8fbff] px-3.5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#667085]">
                      {spec.label}
                    </p>
                    <p className="mt-1.5 break-words text-[14px] font-bold leading-5 text-[#101828]">
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
              <section className="rounded-[18px] border border-[#dfe6f2] bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-2xl font-black tracking-[-0.04em]">
                  {copy.sellerDescription}
                </h2>
                <p className="mt-2 text-sm font-semibold text-[#667085]">{copy.originalLanguage}</p>
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-[#475467]">
                  {listing.description}
                </p>
              </section>
            ) : null}

            <ListingLocationMap
              title={localizedLabel(locale, 'Plats', 'Location', 'Standort')}
              address={listing.address}
              city={listing.city}
              country={countryName || listing.country_code}
              latitude={listing.latitude}
              longitude={listing.longitude}
            />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[20px] border border-[#dfe6f2] bg-white shadow-[0_22px_60px_rgba(16,24,40,.12)]">
              <div className="border-b border-[#edf1f6] p-6">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#667085]">
                  {localizedLabel(locale, 'Pris', 'Price', 'Preis')}
                </p>
                {originalPriceDisplay ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-[#98a2b3] line-through">
                      {originalPriceDisplay.original}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf3] px-2.5 py-1 text-xs font-black text-[#027a48]">
                      <TrendingDown className="h-3.5 w-3.5" />
                      {localizedLabel(locale, 'Sänkt', 'Reduced', 'Reduziert')} {priceDropPercent}%
                    </span>
                  </div>
                ) : null}
                <div className="mt-2 text-4xl font-bold tracking-[-0.045em]">
                  {price.original}
                </div>
                {price.approximate ? (
                  <p className="mt-2 text-sm font-semibold text-[#667085]">{price.approximate}</p>
                ) : null}
                <p className="mt-3 rounded-[12px] bg-[#f3f7ff] px-3 py-2 text-xs font-semibold leading-5 text-[#475467]">
                  {localizedLabel(locale, 'Moms visas enligt säljarens uppgifter och landets regler.', "VAT is shown according to the seller's information and local rules.", 'MwSt. wird gemäß Verkäuferangaben und lokalen Regeln angezeigt.')}
                </p>
              </div>

              <div className="grid gap-3 p-6">
                {isListingOwner ? (
                  <Link
                    href={localizePublicHref(locale, `/account/listings/${listing.id}/edit`)}
                    className="inline-flex min-h-12 items-center justify-center rounded-[14px] border border-[#c9d7ec] bg-white px-4 text-sm font-black text-[#0866ff] transition hover:bg-[#f5f9ff]"
                  >
                    {localizedLabel(locale, 'Redigera annons', 'Edit listing', 'Anzeige bearbeiten')}
                  </Link>
                ) : null}
                <RevealPhoneButton listingId={listing.id} locale={locale} />
                <MessageSellerButton listingId={listing.id} enabled variant="button" />
                <ShareListingButton
                  title={listing.title}
                  url={publicUrl}
                  label={copy.shareListing}
                />
              </div>

              <div className="border-t border-[#edf1f6] p-6">
                <div className="grid gap-4">
                  {listing.seller_type === 'business' && sellerDetails.logoUrl ? (
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
                    <p className={`text-lg font-black tracking-[-0.03em] ${hidePrivateSellerIdentity ? 'select-none blur-[4px]' : ''}`}>
                      {sellerDisplayLabel}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#667085]">{sellerTypeLabel}</p>
                    <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-black ${sellerBadgeClass(sellerVerification.tone)}`}>
                      {sellerVerification.label}
                    </span>
                    {listing.seller_type === 'business' ? (
                      <div className="mt-4 grid gap-3 text-sm font-semibold text-[#475467]">
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
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-[#c9d7ec] bg-white px-4 text-sm font-black text-[#0866ff] transition hover:bg-[#f5f9ff]"
                          >
                            {localizedLabel(locale, 'Till handlarens webbsida', 'Dealer website', 'Zur Händlerwebsite')}
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                    {hidePrivateSellerIdentity ? (
                      <p className="mt-2 text-xs font-bold text-[#0866ff]">
                        {localizedLabel(locale, 'Logga in för att visa säljaruppgifter.', 'Log in to view seller details.', 'Anmelden, um Verkäuferdetails zu sehen.')}
                      </p>
                    ) : null}
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
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-[16px] border border-[#dfe6f2] bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
                {copy.noticeEyebrow}
              </p>
              <h2 className="mt-1.5 text-xl font-black tracking-[-0.03em] sm:text-2xl">
                {copy.noticeTitle}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-5 text-[#667085]">
                {copy.noticeIntro}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <ShareListingButton
                title={listing.title}
                url={publicUrl}
                label={copy.shareListing}
              />
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
            <div className="mt-3 rounded-[12px] border border-[#d8e6ff] bg-[#f3f7ff] px-4 py-3 text-sm font-bold text-[#475467]">
              {localizedLabel(locale, 'Annonsen har redigerats av säljaren.', 'The listing has been edited by the seller.', 'Die Anzeige wurde vom Verkäufer bearbeitet.')}
            </div>
          ) : null}

          <div className="mt-4 rounded-[12px] border border-[#edf1f6] bg-[#f8fafc] px-4 py-3 text-sm leading-5 text-[#475467]">
            {copy.euDisclaimer}
          </div>
        </section>
      </div>
      <PublicFooter locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleSchema) }}
      />
    </main>
  )
}

async function fetchListingFromSlug(slug: string) {
  const id = extractListingIdFromSlug(slug)
  if (!id) return null

  const data = await getPublishedMarketplaceListingById(id)

  return (data || null) as ListingRow | null
}

async function getSellerDetails(
  listingId: string,
  sellerType: 'private' | 'business',
  locale: PublicLocale,
): Promise<SellerDetails> {
  const empty: SellerDetails = {
    label: localizedLabel(locale, 'Ej verifierad e-post', 'Unverified email', 'Nicht verifizierte E-Mail'),
    tone: 'unverified',
    websiteUrl: null,
    logoUrl: null,
    address: null,
  }
  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('seller_user_id')
    .eq('id', listingId)
    .maybeSingle()

  if (!listing?.seller_user_id) return empty

  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('website_url,logo_url,identity_status,business_verification_status,address_line_1,postal_code,city,region')
    .eq('user_id', listing.seller_user_id)
    .maybeSingle()

  const addressLine = [
    textOrNull(profile?.address_line_1),
    [textOrNull(profile?.postal_code), textOrNull(profile?.city)].filter(Boolean).join(' '),
    textOrNull(profile?.region),
  ].filter(Boolean).join(', ')

  const base = {
    websiteUrl: sellerType === 'business' ? textOrNull(profile?.website_url) : null,
    logoUrl: sellerType === 'business' ? textOrNull(profile?.logo_url) : null,
    address: sellerType === 'business' ? textOrNull(addressLine) : null,
  }

  if (sellerType === 'business') {
    const status = profile?.business_verification_status
    if (status === 'verified' || status === 'vat_validated') {
      return {
        ...base,
        label: localizedLabel(locale, 'Verifierat företag', 'Verified company', 'Verifiziertes Unternehmen'),
        tone: 'verified',
      }
    }
    if (status === 'pending_review' || status === 'pending' || status === 'needs_review') {
      return {
        ...base,
        label: localizedLabel(locale, 'Företag - verifiering pågår', 'Company verification in progress', 'Unternehmen wird geprüft'),
        tone: 'pending',
      }
    }
    return {
      ...base,
      label: localizedLabel(locale, 'Ej verifierat företag', 'Unverified company', 'Nicht verifiziertes Unternehmen'),
      tone: 'unverified',
    }
  }

  const verified = profile?.identity_status === 'verified' || profile?.identity_status === 'basic_checked'
  return verified
    ? {
        ...base,
        label: localizedLabel(locale, 'Verifierad e-post', 'Verified email', 'Verifizierte E-Mail'),
        tone: 'verified',
      }
    : {
        ...base,
        label: localizedLabel(locale, 'Ej verifierad e-post', 'Unverified email', 'Nicht verifizierte E-Mail'),
        tone: 'unverified',
      }
}

function sellerBadgeClass(tone: SellerVerification['tone']) {
  if (tone === 'verified') return 'bg-emerald-50 text-emerald-700'
  if (tone === 'pending') return 'bg-amber-50 text-amber-800'
  return 'bg-[#f2f4f7] text-[#475467]'
}

async function getListingTechnicalDetails(listingId: string): Promise<ListingTechnicalDetails | null> {
  const { data } = await createAdminClient()
    .from('marketplace_listing_identifiers')
    .select('registration_number,vin,chassis_number,metadata')
    .eq('listing_id', listingId)
    .maybeSingle()

  if (!data) return null

  const metadata = isRecord(data.metadata) ? data.metadata : {}
  const technicalData = isRecord(metadata.technical_data)
    ? (metadata.technical_data as Record<string, string | number | string[]>)
    : {}

  return {
    registrationNumber: textOrNull(data.registration_number),
    vin: textOrNull(data.vin),
    chassisNumber: textOrNull(data.chassis_number),
    technicalData,
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
  if (locale === 'de') return de
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
      label: localizedLabel(locale, 'Kilometer', 'Mileage', 'Kilometerstand'),
      value: listing.mileage_km !== null ? `${Number(listing.mileage_km).toLocaleString('sv-SE')} km` : null,
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
    { label: localizedLabel(locale, 'Drivhjul', 'Driven wheels', 'Antriebsräder'), value: translateSpecValue(locale, formatTechnicalValue(technical.drivetrain, '')) },
    { label: localizedLabel(locale, 'Säten', 'Seats', 'Sitze'), value: formatTechnicalValue(technical.seats, '') },
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
    { label: localizedLabel(locale, 'Skador / fel', 'Damage / faults', 'Schäden / Mängel'), value: listing.known_faults },
  ]

  return specs.filter(
    (item): item is { label: string; value: string | number } =>
      item.value !== null && item.value !== undefined && item.value !== '',
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#edf1f6] bg-white px-4 py-3">
      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#667085]">
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-[15px] font-black text-[#101828]">{value}</dd>
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
  const category = getMarketplaceCategory(listing.category)
  const language = marketplaceLanguage(locale)
  const singular =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? category.singular[language]
      : category.singular.en
  const condition = String(listing.condition || '').toLowerCase()

  if (condition.includes('ny') || condition.includes('new')) {
    return locale === 'sv'
      ? `Ny ${singular} till salu`
      : locale === 'de'
        ? `Neues ${singular} zum Verkauf`
        : translatePublic(locale, `New ${singular} for sale`)
  }

  return locale === 'sv'
    ? `Begagnad ${singular} till salu`
    : locale === 'de'
      ? `Gebrauchtes ${singular} zum Verkauf`
      : translatePublic(locale, `Used ${singular} for sale`)
}

function splitCsv(value?: string | null) {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatDate(value: string, locale: PublicLocale) {
  return new Intl.DateTimeFormat(locale === 'sv' ? 'sv-SE' : locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function formatDateTime(value: string, locale: PublicLocale) {
  return new Intl.DateTimeFormat(locale === 'sv' ? 'sv-SE' : locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getDaysLeft(value?: string | null) {
  if (!value) return null
  const expiresAt = new Date(value).getTime()
  if (!Number.isFinite(expiresAt)) return null
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 86_400_000))
}

function formatDaysLeft(days: number | null, locale: PublicLocale) {
  if (days === null) return ''
  if (days === 0) {
    return localizedLabel(locale, 'Försvinner idag', 'Expires today', 'Läuft heute ab')
  }
  if (locale === 'sv') return days === 1 ? '1 dag kvar' : `${days} dagar kvar`
  if (locale === 'de') return days === 1 ? '1 Tag übrig' : `${days} Tage übrig`
  const label = days === 1 ? 'day left' : 'days left'
  return translatePublic(locale, `${days} ${label}`)
}

const listingDetailCopy = {
  sv: {
    sellerDescription: 'Säljarens information',
    originalLanguage: 'Säljarens fritext visas på det språk som säljaren själv har skrivit.',
    noticeEyebrow: 'Annonsuppgifter',
    noticeTitle: 'ID, delning och granskning',
    noticeIntro:
      'Spara annons-ID om du kontaktar säljaren eller vill att Autorell granskar annonsen.',
    adId: 'Annons-ID',
    updated: 'Uppdaterad',
    reference: 'Referens',
    country: 'Land',
    shareListing: 'Dela annons',
    breadcrumbLabel: 'Brödsmulor',
    home: 'Hem',
    euDisclaimer:
      'Annonsen kan vara ofullständig eller inaktuell. Säljaren ansvarar för att lämna korrekta och fullständiga uppgifter enligt tillämplig upplysningsplikt i EU och nationell lag. Autorell kontrollerar inte varje uppgift och ansvarar inte för informationen i annonsen.',
  },
  en: {
    sellerDescription: 'Seller information',
    originalLanguage: 'The seller text is shown in the language provided by the seller.',
    noticeEyebrow: 'Listing details',
    noticeTitle: 'ID, sharing and reporting',
    noticeIntro:
      'Keep the listing ID when contacting the seller or reporting a listing for Autorell review.',
    adId: 'Listing ID',
    updated: 'Updated',
    reference: 'Reference',
    country: 'Country',
    shareListing: 'Share listing',
    breadcrumbLabel: 'Breadcrumb',
    home: 'Home',
    euDisclaimer:
      'The listing may be incomplete or out of date. The seller is responsible for providing correct and complete information under applicable EU and national disclosure obligations. Autorell does not verify every statement and is not responsible for the accuracy of the information in the listing.',
  },
  de: {
    sellerDescription: 'Information des Verkäufers',
    originalLanguage: 'Freitext des Verkäufers wird in der Originalsprache angezeigt.',
    noticeEyebrow: 'Anzeigenangaben',
    noticeTitle: 'ID, Teilen und Meldung',
    noticeIntro:
      'Speichern Sie die Anzeigen-ID, wenn Sie mit dem Verkäufer sprechen oder eine Anzeige zur Prüfung melden.',
    adId: 'Anzeigen-ID',
    updated: 'Aktualisiert',
    reference: 'Referenz',
    country: 'Land',
    shareListing: 'Anzeige teilen',
    breadcrumbLabel: 'Breadcrumb',
    home: 'Startseite',
    euDisclaimer:
      'Die Anzeige kann unvollständig oder veraltet sein. Der Verkäufer ist dafür verantwortlich, korrekte und vollständige Informationen gemäß der geltenden EU- und nationalen Aufklärungspflichten bereitzustellen. Autorell prüft nicht alle Angaben und übernimmt keine Verantwortung für die Richtigkeit der Informationen in der Anzeige.',
  },
} as const

function getListingDetailCopy(locale: PublicLocale) {
  if (locale === 'sv' || locale === 'de' || locale === 'en') {
    return listingDetailCopy[locale]
  }

  return translatePublicObject(locale, listingDetailCopy.en)
}

function buildVehicleSchema({
  listing,
  price,
  url,
  location,
  sellerLabel,
}: {
  listing: ListingRow
  price: number
  url: string
  location: string
  sellerLabel: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
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
    color: listing.color || undefined,
    itemCondition:
      listing.condition?.toLowerCase().includes('ny') || listing.condition?.toLowerCase().includes('new')
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: listing.currency,
      availability: 'https://schema.org/InStock',
      url,
      seller:
        listing.seller_type === 'business'
          ? { '@type': 'Organization', name: sellerLabel }
          : { '@type': 'Person', name: 'Private seller' },
    },
  }
}
