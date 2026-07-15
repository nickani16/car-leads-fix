import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

const statuses = new Set(['under_review', 'more_information_required', 'approved', 'rejected'])

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute('companies.verify')
  if ('error' in auth) return auth.error
  const { id } = await context.params
  const body = (await request.json()) as { action?: string; reason?: string }
  const status = String(body.action || '')
  const reason = String(body.reason || '').trim()
  if (!statuses.has(status)) return NextResponse.json({ error: 'Ogiltig åtgärd.' }, { status: 400 })
  if (status !== 'under_review' && reason.length < 8) {
    return NextResponse.json({ error: 'Ange en intern anledning på minst 8 tecken.' }, { status: 400 })
  }
  const { data: before } = await auth.adminClient.from('business_verification_requests').select('*').eq('id', id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Verifieringen hittades inte.' }, { status: 404 })
  if (['approved', 'rejected', 'revoked'].includes(String(before.status))) {
    return NextResponse.json({ error: 'Slutbehandlade verifieringar är låsta.' }, { status: 409 })
  }
  const decided = ['approved', 'rejected'].includes(status)
  const patch = {
    status,
    assigned_to: before.assigned_to || auth.user.id,
    decided_by: decided ? auth.user.id : null,
    decision_reason: reason || null,
    decided_at: decided ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }
  const { error } = await auth.adminClient.from('business_verification_requests').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await auth.adminClient.from('business_verification_events').insert({
    request_id: id,
    actor_user_id: auth.user.id,
    event_type: `status_${status}`,
    from_status: before.status,
    to_status: status,
    reason: reason || null,
  })
  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'companies.verify',
    action: `business_verification_${status}`,
    targetType: 'business_verification_request',
    targetId: id,
    reason: reason || null,
    beforeData: before,
    afterData: { ...before, ...patch },
  })
  return NextResponse.json({ success: true })
}
