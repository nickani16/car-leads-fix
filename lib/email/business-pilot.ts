import 'server-only'

import crypto from 'node:crypto'
import { Resend } from 'resend'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getBusinessPilotCopy } from '@/lib/business-pilot-i18n'
import {
  escapeEmailHtml,
  localizedAccountUrl,
  resolveEmailLocale,
  type EmailLocale,
} from '@/lib/email/localization'

export type BusinessPilotEmailKind =
  | 'received'
  | 'more_information_required'
  | 'approved'
  | 'rejected'
  | 'pilot_active'
  | 'pilot_completed'
  | 'pilot_ending_soon'
  | 'commercial_request'

type PilotEmailInput = {
  applicationId: string
  kind: BusinessPilotEmailKind
  recipientEmail: string
  companyName: string
  locale?: string | null
  countryCode?: string | null
  note?: string | null
}

export async function sendBusinessPilotEmail(admin: SupabaseClient, input: PilotEmailInput) {
  const recipient = input.recipientEmail.trim().toLowerCase()
  if (!recipient.includes('@')) return { delivered: false, reason: 'missing_recipient' as const }

  const locale = resolveEmailLocale({ locale: input.locale, countryCode: input.countryCode })
  const deliveryKey = `business-pilot-${input.applicationId}-${input.kind}-${hashRecipient(recipient)}`
  const { error: reservationError } = await admin.from('business_pilot_email_deliveries').insert({
    delivery_key: deliveryKey,
    application_id: input.applicationId,
    email_type: input.kind,
    locale,
    recipient_email: recipient,
    status: 'processing',
  })

  if (reservationError?.code === '23505') return { delivered: false, reason: 'duplicate' as const }
  if (reservationError) throw reservationError

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    await updateDelivery(admin, deliveryKey, 'skipped', null, 'RESEND_API_KEY_MISSING')
    return { delivered: false, reason: 'missing_provider_key' as const }
  }

  const message = buildPilotMessage(input, locale)
  const { data, error } = await new Resend(apiKey).emails.send(
    {
      from: process.env.AUTORELL_EMAIL_FROM || 'Autorell <noreply@autorell.com>',
      to: recipient,
      subject: message.subject,
      text: message.text,
      html: message.html,
    },
    { headers: { 'Idempotency-Key': deliveryKey } },
  )

  if (error) {
    await updateDelivery(admin, deliveryKey, 'failed', null, error.message)
    return { delivered: false, reason: error.message }
  }

  await updateDelivery(admin, deliveryKey, 'sent', data?.id || null, null)
  return { delivered: true, providerMessageId: data?.id || null }
}

function buildPilotMessage(input: PilotEmailInput, locale: EmailLocale) {
  const pageCopy = getBusinessPilotCopy(locale)
  const statusCopy = getStatusEmailCopy(locale, input.kind)
  const subject = input.kind === 'received'
    ? `${pageCopy.form.successTitle} | Autorell`
    : statusCopy.subject
  const body = input.kind === 'received' ? pageCopy.form.successBody : statusCopy.body
  const reference = input.applicationId.slice(0, 8).toUpperCase()
  const pilotUrl = localizedAccountUrl('/business/pilot', locale)
  const common = commonEmailCopy[locale]
  const note = input.note?.trim()
  const text = [
    subject,
    '',
    `${common.greeting} ${input.companyName},`,
    '',
    body,
    '',
    `${pageCopy.form.successReference}: ${reference}`,
    ...(note ? ['', `${common.note}: ${note}`] : []),
    '',
    `${common.open}: ${pilotUrl}`,
  ].join('\n')

  return {
    subject,
    text,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:32px;color:#101828"><div style="font-size:24px;font-weight:700">Autorell</div><h1 style="font-size:28px;line-height:1.25;margin:28px 0 12px">${escapeEmailHtml(subject)}</h1><p style="color:#475467;line-height:1.7">${escapeEmailHtml(common.greeting)} ${escapeEmailHtml(input.companyName)},</p><p style="color:#475467;line-height:1.7">${escapeEmailHtml(body)}</p><p style="color:#344054;font-weight:700">${escapeEmailHtml(pageCopy.form.successReference)}: ${escapeEmailHtml(reference)}</p>${note ? `<div style="margin:20px 0;padding:16px;border:1px solid #d0d5dd;border-radius:8px;color:#475467"><strong>${escapeEmailHtml(common.note)}:</strong><br>${escapeEmailHtml(note).replace(/\n/g, '<br>')}</div>` : ''}<p style="margin-top:28px"><a href="${escapeEmailHtml(pilotUrl)}" style="display:inline-block;background:#0866ff;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">${escapeEmailHtml(common.open)}</a></p><p style="margin-top:32px;color:#667085;font-size:13px">Autorell</p></div>`,
  }
}

