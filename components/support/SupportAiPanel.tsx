'use client'

import { Bot, Languages, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { SupportTicket } from '@/lib/support/tickets'

export default function SupportAiPanel({
  ticket,
  onRefresh,
}: {
  ticket: SupportTicket
  onRefresh: () => void
}) {
  const [reply, setReply] = useState('')
  const [translation, setTranslation] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  async function run(endpoint: string, key?: 'reply' | 'translation') {
    setBusy(endpoint)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: ticket.id }),
    })
    const data = await response.json()
    if (key === 'reply') setReply(data.reply || '')
    if (key === 'translation') setTranslation(data.translation || '')
    setBusy(null)
    if (!key) onRefresh()
  }

  async function translate() {
    const text = reply || ticket.ai_summary || ticket.subject
    setBusy('translate')
    const response = await fetch('/api/admin/support/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source_language: ticket.customer_language || 'auto', target_language: 'sv' }),
    })
    const data = await response.json()
    setTranslation(data.translation || '')
    setBusy(null)
  }

  return (
    <aside className="rounded-[8px] border border-[#dce3ee] bg-white p-4 shadow-[0_12px_35px_rgba(16,24,40,.045)]">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-[#0866ff]" />
        <h2 className="text-base font-bold text-[#101828]">AI-panel</h2>
      </div>
      <div className="mt-4 grid gap-2">
        <button type="button" disabled={Boolean(busy)} onClick={() => void run('/api/admin/support/ai/summarize')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-3 text-sm font-bold text-white disabled:bg-[#98a2b3]">
          <Sparkles className="h-4 w-4" />
          Sammanfatta med AI
        </button>
        <button type="button" disabled={Boolean(busy)} onClick={() => void run('/api/admin/support/ai/suggest-reply', 'reply')} className="min-h-10 rounded-[8px] border border-[#d7deea] px-3 text-sm font-bold text-[#344054] disabled:text-[#98a2b3]">
          Föreslå svar
        </button>
        <button type="button" disabled={Boolean(busy)} onClick={() => void run('/api/admin/support/ai/classify')} className="min-h-10 rounded-[8px] border border-[#d7deea] px-3 text-sm font-bold text-[#344054] disabled:text-[#98a2b3]">
          Klassificera
        </button>
        <button type="button" disabled={Boolean(busy)} onClick={() => void translate()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-[#d7deea] px-3 text-sm font-bold text-[#344054] disabled:text-[#98a2b3]">
          <Languages className="h-4 w-4" />
          Översätt
        </button>
      </div>

      <div className="mt-5 space-y-4 text-sm">
        <section>
          <p className="font-bold text-[#101828]">Sammanfattning</p>
          <p className="mt-2 whitespace-pre-wrap leading-6 text-[#667085]">{ticket.ai_summary || 'Ingen AI-sammanfattning än.'}</p>
        </section>
        <section>
          <p className="font-bold text-[#101828]">Risk och rekommendation</p>
          <p className="mt-2 text-[#667085]">Risk: {ticket.ai_risk_level || 'Saknas'}</p>
          <p className="mt-1 leading-6 text-[#667085]">{ticket.ai_recommended_action || 'Saknas'}</p>
        </section>
        {reply ? (
          <section>
            <p className="font-bold text-[#101828]">Föreslaget svar</p>
            <p className="mt-2 whitespace-pre-wrap rounded-[8px] bg-[#f8fafc] p-3 leading-6 text-[#344054]">{reply}</p>
          </section>
        ) : null}
        {translation ? (
          <section>
            <p className="font-bold text-[#101828]">Översättning</p>
            <p className="mt-2 whitespace-pre-wrap rounded-[8px] bg-[#f8fafc] p-3 leading-6 text-[#344054]">{translation}</p>
          </section>
        ) : null}
      </div>
    </aside>
  )
}
