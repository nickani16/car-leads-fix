'use client'

import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  readSavedListingIds,
  SAVED_LISTINGS_EVENT,
  writeSavedListingIds,
} from '@/lib/saved-listings'

export default function SavedListingButton({
  listingId,
  label = 'Spara annons',
}: {
  listingId: string
  label?: string
}) {
  const [saved, setSaved] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const sync = () => setSaved(readSavedListingIds().includes(listingId))
    sync()
    window.addEventListener(SAVED_LISTINGS_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SAVED_LISTINGS_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [listingId])

  useEffect(() => {
    const syncAuth = (event?: Event) => {
      const detail = (event as CustomEvent<{ authenticated?: boolean }> | undefined)?.detail
      const cached = window.__autorellHeaderAccount
      setAuthenticated(Boolean(detail?.authenticated ?? cached?.authenticated))
    }
    syncAuth()
    window.addEventListener('autorell:header-account', syncAuth)
    return () => {
      window.removeEventListener('autorell:header-account', syncAuth)
    }
  }, [])

  function toggle() {
    if (!authenticated) {
      const firstSegment = window.location.pathname.split('/').filter(Boolean)[0]
      const prefix =
        firstSegment && /^[a-z]{2}$/.test(firstSegment) && firstSegment !== 'en' && firstSegment !== 'eu'
          ? `/${firstSegment}`
          : ''
      window.dispatchEvent(
        new CustomEvent('autorell:open-auth', {
          detail: { mode: 'login', destination: `${prefix}/saved` },
        }),
      )
      return
    }
    const current = readSavedListingIds()
    writeSavedListingIds(
      current.includes(listingId)
        ? current.filter((id) => id !== listingId)
        : [...current, listingId],
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? 'Ta bort sparad annons' : label}
      aria-pressed={saved}
      className={`grid h-11 w-11 place-items-center rounded-[14px] bg-white shadow-md transition ${
        saved ? 'text-[#0866ff]' : 'text-[#344054] hover:text-[#0866ff]'
      }`}
    >
      <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
    </button>
  )
}
