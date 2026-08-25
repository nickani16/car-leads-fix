'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  CirclePlay,
  Database,
  Eye,
  FileSpreadsheet,
  Globe2,
  LoaderCircle,
  Plus,
  RefreshCw,
  ServerCog,
  Trash2,
  X,
} from 'lucide-react'
import type { InventoryImportCopy, InventoryMethod } from '@/lib/inventory-import-i18n'

export type InventorySourceView = {
  id: string
  name: string
  source_type: InventoryMethod
  website_url: string | null
  inventory_url: string | null
  feed_url: string | null
  verified_domain: string | null
  verification_status: string
  sync_status: string
  sync_interval_hours: number
  discovered_count: number
  imported_count: number
  published_count: number
  review_count: number
  error_count: number
  last_success_at: string | null
  next_sync_at: string | null
  last_error: string | null
}

type PreviewItem = {
  id: string
  source_url: string | null
  sync_status: string
  normalized_payload: Record<string, unknown>
  parse_confidence: number | null
  warnings: unknown[]
}

type ImportRunView = {
  id: string
  status: string
  parsed_count: number
}

export default function InventorySourcesClient({
  copy,
  sources,
  metrics,
  pilot,
}: {
  copy: InventoryImportCopy
  sources: InventorySourceView[]
  metrics: Array<string | number>
  pilot: { active: boolean; startDate: string | null; plannedEndDate: string | null }
}) {
  const router = useRouter()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<InventorySourceView | null>(null)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')

  async function sourceAction(source: InventorySourceView, action: string) {
    if (action === 'delete' && !window.confirm(copy.wizard.deleteConfirm)) return
    setBusy(`${source.id}:${action}`)
    setMessage('')
    const response = await fetch(`/api/account/company/inventory-sources/${source.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, idempotencyKey: crypto.randomUUID() }),
    })
    const result = await response.json().catch(() => ({})) as { error?: string }
    setBusy('')
    if (!response.ok) {
      setMessage(localizedInventoryError(copy, result.error))
      return
    }
    router.refresh()
  }

  function openSource(source: InventorySourceView) {
    setSelectedSource(source)
    setWizardOpen(true)
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {copy.portal.metrics.map((label, index) => (
          <article key={label} className="min-h-[126px] rounded-[8px] border border-[#d9e2ef] bg-white p-5 shadow-[0_10px_26px_rgba(16,24,40,.04)]">
            <p className="text-xs font-semibold leading-5 text-[#667085]">{label}</p>
            <p className="mt-3 break-words text-2xl font-semibold text-[#101828]">{String(metrics[index] ?? '-')}</p>
          </article>
        ))}
      </div>

      <section className="mt-5 flex flex-col gap-3 border-y border-[#cbd8e8] bg-[#edf5ff] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-white text-[#0866ff]"><RefreshCw className="h-5 w-5" aria-hidden="true" /></span>
          <div><p className="font-semibold text-[#101828]">{copy.portal.pilotActive}: {pilot.active ? copy.portal.statuses.active : copy.portal.statuses.pending}</p><p className="mt-1 text-sm text-[#475467]">{copy.portal.noAutomaticPayment}</p></div>
        </div>
        <button type="button" onClick={() => { setSelectedSource(null); setWizardOpen(true) }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-4 text-sm font-semibold text-white hover:bg-[#075ce6]">
          <Plus className="h-4 w-4" aria-hidden="true" />{copy.portal.addSource}
        </button>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-xl font-semibold text-[#101828]">{copy.portal.sourcesTitle}</h2></div>
        {!sources.length ? (
          <div className="border-y border-dashed border-[#b8c5d6] py-12 text-center text-sm text-[#667085]">{copy.portal.noSources}</div>
        ) : (
          <div className="grid gap-4">
            {sources.map((source) => (
              <article key={source.id} className="rounded-[8px] border border-[#d9e2ef] bg-white p-5 shadow-[0_10px_26px_rgba(16,24,40,.04)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-[#101828]">{source.name}</h3>
                      <StatusBadge label={copy.portal.statuses[source.sync_status] || copy.portal.statuses.error} status={source.sync_status} />
                      <StatusBadge label={copy.portal.statuses[source.verification_status] || copy.portal.statuses.error} status={source.verification_status} />
                    </div>
                    <p className="mt-2 break-all text-sm text-[#667085]">{source.inventory_url || source.website_url || source.feed_url || inventoryMethodLabel(copy, source.source_type)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <IconButton title={copy.portal.actions[0]} onClick={() => openSource(source)} icon={Eye} />
                    <IconButton title={copy.portal.actions[1]} onClick={() => void sourceAction(source, 'start_sync')} icon={RefreshCw} busy={busy === `${source.id}:start_sync`} />
                    {source.sync_status === 'paused' ? <IconButton title={copy.portal.actions[3]} onClick={() => void sourceAction(source, 'resume')} icon={CirclePlay} busy={busy === `${source.id}:resume`} /> : <IconButton title={copy.portal.actions[2]} onClick={() => void sourceAction(source, 'pause')} icon={CirclePause} busy={busy === `${source.id}:pause`} />}
                    <IconButton title={copy.portal.actions[6]} onClick={() => void sourceAction(source, 'delete')} icon={Trash2} danger busy={busy === `${source.id}:delete`} />
                  </div>
                </div>
                <dl className="mt-5 grid gap-px overflow-hidden rounded-[8px] border border-[#e1e7ef] bg-[#e1e7ef] sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    [copy.portal.sourceLabels[0], inventoryMethodLabel(copy, source.source_type)],
                    [copy.portal.sourceLabels[4], source.discovered_count],
                    [copy.portal.sourceLabels[5], source.published_count],
                    [copy.portal.sourceLabels[6], formatDate(source.last_success_at)],
                    [copy.portal.sourceLabels[7], formatDate(source.next_sync_at)],
                    [copy.portal.sourceLabels[8], source.error_count],
                  ].map(([label, value]) => <div key={String(label)} className="bg-[#f8fafc] p-3"><dt className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#667085]">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-[#344054]">{String(value)}</dd></div>)}
                </dl>
                {source.last_error ? <p className="mt-4 flex items-start gap-2 text-sm text-[#b42318]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{localizedInventoryError(copy, source.last_error)}</p> : null}
              </article>
            ))}
          </div>
        )}
        {message ? <p role="alert" className="mt-4 text-sm font-semibold text-[#b42318]">{message}</p> : null}
      </section>

      {wizardOpen ? <SourceWizard copy={copy} initialSource={selectedSource} onClose={() => { setWizardOpen(false); setSelectedSource(null); router.refresh() }} /> : null}
    </>
  )
}

function SourceWizard({ copy, initialSource, onClose }: { copy: InventoryImportCopy; initialSource: InventorySourceView | null; onClose: () => void }) {
  const [step, setStep] = useState(initialSource ? initialSource.source_type === 'website' && initialSource.verification_status !== 'verified' ? 2 : 4 : 0)
  const [method, setMethod] = useState<InventoryMethod>(initialSource?.source_type || 'website')
  const [source, setSource] = useState<InventorySourceView | null>(initialSource)
  const [preview, setPreview] = useState<PreviewItem[]>([])
  const [verificationToken, setVerificationToken] = useState('')
  const [analysisPending, setAnalysisPending] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [details, setDetails] = useState({ name: initialSource?.name || '', websiteUrl: initialSource?.website_url || '', inventoryUrl: initialSource?.inventory_url || '', feedUrl: initialSource?.feed_url || '', documentationUrl: '', syncIntervalHours: '24', provider: '', technicalContact: '', authenticationMethod: 'none', allowedSubdomains: '' })
  const [verificationMethod, setVerificationMethod] = useState('meta_tag')
  const [consents, setConsents] = useState([false, false, false, false, false])
  const methods = copy.publicPage.methods
  const methodIcons = { website: Globe2, xml: Database, csv: FileSpreadsheet, api: ServerCog, dms: ServerCog }

  const canContinueDetails = details.name.trim().length >= 2 && (
    method === 'website' ? Boolean(details.websiteUrl.trim())
      : method === 'xml' ? Boolean(details.feedUrl.trim())
        : method === 'api' ? Boolean(details.websiteUrl.trim() && details.documentationUrl.trim())
          : method === 'dms' ? Boolean(details.provider.trim() && details.technicalContact.trim())
            : true
  )
  const currentTitle = success ? copy.wizard.title : [copy.wizard.methodTitle, copy.wizard.detailsTitle, copy.wizard.verificationTitle, copy.wizard.analysisTitle, copy.wizard.previewTitle, copy.wizard.approvalTitle][step]

  async function createSource() {
    setBusy('create'); setError('')
    const response = await fetch('/api/account/company/inventory-sources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceType: method, ...details, verificationMethod }) })
    const result = await response.json().catch(() => ({})) as { error?: string; source?: InventorySourceView; verificationToken?: string }
    setBusy('')
    if (!response.ok || !result.source) { setError(localizedInventoryError(copy, result.error)); return }
    setSource(result.source); setVerificationToken(result.verificationToken || '')
    if (method === 'dms') { setStep(-1); setSuccess(copy.wizard.onboardingSuccess); return }
    setStep(method === 'website' ? 2 : 3)
  }

  async function action(actionName: string, extra: Record<string, unknown> = {}) {
    if (!source) return null
    setBusy(actionName); setError(''); setSuccess('')
    const response = await fetch(`/api/account/company/inventory-sources/${source.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: actionName, idempotencyKey: crypto.randomUUID(), verificationMethod, ...extra }) })
    const result = await response.json().catch(() => ({})) as { error?: string; source?: InventorySourceView; verificationToken?: string; runId?: string }
    setBusy('')
    if (!response.ok) { setError(localizedInventoryError(copy, result.error)); return null }
    if (result.source) setSource(result.source)
    if (result.verificationToken) setVerificationToken(result.verificationToken)
    return result
  }

  async function loadPreview() {
    if (!source) return
    setBusy('preview'); setError('')
    const response = await fetch(`/api/account/company/inventory-sources/${source.id}`)
    const result = await response.json().catch(() => ({})) as { error?: string; source?: InventorySourceView; items?: PreviewItem[]; runs?: ImportRunView[] }
    setBusy('')
    if (!response.ok) { setError(localizedInventoryError(copy, result.error)); return null }
    if (result.source) setSource(result.source)
    const items = result.items || []
    setPreview(items)
    return { items, runs: result.runs || [] }
  }

  async function waitForPreview() {
    if (!source) return
    setAnalysisPending(true)
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const result = await loadPreview()
      if (!result) break
      const latest = result.runs[0]
      if (result.items.length && latest && ['completed', 'completed_with_warnings'].includes(latest.status)) {
        setAnalysisPending(false)
        setStep(5)
        return
      }
      if (latest && ['failed', 'cancelled'].includes(latest.status)) break
      await new Promise((resolve) => window.setTimeout(resolve, 2000))
    }
    setAnalysisPending(false)
  }

  async function waitForVerification() {
    if (!source) return
    setBusy('check_verification')
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const response = await fetch(`/api/account/company/inventory-sources/${source.id}`)
      const result = await response.json().catch(() => ({})) as { error?: string; source?: InventorySourceView; runs?: ImportRunView[] }
      if (!response.ok) {
        setBusy('')
        setError(localizedInventoryError(copy, result.error))
        return
      }
      if (result.source) setSource(result.source)
      if (result.source?.verification_status === 'verified') {
        setBusy('')
        setStep(3)
        return
      }
      if (result.runs?.[0] && ['completed', 'completed_with_warnings', 'failed', 'cancelled'].includes(result.runs[0].status)) break
      await new Promise((resolve) => window.setTimeout(resolve, 1500))
    }
    setBusy('')
    setError(copy.errors.verification)
  }

  async function next() {
    if (step === 0) return setStep(1)
    if (step === 1) return void createSource()
    if (step === 2) {
      if (!verificationToken) {
        await action('rotate_verification_token')
        return
      }
      const result = await action('check_verification')
      if (result) await waitForVerification()
      return
    }
    if (step === 3) { const result = await action('start_analysis'); if (result) { setStep(4); void waitForPreview() }; return }
    if (step === 4) { const result = await loadPreview(); if (result?.items.length && result.runs[0] && ['completed', 'completed_with_warnings'].includes(result.runs[0].status)) setStep(5); return }
    if (step === 5) {
      const result = await action('approve', { consents })
      if (result) { setStep(-1); setSuccess(copy.wizard.success) }
    }
  }

  const verificationInstruction = source?.verified_domain
    ? verificationInstructionFor(verificationMethod, source.verified_domain, verificationToken)
    : ''

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-[#0f172a]/55 p-3 sm:p-6">
      <section role="dialog" aria-modal="true" aria-labelledby="source-wizard-title" className="mx-auto w-full max-w-[980px] rounded-[8px] bg-white shadow-[0_28px_80px_rgba(15,23,42,.3)]">
        <header className="flex items-start justify-between gap-4 border-b border-[#e4e7ec] p-5 sm:p-6">
          <div><h2 id="source-wizard-title" className="text-2xl font-semibold text-[#101828]">{copy.wizard.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">{copy.wizard.intro}</p></div>
          <button type="button" title={copy.wizard.close} onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-[#f2f4f7]"><X className="h-5 w-5" /><span className="sr-only">{copy.wizard.close}</span></button>
        </header>

        <ol className="grid grid-cols-3 border-b border-[#e4e7ec] sm:grid-cols-6">
          {copy.wizard.steps.map((label, index) => <li key={label} className={`min-w-0 border-b-2 px-2 py-3 text-center text-[11px] font-semibold sm:text-xs ${index === step ? 'border-[#0866ff] text-[#0866ff]' : index < step ? 'border-[#98a2b3] text-[#475467]' : 'border-transparent text-[#98a2b3]'}`}>{label}</li>)}
        </ol>

        <div className="min-h-[390px] p-5 sm:p-7">
          <h3 className="text-xl font-semibold text-[#101828]">{currentTitle}</h3>

          {step === 0 ? <div className="mt-5 divide-y divide-[#e4e7ec] border-y border-[#e4e7ec]">{methods.map((item) => { const Icon = methodIcons[item.key]; const selectable = item.selectable !== false; return <label key={item.key} className={`flex items-start gap-4 py-4 ${selectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}><input type="radio" name="source-method" value={item.key} checked={method === item.key} disabled={!selectable} onChange={() => setMethod(item.key)} className="mt-2 h-4 w-4 accent-[#0866ff]" /><Icon className="mt-1 h-5 w-5 shrink-0 text-[#0866ff]" /><span><span className="flex flex-wrap items-center gap-2"><strong className="text-sm text-[#101828]">{item.title}</strong>{item.status ? <span className="rounded-full border border-[#cddcf2] bg-[#f4f8ff] px-2 py-0.5 text-[10px] font-semibold text-[#315f8f]">{item.status}</span> : null}</span><span className="mt-1 block text-sm leading-6 text-[#667085]">{item.text}</span></span></label> })}</div> : null}

          {step === 1 ? <div className="mt-5 grid gap-5 sm:grid-cols-2"><TextField label={copy.wizard.fields[0]} value={details.name} onChange={(name) => setDetails({ ...details, name })} required /><TextField label={copy.wizard.fields[5]} value={details.syncIntervalHours} onChange={(syncIntervalHours) => setDetails({ ...details, syncIntervalHours })} type="number" />{method === 'website' ? <><TextField label={copy.wizard.fields[1]} value={details.websiteUrl} onChange={(websiteUrl) => setDetails({ ...details, websiteUrl })} required /><TextField label={copy.wizard.fields[2]} value={details.inventoryUrl} onChange={(inventoryUrl) => setDetails({ ...details, inventoryUrl })} /><TextField label={copy.wizard.fields[9]} value={details.allowedSubdomains} onChange={(allowedSubdomains) => setDetails({ ...details, allowedSubdomains })} /></> : null}{method === 'xml' ? <TextField label={copy.wizard.fields[3]} value={details.feedUrl} onChange={(feedUrl) => setDetails({ ...details, feedUrl })} required /> : null}{method === 'api' ? <><TextField label={copy.wizard.fields[1]} value={details.websiteUrl} onChange={(websiteUrl) => setDetails({ ...details, websiteUrl })} required /><TextField label={copy.wizard.fields[4]} value={details.documentationUrl} onChange={(documentationUrl) => setDetails({ ...details, documentationUrl })} required /><TextField label={copy.wizard.fields[8]} value={details.authenticationMethod} onChange={(authenticationMethod) => setDetails({ ...details, authenticationMethod })} /></> : null}{method === 'dms' ? <><TextField label={copy.wizard.fields[6]} value={details.provider} onChange={(provider) => setDetails({ ...details, provider })} required /><TextField label={copy.wizard.fields[7]} value={details.technicalContact} onChange={(technicalContact) => setDetails({ ...details, technicalContact })} required /><TextField label={copy.wizard.fields[4]} value={details.documentationUrl} onChange={(documentationUrl) => setDetails({ ...details, documentationUrl })} /></> : null}</div> : null}

          {step === 2 ? <div className="mt-5"><p className="text-sm leading-6 text-[#667085]">{copy.wizard.verificationIntro}</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{copy.wizard.verificationMethods.map((label, index) => { const value = ['dns', 'html_file', 'meta_tag', 'manual_admin'][index]; return <label key={value} className="flex items-center gap-3 border-b border-[#e4e7ec] py-3 text-sm font-semibold"><input type="radio" checked={verificationMethod === value} onChange={() => setVerificationMethod(value)} className="h-4 w-4 accent-[#0866ff]" />{label}</label> })}</div>{verificationInstruction ? <pre className="mt-5 overflow-x-auto rounded-[8px] border border-[#d0d5dd] bg-[#f8fafc] p-4 text-xs text-[#344054]">{verificationInstruction}</pre> : null}</div> : null}

          {step === 3 ? <div className="mt-5"><p className="text-sm leading-6 text-[#667085]">{copy.wizard.analysisIntro}</p><ul className="mt-5 grid gap-px overflow-hidden rounded-[8px] border border-[#e4e7ec] bg-[#e4e7ec] sm:grid-cols-2">{copy.wizard.analysisChecks.map((check, index) => <li key={check} className="flex items-center gap-3 bg-[#f8fafc] p-4 text-sm font-semibold text-[#344054]"><span className={`grid h-6 w-6 place-items-center rounded-full ${index === 0 && source?.verification_status === 'verified' ? 'bg-[#eaf7ef] text-[#16794a]' : 'bg-white text-[#98a2b3]'}`}>{index === 0 && source?.verification_status === 'verified' ? <Check className="h-4 w-4" /> : '–'}</span>{check}</li>)}</ul></div> : null}

          {step === 4 ? <div className="mt-5"><p className="text-sm leading-6 text-[#667085]">{copy.wizard.previewIntro}</p>{analysisPending ? <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#315f8f]"><LoaderCircle className="h-4 w-4 animate-spin" />{copy.wizard.analysisQueued}</p> : null}{busy === 'preview' && !analysisPending ? <LoaderCircle className="mt-6 h-6 w-6 animate-spin text-[#0866ff]" /> : preview.length ? <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-[#d0d5dd] text-xs text-[#667085]"><tr><th className="py-3 pr-4">#</th>{copy.wizard.previewColumns.map((column, index) => <th key={column} className={index < copy.wizard.previewColumns.length - 1 ? 'py-3 pr-4' : 'py-3'}>{column}</th>)}</tr></thead><tbody className="divide-y divide-[#e4e7ec]">{preview.slice(0, 10).map((item, index) => <tr key={item.id}><td className="py-3 pr-4">{index + 1}</td><td className="py-3 pr-4 font-semibold">{String(item.normalized_payload.title || item.normalized_payload.name || item.source_url || '-')}</td><td className="py-3 pr-4">{String(item.normalized_payload.price || '-')}</td><td className="py-3 pr-4">{item.parse_confidence == null ? '-' : `${Math.round(item.parse_confidence * 100)}%`}</td><td className="py-3">{copy.portal.statuses[item.sync_status] || copy.portal.statuses.error}</td></tr>)}</tbody></table></div> : <p className="mt-6 border-y border-dashed border-[#b8c5d6] py-10 text-center text-sm text-[#667085]">{copy.wizard.previewEmpty}</p>}</div> : null}

          {step === 5 ? <div className="mt-5"><p className="text-sm leading-6 text-[#667085]">{copy.wizard.approvalIntro}</p><div className="mt-5 grid gap-4">{copy.wizard.consents.map((consent, index) => <label key={consent} className="flex items-start gap-3 text-sm leading-6 text-[#344054]"><input type="checkbox" checked={consents[index]} onChange={(event) => setConsents(consents.map((value, itemIndex) => itemIndex === index ? event.target.checked : value))} className="mt-1 h-4 w-4 accent-[#0866ff]" />{consent}</label>)}</div></div> : null}

          {error ? <p role="alert" className="mt-5 rounded-[8px] border border-[#f4b8b8] bg-[#fff5f5] p-3 text-sm text-[#b42318]">{error}</p> : null}
          {success ? <p role="status" className="mt-5 rounded-[8px] border border-[#b7dfc6] bg-[#f0fbf4] p-3 text-sm font-semibold text-[#16794a]">{success}</p> : null}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-[#e4e7ec] p-5 sm:px-7">
          {success ? <span /> : <button type="button" disabled={step === 0 || busy !== ''} onClick={() => setStep((current) => Math.max(0, current - 1))} className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[#d0d5dd] px-4 text-sm font-semibold text-[#344054] disabled:opacity-40"><ChevronLeft className="h-4 w-4" />{copy.wizard.back}</button>}
          {success ? <button type="button" onClick={onClose} className="min-h-11 rounded-[8px] bg-[#0866ff] px-5 text-sm font-semibold text-white">{copy.wizard.close}</button> : <button type="button" disabled={busy !== '' || analysisPending || step === 1 && !canContinueDetails || step === 5 && !consents.every(Boolean)} onClick={() => void next()} className="inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-[#0866ff] px-5 text-sm font-semibold text-white disabled:opacity-45">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{step === 1 ? copy.wizard.saveSource : step === 2 ? verificationToken ? copy.wizard.verify : copy.wizard.generateVerificationToken : step === 3 ? copy.wizard.startAnalysis : step === 5 ? copy.wizard.approve : copy.wizard.next}{!busy && step < 5 ? <ChevronRight className="h-4 w-4" /> : null}</button>}
        </footer>
      </section>
    </div>
  )
}

function verificationInstructionFor(method: string, domain: string, token: string) {
  if (!token) return ''
  if (method === 'dns') return `_autorell-verification.${domain} TXT ${token}`
  if (method === 'html_file') return `https://${domain}/.well-known/autorell-verification.txt → ${token}`
  if (method === 'meta_tag') return `<meta name="autorell-site-verification" content="${token}">`
  return ''
}

function TextField({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-semibold text-[#344054]">{label}{required ? ' *' : ''}<input type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-[8px] border border-[#cfd8e6] px-3 text-base font-normal outline-none focus:border-[#0866ff] focus:ring-2 focus:ring-[#dbeafe]" /></label>
}

function IconButton({ title, icon: Icon, onClick, busy = false, danger = false }: { title: string; icon: typeof Eye; onClick: () => void; busy?: boolean; danger?: boolean }) {
  return <button type="button" title={title} aria-label={title} onClick={onClick} disabled={busy} className={`grid h-10 w-10 place-items-center rounded-[8px] border transition ${danger ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-[#d0d5dd] text-[#475467] hover:border-[#0866ff] hover:text-[#0866ff]'}`}>{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}</button>
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  const tone = ['active', 'verified', 'ready'].includes(status) ? 'border-[#b7dfc6] bg-[#f0fbf4] text-[#16794a]' : ['error', 'failed'].includes(status) ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#cddcf2] bg-[#f4f8ff] text-[#315f8f]'
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>{label}</span>
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : '-'
}

function inventoryMethodLabel(copy: InventoryImportCopy, method: InventoryMethod) {
  return copy.publicPage.methods.find((item) => item.key === method)?.title || copy.portal.sourceLabels[0]
}

function localizedInventoryError(copy: InventoryImportCopy, value?: string | null) {
  const code = String(value || '').toUpperCase()
  if (/RATE_LIMIT/.test(code)) return copy.errors.rateLimited
  if (/MANAGER|PERMISSION|UNAUTHORIZED/.test(code)) return copy.errors.permission
  if (/CONSENT|APPROVAL|PILOT_TERMS|PREVIEW/.test(code)) return copy.errors.approval
  if (/VERIF|PENDING_VERIFICATION/.test(code)) return copy.errors.verification
  if (/URL|DOMAIN|SOURCE_DETAILS|WEBSITE_URL|FEED_URL|DMS_PROVIDER/.test(code)) return copy.errors.details
  if (/FEATURE|METHOD|ADAPTER/.test(code)) return copy.errors.unavailable
  if (/SOURCE|IMPORT|SYNC|HTTP|TIMEOUT|DNS|ROBOTS|IMAGE/.test(code)) return copy.errors.sourceProblem
  return copy.wizard.genericError
}
