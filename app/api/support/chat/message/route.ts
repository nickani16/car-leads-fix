import { NextResponse } from 'next/server'
import { answerCustomerSupport } from '@/lib/ai/support-chat'
import { assertChatAccess, getChatMessages } from '@/lib/support/chat'
import { getOptionalUser } from '@/lib/support/permissions'

export async function POST(request: Request) {
  const body = (await request.json()) as {
    session_id?: string
    anonymous_session_id?: string
    message?: string
    attachment?: {
      name?: string
      type?: string
      size?: number
      dataUrl?: string
    } | null
  }
  const message = String(body.message || '').trim()
  if (!body.session_id || !message) {
    return NextResponse.json({ error: 'session_id and message are required.' }, { status: 400 })
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })
  }
  const attachment = body.attachment
    ? {
        name: String(body.attachment.name || '').slice(0, 180),
        type: String(body.attachment.type || ''),
        size: Number(body.attachment.size || 0),
        dataUrl: String(body.attachment.dataUrl || ''),
      }
    : null
  if (attachment) {
    if (!attachment.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image attachments are allowed.' }, { status: 400 })
    }
    if (attachment.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image attachment is too large.' }, { status: 400 })
    }
    if (!attachment.dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image attachment.' }, { status: 400 })
    }
  }

  const user = await getOptionalUser()
  const access = await assertChatAccess({
    sessionId: body.session_id,
    userId: user?.id,
    anonymousSessionId: body.anonymous_session_id,
  })
  if (!access) return NextResponse.json({ error: 'Chat session not found.' }, { status: 404 })

  const { admin, session } = access
  const { error: customerError } = await admin.from('support_chat_messages').insert({
    session_id: session.id,
    role: 'customer',
    message,
    metadata: attachment ? { attachment } : {},
  })
  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 400 })
  }

  const history = await getChatMessages(admin, session.id)
  const ai = await answerCustomerSupport({
    message: attachment ? `${message}\n\nKunden bifogade en bild: ${attachment.name}. Du kan inte fatta beslut baserat enbart pa bilden; be support granska manuellt om bilden ar viktig.` : message,
    history,
    locale: session.customer_language || session.locale,
  })

  const { data: aiMessage, error: aiError } = await admin
    .from('support_chat_messages')
    .insert({
      session_id: session.id,
      role: 'ai',
      message: ai.answer,
      original_language: ai.language,
      metadata: {
        escalation_required: ai.escalation_required,
        escalation_reason: ai.escalation_reason,
        suggested_category: ai.suggested_category,
        suggested_priority: ai.suggested_priority,
        risk_level: ai.risk_level,
      },
    })
    .select('*')
    .single()

  if (aiError) return NextResponse.json({ error: aiError.message }, { status: 400 })

  await admin
    .from('support_chat_sessions')
    .update({ customer_language: ai.language })
    .eq('id', session.id)

  return NextResponse.json({
    message: aiMessage,
    answer: ai.answer,
    escalation_required: ai.escalation_required,
    escalation_reason: ai.escalation_reason,
    suggested_category: ai.suggested_category,
    suggested_priority: ai.suggested_priority,
    risk_level: ai.risk_level,
  })
}
