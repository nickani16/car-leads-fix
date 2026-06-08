'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, LockKeyhole } from 'lucide-react'

export default function FinalContractApproval({
  documentId,
  approvedAt,
  canApprove,
  reason,
}: {
  documentId: string
  approvedAt?: string | null
  canApprove: boolean
  reason?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (approvedAt) {
    return (
      <div className="flex items-start gap-3 rounded-[16px] border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
        <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="text-sm font-semibold">Final version approved</p>
          <p className="mt-1 text-xs">
            Seller and buyer agreement version approved on{' '}
            {new Date(approvedAt).toLocaleString('en-GB')}. This exact version is
            ready for the signing workflow.
          </p>
        </div>
      </div>
    )
  }

  async function approve() {
    const confirmed = window.confirm(
      'Approve the latest seller and buyer agreements as the final versions for signing? Confirm that vehicle details, parties, prices and legal terms are correct.'
    )
    if (!confirmed) return

    setLoading(true)
    setError('')

    const response = await fetch(`/api/admin/contracts/${documentId}/approve`, {
      method: 'POST',
    })
    const result = (await response.json()) as { error?: string }

    if (!response.ok) {
      setError(result.error || 'The final version could not be approved.')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="rounded-[16px] border border-[#deddd7] bg-white p-5">
      <div className="flex items-start gap-3">
        <LockKeyhole className="mt-0.5 shrink-0 text-[#52768a]" size={20} />
        <div className="flex-1">
          <p className="text-sm font-semibold">Admin final approval</p>
          <p className="mt-1 text-xs leading-5 text-[#697074]">
            Approval locks the current seller and buyer document hashes as the
            versions that will be sent for electronic signature.
          </p>
          {!canApprove && (
            <p className="mt-3 text-xs font-medium text-amber-800">
              {reason || 'This agreement is not ready for final approval.'}
            </p>
          )}
          {error && <p className="mt-3 text-xs text-red-700">{error}</p>}
          <button
            type="button"
            disabled={!canApprove || loading}
            onClick={approve}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#242424] px-5 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <LockKeyhole size={15} />
            {loading ? 'Approving...' : 'Approve final version'}
          </button>
        </div>
      </div>
    </div>
  )
}
