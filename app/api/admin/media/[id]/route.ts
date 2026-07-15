import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute('media.manage')
  if ('error' in auth) return auth.error
  const { id } = await context.params
  const body = (await request.json()) as { action?: string; reason?: string }
  const reason = String(body.reason || '').trim()
  if (body.action !== 'archive') return NextResponse.json({ error: 'Ogiltig åtgärd.' }, { status: 400 })
  if (reason.length < 8) return NextResponse.json({ error: 'Ange en intern anledning på minst 8 tecken.' }, { status: 400 })
  const { data: before } = await auth.adminClient.from('media_assets').select('*').eq('id', id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Mediafilen hittades inte.' }, { status: 404 })
  if (Number(before.usage_count || 0) > 0) return NextResponse.json({ error: 'Mediafilen används och kan inte arkiveras.' }, { status: 409 })
  const patch = { status: 'archived', updated_at: new Date().toISOString() }
  const { error } = await auth.adminClient.from('media_assets').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'media.manage',
    action: 'media_archived',
    targetType: 'media_asset',
    targetId: id,
    reason,
    beforeData: before,
    afterData: { ...before, ...patch },
  })
  return NextResponse.json({ success: true })
}
