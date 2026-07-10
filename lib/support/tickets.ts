import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

export const SUPPORT_STATUSES = ['open', 'waiting_customer', 'waiting_internal', 'resolved', 'closed'] as const
export const SUPPORT_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const
export const SUPPORT_CATEGORIES = [
  'listing',
  'account',
  'payment',
  'business_account',
  'report_listing',
  'fraud',
  'gdpr',
  'technical',
  'other',
] as const

export type SupportStatus = (typeof SUPPORT_STATUSES)[number]
export type SupportPriority = (typeof SUPPORT_PRIORITIES)[number]
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number]

export type SupportTicket = {
  id: string
  user_id: string | null
  listing_id: string | null
  chat_session_id: string | null
  assigned_to: string | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  customer_country: string | null
  subject: string
  category: SupportCategory
  priority: SupportPriority
  status: SupportStatus
  customer_language: string | null
  ai_summary: string | null
  ai_risk_level: string | null
  ai_recommended_action: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
}

export type SupportMessage = {
  id: string
  ticket_id: string
  author_id: string | null
  author_type: 'customer' | 'support' | 'ai' | 'system'
  message: string
  is_internal: boolean
  original_language: string | null
  translated_message: string | null
  created_at: string
}

export function normalizeSupportStatus(value: unknown): SupportStatus | null {
  return SUPPORT_STATUSES.includes(value as SupportStatus) ? (value as SupportStatus) : null
}

export function normalizeSupportPriority(value: unknown): SupportPriority | null {
  return SUPPORT_PRIORITIES.includes(value as SupportPriority) ? (value as SupportPriority) : null
}

export function normalizeSupportCategory(value: unknown): SupportCategory {
  return SUPPORT_CATEGORIES.includes(value as SupportCategory) ? (value as SupportCategory) : 'other'
}

export async function fetchTicketBundle(admin: SupabaseClient, ticketId: string) {
  const [{ data: ticket, error: ticketError }, { data: messages }, { data: events }] = await Promise.all([
    admin.from('support_tickets').select('*').eq('id', ticketId).maybeSingle(),
    admin.from('support_messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }),
    admin.from('support_ticket_events').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: false }).limit(30),
  ])

  if (ticketError || !ticket) return null

  let chatMessages: unknown[] = []
  if (ticket.chat_session_id) {
    const { data } = await admin
      .from('support_chat_messages')
      .select('*')
      .eq('session_id', ticket.chat_session_id)
      .order('created_at', { ascending: true })
    chatMessages = data || []
  }

  return {
    ticket: ticket as SupportTicket,
    messages: (messages || []) as SupportMessage[],
    chatMessages,
    events: events || [],
  }
}
