'use client'

import { useState } from 'react'
import { Check, Gavel, LoaderCircle, ShoppingCart, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LeadReviewActions({
  leadId,
  status,
}: {
  leadId: string
  status: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState('')
  const [saleFormat, setSaleFormat] = useState<'auction' | 'marketplace'>(
    'auction'
  )
  const [buyNowPrice, setBuyNowPrice] = useState('')

  if (status !== 'Pending review') return null

  async function review(action: 'approve' | 'reject') {
    const marketplacePrice = Number(buyNowPrice)
    if (
      action === 'approve' &&
      saleFormat === 'marketplace' &&
      (!Number.isFinite(marketplacePrice) || marketplacePrice <= 0)
    ) {
      setError('Enter a valid marketplace price.')
      return
    }

    setLoading(action)
    setError('')
    try {
      const response = await fetch(`/api/admin/leads/${leadId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          saleFormat,
          buyNowPrice:
            saleFormat === 'marketplace' ? marketplacePrice : null,
        }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(result.error || 'Review could not be saved.')
        return
      }
      router.refresh()
    } catch {
      setError('Review could not be saved.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="mb-7 rounded-[22px] border border-[#9bc9e4] bg-[#eef7fb] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#397b9f]">
        Publication review
      </p>
      <h2 className="mt-3 text-2xl font-semibold">Approve before dealers see it</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#617681]">
        Check the vehicle details, condition and images. Then publish it as an
        auction or at a fixed marketplace price.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setSaleFormat('auction')}
          className={`rounded-[16px] border p-4 text-left transition ${
            saleFormat === 'auction'
              ? 'border-[#202124] bg-white shadow-sm'
              : 'border-[#c8dce7] bg-white/55'
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Gavel size={17} />
            Timed auction
          </span>
          <span className="mt-2 block text-xs leading-5 text-[#617681]">
            Dealers compete with binding bids during the listing period.
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSaleFormat('marketplace')}
          className={`rounded-[16px] border p-4 text-left transition ${
            saleFormat === 'marketplace'
              ? 'border-[#202124] bg-white shadow-sm'
              : 'border-[#c8dce7] bg-white/55'
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingCart size={17} />
            Marketplace
          </span>
          <span className="mt-2 block text-xs leading-5 text-[#617681]">
            A dealer submits a binding purchase at the fixed vehicle price.
          </span>
        </button>
      </div>
      {saleFormat === 'marketplace' && (
        <label className="mt-4 block max-w-sm">
          <span className="mb-2 block text-xs font-semibold text-[#617681]">
            Fixed vehicle price in EUR
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={buyNowPrice}
            onChange={(event) => setBuyNowPrice(event.target.value)}
            placeholder="Example: 20000"
            className="h-12 w-full rounded-[14px] border border-[#9bc9e4] bg-white px-4 text-sm outline-none focus:border-[#397b9f] focus:ring-4 focus:ring-[#B4D9EF]/35"
          />
        </label>
      )}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => review('approve')}
          disabled={Boolean(loading)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#202124] px-6 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading === 'approve' ? <LoaderCircle size={17} className="animate-spin" /> : <Check size={17} />}
          Approve and publish
        </button>
        <button
          type="button"
          onClick={() => review('reject')}
          disabled={Boolean(loading)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-6 text-sm font-medium text-red-700 disabled:opacity-50"
        >
          {loading === 'reject' ? <LoaderCircle size={17} className="animate-spin" /> : <X size={17} />}
          Reject vehicle
        </button>
      </div>
      {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
    </section>
  )
}
