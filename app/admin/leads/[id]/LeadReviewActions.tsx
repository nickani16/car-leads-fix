'use client'

import { useState } from 'react'
import { Check, LoaderCircle, X } from 'lucide-react'
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

  if (status !== 'Pending review') return null

  async function review(action: 'approve' | 'reject') {
    setLoading(action)
    setError('')
    try {
      const response = await fetch(`/api/admin/leads/${leadId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
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
        Check the vehicle details, condition and images. Approval starts the
        selected listing package from this exact moment.
      </p>
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
