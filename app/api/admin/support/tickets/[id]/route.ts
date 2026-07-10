import { NextResponse } from 'next/server'
import { requireSupportAdminRoute } from '@/lib/support/permissions'
import { logSupportEvent } from '@/lib/support/events'
import { normalizeSupportPriority, normalizeSupportStatus } from '@/lib/support/tickets'

type TicketRouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: TicketRouteContext) {
  const auth = await requireSupportAdminRoute()
  if ('error' in auth) return auth.error
  const { id } = await context.params
  const body = (await request.json()) as { message?: string; is_internal?: boolean }
  const message = String(body.message || '').trim()
  if (!message) return NextResponse.json({ error: 'message is required.' }, { status: 400 })

  const isInternal = Boolean(body.is_internal)
  const { error } = await auth.adminClient.from('support_messages').insert({
    ticket_id: id,
    author_id: auth.user.id,
    author_type: 'support',
    message,
    is_internal: isInternal,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await logSupportEvent({
    admin: auth.adminClient,
    ticketId: id,
    actorId: auth.user.id,
    eventType: isInternal ? 'internal_note_created' : 'customer_reply_sent',
  })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, context: TicketRouteContext) {
  const auth = await requireSupportAdminRoute()
  if ('error' in auth) return auth.error
  const { id } = await context.params
  const body = (await request.json()) as {
    status?: string
    priority?: string
    assigned_to?: string | null
  }

  const patch: Record<string, unknown> = {}
  const eventData: Record<string, unknown> = {}
  let eventType = 'ticket_updated'

  if (body.status !== undefined) {
    const status = normalizeSupportStatus(body.status)
    if (!status) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    patch.status = status
    patch.closed_at = status === 'closed' ? new Date().toISOString() : null
    eventType = 'status_changed'
    eventData.status = status
  }
  if (body.priority !== undefined) {
    const priority = normalizeSupportPriority(body.priority)
    if (!priority) return NextResponse.json({ error: 'Invalid priority.' }, { status: 400 })
    patch.priority = priority
    eventType = 'priority_changed'
    eventData.priority = priority
  }
  if (body.assigned_to !== undefined) {
    patch.assigned_to = body.assigned_to || null
    eventType = 'assigned'
    eventData.assigned_to = body.assigned_to || null
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: 'No valid updates provided.' }, { status: 400 })
  }

  const { error } = await auth.adminClient.from('support_tickets').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await logSupportEvent({ admin: auth.adminClient, ticketId: id, actorId: auth.user.id, eventType, eventData })
  return NextResponse.json({ success: true })
}
