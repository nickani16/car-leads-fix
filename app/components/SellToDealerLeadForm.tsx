'use client'

import { useMemo, useState } from 'react'

export type SellToDealerFormCopy = {
  formTitle: string
  formText: string
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
  requiredError: string
  readyTitle: string
  readyText: string
}

export default function SellToDealerLeadForm({ copy }: { copy: SellToDealerFormCopy }) {
  const [vin, setVin] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [details, setDetails] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const normalizedVin = vin.trim().toUpperCase()
  const vinStarted = normalizedVin.length > 0
  const vinValid = !vinStarted || isValidVin(normalizedVin)
  const manualReady = make.trim().length >= 2 && model.trim().length >= 1 && /^\d{4}$/.test(year.trim())
  const canContinue = (vinStarted && vinValid) || manualReady

  const helper = useMemo(() => {
    if (vinStarted && !vinValid) return copy.vinError
    if (manualMode && !manualReady) return copy.manualHelp
    return ''
  }, [copy.manualHelp, copy.vinError, manualMode, manualReady, vinStarted, vinValid])

  return (
    <form
      className="w-full rounded-[4px] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.14)]"
      onSubmit={(event) => {
        event.preventDefault()
        if (!canContinue) {
          setManualMode(true)
          return
        }
        setSubmitted(true)
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
        className="mt-1 h-11 w-full rounded-[4px] border border-[#b9c3d1] px-3 text-sm text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/12"
        placeholder={copy.vinPlaceholder}
        autoComplete="off"
        maxLength={17}
        value={vin}
        onChange={(event) => {
          setVin(event.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ''))
          setSubmitted(false)
        }}
      />

      {manualMode ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field
            id="dealer-make"
            label={copy.makeLabel}
            placeholder={copy.makePlaceholder}
            value={make}
            onChange={setMake}
          />
          <Field
            id="dealer-model"
            label={copy.modelLabel}
            placeholder={copy.modelPlaceholder}
            value={model}
            onChange={setModel}
          />
          <Field
            id="dealer-year"
            label={copy.yearLabel}
            placeholder={copy.yearPlaceholder}
            value={year}
            onChange={(value) => setYear(value.replace(/\D/g, '').slice(0, 4))}
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
        className="mt-1 min-h-24 w-full resize-y rounded-[4px] border border-[#b9c3d1] px-3 py-2 text-sm leading-6 text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/12"
        placeholder={copy.detailsPlaceholder}
        value={details}
        onChange={(event) => {
          setDetails(event.target.value)
          setSubmitted(false)
        }}
      />

      {helper ? <p className="mt-3 text-xs font-semibold text-[#b54708]">{helper}</p> : null}
      {submitted ? (
        <div className="mt-4 rounded-[4px] border border-[#abefc6] bg-[#ecfdf3] px-3 py-3 text-xs leading-5 text-[#067647]">
          <strong className="block">{copy.readyTitle}</strong>
          <span>{copy.readyText}</span>
        </div>
      ) : null}

      <button
        type="submit"
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#0866ff] px-5 text-sm font-bold text-white transition hover:bg-[#075bea] disabled:cursor-not-allowed disabled:bg-[#98a2b3]"
      >
        {copy.continue}
      </button>
      <p className="mt-3 text-center text-xs text-[#667085]">
        {copy.noVin}{' '}
        <button
          type="button"
          className="font-bold text-[#0866ff] underline-offset-4 hover:underline"
          onClick={() => setManualMode(true)}
        >
          {copy.noVinLink}
        </button>
      </p>
      {!canContinue && manualMode ? <p className="mt-2 text-center text-xs text-[#667085]">{copy.requiredError}</p> : null}
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
}: {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  inputMode?: 'numeric'
}) {
  return (
    <label className="block text-xs font-bold text-[#344054]" htmlFor={id}>
      {label}
      <input
        id={id}
        className="mt-1 h-11 w-full rounded-[4px] border border-[#b9c3d1] px-3 text-sm text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/12"
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
