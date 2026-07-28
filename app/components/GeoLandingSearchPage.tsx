import PublicHeader from '@/app/components/PublicHeader'
import VehicleSearchExperience, {
  type VehicleSearchListing,
} from '@/app/components/VehicleSearchExperience'
import {
  displayCurrencyForMarket,
  formatMarketplacePriceDisplay,
  getMarketplaceExchangeRates,
} from '@/lib/currency-rates'
import { getMarketplaceSellerPublicProfiles } from '@/lib/marketplace-public-data'
import {
  searchMarketplaceListings,
  type MarketplaceSearchResult,
} from '@/lib/marketplace-search-v2'
import type { GeoLandingRoute } from '@/lib/seo-geo-landings'

export default async function GeoLandingSearchPage({ landing }: { landing: GeoLandingRoute }) {
  const result = await searchLandingListings({
    category: landing.category,
    markets: [landing.countryCode],
    geoAreaId: landing.place.id,
    geoFilterMode: 'strict',
    make: landing.make || undefined,
    mode: 'sale',
    sort: 'published',
    limit: 48,
  })
  const listings = await mapRowsToVehicleSearchListings(result.items, landing)

  return (
    <>
      <PublicHeader
        locale={landing.locale}
        marketCode={landing.countryCode}
        marketplaceChannel={{
          label: landing.categoryLabel,
          slug: landing.category,
        }}
      />
      <section className="border-b border-[#d9e2f0] bg-white px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1300px]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#006CFF]">
            {landing.place.level === 'municipality' ? landing.place.municipality || landing.place.name : landing.place.name}
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold text-[#101828] sm:text-4xl">
            {landing.h1}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#52627a]">
            {landing.description}
          </p>
          {result.totalCount === 0 ? (
            <p className="mt-5 rounded-[8px] border border-[#d9e2f0] bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-[#101828]">
              {landing.zeroResultsText}
            </p>
          ) : null}
        </div>
      </section>
      <VehicleSearchExperience
        listings={listings}
        locale={landing.locale}
        defaultCountry={landing.countryCode}
        automaticCountry={landing.countryCode}
        initialMarkets={[landing.countryCode]}
        initialCategories={[landing.category]}
        initialCategory={landing.category}
        initialQuery=""
        initialSearchChips={[landing.place.name]}
        initialMake={landing.make || ''}
        initialModel=""
        initialRegion={landing.place.region || ''}
        initialCity={landing.place.locality || ''}
        initialMunicipality={landing.place.municipality || (landing.place.level === 'municipality' ? landing.place.name : '')}
        initialGeoAreaId={landing.place.id}
        initialGeoBounds={landing.place.bounds}
        initialGeoFilterMode="strict"
        initialMinPrice=""
        initialMaxPrice=""
        initialMode="sale"
        initialMinYear=""
        initialMaxYear=""
        initialMinMileage=""
        initialMaxMileage=""
        initialMinOperatingHours=""
        initialMaxOperatingHours=""
        initialFuel=""
        initialGearbox=""
        initialBodyType=""
        initialCondition=""
        initialColor=""
        initialSellerType="all"
        initialVerifiedOnly={false}
        initialFourWheelDrive={false}
        initialLeasingPossible={false}
        initialEquipmentQuery=""
        initialSortBy="published"
        disableUrlSync
      />
    </>
  )
}

async function searchLandingListings(
  input: Parameters<typeof searchMarketplaceListings>[0],
): Promise<MarketplaceSearchResult> {
  try {
    return await searchMarketplaceListings(input)
  } catch (error) {
    console.warn('Geo landing search returned an empty fallback', {
      geoAreaId: input.geoAreaId,
      make: input.make,
      message: error instanceof Error ? error.message : String(error),
    })
    return emptySearchResult(Number(input.limit) || 48)
  }
}

function emptySearchResult(limit: number): MarketplaceSearchResult {
  return {
    items: [],
    facets: {
      makes: [],
      models: [],
      fuels: [],
      gearboxes: [],
      bodyTypes: [],
      technical: {},
    },
    nextCursor: null,
    totalEstimate: 0,
    totalCount: 0,
    page: 1,
    pageSize: limit,
    totalPages: 1,
    limit,
    hasNext: false,
  }
}

async function mapRowsToVehicleSearchListings(
  rows: Array<Record<string, unknown>>,
  landing: GeoLandingRoute,
): Promise<VehicleSearchListing[]> {
  const displayCurrency = displayCurrencyForMarket(landing.countryCode)
  const sellerProfiles = await getMarketplaceSellerPublicProfiles(
    rows
      .map((listing) => stringValue(listing.seller_user_id))
      .filter(Boolean),
  )
  const exchangeRates = rows.some((listing) => stringValue(listing.currency) !== displayCurrency)
    ? await getMarketplaceExchangeRates()
    : undefined

  return Promise.all(
    rows.map(async (listing) => {
      const sellerProfile = sellerProfiles.get(stringValue(listing.seller_user_id))
      const listingCurrency = stringValue(listing.currency) || displayCurrency
      const price = await formatMarketplacePriceDisplay({
        amount: numberValue(listing.price),
        currency: listingCurrency,
        locale: landing.locale,
        targetCurrency: displayCurrency,
        exchangeRates,
      })
      const images = Array.isArray(listing.images)
        ? listing.images.filter((image): image is string => typeof image === 'string' && Boolean(image))
        : []

      return {
        id: stringValue(listing.id),
        category: stringValue(listing.category) || landing.category,
        title: stringValue(listing.title),
        make: stringValue(listing.make),
        model: stringValue(listing.model),
        year: listing.model_year ? String(listing.model_year) : null,
        mileageKm: numberOrNull(listing.mileage_km),
        operatingHours: numberOrNull(listing.operating_hours),
        fuelType: stringValue(listing.fuel_type),
        gearbox: stringValue(listing.gearbox),
        bodyType: stringValue(listing.body_type),
        country: stringValue(listing.country_code),
        city: stringValue(listing.city),
        municipality: stringValue(listing.municipality),
        latitude: numberOrNull(listing.latitude),
        longitude: numberOrNull(listing.longitude),
        priceLabel: price.label,
        priceValue: numberValue(listing.price),
        imageUrl: images[0] || null,
        imageUrls: images,
        sellerLogoUrl: sellerProfile?.logoUrl || null,
        sellerTrust: sellerProfile?.trust || 'unverified',
        sellerName: stringValue(listing.seller_name),
        sellerIsTrader: stringValue(listing.seller_type) === 'business',
        sellerRatingAverage: sellerProfile?.ratingAverage ?? null,
        sellerRatingCount: sellerProfile?.ratingCount ?? 0,
        condition: stringValue(listing.condition),
        color: stringValue(listing.color),
        equipment: typeof listing.equipment === 'string' ? listing.equipment : null,
        offerType: normalizeOfferType(listing.offer_type),
        leaseData: isRecord(listing.lease_data) ? listing.lease_data : null,
      }
    }),
  )
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function numberValue(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeOfferType(value: unknown) {
  return value === 'sale' || value === 'lease' || value === 'sale_and_lease' ? value : null
}
