'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  ImageIcon,
  LoaderCircle,
  LockKeyhole,
  Save,
  ShieldCheck,
} from 'lucide-react'

type Listing = {
  id: string
  reg: string
  vin: string | null
  make: string | null
  model: string | null
  variant: string | null
  model_year: number | null
  first_registration: string | null
  mileageKm: number
  color: string | null
  body_type: string | null
  fuel_type: string | null
  gearbox: string | null
  drivetrain: string | null
  power_hp: number | null
  engine_size: string | null
  owners: string | null
  keys_count: string | null
  inspection_valid_until: string | null
  service: string | null
  damage: string | null
  warnings: string | null
  tires: string | null
  tireset: string | null
  towbar: string | null
  finance_status: string | null
  damage_description: string | null
  equipment: string | null
  is_driveable: boolean | null
  has_engine_transmission_issues: boolean | null
  has_fluid_leaks: boolean | null
  has_serious_collision_damage: boolean | null
  origin_country: string | null
  pickup_city: string | null
  pickup_postal_code: string | null
  seller_target_price: number | string | null
  status: string | null
  imageCount: number
}

const inputClass =
  'h-12 w-full rounded-[14px] border border-[#d8d7d1] bg-white px-4 text-sm outline-none transition focus:border-[#78b5d6] focus:ring-4 focus:ring-[#B4D9EF]/30 disabled:bg-[#f3f2ee] disabled:text-[#858a8c]'
const areaClass =
  'min-h-28 w-full rounded-[14px] border border-[#d8d7d1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#78b5d6] focus:ring-4 focus:ring-[#B4D9EF]/30 disabled:bg-[#f3f2ee]'

