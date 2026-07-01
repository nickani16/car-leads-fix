'use client'

import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type ListingBuyerOption = {
  userId: string
  name: string
}

export default function ListingStatusActions({
  listingId,
  status,
  buyers,
  copy,
}: {
  listingId: string
  status: string
  buyers: ListingBuyerOption[]
  copy: {
    markSold: string
    sold: string
    chooseBuyer: string
    saving: string
  }
}) {
  const router = useRouter()
  const [buyerUserId, setBuyerUserId] = useState(buyers[0]?.userId || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function markSold() {
    setLoading(true)
    setMessage('')
    const response = await fetch(`/api/account/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'mark_sold',
        buyerUserId: buyerUserId || null,
      }),
    })
    const result = (await response.json()) as { error?: string }
    setLoading(false)
    if (!response.ok) {
      setMessage(result.error || 'Could not update listing.')
      return
    }
    router.refresh()
  }

  if (status === 'sold') {
    return (
      <span className="inline-flex items-center gap-2 rounded-[12px] bg-[#eefbf4] px-3 py-2 text-xs font-bold text-[#067647]">
        <CheckCircle2 className="h-4 w-4" />
        {copy.sold}
      </span>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {buyers.length ? (
        <select
          value={buyerUserId}
          onChange={(event) => setBuyerUserId(event.target.value)}
          className="h-10 rounded-[12px] border border-[#d7deed] bg-white px-3 text-xs font-semibold"
        >
          <option value="">{copy.chooseBuyer}</option>
          {buyers.map((buyer) => (
            <option key={buyer.userId} value={buyer.userId}>
              {buyer.name}
            </option>
          ))}
        </select>
      ) : null}
      <button
        type="button"
        onClick={markSold}
        disabled={loading}
        className="inline-flex min-h-10 items-center justify-center rounded-[12px] border border-[#d7deed] bg-white px-3 text-xs font-bold text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff] disabled:opacity-60"
      >
        {loading ? copy.saving : copy.markSold}
      </button>
      {message ? <span className="text-xs text-[#b42318]">{message}</span> : null}
    </div>
  )
}
