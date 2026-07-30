'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Pencil, Trash2 } from 'lucide-react'

type Location = {
  id: string
  name: string | null
  location_type: string | null
  country_code: string | null
  region: string | null
  municipality: string | null
  city: string | null
  postal_code: string | null
  address_line_1: string | null
  contact_email: string | null
  contact_phone: string | null
  is_primary: boolean | null
}

type Copy = {
  editBranch: string
  cancel: string
  saveChanges: string
  deactivateBranch: string
  deactivating: string
  saving: string
  saved: string
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
  primaryLocation: string
  branch: string
  showroom: string
  storage: string
  headquarters: string
  service: string
  other: string
}

export function CompanyLocationActions({ location, copy }: { location: Location; copy: Copy }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy('save')
    setError('')
    const form = new FormData(event.currentTarget)
    const body = Object.fromEntries(form.entries())
    const response = await fetch('/api/account/company/locations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, id: location.id, isPrimary: form.get('isPrimary') === 'on' }),
    })
    const data = await response.json().catch(() => ({}))
    setBusy(null)
    if (!response.ok) {
      setError(String(data.error || 'Could not update company location.'))
      return
    }
    setOpen(false)
    router.refresh()
  }

  async function deactivate() {
    if (busy) return
    setBusy('delete')
    setError('')
    const response = await fetch(`/api/account/company/locations?id=${encodeURIComponent(location.id)}`, { method: 'DELETE' })
    const data = await response.json().catch(() => ({}))
    setBusy(null)
    if (!response.ok) {
      setError(String(data.error || 'Could not deactivate company location.'))
      return
    }
    router.refresh()
  }

  return (
    <div className="mt-4 border-t border-[#e4ebf5] pt-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-[#d0d8e6] bg-white px-3 text-sm font-semibold text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff]"
        >
          <Pencil className="h-4 w-4" />
          {copy.editBranch}
        </button>
        <button
          type="button"
          onClick={deactivate}
          disabled={busy !== null}
          className="inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-[#fed7aa] bg-white px-3 text-sm font-semibold text-[#9a3412] transition hover:bg-[#fff7ed] disabled:opacity-60"
        >
          {busy === 'delete' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          {busy === 'delete' ? copy.deactivating : copy.deactivateBranch}
        </button>
      </div>

      {error ? <p className="mt-3 rounded-[12px] border border-[#ffd0d0] bg-[#fff5f5] px-3 py-2 text-sm font-medium text-[#b42318]">{error}</p> : null}

      {open ? (
        <form onSubmit={submit} className="mt-4 grid gap-3 rounded-[14px] border border-[#e4ebf5] bg-white p-4 sm:grid-cols-2">
          <Input name="name" label={copy.name} defaultValue={location.name || ''} required />
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-[#344054]">{copy.type}</span>
            <select name="locationType" defaultValue={location.location_type || 'branch'} className="min-h-11 rounded-[12px] border border-[#d0d8e6] bg-white px-3 text-sm font-medium text-[#101828] outline-none focus:border-[#0866ff]">
              <option value="branch">{copy.branch}</option>
              <option value="showroom">{copy.showroom}</option>
              <option value="storage">{copy.storage}</option>
              <option value="headquarters">{copy.headquarters}</option>
              <option value="service">{copy.service}</option>
              <option value="other">{copy.other}</option>
            </select>
          </label>
          <Input name="countryCode" label={copy.countryCode} defaultValue={location.country_code || ''} maxLength={2} required />
          <Input name="region" label={copy.region} defaultValue={location.region || ''} />
          <Input name="municipality" label={copy.municipality} defaultValue={location.municipality || ''} />
          <Input name="city" label={copy.city} defaultValue={location.city || ''} required />
          <Input name="postalCode" label={copy.postalCode} defaultValue={location.postal_code || ''} />
          <Input name="addressLine1" label={copy.addressLine1} defaultValue={location.address_line_1 || ''} />
          <Input name="contactEmail" label={copy.contactEmail} defaultValue={location.contact_email || ''} type="email" />
          <Input name="contactPhone" label={copy.contactPhone} defaultValue={location.contact_phone || ''} />
          <label className="flex items-center gap-2 text-sm font-semibold text-[#344054] sm:col-span-2">
            <input name="isPrimary" type="checkbox" defaultChecked={Boolean(location.is_primary)} className="h-4 w-4 rounded border-[#d0d8e6] text-[#0866ff]" />
            {copy.primaryLocation}
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" disabled={busy !== null} className="inline-flex min-h-10 items-center gap-2 rounded-[10px] bg-[#0866ff] px-4 text-sm font-semibold text-white transition hover:bg-[#075be3] disabled:opacity-60">
              {busy === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {busy === 'save' ? copy.saving : copy.saveChanges}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="inline-flex min-h-10 items-center rounded-[10px] border border-[#d0d8e6] bg-white px-4 text-sm font-semibold text-[#344054]">
              {copy.cancel}
            </button>
          </div>
        </form>
      ) : null}
    </div>
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
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-[#344054]">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        maxLength={maxLength}
        required={required}
        className="min-h-11 rounded-[12px] border border-[#d0d8e6] bg-white px-3 text-sm font-medium text-[#101828] outline-none placeholder:text-[#98a2b3] focus:border-[#0866ff]"
      />
    </label>
  )
}
