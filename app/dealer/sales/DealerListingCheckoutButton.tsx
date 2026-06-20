'use client'

import { useState } from 'react'
import { CreditCard, LoaderCircle } from 'lucide-react'

export default function DealerListingCheckoutButton({
  leadId,
}: {
  leadId: string
}) {
  const [busy, setBusy] = useState(false)

  async function startCheckout() {
    setBusy(true)
    const response = await fetch(`/api/dealer/listings/${leadId}/checkout`, {
      method: 'POST',
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
      className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-[#242424] px-4 text-xs font-semibold text-white disabled:opacity-60"
    >
      {busy ? (
        <LoaderCircle size={14} className="animate-spin" />
      ) : (
        <CreditCard size={14} />
      )}
      {busy ? 'Opening payment...' : 'Complete payment'}
    </button>
  )
}
