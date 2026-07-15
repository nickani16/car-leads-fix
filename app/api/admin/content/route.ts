import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

const postTypes = new Set(['news', 'blog', 'buying_guide', 'selling_guide', 'category_copy', 'campaign', 'help_article'])

export async function POST(request: Request) {
  const auth = await requireAdminRoute('content.manage')
  if ('error' in auth) return auth.error
  const body = (await request.json()) as Record<string, unknown>
  const title = String(body.title || '').trim()
  const slug = String(body.slug || '').trim().toLowerCase()
  const postType = String(body.post_type || '')
  const market = String(body.market || '').trim().toUpperCase()
  const language = String(body.language || '').trim().toLowerCase()
  const contentText = String(body.content_text || '').trim().slice(0, 50000)
  const heroMediaId = String(body.hero_media_id || '').trim() || null
  if (title.length < 3 || title.length > 160) return NextResponse.json({ error: 'Titeln måste vara 3–160 tecken.' }, { status: 400 })
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: 'URL-sluggen får bara innehålla små bokstäver, siffror och bindestreck.' }, { status: 400 })
  if (!postTypes.has(postType)) return NextResponse.json({ error: 'Ogiltig innehållstyp.' }, { status: 400 })
  if (!/^[A-Z]{2}$/.test(market) || !/^[a-z]{2}(?:-[a-z]{2})?$/.test(language)) {
    return NextResponse.json({ error: 'Ogiltig marknad eller språkkod.' }, { status: 400 })
  }
  const record = {
    title,
    slug,
    post_type: postType,
    market,
    language,
    status: 'draft',
    author_user_id: auth.user.id,
    hero_media_id: heroMediaId,
    body: contentText ? { type: 'doc', content: [{ type: 'paragraph', text: contentText }] } : {},
  }
  const { data, error } = await auth.adminClient.from('content_posts').insert(record).select('id').single()
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'Sluggen används redan på marknaden och språket.' : error.message }, { status: 400 })
  if (heroMediaId) {
    const { error: mediaError } = await auth.adminClient.from('content_post_media').insert({ post_id: data.id, media_id: heroMediaId, usage_type: 'hero' })
    if (mediaError) {
      await auth.adminClient.from('content_posts').delete().eq('id', data.id)
      return NextResponse.json({ error: 'Den valda bilden kunde inte kopplas till artikeln.' }, { status: 400 })
    }
    const { data: media } = await auth.adminClient.from('media_assets').select('usage_count').eq('id', heroMediaId).maybeSingle()
    await auth.adminClient.from('media_assets').update({ usage_count: Number(media?.usage_count || 0) + 1 }).eq('id', heroMediaId)
  }
  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'content.manage',
    action: 'content_draft_created',
    targetType: 'content_post',
    targetId: data.id,
    afterData: record,
  })
  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
