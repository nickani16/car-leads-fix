import { NextResponse } from 'next/server'
import {
  requireAdminRoute,
  writeAdminAuditLog,
} from '@/lib/admin-route-auth'

const allowedRoles = new Set(['sales', 'operations', 'support', 'legal'])
const usernamePattern = /^[a-z0-9._-]{3,32}$/i

export async function POST(request: Request) {
  const auth = await requireAdminRoute('administrators.manage')
  if ('error' in auth) return auth.error

  const body = (await request.json().catch(() => ({}))) as {
    displayName?: string
    email?: string
    username?: string
    password?: string
    role?: string
  }
  const displayName = body.displayName?.trim() || ''
  const email = body.email?.trim().toLowerCase() || ''
  const username = body.username?.trim().toLowerCase() || ''
  const role = body.role || ''

  if (body.password) {
    return NextResponse.json(
      { error: 'Administratörer får inte sätta användarlösenord. Kontot skapas via en säker e-postinbjudan.' },
      { status: 400 },
    )
  }

  if (
    !displayName ||
    !email.includes('@') ||
    !usernamePattern.test(username) ||
    !allowedRoles.has(role)
  ) {
    return NextResponse.json(
      {
        error:
          'Name, valid email, username and role are required.',
      },
      { status: 400 }
    )
  }

  const { data: existingUsername } = await auth.adminClient
    .from('staff_users')
    .select('user_id')
    .ilike('username', username)
    .maybeSingle()

  if (existingUsername) {
    return NextResponse.json(
      { error: 'That username is already in use.' },
      { status: 409 }
    )
  }

  const { data: created, error: createError } =
    await auth.adminClient.auth.admin.inviteUserByEmail(email, {
      data: { display_name: displayName },
    })

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || 'The account could not be created.' },
      { status: 400 }
    )
  }

  const { error: metadataError } = await auth.adminClient.auth.admin.updateUserById(
    created.user.id,
    { app_metadata: { portal_role: role } },
  )
  if (metadataError) {
    await auth.adminClient.auth.admin.deleteUser(created.user.id)
    return NextResponse.json({ error: metadataError.message }, { status: 400 })
  }

  const staffUser = {
    user_id: created.user.id,
    role,
    display_name: displayName,
    email,
    username,
    is_active: true,
    must_change_password: false,
    updated_at: new Date().toISOString(),
  }
  const { error: profileError } = await auth.adminClient
    .from('staff_users')
    .insert(staffUser)

  if (profileError) {
    await auth.adminClient.auth.admin.deleteUser(created.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'administrators.manage',
    action: 'staff_account_created',
    targetType: 'staff_user',
    targetId: created.user.id,
    afterData: { ...staffUser, invitation: 'email' },
  })

  return NextResponse.json({ success: true, userId: created.user.id })
}
