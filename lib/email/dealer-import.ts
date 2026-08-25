import 'server-only'

import crypto from 'node:crypto'
import { Resend } from 'resend'
import type { SupabaseClient } from '@supabase/supabase-js'
import { escapeEmailHtml, localizedAccountUrl, resolveEmailLocale, type EmailLocale } from '@/lib/email/localization'

export type DealerImportEmailKind = 'domain_verified' | 'analysis_completed' | 'first_import_completed' | 'import_failed' | 'sync_problem'

export async function sendDealerImportEmail(admin: SupabaseClient, input: { sourceId: string; runId?: string | null; kind: DealerImportEmailKind; note?: string | null }) {
  const { data: source, error } = await admin.from('dealer_import_sources').select('id,organization_id,pilot_program_id,name').eq('id', input.sourceId).maybeSingle()
  if (error) throw error
  if (!source) return { delivered: false, reason: 'source_not_found' as const }

  const [{ data: company }, { data: program }] = await Promise.all([
    admin.from('marketplace_companies').select('name,country_code,contact_email').eq('id', source.organization_id).maybeSingle(),
    source.pilot_program_id ? admin.from('business_pilot_programs').select('application_id').eq('id', source.pilot_program_id).maybeSingle() : Promise.resolve({ data: null }),
  ])
  const { data: application } = program?.application_id
    ? await admin.from('business_pilot_applications').select('contact_email,locale,country_code,company_name').eq('id', program.application_id).maybeSingle()
    : { data: null }
  const recipient = String(application?.contact_email || company?.contact_email || '').trim().toLowerCase()
  if (!recipient.includes('@')) return { delivered: false, reason: 'missing_recipient' as const }
  const locale = resolveEmailLocale({ locale: application?.locale, countryCode: application?.country_code || company?.country_code })
  const repeatSuffix = ['analysis_completed', 'import_failed', 'sync_problem'].includes(input.kind) ? `-${input.runId || crypto.randomUUID()}` : ''
  const deliveryKey = `dealer-import-${source.id}-${input.kind}${repeatSuffix}-${hashRecipient(recipient)}`
  const { error: reservationError } = await admin.from('dealer_import_email_deliveries').insert({
    delivery_key: deliveryKey,
    organization_id: source.organization_id,
    source_id: source.id,
    run_id: input.runId || null,
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

  const companyName = String(application?.company_name || company?.name || 'Autorell dealer')
  const message = buildMessage({ kind: input.kind, locale, companyName, sourceName: String(source.name), note: input.note })
  const { data, error: sendError } = await new Resend(apiKey).emails.send({
    from: process.env.AUTORELL_EMAIL_FROM || 'Autorell <noreply@autorell.com>',
    to: recipient,
    subject: message.subject,
    text: message.text,
    html: message.html,
  }, { headers: { 'Idempotency-Key': deliveryKey } })
  if (sendError) {
    await updateDelivery(admin, deliveryKey, 'failed', null, sendError.message)
    return { delivered: false, reason: sendError.message }
  }
  await updateDelivery(admin, deliveryKey, 'sent', data?.id || null, null)
  return { delivered: true, providerMessageId: data?.id || null }
}

function buildMessage(input: { kind: DealerImportEmailKind; locale: EmailLocale; companyName: string; sourceName: string; note?: string | null }) {
  const copy = eventCopy[input.locale]
  const event = copy.events[input.kind]
  const accountUrl = localizedAccountUrl('/account/company/inventory', input.locale)
  const note = input.note?.trim().slice(0, 1000)
  const text = [event.subject, '', `${copy.greeting} ${input.companyName},`, '', event.body, '', `${copy.source}: ${input.sourceName}`, ...(note ? ['', `${copy.details}: ${note}`] : []), '', `${copy.open}: ${accountUrl}`].join('\n')
  return {
    subject: event.subject,
    text,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:32px;color:#101828"><div style="font-size:24px;font-weight:700">Autorell</div><h1 style="font-size:28px;line-height:1.25;margin:28px 0 12px">${escapeEmailHtml(event.subject)}</h1><p style="color:#475467;line-height:1.7">${escapeEmailHtml(copy.greeting)} ${escapeEmailHtml(input.companyName)},</p><p style="color:#475467;line-height:1.7">${escapeEmailHtml(event.body)}</p><p style="color:#344054"><strong>${escapeEmailHtml(copy.source)}:</strong> ${escapeEmailHtml(input.sourceName)}</p>${note ? `<div style="margin:20px 0;padding:16px;border:1px solid #d0d5dd;border-radius:8px;color:#475467"><strong>${escapeEmailHtml(copy.details)}:</strong><br>${escapeEmailHtml(note)}</div>` : ''}<p style="margin-top:28px"><a href="${escapeEmailHtml(accountUrl)}" style="display:inline-block;background:#0866ff;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">${escapeEmailHtml(copy.open)}</a></p><p style="margin-top:32px;color:#667085;font-size:13px">Autorell</p></div>`,
  }
}

async function updateDelivery(admin: SupabaseClient, key: string, status: 'sent' | 'failed' | 'skipped', providerMessageId: string | null, errorMessage: string | null) {
  await admin.from('dealer_import_email_deliveries').update({ status, provider_message_id: providerMessageId, error_message: errorMessage, sent_at: status === 'sent' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('delivery_key', key)
}

function hashRecipient(email: string) { return crypto.createHash('sha256').update(email).digest('hex').slice(0, 16) }

type EventCopy = { greeting: string; source: string; details: string; open: string; events: Record<DealerImportEmailKind, { subject: string; body: string }> }
const eventCopy: Record<EmailLocale, EventCopy> = {
  en: copy('Hello', 'Import source', 'Details', 'Open inventory connection', ['Domain verified', 'The domain for your inventory source has been verified.'], ['Inventory analysis completed', 'Autorell has completed the source analysis. You can now review the imported preview before publication.'], ['First inventory import completed', 'The first approved inventory import has completed. Imported vehicles are now managed from your company account.'], ['Inventory import failed', 'The import could not be completed. Autorell has recorded the error and will review or retry the source safely.'], ['Inventory synchronisation problem', 'A scheduled synchronisation encountered a problem. Existing listings have not been removed because of this temporary error.']),
  sv: copy('Hej', 'Importkälla', 'Detaljer', 'Öppna lageranslutningen', ['Domänen är verifierad', 'Domänen för er importkälla har verifierats.'], ['Lageranalysen är färdig', 'Autorell har slutfört källanalysen. Ni kan nu granska importförhandsvisningen före publicering.'], ['Den första lagerimporten är färdig', 'Den första godkända lagerimporten är klar. Importerade fordon hanteras nu från företagskontot.'], ['Lagerimporten misslyckades', 'Importen kunde inte slutföras. Autorell har registrerat felet och granskar eller försöker källan igen på ett säkert sätt.'], ['Problem med lagersynk', 'En planerad synk stötte på ett problem. Befintliga annonser har inte tagits bort på grund av detta tillfälliga fel.']),
  de: copy('Guten Tag', 'Importquelle', 'Details', 'Bestandsanbindung öffnen', ['Domain verifiziert', 'Die Domain Ihrer Importquelle wurde verifiziert.'], ['Bestandsanalyse abgeschlossen', 'Autorell hat die Quellenanalyse abgeschlossen. Sie können nun die Importvorschau vor der Veröffentlichung prüfen.'], ['Erster Bestandsimport abgeschlossen', 'Der erste freigegebene Bestandsimport ist abgeschlossen. Importierte Fahrzeuge werden nun im Unternehmenskonto verwaltet.'], ['Bestandsimport fehlgeschlagen', 'Der Import konnte nicht abgeschlossen werden. Autorell hat den Fehler erfasst und prüft die Quelle oder versucht sie sicher erneut.'], ['Problem bei der Bestandssynchronisierung', 'Bei einer geplanten Synchronisierung ist ein Problem aufgetreten. Bestehende Anzeigen wurden wegen dieses vorübergehenden Fehlers nicht entfernt.']),
  fr: copy('Bonjour', 'Source d’import', 'Détails', 'Ouvrir la connexion de stock', ['Domaine vérifié', 'Le domaine de votre source d’import a été vérifié.'], ['Analyse du stock terminée', 'Autorell a terminé l’analyse de la source. Vous pouvez maintenant vérifier l’aperçu avant publication.'], ['Premier import de stock terminé', 'Le premier import approuvé est terminé. Les véhicules importés sont désormais gérés depuis votre compte entreprise.'], ['Échec de l’import de stock', 'L’import n’a pas pu être terminé. Autorell a enregistré l’erreur et examinera ou réessaiera la source en toute sécurité.'], ['Problème de synchronisation du stock', 'Une synchronisation planifiée a rencontré un problème. Les annonces existantes n’ont pas été supprimées à cause de cette erreur temporaire.']),
  es: copy('Hola', 'Fuente de importación', 'Detalles', 'Abrir conexión de inventario', ['Dominio verificado', 'Se ha verificado el dominio de la fuente de importación.'], ['Análisis del inventario completado', 'Autorell ha completado el análisis. Ya puedes revisar la vista previa antes de publicar.'], ['Primera importación completada', 'La primera importación aprobada ha finalizado. Los vehículos importados se gestionan desde la cuenta de empresa.'], ['La importación ha fallado', 'No se pudo completar la importación. Autorell ha registrado el error y revisará o reintentará la fuente de forma segura.'], ['Problema de sincronización', 'Una sincronización programada encontró un problema. Los anuncios existentes no se han retirado por este error temporal.']),
  it: copy('Buongiorno', 'Fonte di importazione', 'Dettagli', 'Apri connessione inventario', ['Dominio verificato', 'Il dominio della fonte di importazione è stato verificato.'], ['Analisi inventario completata', 'Autorell ha completato l’analisi della fonte. Ora puoi controllare l’anteprima prima della pubblicazione.'], ['Prima importazione completata', 'La prima importazione approvata è terminata. I veicoli importati sono ora gestiti dall’account aziendale.'], ['Importazione non riuscita', 'Non è stato possibile completare l’importazione. Autorell ha registrato l’errore e controllerà o riproverà la fonte in sicurezza.'], ['Problema di sincronizzazione', 'Una sincronizzazione pianificata ha riscontrato un problema. Gli annunci esistenti non sono stati rimossi per questo errore temporaneo.']),
  nl: copy('Hallo', 'Importbron', 'Details', 'Voorraadkoppeling openen', ['Domein geverifieerd', 'Het domein van uw importbron is geverifieerd.'], ['Voorraadanalyse voltooid', 'Autorell heeft de bronanalyse voltooid. U kunt nu het importvoorbeeld vóór publicatie controleren.'], ['Eerste voorraadimport voltooid', 'De eerste goedgekeurde import is voltooid. Geïmporteerde voertuigen worden nu vanuit het bedrijfsaccount beheerd.'], ['Voorraadimport mislukt', 'De import kon niet worden voltooid. Autorell heeft de fout vastgelegd en controleert of probeert de bron veilig opnieuw.'], ['Probleem met voorraadsynchronisatie', 'Een geplande synchronisatie ondervond een probleem. Bestaande advertenties zijn door deze tijdelijke fout niet verwijderd.']),
  fi: copy('Hei', 'Tuontilähde', 'Tiedot', 'Avaa varastoyhteys', ['Verkkotunnus vahvistettu', 'Tuontilähteen verkkotunnus on vahvistettu.'], ['Varastoanalyysi valmis', 'Autorell on suorittanut lähdeanalyysin. Voitte nyt tarkistaa tuontiesikatselun ennen julkaisua.'], ['Ensimmäinen varastotuonti valmis', 'Ensimmäinen hyväksytty varastotuonti on valmis. Tuotuja ajoneuvoja hallitaan nyt yritystililtä.'], ['Varastotuonti epäonnistui', 'Tuontia ei voitu suorittaa. Autorell on tallentanut virheen ja tarkistaa lähteen tai yrittää sitä turvallisesti uudelleen.'], ['Varastosynkronoinnin ongelma', 'Ajastetussa synkronoinnissa ilmeni ongelma. Olemassa olevia ilmoituksia ei poistettu tämän tilapäisen virheen vuoksi.']),
  da: copy('Hej', 'Importkilde', 'Detaljer', 'Åbn lagerforbindelsen', ['Domænet er verificeret', 'Domænet for jeres importkilde er verificeret.'], ['Lageranalysen er færdig', 'Autorell har afsluttet kildeanalysen. I kan nu gennemgå importforhåndsvisningen før publicering.'], ['Første lagerimport er færdig', 'Den første godkendte lagerimport er gennemført. Importerede køretøjer administreres nu fra virksomhedskontoen.'], ['Lagerimporten mislykkedes', 'Importen kunne ikke gennemføres. Autorell har registreret fejlen og gennemgår eller prøver kilden sikkert igen.'], ['Problem med lagersynkronisering', 'En planlagt synkronisering stødte på et problem. Eksisterende annoncer er ikke fjernet på grund af denne midlertidige fejl.']),
  pl: copy('Dzień dobry', 'Źródło importu', 'Szczegóły', 'Otwórz połączenie zapasów', ['Domena zweryfikowana', 'Domena źródła importu została zweryfikowana.'], ['Analiza zapasów zakończona', 'Autorell zakończył analizę źródła. Można teraz sprawdzić podgląd importu przed publikacją.'], ['Pierwszy import zapasów zakończony', 'Pierwszy zatwierdzony import został zakończony. Pojazdami można teraz zarządzać z konta firmowego.'], ['Import zapasów nie powiódł się', 'Nie udało się zakończyć importu. Autorell zapisał błąd i bezpiecznie sprawdzi lub ponowi próbę dla źródła.'], ['Problem z synchronizacją zapasów', 'Podczas zaplanowanej synchronizacji wystąpił problem. Istniejące ogłoszenia nie zostały usunięte z powodu tego tymczasowego błędu.']),
}

function copy(greeting: string, source: string, details: string, open: string, domain: [string, string], analysis: [string, string], firstImport: [string, string], failed: [string, string], sync: [string, string]): EventCopy {
  return { greeting, source, details, open, events: { domain_verified: pair(domain), analysis_completed: pair(analysis), first_import_completed: pair(firstImport), import_failed: pair(failed), sync_problem: pair(sync) } }
}
function pair([subject, body]: [string, string]) { return { subject, body } }
