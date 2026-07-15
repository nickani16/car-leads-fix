import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { resolveBusinessAccountScope } from '@/lib/billing/business-account-scope'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const allowedActions = new Set(['pause', 'resume', 'mark_sold', 'delete'])

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const limit = checkRateLimit({
    key: `bulk-listings:${user.id}:${getClientIp(request)}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  const body = (await request.json().catch(() => ({}))) as { action?: string; listingIds?: unknown[] }
  const action = String(body.action || '')
  const listingIds = [...new Set(
    (body.listingIds || []).filter(
      (id): id is string => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id),
    ),
  )].slice(0, 100)
  if (!allowedActions.has(action) || !listingIds.length) {
    return NextResponse.json({ error: 'Choose listings and a valid action.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('account_type')
    .eq('user_id', user.id)
    .maybeSingle()
  if (profile?.account_type !== 'business') {
    return NextResponse.json({ error: 'Bulk management is only available for business accounts.' }, { status: 403 })
  }

  const scope = await resolveBusinessAccountScope(user.id, admin)
  const { data: selectedListings, error: selectedError } = await admin
    .from('marketplace_listings')
    .select('id,seller_user_id')
    .in('id', listingIds)
    .in('seller_user_id', scope.listingOwnerUserIds)
  if (selectedError) {
    return NextResponse.json({ error: 'Listings could not be verified.' }, { status: 500 })
  }
  if ((selectedListings || []).length !== listingIds.length) {
    return NextResponse.json(
      { error: 'All selected listings must belong to the company account. No listings were changed.' },
      { status: 409 },
    )
  }

  const idsByOwner = new Map<string, string[]>()
  for (const listing of selectedListings || []) {
    const ownerId = String(listing.seller_user_id)
    idsByOwner.set(ownerId, [...(idsByOwner.get(ownerId) || []), String(listing.id)])
  }

  let updatedCount = 0
  for (const [ownerId, ownerListingIds] of idsByOwner) {
    const { data, error } = await admin.rpc('bulk_manage_owned_listings', {
      p_user_id: ownerId,
      p_listing_ids: ownerListingIds,
      p_action: action,
    })
    if (error) {
      console.warn('[bulk-listings] Transaction rejected', {
        userId: user.id,
        ownerId,
        action,
        count: ownerListingIds.length,
        error: error.message,
      })
      return NextResponse.json(
        { error: 'All selected listings must belong to the company account and allow the action. No listings were changed.' },
        { status: 409 },
      )
    }
    updatedCount += Number((data as { updatedCount?: number } | null)?.updatedCount || ownerListingIds.length)
  }

  revalidateTag('marketplace-listings', 'max')
  return NextResponse.json({ success: true, updatedCount })
}
