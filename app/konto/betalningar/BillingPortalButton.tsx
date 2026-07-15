'use client'

import { useState } from 'react'

export default function BillingPortalButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function openPortal() {
    setLoading(true)
    setError('')
    const response = await fetch('/api/account/billing-portal', { method: 'POST' })
    const result = await response.json().catch(() => ({}))
    if (result.url) {
      window.location.assign(result.url)
      return
    }
    setError(result.error || 'Kunde inte öppna betalningsportalen.')
    setLoading(false)
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#101828] px-4 text-sm font-bold text-white transition hover:bg-[#0866ff] disabled:opacity-50"
      >
        {loading ? 'Öppnar...' : label}
      </button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  )
}
