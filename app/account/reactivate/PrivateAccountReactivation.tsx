'use client'

import { useEffect, useState } from 'react'

export default function PrivateAccountReactivation({
  destination,
  copy,
}: {
  destination: string
  copy: { title: string; text: string; retry: string }
}) {
  const [failed, setFailed] = useState(false)

  async function reactivate() {
    setFailed(false)
    try {
      const response = await fetch('/api/account/reactivate-private', { method: 'POST' })
      if (!response.ok) throw new Error('Reactivation failed')
      window.location.replace(destination)
    } catch {
      setFailed(true)
    }
  }

  useEffect(() => {
    let cancelled = false
    void fetch('/api/account/reactivate-private', { method: 'POST' })
      .then((response) => {
        if (!response.ok) throw new Error('Reactivation failed')
        if (!cancelled) window.location.replace(destination)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [destination])

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9fc] px-5 text-[#101828]">
      <section className="w-full max-w-md rounded-[16px] border border-[#dbe3ef] bg-white p-7 text-center shadow-[0_20px_60px_rgba(16,24,40,.10)]">
        <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-[3px] border-[#d7e5ff] border-t-[#0866ff]" />
        <h1 className="mt-5 text-xl font-semibold">{copy.title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.text}</p>
        {failed ? (
          <button
            type="button"
            onClick={() => void reactivate()}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#0866ff] px-5 text-sm font-semibold text-white"
          >
            {copy.retry}
          </button>
        ) : null}
      </section>
    </main>
  )
}
