'use client'

import { useEffect } from 'react'

const VIEW_DEDUPE_WINDOW_MS = 30 * 60 * 1000

export default function ListingViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    if (!listingId) return

    const storageKey = `autorell-listing-view:${listingId}`
    const now = Date.now()
    try {
      const lastTracked = Number(window.localStorage.getItem(storageKey) || '0')
      if (lastTracked && now - lastTracked < VIEW_DEDUPE_WINDOW_MS) return
      window.localStorage.setItem(storageKey, String(now))
    } catch {
      // Tracking should never block the listing page.
    }

    const payload = JSON.stringify({
      listingId,
      pageUrl: window.location.href,
    })

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/listing-view', blob)
      return
    }

    void fetch('/api/analytics/listing-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => undefined)
  }, [listingId])

  return null
}
