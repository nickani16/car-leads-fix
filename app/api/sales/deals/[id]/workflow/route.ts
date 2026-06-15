import { NextResponse } from 'next/server'
import { requireSalesRoute } from '@/lib/sales-route-auth'

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

  const auth = await requireSalesRoute()
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
  if (actionDueAt && Number.isNaN(new Date(actionDueAt).getTime())) {
    return NextResponse.json({ error: 'Invalid deadline.' }, { status: 400 })
  }

  if (assignedSalesUserId) {
    const { data: assignee } = await auth.adminClient
      .from('staff_users')
      .select('user_id')
      .eq('user_id', assignedSalesUserId)
      .eq('role', 'sales')
      .eq('is_active', true)
      .maybeSingle()
    if (!assignee) {
      return NextResponse.json(
        { error: 'Sales user is not active.' },
        { status: 400 }
      )
    }
  }

  const { data: deal, error } = await auth.adminClient
    .from('deals')
    .update({
      assigned_sales_user_id: assignedSalesUserId,
      assigned_at: assignedSalesUserId ? new Date().toISOString() : null,
      action_due_at: actionDueAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error || !deal) {
    return NextResponse.json(
      { error: error?.message || 'Deal was not found.' },
      { status: 400 }
    )
  }

  await auth.adminClient.from('contract_events').insert({
    deal_id: id,
    actor_user_id: auth.user.id,
    actor_role: 'sales',
    event_type: 'workflow_updated',
    summary: 'Sales responsibility or deadline updated',
    metadata: {
      assigned_sales_user_id: assignedSalesUserId,
      action_due_at: actionDueAt,
    },
  })

  return NextResponse.json({ success: true })
}
