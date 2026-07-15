import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute('dashboard.view')
  if ('error' in auth) return auth.error
  const { id } = await params
  const { action } = (await request.json()) as { action?: string }
  const now = new Date().toISOString()
  const patch = action === 'read' ? { status: 'read', read_at: now, updated_at: now }
    : action === 'assign' ? { status: 'assigned', assigned_to: auth.user.id, updated_at: now }
      : null
  if (!patch) return NextResponse.json({ error: 'Ogiltig åtgärd.' }, { status: 400 })
  const { error } = await auth.adminClient.from('admin_notifications').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await writeAdminAuditLog({ adminClient: auth.adminClient, actorUserId: auth.user.id, actorRole: auth.primaryRole, permission: 'dashboard.view', action: `notification_${action}`, targetType: 'admin_notification', targetId: id, afterData: patch })
  return NextResponse.json({ success: true })
}
