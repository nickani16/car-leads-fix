'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { translatePublic, type PublicLocale } from '@/lib/public-i18n'

export default function MessageComposer({
  conversationId,
  locale,
}: {
  conversationId: string
  locale: PublicLocale
}) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const placeholder =
    locale === 'sv'
      ? 'Skriv ett meddelande…'
      : locale === 'de'
        ? 'Nachricht schreiben…'
        : locale === 'en'
          ? 'Write a message…'
          : translatePublic(locale, 'Write a message…')
  const sendLabel =
    locale === 'sv'
      ? 'Skicka'
      : locale === 'de'
        ? 'Senden'
        : locale === 'en'
          ? 'Send'
          : translatePublic(locale, 'Send message')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!message.trim() || sending) return
    setSending(true)
    const response = await fetch('/api/account/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message }),
    })
    if (response.ok) {
      setMessage('')
      router.refresh()
    }
    setSending(false)
  }

  return (
    <form onSubmit={submit} className="flex gap-2 border-t border-[#e4e7ec] bg-white p-4 sm:p-5">
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={placeholder}
        maxLength={3000}
        className="h-12 min-w-0 flex-1 rounded-[14px] border border-[#d0d5dd] px-4 text-base outline-none transition focus:border-[#667085] focus:ring-4 focus:ring-black/5"
      />
      <button
        disabled={!message.trim() || sending}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#202124] px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">{sendLabel}</span>
      </button>
    </form>
  )
}
