import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

const allowedRoles = new Set([
  'operations_admin', 'moderator', 'support_admin', 'finance_admin',
  'content_editor', 'analyst',
])

export async function POST(request: Request) {
  const auth = await requireAdminRoute('administrators.manage')
  if ('error' in auth) return auth.error
  const body = (await request.json().catch(() => ({}))) as {
    displayName?: string
    email?: string
    role?: string
    password?: string
  }
  if (body.password) {
    return NextResponse.json({ error: 'Administratörer får inte sätta användarlösenord. Inloggning sker med e-postkod.' }, { status: 400 })
  }
  const displayName = String(body.displayName || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const role = String(body.role || '')
  if (displayName.length < 2 || !email.includes('@') || !allowedRoles.has(role)) {
    return NextResponse.json({ error: 'Namn, giltig e-post och en tillåten roll krävs.' }, { status: 400 })
  }

  const { data: pending } = await auth.adminClient
    .from('admin_staff_invitations')
    .select('id')
    .ilike('email', email)
    .eq('status', 'pending')
    .maybeSingle()
  if (pending) return NextResponse.json({ error: 'Det finns redan en aktiv inbjudan för adressen.' }, { status: 409 })

  // Supabase reuses an existing Auth identity when possible. A new identity receives
  // an email invitation; both existing and new users finish through Autorells OTP flow.
  const { data: users } = await auth.adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const existing = users?.users.find((user) => user.email?.toLowerCase() === email)
  if (!existing) {
    const { error: inviteError } = await auth.adminClient.auth.admin.inviteUserByEmail(email, {
      data: { display_name: displayName, autorell_staff_invitation: true },
    })
    if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 400 })
  }

  const rawToken = randomBytes(32).toString('base64url')
  const invitation = {
    email,
    display_name: displayName,
    role_key: role,
    token_hash: createHash('sha256').update(rawToken).digest('hex'),
    status: 'pending',
    invited_by: auth.user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
  const { data, error } = await auth.adminClient.from('admin_staff_invitations').insert(invitation).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'administrators.manage',
    action: 'staff_invitation_created',
    targetType: 'admin_staff_invitation',
    targetId: data.id,
    afterData: { email, display_name: displayName, role_key: role, expires_at: invitation.expires_at },
  })
  return NextResponse.json({ success: true, invitationId: data.id }, { status: 201 })
}
