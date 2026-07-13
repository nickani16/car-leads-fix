'use client'

import { FormEvent, useState } from 'react'
import type { PublicLocale } from '@/lib/public-i18n'
import type { SupportedCurrency } from '@/lib/marketplace'

const currencies = [
  'EUR',
  'SEK',
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

type ReportFormCopy = {
  success: string
  fallbackError: string
  categoryLabel: string
  categories: Record<string, string>
  listingId: string
  transactionReference: string
  counterpartyName: string
  occurredAt: string
  amount: string
  currency: string
  contactPhone: string
  details: string
  submit: string
}

const formCopy: Record<PublicLocale, ReportFormCopy> = {
  sv: {
    success: 'Din rapport har tagits emot och lagts i kö för granskning.',
    fallbackError: 'Logga in och försök igen.',
    categoryLabel: 'Vad gäller rapporten?',
    categories: {
      suspected_fraud: 'Misstänkt bedrägeri',
      payment_request: 'Betalningsförfrågan utanför Autorell',
      misleading_listing: 'Vilseledande annons',
      unsafe_product: 'Osäkert eller olagligt fordon',
      harassment: 'Trakasserier i meddelanden',
      identity_misuse: 'Identitetsmissbruk',
      other: 'Annat',
    },
    listingId: 'Annons-ID eller referensnummer (valfritt)',
    transactionReference: 'Transaktions- eller betalningsreferens',
    counterpartyName: 'Motpartens namn',
    occurredAt: 'När hände det?',
    amount: 'Belopp',
    currency: 'Valuta',
    contactPhone: 'Telefon för uppföljning',
    details: 'Beskriv vad som hände',
    submit: 'Skicka rapport',
  },
  en: {
    success: 'Your report has been received and queued for review.',
    fallbackError: 'Please sign in and try again.',
    categoryLabel: 'What does the report concern?',
    categories: {
      suspected_fraud: 'Suspected fraud',
      payment_request: 'Payment request outside Autorell',
      misleading_listing: 'Misleading listing',
      unsafe_product: 'Unsafe or illegal vehicle',
      harassment: 'Harassment in messages',
      identity_misuse: 'Identity misuse',
      other: 'Other',
    },
    listingId: 'Listing ID or reference number (optional)',
    transactionReference: 'Transaction or payment reference',
    counterpartyName: 'Counterparty name',
    occurredAt: 'When did it happen?',
    amount: 'Amount',
    currency: 'Currency',
    contactPhone: 'Phone for follow-up',
    details: 'Describe what happened',
    submit: 'Submit report',
  },
  de: {
    success: 'Ihre Meldung wurde empfangen und zur Prüfung vorgemerkt.',
    fallbackError: 'Bitte melden Sie sich an und versuchen Sie es erneut.',
    categoryLabel: 'Worum geht es in der Meldung?',
    categories: {
      suspected_fraud: 'Verdacht auf Betrug',
      payment_request: 'Zahlungsaufforderung außerhalb von Autorell',
      misleading_listing: 'Irreführende Anzeige',
      unsafe_product: 'Unsicheres oder illegales Fahrzeug',
      harassment: 'Belästigung in Nachrichten',
      identity_misuse: 'Identitätsmissbrauch',
      other: 'Sonstiges',
    },
    listingId: 'Anzeigen-ID oder Referenznummer (optional)',
    transactionReference: 'Transaktions- oder Zahlungsreferenz',
    counterpartyName: 'Name der Gegenpartei',
    occurredAt: 'Wann ist es passiert?',
    amount: 'Betrag',
    currency: 'Währung',
    contactPhone: 'Telefon für Rückfragen',
    details: 'Beschreiben Sie, was passiert ist',
    submit: 'Meldung senden',
  },
  at: {
    success: 'Ihre Meldung wurde empfangen und zur Prüfung vorgemerkt.',
    fallbackError: 'Bitte melden Sie sich an und versuchen Sie es erneut.',
    categoryLabel: 'Worum geht es in der Meldung?',
    categories: {
      suspected_fraud: 'Verdacht auf Betrug',
      payment_request: 'Zahlungsaufforderung außerhalb von Autorell',
      misleading_listing: 'Irreführende Anzeige',
      unsafe_product: 'Unsicheres oder illegales Fahrzeug',
      harassment: 'Belästigung in Nachrichten',
      identity_misuse: 'Identitätsmissbrauch',
      other: 'Sonstiges',
    },
    listingId: 'Anzeigen-ID oder Referenznummer (optional)',
    transactionReference: 'Transaktions- oder Zahlungsreferenz',
    counterpartyName: 'Name der Gegenpartei',
    occurredAt: 'Wann ist es passiert?',
    amount: 'Betrag',
    currency: 'Währung',
    contactPhone: 'Telefon für Rückfragen',
    details: 'Beschreiben Sie, was passiert ist',
    submit: 'Meldung senden',
  },
  be: {
    success: 'Uw melding is ontvangen en staat klaar voor beoordeling.',
    fallbackError: 'Log in en probeer opnieuw.',
    categoryLabel: 'Waar gaat de melding over?',
    categories: {
      suspected_fraud: 'Vermoedelijke fraude',
      payment_request: 'Betaalverzoek buiten Autorell',
      misleading_listing: 'Misleidende advertentie',
      unsafe_product: 'Onveilig of illegaal voertuig',
      harassment: 'Intimidatie in berichten',
      identity_misuse: 'Misbruik van identiteit',
      other: 'Overig',
    },
    listingId: 'Advertentie-ID of referentienummer (optioneel)',
    transactionReference: 'Transactie- of betalingsreferentie',
    counterpartyName: 'Naam van tegenpartij',
    occurredAt: 'Wanneer is het gebeurd?',
    amount: 'Bedrag',
    currency: 'Valuta',
    contactPhone: 'Telefoon voor opvolging',
    details: 'Beschrijf wat er is gebeurd',
    submit: 'Melding versturen',
  },
  fr: {
    success: 'Votre signalement a été reçu et placé en file d’examen.',
    fallbackError: 'Veuillez vous connecter et réessayer.',
    categoryLabel: 'Que concerne le signalement ?',
    categories: {
      suspected_fraud: 'Fraude suspectée',
      payment_request: 'Demande de paiement hors Autorell',
      misleading_listing: 'Annonce trompeuse',
      unsafe_product: 'Véhicule dangereux ou illégal',
      harassment: 'Harcèlement dans les messages',
      identity_misuse: 'Usurpation d’identité',
      other: 'Autre',
    },
    listingId: 'ID de l’annonce ou référence (facultatif)',
    transactionReference: 'Référence de transaction ou de paiement',
    counterpartyName: 'Nom de la contrepartie',
    occurredAt: 'Quand cela s’est-il produit ?',
    amount: 'Montant',
    currency: 'Devise',
    contactPhone: 'Téléphone pour le suivi',
    details: 'Décrivez ce qui s’est passé',
    submit: 'Envoyer le signalement',
  },
  es: {
    success: 'Tu informe se ha recibido y está en cola para revisión.',
    fallbackError: 'Inicia sesión e inténtalo de nuevo.',
    categoryLabel: '¿De qué trata el informe?',
    categories: {
      suspected_fraud: 'Sospecha de fraude',
      payment_request: 'Solicitud de pago fuera de Autorell',
      misleading_listing: 'Anuncio engañoso',
      unsafe_product: 'Vehículo inseguro o ilegal',
      harassment: 'Acoso en mensajes',
      identity_misuse: 'Uso indebido de identidad',
      other: 'Otro',
    },
    listingId: 'ID del anuncio o número de referencia (opcional)',
    transactionReference: 'Referencia de transacción o pago',
    counterpartyName: 'Nombre de la contraparte',
    occurredAt: '¿Cuándo ocurrió?',
    amount: 'Importe',
    currency: 'Moneda',
    contactPhone: 'Teléfono para seguimiento',
    details: 'Describe lo ocurrido',
    submit: 'Enviar informe',
  },
  it: {
    success: 'La tua segnalazione è stata ricevuta e messa in coda per la revisione.',
    fallbackError: 'Accedi e riprova.',
    categoryLabel: 'A cosa si riferisce la segnalazione?',
    categories: {
      suspected_fraud: 'Sospetta frode',
      payment_request: 'Richiesta di pagamento fuori da Autorell',
      misleading_listing: 'Annuncio fuorviante',
      unsafe_product: 'Veicolo non sicuro o illegale',
      harassment: 'Molestie nei messaggi',
      identity_misuse: 'Uso improprio dell’identità',
      other: 'Altro',
    },
    listingId: 'ID annuncio o numero di riferimento (facoltativo)',
    transactionReference: 'Riferimento transazione o pagamento',
    counterpartyName: 'Nome della controparte',
    occurredAt: 'Quando è successo?',
    amount: 'Importo',
    currency: 'Valuta',
    contactPhone: 'Telefono per il seguito',
    details: 'Descrivi cosa è successo',
    submit: 'Invia segnalazione',
  },
  pl: {
    success: 'Twoje zgłoszenie zostało odebrane i przekazane do weryfikacji.',
    fallbackError: 'Zaloguj się i spróbuj ponownie.',
    categoryLabel: 'Czego dotyczy zgłoszenie?',
    categories: {
      suspected_fraud: 'Podejrzenie oszustwa',
      payment_request: 'Żądanie płatności poza Autorell',
      misleading_listing: 'Wprowadzające w błąd ogłoszenie',
      unsafe_product: 'Niebezpieczny lub nielegalny pojazd',
      harassment: 'Nękanie w wiadomościach',
      identity_misuse: 'Nadużycie tożsamości',
      other: 'Inne',
    },
    listingId: 'ID ogłoszenia lub numer referencyjny (opcjonalnie)',
    transactionReference: 'Referencja transakcji lub płatności',
    counterpartyName: 'Nazwa drugiej strony',
    occurredAt: 'Kiedy to się stało?',
    amount: 'Kwota',
    currency: 'Waluta',
    contactPhone: 'Telefon do kontaktu',
    details: 'Opisz, co się stało',
    submit: 'Wyślij zgłoszenie',
  },
  nl: {
    success: 'Uw melding is ontvangen en staat klaar voor beoordeling.',
    fallbackError: 'Log in en probeer opnieuw.',
    categoryLabel: 'Waar gaat de melding over?',
    categories: {
      suspected_fraud: 'Vermoedelijke fraude',
      payment_request: 'Betaalverzoek buiten Autorell',
      misleading_listing: 'Misleidende advertentie',
      unsafe_product: 'Onveilig of illegaal voertuig',
      harassment: 'Intimidatie in berichten',
      identity_misuse: 'Misbruik van identiteit',
      other: 'Overig',
    },
    listingId: 'Advertentie-ID of referentienummer (optioneel)',
    transactionReference: 'Transactie- of betalingsreferentie',
    counterpartyName: 'Naam van tegenpartij',
    occurredAt: 'Wanneer is het gebeurd?',
    amount: 'Bedrag',
    currency: 'Valuta',
    contactPhone: 'Telefoon voor opvolging',
    details: 'Beschrijf wat er is gebeurd',
    submit: 'Melding versturen',
  },
  fi: {
    success: 'Ilmoituksesi on vastaanotettu ja asetettu tarkistettavaksi.',
    fallbackError: 'Kirjaudu sisään ja yritä uudelleen.',
    categoryLabel: 'Mitä ilmoitus koskee?',
    categories: {
      suspected_fraud: 'Epäilty petos',
      payment_request: 'Maksupyyntö Autorellin ulkopuolella',
      misleading_listing: 'Harhaanjohtava ilmoitus',
      unsafe_product: 'Turvaton tai laiton ajoneuvo',
      harassment: 'Häirintä viesteissä',
      identity_misuse: 'Identiteetin väärinkäyttö',
      other: 'Muu',
    },
    listingId: 'Ilmoituksen ID tai viitenumero (valinnainen)',
    transactionReference: 'Tapahtuma- tai maksuviite',
    counterpartyName: 'Vastapuolen nimi',
    occurredAt: 'Milloin se tapahtui?',
    amount: 'Summa',
    currency: 'Valuutta',
    contactPhone: 'Puhelin jatkoyhteydenottoa varten',
    details: 'Kuvaile mitä tapahtui',
    submit: 'Lähetä ilmoitus',
  },
  da: {
    success: 'Din anmeldelse er modtaget og sat i kø til gennemgang.',
    fallbackError: 'Log ind og prøv igen.',
    categoryLabel: 'Hvad handler anmeldelsen om?',
    categories: {
      suspected_fraud: 'Mistanke om svindel',
      payment_request: 'Betalingsanmodning uden for Autorell',
      misleading_listing: 'Vildledende annonce',
      unsafe_product: 'Usikkert eller ulovligt køretøj',
      harassment: 'Chikane i beskeder',
      identity_misuse: 'Misbrug af identitet',
      other: 'Andet',
    },
    listingId: 'Annonce-ID eller referencenummer (valgfrit)',
    transactionReference: 'Transaktions- eller betalingsreference',
    counterpartyName: 'Modpartens navn',
    occurredAt: 'Hvornår skete det?',
    amount: 'Beløb',
    currency: 'Valuta',
    contactPhone: 'Telefon til opfølgning',
    details: 'Beskriv hvad der skete',
    submit: 'Send anmeldelse',
  },
}

const categoryValues = [
  'suspected_fraud',
  'payment_request',
  'misleading_listing',
  'unsafe_product',
  'harassment',
  'identity_misuse',
  'other',
] as const

export default function ReportForm({
  locale,
  currency,
}: {
  locale: PublicLocale
  currency: SupportedCurrency
}) {
  const text = formCopy[locale] || formCopy.en
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/account/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    })
    await response.json().catch(() => null)
    setMessage(
      response.ok
        ? text.success
        : text.fallbackError,
    )
    if (response.ok) event.currentTarget.reset()
  }

  return (
    <form
      onSubmit={submit}
      className="w-full min-w-0 rounded-[22px] border border-[#dfe6f2] bg-white p-5 shadow-sm sm:p-8"
    >
      <label className="block min-w-0">
        <span className="mb-2 block text-sm font-semibold">
          {text.categoryLabel}
        </span>
        <select
          name="category"
          className="h-12 w-full min-w-0 rounded-[14px] border border-[#dfe6f2] bg-white px-4"
        >
          {categoryValues.map((value) => (
            <option key={value} value={value}>
              {text.categories[value]}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block min-w-0">
        <span className="mb-2 block text-sm font-semibold">
          {text.listingId}
        </span>
        <input
          name="listingId"
          className="h-12 w-full min-w-0 rounded-[14px] border border-[#dfe6f2] px-4"
        />
      </label>

      <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-semibold">
            {text.transactionReference}
          </span>
          <input
            name="transactionReference"
            className="h-12 w-full min-w-0 rounded-[14px] border border-[#dfe6f2] px-4"
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-semibold">
            {text.counterpartyName}
          </span>
          <input
            name="counterpartyName"
            className="h-12 w-full min-w-0 rounded-[14px] border border-[#dfe6f2] px-4"
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-semibold">
            {text.occurredAt}
          </span>
          <input
            name="occurredAt"
            type="datetime-local"
            className="h-12 w-full min-w-0 rounded-[14px] border border-[#dfe6f2] px-4"
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-semibold">{text.amount}</span>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            className="h-12 w-full min-w-0 rounded-[14px] border border-[#dfe6f2] px-4"
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-semibold">{text.currency}</span>
          <select
            name="currency"
            defaultValue={currency}
            className="h-12 w-full min-w-0 rounded-[14px] border border-[#dfe6f2] bg-white px-4"
          >
            {currencies.map((currency) => (
              <option key={currency}>{currency}</option>
            ))}
          </select>
        </label>
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-semibold">
            {text.contactPhone}
          </span>
          <input
            name="contactPhone"
            type="tel"
            className="h-12 w-full min-w-0 rounded-[14px] border border-[#dfe6f2] px-4"
          />
        </label>
      </div>

      <label className="mt-4 block min-w-0">
        <span className="mb-2 block text-sm font-semibold">
          {text.details}
        </span>
        <textarea
          name="details"
          minLength={10}
          required
          className="min-h-36 w-full min-w-0 rounded-[14px] border border-[#dfe6f2] p-4"
        />
      </label>

      {message ? <p className="mt-4 text-sm text-[#475467]">{message}</p> : null}

      <button className="mt-5 min-h-12 rounded-[14px] bg-[#0866ff] px-6 font-bold text-white">
        {text.submit}
      </button>
    </form>
  )
}
