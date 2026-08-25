import 'server-only'

import { Resend } from 'resend'
import type { SupabaseClient } from '@supabase/supabase-js'
import { escapeEmailHtml, resolveEmailLocale, type EmailLocale } from '@/lib/email/localization'
import { translatePublic } from '@/lib/public-i18n'

export type DealerLeadCustomerConfirmationInput = {
  id: string
  reference: string
  sourceLocale: string
  sourceCountryCode: string
  make: string
  model: string
  modelYear: number
  contactName: string
  contactEmail: string
  preferredContact: string
}

export async function sendDealerVehicleLeadCustomerConfirmation(
  admin: SupabaseClient,
  lead: DealerLeadCustomerConfirmationInput,
) {
  const recipientEmail = lead.contactEmail.trim().toLowerCase()
  const locale = resolveEmailLocale({ locale: lead.sourceLocale, countryCode: lead.sourceCountryCode })
  const { data: reservation, error: reservationError } = await admin
    .from('dealer_vehicle_lead_customer_email_deliveries')
    .insert({
      lead_id: lead.id,
      recipient_email: recipientEmail,
      locale,
      status: 'processing',
    })
    .select('id')
    .single()

  if (reservationError?.code === '23505') return { delivered: false, reason: 'duplicate' as const }
  if (reservationError || !reservation) throw reservationError || new Error('CUSTOMER_EMAIL_DELIVERY_RESERVATION_FAILED')

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    await updateCustomerDelivery(admin, reservation.id, 'skipped', null, 'RESEND_API_KEY_MISSING')
    return { delivered: false, reason: 'missing_provider_key' as const }
  }

  const message = buildCustomerMessage(lead, locale)
  const { data, error } = await new Resend(apiKey).emails.send(
    {
      from: process.env.AUTORELL_EMAIL_FROM || 'Autorell <noreply@autorell.com>',
      to: recipientEmail,
      subject: message.subject,
      text: message.text,
      html: message.html,
    },
    { headers: { 'Idempotency-Key': `dealer-lead-customer-${lead.id}` } },
  )

  if (error) {
    await updateCustomerDelivery(admin, reservation.id, 'failed', null, error.message)
    return { delivered: false, reason: error.message }
  }

  await updateCustomerDelivery(admin, reservation.id, 'sent', data?.id || null, null)
  return { delivered: true, providerMessageId: data?.id || null }
}

function buildCustomerMessage(lead: DealerLeadCustomerConfirmationInput, locale: EmailLocale) {
  const copy = customerEmailCopy[locale]
  const vehicle = `${lead.make} ${lead.model} ${lead.modelYear}`.trim()
  const subject = copy.subject.replace('{vehicle}', vehicle)
  const greeting = copy.greeting.replace('{name}', lead.contactName.trim())
  const rows = [
    [copy.vehicle, vehicle],
    [copy.reference, lead.reference],
    [copy.preferredContact, translatePublic(locale, lead.preferredContact)],
  ]
  const text = [
    subject,
    '',
    greeting,
    '',
    copy.intro,
    '',
    ...rows.map(([label, value]) => `${label}: ${value || '-'}`),
    '',
    copy.keepReference,
    '',
    'Autorell',
  ].join('\n')
  const tableRows = rows
    .map(([label, value]) => `<tr><td style="padding:8px 14px 8px 0;color:#667085;vertical-align:top">${escapeEmailHtml(label)}</td><td style="padding:8px 0;color:#101828;font-weight:600">${escapeEmailHtml(value || '-')}</td></tr>`)
    .join('')

  return {
    subject,
    text,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:32px;color:#101828"><div style="font-size:27px;font-weight:800;color:#0866ff">autorell</div><p style="margin:28px 0 8px;color:#0866ff;font-size:13px;font-weight:700;text-transform:uppercase">${escapeEmailHtml(copy.eyebrow)}</p><h1 style="font-size:27px;line-height:1.28;margin:0 0 18px">${escapeEmailHtml(subject)}</h1><p style="color:#344054;line-height:1.7">${escapeEmailHtml(greeting)}</p><p style="color:#475467;line-height:1.7">${escapeEmailHtml(copy.intro)}</p><table style="width:100%;border-collapse:collapse;margin:24px 0;background:#f7fbff">${tableRows}</table><p style="color:#475467;line-height:1.7">${escapeEmailHtml(copy.keepReference)}</p><p style="margin-top:32px;color:#98a2b3;font-size:12px">Autorell</p></div>`,
  }
}

