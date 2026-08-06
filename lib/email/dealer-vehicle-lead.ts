import 'server-only'

import { Resend } from 'resend'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  dealerPlanCanReceiveLeads,
  dealerSubscriptionIsActive,
  normalizeDealerLeadCountryCode,
  normalizeDealerLeadCountryCodes,
  normalizeEmail,
  resolveDealerLeadCountryScope,
  type DealerLeadPreferences,
} from '@/lib/dealer-leads/access'
import { escapeEmailHtml, resolveEmailLocale, type EmailLocale } from '@/lib/email/localization'
import { translatePublic } from '@/lib/public-i18n'

type DealerLeadEmailInput = {
  id: string
  reference: string
  sourceCountryCode: string
  make: string
  model: string
  modelYear: number
  mileageKm: number
  fuelType: string
  transmission: string
  city: string
  postalCode: string
  contactName: string
  contactEmail: string
  contactPhone: string
  preferredContact: string
  visibleDamage: string
  imageCount: number
}

type Recipient = {
  userId: string
  email: string
  locale: EmailLocale
  countryCode: string
}

export async function sendDealerVehicleLeadNotifications(admin: SupabaseClient, lead: DealerLeadEmailInput) {
  const recipients = await findRecipients(admin, lead.sourceCountryCode)
  const results = []
  for (const recipient of recipients) {
    results.push(await sendToRecipient(admin, lead, recipient))
  }
  return results
}

async function findRecipients(admin: SupabaseClient, sourceCountryCode: string): Promise<Recipient[]> {
  const country = normalizeDealerLeadCountryCode(sourceCountryCode)
  if (!country) return []

  const { data: subscriptions, error: subscriptionError } = await admin
    .from('business_subscriptions')
    .select('user_id,plan_key,status,manually_activated,free_period_ends_at,updated_at')
    .order('updated_at', { ascending: false })
    .limit(2000)
  if (subscriptionError) throw subscriptionError

  const latestByUser = new Map<string, (typeof subscriptions)[number]>()
  for (const subscription of subscriptions || []) {
    if (!latestByUser.has(subscription.user_id)) latestByUser.set(subscription.user_id, subscription)
  }
  const eligibleOwnerIds = [...latestByUser.values()]
    .filter((subscription) => dealerPlanCanReceiveLeads(subscription.plan_key) && dealerSubscriptionIsActive(subscription))
    .map((subscription) => subscription.user_id)
  if (!eligibleOwnerIds.length) return []

  const { data: companies, error: companyError } = await admin
    .from('marketplace_companies')
    .select('id,created_by')
    .in('created_by', eligibleOwnerIds)
  if (companyError) throw companyError
  const companyIds = (companies || []).map((company) => company.id)

  const [{ data: ownerProfiles, error: ownerProfileError }, companyProfileResult] = await Promise.all([
    admin
      .from('marketplace_profiles')
      .select('user_id,company_id,email,country_code,locale,account_type')
      .in('user_id', eligibleOwnerIds)
      .eq('account_type', 'business'),
    companyIds.length
      ? admin
          .from('marketplace_profiles')
          .select('user_id,company_id,email,country_code,locale,account_type')
          .in('company_id', companyIds)
          .eq('account_type', 'business')
      : Promise.resolve({ data: [], error: null }),
  ])
  if (ownerProfileError) throw ownerProfileError
  if (companyProfileResult.error) throw companyProfileResult.error

  const profilesByUser = new Map<string, NonNullable<typeof ownerProfiles>[number]>()
  for (const profile of [...(ownerProfiles || []), ...(companyProfileResult.data || [])]) profilesByUser.set(profile.user_id, profile)
  const profileIds = [...profilesByUser.keys()]
  if (!profileIds.length) return []

  const { data: preferenceRows, error: preferenceError } = await admin
    .from('dealer_lead_notification_preferences')
    .select('user_id,email_enabled,notification_email,all_countries,country_codes')
    .in('user_id', profileIds)
  if (preferenceError) throw preferenceError

  const preferences = new Map((preferenceRows || []).map((row) => [row.user_id, row]))
  const eligibleOwners = new Set(eligibleOwnerIds)
  const seenEmails = new Set<string>()
  const recipients: Recipient[] = []
  for (const profile of profilesByUser.values()) {
    const row = preferences.get(profile.user_id)
    // The subscription owner receives matching leads by default. Team members opt in
    // by saving their own notification preferences in the company portal.
    if (!row && !eligibleOwners.has(profile.user_id)) continue
    if (row?.email_enabled === false) continue
    const preference: Pick<DealerLeadPreferences, 'allCountries' | 'countryCodes'> = {
      allCountries: row?.all_countries === true,
      countryCodes: row ? normalizeDealerLeadCountryCodes(row.country_codes) : normalizeDealerLeadCountryCodes([profile.country_code]),
    }
    const scope = resolveDealerLeadCountryScope(preference, profile.country_code)
    if (!scope.includes(country)) continue
    const email = normalizeEmail(row?.notification_email) || normalizeEmail(profile.email)
    if (!email || seenEmails.has(email)) continue
    seenEmails.add(email)
    recipients.push({
      userId: profile.user_id,
      email,
      locale: resolveEmailLocale({ locale: profile.locale, countryCode: profile.country_code }),
      countryCode: String(profile.country_code || country).toUpperCase(),
    })
  }
  return recipients
}

