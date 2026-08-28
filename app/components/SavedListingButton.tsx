'use client'

import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  fetchSavedListingIds,
  removeGuestListingId,
  removeSavedListingId,
  readSavedListingIds,
  saveGuestListingId,
  saveListingId,
  SAVED_LISTINGS_EVENT,
} from '@/lib/saved-listings'

export default function SavedListingButton({
  listingId,
  label = 'Spara annons',
  savedLabel = 'Sparad',
  removeLabel = 'Ta bort sparad annons',
  variant = 'icon',
  className: extraClassName = '',
  labelClassName = '',
  iconClassName = '',
  initialCount = 0,
  showCount = false,
}: {
  listingId: string
  label?: string
  savedLabel?: string
  removeLabel?: string
  variant?: 'icon' | 'plain' | 'button'
  className?: string
  labelClassName?: string
  iconClassName?: string
  initialCount?: number
  showCount?: boolean
}) {
  const [saved, setSaved] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [busy, setBusy] = useState(false)
  const [count, setCount] = useState(Math.max(0, initialCount))

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
          } else {
            setCount((value) => Math.max(0, value + (nextSaved ? 1 : -1)))
          }
          return
        }
      } catch {
        // Guest saving is local only, so a temporary API issue should not block the buyer.
      } finally {
        setBusy(false)
      }
      const nextSaved = !readSavedListingIds().includes(listingId)
      if (nextSaved) saveGuestListingId(listingId)
      else removeGuestListingId(listingId)
      setSaved(nextSaved)
      setCount((value) => Math.max(0, value + (nextSaved ? 1 : -1)))
      return
    }
    const nextSaved = !saved
    setBusy(true)
    setSaved(nextSaved)
    setCount((value) => Math.max(0, value + (nextSaved ? 1 : -1)))
    try {
      const result = nextSaved
        ? await saveListingId(listingId)
        : await removeSavedListingId(listingId)
      if (!result.authenticated) {
        setAuthenticated(false)
        setSaved(false)
        setCount((value) => Math.max(0, value + (nextSaved ? -1 : 1)))
        window.dispatchEvent(
          new CustomEvent('autorell:open-auth', {
            detail: { mode: 'login', destination: '/saved' },
          }),
        )
      }
    } catch {
      setSaved(!nextSaved)
      setCount((value) => Math.max(0, value + (nextSaved ? -1 : 1)))
    } finally {
      setBusy(false)
    }
  }

  if (variant === 'plain') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={saved ? removeLabel : label}
        aria-pressed={saved}
        disabled={busy}
        style={{ fontWeight: 500 }}
        className={`inline-flex h-10 min-w-10 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#d7dee9] bg-white px-2.5 text-[13px] font-[500] transition hover:border-[#b9d5ff] hover:text-[#0866ff] disabled:cursor-not-allowed ${
          saved ? 'text-[#0866ff]' : 'text-[#101828]'
        } ${
          busy ? 'opacity-70' : ''
        } ${extraClassName}`.trim()}
      >
        {showCount && count > 0 ? <span className="tabular-nums">{count.toLocaleString()}</span> : null}
        <Heart className={`${iconClassName || 'h-4 w-4'} ${saved ? 'fill-current' : ''}`} />
        {!showCount ? <span className={labelClassName}>{saved ? savedLabel : label}</span> : null}
      </button>
    )
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={saved ? removeLabel : label}
        aria-pressed={saved}
        disabled={busy}
        className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#101828] shadow-sm transition hover:border-[#0866ff] hover:text-[#0866ff] disabled:cursor-not-allowed ${
          busy ? 'opacity-70' : ''
        } ${extraClassName}`.trim()}
      >
        <Heart className={`${iconClassName || 'h-4 w-4'} ${saved ? 'fill-current text-[#0866ff]' : ''}`} />
        <span className={labelClassName}>{saved ? savedLabel : label}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? removeLabel : label}
      aria-pressed={saved}
      disabled={busy}
      className={`grid h-11 w-11 cursor-pointer place-items-center rounded-[14px] bg-white shadow-md transition disabled:cursor-not-allowed ${
        saved ? 'text-[#0866ff]' : 'text-[#0866ff] hover:text-[#0057e6]'
      } ${busy ? 'opacity-70' : ''} ${extraClassName}`.trim()}
    >
      <Heart className={`${iconClassName || 'h-5 w-5'} ${saved ? 'fill-current' : ''}`} />
    </button>
  )
}
