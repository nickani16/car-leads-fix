import SavedListingsClient from '@/app/components/SavedListingsClient'
import type { MarketplaceListing } from '@/app/components/MarketplaceCategoryBrowser'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function SavedListingsPage() {
  const now = new Date().toISOString()
  const { data } = await createAdminClient()
    .from('leads')
    .select(
      'id,make,model,model_year,miles,fuel_type,origin_country,source,sale_format,buy_now_price,seller_target_price,images,seller_user_id,seller_public_name,seller_is_trader',
    )
    .eq('status', 'Active')
    .is('auction_closed_at', null)
    .gt('auction_ends_at', now)
    .order('created_at', { ascending: false })
    .limit(200)

  const listings: MarketplaceListing[] = (data || []).map((lead) => {
    const mileage = Number(lead.miles)
    const price = Number(lead.buy_now_price || lead.seller_target_price)
    const images = Array.isArray(lead.images) ? lead.images : []
    return {
      id: lead.id,
      make: lead.make || '',
      model: lead.model || '',
      title: `${lead.make || 'Fordon'} ${lead.model || ''}`.trim(),
      year: lead.model_year,
      mileageKm: Number.isFinite(mileage) ? mileage * 10 : null,
      fuelType: lead.fuel_type,
      country: normalizeCountry(lead.origin_country || lead.source),
      saleFormat: lead.sale_format === 'marketplace' ? 'marketplace' : 'auction',
      priceLabel:
        Number.isFinite(price) && price > 0
          ? 'Pris visas efter verifiering'
          : 'Kontakta säljaren',
      priceValue: Number.isFinite(price) && price > 0 ? price : null,
      imageAvailable: typeof images[0] === 'string',
      imageUrl: typeof images[0] === 'string' ? images[0] : null,
      sellerName: lead.seller_public_name || 'Autorell',
      sellerIsTrader: Boolean(lead.seller_is_trader),
      messagingEnabled: Boolean(lead.seller_user_id),
    }
  })

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

function normalizeCountry(value: string | null) {
  const normalized = (value || 'SE').trim().toUpperCase()
  const aliases: Record<string, string> = {
    SWEDEN: 'SE',
    SVERIGE: 'SE',
    GERMANY: 'DE',
    DEUTSCHLAND: 'DE',
    DENMARK: 'DK',
    DANMARK: 'DK',
    FINLAND: 'FI',
  }
  return aliases[normalized] || normalized.slice(0, 2)
}
