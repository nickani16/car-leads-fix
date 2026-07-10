import { NextResponse } from 'next/server'
import { runInternalSupportTask } from '@/lib/ai/support-chat'
import { logSupportEvent } from '@/lib/support/events'
import { requireSupportAdminRoute } from '@/lib/support/permissions'
import { fetchTicketBundle } from '@/lib/support/tickets'

export async function POST(request: Request) {
  const auth = await requireSupportAdminRoute()
  if ('error' in auth) return auth.error
  const { ticket_id: ticketId } = (await request.json()) as { ticket_id?: string }
  if (!ticketId) return NextResponse.json({ error: 'ticket_id is required.' }, { status: 400 })

  const bundle = await fetchTicketBundle(auth.adminClient, ticketId)
  if (!bundle) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })

  const reply =
    (await runInternalSupportTask(
      `Foresla ett kort professionellt kundsvar. Skicka inget automatiskt. Svara pa kundens sprak om mojligt.\nTicket: ${JSON.stringify(bundle.ticket)}\nMessages: ${JSON.stringify(bundle.messages)}\nChat: ${JSON.stringify(bundle.chatMessages)}`,
    )) ||
    'Tack for ditt meddelande. Vi har tagit emot arendet och aterkommer nar supporten har granskat uppgifterna.'

  await logSupportEvent({ admin: auth.adminClient, ticketId, actorId: auth.user.id, eventType: 'ai_reply_suggested' })
  return NextResponse.json({ reply })
}
