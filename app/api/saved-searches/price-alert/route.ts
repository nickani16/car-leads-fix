import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function jsonResponse(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return jsonResponse({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({})) as {
    id?: unknown
    enabled?: unknown
    thresholdPercent?: unknown
  }
  const id = typeof body.id === 'string' ? body.id : ''
  if (!UUID_PATTERN.test(id)) {
    return jsonResponse({ error: 'Invalid search id' }, { status: 400 })
  }

  const enabled = body.enabled === true
  const thresholdPercent = typeof body.thresholdPercent === 'number' && Number.isFinite(body.thresholdPercent)
    ? Math.max(1, Math.min(50, Math.round(body.thresholdPercent)))
    : 5

  const admin = createAdminClient()
  const { data: existing, error: loadError } = await admin
    .from('marketplace_saved_searches')
    .select('id,filters,notification_frequency')
    .eq('user_id', user.id)
    .eq('id', id)
    .maybeSingle()

  if (loadError) return jsonResponse({ error: 'Could not load saved search' }, { status: 500 })
  if (!existing) return jsonResponse({ error: 'Saved search not found' }, { status: 404 })

  const filters = existing.filters && typeof existing.filters === 'object' && !Array.isArray(existing.filters)
    ? existing.filters as Record<string, unknown>
    : {}
  const nextFilters = {
    ...filters,
    priceAlert: enabled ? { enabled: true, thresholdPercent } : { enabled: false },
  }

  const { data, error } = await admin
    .from('marketplace_saved_searches')
    .update({
      filters: nextFilters,
      notification_frequency: enabled ? 'daily' : existing.notification_frequency || 'off',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('id', id)
    .select('id,name,href,locale,market_code,filters,notification_frequency,last_notified_at,last_notified_listing_id,created_at,updated_at')
    .maybeSingle()

  if (error) return jsonResponse({ error: 'Could not update price alert' }, { status: 500 })
  return jsonResponse({ search: data })
}
