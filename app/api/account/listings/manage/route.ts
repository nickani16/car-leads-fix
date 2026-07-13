import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  getManagedListings,
  parseAccountListingFilters,
} from '@/lib/account-listings-management'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const limit = checkRateLimit({
    key: `manage-listings:${user.id}:${getClientIp(request)}`,
    limit: 120,
    windowMs: 10 * 60 * 1000,
  })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('account_type')
    .eq('user_id', user.id)
    .maybeSingle()
  const filters = parseAccountListingFilters(new URL(request.url).searchParams, profile?.account_type)

  try {
    const result = await getManagedListings(admin, user.id, filters)
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.error('[manage-listings] Query failed', { userId: user.id, error })
    return NextResponse.json({ error: 'Annonserna kunde inte hämtas.' }, { status: 500 })
  }
}
