import SavedListingsClient from '@/app/components/SavedListingsClient'
import type { MarketplaceListing } from '@/app/components/MarketplaceCategoryBrowser'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { marketplacePublicSelect } from '@/lib/marketplace'
import { getMarketplaceSellerTrustByUserIds } from '@/lib/marketplace-public-data'
import {
  displayCurrencyForMarket,
  formatMarketplacePriceDisplay,
} from '@/lib/currency-rates'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref } from '@/lib/public-i18n'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export default async function SavedListingsPage() {
  const locale = await getRequestLocale()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const displayCurrency = displayCurrencyForMarket(marketCode)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/'))

  const { data } = await createAdminClient()
    .from('marketplace_listings')
    .select(marketplacePublicSelect)
    .eq('status', 'published')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('published_at', { ascending: false })
    .limit(250)
  const sellerTrust = await getMarketplaceSellerTrustByUserIds(
    (data || []).map((listing) => listing.seller_user_id).filter(Boolean),
  )

  const listings: MarketplaceListing[] = await Promise.all(
    (data || []).map(async (listing) => {
      const price = await formatMarketplacePriceDisplay({
        amount: Number(listing.price),
        currency: listing.currency,
        locale,
        targetCurrency: displayCurrency,
      })

      return {
        id: listing.id,
        make: listing.make || '',
        model: listing.model || '',
        title: listing.title,
        year: listing.model_year ? String(listing.model_year) : null,
        mileageKm: listing.mileage_km,
        operatingHours: listing.operating_hours,
        fuelType: listing.fuel_type,
        gearbox: listing.gearbox,
        bodyType: listing.body_type,
        color: listing.color,
        condition: listing.condition,
        equipment: listing.equipment,
        country: listing.country_code,
        city: listing.city,
        priceLabel: price.label,
        priceValue: Number(listing.price),
        imageAvailable: Boolean(listing.images?.[0]),
        imageUrl: listing.images?.[0] || null,
        sellerName: listing.seller_name,
        sellerIsTrader: listing.seller_type === 'business',
        sellerTrust: sellerTrust.get(listing.seller_user_id || '') || 'unverified',
        messagingEnabled: true,
      }
    }),
  )

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="border-b border-[#e4e7ec] bg-white">
        <div className="mx-auto max-w-[1380px] px-5 py-10 sm:px-8 lg:px-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0866ff]">
            Din bevakningslista
          </span>
          <h1 className="mt-3 text-4xl tracking-[-0.05em] sm:text-5xl">
            Sparade annonser
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085] sm:text-base">
            Samla intressanta fordon på ett ställe och kontakta säljaren när du
            är redo.
          </p>
        </div>
      </section>
      <SavedListingsClient listings={listings} locale={locale} />
      <PublicFooter locale={locale} />
    </main>
  )
}
