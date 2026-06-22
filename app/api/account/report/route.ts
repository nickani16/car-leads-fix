import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to submit a report.' }, { status: 401 })
  const body = (await request.json()) as Record<string, unknown>
  const details = String(body.details || '').trim()
  const amount = Number(body.amount || 0)
  const allowed = ['suspected_fraud','misleading_listing','unsafe_product','harassment','identity_misuse','payment_request','other']
  const category = String(body.category || 'other')
  if (!allowed.includes(category) || details.length < 10) {
    return NextResponse.json({ error: 'Add a category and clear description.' }, { status: 400 })
  }
  const admin = createAdminClient()
  const { error } = await admin.from('marketplace_reports').insert({
    reporter_user_id: user.id,
    listing_id: body.listingId || null,
    conversation_id: body.conversationId || null,
    category,
    details,
    contact_email: user.email,
    contact_phone: String(body.contactPhone || '').trim() || null,
    transaction_reference: String(body.transactionReference || '').trim() || null,
    counterparty_name: String(body.counterpartyName || '').trim() || null,
    occurred_at: String(body.occurredAt || '').trim() || null,
    amount: Number.isFinite(amount) && amount > 0 ? amount : null,
    currency: String(body.currency || '').trim().toUpperCase() || null,
  })
  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ success: true })
}
