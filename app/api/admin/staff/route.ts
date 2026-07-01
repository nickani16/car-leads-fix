import { NextResponse } from 'next/server'
import {
  requireSuperAdminRoute,
  writeAdminAuditLog,
} from '@/lib/admin-route-auth'
import {
  isStrongPassword,
  PASSWORD_REQUIREMENTS,
} from '@/lib/password-policy'

const allowedRoles = new Set(['sales', 'operations', 'support', 'legal'])
const usernamePattern = /^[a-z0-9._-]{3,32}$/i

export async function POST(request: Request) {
  const auth = await requireSuperAdminRoute()
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
  const password = body.password || ''
  const role = body.role || ''

  if (
    !displayName ||
    !email.includes('@') ||
    !usernamePattern.test(username) ||
    !isStrongPassword(password) ||
    !allowedRoles.has(role)
  ) {
    return NextResponse.json(
      {
        error:
          `Name, valid email, username and role are required. Password: ${PASSWORD_REQUIREMENTS}`,
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
    await auth.adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { portal_role: role },
    })

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || 'The account could not be created.' },
      { status: 400 }
    )
  }

  const staffUser = {
    user_id: created.user.id,
    role,
    display_name: displayName,
    email,
    username,
    is_active: true,
    must_change_password: true,
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
    action: 'staff_account_created',
    targetType: 'staff_user',
    targetId: created.user.id,
    afterData: { ...staffUser, temporary_password: '[redacted]' },
  })

  return NextResponse.json({ success: true, userId: created.user.id })
}
