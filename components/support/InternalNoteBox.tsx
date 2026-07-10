'use client'

import { useState } from 'react'

export default function InternalNoteBox({
  ticketId,
  onDone,
}: {
  ticketId: string
  onDone: () => void
}) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!message.trim()) return
    setBusy(true)
    await fetch(`/api/admin/support/tickets/${ticketId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, is_internal: true }),
    })
    setMessage('')
    setBusy(false)
    onDone()
  }

  return (
    <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-3">
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Intern kommentar"
        className="h-24 w-full resize-none rounded-[8px] border border-amber-200 bg-white p-3 text-sm outline-none"
      />
      <button
        type="button"
        disabled={busy || !message.trim()}
        onClick={() => void submit()}
        className="mt-2 h-10 rounded-[8px] bg-[#101828] px-4 text-sm font-bold text-white disabled:bg-[#98a2b3]"
      >
        Intern kommentar
      </button>
    </div>
  )
}
