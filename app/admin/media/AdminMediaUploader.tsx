'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Upload } from 'lucide-react'

export default function AdminMediaUploader({ enabled }: { enabled: boolean }) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('uploading'); setMessage('')
    const response = await fetch('/api/admin/media', { method: 'POST', body: new FormData(event.currentTarget) })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) { setStatus('error'); setMessage(String(body.error || 'Uppladdningen misslyckades.')); return }
    event.currentTarget.reset(); setStatus('idle'); router.refresh()
  }
  return (
    <form onSubmit={submit} className="mb-6 grid gap-4 rounded-[14px] border border-[#dce3ee] bg-white p-5 shadow-[0_8px_24px_rgba(16,24,40,.04)] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
      <label className="text-sm font-semibold text-[#344054]">Bildfil<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" capture="environment" required disabled={!enabled || status === 'uploading'} className="mt-2 block w-full rounded-lg border border-[#d7deea] p-2 text-sm" /></label>
      <label className="text-sm font-semibold text-[#344054]">Alt-text<input name="altText" required minLength={3} disabled={!enabled || status === 'uploading'} placeholder="Beskriv bilden för skärmläsare" className="mt-2 h-11 w-full rounded-lg border border-[#d7deea] px-3 font-normal" /></label>
      <button disabled={!enabled || status === 'uploading'} className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0866ff] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#98a2b3]"><Upload className="h-4 w-4" />{status === 'uploading' ? 'Bearbetar…' : 'Ladda upp'}</button>
      <label className="text-sm font-semibold text-[#344054] sm:col-span-2">Bildtext (valfri)<input name="caption" disabled={!enabled || status === 'uploading'} className="mt-2 h-11 w-full rounded-lg border border-[#d7deea] px-3 font-normal" /></label>
      <p className={`text-sm sm:col-span-2 lg:col-span-3 ${status === 'error' ? 'text-red-700' : 'text-[#667085]'}`}>{message || (enabled ? 'JPG, PNG, WebP eller AVIF, max 15 MB. Fem optimerade varianter skapas automatiskt.' : 'Uppladdning aktiveras när CMS-migrationen är installerad.')}</p>
    </form>
  )
}