async function sendToRecipient(admin: SupabaseClient, lead: DealerLeadEmailInput, recipient: Recipient) {
  const { data: reservation, error: reservationError } = await admin
    .from('dealer_vehicle_lead_email_deliveries')
    .insert({
      lead_id: lead.id,
      user_id: recipient.userId,
      recipient_email: recipient.email,
      locale: recipient.locale,
      status: 'processing',
    })
    .select('id')
    .single()

  if (reservationError?.code === '23505') return { delivered: false, reason: 'duplicate' as const }
  if (reservationError || !reservation) throw reservationError || new Error('EMAIL_DELIVERY_RESERVATION_FAILED')

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    await updateDelivery(admin, reservation.id, 'skipped', null, 'RESEND_API_KEY_MISSING')
    return { delivered: false, reason: 'missing_provider_key' as const }
  }

  const message = buildMessage(lead, recipient)
  const { data, error } = await new Resend(apiKey).emails.send(
    {
      from: process.env.AUTORELL_EMAIL_FROM || 'Autorell <noreply@autorell.com>',
      to: recipient.email,
      subject: message.subject,
      text: message.text,
      html: message.html,
    },
    { headers: { 'Idempotency-Key': `dealer-lead-${lead.id}-${recipient.userId}` } },
  )

  if (error) {
    await updateDelivery(admin, reservation.id, 'failed', null, error.message)
    return { delivered: false, reason: error.message }
  }
  await updateDelivery(admin, reservation.id, 'sent', data?.id || null, null)
  return { delivered: true, providerMessageId: data?.id || null }
}

function buildMessage(lead: DealerLeadEmailInput, recipient: Recipient) {
  const copy = emailCopy[recipient.locale]
  const vehicle = `${lead.make} ${lead.model} ${lead.modelYear}`.trim()
  const url = dealerOffersUrl(recipient.countryCode)
  const subject = copy.subject.replace('{vehicle}', vehicle)
  const rows = [
    [copy.vehicle, vehicle],
    [copy.mileage, `${new Intl.NumberFormat(localeTag(recipient.locale)).format(lead.mileageKm)} km`],
    [copy.fuel, translatePublic(recipient.locale, lead.fuelType)],
    [copy.transmission, translatePublic(recipient.locale, lead.transmission)],
    [copy.location, `${lead.postalCode} ${lead.city}`.trim()],
    [copy.condition, translatePublic(recipient.locale, lead.visibleDamage)],
    [copy.photos, String(lead.imageCount)],
    [copy.seller, lead.contactName],
    [copy.phone, lead.contactPhone],
    [copy.email, lead.contactEmail],
    [copy.preferredContact, translatePublic(recipient.locale, lead.preferredContact)],
    [copy.reference, lead.reference],
  ]
  const text = [
    subject,
    '',
    copy.intro,
    '',
    ...rows.map(([label, value]) => `${label}: ${value || '-'}`),
    '',
    `${copy.open}: ${url}`,
  ].join('\n')

  const tableRows = rows.map(([label, value]) => `<tr><td style="padding:7px 12px 7px 0;color:#667085;vertical-align:top">${escapeEmailHtml(label)}</td><td style="padding:7px 0;color:#101828;font-weight:600">${escapeEmailHtml(value || '-')}</td></tr>`).join('')
  return {
    subject,
    text,
    html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;padding:32px;color:#101828"><div style="font-size:26px;font-weight:800;color:#0866ff">autorell</div><p style="margin:26px 0 8px;color:#0866ff;font-size:13px;font-weight:700;text-transform:uppercase">${escapeEmailHtml(copy.eyebrow)}</p><h1 style="font-size:28px;line-height:1.25;margin:0 0 14px">${escapeEmailHtml(subject)}</h1><p style="color:#475467;line-height:1.7">${escapeEmailHtml(copy.intro)}</p><table style="width:100%;border-collapse:collapse;margin:22px 0;padding:18px;background:#f7fbff;border-radius:12px">${tableRows}</table><p style="margin-top:28px"><a href="${escapeEmailHtml(url)}" style="display:inline-block;background:#0866ff;color:#fff;padding:13px 20px;border-radius:999px;text-decoration:none;font-weight:700">${escapeEmailHtml(copy.open)}</a></p><p style="margin-top:28px;color:#667085;font-size:13px;line-height:1.6">${escapeEmailHtml(copy.contactHint)}</p><p style="margin-top:30px;color:#98a2b3;font-size:12px">Autorell</p></div>`,
  }
}

