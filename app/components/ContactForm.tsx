'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import {
  localizePublicHref,
  translationLocale,
  type PublicLocale,
} from '@/lib/public-i18n'

type ContactFormCopy = {
  eyebrow: string
  formTitle: string
  formText: string
  error: string
  thanks: string
  received: string
  newMessage: string
  name: string
  email: string
  phone: string
  subject: string
  choose: string
  subjects: string[]
  message: string
  placeholder: string
  privacyStart: string
  privacyLink: string
  privacyEnd: string
  sending: string
  send: string
  footerNote: string
}

const contactCopy: Record<PublicLocale, ContactFormCopy> = {
  sv: {
    eyebrow: 'Skriv till Autorell',
    formTitle: 'Berätta vad du behöver hjälp med.',
    formText: 'Fyll i uppgifterna så återkommer rätt person från Autorell med nästa steg.',
    error: 'Något gick fel. Försök igen.',
    thanks: 'Tack för ditt meddelande.',
    received: 'Vi har tagit emot din fråga och återkommer så snart vi kan.',
    newMessage: 'Skicka ett nytt meddelande',
    name: 'Namn',
    email: 'E-post',
    phone: 'Telefon',
    subject: 'Vad gäller din fråga?',
    choose: 'Välj ett ämne',
    subjects: ['Konto', 'Annons', 'Företagslösningar', 'Säkerhet och rapportering', 'Teknisk hjälp', 'Övrigt'],
    message: 'Meddelande',
    placeholder: 'Berätta hur vi kan hjälpa dig...',
    privacyStart: 'Jag har läst',
    privacyLink: 'integritetspolicyn',
    privacyEnd: 'och förstår att Autorell behandlar uppgifterna för att besvara min fråga.',
    sending: 'Skickar...',
    send: 'Skicka meddelande',
    footerNote: 'Din fråga skickas direkt till Autorell och används endast för att hantera ditt ärende.',
  },
  en: {
    eyebrow: 'Contact Autorell',
    formTitle: 'Tell us what you need help with.',
    formText: 'Send your details and the right person at Autorell will follow up with the next step.',
    error: 'Something went wrong. Please try again.',
    thanks: 'Thank you for your message.',
    received: 'We have received your enquiry and will respond as soon as possible.',
    newMessage: 'Send another message',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    subject: 'What is your enquiry about?',
    choose: 'Select a topic',
    subjects: ['Account', 'Listing', 'Business solutions', 'Safety and reporting', 'Technical support', 'Other'],
    message: 'Message',
    placeholder: 'Tell us how we can help...',
    privacyStart: 'I have read the',
    privacyLink: 'privacy policy',
    privacyEnd: 'and understand that Autorell processes my details to answer this enquiry.',
    sending: 'Sending...',
    send: 'Send message',
    footerNote: 'Your enquiry is sent directly to Autorell and used only to handle your request.',
  },
  de: {
    eyebrow: 'Autorell kontaktieren',
    formTitle: 'Wobei können wir helfen?',
    formText: 'Senden Sie Ihre Angaben, damit die richtige Person bei Autorell den nächsten Schritt übernehmen kann.',
    error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    thanks: 'Vielen Dank für Ihre Nachricht.',
    received: 'Wir haben Ihre Anfrage erhalten und melden uns so schnell wie möglich.',
    newMessage: 'Neue Nachricht senden',
    name: 'Name',
    email: 'E-Mail',
    phone: 'Telefon',
    subject: 'Worum geht es bei Ihrer Anfrage?',
    choose: 'Thema auswählen',
    subjects: ['Konto', 'Anzeige', 'Unternehmenslösungen', 'Sicherheit und Meldungen', 'Technische Hilfe', 'Sonstiges'],
    message: 'Nachricht',
    placeholder: 'Wie können wir Ihnen helfen?',
    privacyStart: 'Ich habe die',
    privacyLink: 'Datenschutzerklärung',
    privacyEnd: 'gelesen und bin mit der Verarbeitung meiner Angaben zur Beantwortung der Anfrage einverstanden.',
    sending: 'Wird gesendet...',
    send: 'Nachricht senden',
    footerNote: 'Ihre Anfrage wird direkt an Autorell gesendet und nur zur Bearbeitung Ihres Anliegens verwendet.',
  },
  fr: {
    eyebrow: 'Contacter Autorell',
    formTitle: 'Dites-nous de quoi vous avez besoin.',
    formText: 'Envoyez vos informations afin que la bonne personne chez Autorell puisse répondre.',
    error: 'Une erreur est survenue. Veuillez réessayer.',
    thanks: 'Merci pour votre message.',
    received: 'Nous avons reçu votre demande et répondrons dès que possible.',
    newMessage: 'Envoyer un nouveau message',
    name: 'Nom',
    email: 'E-mail',
    phone: 'Téléphone',
    subject: 'Objet de votre demande',
    choose: 'Choisir un sujet',
    subjects: ['Compte', 'Annonce', 'Solutions entreprises', 'Sécurité et signalement', 'Support technique', 'Autre'],
    message: 'Message',
    placeholder: 'Expliquez comment nous pouvons vous aider...',
    privacyStart: 'J’ai lu la',
    privacyLink: 'politique de confidentialité',
    privacyEnd: 'et comprends qu’Autorell traite mes informations pour répondre à ma demande.',
    sending: 'Envoi...',
    send: 'Envoyer le message',
    footerNote: 'Votre demande est envoyée directement à Autorell et utilisée uniquement pour traiter votre dossier.',
  },
  es: {
    eyebrow: 'Contactar con Autorell',
    formTitle: 'Cuéntanos en qué necesitas ayuda.',
    formText: 'Envía tus datos y la persona adecuada de Autorell continuará con el siguiente paso.',
    error: 'Algo salió mal. Inténtalo de nuevo.',
    thanks: 'Gracias por tu mensaje.',
    received: 'Hemos recibido tu consulta y responderemos lo antes posible.',
    newMessage: 'Enviar otro mensaje',
    name: 'Nombre',
    email: 'E-mail',
    phone: 'Teléfono',
    subject: '¿Sobre qué trata tu consulta?',
    choose: 'Selecciona un tema',
    subjects: ['Cuenta', 'Anuncio', 'Soluciones para empresas', 'Seguridad e informes', 'Soporte técnico', 'Otro'],
    message: 'Mensaje',
    placeholder: 'Cuéntanos cómo podemos ayudarte...',
    privacyStart: 'He leído la',
    privacyLink: 'política de privacidad',
    privacyEnd: 'y entiendo que Autorell trata mis datos para responder a esta consulta.',
    sending: 'Enviando...',
    send: 'Enviar mensaje',
    footerNote: 'Tu consulta se envía directamente a Autorell y se usa solo para gestionar tu solicitud.',
  },
  it: {
    eyebrow: 'Contatta Autorell',
    formTitle: 'Dicci di cosa hai bisogno.',
    formText: 'Invia i tuoi dati e la persona giusta di Autorell ti risponderà con il prossimo passo.',
    error: 'Qualcosa è andato storto. Riprova.',
    thanks: 'Grazie per il tuo messaggio.',
    received: 'Abbiamo ricevuto la tua richiesta e risponderemo appena possibile.',
    newMessage: 'Invia un nuovo messaggio',
    name: 'Nome',
    email: 'E-mail',
    phone: 'Telefono',
    subject: 'Oggetto della richiesta',
    choose: 'Seleziona un argomento',
    subjects: ['Account', 'Annuncio', 'Soluzioni aziendali', 'Sicurezza e segnalazioni', 'Supporto tecnico', 'Altro'],
    message: 'Messaggio',
    placeholder: 'Raccontaci come possiamo aiutarti...',
    privacyStart: 'Ho letto la',
    privacyLink: 'privacy policy',
    privacyEnd: 'e capisco che Autorell tratta i miei dati per rispondere a questa richiesta.',
    sending: 'Invio...',
    send: 'Invia messaggio',
    footerNote: 'La tua richiesta viene inviata direttamente ad Autorell e usata solo per gestire il tuo caso.',
  },
  pl: {
    eyebrow: 'Kontakt z Autorell',
    formTitle: 'Napisz, w czym potrzebujesz pomocy.',
    formText: 'Wyślij swoje dane, a właściwa osoba z Autorell podejmie kolejny krok.',
    error: 'Coś poszło nie tak. Spróbuj ponownie.',
    thanks: 'Dziękujemy za wiadomość.',
    received: 'Otrzymaliśmy Twoje zapytanie i odpowiemy tak szybko, jak to możliwe.',
    newMessage: 'Wyślij kolejną wiadomość',
    name: 'Imię i nazwisko',
    email: 'E-mail',
    phone: 'Telefon',
    subject: 'Czego dotyczy zapytanie?',
    choose: 'Wybierz temat',
    subjects: ['Konto', 'Ogłoszenie', 'Rozwiązania firmowe', 'Bezpieczeństwo i zgłoszenia', 'Pomoc techniczna', 'Inne'],
    message: 'Wiadomość',
    placeholder: 'Napisz, jak możemy pomóc...',
    privacyStart: 'Przeczytałem/am',
    privacyLink: 'politykę prywatności',
    privacyEnd: 'i rozumiem, że Autorell przetwarza moje dane, aby odpowiedzieć na zapytanie.',
    sending: 'Wysyłanie...',
    send: 'Wyślij wiadomość',
    footerNote: 'Twoje zapytanie trafia bezpośrednio do Autorell i jest używane wyłącznie do obsługi sprawy.',
  },
  nl: {
    eyebrow: 'Contact met Autorell',
    formTitle: 'Vertel waarmee we kunnen helpen.',
    formText: 'Stuur je gegevens en de juiste persoon bij Autorell volgt de volgende stap op.',
    error: 'Er is iets misgegaan. Probeer het opnieuw.',
    thanks: 'Bedankt voor je bericht.',
    received: 'We hebben je vraag ontvangen en reageren zo snel mogelijk.',
    newMessage: 'Nieuw bericht sturen',
    name: 'Naam',
    email: 'E-mail',
    phone: 'Telefoon',
    subject: 'Waar gaat je vraag over?',
    choose: 'Kies een onderwerp',
    subjects: ['Account', 'Advertentie', 'Bedrijfsoplossingen', 'Veiligheid en meldingen', 'Technische hulp', 'Overig'],
    message: 'Bericht',
    placeholder: 'Vertel hoe we kunnen helpen...',
    privacyStart: 'Ik heb het',
    privacyLink: 'privacybeleid',
    privacyEnd: 'gelezen en begrijp dat Autorell mijn gegevens verwerkt om deze vraag te beantwoorden.',
    sending: 'Versturen...',
    send: 'Bericht sturen',
    footerNote: 'Je vraag wordt rechtstreeks naar Autorell gestuurd en alleen gebruikt om je verzoek te behandelen.',
  },
  fi: {
    eyebrow: 'Ota yhteyttä Autorelliin',
    formTitle: 'Kerro, mihin tarvitset apua.',
    formText: 'Lähetä tietosi, niin oikea henkilö Autorellilla jatkaa asian käsittelyä.',
    error: 'Jokin meni vikaan. Yritä uudelleen.',
    thanks: 'Kiitos viestistäsi.',
    received: 'Olemme vastaanottaneet kysymyksesi ja vastaamme mahdollisimman pian.',
    newMessage: 'Lähetä uusi viesti',
    name: 'Nimi',
    email: 'Sähköposti',
    phone: 'Puhelin',
    subject: 'Mitä kysymyksesi koskee?',
    choose: 'Valitse aihe',
    subjects: ['Tili', 'Ilmoitus', 'Yritysratkaisut', 'Turvallisuus ja ilmoitukset', 'Tekninen tuki', 'Muu'],
    message: 'Viesti',
    placeholder: 'Kerro, miten voimme auttaa...',
    privacyStart: 'Olen lukenut',
    privacyLink: 'tietosuojakäytännön',
    privacyEnd: 'ja ymmärrän, että Autorell käsittelee tietojani vastatakseen tähän kysymykseen.',
    sending: 'Lähetetään...',
    send: 'Lähetä viesti',
    footerNote: 'Kysymyksesi lähetetään suoraan Autorellille ja sitä käytetään vain asiasi käsittelyyn.',
  },
  da: {
    eyebrow: 'Kontakt Autorell',
    formTitle: 'Fortæl hvad du har brug for hjælp til.',
    formText: 'Send dine oplysninger, så den rette person hos Autorell kan følge op.',
    error: 'Noget gik galt. Prøv igen.',
    thanks: 'Tak for din besked.',
    received: 'Vi har modtaget din henvendelse og svarer hurtigst muligt.',
    newMessage: 'Send en ny besked',
    name: 'Navn',
    email: 'E-mail',
    phone: 'Telefon',
    subject: 'Hvad handler din henvendelse om?',
    choose: 'Vælg et emne',
    subjects: ['Konto', 'Annonce', 'Virksomhedsløsninger', 'Sikkerhed og rapportering', 'Teknisk hjælp', 'Andet'],
    message: 'Besked',
    placeholder: 'Fortæl hvordan vi kan hjælpe...',
    privacyStart: 'Jeg har læst',
    privacyLink: 'privatlivspolitikken',
    privacyEnd: 'og forstår, at Autorell behandler mine oplysninger for at besvare henvendelsen.',
    sending: 'Sender...',
    send: 'Send besked',
    footerNote: 'Din henvendelse sendes direkte til Autorell og bruges kun til at håndtere din sag.',
  },
  at: {} as ContactFormCopy,
  be: {} as ContactFormCopy,
}

