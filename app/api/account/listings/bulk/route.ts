import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
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
    return NextResponse.json({ error: 'Välj annonser och en giltig åtgärd.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('account_type')
    .eq('user_id', user.id)
    .maybeSingle()
  if (profile?.account_type !== 'business') {
    return NextResponse.json({ error: 'Bulkhantering är endast tillgänglig för företagskonton.' }, { status: 403 })
  }

  const { data, error } = await admin.rpc('bulk_manage_owned_listings', {
    p_user_id: user.id,
    p_listing_ids: listingIds,
    p_action: action,
  })
  if (error) {
    console.warn('[bulk-listings] Transaction rejected', {
      userId: user.id,
      action,
      count: listingIds.length,
      error: error.message,
    })
    return NextResponse.json(
      { error: 'Alla valda annonser måste tillhöra kontot och tillåta åtgärden. Inga annonser ändrades.' },
      { status: 409 },
    )
  }

  revalidateTag('marketplace-listings', 'max')
  const updatedCount = Number((data as { updatedCount?: number } | null)?.updatedCount || listingIds.length)
  return NextResponse.json({ success: true, updatedCount })
}
