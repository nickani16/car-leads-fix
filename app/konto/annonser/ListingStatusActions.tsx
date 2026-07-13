'use client'

import { CheckCircle2, LoaderCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type ListingBuyerOption = { userId: string; name: string }

type PackageOption = { id: string; title: string; duration: string; price: string; description: string }

export default function ListingStatusActions({
  listingId,
  status,
  packageId,
  market,
  buyers,
  packages,
  autoOpen = false,
}: {
  listingId: string
  status: string
  packageId: string | null
  market: string
  buyers: ListingBuyerOption[]
  packages: PackageOption[]
  autoOpen?: boolean
}) {
  const router = useRouter()
  const [buyerUserId, setBuyerUserId] = useState(buyers[0]?.userId || '')
  const [selectedPackage, setSelectedPackage] = useState(
    status === 'published' && packageId === 'free_7d' ? 'standard_15d' : packageId || 'free_7d',
  )
  const [packageOpen, setPackageOpen] = useState(autoOpen)
  const [loading, setLoading] = useState('')
  const [message, setMessage] = useState('')
  const availablePackages = status === 'published'
    ? packages.filter((item) => item.id !== 'free_7d')
    : packages

  async function mutate(action: string, after?: () => void) {
    setLoading(action)
    setMessage('')
    const response = await fetch(`/api/account/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, buyerUserId: buyerUserId || null }),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string }
    setLoading('')
    if (!response.ok) return setMessage(result.error || 'Annonsen kunde inte uppdateras.')
    after?.()
    router.refresh()
  }

  async function continueWithPackage() {
    setLoading('package')
    setMessage('')
    const response = await fetch('/api/account/listing-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, packageId: selectedPackage, market }),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string; url?: string; free?: boolean }
    if (!response.ok) {
      setLoading('')
      return setMessage(result.error || 'Paketet kunde inte väljas.')
    }
    if (result.url) return window.location.assign(result.url)
    setLoading('')
    setPackageOpen(false)
    router.refresh()
  }

  async function startTopPlacement() {
    setLoading('boost')
    setMessage('')
    const response = await fetch('/api/account/listing-checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, productKey: 'addon.top_placement.7_days', market }),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string; url?: string }
    if (result.url) return window.location.assign(result.url)
    setLoading('')
    setMessage(result.error || 'Topplaceringen kunde inte startas.')
  }

  async function duplicate() {
    setLoading('duplicate')
    const response = await fetch(`/api/account/listings/${listingId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'duplicate' }),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string; listingId?: string }
    setLoading('')
    if (!response.ok || !result.listingId) return setMessage(result.error || 'Annonsen kunde inte dupliceras.')
    router.push(`/account/listings/${result.listingId}/edit`)
  }

  const button = 'inline-flex min-h-11 items-center justify-center rounded-[13px] border border-[#cbd7e8] bg-white px-4 text-sm font-bold text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff] disabled:opacity-50'
  const primary = 'inline-flex min-h-11 items-center justify-center rounded-[13px] bg-[#0866ff] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,102,255,.2)] disabled:opacity-50'

  return (
    <>
      <div className="grid gap-2">
        {status === 'draft' ? <button className={primary} onClick={() => setPackageOpen(true)}>Fortsätt</button> : null}
        {status === 'pending_payment' ? <>
          <button className={primary} onClick={() => setPackageOpen(true)}>Slutför betalning</button>
          <button className={button} onClick={() => setPackageOpen(true)}>Byt paket</button>
        </> : null}
        {status === 'pending_review' || status === 'rejected' ? (
          <button className={button} disabled={Boolean(loading)} onClick={() => mutate('unpublish')}>Avpublicera till utkast</button>
        ) : null}
        {status === 'published' ? <>
          <button className={primary} onClick={() => setPackageOpen(true)}>Förnya annons</button>
          <button className={button} disabled={Boolean(loading)} onClick={startTopPlacement}>Köp topplacering</button>
          <button className={button} disabled={Boolean(loading)} onClick={() => mutate('pause')}>Pausa</button>
          {buyers.length ? <select value={buyerUserId} onChange={(event) => setBuyerUserId(event.target.value)} className="h-11 rounded-[13px] border border-[#cbd7e8] bg-white px-3 text-sm"><option value="">Välj köpare (valfritt)</option>{buyers.map((buyer) => <option key={buyer.userId} value={buyer.userId}>{buyer.name}</option>)}</select> : null}
          <button className={button} disabled={Boolean(loading)} onClick={() => mutate('mark_sold')}>Markera som såld</button>
        </> : null}
        {status === 'paused' ? <button className={primary} disabled={Boolean(loading)} onClick={() => mutate('resume')}>Aktivera igen</button> : null}
        {['sold', 'expired', 'deleted', 'removed'].includes(status) ? (
          <button className={primary} disabled={Boolean(loading)} onClick={() => mutate('relist', () => setPackageOpen(true))}>Lägg ut igen</button>
        ) : null}
        {status === 'sold' ? <button className={button} disabled={Boolean(loading)} onClick={duplicate}>Duplicera</button> : null}
        {['draft', 'pending_payment', 'paused', 'expired', 'sold', 'rejected'].includes(status) ? (
          <button className={button} disabled={Boolean(loading)} onClick={() => { if (window.confirm('Ta bort annonsen från Mina annonser?')) void mutate('delete') }}>Ta bort</button>
        ) : null}
        {loading && loading !== 'package' ? <span className="inline-flex items-center gap-2 text-xs text-[#667085]"><LoaderCircle className="h-4 w-4 animate-spin" />Sparar…</span> : null}
        {message ? <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{message}</p> : null}
      </div>

      {packageOpen ? <div className="fixed inset-0 z-[100] grid place-items-center bg-[#07152d]/55 p-4" role="dialog" aria-modal="true" aria-labelledby={`package-${listingId}`}>
        <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[26px] bg-white p-5 shadow-2xl sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0866ff]">Annonsen är sparad</p><h2 id={`package-${listingId}`} className="mt-2 text-2xl font-bold">Välj hur du vill publicera</h2><p className="mt-2 text-sm leading-6 text-[#667085]">Annonsen är inte synlig förrän paketet är klart. Du kan byta paket nu eller komma tillbaka senare.</p></div>
            <button onClick={() => setPackageOpen(false)} aria-label="Stäng" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f2f4f7]"><X className="h-5 w-5" /></button>
          </div>
          <div className={`mt-6 grid gap-3 ${availablePackages.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>{availablePackages.map((item) => {
            const selected = selectedPackage === item.id
            return <button key={item.id} type="button" onClick={() => setSelectedPackage(item.id)} className={`rounded-[18px] border p-4 text-left ${selected ? 'border-[#0866ff] bg-[#eef5ff] ring-2 ring-[#0866ff]/10' : 'border-[#d7deed]'}`}>
              <span className="text-xs font-bold text-[#0866ff]">{item.duration}</span><strong className="mt-2 block text-lg">{item.title}</strong><span className="mt-1 block text-xl font-black">{item.price}</span><span className="mt-3 block text-xs leading-5 text-[#667085]">{item.description}</span>{selected ? <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#0866ff]"><CheckCircle2 className="h-4 w-4" />Valt</span> : null}
            </button>
          })}</div>
          {message ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button className={button} onClick={() => setPackageOpen(false)}>Spara och fortsätt senare</button><button className={primary} disabled={loading === 'package'} onClick={continueWithPackage}>{loading === 'package' ? 'Öppnar…' : selectedPackage === 'free_7d' ? 'Publicera gratis' : 'Fortsätt till säker betalning'}</button></div>
        </div>
      </div> : null}
    </>
  )
}
