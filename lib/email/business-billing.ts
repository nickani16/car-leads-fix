import 'server-only'

import crypto from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import {
  escapeEmailHtml,
  formatEmailDate,
  formatEmailMoney,
  localizedAccountUrl,
  resolveEmailLocale,
  type EmailLocale,
} from '@/lib/email/localization'

type EmailKind =
  | 'welcome'
  | 'invoice_ready'
  | 'payment_receipt'
  | 'payment_failed'
  | 'invoice_reminder'
  | 'account_blocked'
  | 'cancellation_scheduled'

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
  daysLeft?: number
  locale?: string | null
  market?: string | null
}

type BusinessRecipient = {
  email: string
  companyName: string
  locale: EmailLocale
}

type MessageCopy = {
  subject: string
  preview: string
  title: string
  body: string
  cta: string
  url: string
}

type BusinessBillingCopy = {
  openAccount: string
  openInvoice: string
  viewReceipt: string
  openPayments: string
  payInvoice: string
  payNow: string
  receiptTitle: string
  failedPreview: string
  failedTitle: string
  blockedSubject: string
  blockedPreview: string
  blockedTitle: string
  cancelTitle: string
  cancelPreview: string
  welcomeSubject: (plan: string) => string
  welcomePreview: (plan: string) => string
  welcomeTitle: (plan: string) => string
  welcomeBody: (limit: string) => string
  invoiceSubject: (line: string) => string
  invoicePreviewDue: (amount: string, due: string) => string
  invoicePreview: (amount: string) => string
  invoiceTitle: (line: string) => string
  invoiceBodyDue: (plan: string, amount: string, due: string) => string
  invoiceBody: (plan: string, amount: string) => string
  receiptSubject: (plan: string) => string
  receiptPreview: (amount: string) => string
  receiptBody: (plan: string) => string
  failedSubject: (plan: string) => string
  failedBody: (plan: string) => string
  reminderSubject: (days: number) => string
  reminderPreviewDue: (line: string, due: string) => string
  reminderPreview: (line: string) => string
  reminderTitle: (days: number) => string
  reminderBodyDue: (line: string, plan: string, due: string) => string
  reminderBody: (line: string, plan: string) => string
  blockedBody: (plan: string) => string
  cancelSubject: (plan: string) => string
  cancelPreviewDue: (date: string) => string
  cancelBodyDue: (plan: string, date: string) => string
  cancelBody: (plan: string) => string
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
  const recipients = await getBusinessBillingRecipients(admin, input.userId, input)
  if (!recipients.length) return { delivered: false, reason: 'missing_recipient' as const }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    for (const recipient of recipients) {
      await recordEmailDelivery(admin, inputForRecipient(input, recipient.email), recipient.email, 'skipped', null, 'RESEND_API_KEY_MISSING')
    }
    return { delivered: false, reason: 'missing_provider_key' as const }
  }

  const resend = new Resend(apiKey)
  let delivered = 0
  let duplicates = 0
  let lastReason: string | null = null

  for (const recipient of recipients) {
    const recipientInput = inputForRecipient(input, recipient.email)
    const reserved = await reserveEmailDelivery(admin, recipientInput, recipient.email)
    if (!reserved) {
      duplicates += 1
      continue
    }

    const message = buildBusinessBillingMessage(input, recipient)
    const { data, error } = await resend.emails.send(
      {
        from: process.env.AUTORELL_EMAIL_FROM || 'Autorell <noreply@autorell.com>',
        to: recipient.email,
        subject: message.subject,
        text: message.text,
        html: message.html,
      },
      { headers: { 'Idempotency-Key': recipientInput.deliveryKey } },
    )

    if (error) {
      await recordEmailDelivery(admin, recipientInput, recipient.email, 'failed', null, error.message)
      lastReason = error.message
      console.error('[business-billing-email] delivery failed', {
        kind: input.kind,
        deliveryKey: recipientInput.deliveryKey,
        userId: input.userId,
        recipient: recipient.email,
        message: error.message,
      })
      continue
    }

    await recordEmailDelivery(admin, recipientInput, recipient.email, 'sent', data?.id || null, null)
    delivered += 1
  }

  if (delivered > 0) return { delivered: true, deliveredCount: delivered }
  if (duplicates === recipients.length) return { delivered: false, reason: 'duplicate' as const }
  return { delivered: false, reason: lastReason || 'not_delivered' }
}

