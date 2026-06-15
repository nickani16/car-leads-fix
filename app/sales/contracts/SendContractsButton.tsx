'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MailCheck } from 'lucide-react'

export default function SendContractsButton({
  documentId,
  sent,
}: {
  documentId: string
  sent: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function send() {
    if (
      !window.confirm(
        sent
          ? 'Create new secure signing links and resend both agreements? Previous unsigned links will stop working.'
          : 'Send both locked agreements to the seller and buyer for electronic signature?'
      )
    ) {
      return
    }
    setLoading(true)
    setMessage('')
    const response = await fetch(`/api/sales/contracts/${documentId}/send`, {
      method: 'POST',
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    setLoading(false)
    setMessage(
      response.ok
        ? 'Secure signing links were sent to both parties.'
        : result.error || 'The agreements could not be sent.'
    )
    if (response.ok) router.refresh()
  }

  return (
    <div className="mt-4 rounded-[16px] border border-[#deddd7] bg-white p-5">
      <div className="flex items-start gap-3">
        <MailCheck className="mt-0.5 shrink-0 text-[#52768a]" size={20} />
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {sent ? 'Signing links sent' : 'Send for electronic signature'}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#62686c]">
            Autorell emails separate secure links to the seller and buyer and
            records opens, delivery and signatures in the transaction history.
          </p>
          <button
            type="button"
            onClick={send}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#242424] px-5 py-3 text-sm text-white disabled:opacity-50"
          >
            <MailCheck size={15} />
            {loading ? 'Sending...' : sent ? 'Resend signing links' : 'Send both agreements'}
          </button>
          {message && <p className="mt-3 text-xs text-[#62686c]">{message}</p>}
        </div>
      </div>
    </div>
  )
}
