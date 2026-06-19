'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, LoaderCircle, X } from 'lucide-react'

export default function SellerDecisionButtons({ dealId }: { dealId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accepted' | 'declined' | null>(null)
  const [error, setError] = useState('')

  async function decide(decision: 'accepted' | 'declined') {
    if (
      decision === 'declined' &&
      !window.confirm('Decline this winning offer and cancel the transaction?')
    ) {
      return
    }

    setLoading(decision)
    setError('')
    const response = await fetch(`/api/dealer/sales/${dealId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }

    if (!response.ok) {
      setError(result.error || 'The decision could not be saved.')
      setLoading(null)
      return
    }

    router.refresh()
  }

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => decide('accepted')}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#176b39] px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading === 'accepted' ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Accept offer
        </button>
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => decide('declined')}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 text-sm font-semibold text-red-700 disabled:opacity-50"
        >
          {loading === 'declined' ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <X size={16} />
          )}
          Decline
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  )
}
