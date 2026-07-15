import 'server-only'
import { Resend } from 'resend'

const recipients = ['nikolai.parkkila@hotmail.com', 'nikolai.parkkila@outlook.com']

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
