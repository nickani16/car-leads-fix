'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'

type Action = {
  key: string
  label: string
  tone?: 'danger' | 'primary'
  reasonRequired?: boolean
}

const reviewActions: Action[] = [
  { key: 'assign_self', label: 'Tilldela mig' },
  { key: 'under_review', label: 'Starta granskning' },
  { key: 'record_contact', label: 'Registrera kontakt', reasonRequired: true },
  { key: 'add_note', label: 'Lägg till anteckning', reasonRequired: true },
  { key: 'request_information', label: 'Begär komplettering', reasonRequired: true },
  { key: 'technical_review', label: 'Teknisk granskning' },
  { key: 'approve', label: 'Godkänn ansökan', tone: 'primary', reasonRequired: true },
  { key: 'reject', label: 'Avslå', tone: 'danger', reasonRequired: true },
]

const pilotActions: Action[] = [
  { key: 'activate_pilot', label: 'Godkänn och starta pilot', tone: 'primary', reasonRequired: true },
  { key: 'create_program', label: 'Skapa pilotprogram', reasonRequired: true },
  { key: 'record_terms', label: 'Registrera godkända villkor', reasonRequired: true },
  { key: 'start_onboarding', label: 'Starta onboarding', reasonRequired: true },
  { key: 'pilot_paused', label: 'Pausa pilot', reasonRequired: true },
  { key: 'pilot_completed', label: 'Avsluta pilot', reasonRequired: true },
  { key: 'commercial_discussion', label: 'Kommersiell dialog', reasonRequired: true },
  { key: 'commercial_customer', label: 'Separat avtal klart', tone: 'primary', reasonRequired: true },
  { key: 'close', label: 'Stäng ärende', tone: 'danger', reasonRequired: true },
]

export default function BusinessPilotAdminControls({
  applicationId,
  organizationId: initialOrganizationId,
  contactName,
  contactRole,
  hasProgram,
}: {
  applicationId: string
  organizationId?: string | null
  contactName: string
  contactRole?: string | null
  hasProgram: boolean
}) {
  const router = useRouter()
  const [organizationId, setOrganizationId] = useState(initialOrganizationId || '')
  const [reason, setReason] = useState('')
  const [startDate, setStartDate] = useState('')
  const [plannedEndDate, setPlannedEndDate] = useState('')
  const [termsVersion, setTermsVersion] = useState('pilot-2026-08')
  const [acceptedBy, setAcceptedBy] = useState([contactName, contactRole].filter(Boolean).join(', '))
  const [commercialAgreementConfirmed, setCommercialAgreementConfirmed] = useState(false)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')

  async function run(action: Action) {
    if (action.reasonRequired && reason.trim().length < 8) {
      setMessage('Ange en intern anteckning på minst 8 tecken.')
      return
    }
    if (action.key === 'commercial_customer' && !commercialAgreementConfirmed) {
      setMessage('Bekräfta att ett separat kommersiellt avtal har godkänts.')
      return
    }

    setBusy(action.key)
    setMessage('')
    const response = await fetch(`/api/admin/business-pilots/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: action.key,
        reason: reason.trim(),
        organizationId: organizationId.trim() || null,
        startDate: startDate || null,
        plannedEndDate: plannedEndDate || null,
        termsVersion: termsVersion.trim() || null,
        acceptedBy: acceptedBy.trim() || null,
        commercialAgreementConfirmed,
      }),
    })
    const result = await response.json().catch(() => ({})) as { error?: string; organizationId?: string }
    setBusy('')
    if (!response.ok) {
      setMessage(result.error || 'Åtgärden kunde inte genomföras.')
      return
    }
    if (result.organizationId) setOrganizationId(result.organizationId)
    setReason('')
    setMessage('Ändringen är sparad och loggad.')
    router.refresh()
  }

  return (
    <div className="grid gap-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[#344054]">
          Befintligt företags-ID
          <input value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} className={inputClass} placeholder="UUID" />
        </label>
        <div className="flex items-end gap-2">
          <ActionButton action={{ key: 'link_organization', label: 'Länka företag', reasonRequired: true }} busy={busy} onRun={run} />
          <ActionButton action={{ key: 'create_organization', label: 'Skapa företag', reasonRequired: true }} busy={busy} onRun={run} />
        </div>
        <label className="grid gap-2 text-sm font-semibold text-[#344054]">
          Pilotstart
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#344054]">
          Planerat slut
          <input type="date" value={plannedEndDate} onChange={(event) => setPlannedEndDate(event.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#344054]">
          Villkorsversion
          <input value={termsVersion} onChange={(event) => setTermsVersion(event.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#344054]">
          Godkänd av företaget
          <input value={acceptedBy} onChange={(event) => setAcceptedBy(event.target.value)} className={inputClass} placeholder="Namn och roll" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-[#344054]">
        Intern anteckning eller beslutsgrund
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} maxLength={4000} className={`${inputClass} min-h-[112px] resize-y py-3`} />
      </label>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-[#667085]">Ansökan</p>
        <div className="flex flex-wrap gap-2">{reviewActions.map((action) => <ActionButton key={action.key} action={action} busy={busy} onRun={run} />)}</div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-[#667085]">Pilotprogram {hasProgram ? 'skapat' : 'saknas'}</p>
        <div className="flex flex-wrap gap-2">{pilotActions.map((action) => <ActionButton key={action.key} action={action} busy={busy} onRun={run} />)}</div>
      </div>

      <label className="flex items-start gap-3 rounded-[10px] border border-[#f2c94c] bg-[#fffaf0] p-4 text-sm leading-6 text-[#694b16]">
        <input type="checkbox" checked={commercialAgreementConfirmed} onChange={(event) => setCommercialAgreementConfirmed(event.target.checked)} className="mt-1 h-4 w-4" />
        Ett separat kommersiellt avtal har uttryckligen godkänts av företaget. Detta skapar fortfarande ingen betalning eller prenumeration automatiskt.
      </label>

      {message ? <p role="status" className="text-sm font-semibold text-[#475467]">{message}</p> : null}
    </div>
  )
}

function ActionButton({ action, busy, onRun }: { action: Action; busy: string; onRun: (action: Action) => void }) {
  return (
    <button
      type="button"
      disabled={busy !== ''}
      onClick={() => onRun(action)}
      className={`inline-flex min-h-10 items-center gap-2 rounded-[10px] border px-3 text-xs font-bold transition disabled:opacity-50 ${
        action.tone === 'danger'
          ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
          : action.tone === 'primary'
            ? 'border-[#0866ff] bg-[#0866ff] text-white hover:bg-[#075ce6]'
            : 'border-[#d7deea] bg-white text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]'
      }`}
    >
      {busy === action.key ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {action.label}
    </button>
  )
}

const inputClass = 'min-h-11 w-full rounded-[10px] border border-[#d7deea] bg-white px-3 text-sm font-normal text-[#101828] outline-none focus:border-[#0866ff] focus:ring-2 focus:ring-[#dbeafe]'
