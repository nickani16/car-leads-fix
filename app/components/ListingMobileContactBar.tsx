'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Phone } from 'lucide-react'
import { translatePublic, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import ListingContactFormButton from './ListingContactFormButton'

type ListingMobileContactBarProps = {
  listingId: string
  listingTitle: string
  locale: PublicLocale
  defaultCurrency?: string
}

const phoneCopy = {
  sv: {
    call: 'Ring',
    signIn: 'Logga in',
    unavailable: 'Saknas',
  },
  en: {
    call: 'Call',
    signIn: 'Sign in',
    unavailable: 'Unavailable',
  },
  de: {
    call: 'Anrufen',
    signIn: 'Anmelden',
    unavailable: 'Fehlt',
  },
} as const

const emailCopy = {
  sv: 'E-post',
  en: 'Email',
  de: 'E-Mail',
} as const

const messageCopy = {
  sv: 'Meddelande',
  en: 'Text',
  de: 'Nachricht',
} as const

export default function ListingMobileContactBar({
  listingId,
  listingTitle,
  locale,
  defaultCurrency = 'EUR',
}: ListingMobileContactBarProps) {
  const [phone, setPhone] = useState('')
  const [loadingPhone, setLoadingPhone] = useState(false)
  const [phoneError, setPhoneError] = useState<'login' | 'unavailable' | ''>('')
  const [messageLoading, setMessageLoading] = useState(false)

  const phoneText =
    locale === 'sv'
      ? phoneCopy.sv
      : locale === 'de' || locale === 'at'
        ? phoneCopy.de
        : locale === 'en'
          ? phoneCopy.en
          : translatePublicObject(locale, phoneCopy.en)

  const emailLabel =
    locale === 'sv'
      ? emailCopy.sv
      : locale === 'de' || locale === 'at'
        ? emailCopy.de
        : locale === 'en'
          ? emailCopy.en
          : translatePublic(locale, emailCopy.en)

  const messageLabel =
    locale === 'sv'
      ? messageCopy.sv
      : locale === 'de' || locale === 'at'
        ? messageCopy.de
        : locale === 'en'
          ? messageCopy.en
          : translatePublic(locale, messageCopy.en)

  useEffect(() => {
    document.documentElement.classList.add('autorell-listing-mobile-contact-active')
    return () => document.documentElement.classList.remove('autorell-listing-mobile-contact-active')
  }, [])

  function accountMessagesHref(conversationId?: string) {
    const firstSegment = window.location.pathname.split('/').filter(Boolean)[0]
    const prefix =
      firstSegment && /^[a-z]{2}$/.test(firstSegment) && firstSegment !== 'en' && firstSegment !== 'eu'
        ? `/${firstSegment}`
        : ''
    return `${prefix}/account/messages${conversationId ? `?conversation=${conversationId}` : ''}`
  }

  function openAuth(destination?: string) {
    window.dispatchEvent(
      new CustomEvent('autorell:open-auth', {
        detail: { mode: 'login', destination },
      }),
    )
  }

  async function revealPhone() {
    if (phone) {
      window.location.href = `tel:${phone.replace(/[^\d+]/g, '')}`
      return
    }
    if (phoneError === 'login') {
      openAuth(window.location.pathname + window.location.search)
      return
    }
    setLoadingPhone(true)
    setPhoneError('')
    const response = await fetch(`/api/listing-phone?listingId=${encodeURIComponent(listingId)}`)
    const data = (await response.json().catch(() => null)) as { phone?: string; code?: string } | null
    setLoadingPhone(false)

    if (!response.ok || !data?.phone) {
      const requiresLogin = response.status === 401 || data?.code === 'login_required'
      setPhoneError(requiresLogin ? 'login' : 'unavailable')
      if (requiresLogin) openAuth(window.location.pathname + window.location.search)
      return
    }

    setPhone(data.phone)
    window.location.href = `tel:${data.phone.replace(/[^\d+]/g, '')}`
  }

  async function startConversation() {
    if (messageLoading) return
    setMessageLoading(true)
    const response = await fetch('/api/account/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId }),
    })
    const result = (await response.json().catch(() => null)) as { id?: string } | null
    if (response.status === 401) {
      openAuth(accountMessagesHref())
      setMessageLoading(false)
      return
    }
    if (result?.id) {
      window.location.assign(accountMessagesHref(result.id))
      return
    }
    setMessageLoading(false)
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[120] border-t border-[#e6ebf2] bg-white/98 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-10px_28px_rgba(16,24,40,.12)] backdrop-blur sm:hidden"
      role="region"
      aria-label={phoneText.call}
    >
      <div className="mx-auto grid max-w-[560px] gap-1.5">
        <button
          type="button"
          onClick={revealPhone}
          disabled={loadingPhone}
          className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0866ff] px-4 text-[15px] font-semibold leading-none text-white shadow-[0_8px_18px_rgba(8,102,255,.18)] transition hover:bg-[#0057e6] disabled:cursor-not-allowed disabled:bg-[#c7d7f5]"
        >
          <Phone className="h-[18px] w-[18px]" />
          <span className="truncate">
            {phone || (phoneError === 'login' ? phoneText.signIn : phoneError ? phoneText.unavailable : loadingPhone ? '...' : phoneText.call)}
          </span>
        </button>
        <div className="grid grid-cols-2 gap-2">
          <ListingContactFormButton
            listingId={listingId}
            listingTitle={listingTitle}
            locale={locale}
            defaultCurrency={defaultCurrency}
            buttonLabel={emailLabel}
            buttonClassName="inline-flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#0866ff] bg-white px-3 text-[15px] font-semibold leading-none text-[#0866ff] transition hover:bg-[#f3f8ff]"
            iconClassName="h-[18px] w-[18px] text-[#0866ff]"
          />
          <button
            type="button"
            onClick={startConversation}
            disabled={messageLoading}
            className="inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#0866ff] bg-white px-3 text-[15px] font-semibold leading-none text-[#0866ff] transition hover:bg-[#f3f8ff] disabled:cursor-not-allowed disabled:border-[#b9cef5] disabled:text-[#98a2b3]"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="truncate">{messageLoading ? '...' : messageLabel}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
