import Link from 'next/link'
import { Badge } from '@/app/admin/AdminUI'
import { formatDate, statusTone } from '@/app/admin/admin-helpers'
import type { SupportTicket } from '@/lib/support/tickets'

export default function SupportTicketList({
  tickets,
  selectedId,
  query,
}: {
  tickets: SupportTicket[]
  selectedId?: string
  query: URLSearchParams
}) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#dce3ee] bg-white">
      {tickets.map((ticket) => {
        const nextQuery = new URLSearchParams(query)
        nextQuery.set('ticket', ticket.id)
        return (
          <Link
            key={ticket.id}
            href={`/admin/support?${nextQuery.toString()}`}
            className={`block border-b border-[#edf1f6] p-4 last:border-b-0 hover:bg-[#f8fafc] ${
              selectedId === ticket.id ? 'bg-[#eff6ff]' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="line-clamp-2 text-sm font-bold text-[#101828]">{ticket.subject}</p>
              <Badge label={ticket.status} tone={statusTone(ticket.status)} />
            </div>
            <p className="mt-2 text-xs text-[#667085]">{ticket.customer_email || ticket.customer_name || 'Okand kund'}</p>
            <p className="mt-1 text-xs text-[#98a2b3]">{formatDate(ticket.updated_at || ticket.created_at)}</p>
          </Link>
        )
      })}
    </div>
  )
}
