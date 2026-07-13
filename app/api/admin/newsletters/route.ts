import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

export async function POST(request: Request) {
  const auth = await requireAdminRoute('newsletters.manage')
  if ('error' in auth) return auth.error
  const body = (await request.json()) as Record<string, unknown>
  const name = String(body.name || '').trim()
  const subject = String(body.subject || '').trim()
  const market = String(body.market || '').trim().toUpperCase()
  const language = String(body.language || '').trim().toLowerCase()
  const contentText = String(body.content_text || '').trim().slice(0, 50000)
  if (name.length < 3 || name.length > 160 || subject.length < 3 || subject.length > 180) {
    return NextResponse.json({ error: 'Namn och ämnesrad måste vara 3–180 tecken.' }, { status: 400 })
  }
  if (!/^[A-Z]{2}$/.test(market) || !/^[a-z]{2}(?:-[a-z]{2})?$/.test(language)) {
    return NextResponse.json({ error: 'Ogiltig marknad eller språkkod.' }, { status: 400 })
  }
  const record = {
    name,
    subject,
    market,
    language,
    status: 'draft',
    created_by: auth.user.id,
    content: contentText ? { type: 'text', value: contentText } : {},
  }
  const { data, error } = await auth.adminClient.from('newsletter_campaigns').insert(record).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'newsletters.manage',
    action: 'newsletter_draft_created',
    targetType: 'newsletter_campaign',
    targetId: data.id,
    afterData: record,
  })
  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
