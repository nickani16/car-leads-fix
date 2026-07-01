import { NextResponse } from 'next/server'
import {
  requireSuperAdminRoute,
  writeAdminAuditLog,
} from '@/lib/admin-route-auth'

const statuses = new Set([
  'new',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed',
])

const supportCaseAuditSelect = `
  id,
  status,
  subject,
  message,
  contact_email,
  contact_phone,
  linked_user_id,
  listing_id,
  internal_notes,
  reviewed_by,
  reviewed_at,
  created_at,
  updated_at
`

export async function PATCH(
  request: Request,
  context: RouteContext<'/api/admin/support/[id]'>,
) {
  const auth = await requireSuperAdminRoute()
  if ('error' in auth) return auth.error

  const { id } = await context.params
  const body = (await request.json()) as { action?: string; reason?: string }
  const status = String(body.action || '')
  if (!statuses.has(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  const { adminClient, user } = auth
  const { data: before, error: beforeError } = await adminClient
    .from('admin_support_cases')
    .select(supportCaseAuditSelect)
    .eq('id', id)
    .maybeSingle()

  if (beforeError || !before) {
    return NextResponse.json({ error: 'Support case not found.' }, { status: 404 })
  }

  const patch = {
    status,
    updated_at: new Date().toISOString(),
  }
  const { error } = await adminClient
    .from('admin_support_cases')
    .update(patch)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await writeAdminAuditLog({
    adminClient,
    actorUserId: user.id,
    action: `support_case_${status}`,
    targetType: 'admin_support_case',
    targetId: id,
    reason: body.reason || null,
    beforeData: before,
    afterData: { ...before, ...patch },
  })

  return NextResponse.json({ success: true })
}
