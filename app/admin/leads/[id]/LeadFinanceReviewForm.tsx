'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Landmark, Save } from 'lucide-react'

const reviewStatuses = [
  ['not_required', 'No secured finance'],
  ['needs_review', 'Needs finance review'],
  ['settlement_requested', 'Settlement figure requested'],
  ['settlement_received', 'Settlement figure received'],
  ['shortfall_required', 'Seller must cover shortfall'],
  ['ready_to_settle', 'Ready for direct settlement'],
  ['released', 'Finance settled and released'],
  ['blocked', 'Cannot be released'],
] as const

export default function LeadFinanceReviewForm({
  leadId,
  financeStatus,
  provider,
  agreementReference,
  estimatedBalance,
  contactConsent,
  initialReviewStatus,
  initialSettlementAmount,
  initialSettlementValidUntil,
  initialReleaseReference,
  initialNotes,
}: {
  leadId: string
  financeStatus?: string | null
  provider?: string | null
  agreementReference?: string | null
  estimatedBalance?: number | string | null
  contactConsent?: boolean | null
  initialReviewStatus?: string | null
  initialSettlementAmount?: number | string | null
  initialSettlementValidUntil?: string | null
  initialReleaseReference?: string | null
  initialNotes?: string | null
}) {
  const router = useRouter()
  const [reviewStatus, setReviewStatus] = useState(
    initialReviewStatus || 'needs_review'
  )
  const [settlementAmount, setSettlementAmount] = useState(
    initialSettlementAmount === null ||
      initialSettlementAmount === undefined
      ? ''
      : String(initialSettlementAmount)
  )
  const [settlementValidUntil, setSettlementValidUntil] = useState(
    initialSettlementValidUntil || ''
  )
  const [releaseReference, setReleaseReference] = useState(
    initialReleaseReference || ''
  )
  const [notes, setNotes] = useState(initialNotes || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    const response = await fetch(`/api/admin/leads/${leadId}/finance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewStatus,
        settlementAmount,
        settlementValidUntil,
        releaseReference,
        notes,
      }),
    })
    const result = (await response.json()) as { error?: string }

    setMessage(
      response.ok
        ? 'Finance review updated.'
        : result.error || 'Finance review could not be updated.'
    )
    setSaving(false)
    if (response.ok) router.refresh()
  }

  const financeRequired =
    financeStatus === 'vehicle_finance' || financeStatus === 'leasing'

  return (
    <form
      onSubmit={save}
      className={`mb-6 rounded-[20px] border p-6 ${
        financeRequired
          ? 'border-amber-200 bg-amber-50'
          : 'border-[#d9e3e8] bg-[#f5f9fb]'
      }`}
    >
      <div className="flex items-start gap-3">
        <Landmark
          className={`mt-0.5 ${
            financeRequired ? 'text-amber-700' : 'text-[#52768a]'
          }`}
          size={20}
        />
        <div>
          <h2 className="font-semibold">Ownership and finance control</h2>
          <p className="mt-1 text-sm leading-6 text-[#62686c]">
            {financeRequired
              ? 'Do not pay the full seller proceeds directly. Verify the settlement figure and arrange direct payment to the finance provider.'
              : 'The seller has not declared vehicle-secured finance. Ownership and vehicle debt checks are still required before completion.'}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FinanceFact label="Seller declaration" value={financeStatus} />
        <FinanceFact label="Provider" value={provider} />
        <FinanceFact label="Agreement reference" value={agreementReference} />
        <FinanceFact
          label="Estimated balance"
          value={
            estimatedBalance === null || estimatedBalance === undefined
              ? null
              : `${Number(estimatedBalance).toLocaleString('sv-SE')} SEK`
          }
        />
      </dl>

      {financeRequired && !contactConsent ? (
        <p className="mt-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Seller consent to contact the finance provider is missing.
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-2 block text-xs font-medium text-[#52616b]">
            Review status
          </span>
          <select
            value={reviewStatus}
            onChange={(event) => setReviewStatus(event.target.value)}
            className="h-11 w-full rounded-[12px] border border-[#c9dbe5] bg-white px-3 text-sm"
          >
            {reviewStatuses.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium text-[#52616b]">
            Confirmed settlement amount
          </span>
          <input
            type="number"
            min="0"
            value={settlementAmount}
            onChange={(event) => setSettlementAmount(event.target.value)}
            placeholder="SEK"
            className="h-11 w-full rounded-[12px] border border-[#c9dbe5] bg-white px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium text-[#52616b]">
            Settlement valid until
          </span>
          <input
            type="date"
            value={settlementValidUntil}
            onChange={(event) => setSettlementValidUntil(event.target.value)}
            className="h-11 w-full rounded-[12px] border border-[#c9dbe5] bg-white px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium text-[#52616b]">
            Release reference
          </span>
          <input
            value={releaseReference}
            onChange={(event) => setReleaseReference(event.target.value)}
            className="h-11 w-full rounded-[12px] border border-[#c9dbe5] bg-white px-3 text-sm"
          />
        </label>
      </div>
      <label className="mt-3 block">
        <span className="mb-2 block text-xs font-medium text-[#52616b]">
          Internal finance notes
        </span>
        <textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-[12px] border border-[#c9dbe5] bg-white px-3 py-3 text-sm"
        />
      </label>
      {message ? <p className="mt-3 text-xs text-[#52616b]">{message}</p> : null}
      <button
        disabled={saving}
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-[#242424] px-5 text-sm text-white disabled:opacity-50"
      >
        <Save size={15} />
        {saving ? 'Saving...' : 'Save finance review'}
      </button>
    </form>
  )
}

function FinanceFact({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="rounded-[12px] border border-black/5 bg-white/80 p-3">
      <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#858a8c]">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-[#242424]">
        {value || 'Not provided'}
      </dd>
    </div>
  )
}
