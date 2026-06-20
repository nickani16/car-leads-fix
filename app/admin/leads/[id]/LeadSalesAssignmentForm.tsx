'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type SalesUser = {
  user_id: string
  display_name: string
}

export default function LeadSalesAssignmentForm({
  leadId,
  salesUsers,
  initialSalesUserId,
}: {
  leadId: string
  salesUsers: SalesUser[]
  initialSalesUserId: string | null
}) {
  const router = useRouter()
  const [assignedSalesUserId, setAssignedSalesUserId] = useState(
    initialSalesUserId || ''
  )
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    const response = await fetch(`/api/admin/leads/${leadId}/sales-assignment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignedSalesUserId: assignedSalesUserId || null,
      }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    setBusy(false)

    if (!response.ok) {
      window.alert(result.error || 'The salesperson could not be assigned.')
      return
    }

    router.refresh()
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <select
        value={assignedSalesUserId}
        onChange={(event) => setAssignedSalesUserId(event.target.value)}
        aria-label="Responsible salesperson"
        className="min-h-11 rounded-[12px] border border-[#d8d7d1] bg-white px-3 text-sm"
      >
        <option value="">Select salesperson</option>
        {salesUsers.map((user) => (
          <option key={user.user_id} value={user.user_id}>
            {user.display_name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="min-h-11 rounded-full bg-[#315f74] px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? 'Saving...' : 'Assign'}
      </button>
    </div>
  )
}
