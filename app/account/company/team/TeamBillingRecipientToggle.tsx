'use client'

import { useState } from 'react'
import { ReceiptText } from 'lucide-react'
import { localizedAccountError } from '@/lib/account-error-i18n'
import type { PublicLocale } from '@/lib/public-i18n'

type TeamBillingRecipientToggleProps = {
  userId: string
  enabled: boolean
  locale: PublicLocale
  copy: {
    billingRecipient: string
    billingRecipientOn: string
    billingRecipientOff: string
    billingRecipientError: string
  }
}

export default function TeamBillingRecipientToggle({
  userId,
  enabled,
  locale,
  copy,
}: TeamBillingRecipientToggleProps) {
  const [checked, setChecked] = useState(enabled)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function toggle() {
    const next = !checked
    setChecked(next)
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/account/company/team/billing-recipient', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, enabled: next }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setChecked(!next)
        setError(localizedAccountError(locale, result, copy.billingRecipientError))
      }
    } catch {
      setChecked(!next)
      setError(copy.billingRecipientError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        aria-pressed={checked}
        className={`inline-flex min-h-9 w-full items-center justify-between gap-3 rounded-full border px-3 text-xs font-semibold transition sm:w-auto ${
          checked
            ? 'border-[#b7d5ff] bg-[#eef5ff] text-[#0866ff]'
            : 'border-[#d9e2ef] bg-white text-[#475467] hover:border-[#b7d5ff] hover:text-[#0866ff]'
        } disabled:cursor-wait disabled:opacity-70`}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <ReceiptText className="h-4 w-4 shrink-0" />
          <span className="truncate">{copy.billingRecipient}</span>
        </span>
        <span>{checked ? copy.billingRecipientOn : copy.billingRecipientOff}</span>
      </button>
      {error ? <p className="mt-2 text-xs font-semibold text-[#b42318]">{error}</p> : null}
    </div>
  )
}