async function updateDelivery(admin: SupabaseClient, id: string, status: 'sent' | 'failed' | 'skipped', providerMessageId: string | null, errorMessage: string | null) {
  await admin.from('dealer_vehicle_lead_email_deliveries').update({
    status,
    provider_message_id: providerMessageId,
    error_message: errorMessage,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
}

function dealerOffersUrl(countryCode: string) {
  const market = normalizeDealerLeadCountryCode(countryCode)?.toLowerCase() || 'se'
  return `https://www.autorell.com/${market}/account/company/dealer-offers`
}

function localeTag(locale: EmailLocale) {
  return ({ en: 'en-GB', sv: 'sv-SE', da: 'da-DK', fi: 'fi-FI', de: 'de-DE', fr: 'fr-FR', it: 'it-IT', es: 'es-ES', nl: 'nl-NL', pl: 'pl-PL' } as const)[locale]
}

type Copy = {
  subject: string
  eyebrow: string
  intro: string
  vehicle: string
  mileage: string
  fuel: string
  transmission: string
  location: string
  condition: string
  photos: string
  seller: string
  phone: string
  email: string
  preferredContact: string
  reference: string
  open: string
  contactHint: string
}

const emailCopy: Record<EmailLocale, Copy> = {
  en: copy('New seller request: {vehicle}', 'New dealer lead', 'A seller has submitted a vehicle in one of your selected countries. Review the full details and contact the seller directly.', 'Vehicle', 'Mileage', 'Fuel', 'Transmission', 'Location', 'Reported condition', 'Photos', 'Seller', 'Phone', 'Email', 'Preferred contact', 'Reference', 'Open request', 'You receive this email because dealer lead notifications are enabled for your company account.'),
  sv: copy('Ny bilförfrågan: {vehicle}', 'Nytt handlarlead', 'En säljare har skickat in ett fordon i ett av dina valda länder. Granska alla uppgifter och kontakta säljaren direkt.', 'Fordon', 'Mätarställning', 'Drivmedel', 'Växellåda', 'Plats', 'Angivet skick', 'Bilder', 'Säljare', 'Telefon', 'E-post', 'Önskad kontaktväg', 'Referens', 'Öppna förfrågan', 'Du får detta mejl eftersom handlarleads är aktiverade för ditt företagskonto.'),
  de: copy('Neue Verkäuferanfrage: {vehicle}', 'Neuer Händlerkontakt', 'Ein Verkäufer hat ein Fahrzeug in einem Ihrer ausgewählten Länder eingereicht. Prüfen Sie alle Angaben und kontaktieren Sie den Verkäufer direkt.', 'Fahrzeug', 'Kilometerstand', 'Kraftstoff', 'Getriebe', 'Standort', 'Angegebener Zustand', 'Fotos', 'Verkäufer', 'Telefon', 'E-Mail', 'Bevorzugter Kontakt', 'Referenz', 'Anfrage öffnen', 'Sie erhalten diese E-Mail, weil Händleranfragen für Ihr Unternehmenskonto aktiviert sind.'),
  fr: copy('Nouvelle demande vendeur : {vehicle}', 'Nouveau prospect professionnel', 'Un vendeur a proposé un véhicule dans l’un des pays sélectionnés. Consultez toutes les informations et contactez directement le vendeur.', 'Véhicule', 'Kilométrage', 'Carburant', 'Boîte de vitesses', 'Lieu', 'État déclaré', 'Photos', 'Vendeur', 'Téléphone', 'E-mail', 'Contact préféré', 'Référence', 'Ouvrir la demande', 'Vous recevez cet e-mail car les demandes vendeurs sont activées pour votre compte entreprise.'),
  es: copy('Nueva solicitud de vendedor: {vehicle}', 'Nuevo contacto para concesionario', 'Un vendedor ha enviado un vehículo en uno de los países seleccionados. Revisa toda la información y contacta directamente con el vendedor.', 'Vehículo', 'Kilometraje', 'Combustible', 'Transmisión', 'Ubicación', 'Estado indicado', 'Fotos', 'Vendedor', 'Teléfono', 'Correo electrónico', 'Contacto preferido', 'Referencia', 'Abrir solicitud', 'Recibes este correo porque las solicitudes de vendedores están activadas para tu cuenta de empresa.'),
  it: copy('Nuova richiesta venditore: {vehicle}', 'Nuovo contatto concessionario', 'Un venditore ha inserito un veicolo in uno dei Paesi selezionati. Controlla tutti i dati e contatta direttamente il venditore.', 'Veicolo', 'Chilometraggio', 'Alimentazione', 'Cambio', 'Località', 'Condizioni dichiarate', 'Foto', 'Venditore', 'Telefono', 'E-mail', 'Contatto preferito', 'Riferimento', 'Apri richiesta', 'Ricevi questa e-mail perché le richieste dei venditori sono attive per il tuo account aziendale.'),
  nl: copy('Nieuwe verkopersaanvraag: {vehicle}', 'Nieuwe dealerlead', 'Een verkoper heeft een voertuig ingediend in een van uw geselecteerde landen. Bekijk alle gegevens en neem rechtstreeks contact op met de verkoper.', 'Voertuig', 'Kilometerstand', 'Brandstof', 'Transmissie', 'Locatie', 'Opgegeven staat', 'Foto’s', 'Verkoper', 'Telefoon', 'E-mail', 'Voorkeurscontact', 'Referentie', 'Aanvraag openen', 'U ontvangt deze e-mail omdat dealerleads zijn ingeschakeld voor uw bedrijfsaccount.'),
  fi: copy('Uusi myyjän pyyntö: {vehicle}', 'Uusi autoliikkeen liidi', 'Myyjä on lähettänyt ajoneuvon yhdestä valitsemastasi maasta. Tarkista kaikki tiedot ja ota suoraan yhteyttä myyjään.', 'Ajoneuvo', 'Ajokilometrit', 'Polttoaine', 'Vaihteisto', 'Sijainti', 'Ilmoitettu kunto', 'Kuvat', 'Myyjä', 'Puhelin', 'Sähköposti', 'Toivottu yhteydenottotapa', 'Viite', 'Avaa pyyntö', 'Saat tämän sähköpostin, koska autoliikkeen liidi-ilmoitukset ovat käytössä yritystililläsi.'),
  da: copy('Ny sælgerforespørgsel: {vehicle}', 'Nyt forhandlerlead', 'En sælger har indsendt et køretøj i et af dine valgte lande. Gennemgå alle oplysninger, og kontakt sælgeren direkte.', 'Køretøj', 'Kilometertal', 'Brændstof', 'Gearkasse', 'Placering', 'Oplyst stand', 'Billeder', 'Sælger', 'Telefon', 'E-mail', 'Foretrukken kontakt', 'Reference', 'Åbn forespørgsel', 'Du modtager denne e-mail, fordi forhandlerleads er aktiveret for din virksomhedskonto.'),
  pl: copy('Nowe zapytanie sprzedającego: {vehicle}', 'Nowy lead dealerski', 'Sprzedający przesłał pojazd z jednego z wybranych krajów. Sprawdź wszystkie dane i skontaktuj się bezpośrednio ze sprzedającym.', 'Pojazd', 'Przebieg', 'Paliwo', 'Skrzynia biegów', 'Lokalizacja', 'Zgłoszony stan', 'Zdjęcia', 'Sprzedający', 'Telefon', 'E-mail', 'Preferowany kontakt', 'Numer referencyjny', 'Otwórz zapytanie', 'Otrzymujesz tę wiadomość, ponieważ powiadomienia o leadach dealerskich są włączone na koncie firmowym.'),
}

function copy(subject: string, eyebrow: string, intro: string, vehicle: string, mileage: string, fuel: string, transmission: string, location: string, condition: string, photos: string, seller: string, phone: string, email: string, preferredContact: string, reference: string, open: string, contactHint: string): Copy {
  return { subject, eyebrow, intro, vehicle, mileage, fuel, transmission, location, condition, photos, seller, phone, email, preferredContact, reference, open, contactHint }
}
