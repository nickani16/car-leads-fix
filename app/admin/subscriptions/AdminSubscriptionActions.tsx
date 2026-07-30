'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSubscriptionActions({
  id,
  status,
  manuallyActivated,
}: {
  id: string
  status: string
  manuallyActivated: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')

  async function run(action: 'reactivate_unpaid' | 'restrict_unpaid') {
    const confirmed =
      action === 'restrict_unpaid'
        ? window.confirm('Spärra företagskontot för obetald faktura? Annonser, team, filialer och importer sparas.')
        : window.confirm('Öppna företagskontot igen? Kontot öppnas manuellt utan att radera något.')
    if (!confirmed) return

    setBusy(action)
    setMessage('')
    const response = await fetch('/api/admin/business/subscriptions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string }
    setBusy('')
    if (!response.ok) {
      setMessage(result.error || 'Åtgärden kunde inte genomföras.')
      return
    }
    router.refresh()
  }

  const isRestricted = ['unpaid', 'past_due', 'suspended'].includes(status)

  return (
    <div className="flex min-w-[150px] flex-col gap-2">
      {isRestricted || !manuallyActivated ? (
        <button
          type="button"
          disabled={busy !== ''}
          onClick={() => void run('reactivate_unpaid')}
          className="rounded-[10px] border border-[#b9cff7] bg-[#eef5ff] px-3 py-2 text-xs font-bold text-[#0866ff] transition hover:border-[#0866ff] disabled:opacity-50"
        >
          {busy === 'reactivate_unpaid' ? 'Öppnar...' : 'Öppna igen'}
        </button>
      ) : null}
      {!isRestricted ? (
        <button
          type="button"
          disabled={busy !== ''}
          onClick={() => void run('restrict_unpaid')}
          className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
        >
          {busy === 'restrict_unpaid' ? 'Spärrar...' : 'Spärra obetald'}
        </button>
      ) : null}
      {message ? <span className="text-xs font-semibold text-red-700">{message}</span> : null}
    </div>
  )
}
