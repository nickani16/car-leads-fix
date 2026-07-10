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
import { euCountryCodes } from '@/lib/eu-countries'
import {
  getMarketplaceSellerPublicProfiles,
  getPublishedMarketplaceCategoryListings,
} from '@/lib/marketplace-public-data'
import { getRequestLocale } from '@/lib/request-locale'

export const metadata: Metadata = {
  title: 'Sök fordon | Autorell',
  description:
    'Sök bilar, transportbilar, lastbilar, motorcyklar, husbilar och andra fordon i Europa med karta och snabba filter.',
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
        fuelType: listing.fuel_type,
        gearbox: listing.gearbox,
        bodyType: listing.body_type,
        country: listing.country_code,
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
        condition: listing.condition,
        color: listing.color,
        equipment: listing.equipment,
      }
    }),
  )

  return (
    <>
      <PublicHeader locale={locale} marketCode={marketCode} />
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
        initialMinPrice={getSearchParam(resolvedSearchParams, 'minPrice') || ''}
        initialMaxPrice={getSearchParam(resolvedSearchParams, 'maxPrice') || ''}
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
