import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

type EmailKind =
  | 'welcome'
  | 'invoice_ready'
  | 'payment_receipt'
  | 'payment_failed'
  | 'invoice_reminder'
  | 'account_blocked'

type BusinessBillingEmailInput = {
  deliveryKey: string
  kind: EmailKind
  userId: string
  subscriptionId?: string | null
  invoiceId?: string | null
  planKey?: string | null
  activeListingLimit?: number | null
  amountMinor?: number | null
  currency?: string | null
  invoiceNumber?: string | null
  invoiceUrl?: string | null
  pdfUrl?: string | null
  dueAt?: string | null
  daysLeft?: 1 | 2
}

type BusinessRecipient = {
  email: string
  companyName: string
}

const planLabels: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

export async function sendBusinessBillingEmail(
  admin: SupabaseClient,
  input: BusinessBillingEmailInput,
) {
  const recipient = await getBusinessRecipient(admin, input.userId)
  if (!recipient) return { delivered: false, reason: 'missing_recipient' as const }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    await recordEmailDelivery(admin, input, recipient.email, 'skipped', null, 'RESEND_API_KEY_MISSING')
    return { delivered: false, reason: 'missing_provider_key' as const }
  }

  const reserved = await reserveEmailDelivery(admin, input, recipient.email)
  if (!reserved) return { delivered: false, reason: 'duplicate' as const }

  const message = buildBusinessBillingMessage(input, recipient)
  const { data, error } = await new Resend(apiKey).emails.send(
    {
      from: process.env.AUTORELL_EMAIL_FROM || 'Autorell <noreply@autorell.com>',
      to: recipient.email,
      subject: message.subject,
      text: message.text,
      html: message.html,
    },
    {
      headers: {
        'Idempotency-Key': input.deliveryKey,
      },
    },
  )

  if (error) {
    await recordEmailDelivery(admin, input, recipient.email, 'failed', null, error.message)
    console.error('[business-billing-email] delivery failed', {
      kind: input.kind,
      deliveryKey: input.deliveryKey,
      userId: input.userId,
      message: error.message,
    })
    return { delivered: false, reason: error.message }
  }

  await recordEmailDelivery(admin, input, recipient.email, 'sent', data?.id || null, null)
  return { delivered: true, providerMessageId: data?.id || null }
}

async function getBusinessRecipient(admin: SupabaseClient, userId: string): Promise<BusinessRecipient | null> {
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('email,company_name,display_name')
    .eq('user_id', userId)
    .maybeSingle()

  const email = String(profile?.email || '').trim()
  if (!email || !email.includes('@')) return null
  return {
    email,
    companyName: String(profile?.company_name || profile?.display_name || 'företaget'),
  }
}

async function reserveEmailDelivery(admin: SupabaseClient, input: BusinessBillingEmailInput, recipientEmail: string) {
  const { error } = await admin.from('business_email_deliveries').insert({
    delivery_key: input.deliveryKey,
    user_id: input.userId,
    subscription_id: input.subscriptionId || null,
    invoice_id: input.invoiceId || null,
    email_type: input.kind,
    recipient_email: recipientEmail,
    status: 'processing',
    metadata: emailMetadata(input),
  })

  if (!error) return true
  const duplicate = error.code === '23505' || error.message?.toLowerCase().includes('duplicate')
  if (duplicate) return false
  throw error
}

async function recordEmailDelivery(
  admin: SupabaseClient,
  input: BusinessBillingEmailInput,
  recipientEmail: string,
  status: 'sent' | 'failed' | 'skipped',
  providerMessageId: string | null,
  errorMessage: string | null,
) {
  await admin.from('business_email_deliveries').upsert({
    delivery_key: input.deliveryKey,
    user_id: input.userId,
    subscription_id: input.subscriptionId || null,
    invoice_id: input.invoiceId || null,
    email_type: input.kind,
    recipient_email: recipientEmail,
    status,
    provider_message_id: providerMessageId,
    error_message: errorMessage,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
    metadata: emailMetadata(input),
  }, { onConflict: 'delivery_key' })
}

function emailMetadata(input: BusinessBillingEmailInput) {
  return {
    plan_key: input.planKey || null,
    invoice_number: input.invoiceNumber || null,
    days_left: input.daysLeft || null,
  }
}

