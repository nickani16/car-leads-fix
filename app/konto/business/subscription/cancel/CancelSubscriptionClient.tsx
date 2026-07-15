'use client'

import { useState } from 'react'
import Link from 'next/link'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

const baseCopy = {
  reasonLabel: 'Reason for cancellation',
  reasonPlaceholder: 'Optional: tell us why you are cancelling',
  confirmLabel: 'I understand that the plan remains active until the end of the paid period and that issued invoices must be paid.',
  cancelButton: 'Schedule cancellation',
  cancelling: 'Scheduling...',
  back: 'Back to plan',
  successTitle: 'Cancellation scheduled',
  successText: 'Your plan will end at the current period end. We have saved the request and sent a confirmation email.',
  error: 'Could not schedule the cancellation.',
}

export default function CancelSubscriptionClient({
  locale,
}: {
  locale: PublicLocale
}) {
  const copy = translatePublicObject(locale, baseCopy)
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit() {
    if (!confirmed) return
    setLoading(true)
    setError('')
    const response = await fetch('/api/account/business/subscription/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    const result = await response.json().catch(() => ({}))
    if (response.ok && result.success) {
      setSuccess(true)
      setLoading(false)
      return
    }
    setError(result.error || copy.error)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="rounded-[16px] border border-[#b8cff8] bg-[#eef5ff] p-5 text-[#18478f]">
        <h2 className="text-xl font-semibold tracking-[-.03em]">{copy.successTitle}</h2>
        <p className="mt-2 text-sm leading-6">{copy.successText}</p>
        <Link href={localizePublicHref(locale, '/account/business/subscription')} className="mt-5 inline-flex min-h-11 items-center rounded-[10px] bg-[#0866ff] px-4 text-sm font-bold text-white">
          {copy.back}
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.055)]">
      <label className="block text-sm font-bold text-[#344054]" htmlFor="cancellation-reason">
        {copy.reasonLabel}
      </label>
      <textarea
        id="cancellation-reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        maxLength={1200}
        rows={5}
        placeholder={copy.reasonPlaceholder}
        className="mt-2 w-full rounded-[12px] border border-[#d7e1ee] px-3 py-3 text-sm text-[#101828] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
      />
      <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-[#475467]">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[#b8c4d6] text-[#0866ff]"
        />
        <span>{copy.confirmLabel}</span>
      </label>
      {error ? <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!confirmed || loading}
          className="inline-flex min-h-11 items-center rounded-[10px] bg-[#101828] px-4 text-sm font-bold text-white transition hover:bg-[#0866ff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? copy.cancelling : copy.cancelButton}
        </button>
        <Link href={localizePublicHref(locale, '/account/business/subscription')} className="inline-flex min-h-11 items-center rounded-[10px] border border-[#d0d8e6] bg-white px-4 text-sm font-bold text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff]">
          {copy.back}
        </Link>
      </div>
    </div>
  )
}
