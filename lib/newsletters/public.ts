import 'server-only'
import { createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getPublicNewsletters(market: string) {
  const admin = createAdminClient()
  const { data } = await admin.from('newsletter_campaigns')
    .select('id,slug,name,subject,preview_text,introduction,content,market,language,public_at,sent_at')
    .eq('market', market.toUpperCase()).eq('status', 'sent').not('public_at', 'is', null)
    .order('public_at', { ascending: false }).limit(100)
  return data || []
}

export async function getNewsletter(market: string, slug: string, previewToken?: string) {
  const admin = createAdminClient()
  let campaignId = ''
  if (previewToken) {
    const tokenHash = createHash('sha256').update(previewToken).digest('hex')
    const { data: token } = await admin.from('newsletter_preview_tokens').select('campaign_id')
      .eq('token_hash', tokenHash).is('consumed_at', null).gt('expires_at', new Date().toISOString()).maybeSingle()
    campaignId = String(token?.campaign_id || '')
  }
  let query = admin.from('newsletter_campaigns').select('*').eq('market', market.toUpperCase()).eq('slug', slug)
  query = campaignId ? query.eq('id', campaignId) : query.eq('status', 'sent').not('public_at', 'is', null)
  const { data } = await query.maybeSingle()
  return data ? { campaign: data, preview: Boolean(campaignId) } : null
}

export function newsletterText(content: unknown) {
  if (!content || typeof content !== 'object') return ''
  const record = content as Record<string, unknown>
  return String(record.value || record.text || '')
}
