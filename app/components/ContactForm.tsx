'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { FormEvent, useState } from 'react'

type ContactLocale = 'sv' | 'de' | 'en'

const contactCopy = {
  sv: {
    error: 'Något gick fel. Försök igen.',
    thanks: 'Tack för ditt meddelande.',
    received: 'Vi har tagit emot din fråga och återkommer så snart vi kan.',
    newMessage: 'Skicka ett nytt meddelande',
    name: 'Namn',
    email: 'E-post',
    phone: 'Telefon',
    subject: 'Vad gäller din fråga?',
    choose: 'Välj ett ämne',
    subjects: ['Sälja bil', 'Pågående ärende', 'Bilhandlare', 'Teknisk hjälp', 'Övrigt'],
    message: 'Meddelande',
    placeholder: 'Berätta hur vi kan hjälpa dig...',
    privacyStart: 'Jag har läst',
    privacyLink: 'integritetspolicyn',
    privacyEnd: 'och förstår att Autorell behandlar uppgifterna för att besvara min fråga.',
    sending: 'Skickar...',
    send: 'Skicka meddelande',
  },
  de: {
    error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    thanks: 'Vielen Dank für Ihre Nachricht.',
    received: 'Wir haben Ihre Anfrage erhalten und melden uns so schnell wie möglich.',
    newMessage: 'Neue Nachricht senden',
    name: 'Name',
    email: 'E-Mail',
    phone: 'Telefon',
    subject: 'Worum geht es bei Ihrer Anfrage?',
    choose: 'Thema auswählen',
    subjects: ['Fahrzeugverkauf', 'Laufender Vorgang', 'Autohändler', 'Technische Hilfe', 'Sonstiges'],
    message: 'Nachricht',
    placeholder: 'Wie können wir Ihnen helfen?',
    privacyStart: 'Ich habe die',
    privacyLink: 'Datenschutzerklärung',
    privacyEnd: 'gelesen und bin mit der Verarbeitung meiner Angaben zur Beantwortung der Anfrage einverstanden.',
    sending: 'Wird gesendet...',
    send: 'Nachricht senden',
  },
  en: {
    error: 'Something went wrong. Please try again.',
    thanks: 'Thank you for your message.',
    received: 'We have received your enquiry and will respond as soon as possible.',
    newMessage: 'Send another message',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    subject: 'What is your enquiry about?',
    choose: 'Select a topic',
    subjects: ['Selling a vehicle', 'Existing case', 'Dealer access', 'Technical support', 'Other'],
    message: 'Message',
    placeholder: 'Tell us how we can help...',
    privacyStart: 'I have read the',
    privacyLink: 'privacy policy',
    privacyEnd: 'and understand that Autorell processes my details to answer this enquiry.',
    sending: 'Sending...',
    send: 'Send message',
  },
} as const

export default function ContactForm({
  locale = 'sv',
}: {
  locale?: ContactLocale
}) {
  const t = contactCopy[locale]
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
      <div className="flex min-h-[520px] flex-col items-center justify-center bg-white p-8 text-center sm:p-12">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#B4D9EF] text-[#242424]">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-7 text-3xl tracking-[-0.035em] text-[#202124]">
          {t.thanks}
        </h2>
        <p className="mt-4 max-w-md leading-7 text-[#66717b]">
          {t.received}
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-8 rounded-full border border-[#d7d7d2] px-6 py-3 text-sm"
        >
          {t.newMessage}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-7 sm:p-10 lg:p-12">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t.name} name="name" autoComplete="name" required />
        <Field label={t.email} name="email" type="email" autoComplete="email" required />
        <Field label={t.phone} name="phone" type="tel" autoComplete="tel" />
        <label className="block">
          <span className="mb-2 block text-sm text-[#3d4247]">{t.subject}</span>
          <select name="subject" required className="contact-control">
            <option value="">{t.choose}</option>
            {t.subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-6 block">
        <span className="mb-2 block text-sm text-[#3d4247]">{t.message}</span>
        <textarea
          name="message"
          required
          rows={7}
          placeholder={t.placeholder}
          className="contact-control resize-none"
        />
      </label>

      <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-[#72777c]">
        <input type="checkbox" name="privacy" required className="mt-1 h-4 w-4 accent-[#242424]" />
        <span>
          {t.privacyStart}{' '}
          <Link href="/integritet" target="_blank" className="underline">
            {t.privacyLink}
          </Link>{' '}
          {t.privacyEnd}
        </span>
      </label>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="mt-7 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#242424] px-8 text-white transition hover:bg-[#111111] disabled:cursor-wait disabled:opacity-60"
      >
        {sending ? t.sending : t.send}
        {!sending && <ArrowRight className="h-4 w-4" />}
      </button>
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
      <span className="mb-2 block text-sm text-[#3d4247]">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="contact-control"
      />
    </label>
  )
}
