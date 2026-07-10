import { NextResponse } from 'next/server'
import { runInternalSupportJsonTask } from '@/lib/ai/support-chat'
import { logSupportEvent } from '@/lib/support/events'
import { requireSupportAdminRoute } from '@/lib/support/permissions'
import { fetchTicketBundle, normalizeSupportCategory, normalizeSupportPriority } from '@/lib/support/tickets'

export async function POST(request: Request) {
  const auth = await requireSupportAdminRoute()
  if ('error' in auth) return auth.error
  const { ticket_id: ticketId } = (await request.json()) as { ticket_id?: string }
  if (!ticketId) return NextResponse.json({ error: 'ticket_id is required.' }, { status: 400 })

  const bundle = await fetchTicketBundle(auth.adminClient, ticketId)
  if (!bundle) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })

  const classified = await runInternalSupportJsonTask(
    `Klassificera arendet som JSON med category, priority, risk_level, recommended_action. Andra inte status.\nTicket: ${JSON.stringify(bundle.ticket)}\nMessages: ${JSON.stringify(bundle.messages)}\nChat: ${JSON.stringify(bundle.chatMessages)}`,
  )
  const category = normalizeSupportCategory(classified?.category)
  const priority = normalizeSupportPriority(classified?.priority) || bundle.ticket.priority || 'normal'
  const riskLevel = String(classified?.risk_level || 'normal').slice(0, 40)
  const recommendedAction = [
    `Suggested category: ${category}`,
    `Suggested priority: ${priority}`,
    String(
      classified?.recommended_action ||
        'Human support should review the ticket before any account, listing or payment action.',
    ),
  ].join('\n')

  await auth.adminClient
    .from('support_tickets')
    .update({
      ai_risk_level: riskLevel,
      ai_recommended_action: recommendedAction.slice(0, 1200),
    })
    .eq('id', ticketId)
  await logSupportEvent({
    admin: auth.adminClient,
    ticketId,
    actorId: auth.user.id,
    eventType: 'ai_classification_generated',
    eventData: { category, priority, riskLevel },
  })
  return NextResponse.json({ category, priority, risk_level: riskLevel, recommended_action: recommendedAction })
}
