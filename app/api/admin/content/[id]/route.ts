import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

const transitions: Record<string, string> = {
  review: 'review',
  publish: 'published',
  archive: 'archived',
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute('content.manage')
  if ('error' in auth) return auth.error
  const { id } = await context.params
  const body = (await request.json()) as { action?: string; reason?: string }
  const action = String(body.action || '')
  const status = transitions[action]
  const reason = String(body.reason || '').trim()
  if (!status) return NextResponse.json({ error: 'Ogiltig åtgärd.' }, { status: 400 })
  if ((action === 'publish' || action === 'archive') && reason.length < 8) {
    return NextResponse.json({ error: 'Ange en intern anledning på minst 8 tecken.' }, { status: 400 })
  }

  const { data: before } = await auth.adminClient.from('content_posts').select('*').eq('id', id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Innehållet hittades inte.' }, { status: 404 })
  if (action === 'review' && before.status !== 'draft') {
    return NextResponse.json({ error: 'Endast utkast kan skickas till granskning.' }, { status: 409 })
  }
  if (action === 'publish' && before.status !== 'review') {
    return NextResponse.json({ error: 'Innehållet måste vara granskat före publicering.' }, { status: 409 })
  }
  if (action === 'publish' && (!before.body || Object.keys(before.body as object).length === 0)) {
    return NextResponse.json({ error: 'Innehållet saknar brödtext.' }, { status: 409 })
  }
  const now = new Date().toISOString()
  const patch = {
    status,
    updated_at: now,
    published_at: action === 'publish' ? now : before.published_at,
  }
  const { error } = await auth.adminClient.from('content_posts').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'content.manage',
    action: `content_${action}`,
    targetType: 'content_post',
    targetId: id,
    reason: reason || null,
    beforeData: before,
    afterData: { ...before, ...patch },
  })
  return NextResponse.json({ success: true })
}
