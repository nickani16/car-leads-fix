'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

type Entity = {
  legal_name?: string | null
  registration_number?: string | null
  vat_number?: string | null
  registered_address?: string | null
  country_code?: string | null
  email?: string | null
}

export default function PlatformLegalEntityForm({
  entity,
}: {
  entity?: Entity | null
}) {
  const router = useRouter()
  const [legalName, setLegalName] = useState(entity?.legal_name || '')
  const [registrationNumber, setRegistrationNumber] = useState(
    entity?.registration_number || ''
  )
  const [vatNumber, setVatNumber] = useState(entity?.vat_number || '')
  const [registeredAddress, setRegisteredAddress] = useState(
    entity?.registered_address || ''
  )
  const [countryCode, setCountryCode] = useState(entity?.country_code || 'SE')
  const [email, setEmail] = useState(entity?.email || 'info@autorell.com')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const response = await fetch('/api/admin/legal-entity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        legalName,
        registrationNumber,
        vatNumber,
        registeredAddress,
        countryCode,
        email,
      }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }

    setLoading(false)
    if (!response.ok) {
      setMessage(result.error || 'Company details could not be saved.')
      return
    }

    setMessage('Autorell legal entity saved and pending contracts regenerated.')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-7 rounded-[20px] border border-amber-200 bg-amber-50 p-5"
    >
      <p className="text-sm font-semibold text-amber-950">
        Autorell contracting entity
      </p>
      <p className="mt-1 text-xs text-amber-900">
        Enter verified company information only. It will be locked into every
        pending contract.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field value={legalName} setValue={setLegalName} placeholder="Legal company name" />
        <Field value={registrationNumber} setValue={setRegistrationNumber} placeholder="Registration number" />
        <Field value={vatNumber} setValue={setVatNumber} placeholder="VAT number (optional)" />
        <Field value={email} setValue={setEmail} placeholder="Legal contact email" type="email" />
        <Field value={registeredAddress} setValue={setRegisteredAddress} placeholder="Registered address" />
        <Field value={countryCode} setValue={(value) => setCountryCode(value.toUpperCase())} placeholder="Country code" maxLength={2} />
      </div>
      <button
        disabled={loading}
        className="mt-4 h-11 rounded-full bg-[#242424] px-5 text-sm text-white disabled:opacity-60"
      >
        {loading ? 'Saving...' : 'Save legal entity'}
      </button>
      {message && <p className="mt-3 text-xs text-amber-950">{message}</p>}
    </form>
  )
}

function Field({
  value,
  setValue,
  placeholder,
  type = 'text',
  maxLength,
}: {
  value: string
  setValue: (value: string) => void
  placeholder: string
  type?: string
  maxLength?: number
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      required={placeholder !== 'VAT number (optional)'}
      maxLength={maxLength}
      className="h-11 rounded-[11px] border border-amber-200 bg-white px-3 text-sm outline-none focus:border-amber-400"
    />
  )
}
