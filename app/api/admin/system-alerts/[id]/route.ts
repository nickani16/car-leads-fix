import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute('system.manage')
  if ('error' in auth) return auth.error
  const { id } = await context.params
  const body = (await request.json()) as { action?: string; reason?: string }
  const action = String(body.action || '')
  const reason = String(body.reason || '').trim()
  if (!['acknowledge', 'resolve'].includes(action)) {
    return NextResponse.json({ error: 'Ogiltig åtgärd.' }, { status: 400 })
  }
  if (action === 'resolve' && reason.length < 8) {
    return NextResponse.json({ error: 'Ange en intern anledning på minst 8 tecken.' }, { status: 400 })
  }
  const { data: before } = await auth.adminClient.from('system_alerts').select('*').eq('id', id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Larmet hittades inte.' }, { status: 404 })
  const now = new Date().toISOString()
  const patch = action === 'resolve'
    ? { status: 'resolved', resolved_at: now }
    : { status: 'acknowledged', acknowledged_at: now, acknowledged_by: auth.user.id }
  const { error } = await auth.adminClient.from('system_alerts').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'system.manage',
    action: `system_alert_${action}`,
    targetType: 'system_alert',
    targetId: id,
    reason: reason || null,
    beforeData: before,
    afterData: { ...before, ...patch },
  })
  return NextResponse.json({ success: true })
}
