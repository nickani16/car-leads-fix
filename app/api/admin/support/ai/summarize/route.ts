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

  const summary =
    (await runInternalSupportTask(
      `Sammanfatta detta supportarende pa svenska i 3-5 korta punkter.\nTicket: ${JSON.stringify(bundle.ticket)}\nMessages: ${JSON.stringify(bundle.messages)}\nChat: ${JSON.stringify(bundle.chatMessages)}`,
    )) ||
    bundle.messages.map((message) => `${message.author_type}: ${message.message}`).join('\n').slice(0, 1200)

  await auth.adminClient.from('support_tickets').update({ ai_summary: summary }).eq('id', ticketId)
  await logSupportEvent({ admin: auth.adminClient, ticketId, actorId: auth.user.id, eventType: 'ai_summary_generated' })
  return NextResponse.json({ summary })
}