export default function DealerListingEditForm({
  listing,
  editable,
}: {
  listing: Listing
  editable: boolean
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editable) return
    setSaving(true)
    setError('')

    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries()) as Record<
      string,
      FormDataEntryValue
    >
    for (const key of [
      'isDriveable',
      'hasEngineTransmissionIssues',
      'hasFluidLeaks',
      'hasSeriousCollisionDamage',
    ]) {
      ;(payload as Record<string, unknown>)[key] = form.has(key)
    }

    const response = await fetch(`/api/dealer/listings/${listing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    if (!response.ok) {
      setError(result.error || 'The changes could not be saved.')
      setSaving(false)
      return
    }

    router.push('/dealer/sales?edited=1')
    router.refresh()
  }

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <Link
        href="/dealer/sales"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#52616b]"
      >
        <ArrowLeft size={16} />
        Back to supplied vehicles
      </Link>

      <section className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6f767a]">
            Dealer vehicle correction
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Edit {listing.make} {listing.model}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#687177]">
            Saving changes removes the vehicle from the buyer flow and sends it
            back to Autorell for a complete new review.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
          <ShieldCheck size={15} />
          Current status: {listing.status || 'Pending review'}
        </span>
      </section>

      {!editable && (
        <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <LockKeyhole size={18} className="mt-0.5 shrink-0" />
          This vehicle cannot be edited because bidding or a transaction has
          started. Contact Autorell support if a correction is required.
        </div>
      )}

      <form onSubmit={submit} className="mt-7 space-y-6">
        <EditSection title="Price and vehicle identity">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <EditField label="Expected net price from Autorell (EUR)">
              <input
                name="sellerTargetPrice"
                type="number"
                min="1"
                required
                disabled={!editable}
                defaultValue={Number(listing.seller_target_price || 0)}
                className={inputClass}
              />
            </EditField>
            <EditField label="Registration number">
              <input name="reg" required disabled={!editable} defaultValue={listing.reg} className={inputClass} />
            </EditField>
            <EditField label="VIN">
              <input name="vin" maxLength={17} disabled={!editable} defaultValue={listing.vin || ''} className={inputClass} />
            </EditField>
            <EditField label="Brand">
              <input name="make" required disabled={!editable} defaultValue={listing.make || ''} className={inputClass} />
            </EditField>
            <EditField label="Model">
              <input name="model" required disabled={!editable} defaultValue={listing.model || ''} className={inputClass} />
            </EditField>
            <EditField label="Variant">
              <input name="variant" disabled={!editable} defaultValue={listing.variant || ''} className={inputClass} />
            </EditField>
            <EditField label="Model year — 2018 or newer">
              <input
                name="modelYear"
                type="number"
                min="2018"
                max={new Date().getFullYear() + 1}
                required
                disabled={!editable}
                defaultValue={listing.model_year || ''}
                className={inputClass}
              />
            </EditField>
            <EditField label="First registration">
              <input name="firstRegistration" type="date" disabled={!editable} defaultValue={listing.first_registration || ''} className={inputClass} />
            </EditField>
            <EditField label="Mileage — maximum 10,000 km">
              <input
                name="mileageKm"
                type="number"
                min="0"
                max="10000"
                required
                disabled={!editable}
                defaultValue={listing.mileageKm}
                className={inputClass}
              />
            </EditField>
            <EditField label="Colour">
              <input name="color" disabled={!editable} defaultValue={listing.color || ''} className={inputClass} />
            </EditField>
          </div>
        </EditSection>

        <EditSection title="Technical details">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <EditSelect label="Body type" name="bodyType" value={listing.body_type} options={['Sedan', 'Estate', 'SUV', 'Hatchback', 'Coupe', 'Van']} disabled={!editable} />
            <EditSelect label="Fuel" name="fuelType" value={listing.fuel_type} options={['Petrol', 'Diesel', 'Electric', 'Plug-in hybrid', 'Hybrid']} disabled={!editable} />
            <EditSelect label="Gearbox" name="gearbox" value={listing.gearbox} options={['Automatic', 'Manual']} disabled={!editable} />
            <EditSelect label="Drivetrain" name="drivetrain" value={listing.drivetrain} options={['FWD', 'RWD', 'AWD', 'Front-wheel drive', 'Rear-wheel drive', 'All-wheel drive']} disabled={!editable} />
            <EditField label="Power (hp)">
              <input name="powerHp" type="number" min="1" disabled={!editable} defaultValue={listing.power_hp || ''} className={inputClass} />
            </EditField>
            <EditField label="Engine size">
              <input name="engineSize" disabled={!editable} defaultValue={listing.engine_size || ''} className={inputClass} />
            </EditField>
            <EditField label="Number of owners">
              <input name="owners" disabled={!editable} defaultValue={listing.owners || ''} className={inputClass} />
            </EditField>
            <EditField label="Keys included">
              <input name="keysCount" disabled={!editable} defaultValue={listing.keys_count || ''} className={inputClass} />
            </EditField>
            <EditField label="Inspection valid until">
              <input name="inspectionValidUntil" type="date" disabled={!editable} defaultValue={listing.inspection_valid_until || ''} className={inputClass} />
            </EditField>
          </div>
        </EditSection>

        <EditSection title="Condition, ownership and location">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <EditSelect label="Service history" name="service" value={listing.service} options={['Full service history', 'Partial service history', 'No service history']} disabled={!editable} required={false} />
            <EditSelect label="Damage" name="damage" value={listing.damage} options={['No known damage', 'Minor damage', 'Significant damage', 'Accident damage']} disabled={!editable} required={false} />
            <EditSelect label="Warning lights" name="warnings" value={listing.warnings} options={['No warning lights', 'Warning lights present']} disabled={!editable} required={false} />
            <EditSelect label="Tyre condition" name="tires" value={listing.tires} options={['Good', 'Acceptable', 'Worn']} disabled={!editable} required={false} />
            <EditSelect label="Tyre sets included" name="tireset" value={listing.tireset} options={['One set', 'Two sets']} disabled={!editable} required={false} />
            <EditSelect label="Towbar" name="towbar" value={listing.towbar} options={['Yes', 'No']} disabled={!editable} required={false} />
            <EditSelect label="Ownership / finance" name="financeStatus" value={listing.finance_status} options={['owned_outright', 'vehicle_finance', 'leasing', 'unsecured_loan', 'unknown']} disabled={!editable} />
            <EditField label="Country code">
              <input name="originCountry" value="SE" readOnly className={inputClass} />
            </EditField>
            <EditField label="Collection city">
              <input name="pickupCity" required disabled={!editable} defaultValue={listing.pickup_city || ''} className={inputClass} />
            </EditField>
            <EditField label="Postal code">
              <input name="pickupPostalCode" required disabled={!editable} defaultValue={listing.pickup_postal_code || ''} className={inputClass} />
            </EditField>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <EditField label="Known damage or condition details">
              <textarea name="damageDescription" disabled={!editable} defaultValue={listing.damage_description || ''} className={areaClass} />
            </EditField>
            <EditField label="Equipment and accessories">
              <textarea name="equipment" disabled={!editable} defaultValue={listing.equipment || ''} className={areaClass} />
            </EditField>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <EditBoolean name="isDriveable" label="Vehicle is driveable" checked={Boolean(listing.is_driveable)} disabled={!editable} />
            <EditBoolean name="hasEngineTransmissionIssues" label="Known engine or transmission issue" checked={Boolean(listing.has_engine_transmission_issues)} disabled={!editable} />
            <EditBoolean name="hasFluidLeaks" label="Known fluid leak" checked={Boolean(listing.has_fluid_leaks)} disabled={!editable} />
            <EditBoolean name="hasSeriousCollisionDamage" label="Serious collision damage" checked={Boolean(listing.has_serious_collision_damage)} disabled={!editable} />
          </div>
        </EditSection>

        <div className="flex items-start gap-3 rounded-[18px] border border-[#c9dce5] bg-[#f1f7fa] px-5 py-4 text-sm text-[#526b78]">
          <ImageIcon size={18} className="mt-0.5 shrink-0 text-[#397b9f]" />
          {listing.imageCount} existing image{listing.imageCount === 1 ? '' : 's'} will be preserved. Contact Autorell if an image must be removed.
        </div>

        {error && <p className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</p>}

        <div className="flex flex-col justify-between gap-4 rounded-[22px] bg-[#202528] p-6 text-white sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 text-[#B4D9EF]" size={20} />
            <div>
              <p className="font-semibold">A new Autorell review is required</p>
              <p className="mt-1 text-sm text-white/60">
                The edited vehicle will not be visible to buyers until approved again.
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={!editable || saving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#B4D9EF] px-6 text-sm font-semibold text-[#202124] disabled:opacity-50"
          >
            {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
            {saving ? 'Saving...' : 'Save and submit for review'}
          </button>
        </div>
      </form>
    </main>
  )
}

function EditSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[22px] border border-[#deddd7] bg-white p-6 shadow-[0_14px_40px_rgba(32,33,36,.05)] sm:p-8">
      <h2 className="mb-6 border-b border-[#eceae5] pb-5 font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-[#4f565a]">{label}</span>
      {children}
    </label>
  )
}

function EditSelect({
  label,
  name,
  value,
  options,
  disabled,
  required = true,
}: {
  label: string
  name: string
  value: string | null
  options: string[]
  disabled: boolean
  required?: boolean
}) {
  const allOptions = value && !options.includes(value) ? [value, ...options] : options
  return (
    <EditField label={label}>
      <select name={name} defaultValue={value || ''} required={required} disabled={disabled} className={inputClass}>
        <option value="">Select</option>
        {allOptions.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
    </EditField>
  )
}

function EditBoolean({
  name,
  label,
  checked,
  disabled,
}: {
  name: string
  label: string
  checked: boolean
  disabled: boolean
}) {
  return (
    <label className="flex items-center gap-3 rounded-[14px] border border-[#e1dfd9] bg-[#faf9f6] px-4 py-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={checked} disabled={disabled} className="h-4 w-4 accent-[#242424]" />
      {label}
    </label>
  )
}
