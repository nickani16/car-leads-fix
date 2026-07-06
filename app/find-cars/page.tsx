import { headers } from 'next/headers'
import type { Metadata } from 'next'
import VehicleSearchExperience, {
  type VehicleSearchListing,
} from '@/app/components/VehicleSearchExperience'
import {
  displayCurrencyForMarket,
  formatMarketplacePriceDisplay,
} from '@/lib/currency-rates'
import { euCountryCodes } from '@/lib/eu-countries'
import { getPublishedMarketplaceCategoryListings } from '@/lib/marketplace-public-data'
import { getRequestLocale } from '@/lib/request-locale'

export const metadata: Metadata = {
  title: 'Sök fordon | Autorell',
  description:
    'Sök bilar, transportbilar, lastbilar, motorcyklar, husbilar och andra fordon i Europa med karta och snabba filter.',
}

export default async function FindCarsPage() {
  const locale = await getRequestLocale()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const defaultCountry =
    marketCode && euCountryCodes.has(marketCode.toUpperCase())
      ? marketCode.toUpperCase()
      : locale === 'sv'
        ? 'SE'
        : locale === 'de'
          ? 'DE'
          : 'SE'
  const displayCurrency = displayCurrencyForMarket(marketCode || defaultCountry)
  const data = await getPublishedMarketplaceCategoryListings('vehicles', 240)

  const listings: VehicleSearchListing[] = await Promise.all(
    (data || []).map(async (listing) => {
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
        sellerName: listing.seller_name,
        sellerIsTrader: listing.seller_type === 'business',
      }
    }),
  )

  return (
    <VehicleSearchExperience
      listings={listings}
      locale={locale}
      defaultCountry={defaultCountry}
    />
  )
}
