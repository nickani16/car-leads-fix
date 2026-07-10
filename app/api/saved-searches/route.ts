import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const MAX_SAVED_SEARCHES = 80
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
    .select('id,name,href,locale,market_code,filters,created_at,updated_at')
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
  }
  const filters = body.filters && typeof body.filters === 'object' ? body.filters : {}
  const now = new Date().toISOString()
  const row = {
    user_id: user.id,
    name: cleanText(body.name, 'Sparad sökning'),
    href: cleanHref(body.href),
    locale: cleanText(body.locale, 'sv'),
    market_code: cleanText(body.marketCode) || null,
    filters,
    created_at: now,
    updated_at: now,
  }

  const { data, error } = await createAdminClient()
    .from('marketplace_saved_searches')
    .insert(row)
    .select('id,name,href,locale,market_code,filters,created_at,updated_at')
    .single()

  if (error) {
    return jsonResponse({ error: 'Could not save search' }, { status: 500 })
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
