'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'

export default function BidAdminControls({
  bidId,
  amount,
}: {
  bidId: string
  amount: number
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function run(method: 'PATCH' | 'DELETE') {
    const reason = window.prompt('Reason for this bid change:')
    if (!reason) return
    const nextAmount =
      method === 'PATCH'
        ? Number(window.prompt('New bid amount in EUR:', String(amount)))
        : undefined
    if (method === 'PATCH' && (!nextAmount || nextAmount <= 0)) return
    if (
      method === 'DELETE' &&
      !window.confirm('Permanently delete this bid? The action is logged.')
    ) {
      return
    }

    setBusy(true)
    const response = await fetch(`/api/admin/bids/${bidId}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, amount: nextAmount }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    setBusy(false)
    if (!response.ok) {
      window.alert(result.error || 'The bid could not be changed.')
      return
    }
    router.refresh()
  }

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        disabled={busy}
        onClick={() => run('PATCH')}
        className="grid h-8 w-8 place-items-center rounded-full border border-[#d8d7d1] bg-white hover:bg-[#f4f3ef]"
        title="Edit bid"
      >
        <Pencil size={13} />
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => run('DELETE')}
        className="grid h-8 w-8 place-items-center rounded-full border border-red-200 bg-white text-red-700 hover:bg-red-50"
        title="Delete bid"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
