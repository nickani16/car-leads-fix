'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AcceptTeamInvitation({
  token,
  copy,
}: {
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

  async function accept() {
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
        setError(response.status === 401 ? copy.signInFirst : result.error || copy.failed)
        return
      }
      setMessage(copy.success)
      window.setTimeout(() => router.push(result.destination || '/account/company'), 700)
    } catch {
      setError(copy.failed)
    } finally {
      setLoading(false)
    }
  }

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
