import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

export async function POST(request: Request) {
  const auth = await requireAdminRoute('newsletters.manage')
  if ('error' in auth) return auth.error
  const body = (await request.json()) as Record<string, unknown>
  const sourceArticleId = String(body.source_article_id || '').trim()
  const { data: sourceArticle } = sourceArticleId
    ? await auth.adminClient.from('content_posts').select('id,title,slug,excerpt,body,market,language,hero_media_id').eq('id', sourceArticleId).maybeSingle()
    : { data: null }
  if (sourceArticleId && !sourceArticle) return NextResponse.json({ error: 'Artikeln hittades inte.' }, { status: 404 })
  const name = String(body.name || sourceArticle?.title || '').trim()
  const subject = String(body.subject || sourceArticle?.title || '').trim()
  const market = String(body.market || '').trim().toUpperCase()
  const language = String(body.language || '').trim().toLowerCase()
  const sourceBody = sourceArticle?.body && typeof sourceArticle.body === 'object' ? JSON.stringify(sourceArticle.body) : ''
  const contentText = String(body.content_text || sourceBody).trim().slice(0, 50000)
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
    slug: `${slugify(name)}-${Date.now().toString(36)}`,
    created_by: auth.user.id,
    content: contentText ? { type: 'text', value: contentText } : {},
    introduction: sourceArticle?.excerpt || null,
    items: sourceArticle ? [{ type: 'article', id: sourceArticle.id, slug: sourceArticle.slug, title: sourceArticle.title, hero_media_id: sourceArticle.hero_media_id }] : [],
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

function slugify(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'newsletter'
}