async function getBusinessBillingRecipients(
  admin: SupabaseClient,
  userId: string,
  input?: Pick<BusinessBillingEmailInput, 'locale' | 'market'>,
): Promise<BusinessRecipient[]> {
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('email,company_name,display_name,locale,country_code,company_id')
    .eq('user_id', userId)
    .maybeSingle()

  const companyName = String(profile?.company_name || profile?.display_name || 'Company')
  const fallbackLocale = resolveEmailLocale({
    locale: input?.locale || profile?.locale,
    market: input?.market,
    countryCode: profile?.country_code,
  })
  const recipients: BusinessRecipient[] = []
  const addRecipient = (emailValue: unknown, localeValue?: unknown, countryCode?: unknown) => {
    const email = String(emailValue || '').trim().toLowerCase()
    if (!email || !email.includes('@') || recipients.some((recipient) => recipient.email === email)) return
    recipients.push({
      email,
      companyName,
      locale: resolveEmailLocale({
        locale: input?.locale || String(localeValue || ''),
        market: input?.market,
        countryCode: String(countryCode || profile?.country_code || ''),
      }) || fallbackLocale,
    })
  }

  const companyId = String(profile?.company_id || '').trim()
  if (companyId) {
    const { data: billingMembers } = await admin
      .from('marketplace_company_members')
      .select('user_id')
      .eq('company_id', companyId)
      .eq('billing_notifications_enabled', true)

    const userIds = Array.from(new Set((billingMembers || []).map((member) => String(member.user_id)).filter(Boolean)))
    if (userIds.length) {
      const { data: memberProfiles } = await admin
        .from('marketplace_profiles')
        .select('email,locale,country_code')
        .in('user_id', userIds)
      for (const memberProfile of memberProfiles || []) {
        addRecipient(memberProfile.email, memberProfile.locale, memberProfile.country_code)
      }
    }
  }

  addRecipient(profile?.email, profile?.locale, profile?.country_code)
  return recipients
}

function inputForRecipient(input: BusinessBillingEmailInput, recipientEmail: string): BusinessBillingEmailInput {
  return {
    ...input,
    deliveryKey: `${input.deliveryKey}-${hashRecipientEmail(recipientEmail)}`,
  }
}

function hashRecipientEmail(email: string) {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 16)
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
  const locale = recipient.locale
  const plan = planLabels[String(input.planKey || '').toLowerCase()] || businessFallback(locale)
  const limit = input.activeListingLimit ? listingLimitText(input.activeListingLimit, locale) : quotaText(locale)
  const amount = formatEmailMoney(input.amountMinor, input.currency, locale)
  const due = input.dueAt ? formatEmailDate(input.dueAt, locale) : null
  const invoiceLine = invoiceLabel(locale, input.invoiceNumber)
  const invoiceUrl = input.invoiceUrl || input.pdfUrl || localizedAccountUrl('/account/payments', locale)
  const paymentsUrl = localizedAccountUrl('/account/payments', locale)
  const copy = copyForKind(input, locale, { plan, limit, amount, due, invoiceLine, invoiceUrl, paymentsUrl })

  return {
    subject: copy.subject,
    text: `${copy.title}\n\n${copy.body}\n\n${copy.cta}: ${copy.url}\n\nAutorell`,
    html: renderEmailHtml(copy, recipient.companyName, locale),
  }
}

function copyForKind(
  input: BusinessBillingEmailInput,
  locale: EmailLocale,
  data: {
    plan: string
    limit: string
    amount: string
    due: string | null
    invoiceLine: string
    invoiceUrl: string
    paymentsUrl: string
  },
): MessageCopy {
  const c = kindCopy(locale)
  switch (input.kind) {
    case 'welcome':
      return {
        subject: c.welcomeSubject(data.plan),
        preview: c.welcomePreview(data.plan),
        title: c.welcomeTitle(data.plan),
        body: c.welcomeBody(data.limit),
        cta: c.openAccount,
        url: localizedAccountUrl('/account', locale),
      }
    case 'invoice_ready':
      return {
        subject: c.invoiceSubject(data.invoiceLine),
        preview: data.due ? c.invoicePreviewDue(data.amount, data.due) : c.invoicePreview(data.amount),
        title: c.invoiceTitle(data.invoiceLine),
        body: data.due ? c.invoiceBodyDue(data.plan, data.amount, data.due) : c.invoiceBody(data.plan, data.amount),
        cta: c.openInvoice,
        url: data.invoiceUrl,
      }
    case 'payment_receipt':
      return {
        subject: c.receiptSubject(data.plan),
        preview: c.receiptPreview(data.amount),
        title: c.receiptTitle,
        body: c.receiptBody(data.plan),
        cta: c.viewReceipt,
        url: data.invoiceUrl,
      }
    case 'payment_failed':
      return {
        subject: c.failedSubject(data.plan),
        preview: c.failedPreview,
        title: c.failedTitle,
        body: c.failedBody(data.plan),
        cta: c.openPayments,
        url: data.paymentsUrl,
      }
    case 'invoice_reminder': {
      const days = input.daysLeft || 2
      return {
        subject: c.reminderSubject(days),
        preview: data.due ? c.reminderPreviewDue(data.invoiceLine, data.due) : c.reminderPreview(data.invoiceLine),
        title: c.reminderTitle(days),
        body: data.due ? c.reminderBodyDue(data.invoiceLine, data.plan, data.due) : c.reminderBody(data.invoiceLine, data.plan),
        cta: c.payInvoice,
        url: data.invoiceUrl,
      }
    }
    case 'account_blocked':
      return {
        subject: c.blockedSubject,
        preview: c.blockedPreview,
        title: c.blockedTitle,
        body: c.blockedBody(data.plan),
        cta: c.payNow,
        url: data.invoiceUrl,
      }
    case 'cancellation_scheduled':
      return {
        subject: c.cancelSubject(data.plan),
        preview: data.due ? c.cancelPreviewDue(data.due) : c.cancelPreview,
        title: c.cancelTitle,
        body: data.due ? c.cancelBodyDue(data.plan, data.due) : c.cancelBody(data.plan),
        cta: c.openPayments,
        url: data.paymentsUrl,
      }
  }
}

