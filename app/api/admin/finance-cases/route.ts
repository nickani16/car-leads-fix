import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

const caseTypes = new Set([
  'payment_review',
  'refund_request',
  'compensation_credit',
  'subscription_adjustment',
  'webhook_review',
])
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  const auth = await requireAdminRoute('payments.manage')
  if ('error' in auth) return auth.error
  const body = (await request.json()) as Record<string, unknown>
  const caseType = String(body.case_type || '')
  const reason = String(body.reason || '').trim()
  const paymentOrderId = String(body.payment_order_id || '').trim()
  const amountRaw = String(body.amount_minor || '').trim()
  const amountMinor = amountRaw ? Number(amountRaw) : null
  const currency = String(body.currency || '').trim().toLowerCase() || null

  if (!caseTypes.has(caseType)) return NextResponse.json({ error: 'Ogiltig ärendetyp.' }, { status: 400 })
  if (reason.length < 8) return NextResponse.json({ error: 'Ange en intern anledning på minst 8 tecken.' }, { status: 400 })
  if (paymentOrderId && !uuidPattern.test(paymentOrderId)) return NextResponse.json({ error: 'Ogiltigt betalnings-ID.' }, { status: 400 })
  if (amountMinor !== null && (!Number.isSafeInteger(amountMinor) || amountMinor < 0)) {
    return NextResponse.json({ error: 'Beloppet måste vara ett positivt heltal i minsta valutaenhet.' }, { status: 400 })
  }
  if (currency && !/^[a-z]{3}$/.test(currency)) return NextResponse.json({ error: 'Ogiltig valuta.' }, { status: 400 })

  if (paymentOrderId) {
    const { data: order } = await auth.adminClient.from('payment_orders').select('id').eq('id', paymentOrderId).maybeSingle()
    if (!order) return NextResponse.json({ error: 'Betalningen hittades inte.' }, { status: 404 })
  }
  const record = {
    payment_order_id: paymentOrderId || null,
    case_type: caseType,
    reason,
    amount_minor: amountMinor,
    currency,
    created_by: auth.user.id,
  }
  const { data, error } = await auth.adminClient.from('admin_finance_cases').insert(record).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'payments.manage',
    action: 'finance_case_created',
    targetType: 'admin_finance_case',
    targetId: data.id,
    reason,
    afterData: record,
  })
  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
