'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Badge } from '@/app/admin/AdminUI'
import { formatDate, statusTone } from '@/app/admin/admin-helpers'
import type { SupportMessage, SupportTicket } from '@/lib/support/tickets'
import InternalNoteBox from './InternalNoteBox'
import SupportAiPanel from './SupportAiPanel'

type Agent = {
  user_id: string
  display_name: string | null
  role: string
}

export default function SupportTicketDetail({
  ticket,
  messages,
  chatMessages,
  agents,
}: {
  ticket: SupportTicket
  messages: SupportMessage[]
  chatMessages: {
    id: string
    role: string
    message: string
    created_at: string
    metadata?: {
      attachment?: {
        name: string
        dataUrl: string
      }
    }
  }[]
  agents: Agent[]
}) {
  const router = useRouter()
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)

  function refresh() {
    router.refresh()
  }

  async function patch(payload: Record<string, unknown>) {
    setBusy(true)
    await fetch(`/api/admin/support/tickets/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setBusy(false)
    refresh()
  }

  async function sendReply() {
    if (!reply.trim()) return
    setBusy(true)
    await fetch(`/api/admin/support/tickets/${ticket.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: reply, is_internal: false }),
    })
    setReply('')
    setBusy(false)
    refresh()
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 rounded-[8px] border border-[#dce3ee] bg-white shadow-[0_12px_35px_rgba(16,24,40,.045)]">
        <div className="border-b border-[#edf1f6] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#101828]">{ticket.subject}</h2>
              <p className="mt-1 text-sm text-[#667085]">
                {ticket.customer_email || ticket.customer_name || 'Okand kund'} | {formatDate(ticket.created_at)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge label={ticket.status} tone={statusTone(ticket.status)} />
              <Badge label={ticket.priority} tone={ticket.priority === 'urgent' || ticket.priority === 'high' ? 'red' : 'gray'} />
              <Badge label={ticket.category} tone="blue" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <select value={ticket.status} disabled={busy} onChange={(event) => void patch({ status: event.target.value })} className="h-10 rounded-[8px] border border-[#d7deea] px-3 text-sm">
              {['open', 'waiting_customer', 'waiting_internal', 'resolved', 'closed'].map((status) => <option key={status}>{status}</option>)}
            </select>
            <select value={ticket.priority} disabled={busy} onChange={(event) => void patch({ priority: event.target.value })} className="h-10 rounded-[8px] border border-[#d7deea] px-3 text-sm">
              {['low', 'normal', 'high', 'urgent'].map((priority) => <option key={priority}>{priority}</option>)}
            </select>
            <select value={ticket.assigned_to || ''} disabled={busy} onChange={(event) => void patch({ assigned_to: event.target.value || null })} className="h-10 rounded-[8px] border border-[#d7deea] px-3 text-sm">
              <option value="">Ej tilldelad</option>
              {agents.map((agent) => (
                <option key={agent.user_id} value={agent.user_id}>
                  {agent.display_name || agent.role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 p-5">
          <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#667085]">Kundmeddelanden</h3>
          {messages.length ? messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-[8px] border p-4 ${
                message.is_internal
                  ? 'border-amber-200 bg-amber-50'
                  : message.author_type === 'customer'
                    ? 'border-[#dbeafe] bg-[#f8fbff]'
                    : 'border-[#e5e7eb] bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-xs text-[#667085]">
                <span className="font-bold uppercase tracking-[0.12em]">
                  {message.is_internal ? 'Intern anteckning' : message.author_type}
                </span>
                <span>{formatDate(message.created_at)}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#344054]">{message.message}</p>
            </article>
          )) : (
            <p className="text-sm text-[#667085]">Inga meddelanden ännu.</p>
          )}

          {chatMessages.length ? (
            <details className="rounded-[8px] border border-[#dce3ee] bg-[#f8fafc] p-4">
              <summary className="cursor-pointer text-sm font-bold text-[#101828]">Kopplad chatthistorik</summary>
              <div className="mt-4 grid gap-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className="rounded-[8px] bg-white p-3 text-sm">
                    <p className="font-bold text-[#101828]">{message.role}</p>
                    <p className="mt-1 whitespace-pre-wrap leading-6 text-[#667085]">{message.message}</p>
                    {message.metadata?.attachment ? (
                      <div className="mt-3 overflow-hidden rounded-[8px] border border-[#dce3ee]">
                        <img
                          src={message.metadata.attachment.dataUrl}
                          alt={message.metadata.attachment.name}
                          className="max-h-72 w-full object-contain"
                        />
                        <p className="truncate border-t border-[#edf1f6] px-3 py-2 text-xs text-[#667085]">
                          {message.metadata.attachment.name}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </details>
          ) : null}

          <div className="rounded-[8px] border border-[#dce3ee] p-3">
            <textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Skriv kundsvar" className="h-28 w-full resize-none rounded-[8px] border border-[#d7deea] p-3 text-sm outline-none focus:border-[#0866ff]" />
            <button type="button" disabled={busy || !reply.trim()} onClick={() => void sendReply()} className="mt-2 h-10 rounded-[8px] bg-[#0866ff] px-4 text-sm font-bold text-white disabled:bg-[#98a2b3]">
              Skicka svar
            </button>
          </div>

          <InternalNoteBox ticketId={ticket.id} onDone={refresh} />
        </div>
      </section>

      <SupportAiPanel ticket={ticket} onRefresh={refresh} />
    </div>
  )
}
