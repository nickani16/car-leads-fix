import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute('newsletters.manage')
  if ('error' in auth) return auth.error
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'RESEND_API_KEY saknas.' }, { status: 503 })
  const { id } = await params
  const recipient = String(((await request.json()) as { recipient?: string }).recipient || '').trim().toLowerCase()
  if (!emailPattern.test(recipient)) return NextResponse.json({ error: 'Ogiltig mottagaradress.' }, { status: 400 })
  const [{ data: campaign }, { data: subscriber }] = await Promise.all([
    auth.adminClient.from('newsletter_campaigns').select('*').eq('id', id).maybeSingle(),
    auth.adminClient.from('newsletter_subscribers').select('id,status').ilike('email', recipient).eq('status', 'subscribed').maybeSingle(),
  ])
  if (!campaign) return NextResponse.json({ error: 'Kampanjen hittades inte.' }, { status: 404 })
  if (!subscriber) return NextResponse.json({ error: 'Testmottagaren måste vara en aktiv prenumerant så unsubscribe kan verifieras korrekt.' }, { status: 409 })
  const slug = campaign.slug || `campaign-${id}`
  if (!campaign.slug) await auth.adminClient.from('newsletter_campaigns').update({ slug }).eq('id', id)
  const previewToken = randomBytes(32).toString('base64url')
  const unsubscribeToken = randomBytes(32).toString('base64url')
  await auth.adminClient.from('newsletter_preview_tokens').insert({ campaign_id: id, token_hash: createHash('sha256').update(previewToken).digest('hex'), recipient_email: recipient, created_by: auth.user.id, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
  await auth.adminClient.from('newsletter_subscribers').update({ unsubscribe_token_hash: createHash('sha256').update(unsubscribeToken).digest('hex'), updated_at: new Date().toISOString() }).eq('id', subscriber.id)
  const origin = new URL(request.url).origin
  const market = String(campaign.market).toLowerCase()
  const webUrl = `${origin}/${market}/newsletters/${slug}?preview=${previewToken}`
  const unsubscribeUrl = `${origin}/${market}/newsletters/unsubscribe?token=${unsubscribeToken}`
  const content = String((campaign.content as { value?: string } | null)?.value || campaign.introduction || '')
  const { data: delivery, error: sendError } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: 'Autorell Nyhetsbrev <noreply@autorell.com>', to: recipient, subject: `[TEST] ${campaign.subject}`,
    text: `${campaign.subject}\n\n${content}\n\nWebbversion: ${webUrl}\nAvsluta prenumeration: ${unsubscribeUrl}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;padding:32px"><div style="color:#0866ff;font-weight:700">TESTUTSKICK – publiceras inte</div><h1>${escapeHtml(String(campaign.subject))}</h1><p style="line-height:1.7">${escapeHtml(content)}</p><p><a href="${webUrl}">Öppna webbversion</a></p><hr/><p style="font-size:12px"><a href="${unsubscribeUrl}">Avsluta prenumeration</a></p></div>`,
  })
  await auth.adminClient.from('newsletter_deliveries').insert({ campaign_id: id, subscriber_id: subscriber.id, recipient_email: recipient, is_test: true, status: sendError ? 'failed' : 'sent', provider_message_id: delivery?.id || null, error_code: sendError ? 'RESEND_SEND_FAILED' : null })
  if (sendError) return NextResponse.json({ error: sendError.message }, { status: 502 })
  const now = new Date().toISOString()
  await auth.adminClient.from('newsletter_campaigns').update({ last_test_sent_at: now }).eq('id', id)
  await writeAdminAuditLog({ adminClient: auth.adminClient, actorUserId: auth.user.id, actorRole: auth.primaryRole, permission: 'newsletters.manage', action: 'newsletter_test_sent', targetType: 'newsletter_campaign', targetId: id, afterData: { recipient, is_test: true, public: false } })
  return NextResponse.json({ success: true, webUrl })
}

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c) }
