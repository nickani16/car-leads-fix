import { NextResponse } from 'next/server'
import {
  requireSuperAdminRoute,
  writeAdminAuditLog,
} from '@/lib/admin-route-auth'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: 'Invalid deal.' }, { status: 400 })
  }
  const auth = await requireSuperAdminRoute()
  if ('error' in auth) return auth.error
  const body = (await request.json().catch(() => ({}))) as {
    assignedSalesUserId?: string | null
    actionDueAt?: string | null
  }
  const assignedSalesUserId = body.assignedSalesUserId || null
  const actionDueAt = body.actionDueAt || null

  if (assignedSalesUserId && !uuidPattern.test(assignedSalesUserId)) {
    return NextResponse.json({ error: 'Invalid sales user.' }, { status: 400 })
  }
  if (assignedSalesUserId) {
    const { data: salesUser } = await auth.adminClient
      .from('staff_users')
      .select('user_id')
      .eq('user_id', assignedSalesUserId)
      .eq('role', 'sales')
      .eq('is_active', true)
      .maybeSingle()
    if (!salesUser) {
      return NextResponse.json(
        { error: 'The selected sales user is not active.' },
        { status: 400 }
      )
    }
  }

  const { data: before } = await auth.adminClient
    .from('deals')
    .select('id,assigned_sales_user_id,assigned_at,action_due_at')
    .eq('id', id)
    .maybeSingle()
  if (!before) {
    return NextResponse.json({ error: 'Deal not found.' }, { status: 404 })
  }

  const { data: after, error } = await auth.adminClient
    .from('deals')
    .update({
      assigned_sales_user_id: assignedSalesUserId,
      assigned_at: assignedSalesUserId ? new Date().toISOString() : null,
      action_due_at: actionDueAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id,assigned_sales_user_id,assigned_at,action_due_at')
    .single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    action: 'deal_assignment_updated',
    targetType: 'deal',
    targetId: id,
    beforeData: before,
    afterData: after,
  })
  return NextResponse.json({ success: true })
}
