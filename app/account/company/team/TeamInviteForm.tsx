'use client'

import { FormEvent, useState } from 'react'
import { Send } from 'lucide-react'

type TeamInviteFormProps = {
  copy: {
    emailPlaceholder: string
    role: string
    sendInvite: string
    sending: string
    sent: string
  }
}

export default function TeamInviteForm({ copy }: TeamInviteFormProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('sales')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const response = await fetch('/api/account/company/team/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(result.error || 'Invitation could not be sent.')
        return
      }
      setEmail('')
      setRole('sales')
      setMessage(copy.sent)
    } catch {
      setError('Invitation could not be sent.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
      <input
        required
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={copy.emailPlaceholder}
        className="min-h-11 rounded-[10px] border border-[#d7e1ee] bg-white px-3 text-sm text-[#101828] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
      />
      <select
        value={role}
        onChange={(event) => setRole(event.target.value)}
        aria-label={copy.role}
        className="min-h-11 rounded-[10px] border border-[#d7e1ee] bg-white px-3 text-sm font-semibold text-[#344054] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
      >
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
        <option value="sales">Sales</option>
        <option value="staff">Staff</option>
        <option value="viewer">Viewer</option>
      </select>
      <button
        disabled={loading}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#0866ff] px-4 text-sm font-bold text-white transition hover:bg-[#0758db] disabled:cursor-wait disabled:bg-[#9bbcff]"
      >
        <Send className="h-4 w-4" />
        {loading ? copy.sending : copy.sendInvite}
      </button>
      {message ? <p className="text-sm font-semibold text-[#0866ff] sm:col-span-3">{message}</p> : null}
      {error ? <p className="text-sm font-semibold text-[#b42318] sm:col-span-3">{error}</p> : null}
    </form>
  )
}
