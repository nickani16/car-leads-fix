'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Phone } from 'lucide-react'
import { translatePublic, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

type ListingMobileContactBarProps = {
  listingId: string
  locale: PublicLocale
  contactTargetId: string
}

const phoneCopy = {
  sv: {
    show: 'Visa telefon',
    signIn: 'Logga in',
    unavailable: 'Saknas',
  },
  en: {
    show: 'Show phone',
    signIn: 'Sign in',
    unavailable: 'Unavailable',
  },
  de: {
    show: 'Telefon',
    signIn: 'Anmelden',
    unavailable: 'Fehlt',
  },
} as const

const messageCopy = {
  sv: 'Skriv till säljaren',
  en: 'Write to seller',
  de: 'Verkäufer schreiben',
} as const

export default function ListingMobileContactBar({
  listingId,
  locale,
  contactTargetId,
}: ListingMobileContactBarProps) {
  const [visible, setVisible] = useState(false)
  const [contactVisible, setContactVisible] = useState(false)
  const [phone, setPhone] = useState('')
  const [loadingPhone, setLoadingPhone] = useState(false)
  const [phoneError, setPhoneError] = useState<'login' | 'unavailable' | ''>('')
  const [messageLoading, setMessageLoading] = useState(false)
  const [bottomNavVisible, setBottomNavVisible] = useState(true)
  const lastScrollY = useRef(0)

  const phoneText =
    locale === 'sv'
      ? phoneCopy.sv
      : locale === 'de'
        ? phoneCopy.de
        : locale === 'en'
          ? phoneCopy.en
          : translatePublicObject(locale, phoneCopy.en)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const difference = currentScrollY - lastScrollY.current

      setVisible(currentScrollY > 420)
      if (currentScrollY < 10) setBottomNavVisible(true)
      else if (difference > 1) setBottomNavVisible(false)
      else if (difference < -1) setBottomNavVisible(true)

      lastScrollY.current = currentScrollY
    }
    lastScrollY.current = window.scrollY
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const target = document.getElementById(contactTargetId)
    if (!target) return
    const observer = new IntersectionObserver(
      ([entry]) => setContactVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: '0px 0px -18% 0px', threshold: 0.08 },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [contactTargetId])

  function accountMessagesHref(conversationId?: string) {
    const firstSegment = window.location.pathname.split('/').filter(Boolean)[0]
    const prefix =
      firstSegment && /^[a-z]{2}$/.test(firstSegment) && firstSegment !== 'en' && firstSegment !== 'eu'
        ? `/${firstSegment}`
        : ''
    return `${prefix}/account/messages${conversationId ? `?conversation=${conversationId}` : ''}`
  }

  async function revealPhone() {
    if (phone) {
      window.location.href = `tel:${phone.replace(/[^\d+]/g, '')}`
      return
    }
    setLoadingPhone(true)
    setPhoneError('')
    const response = await fetch(`/api/listing-phone?listingId=${encodeURIComponent(listingId)}`)
    const data = (await response.json().catch(() => null)) as { phone?: string; code?: string } | null
    setLoadingPhone(false)

    if (!response.ok || !data?.phone) {
      setPhoneError(response.status === 401 || data?.code === 'login_required' ? 'login' : 'unavailable')
      return
    }

    setPhone(data.phone)
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
      window.dispatchEvent(
        new CustomEvent('autorell:open-auth', {
          detail: { mode: 'login', destination: accountMessagesHref() },
        }),
      )
      setMessageLoading(false)
      return
    }
    if (result?.id) {
      window.location.assign(accountMessagesHref(result.id))
      return
    }
    setMessageLoading(false)
  }

  const show = visible && !contactVisible
  const bottomClass = bottomNavVisible
    ? 'bottom-[calc(4.75rem+env(safe-area-inset-bottom))]'
    : 'bottom-[calc(.75rem+env(safe-area-inset-bottom))]'

  return (
    <div
      className={`fixed inset-x-3 z-[60] rounded-[18px] border border-[#d7e2f2] bg-white/96 p-2 shadow-[0_18px_50px_rgba(16,24,40,.22)] backdrop-blur transition-[bottom,transform,opacity] duration-300 ease-out sm:hidden ${bottomClass} ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-5 opacity-0'
      }`}
    >
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={revealPhone}
          disabled={loadingPhone}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[13px] border border-[#cfd8e6] bg-white px-3 text-xs font-semibold text-[#0866ff] transition hover:border-[#0866ff] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Phone className="h-4 w-4" />
          <span className="truncate">
            {phone || (phoneError === 'login' ? phoneText.signIn : phoneError ? phoneText.unavailable : loadingPhone ? '...' : phoneText.show)}
          </span>
        </button>
        <button
          type="button"
          onClick={startConversation}
          disabled={messageLoading}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[13px] bg-[#0866ff] px-3 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(8,102,255,.22)] transition hover:bg-[#0057e6] disabled:cursor-not-allowed disabled:bg-[#c7d7f5]"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="truncate">
            {messageLoading
              ? '...'
              : locale === 'sv'
                ? messageCopy.sv
                : locale === 'de'
                  ? messageCopy.de
                  : locale === 'en'
                    ? messageCopy.en
                    : translatePublic(locale, messageCopy.en)}
          </span>
        </button>
      </div>
    </div>
  )
}
