'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const plans = [
  { key: 'free', name: 'Free', limit: 5, price: '0 SEK/månad' },
  { key: 'starter', name: 'Starter', limit: 25, price: '499 SEK/månad' },
  { key: 'growth', name: 'Growth', limit: 100, price: '999 SEK/månad' },
  { key: 'professional', name: 'Professional', limit: 500, price: '1 999 SEK/månad' },
  { key: 'enterprise', name: 'Enterprise', limit: null, price: 'Kontakta oss' },
]

export default function BusinessPlanChooser({ currentPlan, currentStatus, paymentStatus }: { currentPlan: string | null; currentStatus: string | null; paymentStatus: string | null }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState('')
  const router = useRouter()
  async function choose(key: string) {
    setLoading(key); setError('')
    const response = await fetch('/api/account/listing-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productKey: `subscription.business.${key}.monthly`, market: 'se' }) })
    const result = await response.json().catch(() => ({}))
    if (result.activated) { router.push('/konto'); return }
    if (result.url) window.location.assign(result.url)
    else { setError(result.error || 'Kunde inte starta betalningen.'); setLoading('') }
  }
  return <main className="min-h-screen bg-[#f7f9fc] px-5 py-14"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#0866ff]">Autorell för företag</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-[#101828]">Välj företagsabonnemang</h1><p className="mt-3 max-w-2xl text-[#667085]">Ett aktivt abonnemang krävs innan företaget kan skapa eller publicera annonser.</p>{currentPlan && <div className="mt-5 rounded-2xl border border-[#dbe4f0] bg-white p-4 text-sm">Nuvarande: <strong>{currentPlan}</strong> · status {currentStatus || 'pending'} · betalning {paymentStatus || 'pending'}</div>}<div className="mt-8 grid gap-5 md:grid-cols-4">{plans.map((plan) => <article key={plan.key} className="rounded-3xl border border-[#dbe4f0] bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold">{plan.name}</h2><p className="mt-2 text-2xl font-semibold">{plan.price}</p><p className="mt-2 text-sm text-[#667085]">{plan.limit ? `${plan.limit} aktiva annonser` : 'Individuell kvot och offert'}</p>{plan.key === 'enterprise' ? <a href="mailto:nikolai.parkkila@hotmail.com?subject=Autorell Enterprise" className="mt-6 block w-full rounded-xl bg-[#0866ff] px-4 py-3 text-center text-sm font-bold text-white">Kontakta oss</a> : <button onClick={() => choose(plan.key)} disabled={!!loading} className="mt-6 w-full rounded-xl bg-[#0866ff] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{loading === plan.key ? 'Öppnar betalning…' : 'Välj abonnemang'}</button>}</article>)}</div>{error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}</div></main>
}
