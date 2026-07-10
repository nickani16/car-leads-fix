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

function normalizeListingId(value: unknown) {
  return typeof value === 'string' && UUID_PATTERN.test(value) ? value : ''
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
  const savedRows = await createAdminClient()
    .from('marketplace_saved_listings')
    .select('listing_id')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })
    .limit(MAX_SAVED_LISTINGS)

  if (savedRows.error) {
    return jsonResponse({ error: 'Could not load saved listings' }, { status: 500 })
  }

  const accountIds = (savedRows.data || [])
    .map((row) => row.listing_id)
    .filter((id): id is string => typeof id === 'string')
  const requestedIds = parseIds(searchParams.get('ids'))
  const ids = requestedIds.length
    ? requestedIds.filter((id) => accountIds.includes(id))
    : accountIds

  if (!ids.length) {
    return jsonResponse({ listingIds: accountIds, listings: [] })
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
        imageUrls: (listing.images || []).filter((image: unknown): image is string => typeof image === 'string' && Boolean(image)),
        sellerName: listing.seller_name,
        sellerIsTrader: listing.seller_type === 'business',
        sellerTrust: sellerTrust.get(listing.seller_user_id || '') || 'unverified',
        messagingEnabled: true,
      })
    }),
  )

  return jsonResponse({
    listingIds: accountIds,
    listings: ids.map((id) => listingById.get(id)).filter(Boolean),
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as { listingId?: unknown }
  const listingId = normalizeListingId(body.listingId)
  if (!listingId) {
    return jsonResponse({ error: 'Invalid listing id' }, { status: 400 })
  }

  const { error } = await createAdminClient()
    .from('marketplace_saved_listings')
    .upsert({ user_id: user.id, listing_id: listingId, saved_at: new Date().toISOString() }, { onConflict: 'user_id,listing_id' })

  if (error) {
    return jsonResponse({ error: 'Could not save listing' }, { status: 500 })
  }

  return jsonResponse({ saved: true, listingId })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParamId = request.nextUrl.searchParams.get('listingId')
  const body = request.headers.get('content-type')?.includes('application/json')
    ? await request.json().catch(() => ({})) as { listingId?: unknown }
    : {}
  const listingId = normalizeListingId(searchParamId || body.listingId)
  if (!listingId) {
    return jsonResponse({ error: 'Invalid listing id' }, { status: 400 })
  }

  const { error } = await createAdminClient()
    .from('marketplace_saved_listings')
    .delete()
    .eq('user_id', user.id)
    .eq('listing_id', listingId)

  if (error) {
    return jsonResponse({ error: 'Could not remove saved listing' }, { status: 500 })
  }

  return jsonResponse({ saved: false, listingId })
}
