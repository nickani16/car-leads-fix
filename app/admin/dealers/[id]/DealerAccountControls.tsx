'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DealerAccountControls({ dealerId }: { dealerId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function deleteAccount() {
    const reason = window.prompt('Reason for permanently deleting this account:')
    if (!reason || !window.confirm('Delete the dealer login permanently?')) return
    setBusy(true)
    const response = await fetch(`/api/admin/dealers/${dealerId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    setBusy(false)
    if (!response.ok) {
      window.alert(result.error || 'The account could not be deleted.')
      return
    }
    router.replace('/admin/dealers')
    router.refresh()
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={deleteAccount}
      className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
    >
      <Trash2 size={15} />
      {busy ? 'Deleting...' : 'Delete dealer account'}
    </button>
  )
}
