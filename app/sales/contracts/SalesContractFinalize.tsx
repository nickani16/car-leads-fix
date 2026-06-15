'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, FileCheck2 } from 'lucide-react'

export default function SalesContractFinalize({
  documentId,
  finalizedAt,
  canFinalize,
  reason,
}: {
  documentId: string
  finalizedAt?: string | null
  canFinalize: boolean
  reason?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (finalizedAt) {
    return (
      <div className="flex items-start gap-3 rounded-[16px] border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
        <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="text-sm font-semibold">Ready for signature</p>
          <p className="mt-1 text-xs leading-5">
            Sales finalized both agreement versions on{' '}
            {new Date(finalizedAt).toLocaleString('en-GB')}. Use the secure
            electronic-signature action below to send both agreements.
          </p>
        </div>
      </div>
    )
  }

  async function finalize() {
    const confirmed = window.confirm(
      'Finalize the latest seller and buyer agreements for signature? Confirm that both parties, vehicle details and prices are correct.'
    )
    if (!confirmed) return

    setLoading(true)
    setError('')
    const response = await fetch(
      `/api/sales/contracts/${documentId}/finalize`,
      { method: 'POST' }
    )
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }

    if (!response.ok) {
      setError(result.error || 'The agreements could not be finalized.')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="rounded-[16px] border border-[#cfe4ef] bg-[#eff8fd] p-5">
      <div className="flex items-start gap-3">
        <FileCheck2 className="mt-0.5 shrink-0 text-[#52768a]" size={20} />
        <div className="flex-1">
          <p className="text-sm font-semibold">Finalize both agreements</p>
          <p className="mt-1 text-xs leading-5 text-[#586970]">
            This locks the current seller and buyer versions. No separate admin
            approval is required.
          </p>
          {!canFinalize && (
            <p className="mt-3 text-xs font-medium text-amber-800">
              {reason || 'Complete the required information first.'}
            </p>
          )}
          {error && <p className="mt-3 text-xs text-red-700">{error}</p>}
          <button
            type="button"
            disabled={!canFinalize || loading}
            onClick={finalize}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#242424] px-5 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FileCheck2 size={15} />
            {loading ? 'Finalizing...' : 'Finalize for signature'}
          </button>
        </div>
      </div>
    </div>
  )
}
