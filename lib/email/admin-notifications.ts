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

export async function sendBusinessApprovalEmail({
  email,
  locale,
  companyName,
}: {
  email: string | null
  locale: string | null
  companyName: string
}) {
  if (!email) return { delivered: false, reason: 'missing_recipient' as const }
  const language = String(locale || '').toLowerCase().slice(0, 2)
  const copy = language === 'sv'
    ? { subject: 'Ditt Autorell-företagskonto har godkänts', intro: 'Ditt företag har verifierats och godkänts av Autorell.', cta: 'Välj abonnemang' }
    : language === 'de'
      ? { subject: 'Ihr Autorell-Geschäftskonto wurde genehmigt', intro: 'Ihr Unternehmen wurde von Autorell verifiziert und genehmigt.', cta: 'Tarif auswählen' }
      : language === 'es'
        ? { subject: 'Tu cuenta de empresa de Autorell ha sido aprobada', intro: 'Autorell ha verificado y aprobado tu empresa.', cta: 'Elegir plan' }
        : { subject: 'Your Autorell business account has been approved', intro: 'Your company has been verified and approved by Autorell.', cta: 'Choose your plan' }
  const localeValue = String(locale || '').toLowerCase()
  const localeLanguage = localeValue.slice(0, 2)
  const localeCountry = localeValue.split(/[-_]/)[1]?.toUpperCase()
  const country = ['SE', 'DE', 'ES', 'FR', 'IT', 'NL', 'BE', 'AT', 'DK', 'PL', 'FI'].includes(localeCountry || '')
    ? localeCountry!.toLowerCase()
    : ({ sv: 'se', de: 'de', es: 'es', fr: 'fr', it: 'it', nl: 'nl', da: 'dk', pl: 'pl', fi: 'fi' }[localeLanguage] || 'se')
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[business-approval-email] skipped: RESEND_API_KEY missing', { email, language })
    return { delivered: false, reason: 'missing_provider_key' as const }
  }
  const url = `https://www.autorell.com/${country}/account/business/subscription`
  const { data, error } = await new Resend(apiKey).emails.send({
    from: process.env.AUTORELL_EMAIL_FROM || 'Autorell <onboarding@resend.dev>',
    to: [email],
    subject: copy.subject,
    text: `${copy.intro}\n\n${companyName}\n\n${copy.cta}: ${url}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:32px"><h1 style="color:#101828">${escapeHtml(copy.subject)}</h1><p style="color:#475467;line-height:1.7">${escapeHtml(copy.intro)}</p><p style="color:#475467">${escapeHtml(companyName)}</p><p><a href="${escapeHtml(url)}" style="display:inline-block;background:#0866ff;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">${escapeHtml(copy.cta)}</a></p></div>`,
  })
  if (error) {
    console.error('[business-approval-email] provider error', { email, language, message: error.message })
    return { delivered: false, reason: error.message }
  }
  console.info('[business-approval-email] sent', { email, language, providerMessageId: data?.id || null })
  return { delivered: true, providerMessageId: data?.id || null, language }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character)
}
