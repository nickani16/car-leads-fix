'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Camera,
  CarFront,
  CheckCircle2,
  Gavel,
  LoaderCircle,
  ShoppingCart,
  ShieldCheck,
  Star,
  Trash2,
} from 'lucide-react'

const inputClass =
  'h-12 w-full rounded-[14px] border border-[#d8d7d1] bg-white px-4 text-sm outline-none transition focus:border-[#78b5d6] focus:ring-4 focus:ring-[#B4D9EF]/30'
const areaClass =
  'min-h-28 w-full rounded-[14px] border border-[#d8d7d1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#78b5d6] focus:ring-4 focus:ring-[#B4D9EF]/30'

type SelectedImage = {
  id: string
  file: File
  previewUrl: string
}

export default function DealerSellPage() {
  const router = useRouter()
  const [saleFormat, setSaleFormat] = useState<'auction' | 'marketplace'>(
    'auction'
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const selectedImagesRef = useRef<SelectedImage[]>([])

  useEffect(() => {
    selectedImagesRef.current = selectedImages
  }, [selectedImages])

  useEffect(
    () => () => {
      selectedImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl)
      )
    },
    []
  )

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const form = new FormData(event.currentTarget)
    form.set('saleFormat', saleFormat)
    form.delete('images')
    selectedImages.forEach((image) => form.append('images', image.file))

    const response = await fetch('/api/dealer/listings', {
      method: 'POST',
      body: form,
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
      leadId?: string
    }

    if (!response.ok || !result.leadId) {
      setError(result.error || 'The vehicle could not be submitted.')
      setSubmitting(false)
      return
    }

    router.push('/dealer/sales?submitted=1')
    router.refresh()
  }

  function selectImages(files: FileList | null) {
    if (!files?.length) return

    const incomingFiles = Array.from(files)
    const invalidFiles = incomingFiles.filter(
      (file) =>
        !file.type.startsWith('image/') || file.size > 12 * 1024 * 1024
    )
    const availableSlots = Math.max(0, 20 - selectedImages.length)
    const nextFiles = incomingFiles
      .filter(
        (file) =>
          file.type.startsWith('image/') && file.size <= 12 * 1024 * 1024
      )
      .slice(0, availableSlots)

    if (invalidFiles.length) {
      setError(
        'Some files were skipped. Use JPG, PNG or WebP images up to 12 MB each.'
      )
    } else if (incomingFiles.length > availableSlots) {
      setError('A vehicle listing can contain a maximum of 20 images.')
    } else {
      setError('')
    }

    setSelectedImages((current) => [
      ...current,
      ...nextFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ])
  }

  function removeImage(imageId: string) {
    setSelectedImages((current) => {
      const removed = current.find((image) => image.id === imageId)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return current.filter((image) => image.id !== imageId)
    })
  }

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6f767a]">
            Dealer selling
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            List a vehicle
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#687177]">
            Submit the vehicle once. Autorell reviews the information before it
            becomes visible to approved buyers.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-[16px] border border-[#b8dfc5] bg-[#eaf7ee] px-4 py-3 text-sm text-[#176b39]">
          <ShieldCheck size={18} />
          Admin review before publication
        </div>
      </section>

      <form onSubmit={submit} className="space-y-6">
        <FormSection
          icon={<Gavel size={19} />}
          title="Choose selling method"
          description="The selected price remains private until Autorell approves the listing."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FormatButton
              active={saleFormat === 'auction'}
              icon={<Gavel size={20} />}
              title="Timed auction"
              text="Approved dealers compete with binding bids."
              onClick={() => setSaleFormat('auction')}
            />
            <FormatButton
              active={saleFormat === 'marketplace'}
              icon={<ShoppingCart size={20} />}
              title="Fixed price"
              text="The first approved buyer can submit a binding purchase."
              onClick={() => setSaleFormat('marketplace')}
            />
          </div>
          <div className="mt-5 max-w-md">
            <Field
              label={
                saleFormat === 'auction'
                  ? 'Reserve price (EUR)'
                  : 'Fixed vehicle price (EUR)'
              }
              required
            >
              <input
                name={
                  saleFormat === 'auction' ? 'reservePrice' : 'buyNowPrice'
                }
                type="number"
                min="1"
                step="1"
                required
                className={inputClass}
                placeholder="Example: 18 500"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon={<CarFront size={19} />}
          title="Vehicle identity"
          description="Enter the information shown in the registration and vehicle records."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Registration number" required>
              <input name="reg" required className={inputClass} />
            </Field>
            <Field label="VIN">
              <input name="vin" maxLength={17} className={inputClass} />
            </Field>
            <Field label="Brand" required>
              <input name="make" required className={inputClass} />
            </Field>
            <Field label="Model" required>
              <input name="model" required className={inputClass} />
            </Field>
            <Field label="Variant">
              <input name="variant" className={inputClass} />
            </Field>
            <Field label="Model year" required>
              <input
                name="modelYear"
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                required
                className={inputClass}
              />
            </Field>
            <Field label="First registration">
              <input
                name="firstRegistration"
                type="date"
                className={inputClass}
              />
            </Field>
            <Field label="Mileage (km)" required>
              <input
                name="mileageKm"
                type="number"
                min="0"
                required
                className={inputClass}
              />
            </Field>
            <Field label="Colour">
              <input name="color" className={inputClass} />
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon={<CarFront size={19} />}
          title="Technical details"
          description="These fields help buyers compare and value the vehicle."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              label="Body type"
              name="bodyType"
              options={['Sedan', 'Estate', 'SUV', 'Hatchback', 'Coupe', 'Van']}
            />
            <SelectField
              label="Fuel"
              name="fuelType"
              options={[
                'Petrol',
                'Diesel',
                'Electric',
                'Plug-in hybrid',
                'Hybrid',
              ]}
            />
            <SelectField
              label="Gearbox"
              name="gearbox"
              options={['Automatic', 'Manual']}
            />
            <SelectField
              label="Drivetrain"
              name="drivetrain"
              options={['FWD', 'RWD', 'AWD']}
            />
            <Field label="Power (hp)">
              <input
                name="powerHp"
                type="number"
                min="1"
                className={inputClass}
              />
            </Field>
            <Field label="Engine size">
              <input
                name="engineSize"
                className={inputClass}
                placeholder="Example: 2.0"
              />
            </Field>
            <Field label="Number of owners">
              <input name="owners" className={inputClass} />
            </Field>
            <Field label="Keys included">
              <input name="keysCount" className={inputClass} />
            </Field>
            <Field label="Inspection valid until">
              <input
                name="inspectionValidUntil"
                type="date"
                className={inputClass}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon={<ShieldCheck size={19} />}
          title="Condition and ownership"
          description="Disclose known faults accurately. Autorell reviews this before publication."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              label="Service history"
              name="service"
              required={false}
              options={['Full service history', 'Partial service history', 'No service history']}
            />
            <SelectField
              label="Damage"
              name="damage"
              required={false}
              options={['No known damage', 'Minor damage', 'Significant damage', 'Accident damage']}
            />
            <SelectField
              label="Warning lights"
              name="warnings"
              required={false}
              options={['No warning lights', 'Warning lights present']}
            />
            <SelectField
              label="Tyre condition"
              name="tires"
              required={false}
              options={['Good', 'Acceptable', 'Worn']}
            />
            <SelectField
              label="Tyre sets included"
              name="tireset"
              required={false}
              options={['One set', 'Two sets']}
            />
            <SelectField
              label="Towbar"
              name="towbar"
              required={false}
              options={['Yes', 'No']}
            />
            <SelectField
              label="Ownership / finance"
              name="financeStatus"
              options={[
                'owned_outright',
                'vehicle_finance',
                'leasing',
                'unsecured_loan',
                'unknown',
              ]}
            />
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Field label="Known damage or condition details">
              <textarea
                name="damageDescription"
                className={areaClass}
                placeholder="Describe scratches, dents, mechanical symptoms or other relevant issues."
              />
            </Field>
            <Field label="Equipment and accessories">
              <textarea
                name="equipment"
                className={areaClass}
                placeholder="Navigation, towbar, winter wheels, driver assistance and other equipment."
              />
            </Field>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <BooleanField name="isDriveable" label="Vehicle is driveable" defaultChecked />
            <BooleanField
              name="hasEngineTransmissionIssues"
              label="Known engine or transmission issue"
            />
            <BooleanField name="hasFluidLeaks" label="Known fluid leak" />
            <BooleanField
              name="hasSeriousCollisionDamage"
              label="Serious collision damage"
            />
          </div>
        </FormSection>

        <FormSection
          icon={<Camera size={19} />}
          title="Location and images"
          description="Clear photos improve buyer confidence and reduce questions."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Country code" required>
              <input
                name="originCountry"
                required
                maxLength={2}
                defaultValue="SE"
                className={inputClass}
              />
            </Field>
            <Field label="Collection city" required>
              <input name="pickupCity" required className={inputClass} />
            </Field>
            <Field label="Postal code" required>
              <input name="pickupPostalCode" required className={inputClass} />
            </Field>
          </div>
          <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-[#9bc9e4] bg-[#f3f9fc] px-6 py-9 text-center transition hover:border-[#397b9f] hover:bg-[#edf7fb]">
            <Camera size={26} className="text-[#397b9f]" />
            <span className="mt-3 text-sm font-semibold">
              Add vehicle images
            </span>
            <span className="mt-1 text-xs text-[#687177]">
              JPG, PNG or WebP · maximum 12 MB per image
            </span>
            <span className="mt-3 rounded-full bg-white px-4 py-2 text-xs">
              {selectedImages.length
                ? `${selectedImages.length} of 20 images selected`
                : 'Choose images'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                selectImages(event.target.files)
                event.target.value = ''
              }}
            />
          </label>

          {selectedImages.length > 0 && (
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Review your images</p>
                  <p className="mt-1 text-xs text-[#687177]">
                    The first image becomes the main listing image. Remove any
                    incorrect photo before submitting.
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-[#397b9f]">
                  {selectedImages.length}/20
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {selectedImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative aspect-[4/3] overflow-hidden rounded-[15px] border border-[#d8dfe2] bg-[#edf1f2]"
                  >
                    <Image
                      src={image.previewUrl}
                      alt={`Selected vehicle image ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8">
                      {index === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#B4D9EF] px-2 py-1 text-[10px] font-semibold text-[#202124]">
                          <Star size={11} />
                          Main image
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-white/80">
                          Image {index + 1}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="grid h-8 w-8 place-items-center rounded-full bg-white text-red-700 shadow transition hover:scale-105"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </FormSection>

        {error && (
          <p className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-col justify-between gap-4 rounded-[22px] bg-[#202528] p-6 text-white sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 text-[#B4D9EF]" size={20} />
            <div>
              <p className="font-semibold">Submit for Autorell review</p>
              <p className="mt-1 text-sm text-white/60">
                The vehicle is not published until an administrator approves it.
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#B4D9EF] px-6 text-sm font-semibold text-[#202124] disabled:opacity-60"
          >
            {submitting ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <ArrowRight size={17} />
            )}
            {submitting ? 'Submitting...' : 'Submit vehicle'}
          </button>
        </div>
      </form>
    </main>
  )
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[22px] border border-[#deddd7] bg-white p-6 shadow-[0_14px_40px_rgba(32,33,36,.05)] sm:p-8">
      <div className="mb-6 flex items-start gap-3 border-b border-[#eceae5] pb-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#B4D9EF]">
          {icon}
        </span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-[#70777b]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-[#4f565a]">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
    </label>
  )
}

function SelectField({
  label,
  name,
  options,
  required = true,
}: {
  label: string
  name: string
  options: string[]
  required?: boolean
}) {
  return (
    <Field label={label} required={required}>
      <select name={name} required={required} className={inputClass}>
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
    </Field>
  )
}

function BooleanField({
  name,
  label,
  defaultChecked = false,
}: {
  name: string
  label: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex items-center gap-3 rounded-[14px] border border-[#e1dfd9] bg-[#faf9f6] px-4 py-3 text-sm">
      <input type="hidden" name={name} value="false" />
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-[#242424]"
      />
      {label}
    </label>
  )
}

function FormatButton({
  active,
  icon,
  title,
  text,
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  title: string
  text: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[18px] border p-5 text-left transition ${
        active
          ? 'border-[#202124] bg-[#f7fbfd] shadow-sm'
          : 'border-[#deddd7] bg-white hover:border-[#9bc9e4]'
      }`}
    >
      <span className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </span>
      <span className="mt-2 block text-sm leading-6 text-[#70777b]">{text}</span>
    </button>
  )
}
