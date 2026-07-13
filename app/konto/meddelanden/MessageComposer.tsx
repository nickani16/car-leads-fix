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
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
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
  const sendingLabel =
    locale === 'sv'
      ? 'Skickar...'
      : locale === 'de'
        ? 'Wird gesendet...'
        : locale === 'en'
          ? 'Sending...'
          : translatePublic(locale, 'Sending...')
  const sentLabel =
    locale === 'sv'
      ? 'Meddelandet Ã¤r skickat.'
      : locale === 'de'
        ? 'Nachricht gesendet.'
        : locale === 'en'
          ? 'Message sent.'
          : translatePublic(locale, 'Message sent.')
  const errorLabel =
    locale === 'sv'
      ? 'Meddelandet kunde inte skickas. FÃ¶rsÃ¶k igen.'
      : locale === 'de'
        ? 'Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.'
        : locale === 'en'
          ? 'Could not send the message. Try again.'
          : translatePublic(locale, 'Could not send the message. Try again.')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!message.trim() || sending) return
    setSending(true)
    setStatus('idle')
    const response = await fetch('/api/account/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message }),
    })
    if (response.ok) {
      setMessage('')
      setStatus('sent')
      router.refresh()
    } else {
      setStatus('error')
    }
    setSending(false)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 border-t border-[#e4e7ec] bg-white p-4 sm:p-5">
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            if (status !== 'idle') setStatus('idle')
          }}
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
      </div>
      <p
        aria-live="polite"
        className={`min-h-5 text-xs font-medium ${
          status === 'error' ? 'text-[#b42318]' : 'text-[#667085]'
        }`}
      >
        {sending ? sendingLabel : status === 'sent' ? sentLabel : status === 'error' ? errorLabel : ''}
      </p>
    </form>
  )
}
