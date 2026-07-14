import 'server-only'
import { Resend } from 'resend'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function sendAdminNotificationEmail({
  admin, notificationType, title, body, actionUrl, origin,
}: {
  admin: SupabaseClient
  notificationType: string
  title: string
  body: string
  actionUrl: string
  origin: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { sent: 0, skipped: 'RESEND_API_KEY_MISSING' as const }
  const { data: preferences } = await admin
    .from('admin_notification_preferences')
    .select('recipient_email')
    .eq('notification_type', notificationType)
    .eq('email_enabled', true)
    .not('recipient_email', 'is', null)
  const configured = (process.env.ADMIN_NOTIFICATION_EMAILS || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)
  const recipients = [...new Set([...(preferences || []).map((item) => String(item.recipient_email || '').toLowerCase()), ...configured])].filter((email) => email.includes('@'))
  if (!recipients.length) return { sent: 0, skipped: 'NO_RECIPIENTS' as const }
  const url = new URL(actionUrl, origin).toString()
  const { error } = await new Resend(apiKey).emails.send({
    from: 'Autorell Admin <noreply@autorell.com>',
    to: recipients,
    subject: title,
    text: `${title}\n\n${body}\n\nÖppna i Admin Control Center: ${url}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:32px"><h1 style="color:#101828">${escapeHtml(title)}</h1><p style="color:#475467;line-height:1.7">${escapeHtml(body)}</p><p><a href="${escapeHtml(url)}" style="display:inline-block;background:#0866ff;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">Öppna i Admin Control Center</a></p></div>`,
  })
  if (error) throw error
  return { sent: recipients.length }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character)
}
