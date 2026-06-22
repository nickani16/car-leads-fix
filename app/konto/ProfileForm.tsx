'use client'

import { FormEvent, useState } from 'react'

type Profile = {
  account_type: 'private' | 'business'
  display_name: string
  legal_name: string | null
  email: string
  phone: string
  country_code: string
  company_name: string | null
  registration_number: string | null
  vat_number: string | null
  registered_address: string | null
  city: string | null
  postal_code: string | null
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [message, setMessage] = useState('')
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
  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[24px] border border-[#e1e5ec] bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
      <Field name="displayName" label="Visningsnamn" defaultValue={profile.display_name} required />
      <Field name="legalName" label="Juridiskt namn" defaultValue={profile.legal_name || ''} />
      <Field name="phone" label="Telefonnummer" defaultValue={profile.phone} required />
      <Field name="countryCode" label="Landkod" defaultValue={profile.country_code} maxLength={2} required />
      {profile.account_type === 'business' && <>
        <Field name="companyName" label="Företagsnamn" defaultValue={profile.company_name || ''} required />
        <Field name="registrationNumber" label="Organisationsnummer" defaultValue={profile.registration_number || ''} required />
        <Field name="vatNumber" label="VAT-nummer" defaultValue={profile.vat_number || ''} />
      </>}
      <Field name="address" label="Adress" defaultValue={profile.registered_address || ''} />
      <Field name="city" label="Ort" defaultValue={profile.city || ''} />
      <Field name="postalCode" label="Postnummer" defaultValue={profile.postal_code || ''} />
      <label className="block"><span className="mb-2 block text-sm font-semibold">E-post</span><input value={profile.email} disabled className="h-12 w-full rounded-[14px] border bg-[#f5f6f8] px-4 text-sm" /></label>
      <div className="sm:col-span-2">
        {message && <p className="mb-4 text-sm text-[#475467]">{message}</p>}
        <button className="min-h-12 rounded-[14px] bg-[#0866ff] px-6 font-bold text-white">Spara profil</button>
      </div>
    </form>
  )
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props
  return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span><input {...rest} className="h-12 w-full rounded-[14px] border border-[#d7deed] px-4 text-sm outline-none focus:border-[#0866ff]" /></label>
}
