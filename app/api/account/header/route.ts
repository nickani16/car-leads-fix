import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      {
        authenticated: false,
        unreadMessages: 0,
        conversationCount: 0,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    )
  }

  const admin = createAdminClient()
  const [{ data: profile }, { data: conversations }] = await Promise.all([
    admin
      .from('marketplace_profiles')
      .select('account_type,display_name,first_name,company_name')
      .eq('user_id', user.id)
      .maybeSingle(),
    admin
      .from('marketplace_conversations')
      .select('id,buyer_user_id,seller_user_id')
      .or(`buyer_user_id.eq.${user.id},seller_user_id.eq.${user.id}`),
  ])

  const conversationIds = (conversations || []).map((conversation) => conversation.id)
  let unreadMessages = 0
  let visibleConversationCount = 0

  if (conversationIds.length) {
    const [{ count }, { data: messageConversationData }] = await Promise.all([
      admin
        .from('marketplace_messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_user_id', user.id)
        .is('read_at', null),
      admin
        .from('marketplace_messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds),
    ])
    unreadMessages = count || 0
    const conversationsWithMessages = new Set(
      (messageConversationData || []).map((message) => message.conversation_id),
    )
    visibleConversationCount = (conversations || []).filter(
      (conversation) =>
        conversation.buyer_user_id === user.id ||
        conversationsWithMessages.has(conversation.id),
    ).length
  }

  const displayName =
    profile?.account_type === 'business'
      ? profile.company_name || profile.display_name || user.email?.split('@')[0] || 'Autorell'
      : profile?.first_name || profile?.display_name || user.email?.split('@')[0] || 'Autorell'

  return NextResponse.json(
    {
      authenticated: true,
      displayName,
      accountType: profile?.account_type || null,
      unreadMessages,
      conversationCount: visibleConversationCount,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  )
}
