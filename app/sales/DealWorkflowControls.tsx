'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, UserRoundCheck } from 'lucide-react'

export default function DealWorkflowControls({
  dealId,
  assignedSalesUserId,
  actionDueAt,
  salesUsers,
}: {
  dealId: string
  assignedSalesUserId?: string | null
  actionDueAt?: string | null
  salesUsers: { user_id: string; display_name: string }[]
}) {
  const router = useRouter()
  const [assignee, setAssignee] = useState(assignedSalesUserId || '')
  const [deadline, setDeadline] = useState(
    actionDueAt ? new Date(actionDueAt).toISOString().slice(0, 16) : ''
  )
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function save() {
    setLoading(true)
    setMessage('')
    const response = await fetch(`/api/sales/deals/${dealId}/workflow`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignedSalesUserId: assignee || null,
        actionDueAt: deadline ? new Date(deadline).toISOString() : null,
      }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    setLoading(false)
    setMessage(response.ok ? 'Workflow updated.' : result.error || 'Could not update.')
    if (response.ok) router.refresh()
  }

  return (
    <div className="mt-4 rounded-[14px] border border-[#deddd7] bg-white p-4">
      <div className="grid gap-3">
        <label className="grid gap-1.5 text-xs font-medium text-[#596166]">
          <span className="flex items-center gap-2">
            <UserRoundCheck size={14} /> Responsible salesperson
          </span>
          <select
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
            className="h-11 rounded-[10px] border border-[#d8d7d1] bg-white px-3 text-sm"
          >
            <option value="">Unassigned</option>
            {salesUsers.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.display_name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-[#596166]">
          <span className="flex items-center gap-2">
            <CalendarClock size={14} /> Next-action deadline
          </span>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            className="h-11 rounded-[10px] border border-[#d8d7d1] bg-white px-3 text-sm"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="mt-3 h-10 w-full rounded-full bg-[#242424] px-4 text-sm text-white disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save responsibility and deadline'}
      </button>
      {message && <p className="mt-2 text-xs text-[#62686c]">{message}</p>}
    </div>
  )
}
