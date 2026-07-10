'use client'

import { FormEvent, useState } from 'react'
import { Mail, Send, X } from 'lucide-react'
import type { PublicLocale } from '@/lib/public-i18n'

type ListingContactFormButtonProps = {
  listingId: string
  listingTitle: string
  locale: PublicLocale
}

const copy = {
  sv: {
    open: 'Kontaktformulär',
    title: 'Kontakta säljaren',
    intro: 'Skicka en förfrågan direkt till säljaren. Säljaren får dina kontaktuppgifter via e-post.',
    name: 'Namn',
    phone: 'Telefonnummer',
    email: 'E-post',
    offer: 'Vad vill du erbjuda?',
    offerPlaceholder: 'Exempel: 720 000 SEK',
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
    offer: 'Your offer',
    offerPlaceholder: 'Example: 720,000 SEK',
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
    offer: 'Ihr Angebot',
    offerPlaceholder: 'Beispiel: 720.000 SEK',
    message: 'Nachricht',
    messagePlaceholder: 'Schreiben Sie, was Sie wissen möchten oder wann Sie kontaktiert werden möchten.',
    privacy: 'Ich stimme zu, dass Autorell meine Kontaktdaten für diese Anzeige an den Verkäufer sendet.',
    submit: 'Anfrage senden',
    sending: 'Wird gesendet...',
    success: 'Ihre Anfrage wurde an den Verkäufer gesendet.',
    error: 'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
    close: 'Schließen',
  },
} as const

export default function ListingContactFormButton({
  listingId,
  listingTitle,
  locale,
}: ListingContactFormButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const text = locale === 'sv' || locale === 'de' ? copy[locale] : copy.en

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
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#101828]/35 px-4 py-6 backdrop-blur-md">
          <div className="max-h-[calc(100vh-3rem)] w-full max-w-[560px] overflow-y-auto rounded-[22px] border border-[#dfe6f2] bg-white shadow-[0_30px_90px_rgba(16,24,40,.25)]">
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
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={text.name} name="name" required />
                <FormField label={text.phone} name="phone" type="tel" required />
              </div>
              <FormField label={text.email} name="email" type="email" required />
              <FormField label={text.offer} name="offer" placeholder={text.offerPlaceholder} />
              <label className="grid gap-2 text-sm font-semibold text-[#101828]">
                {text.message}
                <textarea
                  name="message"
                  required
                  maxLength={3000}
                  rows={5}
                  placeholder={text.messagePlaceholder}
                  className="min-h-[132px] resize-y rounded-[14px] border border-[#cfd8e6] bg-white px-4 py-3 text-base font-medium leading-7 text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                />
              </label>
              <label className="flex items-start gap-3 rounded-[14px] bg-[#f8fbff] px-4 py-3 text-sm font-medium leading-6 text-[#475467]">
                <input
                  name="privacy"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 cursor-pointer rounded border-[#98a2b3] text-[#0866ff]"
                />
                <span>{text.privacy}</span>
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
    <label className="grid gap-2 text-sm font-semibold text-[#101828]">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-12 rounded-[14px] border border-[#cfd8e6] bg-white px-4 text-base font-medium text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
      />
    </label>
  )
}
