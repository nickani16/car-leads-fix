import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

export type SupportChatSession = {
  id: string
  user_id: string | null
  anonymous_session_id: string | null
  locale: string | null
  country: string | null
  customer_language: string | null
  status: string
  linked_ticket_id: string | null
  created_at: string
  updated_at: string
}

export type SupportChatMessage = {
  id: string
  session_id: string
  role: 'customer' | 'ai' | 'support' | 'system'
  message: string
  original_language: string | null
  translated_message: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export async function getOrCreateChatSession({
  userId,
  anonymousSessionId,
  locale,
  country,
}: {
  userId?: string | null
  anonymousSessionId: string
  locale?: string | null
  country?: string | null
}) {
  const admin = createAdminClient()
  let query = admin.from('support_chat_sessions').select('*').eq('status', 'active').limit(1)
  query = userId ? query.eq('user_id', userId) : query.eq('anonymous_session_id', anonymousSessionId).is('user_id', null)
  const { data: existing } = await query.maybeSingle()

  if (existing) {
    await admin
      .from('support_chat_sessions')
      .update({ locale: locale || existing.locale, country: country || existing.country, user_id: userId || existing.user_id })
      .eq('id', existing.id)
    return existing as SupportChatSession
  }

  const { data, error } = await admin
    .from('support_chat_sessions')
    .insert({
      user_id: userId || null,
      anonymous_session_id: anonymousSessionId,
      locale: locale || null,
      country: country || null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as SupportChatSession
}

export async function getChatMessages(admin: SupabaseClient, sessionId: string) {
  const { data, error } = await admin
    .from('support_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []) as SupportChatMessage[]
}

export async function assertChatAccess({
  sessionId,
  userId,
  anonymousSessionId,
}: {
  sessionId: string
  userId?: string | null
  anonymousSessionId?: string | null
}) {
  const admin = createAdminClient()
  const { data: session, error } = await admin
    .from('support_chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle()

  if (error || !session) return null
  if (session.user_id && session.user_id !== userId) return null
  if (!session.user_id && session.anonymous_session_id !== anonymousSessionId) return null
  return { admin, session: session as SupportChatSession }
}
