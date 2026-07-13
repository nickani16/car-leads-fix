'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StaffInvitationForm() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(formData: FormData) {
    setBusy(true)
    setMessage('')
    const response = await fetch('/api/admin/staff', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string }
    setBusy(false)
    setMessage(response.ok ? 'Inbjudan skapad. Användaren slutför inloggningen med e-postkod.' : result.error || 'Inbjudan kunde inte skapas.')
    if (response.ok) router.refresh()
  }

  return (
    <form action={submit} className="mb-6 grid gap-3 rounded-2xl border border-[#dce3ee] bg-white p-5 shadow-sm md:grid-cols-4">
      <div className="md:col-span-4">
        <h2 className="font-bold text-[#101828]">Bjud in administratör</h2>
        <p className="mt-1 text-xs text-[#667085]">Ingen lösenordshantering. Rollen aktiveras först när mottagaren verifierar sin e-postkod.</p>
      </div>
      <input name="displayName" required minLength={2} placeholder="Namn" className="h-11 rounded-xl border border-[#d7deea] px-3 text-sm" />
      <input name="email" type="email" required placeholder="E-post" className="h-11 rounded-xl border border-[#d7deea] px-3 text-sm" />
      <select name="role" defaultValue="support_admin" className="h-11 rounded-xl border border-[#d7deea] bg-white px-3 text-sm">
        <option value="support_admin">Support Admin</option><option value="operations_admin">Operations Admin</option>
        <option value="moderator">Moderator</option><option value="finance_admin">Finance Admin</option>
        <option value="content_editor">Content Editor</option><option value="analyst">Analyst</option>
      </select>
      <button disabled={busy} className="h-11 rounded-xl bg-[#0866ff] px-4 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Skapar…' : 'Skicka inbjudan'}</button>
      {message ? <p role="status" className="text-sm text-[#475467] md:col-span-4">{message}</p> : null}
    </form>
  )
}
