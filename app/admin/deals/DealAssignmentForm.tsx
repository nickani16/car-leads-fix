'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type SalesUser = {
  user_id: string
  display_name: string
}

export default function DealAssignmentForm({
  dealId,
  salesUsers,
  initialSalesUserId,
  initialDueAt,
}: {
  dealId: string
  salesUsers: SalesUser[]
  initialSalesUserId: string | null
  initialDueAt: string | null
}) {
  const router = useRouter()
  const [assignedSalesUserId, setAssignedSalesUserId] = useState(
    initialSalesUserId || ''
  )
  const [actionDueAt, setActionDueAt] = useState(
    initialDueAt ? new Date(initialDueAt).toISOString().slice(0, 16) : ''
  )
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    const response = await fetch(`/api/admin/deals/${dealId}/assignment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignedSalesUserId: assignedSalesUserId || null,
        actionDueAt: actionDueAt ? new Date(actionDueAt).toISOString() : null,
      }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    setBusy(false)
    if (!response.ok) {
      window.alert(result.error || 'The assignment could not be saved.')
      return
    }
    router.refresh()
  }

  return (
    <div className="mt-5 grid gap-2 rounded-[14px] bg-[#f4f7f7] p-4 sm:grid-cols-[1fr_1fr_auto]">
      <select
        value={assignedSalesUserId}
        onChange={(event) => setAssignedSalesUserId(event.target.value)}
        aria-label="Responsible salesperson"
        className="min-h-10 rounded-[10px] border border-[#d8d7d1] bg-white px-3 text-sm"
      >
        <option value="">Unassigned</option>
        {salesUsers.map((user) => (
          <option key={user.user_id} value={user.user_id}>
            {user.display_name}
          </option>
        ))}
      </select>
      <input
        type="datetime-local"
        value={actionDueAt}
        onChange={(event) => setActionDueAt(event.target.value)}
        aria-label="Action deadline"
        className="min-h-10 rounded-[10px] border border-[#d8d7d1] bg-white px-3 text-sm"
      />
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="min-h-10 rounded-full bg-[#315f74] px-4 text-sm font-semibold text-white"
      >
        {busy ? 'Saving...' : 'Assign'}
      </button>
    </div>
  )
}
