import { headers } from 'next/headers'
import type { Metadata } from 'next'
import VehicleSearchExperience, {
  type VehicleSearchListing,
} from '@/app/components/VehicleSearchExperience'
import PublicHeader from '@/app/components/PublicHeader'
import {
  displayCurrencyForMarket,
  formatMarketplacePriceDisplay,
} from '@/lib/currency-rates'
import { euCountryCodes, getEuCountryName } from '@/lib/eu-countries'
import {
  isLeasingMarketplaceCategory,
  marketplaceCategories,
  marketplaceCategoryAliases,
  type MarketplaceCategorySlug,
} from '@/lib/marketplace'
import {
  getMarketplaceSellerPublicProfiles,
  getPublishedMarketplaceCategoryListings,
} from '@/lib/marketplace-public-data'
import { getRequestLocale } from '@/lib/request-locale'
import {
  getMarketplaceSearchSeo,
  resolveMarketplaceSearchMode,
} from '@/lib/marketplace-search-seo'

type FindCarsSearchParams = { [key: string]: string | string[] | undefined }

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<FindCarsSearchParams>
}): Promise<Metadata> {
  const locale = await getRequestLocale()
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market')?.toUpperCase() || ''
  const mode = getSearchMode(resolvedSearchParams)
  const requestedCategory = getMetadataCategory(resolvedSearchParams)
  const category = mode === 'leasing' && requestedCategory !== 'vehicles' && !isLeasingMarketplaceCategory(requestedCategory)
    ? 'cars'
    : requestedCategory
  const requestedMarkets = getSearchParamList(resolvedSearchParams, 'markets')
    .map((value) => value.toUpperCase())
    .filter((value) => value === 'EU' || euCountryCodes.has(value))
  const requestedCountry = getSearchParam(resolvedSearchParams, 'country').toUpperCase()
  const selectedCountry = requestedMarkets.find((value) => value !== 'EU') || requestedCountry || marketCode
  const place =
    getSearchParam(resolvedSearchParams, 'chips') ||
    getSearchParam(resolvedSearchParams, 'city') ||
    getSearchParam(resolvedSearchParams, 'municipality') ||
    getSearchParam(resolvedSearchParams, 'region') ||
    (selectedCountry && euCountryCodes.has(selectedCountry)
      ? getEuCountryName(selectedCountry, locale)
      : '')
  const seo = getMarketplaceSearchSeo({
    locale,
    category,
    allVehicles: category === 'vehicles',
    mode,
    make: getSearchParam(resolvedSearchParams, 'make'),
    model: getSearchParam(resolvedSearchParams, 'model'),
    freeText: getSearchParam(resolvedSearchParams, 'q') || getSearchParam(resolvedSearchParams, 'filter'),
    place,
    condition: getSearchParam(resolvedSearchParams, 'condition'),
  })

  return {
    title: { absolute: seo.title },
    description: seo.description,
    robots: hasMeaningfulSearchParams(resolvedSearchParams)
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: seo.title,
      description: seo.description,
      siteName: 'Autorell',
      type: 'website',
    },
  }
}

