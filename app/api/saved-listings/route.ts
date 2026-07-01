import type { MarketplaceListing } from '@/app/components/MarketplaceCategoryBrowser'
import { displayCurrencyForMarket, formatMarketplacePriceDisplay } from '@/lib/currency-rates'
import { marketplacePublicSelect } from '@/lib/marketplace'
import { getMarketplaceSellerTrustByUserIds } from '@/lib/marketplace-public-data'
import { type PublicLocale } from '@/lib/public-i18n'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const MAX_SAVED_LISTINGS = 80
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function jsonResponse(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

function parseIds(value: string | null) {
  return [...new Set((value || '').split(',').map((id) => id.trim()))]
    .filter((id) => UUID_PATTERN.test(id))
    .slice(0, MAX_SAVED_LISTINGS)
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const ids = parseIds(searchParams.get('ids'))
  if (!ids.length) {
    return jsonResponse({ listings: [] })
  }

  const locale = (searchParams.get('locale') || 'sv') as PublicLocale
  const displayCurrency = displayCurrencyForMarket(searchParams.get('market'))
  const { data, error } = await createAdminClient()
    .from('marketplace_listings')
    .select(marketplacePublicSelect)
    .in('id', ids)
    .eq('status', 'published')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .limit(ids.length)

  if (error) {
    return jsonResponse({ error: 'Could not load saved listings' }, { status: 500 })
  }

  const sellerTrust = await getMarketplaceSellerTrustByUserIds(
    (data || []).map((listing) => listing.seller_user_id).filter(Boolean),
  )
  const listingById = new Map<string, MarketplaceListing>()

  await Promise.all(
    (data || []).map(async (listing) => {
      const price = await formatMarketplacePriceDisplay({
        amount: Number(listing.price),
        currency: listing.currency,
        locale,
        targetCurrency: displayCurrency,
      })

      listingById.set(listing.id, {
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
      })
    }),
  )

  return jsonResponse({
    listings: ids.map((id) => listingById.get(id)).filter(Boolean),
  })
}
