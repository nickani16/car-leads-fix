'use client'

import { useState } from 'react'
import { CreditCard, LoaderCircle } from 'lucide-react'
import type { ListingPackage } from '@/lib/listing-packages'

export default function DealerListingCheckoutButton({
  leadId,
  packageId,
  label,
}: {
  leadId: string
  packageId: ListingPackage
  label: string
}) {
  const [busy, setBusy] = useState(false)

  async function startCheckout() {
    setBusy(true)
    const response = await fetch(`/api/dealer/listings/${leadId}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
      url?: string
    }

    if (!response.ok || !result.url) {
      window.alert(result.error || 'The payment could not be started.')
      setBusy(false)
      return
    }

    window.location.assign(result.url)
  }

  return (
    <button
      type="button"
      onClick={startCheckout}
      disabled={busy}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#242424] px-4 text-xs font-semibold text-white disabled:opacity-60"
    >
      {busy ? (
        <LoaderCircle size={14} className="animate-spin" />
      ) : (
        <CreditCard size={14} />
      )}
      {busy ? 'Opening payment...' : label}
    </button>
  )
}
