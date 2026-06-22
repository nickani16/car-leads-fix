'use client'

import { FormEvent, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, ShieldAlert } from 'lucide-react'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'

type Profile = {
  account_type: 'private' | 'business'
  first_name: string | null
  last_name: string | null
  birth_date: string | null
  email: string
  phone: string
  country_code: string
  company_name: string | null
  registration_number: string | null
  vat_number: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  region: string | null
  postal_code: string | null
  identity_status: string
  business_verification_status: string | null
  risk_status: string
  national_id_last4: string | null
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [message, setMessage] = useState('')
  const countries = useMemo(
    () =>
      euCountries
        .map(([code]) => ({ code, name: getEuCountryName(code, 'sv') }))
        .sort((a, b) => a.name.localeCompare(b.name, 'sv')),
    [],
  )

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    })
    const result = (await response.json()) as { error?: string }
    setMessage(response.ok ? 'Profilen är uppdaterad.' : result.error || 'Kunde inte spara.')
  }

  const status =
    profile.account_type === 'business'
      ? profile.business_verification_status
      : profile.identity_status

  return (
    <div className="grid gap-6">
      <VerificationCard status={status || 'pending'} riskStatus={profile.risk_status} />
      <form
        onSubmit={submit}
        className="grid gap-4 rounded-[22px] border border-[#e1e5ec] bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8"
      >
        <Field name="firstName" label="Förnamn" defaultValue={profile.first_name || ''} required />
        <Field name="lastName" label="Efternamn" defaultValue={profile.last_name || ''} required />
        <Field name="birthDate" label="Födelsedatum" type="date" defaultValue={profile.birth_date || ''} required />
        <Field name="phone" label="Telefonnummer" defaultValue={profile.phone} required />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Land</span>
          <select name="countryCode" defaultValue={profile.country_code} className={controlClass} required>
            {countries.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}
          </select>
        </label>
        {profile.account_type === 'private' && (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Identitetsnummer</span>
            <input
              value={profile.national_id_last4 ? `••••••${profile.national_id_last4}` : 'Ej registrerat'}
              disabled
              className={`${controlClass} bg-[#f5f6f8]`}
            />
          </label>
        )}
        {profile.account_type === 'business' && (
          <>
            <Field name="companyName" label="Företagsnamn" defaultValue={profile.company_name || ''} required />
            <Field name="registrationNumber" label="Registreringsnummer" defaultValue={profile.registration_number || ''} required />
            <Field name="vatNumber" label="VAT-nummer" defaultValue={profile.vat_number || ''} />
          </>
        )}
        <Field name="addressLine1" label="Gatuadress" defaultValue={profile.address_line_1 || ''} required />
        <Field name="addressLine2" label="Lägenhet, våning eller c/o" defaultValue={profile.address_line_2 || ''} />
        <Field name="postalCode" label="Postnummer" defaultValue={profile.postal_code || ''} required />
        <Field name="city" label="Ort" defaultValue={profile.city || ''} required />
        <Field name="region" label="Region eller delstat" defaultValue={profile.region || ''} />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">E-post</span>
          <input value={profile.email} disabled className={`${controlClass} bg-[#f5f6f8]`} />
        </label>
        <div className="sm:col-span-2">
          {message && <p className="mb-4 text-sm text-[#475467]">{message}</p>}
          <button className="min-h-12 rounded-[14px] bg-[#0866ff] px-6 font-bold text-white">
            Spara profil
          </button>
        </div>
      </form>
    </div>
  )
}

function VerificationCard({ status, riskStatus }: { status: string; riskStatus: string }) {
  const verified = status === 'verified' || status === 'vat_validated' || status === 'format_validated'
  const Icon = riskStatus !== 'standard' ? ShieldAlert : verified ? CheckCircle2 : Clock3
  return (
    <section className="flex items-start gap-4 rounded-[18px] border border-[#d8e3f7] bg-[#f4f8ff] p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-white text-[#0866ff] shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="font-semibold">
          {riskStatus !== 'standard'
            ? 'Kontot behöver granskas'
            : verified
              ? 'Grundkontrollen är genomförd'
              : 'Verifiering pågår'}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#667085]">
          Automatiska kontroller ersätter inte en full identitetskontroll. Autorell kan begära
          ytterligare dokument eller e-legitimation vid risk, rapport eller publicering.
        </p>
      </div>
    </section>
  )
}

const controlClass =
  'h-12 w-full rounded-[14px] border border-[#d7deed] bg-white px-4 text-sm outline-none focus:border-[#0866ff]'

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input {...rest} className={controlClass} />
    </label>
  )
}
