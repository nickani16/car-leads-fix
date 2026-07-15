import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const MAX_SAVED_SEARCHES = 80
const SAVED_SEARCH_SELECT =
  'id,name,href,locale,market_code,filters,notification_frequency,last_notified_at,last_notified_listing_id,created_at,updated_at'
const NOTIFICATION_FREQUENCIES = new Set(['off', 'daily', 'instant'])
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function jsonResponse(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

function cleanText(value: unknown, fallback = '') {
  const text = typeof value === 'string' ? value.trim() : ''
  return text ? text.slice(0, 240) : fallback
}

function cleanHref(value: unknown) {
  const href = cleanText(value, '/marketplace')
  return href.startsWith('/') ? href : '/marketplace'
}

function cleanNotificationFrequency(value: unknown) {
  const frequency = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return NOTIFICATION_FREQUENCIES.has(frequency) ? frequency : 'off'
}

function normalizeForFingerprint(value: unknown): unknown {
  if (Array.isArray(value)) {
    const normalized = value.map(normalizeForFingerprint)
    if (normalized.every((entry) => entry === null || ['boolean', 'number', 'string'].includes(typeof entry))) {
      return [...normalized].sort((left, right) => String(left).localeCompare(String(right)))
    }
    return normalized
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined && entry !== '')
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, normalizeForFingerprint(entry)]),
    )
  }
  return value
}

function savedSearchFingerprint(filters: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(normalizeForFingerprint(filters)))
    .digest('hex')
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await createAdminClient()
    .from('marketplace_saved_searches')
    .select(SAVED_SEARCH_SELECT)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(MAX_SAVED_SEARCHES)

  if (error) {
    return jsonResponse({ error: 'Could not load saved searches' }, { status: 500 })
  }

  return jsonResponse({ searches: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as {
    name?: unknown
    href?: unknown
    locale?: unknown
    marketCode?: unknown
    filters?: unknown
    notificationFrequency?: unknown
  }
  const filters = body.filters && typeof body.filters === 'object' ? body.filters : {}
  const searchKey = savedSearchFingerprint(filters)
  const now = new Date().toISOString()
  const admin = createAdminClient()
  const { data: existing, error: existingError } = await admin
    .from('marketplace_saved_searches')
    .select(SAVED_SEARCH_SELECT)
    .eq('user_id', user.id)
    .eq('search_key', searchKey)
    .maybeSingle()

  if (existingError) {
    return jsonResponse({ error: 'Could not save search' }, { status: 500 })
  }

  if (existing) {
    return jsonResponse({ search: existing, duplicate: true })
  }

  const row = {
    user_id: user.id,
    name: cleanText(body.name, 'Sparad sökning'),
    href: cleanHref(body.href),
    locale: cleanText(body.locale, 'sv'),
    market_code: cleanText(body.marketCode) || null,
    filters,
    notification_frequency: cleanNotificationFrequency(body.notificationFrequency),
    search_key: searchKey,
    created_at: now,
    updated_at: now,
  }

  const { data, error } = await admin
    .from('marketplace_saved_searches')
    .insert(row)
    .select(SAVED_SEARCH_SELECT)
    .single()

  if (error) {
    if (error.code === '23505') {
      const { data: duplicate } = await admin
        .from('marketplace_saved_searches')
        .select(SAVED_SEARCH_SELECT)
        .eq('user_id', user.id)
        .eq('search_key', searchKey)
        .maybeSingle()

      if (duplicate) {
        return jsonResponse({ search: duplicate, duplicate: true })
      }
    }
    return jsonResponse({ error: 'Could not save search' }, { status: 500 })
  }

  return jsonResponse({ search: data })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as {
    id?: unknown
    notificationFrequency?: unknown
  }
  const id = typeof body.id === 'string' ? body.id : ''
  if (!UUID_PATTERN.test(id)) {
    return jsonResponse({ error: 'Invalid search id' }, { status: 400 })
  }

  const { data, error } = await createAdminClient()
    .from('marketplace_saved_searches')
    .update({
      notification_frequency: cleanNotificationFrequency(body.notificationFrequency),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('id', id)
    .select(SAVED_SEARCH_SELECT)
    .maybeSingle()

  if (error) {
    return jsonResponse({ error: 'Could not update saved search' }, { status: 500 })
  }
  if (!data) {
    return jsonResponse({ error: 'Saved search not found' }, { status: 404 })
  }

  return jsonResponse({ search: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id') || ''
  if (!UUID_PATTERN.test(id)) {
    return jsonResponse({ error: 'Invalid search id' }, { status: 400 })
  }

  const { error } = await createAdminClient()
    .from('marketplace_saved_searches')
    .delete()
    .eq('user_id', user.id)
    .eq('id', id)

  if (error) {
    return jsonResponse({ error: 'Could not delete saved search' }, { status: 500 })
  }

  return jsonResponse({ deleted: true, id })
}