function buildBusinessBillingMessage(input: BusinessBillingEmailInput, recipient: BusinessRecipient) {
  const plan = planLabels[String(input.planKey || '').toLowerCase()] || 'företagspaket'
  const limit = input.activeListingLimit ? `${input.activeListingLimit} aktiva annonser` : 'din annonskvot'
  const amount = formatMoney(input.amountMinor, input.currency)
  const due = input.dueAt ? formatDate(input.dueAt) : null
  const invoiceLine = input.invoiceNumber ? `Faktura ${input.invoiceNumber}` : 'Din faktura'
  const invoiceUrl = input.invoiceUrl || input.pdfUrl || 'https://www.autorell.se/konto/betalningar'
  const paymentsUrl = 'https://www.autorell.se/konto/betalningar'

  const copy = (() => {
    switch (input.kind) {
      case 'welcome':
        return {
          subject: `Välkommen till Autorell ${plan}`,
          preview: `Företagspaketet ${plan} är aktiverat för ${recipient.companyName}.`,
          title: `Välkommen till Autorell ${plan}`,
          body: `Ditt företagspaket är aktiverat. Ni har ${limit} och kan hantera annonser, betalningar och abonnemang från Mina sidor.`,
          cta: 'Öppna Mina sidor',
          url: 'https://www.autorell.se/konto',
        }
      case 'invoice_ready':
        return {
          subject: `${invoiceLine} från Autorell är redo`,
          preview: due ? `${amount} förfaller ${due}.` : `${amount} att betala.`,
          title: `${invoiceLine} är redo`,
          body: due
            ? `Fakturan för ${plan} är skapad. Beloppet är ${amount} och förfaller ${due}. Betala via länken nedan eller enligt betalningsinstruktionerna på fakturan.`
            : `Fakturan för ${plan} är skapad. Beloppet är ${amount}. Betala via länken nedan eller enligt betalningsinstruktionerna på fakturan.`,
          cta: 'Öppna fakturan',
          url: invoiceUrl,
        }
      case 'payment_receipt':
        return {
          subject: `Betalning mottagen för ${plan}`,
          preview: `${amount} är betalt. Här är kvittot/fakturan.`,
          title: 'Betalningen är genomförd',
          body: `Vi har tagit emot betalningen för ${plan}. Kontot är aktivt och kvittot/fakturan finns via länken nedan.`,
          cta: 'Visa kvitto',
          url: invoiceUrl,
        }
      case 'payment_failed':
        return {
          subject: `Betalningen för ${plan} gick inte igenom`,
          preview: 'Uppdatera betalningen för att undvika spärr.',
          title: 'Betalningen gick inte igenom',
          body: `Vi kunde inte registrera betalningen för ${plan}. Öppna betalningssidan och betala fakturan eller uppdatera betalningsmetoden för att undvika att kontot spärras.`,
          cta: 'Öppna betalningar',
          url: paymentsUrl,
        }
      case 'invoice_reminder':
        return {
          subject: `${input.daysLeft} dag${input.daysLeft === 1 ? '' : 'ar'} kvar att betala Autorell-fakturan`,
          preview: due ? `${invoiceLine} förfaller ${due}.` : `${invoiceLine} förfaller snart.`,
          title: `${input.daysLeft} dag${input.daysLeft === 1 ? '' : 'ar'} kvar`,
          body: due
            ? `${invoiceLine} för ${plan} förfaller ${due}. Betala i tid för att behålla tillgången till företagspaketet.`
            : `${invoiceLine} för ${plan} förfaller snart. Betala i tid för att behålla tillgången till företagspaketet.`,
          cta: 'Betala fakturan',
          url: invoiceUrl,
        }
      case 'account_blocked':
        return {
          subject: 'Autorell-företagskontot är spärrat tills betalning är mottagen',
          preview: 'Kontot öppnas igen när den förfallna fakturan är betald.',
          title: 'Kontot är spärrat',
          body: `Fakturan för ${plan} är förfallen. Företagskontot är spärrat tills betalningen är mottagen. Öppna betalningssidan eller fakturan för att betala.`,
          cta: 'Betala nu',
          url: invoiceUrl,
        }
    }
  })()

  return {
    subject: copy.subject,
    text: `${copy.title}\n\n${copy.body}\n\n${copy.cta}: ${copy.url}\n\nAutorell`,
    html: renderEmailHtml(copy.preview, copy.title, copy.body, copy.cta, copy.url, recipient.companyName),
  }
}

function renderEmailHtml(preview: string, title: string, body: string, cta: string, url: string, companyName: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#f6f8fb;font-family:Arial,sans-serif;color:#101828"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preview)}</div><div style="max-width:640px;margin:0 auto;padding:36px 18px"><div style="background:#fff;border:1px solid #d9e2ef;border-radius:14px;padding:32px"><p style="margin:0 0 18px;color:#0866ff;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Autorell för företag</p><h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#101828">${escapeHtml(title)}</h1><p style="margin:0 0 18px;color:#475467;font-size:15px;line-height:1.7">${escapeHtml(body)}</p><p style="margin:0 0 26px;color:#667085;font-size:13px">Företag: ${escapeHtml(companyName)}</p><a href="${escapeHtml(url)}" style="display:inline-block;background:#0866ff;color:#fff;padding:13px 18px;border-radius:8px;text-decoration:none;font-weight:700">${escapeHtml(cta)}</a></div><p style="margin:18px 4px 0;color:#98a2b3;font-size:12px;line-height:1.6">Det här är ett automatiskt transaktionsmejl från Autorell.</p></div></body></html>`
}

function formatMoney(amountMinor?: number | null, currency?: string | null) {
  const amount = Number(amountMinor || 0) / 100
  const code = String(currency || 'sek').toUpperCase()
  return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: code }).format(amount)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium' }).format(new Date(value))
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character)
}
