'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'

type ReviewItem = { id: string; vehicleId: string | null; title: string; status: string }
type SourceView = { inventory_limit: number; parser_profile_id?: string | null; verified_domain?: string | null; website_url?: string | null }

export default function InventoryImportAdminControls({ sourceId, source, reviewItems }: { sourceId: string; source: SourceView; reviewItems: ReviewItem[] }) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [inventoryLimit, setInventoryLimit] = useState(String(source.inventory_limit || 500))
  const [parserProfileId, setParserProfileId] = useState(source.parser_profile_id || '')
  const [profileName, setProfileName] = useState('')
  const [domainPattern, setDomainPattern] = useState(source.verified_domain || hostname(source.website_url) || '')
  const [parserKind, setParserKind] = useState('json_ld')
  const [externalField, setExternalField] = useState('')
  const [targetField, setTargetField] = useState('')
  const [transformKey, setTransformKey] = useState('')
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')

  async function run(action: string, extra: Record<string, unknown> = {}) {
    if (reason.trim().length < 8) { setMessage('Ange en beslutsgrund på minst 8 tecken.'); return }
    setBusy(action); setMessage('')
    const response = await fetch(`/api/admin/inventory-imports/${sourceId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason: reason.trim(), inventoryLimit: Number(inventoryLimit), parserProfileId: parserProfileId.trim() || null, profileName: profileName.trim(), domainPattern: domainPattern.trim(), parserKind, externalField: externalField.trim(), targetField, transformKey: transformKey.trim() || null, ...extra }),
    })
    const result = await response.json().catch(() => ({})) as { error?: string; parserProfileId?: string }
    setBusy('')
    if (!response.ok) { setMessage(result.error || 'Åtgärden kunde inte genomföras.'); return }
    if (result.parserProfileId) setParserProfileId(result.parserProfileId)
    setReason(''); setMessage('Ändringen är sparad och audit-loggad.'); router.refresh()
  }

  return (
    <div className="grid gap-7">
      <label className="grid gap-2 text-sm font-semibold text-[#344054]">Beslutsgrund<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} maxLength={4000} className={`${inputClass} min-h-[96px] resize-y py-3`} /></label>

      <div><p className={groupLabel}>Källa och synk</p><div className="flex flex-wrap gap-2"><ActionButton label="Pausa" action="pause" busy={busy} onRun={run} /><ActionButton label="Återuppta" action="resume" busy={busy} onRun={run} /><ActionButton label="Starta analys" action="start_analysis" busy={busy} onRun={run} /><ActionButton label="Starta synk" action="start_sync" busy={busy} onRun={run} primary /><ActionButton label="Verifiera domän manuellt" action="manual_verify_domain" busy={busy} onRun={run} /><ActionButton label="Stoppa hela importen" action="stop" busy={busy} onRun={run} danger /></div></div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]"><label className="grid gap-2 text-sm font-semibold text-[#344054]">Importgräns<input type="number" min="1" max="1000000" value={inventoryLimit} onChange={(event) => setInventoryLimit(event.target.value)} className={inputClass} /></label><div className="flex items-end"><ActionButton label="Spara gräns" action="set_limit" busy={busy} onRun={run} /></div></div>

      <div><p className={groupLabel}>Parserprofil</p><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-[#344054]">Befintligt profil-ID<input value={parserProfileId} onChange={(event) => setParserProfileId(event.target.value)} className={inputClass} placeholder="UUID" /></label><div className="flex items-end"><ActionButton label="Koppla profil" action="link_parser_profile" busy={busy} onRun={run} /></div><label className="grid gap-2 text-sm font-semibold text-[#344054]">Namn<input value={profileName} onChange={(event) => setProfileName(event.target.value)} className={inputClass} /></label><label className="grid gap-2 text-sm font-semibold text-[#344054]">Domänmönster<input value={domainPattern} onChange={(event) => setDomainPattern(event.target.value)} className={inputClass} /></label><label className="grid gap-2 text-sm font-semibold text-[#344054]">Parsertyp<select value={parserKind} onChange={(event) => setParserKind(event.target.value)} className={inputClass}><option value="json_ld">JSON-LD</option><option value="domain_adapter">Domänadapter</option><option value="generic_html">Generisk HTML</option></select></label><div className="flex items-end"><ActionButton label="Skapa och koppla" action="create_parser_profile" busy={busy} onRun={run} /></div></div></div>

      <div><p className={groupLabel}>Fältmappning</p><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-[#344054]">Källfält<input value={externalField} onChange={(event) => setExternalField(event.target.value)} className={inputClass} placeholder="vehicle.price" /></label><label className="grid gap-2 text-sm font-semibold text-[#344054]">Autorell-fält<select value={targetField} onChange={(event) => setTargetField(event.target.value)} className={inputClass}><option value="">Välj fält</option>{['title','make','model','variant','model_year','price','currency','mileage_km','fuel','transmission','body_type','color','description','city','region','country_code'].map((field) => <option key={field} value={field}>{field}</option>)}</select></label><label className="grid gap-2 text-sm font-semibold text-[#344054]">Transform<input value={transformKey} onChange={(event) => setTransformKey(event.target.value)} className={inputClass} placeholder="Valfri registrerad transform" /></label><div className="flex items-end"><ActionButton label="Spara mappning" action="upsert_mapping" busy={busy} onRun={run} /></div></div></div>

      {reviewItems.length ? <div><p className={groupLabel}>Granskningskö</p><div className="grid gap-3">{reviewItems.map((item) => <article key={item.id} className="border-b border-[#e4e7ec] pb-3 text-sm"><p className="font-semibold text-[#101828]">{item.title}</p><p className="mt-1 text-xs text-[#667085]">{item.status}</p><div className="mt-3 flex flex-wrap gap-2"><ActionButton label="Godkänn data" action={`approve-${item.id}`} busy={busy} onRun={() => run('review_item', { itemId: item.id, decision: 'approve' })} /><ActionButton label="Avvisa" action={`reject-${item.id}`} busy={busy} onRun={() => run('review_item', { itemId: item.id, decision: 'reject' })} danger />{item.vehicleId ? <ActionButton label="Avpublicera annons" action={`unpublish-${item.id}`} busy={busy} onRun={() => run('unpublish_item', { itemId: item.id })} danger /> : null}</div></article>)}</div></div> : null}
      {message ? <p role="status" className="text-sm font-semibold text-[#475467]">{message}</p> : null}
    </div>
  )
}

function ActionButton({ label, action, busy, onRun, primary, danger }: { label: string; action: string; busy: string; onRun: (action: string) => void; primary?: boolean; danger?: boolean }) {
  return <button type="button" disabled={busy !== ''} onClick={() => onRun(action)} className={`inline-flex min-h-10 items-center gap-2 rounded-[8px] border px-3 text-xs font-bold disabled:opacity-45 ${danger ? 'border-red-200 bg-red-50 text-red-700' : primary ? 'border-[#0866ff] bg-[#0866ff] text-white' : 'border-[#d7deea] bg-white text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]'}`}>{busy === action ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{label}</button>
}

function hostname(value?: string | null) { try { return value ? new URL(value).hostname : '' } catch { return '' } }
const groupLabel = 'mb-3 text-xs font-semibold uppercase tracking-[.12em] text-[#667085]'
const inputClass = 'min-h-11 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-sm font-normal text-[#101828] outline-none focus:border-[#0866ff] focus:ring-2 focus:ring-[#dbeafe]'
