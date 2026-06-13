import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const allowedStatuses = new Set([
  'not_required',
  'needs_review',
  'settlement_requested',
  'settlement_received',
  'shortfall_required',
  'ready_to_settle',
  'released',
  'blocked',
])

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = (await request.json()) as {
    reviewStatus?: string
    settlementAmount?: string
    settlementValidUntil?: string
    releaseReference?: string
    notes?: string
  }
  const reviewStatus = body.reviewStatus?.trim()
  const settlementAmountText = body.settlementAmount?.trim() || ''
  const settlementAmount = settlementAmountText
    ? Number(settlementAmountText)
    : null

  if (
    !reviewStatus ||
    !allowedStatuses.has(reviewStatus) ||
    (settlementAmount !== null &&
      (!Number.isFinite(settlementAmount) || settlementAmount < 0))
  ) {
    return NextResponse.json(
      { error: 'Invalid finance review data.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const adminClient = createAdminClient()
  const { data: adminUser } = await adminClient
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  }

  const { error } = await adminClient
    .from('leads')
    .update({
      finance_review_status: reviewStatus,
      finance_settlement_amount: settlementAmount,
      finance_settlement_valid_until:
        body.settlementValidUntil?.trim() || null,
      finance_release_reference: body.releaseReference?.trim() || null,
      finance_admin_notes: body.notes?.trim() || null,
      finance_reviewed_at: new Date().toISOString(),
      finance_reviewed_by: user.id,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
