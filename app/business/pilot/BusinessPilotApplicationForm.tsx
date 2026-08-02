'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react'
import type { BusinessPilotCopy } from '@/lib/business-pilot-i18n'

type CountryOption = { value: string; label: string }

export default function BusinessPilotApplicationForm({
  copy,
  locale,
  marketCode,
  countries,
  defaultCountry,
  privacyHref,
}: {
  copy: BusinessPilotCopy['form']
  locale: string
  marketCode: string
  countries: CountryOption[]
  defaultCountry: string
  privacyHref: string
}) {
  const startedAt = useRef(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  async function submitApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      companyName: data.get('companyName'),
      registrationNumber: data.get('registrationNumber'),
      countryCode: data.get('countryCode'),
      website: data.get('website'),
      contactName: data.get('contactName'),
      contactRole: data.get('contactRole'),
      email: data.get('email'),
      phone: data.get('phone'),
      inventorySize: data.get('inventorySize'),
      locationCount: data.get('locationCount'),
      currentSystem: data.get('currentSystem'),
      integrationMethod: data.get('integrationMethod'),
      message: data.get('message'),
      privacyConsent: data.get('privacyConsent') === 'on',
      contactConsent: data.get('contactConsent') === 'on',
      companyUrl: data.get('companyUrl'),
      formStartedAt: startedAt.current,
      locale,
      marketCode,
    }

    try {
      const response = await fetch('/api/business/pilot-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await response.json().catch(() => ({})) as {
        id?: string
        code?: string
        error?: string
      }
      if (!response.ok) {
        if (body.code === 'RATE_LIMITED') throw new Error(copy.rateLimitError)
        if (body.code === 'DUPLICATE_APPLICATION') throw new Error(copy.duplicateError)
        throw new Error(copy.genericError)
      }
      setReference(String(body.id || '').slice(0, 8).toUpperCase())
      form.reset()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : copy.genericError)
    } finally {
      setSubmitting(false)
    }
  }

  if (reference) {
    return (
      <div className="rounded-[8px] border border-[#b7dfc6] bg-[#f0fbf4] p-6 sm:p-8" role="status">
        <CheckCircle2 className="h-8 w-8 text-[#16794a]" aria-hidden="true" />
        <h3 className="mt-5 text-2xl font-semibold text-[#101828]">{copy.successTitle}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#475467]">{copy.successBody}</p>
        <p className="mt-5 text-sm font-semibold text-[#344054]">
          {copy.successReference}: <span className="font-mono">{reference}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setReference('')
            startedAt.current = Date.now()
          }}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[#98a2b3] bg-white px-4 text-sm font-semibold text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff]"
        >
          {copy.sendAnother}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submitApplication} className="rounded-[8px] border border-[#d9e2ef] bg-white p-5 sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#0866ff]">{copy.eyebrow}</p>
        <h3 className="mt-2 text-2xl font-semibold text-[#101828] sm:text-3xl">{copy.title}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">{copy.intro}</p>
      </div>

      <FormSection title={copy.companySection}>
        <Field label={copy.companyName} name="companyName" required />
        <Field label={copy.registrationNumber} name="registrationNumber" />
        <SelectField label={copy.country} name="countryCode" defaultValue={defaultCountry} required>
          {!defaultCountry ? <option value="" disabled>{copy.selectOption}</option> : null}
          {countries.map((country) => <option key={country.value} value={country.value}>{country.label}</option>)}
        </SelectField>
        <Field label={copy.website} name="website" type="url" inputMode="url" required />
      </FormSection>

      <FormSection title={copy.contactSection}>
        <Field label={copy.contactName} name="contactName" required />
        <Field label={copy.contactRole} name="contactRole" />
        <Field label={copy.email} name="email" type="email" inputMode="email" required />
        <Field label={copy.phone} name="phone" type="tel" inputMode="tel" />
      </FormSection>

      <FormSection title={copy.inventorySection}>
        <SelectField label={copy.inventorySize} name="inventorySize" defaultValue="" required>
          <option value="" disabled>{copy.selectOption}</option>
          {copy.inventorySizes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </SelectField>
        <Field label={copy.locationCount} name="locationCount" type="number" inputMode="numeric" min={1} max={10000} required />
        <Field label={copy.currentSystem} name="currentSystem" />
        <SelectField label={copy.integrationMethod} name="integrationMethod" defaultValue="" required>
          <option value="" disabled>{copy.selectOption}</option>
          {copy.integrationMethods.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </SelectField>
        <label className="sm:col-span-2">
          <span className="text-sm font-semibold text-[#344054]">{copy.message}</span>
          <textarea name="message" rows={5} maxLength={3000} className={`${inputClass} mt-2 resize-y`} />
        </label>
      </FormSection>

      <fieldset className="mt-8 border-t border-[#e4eaf3] pt-7">
        <legend className="text-base font-semibold text-[#101828]">{copy.consentSection}</legend>
        <div className="mt-4 grid gap-4">
          <ConsentField name="privacyConsent" required>
            {copy.privacyConsent}{' '}
            <Link href={privacyHref} target="_blank" rel="noreferrer" className="font-semibold text-[#0866ff] hover:underline">
              {copy.privacyLink}
            </Link>
          </ConsentField>
          <ConsentField name="contactConsent" required>{copy.contactConsent}</ConsentField>
        </div>
      </fieldset>

      <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        Company URL
        <input name="companyUrl" tabIndex={-1} autoComplete="off" />
      </label>

      {error ? <p className="mt-6 rounded-[8px] border border-[#f0b9b9] bg-[#fff5f5] px-4 py-3 text-sm text-[#b42318]" role="alert">{error}</p> : null}

      <div className="mt-7 flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs text-[#667085]">{copy.requiredNote}</p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-5 text-sm font-semibold text-white transition hover:bg-[#0057df] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {submitting ? copy.submitting : copy.submit}
        </button>
      </div>
    </form>
  )
}

const inputClass = 'min-h-11 w-full rounded-[8px] border border-[#cfd8e6] bg-white px-3 text-base text-[#101828] outline-none transition focus:border-[#0866ff] focus:ring-2 focus:ring-[#0866ff]/15'

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-8 border-t border-[#e4eaf3] pt-7">
      <legend className="text-base font-semibold text-[#101828]">{title}</legend>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function Field({ label, name, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <label>
      <span className="text-sm font-semibold text-[#344054]">{label}{required ? ' *' : ''}</span>
      <input name={name} required={required} maxLength={220} {...props} className={`${inputClass} mt-2`} />
    </label>
  )
}

function SelectField({ label, name, required, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; name: string }) {
  return (
    <label>
      <span className="text-sm font-semibold text-[#344054]">{label}{required ? ' *' : ''}</span>
      <select name={name} required={required} {...props} className={`${inputClass} mt-2`}>{children}</select>
    </label>
  )
}

function ConsentField({ name, required, children }: { name: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 text-sm leading-6 text-[#475467]">
      <input name={name} type="checkbox" required={required} className="mt-1 h-4 w-4 shrink-0 accent-[#0866ff]" />
      <span>{children}</span>
    </label>
  )
}
