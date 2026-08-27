'use client'

import { FormEvent, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Check, ChevronDown, Mail, Send, X } from 'lucide-react'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'
import CountryFlag from '@/app/components/CountryFlag'

type ListingContactFormButtonProps = {
  listingId: string
  listingTitle: string
  locale: PublicLocale
  buttonLabel?: string
  buttonClassName?: string
  iconClassName?: string
  buttonFontWeight?: 400 | 600
  presentation?: 'button' | 'inline'
  defaultPhoneCountry?: string
}

type ContactCopy = {
  open: string
  title: string
  intro: string
  name: string
  phone: string
  email: string
  message: string
  privacy: string
  submit: string
  sending: string
  success: string
  error: string
  close: string
}

const copy: Record<string, ContactCopy> = {
  sv: {
    open: 'Kontaktformulär',
    title: 'Kontakta säljaren',
    intro: 'Skicka en förfrågan direkt till säljaren. Säljaren får dina kontaktuppgifter via e-post.',
    name: 'Namn',
    phone: 'Telefonnummer',
    email: 'E-post',
    message: 'Meddelande',
    privacy: 'Jag godkänner att Autorell skickar mina kontaktuppgifter till säljaren för den här annonsen.',
    submit: 'Skicka förfrågan',
    sending: 'Skickar...',
    success: 'Förfrågan är skickad till säljaren.',
    error: 'Kunde inte skicka förfrågan. Försök igen.',
    close: 'Stäng',
  },
  en: {
    open: 'Contact form',
    title: 'Contact the seller',
    intro: 'Send an enquiry directly to the seller. The seller receives your contact details by email.',
    name: 'Name',
    phone: 'Phone number',
    email: 'Email',
    message: 'Message',
    privacy: 'I agree that Autorell sends my contact details to the seller for this listing.',
    submit: 'Send enquiry',
    sending: 'Sending...',
    success: 'Your enquiry has been sent to the seller.',
    error: 'Could not send the enquiry. Please try again.',
    close: 'Close',
  },
  de: {
    open: 'Kontaktformular',
    title: 'Verkäufer kontaktieren',
    intro: 'Senden Sie eine Anfrage direkt an den Verkäufer. Der Verkäufer erhält Ihre Kontaktdaten per E-Mail.',
    name: 'Name',
    phone: 'Telefonnummer',
    email: 'E-Mail',
    message: 'Nachricht',
    privacy: 'Ich stimme zu, dass Autorell meine Kontaktdaten für diese Anzeige an den Verkäufer sendet.',
    submit: 'Anfrage senden',
    sending: 'Wird gesendet...',
    success: 'Ihre Anfrage wurde an den Verkäufer gesendet.',
    error: 'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
    close: 'Schließen',
  },
  fr: {
    open: 'Formulaire de contact',
    title: 'Contacter le vendeur',
    intro: 'Envoyez une demande directement au vendeur. Le vendeur reçoit vos coordonnées par e-mail.',
    name: 'Nom',
    phone: 'Numéro de téléphone',
    email: 'E-mail',
    message: 'Message',
    privacy: 'J’accepte qu’Autorell transmette mes coordonnées au vendeur pour cette annonce.',
    submit: 'Envoyer la demande',
    sending: 'Envoi...',
    success: 'Votre demande a été envoyée au vendeur.',
    error: 'Impossible d’envoyer la demande. Veuillez réessayer.',
    close: 'Fermer',
  },
  es: {
    open: 'Formulario de contacto',
    title: 'Contactar con el vendedor',
    intro: 'Envía una consulta directamente al vendedor. El vendedor recibe tus datos de contacto por correo electrónico.',
    name: 'Nombre',
    phone: 'Número de teléfono',
    email: 'Correo electrónico',
    message: 'Mensaje',
    privacy: 'Acepto que Autorell envíe mis datos de contacto al vendedor para este anuncio.',
    submit: 'Enviar consulta',
    sending: 'Enviando...',
    success: 'Tu consulta se ha enviado al vendedor.',
    error: 'No se pudo enviar la consulta. Inténtalo de nuevo.',
    close: 'Cerrar',
  },
  it: {
    open: 'Modulo di contatto',
    title: 'Contatta il venditore',
    intro: 'Invia una richiesta direttamente al venditore. Il venditore riceve i tuoi dati di contatto via e-mail.',
    name: 'Nome',
    phone: 'Numero di telefono',
    email: 'E-mail',
    message: 'Messaggio',
    privacy: 'Accetto che Autorell invii i miei dati di contatto al venditore per questo annuncio.',
    submit: 'Invia richiesta',
    sending: 'Invio...',
    success: 'La tua richiesta è stata inviata al venditore.',
    error: 'Impossibile inviare la richiesta. Riprova.',
    close: 'Chiudi',
  },
  pl: {
    open: 'Formularz kontaktowy',
    title: 'Skontaktuj się ze sprzedawcą',
    intro: 'Wyślij zapytanie bezpośrednio do sprzedawcy. Sprzedawca otrzyma Twoje dane kontaktowe e-mailem.',
    name: 'Imię i nazwisko',
    phone: 'Numer telefonu',
    email: 'E-mail',
    message: 'Wiadomość',
    privacy: 'Zgadzam się, aby Autorell przekazał moje dane kontaktowe sprzedawcy w sprawie tego ogłoszenia.',
    submit: 'Wyślij zapytanie',
    sending: 'Wysyłanie...',
    success: 'Twoje zapytanie zostało wysłane do sprzedawcy.',
    error: 'Nie udało się wysłać zapytania. Spróbuj ponownie.',
    close: 'Zamknij',
  },
  nl: {
    open: 'Contactformulier',
    title: 'Neem contact op met de verkoper',
    intro: 'Stuur rechtstreeks een aanvraag naar de verkoper. De verkoper ontvangt je contactgegevens per e-mail.',
    name: 'Naam',
    phone: 'Telefoonnummer',
    email: 'E-mail',
    message: 'Bericht',
    privacy: 'Ik ga ermee akkoord dat Autorell mijn contactgegevens naar de verkoper stuurt voor deze advertentie.',
    submit: 'Aanvraag verzenden',
    sending: 'Verzenden...',
    success: 'Je aanvraag is naar de verkoper verzonden.',
    error: 'De aanvraag kon niet worden verzonden. Probeer het opnieuw.',
    close: 'Sluiten',
  },
  fi: {
    open: 'Yhteydenottolomake',
    title: 'Ota yhteyttä myyjään',
    intro: 'Lähetä kysely suoraan myyjälle. Myyjä saa yhteystietosi sähköpostitse.',
    name: 'Nimi',
    phone: 'Puhelinnumero',
    email: 'Sähköposti',
    message: 'Viesti',
    privacy: 'Hyväksyn, että Autorell lähettää yhteystietoni myyjälle tätä ilmoitusta varten.',
    submit: 'Lähetä kysely',
    sending: 'Lähetetään...',
    success: 'Kyselysi on lähetetty myyjälle.',
    error: 'Kyselyä ei voitu lähettää. Yritä uudelleen.',
    close: 'Sulje',
  },
  da: {
    open: 'Kontaktformular',
    title: 'Kontakt sælgeren',
    intro: 'Send en forespørgsel direkte til sælgeren. Sælgeren modtager dine kontaktoplysninger via e-mail.',
    name: 'Navn',
    phone: 'Telefonnummer',
    email: 'E-mail',
    message: 'Besked',
    privacy: 'Jeg accepterer, at Autorell sender mine kontaktoplysninger til sælgeren for denne annonce.',
    submit: 'Send forespørgsel',
    sending: 'Sender...',
    success: 'Din forespørgsel er sendt til sælgeren.',
    error: 'Forespørgslen kunne ikke sendes. Prøv igen.',
    close: 'Luk',
  },
}

