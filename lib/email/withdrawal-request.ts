import 'server-only'

import { Resend } from 'resend'
import {
  escapeEmailHtml,
  type EmailLocale,
} from '@/lib/email/localization'

export type WithdrawalEmailInput = {
  reference: string
  fullName: string
  email: string
  orderReference: string
  contractDate: string | null
  message: string | null
  locale: EmailLocale
}

export async function sendWithdrawalRequestEmails(input: WithdrawalEmailInput) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { confirmation: 'skipped' as const, internal: 'skipped' as const }
  }

  const resend = new Resend(apiKey)
  const copy = withdrawalEmailCopy[input.locale]
  const from = process.env.AUTORELL_EMAIL_FROM || 'Autorell <noreply@autorell.com>'
  const recipients = (process.env.LEGAL_TO_EMAIL || process.env.CONTACT_TO_EMAIL || 'info@autorell.com')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
  const details = [
    [copy.reference, input.reference],
    [copy.orderReference, input.orderReference],
    [copy.contractDate, input.contractDate || copy.notProvided],
  ]
  const detailsHtml = details.map(([label, value]) => (
    `<tr><td style="padding:8px 14px 8px 0;color:#667085">${escapeEmailHtml(label)}</td><td style="padding:8px 0;font-weight:600;color:#101828">${escapeEmailHtml(value)}</td></tr>`
  )).join('')

  const confirmation = await resend.emails.send(
    {
      from,
      to: input.email,
      subject: copy.subject.replace('{reference}', input.reference),
      text: [
        copy.heading,
        '',
        copy.greeting.replace('{name}', input.fullName),
        copy.received,
        '',
        ...details.map(([label, value]) => `${label}: ${value}`),
        '',
        copy.keep,
        '',
        'Autorell',
      ].join('\n'),
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:32px;color:#101828"><div style="font-size:27px;font-weight:800;color:#0866ff">autorell</div><p style="margin:28px 0 8px;color:#0866ff;font-size:13px;font-weight:700;text-transform:uppercase">${escapeEmailHtml(copy.eyebrow)}</p><h1 style="font-size:27px;line-height:1.28;margin:0 0 18px">${escapeEmailHtml(copy.heading)}</h1><p style="color:#344054;line-height:1.7">${escapeEmailHtml(copy.greeting.replace('{name}', input.fullName))}</p><p style="color:#475467;line-height:1.7">${escapeEmailHtml(copy.received)}</p><table style="width:100%;border-collapse:collapse;margin:24px 0;background:#f7fbff">${detailsHtml}</table><p style="color:#475467;line-height:1.7">${escapeEmailHtml(copy.keep)}</p><p style="margin-top:32px;color:#98a2b3;font-size:12px">Autorell</p></div>`,
    },
    { headers: { 'Idempotency-Key': `withdrawal-customer-${input.reference}` } },
  )

  const internal = await resend.emails.send(
    {
      from,
      to: recipients,
      replyTo: input.email,
      subject: `[WITHDRAWAL ${input.reference}] ${input.orderReference}`,
      text: [
        'New withdrawal request',
        `Reference: ${input.reference}`,
        `Name: ${input.fullName}`,
        `Email: ${input.email}`,
        `Order/listing: ${input.orderReference}`,
        `Contract date: ${input.contractDate || '-'}`,
        `Locale: ${input.locale}`,
        '',
        input.message || 'No additional message.',
      ].join('\n'),
    },
    { headers: { 'Idempotency-Key': `withdrawal-internal-${input.reference}` } },
  )

  return {
    confirmation: confirmation.error ? 'failed' as const : 'sent' as const,
    internal: internal.error ? 'failed' as const : 'sent' as const,
  }
}

type WithdrawalEmailCopy = {
  subject: string
  eyebrow: string
  heading: string
  greeting: string
  received: string
  reference: string
  orderReference: string
  contractDate: string
  notProvided: string
  keep: string
}

