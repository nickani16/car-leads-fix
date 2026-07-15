'use client'

import { useState } from 'react'

export default function NewsletterTestButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function send() {
    const recipient = window.prompt('Testmottagare (måste vara en aktiv prenumerant):')?.trim()
    if (!recipient) return
    setBusy(true); setMessage('')
    const response = await fetch(`/api/admin/newsletters/${id}/test`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipient }) })
    const result = (await response.json().catch(() => ({}))) as { error?: string }
    setBusy(false)
    setMessage(response.ok ? 'Testmejl skickat.' : result.error || 'Testmejlet kunde inte skickas.')
  }
  return <div className="mt-2"><button type="button" disabled={busy} onClick={() => void send()} className="rounded-[10px] border border-[#0866ff] px-3 py-2 text-xs font-bold text-[#0866ff] disabled:opacity-50">{busy ? 'Skickar…' : 'Skicka testmejl'}</button>{message ? <span className="ml-2 text-xs text-[#667085]">{message}</span> : null}</div>
}