function renderEmailHtml(copy: MessageCopy, companyName: string, locale: EmailLocale) {
  const labels = frameLabels(locale)
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeEmailHtml(copy.title)}</title></head><body style="margin:0;background:#f6f8fb;font-family:Arial,sans-serif;color:#101828"><div style="display:none;max-height:0;overflow:hidden">${escapeEmailHtml(copy.preview)}</div><div style="max-width:640px;margin:0 auto;padding:36px 18px"><div style="background:#fff;border:1px solid #d9e2ef;border-radius:14px;padding:32px"><p style="margin:0 0 18px;color:#0866ff;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">${escapeEmailHtml(labels.header)}</p><h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#101828">${escapeEmailHtml(copy.title)}</h1><p style="margin:0 0 18px;color:#475467;font-size:15px;line-height:1.7">${escapeEmailHtml(copy.body)}</p><p style="margin:0 0 26px;color:#667085;font-size:13px">${escapeEmailHtml(labels.company)}: ${escapeEmailHtml(companyName)}</p><a href="${escapeEmailHtml(copy.url)}" style="display:inline-block;background:#0866ff;color:#fff;padding:13px 18px;border-radius:8px;text-decoration:none;font-weight:700">${escapeEmailHtml(copy.cta)}</a></div><p style="margin:18px 4px 0;color:#98a2b3;font-size:12px;line-height:1.6">${escapeEmailHtml(labels.footer)}</p></div></body></html>`
}

