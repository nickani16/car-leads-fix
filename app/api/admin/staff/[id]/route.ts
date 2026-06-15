import { NextResponse } from 'next/server'
import {
  requireSuperAdminRoute,
  writeAdminAuditLog,
} from '@/lib/admin-route-auth'
import {
  isStrongPassword,
  PASSWORD_REQUIREMENTS,
} from '@/lib/password-policy'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: 'Invalid user.' }, { status: 400 })
  }

  const auth = await requireSuperAdminRoute()
  if ('error' in auth) return auth.error

  const body = (await request.json().catch(() => ({}))) as {
    isActive?: boolean
    password?: string
  }
  const { data: before } = await auth.adminClient
    .from('staff_users')
    .select('*')
    .eq('user_id', id)
    .maybeSingle()

  if (!before) {
    return NextResponse.json({ error: 'Staff account not found.' }, { status: 404 })
  }

  if (typeof body.isActive === 'boolean') {
    const { error } = await auth.adminClient
      .from('staff_users')
      .update({
        is_active: body.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }

  if (body.password) {
    if (!isStrongPassword(body.password)) {
      return NextResponse.json(
        { error: PASSWORD_REQUIREMENTS },
        { status: 400 }
      )
    }
    const { error } = await auth.adminClient.auth.admin.updateUserById(id, {
      password: body.password,
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    await auth.adminClient
      .from('staff_users')
      .update({
        must_change_password: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', id)
  }

  const { data: after } = await auth.adminClient
    .from('staff_users')
    .select('*')
    .eq('user_id', id)
    .maybeSingle()

  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    action: body.password ? 'staff_password_reset' : 'staff_account_updated',
    targetType: 'staff_user',
    targetId: id,
    beforeData: before,
    afterData: after,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: 'Invalid user.' }, { status: 400 })
  }

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

  const { data: before } = await auth.adminClient
    .from('staff_users')
    .select('*')
    .eq('user_id', id)
    .maybeSingle()
  if (!before) {
    return NextResponse.json({ error: 'Staff account not found.' }, { status: 404 })
  }

  const { error: profileError } = await auth.adminClient
    .from('staff_users')
    .delete()
    .eq('user_id', id)
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  const { error: authError } = await auth.adminClient.auth.admin.deleteUser(id)
  if (authError) {
    await auth.adminClient.from('staff_users').insert(before)
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    action: 'staff_account_deleted',
    targetType: 'staff_user',
    targetId: id,
    reason,
    beforeData: before,
  })

  return NextResponse.json({ success: true })
}
