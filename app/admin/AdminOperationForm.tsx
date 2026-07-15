'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputClass = 'h-11 rounded-[10px] border border-[#d7deea] bg-white px-3 text-sm outline-none focus:border-[#0866ff]'

export default function AdminOperationForm({ mode }: { mode: 'finance' | 'security' }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(formData: FormData) {
    setBusy(true)
    setMessage('')
    const payload = Object.fromEntries(formData.entries())
    const endpoint = mode === 'finance' ? '/api/admin/finance-cases' : '/api/admin/security/ip-blocks'
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string }
    setBusy(false)
    if (!response.ok) {
      setMessage(result.error || 'Åtgärden kunde inte genomföras.')
      return
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <section className="rounded-[14px] border border-[#dce3ee] bg-white p-4 shadow-[0_8px_24px_rgba(16,24,40,.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-[#101828]">{mode === 'finance' ? 'Kontrollerad ekonomiåtgärd' : 'Tidsbegränsad IP-spärr'}</h2>
          <p className="mt-1 text-xs text-[#667085]">Alla åtgärder kräver motivering och skrivs till audit-loggen.</p>
        </div>
        <div className="flex gap-2">
          <Link href={mode === 'finance' ? '/admin/payments/cases' : '/admin/security/blocks'} className="rounded-[10px] border border-[#d7deea] px-4 py-2 text-sm font-bold text-[#344054]">
            Visa {mode === 'finance' ? 'ärenden' : 'spärrar'}
          </Link>
          <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-[10px] bg-[#0866ff] px-4 py-2 text-sm font-bold text-white">
            {open ? 'Stäng' : mode === 'finance' ? 'Öppna ärende' : 'Skapa spärr'}
          </button>
        </div>
      </div>
      {open ? (
        <form action={submit} className="mt-4 grid gap-3 border-t border-[#edf1f6] pt-4 md:grid-cols-2">
          {mode === 'finance' ? (
            <>
              <select name="case_type" className={inputClass} required defaultValue="payment_review">
                <option value="payment_review">Betalningsgranskning</option>
                <option value="refund_request">Begäran om återbetalning</option>
                <option value="compensation_credit">Kompensationskredit</option>
                <option value="subscription_adjustment">Abonnemangsjustering</option>
                <option value="webhook_review">Webhook-granskning</option>
              </select>
              <input name="payment_order_id" className={inputClass} placeholder="Betalnings-ID (valfritt)" />
              <input name="amount_minor" type="number" min="0" className={inputClass} placeholder="Belopp i ören (valfritt)" />
              <input name="currency" className={inputClass} maxLength={3} placeholder="Valuta, t.ex. SEK" />
            </>
          ) : (
            <>
              <input name="ip_network" className={inputClass} required placeholder="IP eller CIDR, t.ex. 203.0.113.4/32" />
              <input name="duration_hours" type="number" min="1" max="720" defaultValue="24" className={inputClass} required />
            </>
          )}
          <textarea name="reason" required minLength={8} rows={3} className="rounded-[10px] border border-[#d7deea] p-3 text-sm outline-none focus:border-[#0866ff] md:col-span-2" placeholder="Intern anledning (minst 8 tecken)" />
          {message ? <p role="alert" className="text-sm font-bold text-red-700 md:col-span-2">{message}</p> : null}
          <button disabled={busy} className="rounded-[10px] bg-[#101828] px-4 py-2 text-sm font-bold text-white disabled:opacity-50 md:col-span-2">
            {busy ? 'Sparar…' : 'Bekräfta och audit-logga'}
          </button>
        </form>
      ) : null}
    </section>
  )
}
