'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'
import { localizedAccountError } from '@/lib/account-error-i18n'
import { createClient } from '@/lib/supabase/client'

const REMEMBERED_LOGIN_KEY = 'autorell.rememberedLogin'

export default function AcceptTeamInvitation({
  locale,
  token,
  copy,
}: {
  locale: PublicLocale
  token: string
  copy: {
    accept: string
    accepting: string
    success: string
    signInFirst: string
    failed: string
  }
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const attemptedRef = useRef(false)

  async function redirectToInviteAuth() {
    const next = `${window.location.pathname}${window.location.search}`
    window.localStorage.removeItem(REMEMBERED_LOGIN_KEY)
    await createClient().auth.signOut().catch(() => undefined)
    window.dispatchEvent(new CustomEvent('autorell:auth-changed'))
    router.push(localizePublicHref(locale, `/register?next=${encodeURIComponent(next)}`))
    router.refresh()
  }

  async function accept() {
    if (loading || !token) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/account/company/team/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const result = (await response.json()) as { error?: string; destination?: string }
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError(copy.signInFirst)
          window.setTimeout(() => {
            void redirectToInviteAuth()
          }, 500)
        } else {
          setError(localizedAccountError(locale, result, copy.failed))
        }
        return
      }
      setMessage(copy.success)
      window.setTimeout(() => router.push(localizePublicHref(locale, result.destination || '/account/company')), 700)
    } catch {
      setError(copy.failed)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (attemptedRef.current || !token) return
    attemptedRef.current = true
    void accept()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div>
      <button
        type="button"
        onClick={accept}
        disabled={loading || !token}
        className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#0866ff] px-5 text-sm font-bold text-white transition hover:bg-[#0758db] disabled:cursor-not-allowed disabled:bg-[#9bbcff]"
      >
        {loading ? copy.accepting : copy.accept}
      </button>
      {message ? <p className="mt-4 text-sm font-semibold text-[#0866ff]">{message}</p> : null}
      {error ? <p className="mt-4 text-sm font-semibold text-[#b42318]">{error}</p> : null}
    </div>
  )
}
