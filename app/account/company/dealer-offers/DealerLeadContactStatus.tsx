'use client'

import { Check, LoaderCircle, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { DealerLeadContactTrackingCopy } from '@/lib/dealer-leads/i18n'
import type { PublicLocale } from '@/lib/public-i18n'

export type DealerLeadCompanyContact = {
  contactedByName: string
  method: string
  contactedAt: string
  hideAfter: string
}

export default function DealerLeadContactStatus({
  leadId,
  initialContact,
  copy,
  locale,
}: {
  leadId: string
  initialContact: DealerLeadCompanyContact | null
  copy: DealerLeadContactTrackingCopy
  locale: PublicLocale
}) {
  const router = useRouter()
  const [contact, setContact] = useState(initialContact)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function setContacted(contacted: boolean) {
    const previous = contact
    setBusy(true)
    setError('')
    if (!contacted) setContact(null)

    try {
      const response = await fetch(`/api/account/company/dealer-leads/${leadId}/contact`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacted, method: 'other' }),
      })
      const payload = await response.json().catch(() => null) as {
        contact?: DealerLeadCompanyContact | null
      } | null
      if (!response.ok) throw new Error('SAVE_FAILED')
      setContact(payload?.contact || null)
      router.refresh()
    } catch {
      setContact(previous)
      setError(copy.error)
    } finally {
      setBusy(false)
    }
  }

  const checked = Boolean(contact)

  return (
    <section className={`mt-4 rounded-[14px] border px-4 py-3.5 ${checked ? 'border-[#9dd7b0] bg-[#f0fbf4]' : 'border-[#d9e2ef] bg-[#f8fbff]'}`}>
      <label className="flex cursor-pointer items-start gap-3">
        <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-[7px] border transition ${checked ? 'border-[#079455] bg-[#079455] text-white' : 'border-[#98a2b3] bg-white text-transparent'}`}>
          {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#0866ff]" /> : <Check className="h-4 w-4" strokeWidth={3} />}
          <input
            type="checkbox"
            checked={checked}
            disabled={busy}
            onChange={(event) => void setContacted(event.target.checked)}
            className="sr-only"
          />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-[#101828]">{copy.label}</span>
          <span className="mt-0.5 block text-xs leading-5 text-[#667085]">{copy.help}</span>
        </span>
      </label>

      {contact ? (
        <div className="mt-3 flex flex-col gap-1 border-t border-[#ccebd7] pt-3 text-xs leading-5 text-[#344054] sm:flex-row sm:flex-wrap sm:gap-x-5">
          <span className="inline-flex items-center gap-1.5 font-semibold"><Users className="h-3.5 w-3.5 text-[#079455]" />{copy.markedBy} {contact.contactedByName}</span>
          <span>{formatDateTime(contact.contactedAt, locale)}</span>
          <span>{copy.visibleUntil} {formatDateTime(contact.hideAfter, locale)}</span>
        </div>
      ) : null}

      <p aria-live="polite" className={`mt-2 text-xs font-semibold ${error ? 'text-[#b42318]' : 'text-[#667085]'}`}>
        {error || (busy ? copy.saving : '')}
      </p>
    </section>
  )
}

function formatDateTime(value: string, locale: PublicLocale) {
  return new Intl.DateTimeFormat(localeTag(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function localeTag(locale: PublicLocale) {
  if (locale === 'sv') return 'sv-SE'
  if (locale === 'da') return 'da-DK'
  if (locale === 'fi') return 'fi-FI'
  if (locale === 'at') return 'de-AT'
  if (locale === 'be') return 'nl-BE'
  return locale
}
