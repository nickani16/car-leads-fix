import { NextRequest, NextResponse } from 'next/server'
import { marketplacePublicSelect } from '@/lib/marketplace'
import { getListingMarketInsights, type InsightListingRow } from '@/lib/marketplace-insights'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get('listingId') || ''
  if (!UUID_PATTERN.test(listingId)) {
    return NextResponse.json({ error: 'Invalid listing id' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: listing, error } = await admin
    .from('marketplace_listings')
    .select(marketplacePublicSelect)
    .eq('id', listingId)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Could not load listing' }, { status: 500 })
  }
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const insight = await getListingMarketInsights(admin, listing as InsightListingRow)
  return NextResponse.json({ insight }, { headers: { 'Cache-Control': 'private, no-store' } })
}