export default async function FindCarsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const locale = await getRequestLocale()
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const automaticCountry =
    marketCode && euCountryCodes.has(marketCode.toUpperCase())
      ? marketCode.toUpperCase()
      : locale === 'sv'
        ? 'SE'
        : locale === 'de'
          ? 'DE'
          : 'SE'
  const requestedCountry = getSearchParam(resolvedSearchParams, 'country').toUpperCase()
  const requestedMarkets = getSearchParamList(resolvedSearchParams, 'markets')
    .map((value) => value.toUpperCase())
    .filter((value) => value === 'EU' || euCountryCodes.has(value))
  const requestedCategories = getSearchParamList(resolvedSearchParams, 'categories')
  const requestedCountryMarkets = requestedMarkets.filter((value) => value !== 'EU')
  const defaultCountry =
    requestedCountryMarkets[0] ||
    requestedCountry ||
    automaticCountry
  const displayCurrency = displayCurrencyForMarket(marketCode || defaultCountry)
  const data = await getPublishedMarketplaceCategoryListings('vehicles', 240)
  const sellerProfiles = await getMarketplaceSellerPublicProfiles(
    (data || []).map((listing) => listing.seller_user_id).filter(Boolean),
  )

  const listings: VehicleSearchListing[] = await Promise.all(
    (data || []).map(async (listing) => {
      const sellerProfile = sellerProfiles.get(listing.seller_user_id || '')
      const price = await formatMarketplacePriceDisplay({
        amount: Number(listing.price),
        currency: listing.currency,
        locale,
        targetCurrency: displayCurrency,
      })

      return {
        id: listing.id,
        category: listing.category,
        title: listing.title,
        make: listing.make || '',
        model: listing.model || '',
        year: listing.model_year ? String(listing.model_year) : null,
        mileageKm: listing.mileage_km,
        operatingHours: listing.operating_hours,
        fuelType: listing.fuel_type,
        gearbox: listing.gearbox,
        bodyType: listing.body_type,
        country: listing.country_code,
        region: listing.municipality || listing.city || '',
        city: listing.city,
        municipality: listing.municipality,
        latitude: typeof listing.latitude === 'number' ? listing.latitude : null,
        longitude: typeof listing.longitude === 'number' ? listing.longitude : null,
        priceLabel: price.label,
        priceValue: Number(listing.price),
        imageUrl: listing.images?.[0] || null,
        imageUrls: (listing.images || []).filter((image: unknown): image is string => typeof image === 'string' && Boolean(image)),
        sellerLogoUrl: sellerProfile?.logoUrl || null,
        sellerTrust: sellerProfile?.trust || 'unverified',
        sellerName: listing.seller_name,
        sellerIsTrader: listing.seller_type === 'business',
        sellerRatingAverage: sellerProfile?.ratingAverage ?? null,
        sellerRatingCount: sellerProfile?.ratingCount ?? 0,
        condition: listing.condition,
        color: listing.color,
        equipment: listing.equipment,
        description: listing.description,
        offerType: normalizeListingOfferType(listing.offer_type),
        leaseData: listing.lease_data && typeof listing.lease_data === 'object' && !Array.isArray(listing.lease_data)
          ? listing.lease_data as Record<string, unknown>
          : null,
        insuranceOffers: Array.isArray(listing.insurance_offers)
          ? listing.insurance_offers as VehicleSearchListing['insuranceOffers']
          : null,
      }
    }),
  )

  return (
    <>
      <PublicHeader
        locale={locale}
        marketCode={marketCode}
        marketplaceMode={getSearchMode(resolvedSearchParams)}
      />
      <VehicleSearchExperience
        listings={listings}
        locale={locale}
        defaultCountry={defaultCountry}
        automaticCountry={automaticCountry}
        initialCategory={getSearchParam(resolvedSearchParams, 'category') || 'all'}
        initialMarkets={requestedMarkets.length ? requestedMarkets : requestedCountry ? [requestedCountry] : []}
        initialCategories={requestedCategories}
        initialQuery={getSearchParam(resolvedSearchParams, 'q') || getSearchParam(resolvedSearchParams, 'filter') || ''}
        initialMake={getSearchParam(resolvedSearchParams, 'make') || ''}
        initialModel={getSearchParam(resolvedSearchParams, 'model') || ''}
        initialRegion={getSearchParam(resolvedSearchParams, 'region') || getSearchParam(resolvedSearchParams, 'county') || ''}
        initialCity={getSearchParam(resolvedSearchParams, 'city') || ''}
        initialMunicipality={getSearchParam(resolvedSearchParams, 'municipality') || ''}
        initialMinPrice={getSearchParam(resolvedSearchParams, 'minPrice') || ''}
        initialMaxPrice={getSearchParam(resolvedSearchParams, 'maxPrice') || ''}
        initialMode={getSearchMode(resolvedSearchParams)}
        initialModeExplicit={
          hasSearchParam(resolvedSearchParams, 'mode') ||
          hasSearchParam(resolvedSearchParams, 'intent') ||
          hasSearchParam(resolvedSearchParams, 'offerType') ||
          getBooleanSearchParam(resolvedSearchParams, 'leasingPossible')
        }
        initialMinYear={getSearchParam(resolvedSearchParams, 'minYear') || ''}
        initialMaxYear={getSearchParam(resolvedSearchParams, 'maxYear') || ''}
        initialMinMileage={getSearchParam(resolvedSearchParams, 'minMileage') || ''}
        initialMaxMileage={getSearchParam(resolvedSearchParams, 'maxMileage') || ''}
        initialMinOperatingHours={getSearchParam(resolvedSearchParams, 'minOperatingHours') || ''}
        initialMaxOperatingHours={getSearchParam(resolvedSearchParams, 'maxOperatingHours') || ''}
        initialFuel={getSearchParam(resolvedSearchParams, 'fuel') || ''}
        initialGearbox={getSearchParam(resolvedSearchParams, 'gearbox') || ''}
        initialBodyType={getSearchParam(resolvedSearchParams, 'bodyType') || ''}
        initialCondition={getSearchParam(resolvedSearchParams, 'condition') || ''}
        initialColor={getSearchParam(resolvedSearchParams, 'color') || ''}
        initialSellerType={getSearchParam(resolvedSearchParams, 'sellerType') || 'all'}
        initialVerifiedOnly={getBooleanSearchParam(resolvedSearchParams, 'verifiedOnly')}
        initialFourWheelDrive={getBooleanSearchParam(resolvedSearchParams, 'fourWheelDrive')}
        initialLeasingPossible={getBooleanSearchParam(resolvedSearchParams, 'leasingPossible')}
        initialEquipmentQuery={getSearchParam(resolvedSearchParams, 'equipment') || ''}
        initialSortBy={getSearchParam(resolvedSearchParams, 'sort') || 'published'}
        syncCategoryRoute
      />
    </>
  )
}

