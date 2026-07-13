import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function cleanText(value: unknown, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function requestHost(request: Request) {
  return (
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    ''
  )
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase()
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    listingId?: string
    pageUrl?: string
  }
  const listingId = cleanText(body.listingId, 80)
  if (!listingId) return NextResponse.json({ error: 'Missing listing.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('id,seller_user_id,status')
    .eq('id', listingId)
    .maybeSingle()

  if (!listing || listing.status !== 'published') {
    return new NextResponse(null, { status: 204 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.id && user.id === listing.seller_user_id) {
    return new NextResponse(null, { status: 204 })
  }

  let pagePath = ''
  try {
    pagePath = new URL(cleanText(body.pageUrl) || request.url).pathname
  } catch {
    pagePath = ''
  }

  const { error } = await admin.from('marketplace_listing_events').insert({
    listing_id: listing.id,
    actor_user_id: user?.id || null,
    actor_role: 'system',
    event_type: 'listing_view',
    metadata: {
      viewer_type: user?.id ? 'authenticated' : 'anonymous',
      page_path: pagePath,
      market_domain: requestHost(request),
      country_code: cleanText(request.headers.get('x-vercel-ip-country'), 2).toUpperCase() || null,
    },
  })

  if (error) {
    console.error('Listing view tracking failed', error)
  }

  return new NextResponse(null, { status: 204 })
}
