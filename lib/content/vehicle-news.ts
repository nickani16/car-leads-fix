import 'server-only'

import { createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export type PublicNewsCategory = {
  id: string
  key: string
  label: string
}

export type PublicNewsArticle = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: Record<string, unknown>
  author: string
  publishedAt: string
  updatedAt: string
  readingTime: number
  category: PublicNewsCategory | null
  tags: string[]
  imageUrl: string | null
  imageAlt: string
  imageCaption: string | null
  seoTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  viewCount: number
  relatedPostIds: string[]
}

function languageForMarket(market: string) {
  const normalized = market.toLowerCase()
  if (normalized === 'se') return 'sv'
  if (normalized === 'de' || normalized === 'at') return 'de'
  if (normalized === 'fr') return 'fr'
  if (normalized === 'es') return 'es'
  if (normalized === 'pl') return 'pl'
  if (normalized === 'it') return 'it'
  if (normalized === 'nl' || normalized === 'be') return 'nl'
  if (normalized === 'fi') return 'fi'
  if (normalized === 'dk') return 'da'
  return 'en'
}

function localizedCategory(translations: unknown, language: string, fallback: string) {
  if (!translations || typeof translations !== 'object') return fallback
  const values = translations as Record<string, unknown>
  return String(values[language] || values.en || fallback)
}

function mapArticle(row: Record<string, unknown>, media: Record<string, unknown> | null): PublicNewsArticle {
  const categoryRow = row.content_categories as Record<string, unknown> | null
  const category = categoryRow ? {
    id: String(categoryRow.id),
    key: String(categoryRow.category_key),
    label: localizedCategory(categoryRow.translations, String(row.language), String(categoryRow.category_key)),
  } : null
  const variants = media?.variants && typeof media.variants === 'object'
    ? media.variants as Record<string, { url?: string } | undefined>
    : {}
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt || ''),
    body: row.body && typeof row.body === 'object' ? row.body as Record<string, unknown> : {},
    author: String(row.author_name || 'Autorell Redaktion'),
    publishedAt: String(row.published_at),
    updatedAt: String(row.updated_at),
    readingTime: Number(row.reading_time_minutes || 1),
    category,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    imageUrl: variants.article?.url || variants.list?.url || String(media?.public_url || '') || null,
    imageAlt: String(media?.alt_text || row.title),
    imageCaption: media?.caption ? String(media.caption) : null,
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    metaDescription: row.meta_description ? String(row.meta_description) : null,
    canonicalUrl: row.canonical_url ? String(row.canonical_url) : null,
    viewCount: Number(row.view_count || 0),
    relatedPostIds: Array.isArray(row.related_post_ids) ? row.related_post_ids.map(String) : [],
  }
}

const publicSelect = 'id,slug,title,excerpt,body,language,market,author_name,published_at,updated_at,reading_time_minutes,tags,seo_title,meta_description,canonical_url,view_count,related_post_ids,hero_media_id,content_categories(id,category_key,translations)'

export async function getVehicleNews(market: string, page = 1, pageSize = 12) {
  const admin = createAdminClient()
  const language = languageForMarket(market)
  const from = Math.max(0, page - 1) * pageSize
  const { data, count, error } = await admin
    .from('content_posts')
    .select(publicSelect, { count: 'exact' })
    .eq('post_type', 'news')
    .eq('status', 'published')
    .eq('market', market.toUpperCase())
    .eq('language', language)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) return { articles: [] as PublicNewsArticle[], categories: [] as PublicNewsCategory[], count: 0, unavailable: true }
  const rows = (data || []) as unknown as Record<string, unknown>[]
  const mediaIds = rows.map((row) => String(row.hero_media_id || '')).filter(Boolean)
  const { data: mediaRows } = mediaIds.length
    ? await admin.from('media_assets').select('id,public_url,variants,alt_text,caption').in('id', mediaIds)
    : { data: [] }
  const mediaById = new Map((mediaRows || []).map((item) => [String(item.id), item as Record<string, unknown>]))
  const { data: categoryRows } = await admin
    .from('content_categories')
    .select('id,category_key,translations')
    .eq('is_active', true)
    .order('sort_order')

  return {
    articles: rows.map((row) => mapArticle(row, mediaById.get(String(row.hero_media_id)) || null)),
    categories: ((categoryRows || []) as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      key: String(row.category_key),
      label: localizedCategory(row.translations, language, String(row.category_key)),
    })),
    count: count || 0,
    unavailable: false,
  }
}

export async function getVehicleNewsArticle(market: string, slug: string, previewToken?: string) {
  const admin = createAdminClient()
  const language = languageForMarket(market)
  let previewPostId = ''
  if (previewToken) {
    const tokenHash = createHash('sha256').update(previewToken).digest('hex')
    const { data: token } = await admin
      .from('content_preview_tokens')
      .select('post_id')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()
    previewPostId = String(token?.post_id || '')
  }

  let query = admin.from('content_posts').select(publicSelect).eq('slug', slug).eq('market', market.toUpperCase()).eq('language', language)
  query = previewPostId
    ? query.eq('id', previewPostId)
    : query.eq('status', 'published').lte('published_at', new Date().toISOString())
  const { data: row, error } = await query.maybeSingle()
  if (error || !row) return null
  const typedRow = row as unknown as Record<string, unknown>
  const { data: media } = typedRow.hero_media_id
    ? await admin.from('media_assets').select('id,public_url,variants,alt_text,caption').eq('id', String(typedRow.hero_media_id)).maybeSingle()
    : { data: null }
  return { article: mapArticle(typedRow, media as Record<string, unknown> | null), preview: Boolean(previewPostId) }
}

export function articleBodyText(body: Record<string, unknown>) {
  const content = Array.isArray(body.content) ? body.content : []
  return content.map((block) => {
    if (!block || typeof block !== 'object') return ''
    const value = block as Record<string, unknown>
    return typeof value.text === 'string' ? value.text : ''
  }).filter(Boolean)
}
