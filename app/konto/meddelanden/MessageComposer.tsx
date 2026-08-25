'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { type PublicLocale } from '@/lib/public-i18n'

const composerCopy: Record<
  PublicLocale,
  {
    placeholder: string
    send: string
    sending: string
    sent: string
    error: string
  }
> = {
  sv: {
    placeholder: 'Skriv ett meddelande…',
    send: 'Skicka',
    sending: 'Skickar...',
    sent: 'Meddelandet är skickat.',
    error: 'Meddelandet kunde inte skickas. Försök igen.',
  },
  de: {
    placeholder: 'Nachricht schreiben…',
    send: 'Senden',
    sending: 'Wird gesendet...',
    sent: 'Nachricht gesendet.',
    error: 'Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
  },
  en: {
    placeholder: 'Write a message…',
    send: 'Send',
    sending: 'Sending...',
    sent: 'Message sent.',
    error: 'Could not send the message. Try again.',
  },
  at: {
    placeholder: 'Nachricht schreiben…',
    send: 'Senden',
    sending: 'Wird gesendet...',
    sent: 'Nachricht gesendet.',
    error: 'Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
  },
  be: {
    placeholder: 'Schrijf een bericht…',
    send: 'Versturen',
    sending: 'Wordt verstuurd...',
    sent: 'Bericht verzonden.',
    error: 'Het bericht kon niet worden verzonden. Probeer opnieuw.',
  },
  fr: {
    placeholder: 'Écrire un message…',
    send: 'Envoyer',
    sending: 'Envoi...',
    sent: 'Message envoyé.',
    error: "Le message n'a pas pu être envoyé. Réessayez.",
  },
  es: {
    placeholder: 'Escribe un mensaje…',
    send: 'Enviar',
    sending: 'Enviando...',
    sent: 'Mensaje enviado.',
    error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
  },
  it: {
    placeholder: 'Scrivi un messaggio…',
    send: 'Invia',
    sending: 'Invio...',
    sent: 'Messaggio inviato.',
    error: 'Impossibile inviare il messaggio. Riprova.',
  },
  pl: {
    placeholder: 'Napisz wiadomość…',
    send: 'Wyślij',
    sending: 'Wysyłanie...',
    sent: 'Wiadomość wysłana.',
    error: 'Nie udało się wysłać wiadomości. Spróbuj ponownie.',
  },
  nl: {
    placeholder: 'Schrijf een bericht…',
    send: 'Versturen',
    sending: 'Wordt verstuurd...',
    sent: 'Bericht verzonden.',
    error: 'Het bericht kon niet worden verzonden. Probeer opnieuw.',
  },
  fi: {
    placeholder: 'Kirjoita viesti…',
    send: 'Lähetä',
    sending: 'Lähetetään...',
    sent: 'Viesti lähetetty.',
    error: 'Viestiä ei voitu lähettää. Yritä uudelleen.',
  },
  da: {
    placeholder: 'Skriv en besked…',
    send: 'Send',
    sending: 'Sender...',
    sent: 'Beskeden er sendt.',
    error: 'Beskeden kunne ikke sendes. Prøv igen.',
  },
}

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
  const text = composerCopy[locale] || composerCopy.en

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
    <form onSubmit={submit} className="flex min-w-0 flex-col gap-2 border-t border-[#e4e7ec] bg-white p-4 sm:p-5">
      <div className="flex min-w-0 gap-2">
        <input
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            if (status !== 'idle') setStatus('idle')
          }}
          placeholder={text.placeholder}
          maxLength={3000}
          className="h-12 min-w-0 flex-1 rounded-[14px] border border-[#d0d5dd] px-4 text-base outline-none transition focus:border-[#667085] focus:ring-4 focus:ring-black/5"
        />
        <button
          disabled={!message.trim() || sending}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-[#202124] px-0 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-5"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">{text.send}</span>
        </button>
      </div>
      <p
        aria-live="polite"
        className={`min-h-5 text-xs font-medium ${
          status === 'error' ? 'text-[#b42318]' : 'text-[#667085]'
        }`}
      >
        {sending ? text.sending : status === 'sent' ? text.sent : status === 'error' ? text.error : ''}
      </p>
    </form>
  )
}
