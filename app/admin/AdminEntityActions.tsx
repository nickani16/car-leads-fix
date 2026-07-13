'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, X } from 'lucide-react'

type AdminAction = {
  action: string
  label: string
  tone?: 'default' | 'danger'
  requiresReason?: boolean
  confirmTitle?: string
  confirmText?: string
}

export default function AdminEntityActions({
  endpoint,
  actions,
}: {
  endpoint: string
  actions: AdminAction[]
}) {
  const router = useRouter()
  const [active, setActive] = useState<AdminAction | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')

  async function run(action: AdminAction, reasonText = '') {
    setBusy(action.action)
    setMessage('')
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: action.action, reason: reasonText }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    setBusy('')
    setActive(null)
    setReason('')
    if (!response.ok) {
      setMessage(result.error || 'Åtgärden kunde inte genomföras.')
      return
    }
    router.refresh()
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.action}
            type="button"
            disabled={busy !== ''}
            onClick={() => {
              if (action.tone === 'danger' || action.requiresReason) {
                setActive(action)
              } else {
                void run(action)
              }
            }}
            className={`rounded-[10px] border px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${
              action.tone === 'danger'
                ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                : 'border-[#d7deea] bg-white text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]'
            }`}
          >
            {busy === action.action ? '...' : action.label}
          </button>
        ))}
        {message ? <span role="alert" className="text-xs font-semibold text-red-700">{message}</span> : null}
      </div>

      {active ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#0f172a]/45 p-4">
          <section
            className="w-full max-w-[460px] rounded-[16px] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,.28)]"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-action-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-red-50 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h2 id="admin-action-title" className="text-lg font-black text-[#101828]">
                    {active.confirmTitle || active.label}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">
                    {active.confirmText ||
                      'Det här är en känslig adminåtgärd. Bekräfta och ange en intern anledning.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#f2f4f7]"
                aria-label="Stäng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="mt-5 grid gap-2 text-sm font-bold text-[#344054]">
              Intern anledning
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                className="resize-none rounded-[12px] border border-[#d7deea] p-3 text-sm font-normal outline-none focus:border-[#0866ff] focus:ring-2 focus:ring-[#dbeafe]"
                placeholder="Exempel: felaktiga uppgifter, misstänkt bedrägeri eller kundbegäran."
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-[10px] border border-[#d7deea] px-4 py-2 text-sm font-bold text-[#344054]"
              >
                Avbryt
              </button>
              <button
                type="button"
                disabled={active.requiresReason && reason.trim().length < 8}
                onClick={() => void run(active, reason.trim())}
                className="rounded-[10px] bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Bekräfta
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
