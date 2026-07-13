import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

const transitions: Record<string, string> = { review: 'review', cancel: 'cancelled' }

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute('newsletters.manage')
  if ('error' in auth) return auth.error
  const { id } = await context.params
  const body = (await request.json()) as { action?: string; reason?: string }
  const action = String(body.action || '')
  const status = transitions[action]
  const reason = String(body.reason || '').trim()
  if (!status) return NextResponse.json({ error: 'Ogiltig åtgärd.' }, { status: 400 })
  if (action === 'cancel' && reason.length < 8) {
    return NextResponse.json({ error: 'Ange en intern anledning på minst 8 tecken.' }, { status: 400 })
  }

  const { data: before } = await auth.adminClient.from('newsletter_campaigns').select('*').eq('id', id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Kampanjen hittades inte.' }, { status: 404 })
  if (['sending', 'sent'].includes(String(before.status))) {
    return NextResponse.json({ error: 'Påbörjade eller skickade kampanjer är låsta.' }, { status: 409 })
  }
  if (action === 'review' && before.status !== 'draft') {
    return NextResponse.json({ error: 'Endast utkast kan skickas till granskning.' }, { status: 409 })
  }
  const patch = { status, updated_at: new Date().toISOString() }
  const { error } = await auth.adminClient.from('newsletter_campaigns').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'newsletters.manage',
    action: `newsletter_${action}`,
    targetType: 'newsletter_campaign',
    targetId: id,
    reason: reason || null,
    beforeData: before,
    afterData: { ...before, ...patch },
  })
  return NextResponse.json({ success: true })
}