async function updateDelivery(
  admin: SupabaseClient,
  deliveryKey: string,
  status: 'sent' | 'failed' | 'skipped',
  providerMessageId: string | null,
  errorMessage: string | null,
) {
  await admin.from('business_pilot_email_deliveries').update({
    status,
    provider_message_id: providerMessageId,
    error_message: errorMessage,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
  }).eq('delivery_key', deliveryKey)
}

function hashRecipient(email: string) {
  return crypto.createHash('sha256').update(email).digest('hex').slice(0, 16)
}

const commonEmailCopy: Record<EmailLocale, { greeting: string; note: string; open: string }> = {
  en: { greeting: 'Hello', note: 'Message from Autorell', open: 'Read about the pilot programme' },
  sv: { greeting: 'Hej', note: 'Meddelande från Autorell', open: 'Läs om pilotprogrammet' },
  de: { greeting: 'Guten Tag', note: 'Nachricht von Autorell', open: 'Informationen zum Pilotprogramm' },
  fr: { greeting: 'Bonjour', note: "Message d'Autorell", open: 'Découvrir le programme pilote' },
  es: { greeting: 'Hola', note: 'Mensaje de Autorell', open: 'Leer sobre el programa piloto' },
  it: { greeting: 'Buongiorno', note: 'Messaggio da Autorell', open: 'Scopri il programma pilota' },
  nl: { greeting: 'Hallo', note: 'Bericht van Autorell', open: 'Lees over het pilotprogramma' },
  fi: { greeting: 'Hei', note: 'Viesti Autorellilta', open: 'Lue pilottiohjelmasta' },
  da: { greeting: 'Hej', note: 'Besked fra Autorell', open: 'Læs om pilotprogrammet' },
  pl: { greeting: 'Dzień dobry', note: 'Wiadomość od Autorell', open: 'Przeczytaj o programie pilotażowym' },
}

type BasePilotEmailKind = Exclude<BusinessPilotEmailKind, 'pilot_ending_soon' | 'commercial_request'>
type StatusCopy = Record<BasePilotEmailKind, { subject: string; body: string }>

