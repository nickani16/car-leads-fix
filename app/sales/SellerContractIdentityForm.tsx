'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SellerContractIdentityForm({
  dealId,
  initialName = '',
  initialAddress = '',
  initialCountry = 'SE',
}: {
  dealId: string
  initialName?: string | null
  initialAddress?: string | null
  initialCountry?: string | null
}) {
  const router = useRouter()
  const [legalName, setLegalName] = useState(initialName || '')
  const [registeredAddress, setRegisteredAddress] = useState(
    initialAddress || ''
  )
  const [countryCode, setCountryCode] = useState(initialCountry || 'SE')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const response = await fetch(`/api/deals/${dealId}/contract-identity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ legalName, registeredAddress, countryCode }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }

    setLoading(false)
    if (!response.ok) {
      setMessage(result.error || 'Seller identity could not be saved.')
      return
    }

    setMessage('Seller identity saved. A new locked document version was created.')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-3 rounded-[16px] border border-[#deddd7] bg-white p-4"
    >
      <p className="text-sm font-semibold">Complete seller legal identity</p>
      <input
        value={legalName}
        onChange={(event) => setLegalName(event.target.value)}
        placeholder="Full legal name"
        required
        className="h-11 w-full rounded-[11px] border border-[#d8d7d1] px-3 text-sm outline-none focus:border-[#8dbdd8]"
      />
      <textarea
        value={registeredAddress}
        onChange={(event) => setRegisteredAddress(event.target.value)}
        placeholder="Registered address, postal code and city"
        required
        className="min-h-20 w-full rounded-[11px] border border-[#d8d7d1] p-3 text-sm outline-none focus:border-[#8dbdd8]"
      />
      <input
        value={countryCode}
        onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
        placeholder="Country code"
        required
        maxLength={2}
        className="h-11 w-full rounded-[11px] border border-[#d8d7d1] px-3 text-sm uppercase outline-none focus:border-[#8dbdd8]"
      />
      <button
        disabled={loading}
        className="h-11 rounded-full bg-[#242424] px-5 text-sm text-white disabled:opacity-60"
      >
        {loading ? 'Saving...' : 'Save and regenerate drafts'}
      </button>
      {message && <p className="text-xs text-[#62686c]">{message}</p>}
    </form>
  )
}
