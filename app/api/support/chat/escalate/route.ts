import { NextResponse } from 'next/server'
import { assertChatAccess, getChatMessages } from '@/lib/support/chat'
import { getOptionalUser } from '@/lib/support/permissions'
import { logSupportEvent } from '@/lib/support/events'
import { normalizeSupportCategory, normalizeSupportPriority } from '@/lib/support/tickets'

export async function POST(request: Request) {
  const body = (await request.json()) as {
    session_id?: string
    anonymous_session_id?: string
    customer_name?: string
    customer_email?: string
    customer_phone?: string
    customer_country?: string
    description?: string
    category?: string
    priority?: string
  }
  if (!body.session_id) {
    return NextResponse.json({ error: 'session_id is required.' }, { status: 400 })
  }

  const user = await getOptionalUser()
  if (!user && (!body.customer_name || !body.customer_email || !body.customer_country)) {
    return NextResponse.json(
      { error: 'Name, email and country are required for anonymous support tickets.' },
      { status: 400 },
    )
  }

  const access = await assertChatAccess({
    sessionId: body.session_id,
    userId: user?.id,
    anonymousSessionId: body.anonymous_session_id,
  })
  if (!access) return NextResponse.json({ error: 'Chat session not found.' }, { status: 404 })

  const { admin, session } = access
  if (session.linked_ticket_id) {
    return NextResponse.json({ ticket_id: session.linked_ticket_id, already_exists: true })
  }

  const chatMessages = await getChatMessages(admin, session.id)
  const latestCustomerMessage =
    [...chatMessages].reverse().find((message) => message.role === 'customer')?.message ||
    body.description ||
    'Support request'

  const { data: ticket, error: ticketError } = await admin
    .from('support_tickets')
    .insert({
      user_id: user?.id || null,
      chat_session_id: session.id,
      customer_name: body.customer_name || null,
      customer_email: body.customer_email || user?.email || null,
      customer_phone: body.customer_phone || null,
      customer_country: body.customer_country || session.country || null,
      subject: latestCustomerMessage.slice(0, 120),
      category: normalizeSupportCategory(body.category),
      priority: normalizeSupportPriority(body.priority) || 'normal',
      customer_language: session.customer_language || session.locale || null,
      ai_summary: body.description || latestCustomerMessage,
      ai_risk_level: body.priority === 'urgent' ? 'high' : null,
      ai_recommended_action: 'Human support should review this escalated chat before taking action.',
    })
    .select('*')
    .single()

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 400 })

  const supportMessages = chatMessages.map((chatMessage) => ({
    ticket_id: ticket.id,
    author_id: chatMessage.role === 'customer' ? user?.id || null : null,
    author_type: chatMessage.role === 'customer' ? 'customer' : chatMessage.role === 'ai' ? 'ai' : 'system',
    message: chatMessage.message,
    is_internal: false,
    original_language: chatMessage.original_language,
    translated_message: chatMessage.translated_message,
    created_at: chatMessage.created_at,
  }))
  if (supportMessages.length) await admin.from('support_messages').insert(supportMessages)

  await admin
    .from('support_chat_sessions')
    .update({ linked_ticket_id: ticket.id, status: 'escalated' })
    .eq('id', session.id)

  await logSupportEvent({ admin, ticketId: ticket.id, actorId: user?.id, eventType: 'ticket_created' })
  await logSupportEvent({ admin, ticketId: ticket.id, actorId: user?.id, eventType: 'chat_escalated' })

  return NextResponse.json({ ticket_id: ticket.id })
}