function getSearchParam(
  params: { [key: string]: string | string[] | undefined },
  key: string,
) {
  const value = params[key]
  return Array.isArray(value) ? value[0] || '' : value || ''
}

function hasSearchParam(
  params: { [key: string]: string | string[] | undefined },
  key: string,
) {
  const value = params[key]
  return Array.isArray(value) ? value.some((item) => String(item || '').trim()) : Boolean(String(value || '').trim())
}

function normalizeListingOfferType(value: unknown): VehicleSearchListing['offerType'] {
  return value === 'lease' || value === 'sale_and_lease' || value === 'sale' ? value : null
}

function getSearchParamList(
  params: { [key: string]: string | string[] | undefined },
  key: string,
) {
  const value = params[key]
  const values = Array.isArray(value) ? value : [value]
  return values
    .flatMap((item) => String(item || '').split(','))
    .map((item) => item.trim())
    .filter(Boolean)
}

function getSearchMode(
  params: FindCarsSearchParams,
) {
  return resolveMarketplaceSearchMode({
    mode: getSearchParam(params, 'mode'),
    intent: getSearchParam(params, 'intent'),
    offerType: getSearchParam(params, 'offerType'),
    leasingPossible: getSearchParam(params, 'leasingPossible'),
  })
}

function getMetadataCategory(params: FindCarsSearchParams): MarketplaceCategorySlug | 'vehicles' {
  const value = getSearchParamList(params, 'categories')[0] || getSearchParam(params, 'category')
  if (!value || value === 'all' || value === 'vehicles') return 'vehicles'
  const normalized = marketplaceCategoryAliases[value] || value
  return marketplaceCategories.some((category) => category.slug === normalized)
    ? normalized as MarketplaceCategorySlug
    : 'vehicles'
}

function hasMeaningfulSearchParams(params: FindCarsSearchParams) {
  return Object.values(params).some((value) =>
    (Array.isArray(value) ? value : [value]).some((item) => String(item || '').trim()),
  )
}

function getBooleanSearchParam(
  params: { [key: string]: string | string[] | undefined },
  key: string,
) {
  const value = getSearchParam(params, key).toLowerCase()
  return value === '1' || value === 'true' || value === 'yes'
}
