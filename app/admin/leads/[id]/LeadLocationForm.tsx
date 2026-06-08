'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Save } from 'lucide-react'

export default function LeadLocationForm({
  leadId,
  initialCity,
  initialPostalCode,
  initialCountry,
}: {
  leadId: string
  initialCity?: string | null
  initialPostalCode?: string | null
  initialCountry?: string | null
}) {
  const router = useRouter()
  const [city, setCity] = useState(initialCity || '')
  const [postalCode, setPostalCode] = useState(initialPostalCode || '')
  const [countryCode, setCountryCode] = useState(initialCountry || 'SE')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    const response = await fetch(`/api/admin/leads/${leadId}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, postalCode, countryCode }),
    })
    const result = (await response.json()) as { error?: string }

    setMessage(
      response.ok
        ? 'Collection location updated.'
        : result.error || 'The location could not be updated.'
    )
    setSaving(false)
    if (response.ok) router.refresh()
  }

  return (
    <form
      onSubmit={save}
      className="mb-6 rounded-[20px] border border-[#c9e3f2] bg-[#eff8fd] p-6"
    >
      <div className="flex items-start gap-3">
        <MapPin className="mt-0.5 text-[#52768a]" size={20} />
        <div>
          <h2 className="font-semibold">Vehicle collection location</h2>
          <p className="mt-1 text-sm text-[#62686c]">
            Complete this for older leads so dealers see the correct city and
            transport can be priced from the real route.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_180px_110px]">
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="City"
          className="h-11 rounded-[12px] border border-[#c9dbe5] bg-white px-4 text-sm"
          required
        />
        <input
          value={postalCode}
          onChange={(event) => setPostalCode(event.target.value.toUpperCase())}
          placeholder="Postal code"
          className="h-11 rounded-[12px] border border-[#c9dbe5] bg-white px-4 text-sm"
          required
        />
        <input
          value={countryCode}
          onChange={(event) =>
            setCountryCode(event.target.value.toUpperCase().slice(0, 2))
          }
          placeholder="SE"
          maxLength={2}
          className="h-11 rounded-[12px] border border-[#c9dbe5] bg-white px-4 text-sm"
          required
        />
      </div>
      {message && <p className="mt-3 text-xs text-[#52616b]">{message}</p>}
      <button
        disabled={saving}
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-[#242424] px-5 text-sm text-white disabled:opacity-50"
      >
        <Save size={15} />
        {saving ? 'Saving...' : 'Save collection location'}
      </button>
    </form>
  )
}
