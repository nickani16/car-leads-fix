import { NextResponse } from 'next/server'
import { requireSupportAdminRoute } from '@/lib/support/permissions'
import { normalizeSupportCategory, normalizeSupportPriority } from '@/lib/support/tickets'
import { logSupportEvent } from '@/lib/support/events'

export async function POST(request: Request) {
  const auth = await requireSupportAdminRoute()
  if ('error' in auth) return auth.error

  const body = (await request.json()) as {
    subject?: string
    message?: string
    customer_email?: string
    customer_name?: string
    category?: string
    priority?: string
  }
  const subject = String(body.subject || '').trim()
  const message = String(body.message || '').trim()
  if (!subject || !message) {
    return NextResponse.json({ error: 'subject and message are required.' }, { status: 400 })
  }

  const { data: ticket, error } = await auth.adminClient
    .from('support_tickets')
    .insert({
      subject,
      customer_email: body.customer_email || null,
      customer_name: body.customer_name || null,
      category: normalizeSupportCategory(body.category),
      priority: normalizeSupportPriority(body.priority) || 'normal',
    })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await auth.adminClient.from('support_messages').insert({
    ticket_id: ticket.id,
    author_id: auth.user.id,
    author_type: 'support',
    message,
  })
  await logSupportEvent({ admin: auth.adminClient, ticketId: ticket.id, actorId: auth.user.id, eventType: 'ticket_created' })
  return NextResponse.json({ ticket })
}
