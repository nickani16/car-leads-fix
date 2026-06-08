'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SellerDecisionActions({ dealId }: { dealId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<'accepted' | 'declined' | null>(
    null
  )
  const [message, setMessage] = useState('')
  const [notes, setNotes] = useState('')

  async function submitDecision(decision: 'accepted' | 'declined') {
    setMessage('')
    setIsLoading(decision)

    const response = await fetch(`/api/deals/${dealId}/seller-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, notes }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }

    if (!response.ok) {
      setMessage(result.error || 'The seller decision could not be recorded.')
      setIsLoading(null)
      return
    }

    setMessage(
      decision === 'accepted'
        ? 'Seller accepted. The contract flow is ready to start.'
        : 'Seller declined. The dealer will be notified and the deal is cancelled.'
    )
    setIsLoading(null)
    router.refresh()
  }

  return (
    <div className="mt-5 rounded-[16px] border border-[#deddd7] bg-[#fbfaf7] p-4">
      <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#73797c]">
        Decision note
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional internal note, for example seller wanted a higher price."
          className="mt-2 min-h-20 w-full rounded-[12px] border border-[#d8d7d1] bg-white p-3 text-sm normal-case tracking-normal text-[#242424] outline-none focus:border-[#8dbdd8]"
        />
      </label>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={Boolean(isLoading)}
          onClick={() => submitDecision('accepted')}
          className="rounded-full bg-emerald-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
        >
          {isLoading === 'accepted' ? 'Saving...' : 'Seller accepted'}
        </button>
        <button
          type="button"
          disabled={Boolean(isLoading)}
          onClick={() => submitDecision('declined')}
          className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:border-red-300 disabled:opacity-60"
        >
          {isLoading === 'declined' ? 'Cancelling...' : 'Seller declined'}
        </button>
      </div>
      {message && <p className="mt-3 text-xs text-[#62686c]">{message}</p>}
    </div>
  )
}
