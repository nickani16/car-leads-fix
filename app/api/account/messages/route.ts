import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const body = (await request.json()) as { conversationId?: string; message?: string }
  const message = body.message?.trim() || ''
  if (!body.conversationId || message.length < 1 || message.length > 3000) {
    return NextResponse.json({ error: 'Write a message of up to 3,000 characters.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: conversation } = await admin
    .from('marketplace_conversations')
    .select('id,buyer_user_id,seller_user_id,status')
    .eq('id', body.conversationId)
    .maybeSingle()

  if (
    !conversation ||
    conversation.status !== 'open' ||
    ![conversation.buyer_user_id, conversation.seller_user_id].includes(user.id)
  ) {
    return NextResponse.json({ error: 'Conversation is unavailable.' }, { status: 403 })
  }

  const { error } = await admin.from('marketplace_messages').insert({
    conversation_id: conversation.id,
    sender_user_id: user.id,
    body: message,
  })
  if (!error) {
    await admin.from('marketplace_conversations').update({
      last_message_at: new Date().toISOString(),
    }).eq('id', conversation.id)
  }

  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ success: true })
}
