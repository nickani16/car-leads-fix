'use client'

import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, PenLine, ShieldCheck } from 'lucide-react'

export default function SignAgreementForm({
  token,
  signerName,
  alreadySigned,
}: {
  token: string
  signerName: string
  alreadySigned: boolean
}) {
  const [typedName, setTypedName] = useState(signerName)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signed, setSigned] = useState(alreadySigned)

  useEffect(() => {
    if (!alreadySigned) {
      void fetch(`/api/sign/${token}/open`, { method: 'POST' })
    }
  }, [alreadySigned, token])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const response = await fetch(`/api/sign/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ typedName, accepted }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    setLoading(false)
    if (!response.ok) {
      setError(result.error || 'The agreement could not be signed.')
      return
    }
    setSigned(true)
  }

  if (signed) {
    return (
      <div className="mx-auto max-w-[1014px] px-5 pt-8 sm:px-8 lg:px-12">
        <div className="flex items-start gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <CheckCircle2 className="mt-0.5 shrink-0" />
          <div>
            <h1 className="font-semibold">Agreement signed</h1>
            <p className="mt-1 text-sm leading-6">
              Your signature has been recorded with the locked document version.
              Autorell will contact you about the next step.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1014px] px-5 pt-8 sm:px-8 lg:px-12">
      <form
        onSubmit={submit}
        className="rounded-[20px] border border-[#cfe4ef] bg-[#eff8fd] p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-[#52768a]" />
          <div>
            <h1 className="text-lg font-semibold">Review and sign</h1>
            <p className="mt-1 text-sm leading-6 text-[#586970]">
              Read the complete locked agreement below. Contact Autorell before
              signing if any vehicle, price or party information is incorrect.
            </p>
          </div>
        </div>
        <label className="mt-5 grid gap-2 text-sm font-medium">
          Full name of signer
          <input
            value={typedName}
            onChange={(event) => setTypedName(event.target.value)}
            className="h-12 rounded-[12px] border border-[#bfd4df] bg-white px-4 outline-none focus:border-[#52768a]"
            required
          />
        </label>
        <label className="mt-4 flex items-start gap-3 rounded-[14px] bg-white p-4 text-sm leading-6">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-1 h-4 w-4"
            required
          />
          I have reviewed the complete agreement and confirm that I accept this
          locked document version and intend to sign it electronically.
        </label>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <button
          disabled={loading || !accepted}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#242424] px-6 text-sm font-medium text-white disabled:opacity-40 sm:w-auto"
        >
          <PenLine size={16} />
          {loading ? 'Signing...' : 'Sign agreement'}
        </button>
      </form>
    </div>
  )
}
