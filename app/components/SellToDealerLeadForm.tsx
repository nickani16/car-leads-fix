'use client'

import { useMemo, useState } from 'react'

export type SellToDealerFormCopy = {
  formTitle: string
  formText: string
  contactTitle: string
  contactNameLabel: string
  contactNamePlaceholder: string
  contactEmailLabel: string
  contactEmailPlaceholder: string
  contactPhoneLabel: string
  contactPhonePlaceholder: string
  vinLabel: string
  vinPlaceholder: string
  makeLabel: string
  makePlaceholder: string
  modelLabel: string
  modelPlaceholder: string
  yearLabel: string
  yearPlaceholder: string
  detailsLabel: string
  detailsPlaceholder: string
  continue: string
  noVin: string
  noVinLink: string
  vinError: string
  manualHelp: string
  contactHelp: string
  detailsHelp: string
  requiredError: string
  submitError: string
  successTitle: string
  successText: string
  sending: string
}

export default function SellToDealerLeadForm({ copy }: { copy: SellToDealerFormCopy }) {
  const [vin, setVin] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [details, setDetails] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const normalizedVin = vin.trim().toUpperCase()
  const vinStarted = normalizedVin.length > 0
  const vinValid = !vinStarted || isValidVin(normalizedVin)
  const manualReady = make.trim().length >= 2 && model.trim().length >= 1 && /^\d{4}$/.test(year.trim())
  const vehicleReady = (vinStarted && vinValid) || manualReady
  const detailsReady = details.trim().length >= 10
  const contactReady = contactName.trim().length >= 2 && isValidEmail(contactEmail) && contactPhone.trim().length >= 6
  const canContinue = vehicleReady && detailsReady && contactReady

  const helper = useMemo(() => {
    if (vinStarted && !vinValid) return copy.vinError
    if (manualMode && !manualReady) return copy.manualHelp
    if (vehicleReady && !detailsReady) return copy.detailsHelp
    if (vehicleReady && detailsReady && !contactReady) return copy.contactHelp
    return ''
  }, [contactReady, copy.contactHelp, copy.detailsHelp, copy.manualHelp, copy.vinError, detailsReady, manualMode, manualReady, vehicleReady, vinStarted, vinValid])

  return (
    <form
      className="w-full rounded-[16px] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.14)]"
      onSubmit={(event) => {
        event.preventDefault()
        if (!canContinue) {
          setManualMode(true)
          return
        }
        setSubmitting(true)
        setSubmitError('')
        fetch('/api/dealer-offer-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vin: normalizedVin,
            make: make.trim(),
            model: model.trim(),
            modelYear: year.trim(),
            details: details.trim(),
            contactName: contactName.trim(),
            contactEmail: contactEmail.trim(),
            contactPhone: contactPhone.trim(),
          }),
        })
          .then(async (response) => {
            if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || copy.submitError)
            setSubmitted(true)
          })
          .catch(() => setSubmitError(copy.submitError))
          .finally(() => setSubmitting(false))
      }}
    >
      <h2 className="text-xl font-semibold tracking-[-.035em]">{copy.formTitle}</h2>
      <p className="mt-2 text-xs leading-5 text-[#667085]">{copy.formText}</p>

      <label className="mt-5 block text-xs font-bold text-[#344054]" htmlFor="dealer-vin">
        {copy.vinLabel}
      </label>
      <input
        id="dealer-vin"
        name="vin"
        className="dealer-lead-input mt-1 h-11 w-full rounded-[12px] border border-[#b9c3d1] px-3 text-sm font-normal text-[#101828] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/12"
        placeholder={copy.vinPlaceholder}
        autoComplete="off"
        maxLength={17}
        value={vin}
        onChange={(event) => {
          setVin(event.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ''))
          setSubmitted(false)
          setSubmitError('')
        }}
      />

      {manualMode ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field
            id="dealer-make"
            label={copy.makeLabel}
            placeholder={copy.makePlaceholder}
            value={make}
            onChange={(value) => {
              setMake(value)
              setSubmitted(false)
              setSubmitError('')
            }}
          />
          <Field
            id="dealer-model"
            label={copy.modelLabel}
            placeholder={copy.modelPlaceholder}
            value={model}
            onChange={(value) => {
              setModel(value)
              setSubmitted(false)
              setSubmitError('')
            }}
          />
          <Field
            id="dealer-year"
            label={copy.yearLabel}
            placeholder={copy.yearPlaceholder}
            value={year}
            onChange={(value) => {
              setYear(value.replace(/\D/g, '').slice(0, 4))
              setSubmitted(false)
              setSubmitError('')
            }}
            inputMode="numeric"
          />
        </div>
      ) : null}

      <label className="mt-4 block text-xs font-bold text-[#344054]" htmlFor="dealer-details">
        {copy.detailsLabel}
      </label>
      <textarea
        id="dealer-details"
        name="details"
        className="dealer-lead-input mt-1 min-h-24 w-full resize-y rounded-[12px] border border-[#b9c3d1] px-3 py-2 text-sm font-normal leading-6 text-[#101828] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/12"
        placeholder={copy.detailsPlaceholder}
        value={details}
        onChange={(event) => {
          setDetails(event.target.value)
          setSubmitted(false)
          setSubmitError('')
        }}
      />

      <div className="mt-4 rounded-[14px] border border-[#d9e2ef] bg-[#f8fbff] p-3">
        <h3 className="text-xs font-bold text-[#344054]">{copy.contactTitle}</h3>
        <div className="mt-3 grid gap-3">
          <Field
            id="dealer-contact-name"
            label={copy.contactNameLabel}
            placeholder={copy.contactNamePlaceholder}
            value={contactName}
            onChange={(value) => {
              setContactName(value)
              setSubmitted(false)
              setSubmitError('')
            }}
          />
          <Field
            id="dealer-contact-email"
            label={copy.contactEmailLabel}
            placeholder={copy.contactEmailPlaceholder}
            value={contactEmail}
            type="email"
            onChange={(value) => {
              setContactEmail(value)
              setSubmitted(false)
              setSubmitError('')
            }}
          />
          <Field
            id="dealer-contact-phone"
            label={copy.contactPhoneLabel}
            placeholder={copy.contactPhonePlaceholder}
            value={contactPhone}
            type="tel"
            onChange={(value) => {
              setContactPhone(value)
              setSubmitted(false)
              setSubmitError('')
            }}
          />
        </div>
      </div>

      {helper ? <p className="mt-3 text-xs font-semibold text-[#b54708]">{helper}</p> : null}
      {submitError ? <p className="mt-3 text-xs font-semibold text-[#b42318]">{submitError}</p> : null}
      {submitted ? (
        <div className="mt-4 rounded-[12px] border border-[#abefc6] bg-[#ecfdf3] px-3 py-3 text-xs leading-5 text-[#067647]">
          <strong className="block">{copy.successTitle}</strong>
          <span>{copy.successText}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#0866ff] px-5 text-sm font-bold text-white transition hover:bg-[#075bea] disabled:cursor-not-allowed disabled:bg-[#98a2b3]"
      >
        {submitting ? copy.sending : copy.continue}
      </button>
      <p className="mt-3 text-center text-xs text-[#667085]">
        {copy.noVin}{' '}
        <button
          type="button"
          className="font-bold text-[#0866ff] underline-offset-4 hover:underline"
          onClick={() => {
            setManualMode(true)
            setSubmitted(false)
            setSubmitError('')
          }}
        >
          {copy.noVinLink}
        </button>
      </p>
      {!vehicleReady && manualMode ? <p className="mt-2 text-center text-xs text-[#667085]">{copy.requiredError}</p> : null}
    </form>
  )
}

function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
  inputMode,
  type = 'text',
}: {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  inputMode?: 'numeric'
  type?: 'text' | 'email' | 'tel'
}) {
  return (
    <label className="block text-xs font-bold text-[#344054]" htmlFor={id}>
      {label}
      <input
        id={id}
        type={type}
        className="dealer-lead-input mt-1 h-11 w-full rounded-[12px] border border-[#b9c3d1] px-3 text-sm font-normal text-[#101828] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/12"
        placeholder={placeholder}
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function isValidVin(value: string) {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(value)
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
