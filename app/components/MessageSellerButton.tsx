'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

export default function MessageSellerButton({
  listingId,
  enabled,
  variant = 'link',
}: {
  listingId: string
  enabled: boolean
  variant?: 'link' | 'button'
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function accountMessagesHref(conversationId?: string) {
    const firstSegment = window.location.pathname.split('/').filter(Boolean)[0]
    const prefix =
      firstSegment && /^[a-z]{2}$/.test(firstSegment) && firstSegment !== 'en' && firstSegment !== 'eu'
        ? `/${firstSegment}`
        : ''
    return `${prefix}/account/messages${conversationId ? `?conversation=${conversationId}` : ''}`
  }

  async function startConversation() {
    if (!enabled) return
    setLoading(true)
    setError('')
    const response = await fetch('/api/account/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId }),
    })
    const result = (await response.json()) as { id?: string; error?: string }
    if (response.status === 401) {
      window.dispatchEvent(
        new CustomEvent('autorell:open-auth', {
          detail: { mode: 'login', destination: accountMessagesHref() },
        }),
      )
      setLoading(false)
      return
    }
    if (result.id) {
      window.location.assign(accountMessagesHref(result.id))
      return
    }
    setError(result.error || 'Kunde inte öppna konversationen.')
    setLoading(false)
  }

  const buttonClass =
    variant === 'button'
      ? 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(8,102,255,.22)] transition hover:bg-[#0057e6] disabled:bg-[#c7d7f5]'
      : 'inline-flex items-center gap-2 text-sm font-bold text-[#0866ff] disabled:text-[#98a2b3]'

  return (
    <div>
      <button type="button" disabled={!enabled || loading} onClick={startConversation} className={buttonClass}>
        <MessageCircle className="h-4 w-4" />
        {enabled ? (loading ? 'Öppnar...' : 'Skriv till säljaren') : 'Kontakt via Autorell'}
      </button>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  )
}
