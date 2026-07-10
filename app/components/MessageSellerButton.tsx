'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import type { PublicLocale } from '@/lib/public-i18n'

export default function MessageSellerButton({
  listingId,
  enabled,
  locale = 'sv',
  variant = 'link',
}: {
  listingId: string
  enabled: boolean
  locale?: PublicLocale
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

  function getLabel(value: string) {
    if (locale === 'sv') {
      if (value === 'Opening...') return 'Öppnar...'
      if (value === 'Write to the seller') return 'Skriv till säljaren'
      if (value === 'Contact through Autorell') return 'Kontakt via Autorell'
      if (value === 'Could not open the conversation.') return 'Kunde inte öppna konversationen.'
    }
    if (locale === 'de' || locale === 'at') {
      if (value === 'Opening...') return 'Wird geöffnet...'
      if (value === 'Write to the seller') return 'Verkäufer anschreiben'
      if (value === 'Contact through Autorell') return 'Kontakt über Autorell'
      if (value === 'Could not open the conversation.') return 'Konversation konnte nicht geöffnet werden.'
    }
    const translations: Record<string, Record<string, string>> = {
      es: {
        'Opening...': 'Abriendo...',
        'Write to the seller': 'Escribir al vendedor',
        'Contact through Autorell': 'Contacto a través de Autorell',
        'Could not open the conversation.': 'No se pudo abrir la conversación.',
      },
      fr: {
        'Opening...': 'Ouverture...',
        'Write to the seller': 'Écrire au vendeur',
        'Contact through Autorell': 'Contact via Autorell',
        'Could not open the conversation.': "Impossible d'ouvrir la conversation.",
      },
      it: {
        'Opening...': 'Apertura...',
        'Write to the seller': 'Scrivi al venditore',
        'Contact through Autorell': 'Contatto tramite Autorell',
        'Could not open the conversation.': 'Impossibile aprire la conversazione.',
      },
      nl: {
        'Opening...': 'Openen...',
        'Write to the seller': 'Schrijf de verkoper',
        'Contact through Autorell': 'Contact via Autorell',
        'Could not open the conversation.': 'Kon het gesprek niet openen.',
      },
      be: {
        'Opening...': 'Openen...',
        'Write to the seller': 'Schrijf de verkoper',
        'Contact through Autorell': 'Contact via Autorell',
        'Could not open the conversation.': 'Kon het gesprek niet openen.',
      },
      pl: {
        'Opening...': 'Otwieranie...',
        'Write to the seller': 'Napisz do sprzedającego',
        'Contact through Autorell': 'Kontakt przez Autorell',
        'Could not open the conversation.': 'Nie można otworzyć rozmowy.',
      },
      da: {
        'Opening...': 'Åbner...',
        'Write to the seller': 'Skriv til sælgeren',
        'Contact through Autorell': 'Kontakt via Autorell',
        'Could not open the conversation.': 'Kunne ikke åbne samtalen.',
      },
      fi: {
        'Opening...': 'Avataan...',
        'Write to the seller': 'Kirjoita myyjälle',
        'Contact through Autorell': 'Yhteys Autorellin kautta',
        'Could not open the conversation.': 'Keskustelua ei voitu avata.',
      },
    }
    return translations[locale]?.[value] || value
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
    setError(result.error || getLabel('Could not open the conversation.'))
    setLoading(false)
  }

  const buttonClass =
    variant === 'button'
      ? 'inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(8,102,255,.22)] transition hover:bg-[#0057e6] disabled:cursor-not-allowed disabled:bg-[#c7d7f5]'
      : 'inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#0866ff] disabled:cursor-not-allowed disabled:text-[#98a2b3]'

  return (
    <div>
      <button type="button" disabled={!enabled || loading} onClick={startConversation} className={buttonClass}>
        <MessageCircle className="h-4 w-4" />
        {enabled ? (loading ? getLabel('Opening...') : getLabel('Write to the seller')) : getLabel('Contact through Autorell')}
      </button>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  )
}