const withdrawalEmailCopy: Record<EmailLocale, WithdrawalEmailCopy> = {
  en: emailCopy('Withdrawal request received: {reference}', 'Withdrawal request', 'We have received your withdrawal request', 'Hello {name},', 'Your request has been registered at Autorell. We will assess it under the agreement and applicable mandatory consumer law.', 'Reference', 'Order or listing', 'Contract date', 'Not provided', 'Keep this email and reference number for your records.'),
  sv: emailCopy('Ångerbegäran mottagen: {reference}', 'Ångerbegäran', 'Vi har tagit emot din ångerbegäran', 'Hej {name},', 'Din begäran har registrerats hos Autorell. Vi bedömer den enligt avtalet och tvingande konsumenträtt.', 'Referens', 'Order eller annons', 'Avtalsdatum', 'Inte angivet', 'Spara mejlet och referensnumret.'),
  de: emailCopy('Widerruf eingegangen: {reference}', 'Widerruf', 'Wir haben Ihren Widerruf erhalten', 'Hallo {name},', 'Ihr Antrag wurde bei Autorell registriert. Wir prüfen ihn nach dem Vertrag und dem zwingenden Verbraucherrecht.', 'Referenz', 'Bestellung oder Anzeige', 'Vertragsdatum', 'Nicht angegeben', 'Bewahren Sie diese E-Mail und die Referenznummer auf.'),
  fr: emailCopy('Demande de rétractation reçue : {reference}', 'Rétractation', 'Nous avons reçu votre demande de rétractation', 'Bonjour {name},', 'Votre demande a été enregistrée auprès d’Autorell. Nous l’examinerons conformément au contrat et au droit impératif de la consommation.', 'Référence', 'Commande ou annonce', 'Date du contrat', 'Non renseignée', 'Conservez cet e-mail et le numéro de référence.'),
  es: emailCopy('Solicitud de desistimiento recibida: {reference}', 'Desistimiento', 'Hemos recibido tu solicitud de desistimiento', 'Hola {name},', 'Tu solicitud ha quedado registrada en Autorell. La revisaremos conforme al contrato y a la normativa imperativa de consumo.', 'Referencia', 'Pedido o anuncio', 'Fecha del contrato', 'No indicada', 'Guarda este correo y el número de referencia.'),
  it: emailCopy('Richiesta di recesso ricevuta: {reference}', 'Recesso', 'Abbiamo ricevuto la tua richiesta di recesso', 'Ciao {name},', 'La richiesta è stata registrata presso Autorell. La valuteremo secondo il contratto e le norme imperative a tutela dei consumatori.', 'Riferimento', 'Ordine o annuncio', 'Data del contratto', 'Non indicata', 'Conserva questa e-mail e il numero di riferimento.'),
  pl: emailCopy('Otrzymaliśmy odstąpienie: {reference}', 'Odstąpienie', 'Otrzymaliśmy Twoje oświadczenie o odstąpieniu', 'Dzień dobry {name},', 'Wniosek został zarejestrowany w Autorell. Rozpatrzymy go zgodnie z umową i bezwzględnie obowiązującymi przepisami konsumenckimi.', 'Numer referencyjny', 'Zamówienie lub ogłoszenie', 'Data umowy', 'Nie podano', 'Zachowaj tę wiadomość i numer referencyjny.'),
  nl: emailCopy('Herroepingsverzoek ontvangen: {reference}', 'Herroeping', 'Wij hebben uw herroepingsverzoek ontvangen', 'Hallo {name},', 'Uw verzoek is bij Autorell geregistreerd. Wij beoordelen het volgens de overeenkomst en het dwingende consumentenrecht.', 'Referentie', 'Bestelling of advertentie', 'Contractdatum', 'Niet opgegeven', 'Bewaar deze e-mail en het referentienummer.'),
  fi: emailCopy('Peruuttamispyyntö vastaanotettu: {reference}', 'Peruuttaminen', 'Olemme vastaanottaneet peruuttamispyyntösi', 'Hei {name},', 'Pyyntösi on rekisteröity Autorellissa. Arvioimme sen sopimuksen ja pakottavan kuluttajansuojan mukaisesti.', 'Viite', 'Tilaus tai ilmoitus', 'Sopimuspäivä', 'Ei ilmoitettu', 'Säilytä tämä sähköposti ja viitenumero.'),
  da: emailCopy('Fortrydelse modtaget: {reference}', 'Fortrydelse', 'Vi har modtaget din fortrydelse', 'Hej {name},', 'Din anmodning er registreret hos Autorell. Vi vurderer den efter aftalen og ufravigelig forbrugerret.', 'Reference', 'Ordre eller annonce', 'Aftaledato', 'Ikke angivet', 'Gem denne e-mail og referencenummeret.'),
}

function emailCopy(
  subject: string,
  eyebrow: string,
  heading: string,
  greeting: string,
  received: string,
  reference: string,
  orderReference: string,
  contractDate: string,
  notProvided: string,
  keep: string,
): WithdrawalEmailCopy {
  return { subject, eyebrow, heading, greeting, received, reference, orderReference, contractDate, notProvided, keep }
}
