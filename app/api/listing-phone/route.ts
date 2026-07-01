import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const listingId = String(searchParams.get('listingId') || '').trim()

  if (!uuidPattern.test(listingId)) {
    return NextResponse.json({ error: 'Invalid listing.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('seller_user_id,seller_type,phone_visibility')
    .eq('id', listingId)
    .eq('status', 'published')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .maybeSingle()

  if (!listing?.seller_user_id) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  if (
    listing.seller_type !== 'business' &&
    (listing.phone_visibility || 'registered_only') !== 'public'
  ) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Sign in to view this phone number.', code: 'login_required' },
        { status: 401 },
      )
    }
  }

  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('phone')
    .eq('user_id', listing.seller_user_id)
    .maybeSingle()

  const phone = typeof profile?.phone === 'string' ? profile.phone.trim() : ''
  if (!phone) {
    return NextResponse.json({ error: 'Phone unavailable.' }, { status: 404 })
  }

  return NextResponse.json({ phone })
}