const statusEmailCopy: Record<EmailLocale, StatusCopy> = {
  en: statusCopy(
    ['Application received', 'We have received your application and will review the company before contacting you.'],
    ['More information is needed', 'We need some additional information before we can continue reviewing your pilot application.'],
    ['Your pilot application has been approved', 'Your company has been approved for the next stage. We will agree the pilot terms and technical setup before any inventory is published.'],
    ['Update on your pilot application', 'We cannot offer your company a place in this pilot round. The application does not create any commitment or subscription.'],
    ['Your Autorell pilot has started', 'The approved pilot period has started. Your agreed source and inventory will be managed under the pilot terms.'],
    ['Your Autorell pilot has been completed', 'The pilot period has been completed. Any continued commercial cooperation requires a separate agreement that your company explicitly accepts.'],
  ),
  sv: statusCopy(
    ['Ansökan mottagen', 'Vi har tagit emot er ansökan och granskar företaget innan vi kontaktar er.'],
    ['Vi behöver mer information', 'Vi behöver några kompletterande uppgifter innan vi kan fortsätta granskningen av er pilotansökan.'],
    ['Er pilotansökan har godkänts', 'Ert företag har godkänts för nästa steg. Vi kommer överens om pilotvillkor och teknisk anslutning innan något lager publiceras.'],
    ['Uppdatering om er pilotansökan', 'Vi kan inte erbjuda ert företag en plats i den här pilotomgången. Ansökan medför inget åtagande eller abonnemang.'],
    ['Er Autorell-pilot har startat', 'Den godkända pilotperioden har startat. Den överenskomna källan och lagret hanteras enligt pilotvillkoren.'],
    ['Er Autorell-pilot är avslutad', 'Pilotperioden är avslutad. Fortsatt kommersiellt samarbete kräver ett separat avtal som ert företag uttryckligen godkänner.'],
  ),
  de: statusCopy(
    ['Antrag eingegangen', 'Wir haben Ihren Antrag erhalten und prüfen das Unternehmen, bevor wir Kontakt aufnehmen.'],
    ['Weitere Informationen erforderlich', 'Wir benötigen zusätzliche Angaben, bevor wir die Prüfung Ihres Pilotantrags fortsetzen können.'],
    ['Ihr Pilotantrag wurde genehmigt', 'Ihr Unternehmen wurde für den nächsten Schritt zugelassen. Pilotbedingungen und technische Einrichtung werden vereinbart, bevor Fahrzeuge veröffentlicht werden.'],
    ['Aktualisierung zu Ihrem Pilotantrag', 'Wir können Ihrem Unternehmen in dieser Pilotrunde keinen Platz anbieten. Aus dem Antrag entstehen keine Verpflichtung und kein Abonnement.'],
    ['Ihr Autorell-Pilot ist gestartet', 'Der genehmigte Pilotzeitraum hat begonnen. Quelle und Bestand werden gemäß den Pilotbedingungen verwaltet.'],
    ['Ihr Autorell-Pilot ist abgeschlossen', 'Der Pilotzeitraum ist abgeschlossen. Jede weitere kommerzielle Zusammenarbeit erfordert eine separate, ausdrücklich angenommene Vereinbarung.'],
  ),
  fr: statusCopy(
    ['Candidature reçue', "Nous avons reçu votre candidature et examinerons l'entreprise avant de vous contacter."],
    ["Informations complémentaires nécessaires", "Nous avons besoin de renseignements supplémentaires avant de poursuivre l'examen de votre candidature."],
    ['Votre candidature au pilote est approuvée', "Votre entreprise est admise à l'étape suivante. Les conditions du pilote et la configuration technique seront convenues avant toute publication."],
    ['Mise à jour de votre candidature', "Nous ne pouvons pas proposer de place à votre entreprise lors de cette phase pilote. La candidature ne crée aucun engagement ni abonnement."],
    ['Votre pilote Autorell a commencé', "La période pilote approuvée a commencé. La source et le stock convenus seront gérés selon les conditions du pilote."],
    ['Votre pilote Autorell est terminé', "La période pilote est terminée. Toute coopération commerciale ultérieure exige un accord distinct explicitement accepté par votre entreprise."],
  ),
  es: statusCopy(
    ['Solicitud recibida', 'Hemos recibido la solicitud y revisaremos la empresa antes de ponernos en contacto.'],
    ['Se necesita más información', 'Necesitamos algunos datos adicionales antes de continuar revisando la solicitud del piloto.'],
    ['La solicitud del piloto ha sido aprobada', 'La empresa ha sido aprobada para la siguiente fase. Acordaremos las condiciones y la configuración técnica antes de publicar el inventario.'],
    ['Actualización sobre la solicitud', 'No podemos ofrecer a la empresa una plaza en esta ronda piloto. La solicitud no crea ningún compromiso ni suscripción.'],
    ['El piloto de Autorell ha comenzado', 'El periodo piloto aprobado ha comenzado. La fuente y el inventario acordados se gestionarán conforme a sus condiciones.'],
    ['El piloto de Autorell ha finalizado', 'El periodo piloto ha finalizado. Cualquier colaboración comercial posterior requiere un acuerdo independiente aceptado expresamente por la empresa.'],
  ),
  it: statusCopy(
    ['Candidatura ricevuta', "Abbiamo ricevuto la candidatura e valuteremo l'azienda prima di contattarla."],
    ['Sono necessarie altre informazioni', 'Abbiamo bisogno di alcune informazioni aggiuntive prima di proseguire la valutazione della candidatura.'],
    ['La candidatura al progetto pilota è stata approvata', "L'azienda è stata ammessa alla fase successiva. Condizioni e configurazione tecnica saranno concordate prima di pubblicare qualsiasi veicolo."],
    ['Aggiornamento sulla candidatura', "Non possiamo offrire all'azienda un posto in questa fase pilota. La candidatura non comporta alcun impegno o abbonamento."],
    ['Il progetto pilota Autorell è iniziato', "Il periodo pilota approvato è iniziato. La fonte e l'inventario concordati saranno gestiti secondo le condizioni del progetto."],
    ['Il progetto pilota Autorell è terminato', "Il periodo pilota è terminato. Ogni ulteriore collaborazione commerciale richiede un accordo separato accettato esplicitamente dall'azienda."],
  ),
  nl: statusCopy(
    ['Aanvraag ontvangen', 'Wij hebben uw aanvraag ontvangen en beoordelen het bedrijf voordat we contact opnemen.'],
    ['Meer informatie nodig', 'Wij hebben aanvullende gegevens nodig voordat we de beoordeling van uw pilotaanvraag kunnen voortzetten.'],
    ['Uw pilotaanvraag is goedgekeurd', 'Uw bedrijf is toegelaten tot de volgende stap. We spreken de pilotvoorwaarden en technische inrichting af voordat voorraad wordt gepubliceerd.'],
    ['Update over uw pilotaanvraag', 'Wij kunnen uw bedrijf in deze pilotronde geen plaats aanbieden. De aanvraag leidt niet tot een verplichting of abonnement.'],
    ['Uw Autorell-pilot is gestart', 'De goedgekeurde pilotperiode is gestart. De afgesproken bron en voorraad worden volgens de pilotvoorwaarden beheerd.'],
    ['Uw Autorell-pilot is afgerond', 'De pilotperiode is afgerond. Verdere commerciële samenwerking vereist een afzonderlijke overeenkomst die uw bedrijf uitdrukkelijk aanvaardt.'],
  ),
  fi: statusCopy(
    ['Hakemus vastaanotettu', 'Olemme vastaanottaneet hakemuksen ja tarkistamme yrityksen ennen yhteydenottoa.'],
    ['Tarvitsemme lisätietoja', 'Tarvitsemme lisätietoja ennen kuin voimme jatkaa pilottihakemuksen käsittelyä.'],
    ['Pilottihakemuksenne on hyväksytty', 'Yritys on hyväksytty seuraavaan vaiheeseen. Pilottiehdot ja tekninen toteutus sovitaan ennen ajoneuvojen julkaisemista.'],
    ['Päivitys pilottihakemukseen', 'Emme voi tarjota yritykselle paikkaa tässä pilottikierroksessa. Hakemus ei luo sitoumusta tai tilausta.'],
    ['Autorell-pilottinne on alkanut', 'Hyväksytty pilottijakso on alkanut. Sovittua lähdettä ja varastoa hallitaan pilottiehtojen mukaisesti.'],
    ['Autorell-pilottinne on päättynyt', 'Pilottijakso on päättynyt. Jatkoyhteistyö edellyttää erillistä sopimusta, jonka yritys hyväksyy nimenomaisesti.'],
  ),
  da: statusCopy(
    ['Ansøgning modtaget', 'Vi har modtaget ansøgningen og gennemgår virksomheden, før vi tager kontakt.'],
    ['Vi har brug for flere oplysninger', 'Vi har brug for yderligere oplysninger, før vi kan fortsætte behandlingen af pilotansøgningen.'],
    ['Jeres pilotansøgning er godkendt', 'Virksomheden er godkendt til næste trin. Pilotvilkår og teknisk opsætning aftales, før lageret offentliggøres.'],
    ['Opdatering om pilotansøgningen', 'Vi kan ikke tilbyde virksomheden en plads i denne pilotrunde. Ansøgningen medfører ingen forpligtelse eller abonnement.'],
    ['Jeres Autorell-pilot er startet', 'Den godkendte pilotperiode er startet. Den aftalte kilde og lagerbeholdning håndteres efter pilotvilkårene.'],
    ['Jeres Autorell-pilot er afsluttet', 'Pilotperioden er afsluttet. Fortsat kommercielt samarbejde kræver en separat aftale, som virksomheden udtrykkeligt accepterer.'],
  ),
  pl: statusCopy(
    ['Wniosek został odebrany', 'Otrzymaliśmy wniosek i zweryfikujemy firmę przed nawiązaniem kontaktu.'],
    ['Potrzebujemy dodatkowych informacji', 'Potrzebujemy dodatkowych danych, zanim będziemy mogli kontynuować ocenę wniosku pilotażowego.'],
    ['Wniosek pilotażowy został zatwierdzony', 'Firma została zakwalifikowana do kolejnego etapu. Warunki pilotażu i konfiguracja techniczna zostaną uzgodnione przed publikacją pojazdów.'],
    ['Aktualizacja dotycząca wniosku', 'Nie możemy zaoferować firmie miejsca w tej rundzie pilotażowej. Wniosek nie powoduje żadnych zobowiązań ani subskrypcji.'],
    ['Pilotaż Autorell został rozpoczęty', 'Zatwierdzony okres pilotażowy rozpoczął się. Uzgodnione źródło i zapasy będą obsługiwane zgodnie z warunkami pilotażu.'],
    ['Pilotaż Autorell został zakończony', 'Okres pilotażowy został zakończony. Dalsza współpraca komercyjna wymaga odrębnej umowy wyraźnie zaakceptowanej przez firmę.'],
  ),
}