function kindCopy(locale: EmailLocale): BusinessBillingCopy {
  const en: BusinessBillingCopy = {
    openAccount: 'Open account pages',
    openInvoice: 'Open invoice',
    viewReceipt: 'View receipt',
    openPayments: 'Open payments',
    payInvoice: 'Pay invoice',
    payNow: 'Pay now',
    receiptTitle: 'Payment completed',
    failedPreview: 'Update the payment to avoid account restriction.',
    failedTitle: 'The payment did not go through',
    blockedSubject: 'Your Autorell business account is restricted until payment is received',
    blockedPreview: 'The account opens again when the overdue invoice has been paid.',
    blockedTitle: 'The account is restricted',
    cancelTitle: 'Your cancellation is scheduled',
    cancelPreview: 'The plan remains active until the current period ends.',
    welcomeSubject: (plan: string) => `Welcome to Autorell ${plan}`,
    welcomePreview: (plan: string) => `The ${plan} business plan is active.`,
    welcomeTitle: (plan: string) => `Welcome to Autorell ${plan}`,
    welcomeBody: (limit: string) => `Your business plan is active. You have ${limit} and can manage listings, payments and subscriptions from your account pages.`,
    invoiceSubject: (line: string) => `${line} from Autorell is ready`,
    invoicePreviewDue: (amount: string, due: string) => `${amount} is due ${due}.`,
    invoicePreview: (amount: string) => `${amount} to pay.`,
    invoiceTitle: (line: string) => `${line} is ready`,
    invoiceBodyDue: (plan: string, amount: string, due: string) => `The invoice for ${plan} has been created. The amount is ${amount} and is due ${due}. Pay via the link below or according to the payment instructions on the invoice.`,
    invoiceBody: (plan: string, amount: string) => `The invoice for ${plan} has been created. The amount is ${amount}. Pay via the link below or according to the payment instructions on the invoice.`,
    receiptSubject: (plan: string) => `Payment received for ${plan}`,
    receiptPreview: (amount: string) => `${amount} has been paid. Here is the receipt/invoice.`,
    receiptBody: (plan: string) => `We have received the payment for ${plan}. The account is active and the receipt/invoice is available via the link below.`,
    failedSubject: (plan: string) => `The payment for ${plan} did not go through`,
    failedBody: (plan: string) => `We could not register the payment for ${plan}. Open the payment page and pay the invoice or update the payment method to avoid account restriction.`,
    reminderSubject: (days: number) => `${days} day${days === 1 ? '' : 's'} left to pay the Autorell invoice`,
    reminderPreviewDue: (line: string, due: string) => `${line} is due ${due}.`,
    reminderPreview: (line: string) => `${line} is due soon.`,
    reminderTitle: (days: number) => `${days} day${days === 1 ? '' : 's'} left`,
    reminderBodyDue: (line: string, plan: string, due: string) => `${line} for ${plan} is due ${due}. Pay on time to keep access to the business plan.`,
    reminderBody: (line: string, plan: string) => `${line} for ${plan} is due soon. Pay on time to keep access to the business plan.`,
    blockedBody: (plan: string) => `The invoice for ${plan} is overdue. The business account is restricted until payment is received. Open the payment page or invoice to pay.`,
    cancelSubject: (plan: string) => `Cancellation scheduled for ${plan}`,
    cancelPreviewDue: (date: string) => `The plan remains active until ${date}.`,
    cancelBodyDue: (plan: string, date: string) => `${plan} remains active until ${date}. Issued invoices and the final invoice must still be paid before the account is fully closed.`,
    cancelBody: (plan: string) => `${plan} remains active until the current period ends. Issued invoices and the final invoice must still be paid before the account is fully closed.`,
  }

  const overrides: Partial<Record<EmailLocale, Partial<typeof en>>> = {
    sv: {
      openAccount: 'Öppna Mina sidor',
      openInvoice: 'Öppna fakturan',
      viewReceipt: 'Visa kvitto',
      openPayments: 'Öppna betalningar',
      payInvoice: 'Betala fakturan',
      payNow: 'Betala nu',
      receiptTitle: 'Betalningen är genomförd',
      failedPreview: 'Uppdatera betalningen för att undvika spärr.',
      failedTitle: 'Betalningen gick inte igenom',
      blockedSubject: 'Autorell-företagskontot är spärrat tills betalning är mottagen',
      blockedPreview: 'Kontot öppnas igen när den förfallna fakturan är betald.',
      blockedTitle: 'Kontot är spärrat',
      cancelTitle: 'Din uppsägning är schemalagd',
      cancelPreview: 'Planen är aktiv till periodens slut.',
      welcomeSubject: (plan) => `Välkommen till Autorell ${plan}`,
      welcomePreview: (plan) => `Företagspaketet ${plan} är aktivt.`,
      welcomeTitle: (plan) => `Välkommen till Autorell ${plan}`,
      welcomeBody: (limit) => `Ditt företagspaket är aktivt. Ni har ${limit} och kan hantera annonser, betalningar och abonnemang från Mina sidor.`,
      invoiceSubject: (line) => `${line} från Autorell är redo`,
      invoicePreviewDue: (amount, due) => `${amount} förfaller ${due}.`,
      invoicePreview: (amount) => `${amount} att betala.`,
      invoiceTitle: (line) => `${line} är redo`,
      invoiceBodyDue: (plan, amount, due) => `Fakturan för ${plan} är skapad. Beloppet är ${amount} och förfaller ${due}. Betala via länken nedan eller enligt betalningsinstruktionerna på fakturan.`,
      invoiceBody: (plan, amount) => `Fakturan för ${plan} är skapad. Beloppet är ${amount}. Betala via länken nedan eller enligt betalningsinstruktionerna på fakturan.`,
      receiptSubject: (plan) => `Betalning mottagen för ${plan}`,
      receiptPreview: (amount) => `${amount} är betalt. Här är kvittot/fakturan.`,
      receiptBody: (plan) => `Vi har tagit emot betalningen för ${plan}. Kontot är aktivt och kvittot/fakturan finns via länken nedan.`,
      failedSubject: (plan) => `Betalningen för ${plan} gick inte igenom`,
      failedBody: (plan) => `Vi kunde inte registrera betalningen för ${plan}. Öppna betalningssidan och betala fakturan eller uppdatera betalningsmetoden för att undvika att kontot spärras.`,
      reminderSubject: (days) => `${days} dag${days === 1 ? '' : 'ar'} kvar att betala Autorell-fakturan`,
      reminderPreviewDue: (line, due) => `${line} förfaller ${due}.`,
      reminderPreview: (line) => `${line} förfaller snart.`,
      reminderTitle: (days) => `${days} dag${days === 1 ? '' : 'ar'} kvar`,
      reminderBodyDue: (line, plan, due) => `${line} för ${plan} förfaller ${due}. Betala i tid för att behålla tillgången till företagspaketet.`,
      reminderBody: (line, plan) => `${line} för ${plan} förfaller snart. Betala i tid för att behålla tillgången till företagspaketet.`,
      blockedBody: (plan) => `Fakturan för ${plan} är förfallen. Företagskontot är spärrat tills betalningen är mottagen. Öppna betalningssidan eller fakturan för att betala.`,
      cancelSubject: (plan) => `Uppsägning schemalagd för ${plan}`,
      cancelPreviewDue: (date) => `Planen är aktiv till ${date}.`,
      cancelBodyDue: (plan, date) => `${plan} är aktivt till ${date}. Redan skapade fakturor och sista fakturan måste fortfarande betalas innan kontot stängs helt.`,
      cancelBody: (plan) => `${plan} är aktivt till periodens slut. Redan skapade fakturor och sista fakturan måste fortfarande betalas innan kontot stängs helt.`,
    },
  }
  return { ...en, ...(localizedBillingKindCopy(locale) || {}), ...(overrides[locale] || {}) }
}