export default function ListingContactFormButton({
  listingId,
  listingTitle,
  locale,
  buttonLabel,
  buttonClassName,
  iconClassName,
  buttonFontWeight = 400,
  presentation = 'button',
  defaultPhoneCountry,
}: ListingContactFormButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isProfessional, setIsProfessional] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const text = getContactCopy(locale)

  useLayoutEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.classList.add('autorell-contact-modal-open')
    document.body.style.overflow = 'hidden'

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    const resetModalScroll = () => {
      panelRef.current?.scrollTo({ top: 0, left: 0 })
      formRef.current?.scrollTo({ top: 0, left: 0 })
    }

    resetModalScroll()
    const animationFrame = window.requestAnimationFrame(resetModalScroll)
    const timeout = window.setTimeout(resetModalScroll, 80)

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.clearTimeout(timeout)
      window.removeEventListener('keydown', closeOnEscape)
      document.body.classList.remove('autorell-contact-modal-open')
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setStatus('idle')

    const form = event.currentTarget
    const formData = new FormData(form)
    const firstName = String(formData.get('firstName') || '').trim()
    const lastName = String(formData.get('lastName') || '').trim()
    const rawPhone = String(formData.get('phone') || '').trim()
    const callingCode = String(formData.get('callingCode') || '').trim()
    const payload = {
      listingId,
      name: [firstName, lastName].filter(Boolean).join(' ') || String(formData.get('name') || ''),
      company: String(formData.get('company') || ''),
      professional: formData.get('professional') === 'on',
      phone: rawPhone.startsWith('+') ? rawPhone : `${callingCode} ${rawPhone}`.trim(),
      email: String(formData.get('email') || ''),
      message: String(formData.get('message') || ''),
      privacy: formData.get('privacy') === 'on',
      locale,
    }

    try {
      const response = await fetch('/api/listing-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Request failed')
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  if (presentation === 'inline') {
    const fields = getContactFieldCopy(locale)
    return (
      <div className="overflow-hidden rounded-[14px] border border-[#d7dee9] bg-[#f7f8fa] shadow-[0_10px_30px_rgba(16,24,40,.06)]">
        <div className="border-b border-[#e1e6ee] bg-white px-5 py-4">
          <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#101828]">{text.title}</h2>
          <label style={{ fontWeight: 400 }} className="mt-3 inline-flex cursor-pointer items-center gap-2.5 text-sm font-normal text-[#344054]">
            <input
              name="professional"
              form="listing-inline-contact-form"
              type="checkbox"
              checked={isProfessional}
              onChange={(event) => setIsProfessional(event.target.checked)}
              className="peer sr-only"
            />
            <span className="relative h-5 w-9 rounded-full bg-[#cfd6e1] transition peer-focus-visible:ring-4 peer-focus-visible:ring-[#0866ff]/15 peer-checked:bg-[#0866ff] after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" />
            {fields.professional}
          </label>
        </div>
        <form id="listing-inline-contact-form" onSubmit={submit} className="grid gap-3 p-4">
          {isProfessional ? <CompactFormField label={fields.company} name="company" required /> : null}
          <div className="grid grid-cols-2 gap-3">
            <CompactFormField label={fields.firstName} name="firstName" required />
            <CompactFormField label={fields.lastName} name="lastName" required />
          </div>
          <PhoneField label={text.phone} locale={locale} defaultCountry={defaultPhoneCountry} />
          <CompactFormField label={text.email} name="email" type="email" required />
          <label>
            <span className="sr-only">{text.message}</span>
            <textarea
              name="message"
              required
              maxLength={3000}
              rows={4}
              defaultValue={getDefaultMessage(locale, listingTitle)}
              placeholder={text.message}
              className="min-h-[112px] w-full resize-y rounded-[8px] border border-[#c7d0dd] bg-white px-3 py-2.5 text-sm font-normal leading-6 text-[#101828] outline-none transition placeholder:font-normal placeholder:text-[#98a2b3] focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
            />
          </label>
          <label className="group flex cursor-pointer items-start gap-2.5 rounded-[12px] bg-white px-3 py-2.5 text-xs font-medium leading-5 text-[#475467]">
            <input name="privacy" type="checkbox" required className="peer sr-only" />
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border border-[#b8c4d4] bg-white text-white transition peer-focus-visible:ring-4 peer-focus-visible:ring-[#0866ff]/15 peer-checked:border-[#0866ff] peer-checked:bg-[#0866ff] peer-checked:[&>svg]:opacity-100">
              <Check className="h-3.5 w-3.5 opacity-0 transition" strokeWidth={3} />
            </span>
            <span>
              {text.privacy}{' '}
              <Link href={localizePublicHref(locale, '/privacy')} target="_blank" className="font-semibold text-[#0866ff] underline underline-offset-2">
                {getPrivacyPolicyLabel(locale)}
              </Link>
            </span>
          </label>
          {status === 'success' ? <p className="rounded-[10px] bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700">{text.success}</p> : null}
          {status === 'error' ? <p className="rounded-[10px] bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">{text.error}</p> : null}
          <button type="submit" disabled={loading} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-4 text-sm font-semibold text-white transition hover:bg-[#0057e6] disabled:cursor-not-allowed disabled:bg-[#c7d7f5]">
            <Send className="h-4 w-4" />
            {loading ? text.sending : text.submit}
          </button>
        </form>
      </div>
    )
  }

  const modal =
    open && typeof document !== 'undefined'
      ? createPortal(
        <div
          className="fixed inset-0 isolate z-[2147483647] flex items-start justify-center overflow-hidden bg-[#101828]/35 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-[2px] sm:items-center sm:px-6 sm:py-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <div ref={panelRef} className="relative grid max-h-[calc(100svh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.5rem)] w-full max-w-[540px] overflow-y-auto overscroll-contain rounded-[16px] border border-[#dfe6f2] bg-white shadow-[0_24px_70px_rgba(16,24,40,.22)] sm:max-h-[calc(100dvh-3rem)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#edf1f6] bg-white px-5 py-4">
              <div>
                <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[#0866ff]">
                  {listingTitle}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#101828]">
                  {text.title}
                </h2>
                <p className="mt-1.5 text-[13px] font-normal leading-5 text-[#667085]">{text.intro}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={text.close}
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-[#d9e1ec] bg-white text-[#344054] transition hover:border-[#98a2b3] sm:h-10 sm:w-10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={submit} className="grid gap-3 px-5 py-4">
              <label style={{ fontWeight: 400 }} className="inline-flex cursor-pointer items-center gap-2.5 text-[13px] font-normal text-[#344054]">
                <input name="professional" type="checkbox" checked={isProfessional} onChange={(event) => setIsProfessional(event.target.checked)} className="peer sr-only" />
                <span className="relative h-5 w-9 rounded-full bg-[#cfd6e1] transition peer-focus-visible:ring-4 peer-focus-visible:ring-[#0866ff]/15 peer-checked:bg-[#0866ff] after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" />
                {getContactFieldCopy(locale).professional}
              </label>
              {isProfessional ? <CompactFormField label={getContactFieldCopy(locale).company} name="company" required /> : null}
              <div className="grid grid-cols-2 gap-3">
                <CompactFormField label={getContactFieldCopy(locale).firstName} name="firstName" required />
                <CompactFormField label={getContactFieldCopy(locale).lastName} name="lastName" required />
              </div>
              <PhoneField label={text.phone} locale={locale} defaultCountry={defaultPhoneCountry} />
              <CompactFormField label={text.email} name="email" type="email" required />
              <label>
                <span className="sr-only">{text.message}</span>
                <textarea
                  name="message"
                  required
                  maxLength={3000}
                  rows={4}
                  defaultValue={getDefaultMessage(locale, listingTitle)}
                  placeholder={text.message}
                  className="min-h-[108px] w-full min-w-0 resize-y rounded-[8px] border border-[#c7d0dd] bg-white px-3 py-2.5 text-sm font-normal leading-6 text-[#101828] outline-none transition placeholder:font-normal placeholder:text-[#98a2b3] focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
                />
              </label>
              <label className="group flex cursor-pointer items-start gap-2.5 rounded-[10px] bg-[#f8fbff] px-3 py-2.5 text-xs font-normal leading-5 text-[#475467] transition hover:bg-[#f3f8ff]">
                <input
                  name="privacy"
                  type="checkbox"
                  required
                  className="peer sr-only"
                />
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border border-[#b8c4d4] bg-white text-white shadow-sm transition duration-200 group-hover:border-[#0866ff] peer-focus-visible:ring-4 peer-focus-visible:ring-[#0866ff]/15 peer-checked:scale-[1.03] peer-checked:border-[#0866ff] peer-checked:bg-[#0866ff] peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100">
                  <Check className="h-3.5 w-3.5 scale-50 opacity-0 transition duration-200" strokeWidth={3} />
                </span>
                <span>
                  {text.privacy}{' '}
                  <Link
                    href={localizePublicHref(locale, '/privacy')}
                    target="_blank"
                    className="font-semibold text-[#0866ff] underline underline-offset-2 transition hover:text-[#0057e6]"
                  >
                    {getPrivacyPolicyLabel(locale)}
                  </Link>
                </span>
              </label>

              {status === 'success' ? (
                <p className="rounded-[12px] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {text.success}
                </p>
              ) : null}
              {status === 'error' ? (
                <p className="rounded-[12px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {text.error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-4 text-sm font-semibold text-white transition hover:bg-[#0057e6] disabled:cursor-not-allowed disabled:bg-[#c7d7f5]"
              >
                <Send className="h-4 w-4" />
                {loading ? text.sending : text.submit}
              </button>
            </form>
          </div>
        </div>,
        document.body,
      )
      : null

  return (
    <>
      <button
        type="button"
        style={{ fontWeight: buttonFontWeight }}
        onClick={() => {
          setOpen(true)
          setStatus('idle')
        }}
        className={buttonClassName || 'inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-[#cfd8e6] bg-white px-5 text-sm font-semibold text-[#101828] transition hover:border-[#0866ff] hover:bg-[#f5f9ff] hover:text-[#0866ff]'}
      >
        <Mail className={iconClassName || 'h-4 w-4 text-[#0866ff]'} />
        {buttonLabel || text.open}
      </button>

      {modal}
    </>
  )
}

function getContactCopy(locale: PublicLocale) {
  if (locale === 'at') return copy.de
  if (locale === 'be') return copy.nl
  return copy[locale] || copy.en
}

function getDefaultMessage(locale: PublicLocale, listingTitle: string) {
  const messages: Partial<Record<PublicLocale, string>> = {
    sv: `Hej, jag är intresserad av annonsen ”${listingTitle}”. Finns fordonet kvar?`,
    de: `Hallo, ich interessiere mich für die Anzeige „${listingTitle}“. Ist das Fahrzeug noch verfügbar?`,
    at: `Hallo, ich interessiere mich für die Anzeige „${listingTitle}“. Ist das Fahrzeug noch verfügbar?`,
    fr: `Bonjour, je suis intéressé par l’annonce « ${listingTitle} ». Le véhicule est-il toujours disponible ?`,
    es: `Hola, me interesa el anuncio «${listingTitle}». ¿Sigue disponible el vehículo?`,
    it: `Salve, sono interessato all’annuncio “${listingTitle}”. Il veicolo è ancora disponibile?`,
    pl: `Dzień dobry, interesuje mnie ogłoszenie „${listingTitle}”. Czy pojazd jest nadal dostępny?`,
    nl: `Hallo, ik ben geïnteresseerd in de advertentie ‘${listingTitle}’. Is het voertuig nog beschikbaar?`,
    be: `Hallo, ik ben geïnteresseerd in de advertentie ‘${listingTitle}’. Is het voertuig nog beschikbaar?`,
    fi: `Hei, olen kiinnostunut ilmoituksesta ”${listingTitle}”. Onko ajoneuvo vielä saatavilla?`,
    da: `Hej, jeg er interesseret i annoncen “${listingTitle}”. Er køretøjet stadig tilgængeligt?`,
  }
  return messages[locale] || `Hello, I’m interested in the listing “${listingTitle}”. Is the vehicle still available?`
}

function getPrivacyPolicyLabel(locale: PublicLocale) {
  const labels: Partial<Record<PublicLocale, string>> = {
    sv: 'Läs integritetspolicyn',
    en: 'Read the privacy policy',
    de: 'Datenschutzerklärung lesen',
    at: 'Datenschutzerklärung lesen',
    fr: 'Lire la politique de confidentialité',
    es: 'Leer la política de privacidad',
    it: 'Leggi l’informativa sulla privacy',
    pl: 'Przeczytaj politykę prywatności',
    nl: 'Lees het privacybeleid',
    be: 'Lees het privacybeleid',
    fi: 'Lue tietosuojaseloste',
    da: 'Læs privatlivspolitikken',
  }

  return labels[locale] || labels.en || 'Read the privacy policy'
}

function getContactFieldCopy(locale: PublicLocale) {
  const labels: Record<PublicLocale, { professional: string; company: string; firstName: string; lastName: string }> = {
    sv: { professional: 'Jag är professionell köpare', company: 'Företag', firstName: 'Förnamn', lastName: 'Efternamn' },
    en: { professional: 'I am a professional', company: 'Company', firstName: 'First name', lastName: 'Last name' },
    de: { professional: 'Ich bin gewerblicher Käufer', company: 'Unternehmen', firstName: 'Vorname', lastName: 'Nachname' },
    at: { professional: 'Ich bin gewerblicher Käufer', company: 'Unternehmen', firstName: 'Vorname', lastName: 'Nachname' },
    fr: { professional: 'Je suis un professionnel', company: 'Entreprise', firstName: 'Prénom', lastName: 'Nom' },
    es: { professional: 'Soy profesional', company: 'Empresa', firstName: 'Nombre', lastName: 'Apellidos' },
    it: { professional: 'Sono un professionista', company: 'Azienda', firstName: 'Nome', lastName: 'Cognome' },
    pl: { professional: 'Jestem profesjonalnym kupującym', company: 'Firma', firstName: 'Imię', lastName: 'Nazwisko' },
    nl: { professional: 'Ik ben een professional', company: 'Bedrijf', firstName: 'Voornaam', lastName: 'Achternaam' },
    be: { professional: 'Ik ben een professional', company: 'Bedrijf', firstName: 'Voornaam', lastName: 'Achternaam' },
    fi: { professional: 'Olen ammattiostaja', company: 'Yritys', firstName: 'Etunimi', lastName: 'Sukunimi' },
    da: { professional: 'Jeg er professionel køber', company: 'Virksomhed', firstName: 'Fornavn', lastName: 'Efternavn' },
  }
  return labels[locale] || labels.en
}

const phoneCountries = [
  { code: 'SE', callingCode: '+46' },
  { code: 'DE', callingCode: '+49' },
  { code: 'AT', callingCode: '+43' },
  { code: 'FI', callingCode: '+358' },
  { code: 'DK', callingCode: '+45' },
  { code: 'PL', callingCode: '+48' },
  { code: 'NL', callingCode: '+31' },
  { code: 'BE', callingCode: '+32' },
  { code: 'FR', callingCode: '+33' },
  { code: 'ES', callingCode: '+34' },
  { code: 'IT', callingCode: '+39' },
  { code: 'GB', callingCode: '+44' },
  { code: 'IE', callingCode: '+353' },
  { code: 'NO', callingCode: '+47' },
  { code: 'CH', callingCode: '+41' },
  { code: 'PT', callingCode: '+351' },
] as const

const localePhoneCountry: Partial<Record<PublicLocale, string>> = {
  sv: 'SE', de: 'DE', at: 'AT', fi: 'FI', da: 'DK', pl: 'PL', nl: 'NL', be: 'BE', fr: 'FR', es: 'ES', it: 'IT', en: 'GB',
}

function PhoneField({ label, locale, defaultCountry }: { label: string; locale: PublicLocale; defaultCountry?: string }) {
  const normalizedCountry = (defaultCountry || '').trim().toUpperCase()
  const initialCountry = phoneCountries.some((country) => country.code === normalizedCountry)
    ? normalizedCountry
    : localePhoneCountry[locale] || 'GB'
  const [selectedCountry, setSelectedCountry] = useState(initialCountry)
  const [countryMenuOpen, setCountryMenuOpen] = useState(false)
  const selected = phoneCountries.find((country) => country.code === selectedCountry) || phoneCountries[11]

  return (
    <div>
      <span className="sr-only">{label}</span>
      <div className="relative grid grid-cols-[112px_minmax(0,1fr)] rounded-[8px] border border-[#c7d0dd] bg-white transition focus-within:border-[#0866ff] focus-within:ring-3 focus-within:ring-[#0866ff]/10">
        <input type="hidden" name="callingCode" value={selected.callingCode} />
        <button
          type="button"
          style={{ fontWeight: 400 }}
          onClick={() => setCountryMenuOpen((value) => !value)}
          aria-label={`${label} country code`}
          aria-haspopup="listbox"
          aria-expanded={countryMenuOpen}
          className="flex h-11 items-center gap-2 border-r border-[#dfe6f2] bg-[#f8fafc] px-2.5 text-[13px] font-normal text-[#344054] outline-none"
        >
          <CountryFlag code={selected.code} className="h-3.5 w-5 shrink-0 rounded-[2px]" />
          <span>{selected.callingCode}</span>
          <ChevronDown className="ml-auto h-3.5 w-3.5" />
        </button>
        {countryMenuOpen ? (
          <div role="listbox" aria-label={`${label} country code`} className="absolute left-0 top-[calc(100%+5px)] z-20 grid max-h-56 w-48 overflow-y-auto rounded-[9px] border border-[#d7dee9] bg-white p-1.5 shadow-[0_14px_35px_rgba(16,24,40,.16)]">
            {phoneCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                style={{ fontWeight: 400 }}
                role="option"
                aria-selected={country.code === selected.code}
                onClick={() => {
                  setSelectedCountry(country.code)
                  setCountryMenuOpen(false)
                }}
                className="flex min-h-9 items-center gap-2 rounded-[6px] px-2 text-left text-[13px] font-normal text-[#344054] hover:bg-[#f2f6fc]"
              >
                <CountryFlag code={country.code} className="h-3.5 w-5 shrink-0 rounded-[2px]" />
                <span className="w-7">{country.code}</span>
                <span className="text-[#667085]">{country.callingCode}</span>
              </button>
            ))}
          </div>
        ) : null}
        <input
          name="phone"
          type="tel"
          autoComplete="tel-national"
          required
          placeholder={`${label}*`}
          className="h-11 min-w-0 border-0 bg-white px-3 text-sm font-normal text-[#101828] outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
        />
      </div>
    </div>
  )
}

function CompactFormField({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  const autoComplete = {
    company: 'organization',
    firstName: 'given-name',
    lastName: 'family-name',
    phone: 'tel',
    email: 'email',
  }[name]

  return (
    <label>
      <span className="sr-only">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        placeholder={`${label}${required ? '*' : ''}`}
        className="h-11 w-full min-w-0 rounded-[8px] border border-[#c7d0dd] bg-white px-3 text-sm font-normal text-[#101828] outline-none transition placeholder:font-normal placeholder:text-[#98a2b3] focus:border-[#0866ff] focus:ring-3 focus:ring-[#0866ff]/10"
      />
    </label>
  )
}
