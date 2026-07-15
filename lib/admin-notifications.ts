import 'server-only'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const recipients = ['nikolai.parkkila@hotmail.com', 'nikolai.parkkila@outlook.com']

export async function createBusinessApplicationNotifications(input: {
  companyId: string
  companyName: string
  countryCode: string
  contactName: string
  email: string
  registrationNumber: string | null
}) {
  const admin = createAdminClient()
  const actionUrl = `https://www.autorell.com/admin/companies/${input.companyId}`
  const { error } = await admin.from('notifications').insert(
    recipients.map((recipientEmail) => ({
      recipient_email: recipientEmail,
      audience: 'admin',
      event_type: 'business_application_submitted',
      title: `Ny företagsansökan: ${input.companyName}`,
      body: `${input.companyName} (${input.countryCode}) · ${input.contactName} · ${input.email} · ${input.registrationNumber}`,
      channels: ['in_app', 'email'],
      status: 'pending',
      attempts: 0,
      available_at: new Date().toISOString(),
      action_url: actionUrl,
      dedupe_key: `business-application:${input.companyId}:${recipientEmail}`,
    })),
  )
  if (error) console.error('[business-application-notification] failed', { companyId: input.companyId, message: error.message })
  return { ok: !error, actionUrl }
}

export async function notifyAutorellAdmins(subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('Admin notification skipped: RESEND_API_KEY is not configured')
    return
  }
  const resend = new Resend(key)
  const from = process.env.AUTORELL_EMAIL_FROM || 'Autorell <onboarding@resend.dev>'
  const { error } = await resend.emails.send({ from, to: recipients, subject, html })
  if (error) console.error('Admin notification failed', { message: error.message })
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
  const url = `https://www.autorell.com/${country}/account/business/subscription`
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[business-approval-email] skipped: RESEND_API_KEY missing', { email, language })
    return { delivered: false, reason: 'missing_provider_key' as const }
  }
  const resend = new Resend(key)
  const { data, error } = await resend.emails.send({
    from: process.env.AUTORELL_EMAIL_FROM || 'Autorell <onboarding@resend.dev>',
    to: [email],
    subject: copy.subject,
    html: `<p>${copy.intro}</p><p>${companyName}</p><p><a href="${url}">${copy.cta}</a></p>`,
  })
  if (error) {
    console.error('[business-approval-email] provider error', { email, language, message: error.message })
    return { delivered: false, reason: error.message }
  }
  console.info('[business-approval-email] sent', { email, language, providerMessageId: data?.id || null })
  return { delivered: true, providerMessageId: data?.id || null, language }
}
