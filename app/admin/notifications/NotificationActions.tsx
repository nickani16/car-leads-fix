'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NotificationActions({ id, read, assigned }: { id: string; read: boolean; assigned: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  async function update(action: 'read' | 'assign') {
    setBusy(true)
    await fetch(`/api/admin/notifications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    setBusy(false)
    router.refresh()
  }
  return <div className="flex gap-2">
    {!read ? <button disabled={busy} onClick={() => void update('read')} className="rounded-lg border px-3 py-2 text-xs font-bold">Markera läst</button> : null}
    {!assigned ? <button disabled={busy} onClick={() => void update('assign')} className="rounded-lg bg-[#0866ff] px-3 py-2 text-xs font-bold text-white">Tilldela mig</button> : null}
  </div>
}
