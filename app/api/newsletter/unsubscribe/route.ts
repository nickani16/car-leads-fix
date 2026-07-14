import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const form = await request.formData(); const token = String(form.get('token') || ''); const market = String(form.get('market') || 'se').toLowerCase()
  const destination = new URL(`/${market}/newsletters/unsubscribe`, request.url)
  if (token.length < 32) { destination.searchParams.set('error', '1'); return NextResponse.redirect(destination, 303) }
  const admin = createAdminClient(); const now = new Date().toISOString()
  const { data, error } = await admin.from('newsletter_subscribers').update({ status: 'unsubscribed', unsubscribed_at: now, updated_at: now }).eq('unsubscribe_token_hash', createHash('sha256').update(token).digest('hex')).eq('status', 'subscribed').select('id').maybeSingle()
  destination.searchParams.set(error || !data ? 'error' : 'done', '1')
  return NextResponse.redirect(destination, 303)
}
