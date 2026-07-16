import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

const postTypes = new Set(['news', 'blog', 'buying_guide', 'selling_guide', 'category_copy', 'campaign', 'help_article'])
const headingLevels = new Set([1, 2, 3, 4, 5, 6])

type ContentBlock = {
  type: 'paragraph' | 'heading'
  level?: number
  text: string
  bold?: boolean
}

export async function POST(request: Request) {
  const auth = await requireAdminRoute('content.manage')
  if ('error' in auth) return auth.error
  const body = (await request.json()) as Record<string, unknown>
  const title = String(body.title || '').trim()
  const slug = String(body.slug || '').trim().toLowerCase()
  const postType = String(body.post_type || '')
  const market = String(body.market || '').trim().toUpperCase()
  const language = String(body.language || '').trim().toLowerCase()
  const excerpt = String(body.excerpt || '').trim().slice(0, 320)
  const contentBlocks = parseContentBlocks(body.content_blocks)
  const contentText = contentBlocks.length
    ? contentBlocks.map((block) => block.text).join('\n\n')
    : String(body.content_text || '').trim().slice(0, 50000)
  const contentBody = contentBlocks.length
    ? { type: 'doc', content: contentBlocks }
    : contentText
      ? { type: 'doc', content: [{ type: 'paragraph', text: contentText }] }
      : {}
  const heroMediaId = String(body.hero_media_id || '').trim() || null
  const tags = parseTags(body.tags)
  const seoTitle = String(body.seo_title || title).trim().slice(0, 160)
  const metaDescription = String(body.meta_description || excerpt).trim().slice(0, 320)

  if (title.length < 3 || title.length > 160) return NextResponse.json({ error: 'Titeln måste vara 3-160 tecken.' }, { status: 400 })
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: 'URL-sluggen får bara innehålla små bokstäver, siffror och bindestreck.' }, { status: 400 })
  if (!postTypes.has(postType)) return NextResponse.json({ error: 'Ogiltig innehållstyp.' }, { status: 400 })
  if (!/^[A-Z]{2}$/.test(market) || !/^[a-z]{2}(?:-[a-z]{2})?$/.test(language)) {
    return NextResponse.json({ error: 'Ogiltig marknad eller språkkod.' }, { status: 400 })
  }
  if (postType === 'news' && excerpt.length < 20) return NextResponse.json({ error: 'Fordonsnyheten behöver en kort beskrivning på minst 20 tecken.' }, { status: 400 })
  if (contentText.length < 20) return NextResponse.json({ error: 'Fordonsnyheten behöver artikeltext på minst 20 tecken.' }, { status: 400 })

  const record = {
    title,
    slug,
    post_type: postType,
    market,
    language,
    status: 'draft',
    excerpt: excerpt || null,
    author_user_id: auth.user.id,
    hero_media_id: heroMediaId,
    body: contentBody,
    reading_time_minutes: estimateReadingTime(contentText),
    tags,
    seo_title: seoTitle || null,
    meta_description: metaDescription || null,
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

  await auth.adminClient.from('content_post_versions').insert({
    post_id: data.id,
    version: 1,
    snapshot: record,
    created_by: auth.user.id,
    change_reason: 'Initial fordonsnyhetsutkast',
  })
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

function parseContentBlocks(value: unknown): ContentBlock[] {
  const raw = typeof value === 'string' ? safeJson(value) : value
  if (!Array.isArray(raw)) return []
  return raw
    .map((item): ContentBlock | null => {
      if (!item || typeof item !== 'object') return null
      const block = item as Record<string, unknown>
      const type = block.type === 'heading' ? 'heading' : 'paragraph'
      const level = headingLevels.has(Number(block.level)) ? Number(block.level) : 2
      const text = String(block.text || '').trim().replace(/\s+/g, ' ').slice(0, 8000)
      if (!text) return null
      return { type, level, text, bold: Boolean(block.bold) }
    })
    .filter((block): block is ContentBlock => Boolean(block))
    .slice(0, 80)
}

function safeJson(value: string) {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

function parseTags(value: unknown) {
  return String(value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12)
}

function estimateReadingTime(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.min(240, Math.max(1, Math.ceil(words / 220)))
}
