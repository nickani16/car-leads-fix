import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const allowedCategories = new Set([
  'suspected_fraud',
  'misleading_listing',
  'unsafe_product',
  'payment_request',
  'other',
])

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body || String(body.company || '').trim()) {
    return NextResponse.json({ error: 'Invalid report.' }, { status: 400 })
  }

  const listingId = String(body.listingId || '').trim()
  const category = String(body.category || 'misleading_listing').trim()
  const details = String(body.details || '').trim()
  const contactEmail = String(body.contactEmail || '').trim()

  if (!uuidPattern.test(listingId)) {
    return NextResponse.json({ error: 'Invalid listing.' }, { status: 400 })
  }

  if (!allowedCategories.has(category) || details.length < 10 || details.length > 5000) {
    return NextResponse.json({ error: 'Add a valid category and description.' }, { status: 400 })
  }

  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('id,title,status,reference_number,listing_number')
    .eq('id', listingId)
    .eq('status', 'published')
    .maybeSingle()

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  const reference = listing.reference_number || listing.listing_number
  const { error } = await admin.from('marketplace_reports').insert({
    listing_id: listingId,
    category,
    details,
    contact_email: contactEmail || null,
    transaction_reference: reference ? String(reference) : null,
  })

  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ success: true })
}
