import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'
import { requireBusinessListingEntitlement } from '@/lib/billing/business-entitlement'

export async function POST(request: Request, context: RouteContext<'/api/account/listings/[id]/refresh'>) {
  const { id } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const limit = checkRateLimit({
    key: `refresh-listing:${user.id}:${id}:${getClientIp(request)}`,
    limit: 4,
    windowMs: 60 * 60 * 1000,
  })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  const admin = createAdminClient()
  const { data: listing, error: listingError } = await admin
    .from('marketplace_listings')
    .select('id,seller_user_id,status,seller_type')
    .eq('id', id)
    .maybeSingle()
  if (listingError) {
    return NextResponse.json({ error: 'Could not verify listing.' }, { status: 500 })
  }
  if (!listing || listing.seller_user_id !== user.id) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }
  if (listing.seller_type === 'business') {
    const entitlement = await requireBusinessListingEntitlement(user.id)
    if (!entitlement.allowed) {
      return NextResponse.json({ error: entitlement.code, code: entitlement.code, redirectTo: '/account/business/subscription' }, { status: 403 })
    }
  }
  if (listing.status !== 'published') {
    return NextResponse.json({ error: 'Only published listings can be refreshed.' }, { status: 400 })
  }

  const { error } = await admin.rpc('use_refresh_credit', {
    p_owner_type: 'user',
    p_owner_id: user.id,
    p_listing_id: id,
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
