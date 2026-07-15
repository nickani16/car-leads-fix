'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Mail, Send, X } from 'lucide-react'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

type ListingContactFormButtonProps = {
  listingId: string
  listingTitle: string
  locale: PublicLocale
  defaultCurrency?: string
}

type ContactCopy = {
  open: string
  title: string
  intro: string
  name: string
  phone: string
  email: string
  offer: string
  message: string
  messagePlaceholder: string
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
    offer: 'Hur mycket vill du erbjuda?',
    message: 'Meddelande',
    messagePlaceholder: 'Skriv vad du vill veta eller när du vill bli kontaktad.',
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
    offer: 'How much would you like to offer?',
    message: 'Message',
    messagePlaceholder: 'Write what you want to know or when you want to be contacted.',
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
    offer: 'Wie viel möchten Sie anbieten?',
    message: 'Nachricht',
    messagePlaceholder: 'Schreiben Sie, was Sie wissen möchten oder wann Sie kontaktiert werden möchten.',
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
    offer: 'Quel montant souhaitez-vous proposer ?',
    message: 'Message',
    messagePlaceholder: 'Écrivez ce que vous voulez savoir ou quand vous souhaitez être contacté.',
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
    offer: '¿Cuánto quieres ofrecer?',
    message: 'Mensaje',
    messagePlaceholder: 'Escribe qué quieres saber o cuándo quieres que te contacten.',
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
    offer: 'Quanto vuoi offrire?',
    message: 'Messaggio',
    messagePlaceholder: 'Scrivi cosa vuoi sapere o quando desideri essere contattato.',
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
    offer: 'Ile chcesz zaoferować?',
    message: 'Wiadomość',
    messagePlaceholder: 'Napisz, czego chcesz się dowiedzieć albo kiedy sprzedawca ma się z Tobą skontaktować.',
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
    offer: 'Hoeveel wil je bieden?',
    message: 'Bericht',
    messagePlaceholder: 'Schrijf wat je wilt weten of wanneer je gecontacteerd wilt worden.',
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
    offer: 'Kuinka paljon haluat tarjota?',
    message: 'Viesti',
    messagePlaceholder: 'Kirjoita, mitä haluat tietää tai milloin haluat, että sinuun otetaan yhteyttä.',
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
    offer: 'Hvor meget vil du tilbyde?',
    message: 'Besked',
    messagePlaceholder: 'Skriv, hvad du vil vide, eller hvornår du vil kontaktes.',
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
  defaultCurrency = 'EUR',
}: ListingContactFormButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const text = getContactCopy(locale)

  useEffect(() => {
    document.body.classList.toggle('autorell-contact-modal-open', open)
    return () => {
      document.body.classList.remove('autorell-contact-modal-open')
    }
  }, [open])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setStatus('idle')

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      listingId,
      name: String(formData.get('name') || ''),
      phone: String(formData.get('phone') || ''),
      email: String(formData.get('email') || ''),
      offer: String(formData.get('offer') || ''),
      offerCurrency: String(formData.get('offerCurrency') || defaultCurrency),
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

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          setStatus('idle')
        }}
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-[#cfd8e6] bg-white px-5 text-sm font-semibold text-[#101828] transition hover:border-[#0866ff] hover:bg-[#f5f9ff] hover:text-[#0866ff]"
      >
        <Mail className="h-4 w-4 text-[#0866ff]" />
        {text.open}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[240] flex items-start justify-center overflow-y-auto bg-[#101828]/85 px-3 py-[calc(env(safe-area-inset-top)+1rem)] backdrop-blur-lg sm:items-center sm:px-4 sm:py-6">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-[560px] overflow-y-auto rounded-[18px] border border-[#dfe6f2] bg-white shadow-[0_30px_90px_rgba(16,24,40,.25)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[22px]">
            <div className="flex items-start justify-between gap-4 border-b border-[#edf1f6] px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0866ff]">
                  {listingTitle}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#101828]">
                  {text.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{text.intro}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={text.close}
                className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[#d9e1ec] bg-white text-[#344054] transition hover:border-[#98a2b3]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-4 px-5 py-5 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-2 sm:[&>label]:min-w-0">
                <FormField label={text.name} name="name" required />
                <FormField label={text.phone} name="phone" type="tel" required />
              </div>
              <FormField label={text.email} name="email" type="email" required />
              <OfferField label={text.offer} currency={normalizeCurrency(defaultCurrency)} />
              <label className="grid gap-2 text-sm font-semibold text-[#101828]">
                {text.message}
                <textarea
                  name="message"
                  required
                  maxLength={3000}
                  rows={5}
                  placeholder={text.messagePlaceholder}
                  className="autorell-contact-placeholder min-h-[132px] w-full min-w-0 resize-y rounded-[14px] border border-[#cfd8e6] bg-white px-4 py-3 text-base font-medium leading-7 text-[#101828] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                />
              </label>
              <label className="group flex cursor-pointer items-start gap-3 rounded-[14px] bg-[#f8fbff] px-4 py-3 text-sm font-medium leading-6 text-[#475467] transition hover:bg-[#f3f8ff]">
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
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(8,102,255,.22)] transition hover:bg-[#0057e6] disabled:cursor-not-allowed disabled:bg-[#c7d7f5]"
              >
                <Send className="h-4 w-4" />
                {loading ? text.sending : text.submit}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

function getContactCopy(locale: PublicLocale) {
  if (locale === 'at') return copy.de
  if (locale === 'be') return copy.nl
  return copy[locale] || copy.en
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

const currencyOptions = [
  'SEK',
  'EUR',
  'DKK',
  'PLN',
  'CZK',
  'HUF',
  'RON',
  'BGN',
  'NOK',
  'CHF',
  'GBP',
  'USD',
] as const

function normalizeCurrency(value?: string) {
  const normalized = (value || '').toUpperCase()
  return currencyOptions.includes(normalized as (typeof currencyOptions)[number])
    ? normalized
    : 'EUR'
}

function OfferField({ label, currency }: { label: string; currency: string }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-[#101828]">
      {label}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_104px] overflow-hidden rounded-[14px] border border-[#cfd8e6] bg-white transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10 sm:grid-cols-[minmax(0,1fr)_118px]">
        <input
          name="offer"
          inputMode="decimal"
          className="autorell-contact-placeholder h-12 min-w-0 border-0 bg-white px-4 text-base font-medium text-[#101828] outline-none"
        />
        <select
          name="offerCurrency"
          defaultValue={currency}
          aria-label="Currency"
          className="h-12 min-w-0 cursor-pointer border-0 border-l border-[#dfe6f2] bg-[#f8fbff] px-3 text-sm font-semibold text-[#101828] outline-none"
        >
          {currencyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </label>
  )
}

function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-[#101828]">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="autorell-contact-placeholder h-12 w-full min-w-0 rounded-[14px] border border-[#cfd8e6] bg-white px-4 text-base font-medium text-[#101828] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
      />
    </label>
  )
}