const additionalStatusEmailCopy: Record<EmailLocale, Record<'pilot_ending_soon' | 'commercial_request', { subject: string; body: string }>> = {
  en: additional(['Your Autorell pilot is nearing its end date', 'Your planned pilot end date is approaching. Nothing converts into a paid subscription automatically; any continued cooperation requires a separate agreement.'], ['Your request has been sent to Autorell', 'We have received your request to discuss continued cooperation. The business team will review the documented results and contact you separately.']),
  sv: additional(['Er Autorell-pilot närmar sig slutdatumet', 'Pilotens planerade slutdatum närmar sig. Ingenting övergår automatiskt till ett betalt abonnemang; fortsatt samarbete kräver ett separat avtal.'], ['Er förfrågan har skickats till Autorell', 'Vi har tagit emot er förfrågan om fortsatt samarbete. Företagsteamet granskar de dokumenterade resultaten och kontaktar er separat.']),
  de: additional(['Ihr Autorell-Pilot nähert sich dem Enddatum', 'Das geplante Enddatum Ihres Piloten rückt näher. Es erfolgt keine automatische Umwandlung in ein kostenpflichtiges Abonnement; jede Fortsetzung erfordert eine separate Vereinbarung.'], ['Ihre Anfrage wurde an Autorell gesendet', 'Wir haben Ihre Anfrage zur weiteren Zusammenarbeit erhalten. Das Unternehmensteam prüft die dokumentierten Ergebnisse und meldet sich separat.']),
  fr: additional(['Votre pilote Autorell approche de sa date de fin', 'La date de fin prévue approche. Aucun abonnement payant ne démarre automatiquement ; toute poursuite de la coopération nécessite un accord distinct.'], ['Votre demande a été envoyée à Autorell', 'Nous avons reçu votre demande concernant la poursuite de la coopération. L’équipe entreprises examinera les résultats documentés et vous contactera séparément.']),
  es: additional(['El piloto de Autorell se acerca a su fecha de finalización', 'Se acerca la fecha prevista de finalización. No se convierte automáticamente en una suscripción de pago; cualquier continuación requiere un acuerdo independiente.'], ['La solicitud se ha enviado a Autorell', 'Hemos recibido la solicitud para hablar de una colaboración futura. El equipo de empresas revisará los resultados documentados y se pondrá en contacto por separado.']),
  it: additional(['Il progetto pilota Autorell si avvicina alla data di fine', 'La data di fine prevista si avvicina. Non avviene alcuna conversione automatica a un abbonamento a pagamento; ogni prosecuzione richiede un accordo separato.'], ['La richiesta è stata inviata ad Autorell', 'Abbiamo ricevuto la richiesta di discutere una futura collaborazione. Il team aziende esaminerà i risultati documentati e vi contatterà separatamente.']),
  nl: additional(['Uw Autorell-pilot nadert de einddatum', 'De geplande einddatum komt dichterbij. Er volgt geen automatische omzetting naar een betaald abonnement; verdere samenwerking vereist een afzonderlijke overeenkomst.'], ['Uw verzoek is naar Autorell verzonden', 'Wij hebben uw verzoek voor verdere samenwerking ontvangen. Het bedrijfsteam beoordeelt de vastgelegde resultaten en neemt afzonderlijk contact op.']),
  fi: additional(['Autorell-pilottinne lähestyy päättymispäivää', 'Suunniteltu päättymispäivä lähestyy. Pilotti ei muutu automaattisesti maksulliseksi tilaukseksi, vaan jatko edellyttää erillistä sopimusta.'], ['Pyyntönne on lähetetty Autorellille', 'Olemme vastaanottaneet pyyntönne jatkoyhteistyön keskustelusta. Yritystiimi tarkistaa dokumentoidut tulokset ja ottaa erikseen yhteyttä.']),
  da: additional(['Jeres Autorell-pilot nærmer sig slutdatoen', 'Den planlagte slutdato nærmer sig. Intet overgår automatisk til et betalt abonnement; fortsat samarbejde kræver en separat aftale.'], ['Jeres forespørgsel er sendt til Autorell', 'Vi har modtaget jeres forespørgsel om fortsat samarbejde. Virksomhedsteamet gennemgår de dokumenterede resultater og kontakter jer separat.']),
  pl: additional(['Pilotaż Autorell zbliża się do daty zakończenia', 'Zbliża się planowana data zakończenia. Pilotaż nie zmieni się automatycznie w płatną subskrypcję; dalsza współpraca wymaga odrębnej umowy.'], ['Wniosek został wysłany do Autorell', 'Otrzymaliśmy prośbę o rozmowę dotyczącą dalszej współpracy. Zespół firmowy przeanalizuje udokumentowane wyniki i skontaktuje się osobno.']),
}

function getStatusEmailCopy(locale: EmailLocale, kind: BusinessPilotEmailKind) {
  if (kind === 'pilot_ending_soon' || kind === 'commercial_request') return additionalStatusEmailCopy[locale][kind]
  return statusEmailCopy[locale][kind]
}

function additional(ending: [string, string], commercial: [string, string]) {
  return { pilot_ending_soon: pair(ending), commercial_request: pair(commercial) }
}

function statusCopy(
  received: [string, string],
  moreInformation: [string, string],
  approved: [string, string],
  rejected: [string, string],
  active: [string, string],
  completed: [string, string],
): StatusCopy {
  return {
    received: pair(received),
    more_information_required: pair(moreInformation),
    approved: pair(approved),
    rejected: pair(rejected),
    pilot_active: pair(active),
    pilot_completed: pair(completed),
  }
}

function pair([subject, body]: [string, string]) {
  return { subject, body }
}
