'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000
const ACTIVITY_WRITE_INTERVAL_MS = 5 * 1000
const LAST_ACTIVITY_KEY = 'autorell:last-authenticated-activity'

export default function InactivityLogout() {
  const timeoutRef = useRef<number | null>(null)
  const lastWriteRef = useRef(0)
  const signingOutRef = useRef(false)

  useEffect(() => {
    const supabase = createClient()

    function readLastActivity() {
      const value = Number(window.localStorage.getItem(LAST_ACTIVITY_KEY))
      return Number.isFinite(value) && value > 0 ? value : Date.now()
    }

    function clearTimer() {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    async function signOutForInactivity() {
      if (signingOutRef.current) return
      signingOutRef.current = true
      clearTimer()
      window.localStorage.removeItem(LAST_ACTIVITY_KEY)

      await supabase.auth.signOut({ scope: 'local' })
      window.location.replace('/login?status=inactive')
    }

    function scheduleLogout() {
      clearTimer()

      const remaining = INACTIVITY_LIMIT_MS - (Date.now() - readLastActivity())
      if (remaining <= 0) {
        void signOutForInactivity()
        return
      }

      timeoutRef.current = window.setTimeout(() => {
        void signOutForInactivity()
      }, remaining)
    }

    function recordActivity() {
      const now = Date.now()
      if (now - lastWriteRef.current < ACTIVITY_WRITE_INTERVAL_MS) return

      lastWriteRef.current = now
      window.localStorage.setItem(LAST_ACTIVITY_KEY, String(now))
      scheduleLogout()
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== LAST_ACTIVITY_KEY) return
      scheduleLogout()
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        scheduleLogout()
      }
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      'pointerdown',
      'pointermove',
      'keydown',
      'scroll',
      'touchstart',
    ]

    recordActivity()
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, { passive: true })
    })
    window.addEventListener('storage', handleStorage)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && !signingOutRef.current) {
        window.location.replace('/login')
      }
    })

    return () => {
      clearTimer()
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity)
      })
      window.removeEventListener('storage', handleStorage)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      subscription.unsubscribe()
    }
  }, [])

  return null
}
