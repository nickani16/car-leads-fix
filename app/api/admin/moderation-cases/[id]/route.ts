import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

const statuses: Record<string, string> = {
  awaiting_information: 'awaiting_information',
  action_taken: 'action_taken',
  close: 'closed',
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute('moderation.manage')
  if ('error' in auth) return auth.error
  const { id } = await context.params
  const body = (await request.json()) as { action?: string; reason?: string }
  const action = String(body.action || '')
  const status = statuses[action]
  const reason = String(body.reason || '').trim()
  if (!status) return NextResponse.json({ error: 'Ogiltig åtgärd.' }, { status: 400 })
  if (reason.length < 8) return NextResponse.json({ error: 'Ange en intern anledning på minst 8 tecken.' }, { status: 400 })
  const { data: before } = await auth.adminClient.from('moderation_cases').select('*').eq('id', id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Ärendet hittades inte.' }, { status: 404 })
  if (before.status === 'closed') return NextResponse.json({ error: 'Stängda ärenden är låsta.' }, { status: 409 })
  const now = new Date().toISOString()
  const patch = { status, updated_at: now, closed_at: status === 'closed' ? now : null }
  const { error } = await auth.adminClient.from('moderation_cases').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await auth.adminClient.from('moderation_actions').insert({
    case_id: id,
    actor_user_id: auth.user.id,
    action,
    reason,
    before_data: before,
    after_data: { ...before, ...patch },
  })
  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'moderation.manage',
    action: `moderation_case_${action}`,
    targetType: 'moderation_case',
    targetId: id,
    reason,
    beforeData: before,
    afterData: { ...before, ...patch },
  })
  return NextResponse.json({ success: true })
}
