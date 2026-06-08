'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DealerStatusActions({
  dealerId,
  currentStatus,
}: {
  dealerId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function updateStatus(status: 'approved' | 'pending' | 'rejected') {
    setLoading(true)
    setMessage('')

    const response = await fetch(`/api/admin/dealers/${dealerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const result = (await response.json()) as { error?: string }

    if (!response.ok) {
      setMessage(result.error || 'The dealer status could not be updated.')
    } else {
      setMessage(`Dealer status changed to ${status}.`)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {currentStatus !== 'approved' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => updateStatus('approved')}
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm text-white disabled:opacity-50"
          >
            Approve dealer
          </button>
        )}
        {currentStatus !== 'pending' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => updateStatus('pending')}
            className="rounded-full border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm text-amber-900 disabled:opacity-50"
          >
            Return to review
          </button>
        )}
        {currentStatus !== 'rejected' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => updateStatus('rejected')}
            className="rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm text-red-700 disabled:opacity-50"
          >
            Reject / suspend
          </button>
        )}
      </div>
      {message && <p className="mt-3 text-sm text-[#62686c]">{message}</p>}
    </div>
  )
}