async function updateCustomerDelivery(
  admin: SupabaseClient,
  id: string,
  status: 'sent' | 'failed' | 'skipped',
  providerMessageId: string | null,
  errorMessage: string | null,
) {
  await admin.from('dealer_vehicle_lead_customer_email_deliveries').update({
    status,
    provider_message_id: providerMessageId,
    error_message: errorMessage,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
}

type CustomerCopy = {
  subject: string
  eyebrow: string
  greeting: string
  intro: string
  vehicle: string
  reference: string
  preferredContact: string
  keepReference: string
}

const customerEmailCopy: Record<EmailLocale, CustomerCopy> = {
  en: customerCopy('We received your vehicle request: {vehicle}', 'Request received', 'Hello {name},', 'We have received your vehicle details. Connected dealers can now review your request and may contact you using your preferred contact method.', 'Vehicle', 'Reference', 'Preferred contact', 'You do not need to do anything right now. Keep this email and reference number for your records.'),
  sv: customerCopy('Vi har tagit emot din fordonsförfrågan: {vehicle}', 'Förfrågan mottagen', 'Hej {name},', 'Vi har tagit emot uppgifterna om ditt fordon. Anslutna handlare kan nu granska förfrågan och kontakta dig via den kontaktväg du har valt.', 'Fordon', 'Referens', 'Önskad kontaktväg', 'Du behöver inte göra något just nu. Spara mejlet och referensnumret.'),
  de: customerCopy('Wir haben Ihre Fahrzeuganfrage erhalten: {vehicle}', 'Anfrage erhalten', 'Hallo {name},', 'Wir haben Ihre Fahrzeugangaben erhalten. Angeschlossene Händler können Ihre Anfrage nun prüfen und Sie über Ihren bevorzugten Kontaktweg erreichen.', 'Fahrzeug', 'Referenz', 'Bevorzugter Kontakt', 'Sie müssen jetzt nichts weiter tun. Bewahren Sie diese E-Mail und die Referenznummer auf.'),
  fr: customerCopy('Nous avons reçu votre demande véhicule : {vehicle}', 'Demande reçue', 'Bonjour {name},', 'Nous avons reçu les informations de votre véhicule. Les professionnels partenaires peuvent maintenant examiner votre demande et vous contacter par le moyen choisi.', 'Véhicule', 'Référence', 'Contact préféré', 'Vous n’avez rien à faire pour le moment. Conservez cet e-mail et le numéro de référence.'),
  es: customerCopy('Hemos recibido tu solicitud de vehículo: {vehicle}', 'Solicitud recibida', 'Hola {name},', 'Hemos recibido los datos de tu vehículo. Los concesionarios asociados ya pueden revisar la solicitud y contactarte por el medio que has elegido.', 'Vehículo', 'Referencia', 'Contacto preferido', 'No tienes que hacer nada por ahora. Guarda este correo y el número de referencia.'),
  it: customerCopy('Abbiamo ricevuto la tua richiesta: {vehicle}', 'Richiesta ricevuta', 'Ciao {name},', 'Abbiamo ricevuto i dati del tuo veicolo. I concessionari collegati possono ora esaminare la richiesta e contattarti tramite il canale scelto.', 'Veicolo', 'Riferimento', 'Contatto preferito', 'Per ora non devi fare altro. Conserva questa e-mail e il numero di riferimento.'),
  nl: customerCopy('We hebben uw voertuigaanvraag ontvangen: {vehicle}', 'Aanvraag ontvangen', 'Hallo {name},', 'We hebben de gegevens van uw voertuig ontvangen. Aangesloten dealers kunnen de aanvraag nu bekijken en contact opnemen via uw gekozen contactmethode.', 'Voertuig', 'Referentie', 'Voorkeurscontact', 'U hoeft nu niets te doen. Bewaar deze e-mail en het referentienummer.'),
  fi: customerCopy('Olemme vastaanottaneet ajoneuvopyyntösi: {vehicle}', 'Pyyntö vastaanotettu', 'Hei {name},', 'Olemme vastaanottaneet ajoneuvosi tiedot. Palveluun liittyneet autoliikkeet voivat nyt tarkistaa pyynnön ja ottaa sinuun yhteyttä valitsemallasi tavalla.', 'Ajoneuvo', 'Viite', 'Toivottu yhteydenottotapa', 'Sinun ei tarvitse tehdä nyt mitään. Säilytä tämä sähköposti ja viitenumero.'),
  da: customerCopy('Vi har modtaget din køretøjsforespørgsel: {vehicle}', 'Forespørgsel modtaget', 'Hej {name},', 'Vi har modtaget oplysningerne om dit køretøj. Tilknyttede forhandlere kan nu gennemgå forespørgslen og kontakte dig via den valgte kontaktform.', 'Køretøj', 'Reference', 'Foretrukken kontakt', 'Du behøver ikke gøre mere lige nu. Gem denne e-mail og referencenummeret.'),
  pl: customerCopy('Otrzymaliśmy Twoje zapytanie o pojazd: {vehicle}', 'Zapytanie otrzymane', 'Dzień dobry {name},', 'Otrzymaliśmy dane Twojego pojazdu. Współpracujący dealerzy mogą teraz sprawdzić zapytanie i skontaktować się z Tobą wybraną metodą.', 'Pojazd', 'Numer referencyjny', 'Preferowany kontakt', 'Na razie nie musisz nic robić. Zachowaj tę wiadomość i numer referencyjny.'),
}

function customerCopy(
  subject: string,
  eyebrow: string,
  greeting: string,
  intro: string,
  vehicle: string,
  reference: string,
  preferredContact: string,
  keepReference: string,
): CustomerCopy {
  return { subject, eyebrow, greeting, intro, vehicle, reference, preferredContact, keepReference }
}