function localizedBillingKindCopy(locale: EmailLocale): Partial<BusinessBillingCopy> | null {
  if (locale === 'en' || locale === 'sv') return null
  const copy: Partial<Record<EmailLocale, Partial<BusinessBillingCopy>>> = {
    da: {
      openAccount: 'Åbn kontosider', openInvoice: 'Åbn faktura', viewReceipt: 'Se kvittering', openPayments: 'Åbn betalinger', payInvoice: 'Betal faktura', payNow: 'Betal nu',
      receiptTitle: 'Betaling gennemført', failedPreview: 'Opdater betalingen for at undgå begrænsning af kontoen.', failedTitle: 'Betalingen gik ikke igennem',
      blockedSubject: 'Din Autorell-virksomhedskonto er begrænset, indtil betalingen er modtaget', blockedPreview: 'Kontoen åbnes igen, når den forfaldne faktura er betalt.', blockedTitle: 'Kontoen er begrænset',
      cancelTitle: 'Opsigelsen er planlagt', cancelPreview: 'Planen er aktiv indtil periodens udløb.',
      welcomeSubject: (plan: string) => `Velkommen til Autorell ${plan}`, welcomePreview: (plan: string) => `Virksomhedsplanen ${plan} er aktiv.`, welcomeTitle: (plan: string) => `Velkommen til Autorell ${plan}`, welcomeBody: (limit: string) => `Din virksomhedsplan er aktiv. I har ${limit} og kan håndtere annoncer, betalinger og abonnementer fra kontosiderne.`,
      invoiceSubject: (line: string) => `${line} fra Autorell er klar`, invoicePreviewDue: (amount: string, due: string) => `${amount} forfalder ${due}.`, invoicePreview: (amount: string) => `${amount} til betaling.`, invoiceTitle: (line: string) => `${line} er klar`, invoiceBodyDue: (plan: string, amount: string, due: string) => `Fakturaen for ${plan} er oprettet. Beløbet er ${amount} og forfalder ${due}. Betal via linket nedenfor eller efter betalingsinstruktionerne på fakturaen.`, invoiceBody: (plan: string, amount: string) => `Fakturaen for ${plan} er oprettet. Beløbet er ${amount}. Betal via linket nedenfor eller efter betalingsinstruktionerne på fakturaen.`,
      receiptSubject: (plan: string) => `Betaling modtaget for ${plan}`, receiptPreview: (amount: string) => `${amount} er betalt. Her er kvitteringen/fakturaen.`, receiptBody: (plan: string) => `Vi har modtaget betalingen for ${plan}. Kontoen er aktiv, og kvitteringen/fakturaen er tilgængelig via linket nedenfor.`,
      failedSubject: (plan: string) => `Betalingen for ${plan} gik ikke igennem`, failedBody: (plan: string) => `Vi kunne ikke registrere betalingen for ${plan}. Åbn betalingssiden og betal fakturaen eller opdater betalingsmetoden for at undgå begrænsning af kontoen.`,
      reminderSubject: (days: number) => `${days} dag${days === 1 ? '' : 'e'} tilbage til at betale Autorell-fakturaen`, reminderPreviewDue: (line: string, due: string) => `${line} forfalder ${due}.`, reminderPreview: (line: string) => `${line} forfalder snart.`, reminderTitle: (days: number) => `${days} dag${days === 1 ? '' : 'e'} tilbage`, reminderBodyDue: (line: string, plan: string, due: string) => `${line} for ${plan} forfalder ${due}. Betal til tiden for at bevare adgangen til virksomhedsplanen.`, reminderBody: (line: string, plan: string) => `${line} for ${plan} forfalder snart. Betal til tiden for at bevare adgangen til virksomhedsplanen.`,
      blockedBody: (plan: string) => `Fakturaen for ${plan} er forfalden. Virksomhedskontoen er begrænset, indtil betalingen er modtaget. Åbn betalingssiden eller fakturaen for at betale.`, cancelSubject: (plan: string) => `Opsigelse planlagt for ${plan}`, cancelPreviewDue: (date: string) => `Planen er aktiv indtil ${date}.`, cancelBodyDue: (plan: string, date: string) => `${plan} er aktiv indtil ${date}. Udstedte fakturaer og slutfakturaen skal stadig betales, før kontoen kan lukkes helt.`, cancelBody: (plan: string) => `${plan} er aktiv indtil den aktuelle periode slutter. Udstedte fakturaer og slutfakturaen skal stadig betales, før kontoen kan lukkes helt.`,
    },
    fi: {
      openAccount: 'Avaa tilisivut', openInvoice: 'Avaa lasku', viewReceipt: 'Näytä kuitti', openPayments: 'Avaa maksut', payInvoice: 'Maksa lasku', payNow: 'Maksa nyt',
      receiptTitle: 'Maksu suoritettu', failedPreview: 'Päivitä maksu, jotta tilin rajoitus vältetään.', failedTitle: 'Maksu ei onnistunut', blockedSubject: 'Autorell-yritystili on rajoitettu, kunnes maksu on vastaanotettu', blockedPreview: 'Tili avataan uudelleen, kun erääntynyt lasku on maksettu.', blockedTitle: 'Tili on rajoitettu', cancelTitle: 'Irtisanominen on ajoitettu', cancelPreview: 'Paketti pysyy aktiivisena nykyisen jakson loppuun.',
      welcomeSubject: (plan: string) => `Tervetuloa Autorell ${plan} -pakettiin`, welcomePreview: (plan: string) => `${plan}-yrityspaketti on aktiivinen.`, welcomeTitle: (plan: string) => `Tervetuloa Autorell ${plan} -pakettiin`, welcomeBody: (limit: string) => `Yrityspakettinne on aktiivinen. Käytössänne on ${limit}, ja voitte hallita ilmoituksia, maksuja ja tilauksia tilisivuilta.`,
      invoiceSubject: (line: string) => `${line} Autorellilta on valmis`, invoicePreviewDue: (amount: string, due: string) => `${amount} erääntyy ${due}.`, invoicePreview: (amount: string) => `${amount} maksettavana.`, invoiceTitle: (line: string) => `${line} on valmis`, invoiceBodyDue: (plan: string, amount: string, due: string) => `${plan}-paketin lasku on luotu. Summa on ${amount} ja eräpäivä on ${due}. Maksa alla olevasta linkistä tai laskun maksuohjeiden mukaan.`, invoiceBody: (plan: string, amount: string) => `${plan}-paketin lasku on luotu. Summa on ${amount}. Maksa alla olevasta linkistä tai laskun maksuohjeiden mukaan.`,
      receiptSubject: (plan: string) => `Maksu vastaanotettu: ${plan}`, receiptPreview: (amount: string) => `${amount} on maksettu. Tässä on kuitti/lasku.`, receiptBody: (plan: string) => `Olemme vastaanottaneet maksun paketista ${plan}. Tili on aktiivinen ja kuitti/lasku on saatavilla alla olevasta linkistä.`, failedSubject: (plan: string) => `Maksu paketista ${plan} ei onnistunut`, failedBody: (plan: string) => `Emme voineet rekisteröidä maksua paketista ${plan}. Avaa maksusivu ja maksa lasku tai päivitä maksutapa, jotta tilin rajoitus vältetään.`,
      reminderSubject: (days: number) => `${days} päivää aikaa maksaa Autorell-lasku`, reminderPreviewDue: (line: string, due: string) => `${line} erääntyy ${due}.`, reminderPreview: (line: string) => `${line} erääntyy pian.`, reminderTitle: (days: number) => `${days} päivää jäljellä`, reminderBodyDue: (line: string, plan: string, due: string) => `${line} paketista ${plan} erääntyy ${due}. Maksa ajoissa, jotta yrityspaketin käyttö jatkuu.`, reminderBody: (line: string, plan: string) => `${line} paketista ${plan} erääntyy pian. Maksa ajoissa, jotta yrityspaketin käyttö jatkuu.`,
      blockedBody: (plan: string) => `${plan}-paketin lasku on erääntynyt. Yritystili on rajoitettu, kunnes maksu on vastaanotettu. Avaa maksusivu tai lasku maksaaksesi.`, cancelSubject: (plan: string) => `Irtisanominen ajoitettu: ${plan}`, cancelPreviewDue: (date: string) => `Paketti pysyy aktiivisena ${date} asti.`, cancelBodyDue: (plan: string, date: string) => `${plan} pysyy aktiivisena ${date} asti. Luodut laskut ja loppulasku on silti maksettava ennen tilin sulkemista.`, cancelBody: (plan: string) => `${plan} pysyy aktiivisena nykyisen jakson loppuun. Luodut laskut ja loppulasku on silti maksettava ennen tilin sulkemista.`,
    },
  }

  if (copy[locale]) return copy[locale] || null

  const labels = {
    de: ['Kontoseiten öffnen', 'Rechnung öffnen', 'Beleg anzeigen', 'Zahlungen öffnen', 'Rechnung bezahlen', 'Jetzt bezahlen', 'Rechnung', 'Unternehmensplan'],
    fr: ['Ouvrir le compte', 'Ouvrir la facture', 'Voir le reçu', 'Ouvrir les paiements', 'Payer la facture', 'Payer maintenant', 'Facture', 'forfait entreprise'],
    it: ['Apri account', 'Apri fattura', 'Vedi ricevuta', 'Apri pagamenti', 'Paga fattura', 'Paga ora', 'Fattura', 'piano aziendale'],
    es: ['Abrir cuenta', 'Abrir factura', 'Ver recibo', 'Abrir pagos', 'Pagar factura', 'Pagar ahora', 'Factura', 'plan de empresa'],
    nl: ['Account openen', 'Factuur openen', 'Bon bekijken', 'Betalingen openen', 'Factuur betalen', 'Nu betalen', 'Factuur', 'zakelijk plan'],
    pl: ['Otwórz konto', 'Otwórz fakturę', 'Zobacz potwierdzenie', 'Otwórz płatności', 'Zapłać fakturę', 'Zapłać teraz', 'Faktura', 'plan firmowy'],
  } as const
  const value = labels[locale as keyof typeof labels]
  if (!value) return null
  const [openAccount, openInvoice, viewReceipt, openPayments, payInvoice, payNow, invoiceWord, planWord] = value
  return {
    openAccount, openInvoice, viewReceipt, openPayments, payInvoice, payNow,
    receiptTitle: locale === 'de' ? 'Zahlung abgeschlossen' : locale === 'fr' ? 'Paiement effectué' : locale === 'it' ? 'Pagamento completato' : locale === 'es' ? 'Pago completado' : locale === 'nl' ? 'Betaling voltooid' : 'Płatność zakończona',
    failedPreview: locale === 'de' ? 'Aktualisieren Sie die Zahlung, um eine Kontoeinschränkung zu vermeiden.' : locale === 'fr' ? 'Mettez à jour le paiement pour éviter une restriction du compte.' : locale === 'it' ? 'Aggiorna il pagamento per evitare limitazioni dell’account.' : locale === 'es' ? 'Actualiza el pago para evitar restricciones en la cuenta.' : locale === 'nl' ? 'Werk de betaling bij om accountbeperking te voorkomen.' : 'Zaktualizuj płatność, aby uniknąć ograniczenia konta.',
    failedTitle: locale === 'de' ? 'Die Zahlung wurde nicht durchgeführt' : locale === 'fr' ? 'Le paiement n’a pas abouti' : locale === 'it' ? 'Il pagamento non è andato a buon fine' : locale === 'es' ? 'El pago no se ha completado' : locale === 'nl' ? 'De betaling is niet gelukt' : 'Płatność nie została zrealizowana',
    blockedSubject: locale === 'de' ? 'Ihr Autorell-Unternehmenskonto ist eingeschränkt, bis die Zahlung eingegangen ist' : locale === 'fr' ? 'Votre compte entreprise Autorell est restreint jusqu’à réception du paiement' : locale === 'it' ? 'Il tuo account aziendale Autorell è limitato fino alla ricezione del pagamento' : locale === 'es' ? 'Tu cuenta de empresa de Autorell está restringida hasta que recibamos el pago' : locale === 'nl' ? 'Je zakelijke Autorell-account is beperkt totdat de betaling is ontvangen' : 'Twoje konto firmowe Autorell jest ograniczone do czasu otrzymania płatności',
    blockedPreview: locale === 'de' ? 'Das Konto wird wieder geöffnet, sobald die überfällige Rechnung bezahlt ist.' : locale === 'fr' ? 'Le compte sera réactivé lorsque la facture échue sera payée.' : locale === 'it' ? 'L’account verrà riattivato quando la fattura scaduta sarà pagata.' : locale === 'es' ? 'La cuenta se reactivará cuando la factura vencida esté pagada.' : locale === 'nl' ? 'Het account wordt opnieuw geopend wanneer de achterstallige factuur is betaald.' : 'Konto zostanie ponownie otwarte po opłaceniu zaległej faktury.',
    blockedTitle: locale === 'de' ? 'Das Konto ist eingeschränkt' : locale === 'fr' ? 'Le compte est restreint' : locale === 'it' ? 'L’account è limitato' : locale === 'es' ? 'La cuenta está restringida' : locale === 'nl' ? 'Het account is beperkt' : 'Konto jest ograniczone',
    cancelTitle: locale === 'de' ? 'Ihre Kündigung ist vorgemerkt' : locale === 'fr' ? 'Votre résiliation est planifiée' : locale === 'it' ? 'La cancellazione è programmata' : locale === 'es' ? 'Tu cancelación está programada' : locale === 'nl' ? 'Je opzegging is gepland' : 'Rezygnacja została zaplanowana',
    cancelPreview: locale === 'de' ? 'Der Plan bleibt bis zum Ende des aktuellen Zeitraums aktiv.' : locale === 'fr' ? 'Le forfait reste actif jusqu’à la fin de la période en cours.' : locale === 'it' ? 'Il piano resta attivo fino alla fine del periodo corrente.' : locale === 'es' ? 'El plan sigue activo hasta el final del periodo actual.' : locale === 'nl' ? 'Het plan blijft actief tot het einde van de huidige periode.' : 'Plan pozostaje aktywny do końca bieżącego okresu.',
    welcomeSubject: (plan: string) => `Autorell ${plan}`,
    welcomePreview: (plan: string) => `${plan} ${planWord} active.`,
    welcomeTitle: (plan: string) => `Autorell ${plan}`,
    welcomeBody: (limit: string) => `${planWord} active. ${limit}.`,
    invoiceSubject: (line: string) => `${line} Autorell`,
    invoicePreviewDue: (amount: string, due: string) => `${amount} - ${due}.`,
    invoicePreview: (amount: string) => `${amount}.`,
    invoiceTitle: (line: string) => `${line}`,
    invoiceBodyDue: (plan: string, amount: string, due: string) => `${invoiceWord} for ${plan}: ${amount}. Due: ${due}.`,
    invoiceBody: (plan: string, amount: string) => `${invoiceWord} for ${plan}: ${amount}.`,
    receiptSubject: (plan: string) => `${plan} - ${locale === 'de' ? 'Zahlung erhalten' : locale === 'fr' ? 'paiement reçu' : locale === 'it' ? 'pagamento ricevuto' : locale === 'es' ? 'pago recibido' : locale === 'nl' ? 'betaling ontvangen' : 'płatność otrzymana'}`,
    receiptPreview: (amount: string) => `${amount}.`,
    receiptBody: (plan: string) => `${plan}: ${locale === 'de' ? 'Die Zahlung wurde erhalten.' : locale === 'fr' ? 'Le paiement a été reçu.' : locale === 'it' ? 'Il pagamento è stato ricevuto.' : locale === 'es' ? 'El pago se ha recibido.' : locale === 'nl' ? 'De betaling is ontvangen.' : 'Płatność została otrzymana.'}`,
    failedSubject: (plan: string) => `${plan} - ${locale === 'de' ? 'Zahlung fehlgeschlagen' : locale === 'fr' ? 'paiement échoué' : locale === 'it' ? 'pagamento non riuscito' : locale === 'es' ? 'pago fallido' : locale === 'nl' ? 'betaling mislukt' : 'płatność nieudana'}`,
    failedBody: (plan: string) => `${plan}: ${locale === 'de' ? 'Öffnen Sie die Zahlungsseite und bezahlen Sie die Rechnung.' : locale === 'fr' ? 'Ouvrez la page de paiement et payez la facture.' : locale === 'it' ? 'Apri la pagina pagamenti e paga la fattura.' : locale === 'es' ? 'Abre la página de pagos y paga la factura.' : locale === 'nl' ? 'Open de betaalpagina en betaal de factuur.' : 'Otwórz stronę płatności i opłać fakturę.'}`,
    reminderSubject: (days: number) => `${days} - ${invoiceWord} Autorell`,
    reminderPreviewDue: (line: string, due: string) => `${line}: ${due}.`,
    reminderPreview: (line: string) => `${line}.`,
    reminderTitle: (days: number) => `${days}`,
    reminderBodyDue: (line: string, plan: string, due: string) => `${line} / ${plan}: ${due}.`,
    reminderBody: (line: string, plan: string) => `${line} / ${plan}.`,
    blockedBody: (plan: string) => `${plan}: ${locale === 'de' ? 'Die Rechnung ist überfällig.' : locale === 'fr' ? 'La facture est échue.' : locale === 'it' ? 'La fattura è scaduta.' : locale === 'es' ? 'La factura está vencida.' : locale === 'nl' ? 'De factuur is achterstallig.' : 'Faktura jest po terminie.'}`,
    cancelSubject: (plan: string) => `${plan} - ${locale === 'de' ? 'Kündigung' : locale === 'fr' ? 'résiliation' : locale === 'it' ? 'cancellazione' : locale === 'es' ? 'cancelación' : locale === 'nl' ? 'opzegging' : 'rezygnacja'}`,
    cancelPreviewDue: (date: string) => `${date}.`,
    cancelBodyDue: (plan: string, date: string) => `${plan}: ${date}.`,
    cancelBody: (plan: string) => `${plan}.`,
  }
}

