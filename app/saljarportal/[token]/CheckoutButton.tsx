'use client'

import { useState } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import type { ListingPackage } from '@/lib/listing-packages'

export default function CheckoutButton({
  token,
  packageId,
  disabled,
}: {
  token: string
  packageId: ListingPackage
  disabled?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function checkout() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/listing-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, packageId }),
      })
      const result = (await response.json()) as {
        url?: string
        error?: string
      }

      if (!response.ok || !result.url) {
        setError(result.error || 'Betalningen kunde inte startas.')
        return
      }

      window.location.assign(result.url)
    } catch {
      setError('Betalningen kunde inte startas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={checkout}
        disabled={disabled || loading}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#202124] px-5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-[#b7b9bb]"
      >
        {loading ? <LoaderCircle className="animate-spin" size={17} /> : null}
        {disabled ? 'Tillgängligt efter 24 timmar' : 'Välj paket'}
        {!loading && !disabled ? <ArrowRight size={16} /> : null}
      </button>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </div>
  )
}
