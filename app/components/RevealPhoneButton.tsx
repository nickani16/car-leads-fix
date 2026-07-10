'use client'

import { Phone } from 'lucide-react'
import { useState } from 'react'
import type { PublicLocale } from '@/lib/public-i18n'

type RevealPhoneButtonProps = {
  listingId: string
  locale: PublicLocale
}

const copy = {
  sv: {
    show: 'Visa telefonnummer',
    call: 'Ring säljaren',
    unavailable: 'Telefonnummer saknas',
    signIn: 'Logga in för att se telefonnummer',
  },
  en: {
    show: 'Show phone number',
    call: 'Call seller',
    unavailable: 'Phone number unavailable',
    signIn: 'Sign in to view phone number',
  },
  de: {
    show: 'Telefonnummer anzeigen',
    call: 'Verkäufer anrufen',
    unavailable: 'Telefonnummer nicht verfügbar',
    signIn: 'Anmelden, um die Telefonnummer zu sehen',
  },
} as const

export default function RevealPhoneButton({ listingId, locale }: RevealPhoneButtonProps) {
  const [visible, setVisible] = useState(false)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<'unavailable' | 'login' | ''>('')
  const text = locale === 'sv' || locale === 'de' ? copy[locale] : copy.en
  const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`

  async function revealPhone() {
    setLoading(true)
    setError('')
    const response = await fetch(`/api/listing-phone?listingId=${encodeURIComponent(listingId)}`)
    const data = (await response.json().catch(() => null)) as { phone?: string; code?: string } | null
    setLoading(false)

    if (!response.ok || !data?.phone) {
      setError(response.status === 401 || data?.code === 'login_required' ? 'login' : 'unavailable')
      return
    }

    setPhone(data.phone)
    setVisible(true)
  }

  if (visible) {
    return (
      <a
        href={telHref}
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-[#d9e1ec] bg-white px-5 text-sm font-semibold text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff]"
        aria-label={text.call}
      >
        <Phone className="h-4 w-4 text-[#0866ff]" />
        {phone}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={revealPhone}
      disabled={loading}
      className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[12px] border border-[#cfd8e6] bg-white px-5 text-sm font-semibold text-[#0866ff] transition hover:border-[#0866ff] hover:bg-[#f5f9ff] disabled:cursor-not-allowed"
    >
      {error === 'login' ? text.signIn : error ? text.unavailable : loading ? '...' : text.show}
    </button>
  )
}
