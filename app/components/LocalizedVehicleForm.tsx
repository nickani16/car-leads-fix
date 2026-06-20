'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import {
  customerHref,
  getCustomerCopy,
  type CustomerLocale,
} from '@/lib/customer-i18n'

export default function LocalizedVehicleForm({
  locale,
}: {
  locale: CustomerLocale
}) {
  const copy = getCustomerCopy(locale)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setError('')

    const form = new FormData(event.currentTarget)
    const mileageKm = Number(form.get('mileageKm'))
    form.set('miles', String(Math.round(mileageKm / 10)))
    form.delete('mileageKm')

    const response = await fetch('/api/submit', {
      method: 'POST',
      body: form,
    })

    if (!response.ok) {
      setStatus('idle')
      setError(copy.form.error)
      return
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="rounded-[28px] border border-[#d9e5e9] bg-white p-8 text-center shadow-[0_24px_70px_rgba(32,33,36,.08)] sm:p-12">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#4f8298]" />
        <h2 className="mt-6 text-3xl tracking-[-0.04em]">{copy.form.success}</h2>
        <Link
          href={customerHref(locale, '')}
          className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#242424] px-6 text-sm text-white"
        >
          Autorell
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[28px] border border-[#d9e5e9] bg-white p-6 shadow-[0_24px_70px_rgba(32,33,36,.08)] sm:p-10"
    >
      <input type="hidden" name="source" value="SE" />
      <input type="hidden" name="bodyType" value="SUV" />
      <input type="hidden" name="fuelType" value="Petrol" />
      <input type="hidden" name="gearbox" value="Automatic" />
      <input type="hidden" name="drivetrain" value="Front-wheel drive" />
      <input type="hidden" name="tireset" value="Summer and winter tires" />
      <input type="hidden" name="tires" value="Good" />
      <input type="hidden" name="financeStatus" value="owned_outright" />
      <input type="hidden" name="isDriveable" value="true" />
      <input type="hidden" name="hasEngineTransmissionIssues" value="false" />
      <input type="hidden" name="hasFluidLeaks" value="false" />
      <input type="hidden" name="hasSeriousCollisionDamage" value="false" />
      <input type="hidden" name="warnings" value="No warning lights" />
      <input type="hidden" name="damage" value="No significant damage" />

      <div className="grid gap-5 sm:grid-cols-2">
        {[
          ['reg', copy.form.labels[0], 'text'],
          ['make', copy.form.labels[1], 'text'],
          ['model', copy.form.labels[2], 'text'],
          ['modelYear', copy.form.labels[3], 'number'],
          ['mileageKm', copy.form.labels[4], 'number'],
          ['pickupCity', copy.form.labels[5], 'text'],
          ['phone', copy.form.labels[6], 'tel'],
          ['email', copy.form.labels[7], 'email'],
        ].map(([name, label, type]) => (
          <label key={name} className="block text-sm text-[#39434a]">
            <span className="mb-2 block">{label}</span>
            <input
              name={name}
              type={type}
              required
              min={name === 'modelYear' ? 2018 : undefined}
              className="min-h-12 w-full rounded-[12px] border border-[#ccd8dc] bg-[#fbfcfc] px-4 outline-none transition focus:border-[#6f9caf] focus:ring-2 focus:ring-[#b4d9ef]/50"
            />
          </label>
        ))}
      </div>

      <label className="mt-5 block text-sm text-[#39434a]">
        <span className="mb-2 block">Postal code</span>
        <input
          name="pickupPostalCode"
          required
          className="min-h-12 w-full rounded-[12px] border border-[#ccd8dc] bg-[#fbfcfc] px-4 outline-none focus:border-[#6f9caf]"
        />
      </label>

      <label className="mt-6 flex items-start gap-3 text-xs leading-5 text-[#657279]">
        <input type="checkbox" required className="mt-1" />
        <span>
          {copy.form.consent}{' '}
          <Link href={customerHref(locale, 'privacy')} className="underline">
            {copy.pages.privacy[0]}
          </Link>
        </span>
      </label>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#242424] px-7 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
      >
        {status === 'sending' ? copy.form.sending : copy.form.submit}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  )
}
