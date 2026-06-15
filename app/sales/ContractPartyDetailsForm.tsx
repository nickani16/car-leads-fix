'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Save, UserRound } from 'lucide-react'
import { EU_COUNTRIES } from '@/lib/eu-countries'

type PartyDetails = {
  legal_name?: string | null
  email?: string | null
  phone?: string | null
  registration_number?: string | null
  vat_number?: string | null
  registered_address?: string | null
  country_code?: string | null
  vat_validation_status?: string | null
  vat_validated_at?: string | null
  vat_validation_name?: string | null
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

      <div className="mt-5 grid min-w-0 gap-5">
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
          dealId={dealId}
          vatValidationStatus={buyer?.vat_validation_status}
          vatValidationName={buyer?.vat_validation_name}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#242424] px-5 py-3 text-center text-sm font-medium text-white disabled:opacity-60"
      >
        <Save size={15} />
        {loading ? 'Saving...' : 'Save details and update agreements'}
      </button>
      {message && (
        <p className="mt-3 text-xs text-[#62686c]" aria-live="polite">
          {message}
        </p>
      )}
    </form>
  )
}

function PartyFields({
  title,
  icon,
  showVat = false,
  values,
  onChange,
  dealId,
  vatValidationStatus,
  vatValidationName,
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
  dealId?: string
  vatValidationStatus?: string | null
  vatValidationName?: string | null
}) {
  const [checkingVat, setCheckingVat] = useState(false)
  const [vatResult, setVatResult] = useState<{
    status: string
    name?: string
  } | null>(
    vatValidationStatus
      ? { status: vatValidationStatus, name: vatValidationName || undefined }
      : null
  )
  const inputClass =
    'h-11 min-w-0 w-full rounded-[10px] border border-[#d8d7d1] bg-white px-3 text-sm outline-none focus:border-[#8dbdd8]'

  return (
    <fieldset className="min-w-0 rounded-[14px] border border-[#e5e3dd] bg-[#fafaf8] p-4">
      <legend className="px-2">
        <span className="flex items-center gap-2 text-xs font-semibold">
          {icon}
          {title}
        </span>
      </legend>
      <div className="grid min-w-0 gap-3">
        <Field label="Full legal name">
          <input
            value={values.legalName}
            onChange={(event) => onChange.legalName(event.target.value)}
            placeholder={title === 'Seller' ? 'Seller name' : 'Company name'}
            autoComplete="name"
            required
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            value={values.email}
            onChange={(event) => onChange.email(event.target.value)}
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            required
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <input
            value={values.phone}
            onChange={(event) => onChange.phone(event.target.value)}
            type="tel"
            placeholder="+46 ..."
            autoComplete="tel"
            className={inputClass}
          />
        </Field>
        <Field label="Personal or company number">
          <input
            value={values.registrationNumber}
            onChange={(event) =>
              onChange.registrationNumber(event.target.value)
            }
            placeholder="Registration number"
            className={inputClass}
          />
        </Field>
        {showVat && (
          <Field label="VAT number">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                value={values.vatNumber}
                onChange={(event) => {
                  onChange.vatNumber(event.target.value)
                  setVatResult(null)
                }}
                placeholder="EU VAT number"
                required
                className={inputClass}
              />
              <button
                type="button"
                disabled={checkingVat || !dealId}
                onClick={async () => {
                  if (!dealId) return
                  setCheckingVat(true)
                  const response = await fetch(
                    `/api/sales/deals/${dealId}/vat-check`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        vatNumber: values.vatNumber,
                        countryCode: values.country,
                      }),
                    }
                  )
                  const result = (await response.json().catch(() => ({}))) as {
                    status?: string
                    name?: string
                    error?: string
                  }
                  setCheckingVat(false)
                  setVatResult({
                    status: response.ok ? result.status || 'unavailable' : 'invalid',
                    name: result.name || result.error,
                  })
                }}
                className="h-11 rounded-full border border-[#8dbdd8] bg-[#eff8fd] px-4 text-xs font-medium text-[#31546a] disabled:opacity-50"
              >
                {checkingVat ? 'Checking...' : 'Check VAT'}
              </button>
            </div>
            {vatResult && (
              <span
                className={`text-xs ${
                  vatResult.status === 'valid'
                    ? 'text-emerald-700'
                    : vatResult.status === 'unavailable'
                      ? 'text-amber-700'
                      : 'text-red-700'
                }`}
              >
                {vatResult.status === 'valid'
                  ? `Verified${vatResult.name ? `: ${vatResult.name}` : ''}`
                  : vatResult.status === 'unavailable'
                    ? 'VIES is temporarily unavailable. Try again later.'
                    : vatResult.name || 'VAT number was not valid.'}
              </span>
            )}
          </Field>
        )}
        <Field label="Registered address">
          <textarea
            value={values.address}
            onChange={(event) => onChange.address(event.target.value)}
            placeholder="Street, postal code and city"
            autoComplete="street-address"
            required
            className="min-h-24 min-w-0 w-full rounded-[10px] border border-[#d8d7d1] bg-white p-3 text-sm outline-none focus:border-[#8dbdd8]"
          />
        </Field>
        <Field label="Country code">
          <select
            value={values.country}
            onChange={(event) => onChange.country(event.target.value)}
            required
            className={inputClass}
          >
            <option value="">Select country</option>
            {EU_COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>
                {name} ({code})
              </option>
            ))}
          </select>
        </Field>
      </div>
    </fieldset>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-xs font-medium text-[#596166]">
      {label}
      {children}
    </label>
  )
}
