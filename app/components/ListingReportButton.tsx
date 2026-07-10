'use client'

import { AlertTriangle, X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

type ListingReportButtonProps = {
  listingId: string
  listingTitle: string
  locale: PublicLocale
}

const reportCopy = {
  sv: {
    button: 'Anmäl annons',
    title: 'Anmäl annons',
    intro: 'Berätta vad som inte stämmer. Rapporten sparas för granskning av Autorell.',
    reason: 'Vad gäller anmälan?',
    misleading: 'Felaktig eller vilseledande information',
    fraud: 'Misstänkt bedrägeri',
    unsafe: 'Otillåtet eller osäkert fordon',
    payment: 'Betalning utanför Autorell',
    other: 'Annat',
    email: 'E-post för återkoppling',
    emailPlaceholder: 'namn@example.com',
    details: 'Beskriv problemet',
    detailsPlaceholder: 'Skriv vad som bör granskas i annonsen.',
    submit: 'Skicka anmälan',
    close: 'Stäng',
    success: 'Tack. Anmälan har sparats för granskning.',
    error: 'Det gick inte att skicka anmälan. Försök igen.',
  },
  en: {
    button: 'Report listing',
    title: 'Report listing',
    intro: 'Tell us what is wrong. The report is saved for Autorell review.',
    reason: 'What is the report about?',
    misleading: 'Incorrect or misleading information',
    fraud: 'Suspected fraud',
    unsafe: 'Illegal or unsafe vehicle',
    payment: 'Payment outside Autorell',
    other: 'Other',
    email: 'Email for follow-up',
    emailPlaceholder: 'name@example.com',
    details: 'Describe the issue',
    detailsPlaceholder: 'Write what should be reviewed in the listing.',
    submit: 'Submit report',
    close: 'Close',
    success: 'Thank you. The report has been saved for review.',
    error: 'The report could not be submitted. Please try again.',
  },
  de: {
    button: 'Anzeige melden',
    title: 'Anzeige melden',
    intro: 'Teilen Sie uns mit, was nicht stimmt. Die Meldung wird von Autorell geprüft.',
    reason: 'Worum geht es?',
    misleading: 'Falsche oder irreführende Angaben',
    fraud: 'Verdacht auf Betrug',
    unsafe: 'Unzulässiges oder unsicheres Fahrzeug',
    payment: 'Zahlung außerhalb von Autorell',
    other: 'Sonstiges',
    email: 'E-Mail für Rückfragen',
    emailPlaceholder: 'name@example.com',
    details: 'Problem beschreiben',
    detailsPlaceholder: 'Beschreiben Sie, was in der Anzeige geprüft werden soll.',
    submit: 'Meldung senden',
    close: 'Schließen',
    success: 'Danke. Die Meldung wurde zur Prüfung gespeichert.',
    error: 'Die Meldung konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
  },
} as const

export default function ListingReportButton({
  listingId,
  listingTitle,
  locale,
}: ListingReportButtonProps) {
  const copy =
    locale === 'sv'
      ? reportCopy.sv
      : locale === 'de' || locale === 'at'
        ? reportCopy.de
        : locale === 'en'
          ? reportCopy.en
          : translatePublicObject(locale, reportCopy.en)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/listing-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId,
        listingTitle,
        category: form.get('category'),
        contactEmail: form.get('contactEmail'),
        details: form.get('details'),
        company: form.get('company'),
      }),
    })
    setSubmitting(false)
    setMessage(response.ok ? copy.success : copy.error)
    if (response.ok) event.currentTarget.reset()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-[#d9e1ec] bg-white px-4 text-sm font-bold text-[#101828] transition hover:border-[#b42318] hover:text-[#b42318]"
      >
        <AlertTriangle className="h-4 w-4" />
        {copy.button}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101828]/45 p-3 sm:grid sm:place-items-center sm:p-4">
          <div className="mx-auto my-3 max-h-[calc(100dvh-24px)] w-full max-w-[560px] overflow-y-auto rounded-[18px] bg-white shadow-[0_24px_80px_rgba(16,24,40,.24)] sm:my-0">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#edf1f6] bg-white px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h2 className="text-xl font-black tracking-[-0.035em]">{copy.title}</h2>
                <p className="mt-1 text-sm text-[#667085]">{copy.intro}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={copy.close}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#475467] transition hover:bg-[#f2f5f9]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-4 p-5">
              <input name="company" className="hidden" tabIndex={-1} autoComplete="off" />
              <label className="grid gap-2">
                <span className="text-sm font-bold">{copy.reason}</span>
                <select name="category" className="h-12 rounded-[12px] border border-[#d9e1ec] bg-white px-3 text-sm">
                  <option value="misleading_listing">{copy.misleading}</option>
                  <option value="suspected_fraud">{copy.fraud}</option>
                  <option value="unsafe_product">{copy.unsafe}</option>
                  <option value="payment_request">{copy.payment}</option>
                  <option value="other">{copy.other}</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">{copy.email}</span>
                <input
                  name="contactEmail"
                  type="email"
                  placeholder={copy.emailPlaceholder}
                  className="h-12 rounded-[12px] border border-[#d9e1ec] px-3 text-sm"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">{copy.details}</span>
                <textarea
                  name="details"
                  minLength={10}
                  required
                  placeholder={copy.detailsPlaceholder}
                  className="min-h-32 rounded-[12px] border border-[#d9e1ec] p-3 text-sm"
                />
              </label>
              {message ? <p className="text-sm font-semibold text-[#475467]">{message}</p> : null}
              <button
                disabled={submitting}
                className="min-h-12 rounded-[12px] bg-[#0866ff] px-5 text-sm font-bold text-white transition hover:bg-[#075be5] disabled:bg-[#b8c7de]"
              >
                {copy.submit}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
