'use client'

import { CheckCircle2, LoaderCircle, Megaphone, MoreHorizontal, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export type PackageOption = {
  id: string
  title: string
  duration: string
  price: string
  description: string
  available: boolean
}

export type MarketingOption = {
  productKey: string
  type: 'refresh' | 'top' | 'featured'
  title: string
  price: string
  period: string
  description: string
  detail: string
}

export default function ListingStatusActions({
  listingId,
  status,
  packageId,
  market,
  packages,
  marketingOptions,
  lastRefreshedAt,
  refreshLocked,
  boostStartedAt,
  boostExpiresAt,
  featuredStartedAt,
  featuredExpiresAt,
  reviewMessage,
  autoOpen = false,
  locale,
}: {
  listingId: string
  status: string
  packageId: string | null
  market: string
  packages: PackageOption[]
  marketingOptions: MarketingOption[]
  lastRefreshedAt: string | null
  refreshLocked: boolean
  boostStartedAt: string | null
  boostExpiresAt: string | null
  featuredStartedAt: string | null
  featuredExpiresAt: string | null
  reviewMessage: string | null
  autoOpen?: boolean
  locale: string
}) {
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)
  const packageDialogRef = useRef<HTMLDialogElement>(null)
  const marketingDialogRef = useRef<HTMLDialogElement>(null)
  const reviewDialogRef = useRef<HTMLDialogElement>(null)
  const [selectedPackage, setSelectedPackage] = useState(
    status === 'published' && packageId === 'free_7d' ? 'standard_15d' : packageId || 'free_7d',
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState('')
  const [message, setMessage] = useState('')
  const swedish = locale === 'sv'
  const availablePackages = (status === 'published'
    ? packages.filter((item) => item.id !== 'free_7d')
    : packages).filter((item) => item.available)
  const refreshAvailableAt = lastRefreshedAt
    ? new Date(new Date(lastRefreshedAt).getTime() + 24 * 60 * 60 * 1000)
    : null

  useEffect(() => {
    if (autoOpen && !packageDialogRef.current?.open) packageDialogRef.current?.showModal()
  }, [autoOpen])

  useEffect(() => {
    if (!menuOpen) return
    const close = (event: KeyboardEvent | PointerEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return
      if (event instanceof PointerEvent && menuRef.current?.contains(event.target as Node)) return
      setMenuOpen(false)
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', close)
    }
  }, [menuOpen])

  async function mutate(action: string, after?: () => void) {
    setLoading(action)
    setMessage('')
    setMenuOpen(false)
    const response = await fetch(`/api/account/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string }
    setLoading('')
    if (!response.ok) return setMessage(result.error || text('Annonsen kunde inte uppdateras.', 'The listing could not be updated.'))
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
    const result = (await response.json().catch(() => ({}))) as { error?: string; url?: string }
    if (!response.ok) {
      setLoading('')
      return setMessage(result.error || text('Paketet kunde inte väljas.', 'The package could not be selected.'))
    }
    if (result.url) return window.location.assign(result.url)
    setLoading('')
    packageDialogRef.current?.close()
    router.refresh()
  }

  async function startMarketing(productKey: string) {
    const product = marketingOptions.find((item) => item.productKey === productKey)
    if (!product || (product.type === 'refresh' && refreshLocked)) return
    setLoading(productKey)
    setMessage('')
    const response = await fetch('/api/account/listing-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, productKey, market }),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string; url?: string }
    if (result.url) return window.location.assign(result.url)
    setLoading('')
    setMessage(result.error || text('Köpet kunde inte startas.', 'The purchase could not be started.'))
  }

  async function duplicate() {
    setLoading('duplicate')
    setMenuOpen(false)
    const response = await fetch(`/api/account/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'duplicate' }),
    })
    const result = (await response.json().catch(() => ({}))) as { error?: string; listingId?: string }
    setLoading('')
    if (!response.ok || !result.listingId) return setMessage(result.error || text('Annonsen kunde inte dupliceras.', 'The listing could not be duplicated.'))
    router.push(`/account/listings/${result.listingId}/edit`)
  }

  function text(sv: string, en: string) {
    return swedish ? sv : en
  }

  function openPackage() {
    setMenuOpen(false)
    setMessage('')
    packageDialogRef.current?.showModal()
  }

  const secondary = secondaryActions(status)
  const button = 'inline-flex min-h-10 items-center justify-center rounded-[11px] border border-[#cbd7e8] bg-white px-3.5 text-sm font-semibold text-[#344054] outline-none transition hover:border-[#0866ff] hover:text-[#0866ff] focus-visible:ring-4 focus-visible:ring-[#0866ff]/20 disabled:opacity-50'
  const primary = 'inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[#0866ff] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(8,102,255,.18)] outline-none transition hover:bg-[#075be3] focus-visible:ring-4 focus-visible:ring-[#0866ff]/30 disabled:opacity-50'

  return (
    <>
      <div className="relative grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-2" ref={menuRef}>
        {status === 'draft' ? <button type="button" className={primary} onClick={openPackage}>{text('Fortsätt', 'Continue')}</button> : null}
        {status === 'pending_payment' ? <button type="button" className={`${primary} w-full`} onClick={openPackage}>{text('Slutför betalning', 'Complete payment')}</button> : null}
        {status === 'pending_review' || status === 'rejected' ? <button type="button" className={primary} onClick={() => reviewDialogRef.current?.showModal()}>{text('Visa status', 'View status')}</button> : null}
        {status === 'published' ? <button type="button" className={primary} onClick={() => marketingDialogRef.current?.showModal()}><Megaphone className="h-4 w-4" />{text('Marknadsför annons', 'Promote listing')}</button> : null}
        {status === 'paused' ? <button type="button" className={primary} disabled={Boolean(loading)} onClick={() => mutate('resume')}>{text('Aktivera', 'Activate')}</button> : null}
        {status === 'expired' ? <button type="button" className={primary} onClick={openPackage}>{text('Förnya', 'Renew')}</button> : null}
        {status === 'sold' ? <button type="button" className={primary} disabled={Boolean(loading)} onClick={() => mutate('relist', openPackage)}>{text('Publicera igen', 'Publish again')}</button> : null}
        {status === 'deleted' || status === 'removed' ? <button type="button" className={primary} disabled={Boolean(loading)} onClick={() => mutate('relist', openPackage)}>{text('Återställ', 'Restore')}</button> : null}

        {secondary.length ? <button type="button" aria-label={text('Fler annonsåtgärder', 'More listing actions')} aria-expanded={menuOpen} aria-haspopup="menu" onClick={() => setMenuOpen((open) => !open)} className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border border-[#cbd7e8] bg-white text-[#475467] outline-none transition hover:border-[#0866ff] hover:text-[#0866ff] focus-visible:ring-4 focus-visible:ring-[#0866ff]/20"><MoreHorizontal className="h-5 w-5" /></button> : null}

        {menuOpen ? <div role="menu" className="absolute right-0 top-12 z-30 grid min-w-[210px] gap-1 rounded-[14px] border border-[#dfe6f1] bg-white p-2 shadow-[0_18px_50px_rgba(16,24,40,.16)]">
          {secondary.map((action) => {
            const handler = action === 'package' ? openPackage
              : action === 'review' ? () => reviewDialogRef.current?.showModal()
              : action === 'duplicate' ? duplicate
              : action === 'delete' ? () => { if (window.confirm(text('Ta bort annonsen?', 'Delete this listing?'))) void mutate('delete') }
              : () => mutate(action)
            return <button key={action} type="button" role="menuitem" onClick={handler} className="rounded-[9px] px-3 py-2 text-left text-sm font-medium text-[#344054] outline-none hover:bg-[#f2f6ff] hover:text-[#0866ff] focus-visible:bg-[#f2f6ff]">{actionLabel(action, swedish)}</button>
          })}
        </div> : null}
      </div>

      {loading && loading !== 'package' && !loading.startsWith('addon.') ? <span className="mt-2 inline-flex items-center gap-2 text-xs text-[#667085]"><LoaderCircle className="h-4 w-4 animate-spin" />{text('Sparar…', 'Saving…')}</span> : null}
      {message ? <p role="alert" className="mt-2 rounded-[10px] bg-red-50 px-3 py-2 text-xs text-red-700">{message}</p> : null}

      <dialog ref={packageDialogRef} aria-labelledby={`package-${listingId}`} className="w-[min(94vw,820px)] rounded-[24px] border-0 bg-white p-0 text-[#101828] shadow-2xl backdrop:bg-[#07152d]/55">
        <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-7">
          <DialogHeader eyebrow={text('Annonsen är sparad', 'Your listing is saved')} title={text('Välj hur du vill publicera', 'Choose how to publish')} description={text('Annonsen är inte synlig förrän paketet är klart. Du kan byta paket nu eller komma tillbaka senare.', 'The listing stays hidden until the package is complete. You can return later.')} titleId={`package-${listingId}`} close={() => packageDialogRef.current?.close()} />
          {availablePackages.length ? <div className={`mt-6 grid gap-3 ${availablePackages.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>{availablePackages.map((item) => {
            const selected = selectedPackage === item.id
            return <button key={item.id} type="button" onClick={() => setSelectedPackage(item.id)} className={`rounded-[18px] border p-4 text-left outline-none transition focus-visible:ring-4 focus-visible:ring-[#0866ff]/20 ${selected ? 'border-[#0866ff] bg-[#eef5ff]' : 'border-[#d7deed] bg-white hover:border-[#9ebcf0]'}`}>
              <span className="text-xs font-semibold text-[#0866ff]">{item.duration}</span><strong className="mt-2 block text-lg font-semibold">{item.title}</strong><span className="mt-1 block text-xl font-semibold">{item.price}</span><span className="mt-3 block text-sm leading-6 text-[#667085]">{item.description}</span>{selected ? <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0866ff]"><CheckCircle2 className="h-4 w-4" />{text('Valt', 'Selected')}</span> : null}
            </button>
          })}</div> : <p className="mt-6 rounded-[14px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{text('Inget paket har ett aktivt pris för denna marknad. Kontakta support.', 'No package has an active price for this market. Contact support.')}</p>}
          {message ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" className={button} onClick={() => packageDialogRef.current?.close()}>{text('Spara och fortsätt senare', 'Save and continue later')}</button><button type="button" className={primary} disabled={loading === 'package' || !availablePackages.some((item) => item.id === selectedPackage)} onClick={continueWithPackage}>{loading === 'package' ? text('Öppnar…', 'Opening…') : selectedPackage === 'free_7d' ? text('Publicera gratis', 'Publish free') : text('Fortsätt till säker betalning', 'Continue to secure payment')}</button></div>
        </div>
      </dialog>

      <dialog ref={marketingDialogRef} aria-labelledby={`marketing-${listingId}`} className="w-[min(94vw,900px)] rounded-[24px] border-0 bg-white p-0 text-[#101828] shadow-2xl backdrop:bg-[#07152d]/55">
        <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-7">
          <DialogHeader eyebrow={text('Öka synligheten', 'Increase visibility')} title={text('Marknadsför annons', 'Promote listing')} description={text('Välj en tydlig effekt. Priser och perioder hämtas från Autorells aktiva billing-katalog för din marknad.', 'Choose a clear effect. Prices and periods come from the active billing catalog for your market.')} titleId={`marketing-${listingId}`} close={() => marketingDialogRef.current?.close()} />
          {marketingOptions.length ? <div className="mt-6 grid gap-4 md:grid-cols-2">{marketingOptions.map((option) => {
            const disabled = option.type === 'refresh' && refreshLocked
            return <article key={option.productKey} className="flex flex-col rounded-[18px] border border-[#d7deed] p-5">
              <div className="flex items-start justify-between gap-3"><div><span className="text-xs font-semibold uppercase tracking-[.12em] text-[#0866ff]">{option.period}</span><h3 className="mt-2 text-lg font-semibold">{option.title}</h3></div><strong className="text-lg font-semibold">{option.price}</strong></div>
              <p className="mt-3 text-sm leading-6 text-[#475467]">{option.description}</p><p className="mt-3 rounded-[11px] bg-[#f6f8fc] px-3 py-2 text-xs leading-5 text-[#667085]">{option.detail}</p>
              {option.type === 'refresh' ? <p className="mt-3 text-xs text-[#667085]">{lastRefreshedAt ? `${text('Senaste lyft', 'Last boost')}: ${formatDateTime(lastRefreshedAt, locale)}` : text('Annonsen har inte lyfts tidigare.', 'The listing has not been boosted before.')}{disabled && refreshAvailableAt ? ` · ${text('Tillgänglig igen', 'Available again')} ${formatDateTime(refreshAvailableAt.toISOString(), locale)}` : ''}</p> : null}
              {option.type === 'top' && boostExpiresAt ? <p className="mt-3 text-xs text-[#667085]">{text('Nuvarande toppplacering', 'Current top placement')}: {boostStartedAt ? formatDateTime(boostStartedAt, locale) : '–'} – {formatDateTime(boostExpiresAt, locale)}</p> : null}
              {option.type === 'featured' && featuredExpiresAt ? <p className="mt-3 text-xs text-[#667085]">Featured: {featuredStartedAt ? formatDateTime(featuredStartedAt, locale) : '–'} – {formatDateTime(featuredExpiresAt, locale)}</p> : null}
              <button type="button" disabled={disabled || Boolean(loading)} onClick={() => startMarketing(option.productKey)} className={`${primary} mt-5 w-full`}>{loading === option.productKey ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{disabled ? text('24-timmarsspärr aktiv', '24-hour cooldown active') : text('Välj och betala', 'Select and pay')}</button>
            </article>
          })}</div> : <p className="mt-6 rounded-[14px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{text('Ingen marknadsföringsprodukt har ett aktivt pris för denna marknad.', 'No promotion product has an active price for this market.')}</p>}
          {message ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}
        </div>
      </dialog>

      <dialog ref={reviewDialogRef} aria-labelledby={`review-${listingId}`} className="w-[min(92vw,560px)] rounded-[22px] border-0 bg-white p-0 text-[#101828] shadow-2xl backdrop:bg-[#07152d]/55">
        <div className="p-6"><DialogHeader eyebrow={text('Annonsstatus', 'Listing status')} title={status === 'rejected' ? text('Åtgärd krävs', 'Action required') : text('Under granskning', 'In review')} description={reviewMessage || text('Autorell granskar annonsen. Ingen ytterligare betalning behövs.', 'Autorell is reviewing the listing. No further payment is required.')} titleId={`review-${listingId}`} close={() => reviewDialogRef.current?.close()} /></div>
      </dialog>
    </>
  )
}

function DialogHeader({ eyebrow, title, description, titleId, close }: { eyebrow: string; title: string; description: string; titleId: string; close: () => void }) {
  return <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#0866ff]">{eyebrow}</p><h2 id={titleId} className="mt-2 text-2xl font-semibold">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">{description}</p></div><button type="button" onClick={close} aria-label="Stäng" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f2f4f7] outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/20"><X className="h-5 w-5" /></button></div>
}

function secondaryActions(status: string) {
  if (status === 'draft') return ['delete']
  if (status === 'pending_payment') return ['package', 'delete']
  if (status === 'pending_review' || status === 'rejected') return ['review', 'unpublish']
  if (status === 'published') return ['package', 'pause', 'mark_sold']
  if (status === 'paused') return ['mark_sold', 'delete']
  if (status === 'expired') return ['package', 'delete']
  if (status === 'sold') return ['duplicate', 'delete']
  return []
}

function actionLabel(action: string, swedish: boolean) {
  const labels: Record<string, [string, string]> = {
    package: ['Välj eller byt paket', 'Choose or change package'],
    review: ['Visa granskningsstatus', 'View review status'],
    unpublish: ['Avbryt annons', 'Cancel listing'],
    pause: ['Pausa', 'Pause'],
    mark_sold: ['Markera som såld', 'Mark as sold'],
    duplicate: ['Duplicera', 'Duplicate'],
    delete: ['Ta bort', 'Delete'],
  }
  return labels[action]?.[swedish ? 0 : 1] || action
}

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
