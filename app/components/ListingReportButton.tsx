'use client'

import { AlertTriangle, X } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

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

  const modal =
    open && typeof document !== 'undefined'
      ? createPortal(
        <div
          className="fixed inset-0 isolate z-[2147483647] flex items-center justify-center overflow-hidden bg-[#101828]/35 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-[2px] sm:px-6 sm:py-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <div className="relative flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.5rem)] min-h-0 w-full max-w-[620px] flex-col overflow-hidden rounded-[18px] border border-[#dfe6f2] bg-white shadow-[0_24px_70px_rgba(16,24,40,.22)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[22px]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#edf1f6] bg-white px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h2 className="text-xl font-black tracking-[-0.035em]">{copy.title}</h2>
                <p className="mt-1 text-sm text-[#667085]">{copy.intro}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={copy.close}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d9e1ec] bg-white text-[#475467] transition hover:bg-[#f2f5f9] sm:h-10 sm:w-10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submit} className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-5">
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
        </div>,
        document.body,
      )
      : null

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

      {modal}
    </>
  )
}