contactCopy.at = contactCopy.de
contactCopy.be = contactCopy.nl

export default function ContactForm({
  locale = 'sv',
}: {
  locale?: PublicLocale
}) {
  const t = contactCopy[translationLocale(locale)] || contactCopy.en
  const privacyHref = localizePublicHref(locale, '/privacy')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError('')

    const form = event.currentTarget
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: new FormData(form),
    })

    const result = await response.json().catch(() => ({}))
    setSending(false)

    if (!response.ok) {
      setError(result.error || t.error)
      return
    }

    form.reset()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex min-h-[620px] flex-col items-center justify-center bg-white p-8 text-center sm:p-12">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#e8f8ef] text-[#168754]">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-7 text-3xl font-medium tracking-[-0.035em] text-[#202124]">
          {t.thanks}
        </h2>
        <p className="mt-4 max-w-md leading-7 text-[#66717b]">
          {t.received}
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-8 rounded-full border border-[#d7d7d2] px-6 py-3 text-sm font-medium transition hover:border-[#0866ff] hover:text-[#0866ff]"
        >
          {t.newMessage}
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full min-h-[760px] flex-col bg-white p-6 sm:p-8 lg:p-10"
    >
      <input type="hidden" name="locale" value={locale} />
      <label className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="mb-8 border-b border-[#dce6ea] pb-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#0866ff]">
          {t.eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-medium tracking-[-0.045em] text-[#202124] sm:text-4xl">
          {t.formTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64737a]">
          {t.formText}
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.name} name="name" autoComplete="name" required />
        <Field label={t.email} name="email" type="email" autoComplete="email" required />
        <Field label={t.phone} name="phone" type="tel" autoComplete="tel" />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#3d4247]">{t.subject}</span>
          <select name="subject" required className="contact-control">
            <option value="">{t.choose}</option>
            {t.subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-medium text-[#3d4247]">{t.message}</span>
        <textarea
          name="message"
          required
          rows={7}
          placeholder={t.placeholder}
          className="contact-control min-h-[170px] resize-y placeholder:font-normal placeholder:text-[#98a2b3]"
        />
      </label>

      <label className="mt-5 flex items-start gap-3 rounded-[16px] bg-[#f8fbff] p-4 text-xs leading-5 text-[#72777c]">
        <input type="checkbox" name="privacy" required className="mt-1 h-4 w-4 shrink-0 accent-[#0866ff]" />
        <span>
          {t.privacyStart}{' '}
          <Link href={privacyHref} target="_blank" className="font-medium text-[#0866ff] underline">
            {t.privacyLink}
          </Link>{' '}
          {t.privacyEnd}
        </span>
      </label>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}

      <div className="mt-auto pt-8">
        <div className="flex flex-col gap-5 border-t border-[#dce6ea] pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-xs leading-5 text-[#77848a]">
            {t.footerNote}
          </p>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#0866ff] px-8 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#0053d8] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.sending}
              </>
            ) : (
              <>
                {t.send}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  autoComplete,
  required = false,
}: {
  label: string
  name: string
  type?: string
  autoComplete?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#3d4247]">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="contact-control placeholder:font-normal placeholder:text-[#98a2b3]"
      />
    </label>
  )
}
