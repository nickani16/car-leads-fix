import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  requireSuperAdminRoute,
  writeAdminAuditLog,
} from '@/lib/admin-route-auth'

const allowedStatuses = new Set(['approved', 'pending', 'rejected'])

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  }

  const body = (await request.json()) as { status?: string }
  if (!body.status || !allowedStatuses.has(body.status)) {
    return NextResponse.json({ error: 'Invalid dealer status.' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('dealers')
    .update({ status: body.status })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireSuperAdminRoute()
  if ('error' in auth) return auth.error
  const body = (await request.json().catch(() => ({}))) as { reason?: string }
  const reason = body.reason?.trim() || ''

  if (reason.length < 8) {
    return NextResponse.json(
      { error: 'Enter a reason of at least 8 characters.' },
      { status: 400 }
    )
  }

  const { data: dealer } = await auth.adminClient
    .from('dealers')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (!dealer) {
    return NextResponse.json({ error: 'Dealer not found.' }, { status: 404 })
  }

  const { count: dealCount } = await auth.adminClient
    .from('deals')
    .select('id', { count: 'exact', head: true })
    .eq('buyer_dealer_id', id)
  if (dealCount) {
    return NextResponse.json(
      {
        error:
          'This account has transaction history and cannot be deleted. Suspend it instead so contracts and accounting remain intact.',
      },
      { status: 409 }
    )
  }

  const { error } = await auth.adminClient.auth.admin.deleteUser(dealer.user_id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    action: 'dealer_account_deleted',
    targetType: 'dealer',
    targetId: id,
    reason,
    beforeData: dealer,
  })

  return NextResponse.json({ success: true })
}
