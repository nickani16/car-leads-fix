'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'

type Copy = {
  addBranch: string
  name: string
  type: string
  countryCode: string
  region: string
  municipality: string
  city: string
  postalCode: string
  addressLine1: string
  contactEmail: string
  contactPhone: string
  saveBranch: string
  saving: string
  saved: string
  saveError: string
  formIntro: string
  branch: string
  showroom: string
  storage: string
  headquarters: string
  service: string
  other: string
}

export function CompanyLocationForm({
  copy,
  defaultCountryCode,
}: {
  copy: Copy
  defaultCountryCode: string
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setError('')
    setSuccess('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/account/company/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    })
    await response.json().catch(() => ({}))
    setSaving(false)
    if (!response.ok) {
      setError(copy.saveError)
      return
    }
    event.currentTarget.reset()
    setSuccess(copy.saved)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="min-w-0 overflow-hidden rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]">
          <Plus className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-[-.025em] text-[#101828]">{copy.addBranch}</h2>
          <p className="mt-1 text-sm leading-6 text-[#667085]">{copy.formIntro}</p>
        </div>
      </div>
      <div className="mt-5 grid min-w-0 gap-3 min-[1500px]:grid-cols-2">
        <Input name="name" label={copy.name} required />
        <label className="grid min-w-0 gap-1.5">
          <span className="text-sm font-medium text-[#344054]">{copy.type}</span>
          <select name="locationType" defaultValue="branch" className="min-h-12 w-full min-w-0 rounded-[12px] border border-[#d0d8e6] bg-white px-3 text-sm font-medium text-[#101828] outline-none focus:border-[#0866ff]">
            <option value="branch">{copy.branch}</option>
            <option value="showroom">{copy.showroom}</option>
            <option value="storage">{copy.storage}</option>
            <option value="headquarters">{copy.headquarters}</option>
            <option value="service">{copy.service}</option>
            <option value="other">{copy.other}</option>
          </select>
        </label>
        <Input name="countryCode" label={copy.countryCode} defaultValue={defaultCountryCode} maxLength={2} required />
        <Input name="region" label={copy.region} />
        <Input name="municipality" label={copy.municipality} />
        <Input name="city" label={copy.city} required />
        <Input name="postalCode" label={copy.postalCode} />
        <Input name="addressLine1" label={copy.addressLine1} />
        <Input name="contactEmail" label={copy.contactEmail} type="email" />
        <Input name="contactPhone" label={copy.contactPhone} />
      </div>
      {error ? <p className="mt-4 rounded-[12px] border border-[#ffd0d0] bg-[#fff5f5] px-3 py-2 text-sm font-medium text-[#b42318]">{error}</p> : null}
      {success ? <p className="mt-4 rounded-[12px] border border-[#b7ebc6] bg-[#f0fff5] px-3 py-2 text-sm font-medium text-[#067647]">{success}</p> : null}
      <button type="submit" disabled={saving} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#0866ff] px-4 text-sm font-semibold text-white transition hover:bg-[#075be3] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {saving ? copy.saving : copy.saveBranch}
      </button>
    </form>
  )
}

function Input({
  name,
  label,
  type = 'text',
  defaultValue,
  maxLength,
  required,
}: {
  name: string
  label: string
  type?: string
  defaultValue?: string
  maxLength?: number
  required?: boolean
}) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-sm font-medium text-[#344054]">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        maxLength={maxLength}
        required={required}
        className="min-h-12 w-full min-w-0 rounded-[12px] border border-[#d0d8e6] bg-white px-3 text-sm font-medium text-[#101828] outline-none placeholder:text-[#98a2b3] focus:border-[#0866ff]"
      />
    </label>
  )
}