function invoiceLabel(locale: EmailLocale, invoiceNumber?: string | null) {
  if (invoiceNumber) {
    const label = ({ sv: 'Faktura', da: 'Faktura', fi: 'Lasku', de: 'Rechnung', fr: 'Facture', it: 'Fattura', es: 'Factura', nl: 'Factuur', pl: 'Faktura', en: 'Invoice' } satisfies Record<EmailLocale, string>)[locale]
    return `${label} ${invoiceNumber}`
  }
  return ({ sv: 'Din faktura', da: 'Din faktura', fi: 'Laskusi', de: 'Ihre Rechnung', fr: 'Votre facture', it: 'La tua fattura', es: 'Tu factura', nl: 'Uw factuur', pl: 'Twoja faktura', en: 'Your invoice' } satisfies Record<EmailLocale, string>)[locale]
}

function listingLimitText(limit: number, locale: EmailLocale) {
  const suffix = ({ en: 'active listings', sv: 'aktiva annonser', da: 'aktive annoncer', fi: 'aktiivista ilmoitusta', de: 'aktive Anzeigen', fr: 'annonces actives', it: 'annunci attivi', es: 'anuncios activos', nl: 'actieve advertenties', pl: 'aktywnych ogłoszeń' } satisfies Record<EmailLocale, string>)[locale]
  return `${limit} ${suffix}`
}

