'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

export default function MessageSellerButton({ listingId, enabled }: { listingId: string; enabled: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  async function startConversation() {
    if (!enabled) return
    setLoading(true); setError('')
    const response = await fetch('/api/account/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId }),
    })
    const result = (await response.json()) as { id?: string; error?: string }
    if (response.status === 401) {
      window.location.assign(`/login?next=${encodeURIComponent('/konto/meddelanden')}`)
      return
    }
    if (result.id) {
      window.location.assign(`/konto/meddelanden?conversation=${result.id}`)
      return
    }
    setError(result.error || 'Kunde inte öppna konversationen.')
    setLoading(false)
  }
  return <div><button type="button" disabled={!enabled || loading} onClick={startConversation} className="inline-flex items-center gap-2 text-sm font-bold text-[#0866ff] disabled:text-[#98a2b3]"><MessageCircle className="h-4 w-4" />{enabled ? (loading ? 'Öppnar…' : 'Skriv till säljaren') : 'Kontakt via Autorell'}</button>{error && <p className="mt-2 text-xs text-red-700">{error}</p>}</div>
}
