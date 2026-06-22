import SavedListingsClient from '@/app/components/SavedListingsClient'
import type { MarketplaceListing } from '@/app/components/MarketplaceCategoryBrowser'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import {
  formatMarketplacePrice,
  marketplacePublicSelect,
} from '@/lib/marketplace'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function SavedListingsPage() {
  const { data } = await createAdminClient()
    .from('marketplace_listings')
    .select(marketplacePublicSelect)
    .eq('status', 'published')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('published_at', { ascending: false })
    .limit(250)

  const listings: MarketplaceListing[] = (data || []).map((listing) => ({
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
    condition: listing.condition,
    equipment: listing.equipment,
    country: listing.country_code,
    priceLabel: formatMarketplacePrice(Number(listing.price), listing.currency, 'sv'),
    priceValue: Number(listing.price),
    imageAvailable: Boolean(listing.images?.[0]),
    imageUrl: listing.images?.[0] || null,
    sellerName: listing.seller_name,
    sellerIsTrader: listing.seller_type === 'business',
    messagingEnabled: true,
  }))

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#101828]">
      <PublicHeader />
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
      <SavedListingsClient listings={listings} />
      <PublicFooter />
    </main>
  )
}
