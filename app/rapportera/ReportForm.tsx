'use client'

import { FormEvent, useState } from 'react'

export default function ReportForm() {
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/account/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    })
    const result = (await response.json()) as { error?: string }
    setMessage(response.ok ? 'Rapporten är mottagen och köad för granskning.' : result.error || 'Logga in och försök igen.')
    if (response.ok) event.currentTarget.reset()
  }
  return <form onSubmit={submit} className="rounded-[24px] border bg-white p-6 shadow-sm sm:p-8">
    <label className="block"><span className="mb-2 block text-sm font-semibold">Vad gäller rapporten?</span><select name="category" className="h-12 w-full rounded-[14px] border bg-white px-4"><option value="suspected_fraud">Misstänkt bedrägeri</option><option value="payment_request">Betalning utanför Autorell</option><option value="misleading_listing">Vilseledande annons</option><option value="unsafe_product">Osäkert eller olagligt fordon</option><option value="harassment">Trakasserier i meddelanden</option><option value="identity_misuse">Identitetsmissbruk</option><option value="other">Annat</option></select></label>
    <label className="mt-4 block"><span className="mb-2 block text-sm font-semibold">Annons-ID (valfritt)</span><input name="leadId" className="h-12 w-full rounded-[14px] border px-4" /></label>
    <label className="mt-4 block"><span className="mb-2 block text-sm font-semibold">Beskriv vad som hänt</span><textarea name="details" minLength={10} required className="min-h-36 w-full rounded-[14px] border p-4" /></label>
    {message && <p className="mt-4 text-sm text-[#475467]">{message}</p>}
    <button className="mt-5 min-h-12 rounded-[14px] bg-[#0866ff] px-6 font-bold text-white">Skicka rapport</button>
  </form>
}
