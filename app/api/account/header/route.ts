import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/admin/context'
import { isMarketplaceProfileComplete } from '@/lib/account-profile-bootstrap'

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

  const adminContext = await getAdminContext().catch(() => null)
  const admin = createAdminClient()
  const [{ data: profile }, { data: conversations }] = await Promise.all([
    admin
      .from('marketplace_profiles')
      .select('account_type,display_name,first_name,last_name,birth_date,phone,address_line_1,postal_code,city,company_name,registration_number')
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

  const fallbackName = user.email?.split('@')[0] || 'Autorell'
  const displayName = adminContext
    ? fallbackName
    : profile?.account_type === 'business'
      ? profile.company_name || profile.display_name || fallbackName
      : profile?.first_name || profile?.display_name || fallbackName

  return NextResponse.json(
    {
      authenticated: true,
      displayName,
      accountType: profile?.account_type || null,
      isAdmin: Boolean(adminContext),
      profileComplete: Boolean(adminContext) || isMarketplaceProfileComplete(profile),
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
