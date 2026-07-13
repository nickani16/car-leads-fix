'use client'

import { LoaderCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'

const labels: Record<string, string> = {
  pause: 'Pausa',
  resume: 'Aktivera',
  mark_sold: 'Markera som sålda',
  delete: 'Ta bort',
}
export default function BulkListingActions({ pageItemCount, locale }: { pageItemCount: number; locale: string }) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [selectedCount, setSelectedCount] = useState(0)
  const [action, setAction] = useState('')
  const [pendingAction, setPendingAction] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const swedish = locale === 'sv'

  function selectedInputs() {
    return [...document.querySelectorAll<HTMLInputElement>('input[name="listingId"][form="bulk-listing-form"]:checked')]
  }

  useEffect(() => {
    const updateCount = () => setSelectedCount(selectedInputs().length)
    document.addEventListener('change', updateCount)
    return () => document.removeEventListener('change', updateCount)
  }, [])

  function requestAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    if (!action || !selectedCount) return setMessage(swedish ? 'Välj annonser och en åtgärd.' : 'Select listings and an action.')
    setPendingAction(action)
    dialogRef.current?.showModal()
  }

  async function confirmAction() {
    const listingIds = selectedInputs().map((input) => input.value)
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/account/listings/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: pendingAction, listingIds }),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string }
    setLoading(false)
    if (!response.ok) {
      dialogRef.current?.close()
      return setMessage(result.error || (swedish ? 'Åtgärden kunde inte genomföras.' : 'The action could not be completed.'))
    }
    selectedInputs().forEach((input) => { input.checked = false })
    setSelectedCount(0)
    setAction('')
    dialogRef.current?.close()
    router.refresh()
  }

  function togglePage(checked: boolean) {
    document.querySelectorAll<HTMLInputElement>('input[name="listingId"][form="bulk-listing-form"]').forEach((input) => { input.checked = checked })
    setSelectedCount(checked ? pageItemCount : 0)
  }

  return (
    <>
      <form id="bulk-listing-form" onSubmit={requestAction} className="mt-4 flex flex-col gap-3 rounded-[16px] border border-[#cbd8ea] bg-[#f8fbff] p-3 sm:flex-row sm:items-center">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-[#344054]">
          <input type="checkbox" checked={pageItemCount > 0 && selectedCount === pageItemCount} onChange={(event) => togglePage(event.target.checked)} className="h-4 w-4 rounded accent-[#0866ff]" />
          {swedish ? 'Välj alla på sidan' : 'Select page'}
        </label>
        <span className="text-sm text-[#667085]">{selectedCount} {swedish ? 'valda' : 'selected'}</span>
        <select aria-label={swedish ? 'Bulkåtgärd' : 'Bulk action'} value={action} onChange={(event) => setAction(event.target.value)} className="h-10 rounded-[11px] border border-[#cbd5e1] bg-white px-3 text-sm font-medium outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10 sm:ml-auto">
          <option value="">{swedish ? 'Välj åtgärd' : 'Choose action'}</option>
          <option value="pause">{swedish ? 'Pausa' : 'Pause'}</option>
          <option value="resume">{swedish ? 'Aktivera' : 'Activate'}</option>
          <option value="mark_sold">{swedish ? 'Markera som sålda' : 'Mark as sold'}</option>
          <option value="delete">{swedish ? 'Ta bort' : 'Delete'}</option>
        </select>
        <button type="submit" disabled={!selectedCount || !action} className="h-10 rounded-[11px] bg-[#101828] px-4 text-sm font-semibold text-white outline-none transition hover:bg-[#0866ff] focus-visible:ring-4 focus-visible:ring-[#0866ff]/25 disabled:opacity-40">{swedish ? 'Tillämpa' : 'Apply'}</button>
        {message ? <p role="alert" className="text-sm text-[#b42318] sm:basis-full">{message}</p> : null}
      </form>

      <dialog ref={dialogRef} aria-labelledby="bulk-confirm-title" className="w-[min(92vw,480px)] rounded-[22px] border-0 bg-white p-0 text-[#101828] shadow-2xl backdrop:bg-[#07152d]/55">
        <div className="flex items-start justify-between gap-4 p-6">
          <div><h2 id="bulk-confirm-title" className="text-xl font-semibold">{swedish ? 'Bekräfta bulkåtgärd' : 'Confirm bulk action'}</h2><p className="mt-2 text-sm leading-6 text-[#667085]">{swedish ? `${labels[pendingAction] || 'Åtgärden'} påverkar ${selectedCount} annonser. Status och ägarskap kontrolleras igen på servern innan något ändras.` : `This action affects ${selectedCount} listings. Status and ownership are rechecked on the server.`}</p></div>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label={swedish ? 'Stäng' : 'Close'} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f2f4f7] outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/20"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-[#e4eaf3] p-5 sm:flex-row sm:justify-end"><button type="button" onClick={() => dialogRef.current?.close()} className="h-11 rounded-[12px] border border-[#cbd5e1] px-4 text-sm font-semibold outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/20">{swedish ? 'Avbryt' : 'Cancel'}</button><button type="button" onClick={confirmAction} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#101828] px-4 text-sm font-semibold text-white outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/25 disabled:opacity-50">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{swedish ? 'Bekräfta' : 'Confirm'}</button></div>
      </dialog>
    </>
  )
}
