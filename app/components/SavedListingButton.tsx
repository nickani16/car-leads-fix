'use client'

import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  fetchSavedListingIds,
  removeSavedListingId,
  readSavedListingIds,
  saveListingId,
  SAVED_LISTINGS_EVENT,
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
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const sync = () => setSaved(readSavedListingIds().includes(listingId))
    sync()
    void fetchSavedListingIds().then((result) => {
      setAuthenticated(result.authenticated)
      setSaved(result.ids.includes(listingId))
    }).catch(() => undefined)
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

  async function toggle() {
    if (busy) return
    if (!authenticated) {
      setBusy(true)
      try {
        const result = await fetchSavedListingIds()
        setAuthenticated(result.authenticated)
        if (result.authenticated) {
          const currentSaved = result.ids.includes(listingId)
          const nextSaved = !currentSaved
          setSaved(nextSaved)
          const toggleResult = nextSaved
            ? await saveListingId(listingId)
            : await removeSavedListingId(listingId)
          if (!toggleResult.authenticated) {
            setAuthenticated(false)
            setSaved(false)
          }
          return
        }
      } catch {
        // Fall through to the auth prompt below.
      } finally {
        setBusy(false)
      }
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
    const nextSaved = !saved
    setBusy(true)
    setSaved(nextSaved)
    try {
      const result = nextSaved
        ? await saveListingId(listingId)
        : await removeSavedListingId(listingId)
      if (!result.authenticated) {
        setAuthenticated(false)
        setSaved(false)
        window.dispatchEvent(
          new CustomEvent('autorell:open-auth', {
            detail: { mode: 'login', destination: '/saved' },
          }),
        )
      }
    } catch {
      setSaved(!nextSaved)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? 'Ta bort sparad annons' : label}
      aria-pressed={saved}
      disabled={busy}
      className={`grid h-11 w-11 place-items-center rounded-[14px] bg-white shadow-md transition ${
        saved ? 'text-[#0866ff]' : 'text-[#344054] hover:text-[#0866ff]'
      } ${busy ? 'opacity-70' : ''}`}
    >
      <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
    </button>
  )
}