function quotaText(locale: EmailLocale) {
  return ({ en: 'your listing quota', sv: 'din annonskvot', da: 'din annoncekvote', fi: 'ilmoituskiintiösi', de: 'Ihr Anzeigenkontingent', fr: 'votre quota d’annonces', it: 'la tua quota annunci', es: 'tu cuota de anuncios', nl: 'uw advertentietegoed', pl: 'Twój limit ogłoszeń' } satisfies Record<EmailLocale, string>)[locale]
}

function businessFallback(locale: EmailLocale) {
  return ({ en: 'business plan', sv: 'företagspaket', da: 'virksomhedspakke', fi: 'yrityspaketti', de: 'Unternehmenspaket', fr: 'forfait entreprise', it: 'piano aziendale', es: 'plan de empresa', nl: 'bedrijfspakket', pl: 'pakiet firmowy' } satisfies Record<EmailLocale, string>)[locale]
}

function frameLabels(locale: EmailLocale) {
  return ({
    en: { header: 'Autorell for business', company: 'Company', footer: 'This is an automated transactional email from Autorell.' },
    sv: { header: 'Autorell för företag', company: 'Företag', footer: 'Det här är ett automatiskt transaktionsmejl från Autorell.' },
    da: { header: 'Autorell for virksomheder', company: 'Virksomhed', footer: 'Dette er en automatisk transaktionsmail fra Autorell.' },
    fi: { header: 'Autorell yrityksille', company: 'Yritys', footer: 'Tämä on Autorellin automaattinen tapahtumasähköposti.' },
    de: { header: 'Autorell für Unternehmen', company: 'Unternehmen', footer: 'Dies ist eine automatische Transaktions-E-Mail von Autorell.' },
    fr: { header: 'Autorell pour les entreprises', company: 'Entreprise', footer: 'Ceci est un e-mail transactionnel automatique d’Autorell.' },
    it: { header: 'Autorell per aziende', company: 'Azienda', footer: 'Questa è un’e-mail transazionale automatica di Autorell.' },
    es: { header: 'Autorell para empresas', company: 'Empresa', footer: 'Este es un correo transaccional automático de Autorell.' },
    nl: { header: 'Autorell voor bedrijven', company: 'Bedrijf', footer: 'Dit is een automatische transactionele e-mail van Autorell.' },
    pl: { header: 'Autorell dla firm', company: 'Firma', footer: 'To automatyczna wiadomość transakcyjna od Autorell.' },
  } satisfies Record<EmailLocale, { header: string; company: string; footer: string }>)[locale]
}
