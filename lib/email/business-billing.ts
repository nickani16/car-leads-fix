import 'server-only'

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
  daysLeft?: 1 | 2
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
  const recipient = await getBusinessRecipient(admin, input.userId, input)
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
    { headers: { 'Idempotency-Key': input.deliveryKey } },
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

async function getBusinessRecipient(
  admin: SupabaseClient,
  userId: string,
  input?: Pick<BusinessBillingEmailInput, 'locale' | 'market'>,
): Promise<BusinessRecipient | null> {
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('email,company_name,display_name,locale,country_code')
    .eq('user_id', userId)
    .maybeSingle()

  const email = String(profile?.email || '').trim()
  if (!email || !email.includes('@')) return null
  return {
    email,
    companyName: String(profile?.company_name || profile?.display_name || 'Company'),
    locale: resolveEmailLocale({
      locale: input?.locale || profile?.locale,
      market: input?.market,
      countryCode: profile?.country_code,
    }),
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

function kindCopy(locale: EmailLocale) {
  const en = {
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
  return { ...en, ...(overrides[locale] || {}) }
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
