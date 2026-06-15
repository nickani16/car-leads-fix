'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Save, UserRound } from 'lucide-react'

type PartyDetails = {
  legal_name?: string | null
  email?: string | null
  phone?: string | null
  registration_number?: string | null
  vat_number?: string | null
  registered_address?: string | null
  country_code?: string | null
}

export default function ContractPartyDetailsForm({
  dealId,
  seller,
  buyer,
}: {
  dealId: string
  seller?: PartyDetails
  buyer?: PartyDetails
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    sellerLegalName: seller?.legal_name || '',
    sellerEmail: seller?.email || '',
    sellerPhone: seller?.phone || '',
    sellerRegistrationNumber: seller?.registration_number || '',
    sellerAddress: seller?.registered_address || '',
    sellerCountry: seller?.country_code || 'SE',
    buyerLegalName: buyer?.legal_name || '',
    buyerEmail: buyer?.email || '',
    buyerPhone: buyer?.phone || '',
    buyerRegistrationNumber: buyer?.registration_number || '',
    buyerVatNumber: buyer?.vat_number || '',
    buyerAddress: buyer?.registered_address || '',
    buyerCountry: buyer?.country_code || '',
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const response = await fetch(`/api/deals/${dealId}/contract-identity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seller: {
          legalName: form.sellerLegalName,
          email: form.sellerEmail,
          phone: form.sellerPhone,
          registrationNumber: form.sellerRegistrationNumber,
          registeredAddress: form.sellerAddress,
          countryCode: form.sellerCountry,
        },
        buyer: {
          legalName: form.buyerLegalName,
          email: form.buyerEmail,
          phone: form.buyerPhone,
          registrationNumber: form.buyerRegistrationNumber,
          vatNumber: form.buyerVatNumber,
          registeredAddress: form.buyerAddress,
          countryCode: form.buyerCountry,
        },
      }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }

    setLoading(false)
    if (!response.ok) {
      setMessage(result.error || 'Contract details could not be saved.')
      return
    }

    setMessage('Party details saved. New locked agreement versions were created.')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-[18px] border border-[#deddd7] bg-white p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Seller and buyer details</p>
          <p className="mt-1 text-xs leading-5 text-[#697074]">
            Complete both parties once. The two agreements update together.
          </p>
        </div>
        <Save size={18} className="text-[#52768a]" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <PartyFields
          title="Seller"
          icon={<UserRound size={17} />}
          values={{
            legalName: form.sellerLegalName,
            email: form.sellerEmail,
            phone: form.sellerPhone,
            registrationNumber: form.sellerRegistrationNumber,
            vatNumber: '',
            address: form.sellerAddress,
            country: form.sellerCountry,
          }}
          onChange={{
            legalName: (value) => update('sellerLegalName', value),
            email: (value) => update('sellerEmail', value),
            phone: (value) => update('sellerPhone', value),
            registrationNumber: (value) =>
              update('sellerRegistrationNumber', value),
            vatNumber: () => undefined,
            address: (value) => update('sellerAddress', value),
            country: (value) => update('sellerCountry', value),
          }}
        />
        <PartyFields
          title="Buyer"
          icon={<Building2 size={17} />}
          showVat
          values={{
            legalName: form.buyerLegalName,
            email: form.buyerEmail,
            phone: form.buyerPhone,
            registrationNumber: form.buyerRegistrationNumber,
            vatNumber: form.buyerVatNumber,
            address: form.buyerAddress,
            country: form.buyerCountry,
          }}
          onChange={{
            legalName: (value) => update('buyerLegalName', value),
            email: (value) => update('buyerEmail', value),
            phone: (value) => update('buyerPhone', value),
            registrationNumber: (value) =>
              update('buyerRegistrationNumber', value),
            vatNumber: (value) => update('buyerVatNumber', value),
            address: (value) => update('buyerAddress', value),
            country: (value) => update('buyerCountry', value),
          }}
        />
      </div>

      <button
        disabled={loading}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#242424] px-5 text-sm text-white disabled:opacity-60"
      >
        <Save size={15} />
        {loading ? 'Saving...' : 'Save details and update agreements'}
      </button>
      {message && <p className="mt-3 text-xs text-[#62686c]">{message}</p>}
    </form>
  )
}

function PartyFields({
  title,
  icon,
  showVat = false,
  values,
  onChange,
}: {
  title: string
  icon: React.ReactNode
  showVat?: boolean
  values: {
    legalName: string
    email: string
    phone: string
    registrationNumber: string
    vatNumber: string
    address: string
    country: string
  }
  onChange: {
    legalName: (value: string) => void
    email: (value: string) => void
    phone: (value: string) => void
    registrationNumber: (value: string) => void
    vatNumber: (value: string) => void
    address: (value: string) => void
    country: (value: string) => void
  }
}) {
  const inputClass =
    'h-10 w-full rounded-[10px] border border-[#d8d7d1] px-3 text-xs outline-none focus:border-[#8dbdd8]'

  return (
    <fieldset className="rounded-[14px] border border-[#e5e3dd] bg-[#fafaf8] p-4">
      <legend className="px-2">
        <span className="flex items-center gap-2 text-xs font-semibold">
          {icon}
          {title}
        </span>
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={values.legalName} onChange={(event) => onChange.legalName(event.target.value)} placeholder="Full legal name" required className={`${inputClass} sm:col-span-2`} />
        <input value={values.email} onChange={(event) => onChange.email(event.target.value)} type="email" placeholder="Email" required className={inputClass} />
        <input value={values.phone} onChange={(event) => onChange.phone(event.target.value)} placeholder="Phone" className={inputClass} />
        <input value={values.registrationNumber} onChange={(event) => onChange.registrationNumber(event.target.value)} placeholder="Personal/company number" className={inputClass} />
        {showVat && <input value={values.vatNumber} onChange={(event) => onChange.vatNumber(event.target.value)} placeholder="VAT number" required className={inputClass} />}
        <textarea value={values.address} onChange={(event) => onChange.address(event.target.value)} placeholder="Registered address, postal code and city" required className="min-h-20 w-full rounded-[10px] border border-[#d8d7d1] p-3 text-xs outline-none focus:border-[#8dbdd8] sm:col-span-2" />
        <input value={values.country} onChange={(event) => onChange.country(event.target.value.toUpperCase())} placeholder="Country code" required maxLength={2} className={`${inputClass} uppercase`} />
      </div>
    </fieldset>
  )
}
