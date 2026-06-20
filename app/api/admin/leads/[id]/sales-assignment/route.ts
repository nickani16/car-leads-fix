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
    return NextResponse.json({ error: 'Invalid lead.' }, { status: 400 })
  }

  const auth = await requireSuperAdminRoute()
  if ('error' in auth) return auth.error

  const body = (await request.json().catch(() => ({}))) as {
    assignedSalesUserId?: string | null
  }
  const assignedSalesUserId = body.assignedSalesUserId || null

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
    .from('leads')
    .select('id,listing_plan,managed_sale_requested,assigned_sales_user_id')
    .eq('id', id)
    .maybeSingle()

  if (!before) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
  }

  if (before.listing_plan !== 'managed_sale') {
    return NextResponse.json(
      { error: 'Sales assignment is only available for Managed Sale.' },
      { status: 409 }
    )
  }

  const { data: after, error } = await auth.adminClient
    .from('leads')
    .update({ assigned_sales_user_id: assignedSalesUserId })
    .eq('id', id)
    .select('id,listing_plan,managed_sale_requested,assigned_sales_user_id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    action: 'managed_sale_assignment_updated',
    targetType: 'lead',
    targetId: id,
    beforeData: before,
    afterData: after,
  })

  return NextResponse.json({ success: true })
}
