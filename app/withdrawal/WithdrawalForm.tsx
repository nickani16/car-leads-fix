'use client'

import { CheckCircle2, LoaderCircle, Send } from 'lucide-react'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

type FormValues = {
  fullName: string
  email: string
  orderReference: string
  contractDate: string
  message: string
  website: string
  confirmed: boolean
}

const initialValues: FormValues = {
  fullName: '',
  email: '',
  orderReference: '',
  contractDate: '',
  message: '',
  website: '',
  confirmed: false,
}

export default function WithdrawalForm({ locale }: { locale: PublicLocale }) {
  const copy = getCopy(locale)
  const [values, setValues] = useState(initialValues)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ reference: string; emailSent: boolean } | null>(null)

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          locale,
          sourcePath: window.location.pathname,
        }),
      })
      const payload = await response.json().catch(() => null) as {
        reference?: string
        confirmationEmailSent?: boolean
      } | null
      if (!response.ok || !payload?.reference) throw new Error('SUBMIT_FAILED')
      setResult({
        reference: payload.reference,
        emailSent: Boolean(payload.confirmationEmailSent),
      })
    } catch {
      setError(copy.error)
    } finally {
      setBusy(false)
    }
  }

  if (result) {
    return (
      <section className="rounded-[18px] border border-[#a7deb8] bg-[#f0fbf4] p-6 sm:p-8" aria-live="polite">
        <CheckCircle2 className="h-9 w-9 text-[#079455]" />
        <h2 className="mt-5 text-2xl font-bold tracking-[-0.035em] text-[#101828]">{copy.successTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-[#475467]">{copy.successText}</p>
        <p className="mt-5 rounded-[12px] bg-white px-4 py-3 font-mono text-sm font-bold text-[#101828]">
          {copy.reference}: {result.reference}
        </p>
        <p className="mt-3 text-xs leading-5 text-[#667085]">
          {result.emailSent ? copy.emailSent : copy.emailPending}
        </p>
      </section>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-[18px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.06)] sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={copy.fullName} required>
          <input value={values.fullName} onChange={(event) => update('fullName', event.target.value)} autoComplete="name" required placeholder={copy.fullNamePlaceholder} className={inputClass} />
        </Field>
        <Field label={copy.email} required>
          <input value={values.email} onChange={(event) => update('email', event.target.value)} type="email" autoComplete="email" required placeholder={copy.emailPlaceholder} className={inputClass} />
        </Field>
        <Field label={copy.orderReference} required helper={copy.orderReferenceHelp}>
          <input value={values.orderReference} onChange={(event) => update('orderReference', event.target.value)} required placeholder={copy.orderReferencePlaceholder} className={inputClass} />
        </Field>
        <Field label={copy.contractDate} helper={copy.optional}>
          <input value={values.contractDate} onChange={(event) => update('contractDate', event.target.value)} type="date" className={inputClass} />
        </Field>
        <Field label={copy.message} helper={copy.optional} fullWidth>
          <textarea value={values.message} onChange={(event) => update('message', event.target.value)} rows={5} placeholder={copy.messagePlaceholder} className={`${inputClass} min-h-32 resize-y py-3`} />
        </Field>
      </div>

      <input value={values.website} onChange={(event) => update('website', event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-[14px] border border-[#d9e2ef] bg-[#f8fbff] p-4 text-sm leading-6 text-[#475467]">
        <input type="checkbox" checked={values.confirmed} onChange={(event) => update('confirmed', event.target.checked)} required className="mt-1 h-4 w-4 accent-[#0866ff]" />
        <span>
          {copy.confirmation}{' '}
          <Link href={localizePublicHref(locale, '/privacy')} className="font-semibold text-[#0866ff] underline underline-offset-2">
            {copy.privacy}
          </Link>
        </span>
      </label>

      {error ? <p role="alert" className="mt-4 rounded-[12px] border border-[#fda29b] bg-[#fff5f4] px-4 py-3 text-sm font-semibold text-[#b42318]">{error}</p> : null}

      <button disabled={busy} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 text-sm font-bold text-white disabled:opacity-70 sm:w-auto">
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {busy ? copy.sending : copy.submit}
      </button>
    </form>
  )
}

function Field({
  label,
  helper,
  required = false,
  fullWidth = false,
  children,
}: {
  label: string
  helper?: string
  required?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}) {
  return (
    <label className={`block min-w-0 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <span className="text-sm font-semibold text-[#344054]">{label}{required ? ' *' : ''}</span>
      {helper ? <span className="ml-2 text-xs font-normal text-[#667085]">{helper}</span> : null}
      <span className="mt-2 block">{children}</span>
    </label>
  )
}

const inputClass = 'block min-h-12 w-full rounded-[14px] border border-[#b8c4d6] bg-white px-4 text-[15px] font-normal text-[#101828] outline-none placeholder:font-normal placeholder:text-[#7c8799] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10'

type WithdrawalCopy = {
  fullName: string
  fullNamePlaceholder: string
  email: string
  emailPlaceholder: string
  orderReference: string
  orderReferenceHelp: string
  orderReferencePlaceholder: string
  contractDate: string
  optional: string
  message: string
  messagePlaceholder: string
  confirmation: string
  privacy: string
  submit: string
  sending: string
  error: string
  successTitle: string
  successText: string
  reference: string
  emailSent: string
  emailPending: string
}

const copies: Record<'en' | 'sv' | 'de' | 'fr' | 'es' | 'it' | 'pl' | 'nl' | 'fi' | 'da', WithdrawalCopy> = {
  en: copy('Full name', 'Your first and last name', 'Email', 'you@example.com', 'Order or listing reference', 'Use the reference from your receipt, payment or listing.', 'For example AR-12345', 'Contract date', 'Optional', 'Additional information', 'Explain which service you want to withdraw from.', 'I confirm that I am submitting an unambiguous withdrawal request and that the information is correct.', 'Privacy policy', 'Submit withdrawal request', 'Submitting...', 'The request could not be submitted. Check the details and try again.', 'Your withdrawal request has been received', 'Autorell has registered your request. Keep the reference below.', 'Reference', 'A confirmation has also been sent to your email.', 'The request is registered. Keep this page and the reference as confirmation.'),
  sv: copy('Fullständigt namn', 'Ditt för- och efternamn', 'E-post', 'du@exempel.se', 'Order- eller annonsreferens', 'Använd referensen från kvittot, betalningen eller annonsen.', 'Till exempel AR-12345', 'Avtalsdatum', 'Frivilligt', 'Ytterligare information', 'Beskriv vilken tjänst du vill frånträda.', 'Jag bekräftar att jag lämnar ett otvetydigt meddelande om att jag vill frånträda avtalet och att uppgifterna är korrekta.', 'Integritetspolicy', 'Skicka ångerbegäran', 'Skickar...', 'Begäran kunde inte skickas. Kontrollera uppgifterna och försök igen.', 'Din ångerbegäran är mottagen', 'Autorell har registrerat din begäran. Spara referensen nedan.', 'Referens', 'En bekräftelse har också skickats till din e-post.', 'Begäran är registrerad. Spara sidan och referensen som bekräftelse.'),
  de: copy('Vollständiger Name', 'Vor- und Nachname', 'E-Mail', 'sie@beispiel.de', 'Bestell- oder Anzeigenreferenz', 'Verwenden Sie die Referenz aus Beleg, Zahlung oder Anzeige.', 'Zum Beispiel AR-12345', 'Vertragsdatum', 'Optional', 'Zusätzliche Angaben', 'Beschreiben Sie, von welcher Leistung Sie zurücktreten möchten.', 'Ich bestätige, dass ich eindeutig den Widerruf erkläre und die Angaben richtig sind.', 'Datenschutz', 'Widerruf absenden', 'Wird gesendet...', 'Der Widerruf konnte nicht gesendet werden. Prüfen Sie die Angaben und versuchen Sie es erneut.', 'Ihr Widerruf ist eingegangen', 'Autorell hat Ihren Widerruf registriert. Bewahren Sie die Referenz auf.', 'Referenz', 'Eine Bestätigung wurde auch per E-Mail gesendet.', 'Der Widerruf ist registriert. Bewahren Sie diese Seite und die Referenz auf.'),
  fr: copy('Nom complet', 'Vos nom et prénom', 'E-mail', 'vous@exemple.fr', 'Référence de commande ou d’annonce', 'Utilisez la référence du reçu, du paiement ou de l’annonce.', 'Par exemple AR-12345', 'Date du contrat', 'Facultatif', 'Informations complémentaires', 'Indiquez le service concerné par la rétractation.', 'Je confirme présenter une demande de rétractation sans ambiguïté et que les informations sont exactes.', 'Politique de confidentialité', 'Envoyer la rétractation', 'Envoi...', 'La demande n’a pas pu être envoyée. Vérifiez les informations et réessayez.', 'Votre demande de rétractation est reçue', 'Autorell a enregistré votre demande. Conservez la référence ci-dessous.', 'Référence', 'Une confirmation a également été envoyée par e-mail.', 'La demande est enregistrée. Conservez cette page et la référence.'),
  es: copy('Nombre completo', 'Nombre y apellidos', 'Correo electrónico', 'tu@ejemplo.es', 'Referencia de pedido o anuncio', 'Usa la referencia del recibo, pago o anuncio.', 'Por ejemplo AR-12345', 'Fecha del contrato', 'Opcional', 'Información adicional', 'Indica de qué servicio quieres desistir.', 'Confirmo que presento una solicitud inequívoca de desistimiento y que los datos son correctos.', 'Política de privacidad', 'Enviar desistimiento', 'Enviando...', 'No se pudo enviar la solicitud. Revisa los datos e inténtalo de nuevo.', 'Hemos recibido tu desistimiento', 'Autorell ha registrado tu solicitud. Guarda la referencia.', 'Referencia', 'También hemos enviado una confirmación por correo.', 'La solicitud está registrada. Guarda esta página y la referencia.'),
  it: copy('Nome completo', 'Nome e cognome', 'E-mail', 'tu@esempio.it', 'Riferimento ordine o annuncio', 'Usa il riferimento della ricevuta, del pagamento o dell’annuncio.', 'Ad esempio AR-12345', 'Data del contratto', 'Facoltativo', 'Informazioni aggiuntive', 'Indica il servizio dal quale vuoi recedere.', 'Confermo di presentare una richiesta inequivocabile di recesso e che i dati sono corretti.', 'Informativa sulla privacy', 'Invia richiesta di recesso', 'Invio...', 'Non è stato possibile inviare la richiesta. Controlla i dati e riprova.', 'La richiesta di recesso è stata ricevuta', 'Autorell ha registrato la richiesta. Conserva il riferimento.', 'Riferimento', 'È stata inviata anche una conferma via e-mail.', 'La richiesta è registrata. Conserva questa pagina e il riferimento.'),
  pl: copy('Imię i nazwisko', 'Twoje imię i nazwisko', 'E-mail', 'ty@przyklad.pl', 'Numer zamówienia lub ogłoszenia', 'Użyj numeru z potwierdzenia, płatności lub ogłoszenia.', 'Na przykład AR-12345', 'Data umowy', 'Opcjonalnie', 'Dodatkowe informacje', 'Wskaż usługę, od której chcesz odstąpić.', 'Potwierdzam, że składam jednoznaczne oświadczenie o odstąpieniu i że dane są prawidłowe.', 'Polityka prywatności', 'Wyślij odstąpienie', 'Wysyłanie...', 'Nie udało się wysłać wniosku. Sprawdź dane i spróbuj ponownie.', 'Otrzymaliśmy Twoje odstąpienie', 'Autorell zarejestrował wniosek. Zachowaj numer referencyjny.', 'Numer referencyjny', 'Potwierdzenie wysłaliśmy także e-mailem.', 'Wniosek jest zarejestrowany. Zachowaj tę stronę i numer.'),
  nl: copy('Volledige naam', 'Voor- en achternaam', 'E-mail', 'u@voorbeeld.nl', 'Bestel- of advertentiereferentie', 'Gebruik de referentie van ontvangstbewijs, betaling of advertentie.', 'Bijvoorbeeld AR-12345', 'Contractdatum', 'Optioneel', 'Aanvullende informatie', 'Beschrijf van welke dienst u wilt afzien.', 'Ik bevestig dat ik ondubbelzinnig om herroeping verzoek en dat de gegevens juist zijn.', 'Privacybeleid', 'Herroepingsverzoek versturen', 'Versturen...', 'Het verzoek kon niet worden verzonden. Controleer de gegevens en probeer opnieuw.', 'Uw herroepingsverzoek is ontvangen', 'Autorell heeft uw verzoek geregistreerd. Bewaar de referentie.', 'Referentie', 'Een bevestiging is ook per e-mail verzonden.', 'Het verzoek is geregistreerd. Bewaar deze pagina en de referentie.'),
  fi: copy('Koko nimi', 'Etu- ja sukunimi', 'Sähköposti', 'sinä@esimerkki.fi', 'Tilauksen tai ilmoituksen viite', 'Käytä kuitin, maksun tai ilmoituksen viitettä.', 'Esimerkiksi AR-12345', 'Sopimuspäivä', 'Vapaaehtoinen', 'Lisätiedot', 'Kerro, mistä palvelusta haluat peruuttaa sopimuksen.', 'Vahvistan, että ilmoitan yksiselitteisesti peruuttamisesta ja että tiedot ovat oikein.', 'Tietosuojakäytäntö', 'Lähetä peruuttamispyyntö', 'Lähetetään...', 'Pyyntöä ei voitu lähettää. Tarkista tiedot ja yritä uudelleen.', 'Peruuttamispyyntösi on vastaanotettu', 'Autorell on rekisteröinyt pyyntösi. Säilytä viite.', 'Viite', 'Vahvistus on lähetetty myös sähköpostitse.', 'Pyyntö on rekisteröity. Säilytä tämä sivu ja viite.'),
  da: copy('Fulde navn', 'For- og efternavn', 'E-mail', 'dig@eksempel.dk', 'Ordre- eller annoncereference', 'Brug referencen fra kvitteringen, betalingen eller annoncen.', 'For eksempel AR-12345', 'Aftaledato', 'Valgfrit', 'Yderligere oplysninger', 'Beskriv hvilken tjeneste du vil fortryde.', 'Jeg bekræfter, at jeg entydigt meddeler, at jeg vil fortryde aftalen, og at oplysningerne er korrekte.', 'Privatlivspolitik', 'Send fortrydelse', 'Sender...', 'Anmodningen kunne ikke sendes. Kontrollér oplysningerne og prøv igen.', 'Din fortrydelse er modtaget', 'Autorell har registreret din anmodning. Gem referencen.', 'Reference', 'En bekræftelse er også sendt til din e-mail.', 'Anmodningen er registreret. Gem denne side og referencen.'),
}

function copy(...values: string[]): WithdrawalCopy {
  const [fullName, fullNamePlaceholder, email, emailPlaceholder, orderReference, orderReferenceHelp, orderReferencePlaceholder, contractDate, optional, message, messagePlaceholder, confirmation, privacy, submit, sending, error, successTitle, successText, reference, emailSent, emailPending] = values
  return { fullName, fullNamePlaceholder, email, emailPlaceholder, orderReference, orderReferenceHelp, orderReferencePlaceholder, contractDate, optional, message, messagePlaceholder, confirmation, privacy, submit, sending, error, successTitle, successText, reference, emailSent, emailPending }
}

function getCopy(locale: PublicLocale) {
  if (locale === 'at') return copies.de
  if (locale === 'be') return copies.nl
  return copies[locale] || copies.en
}
