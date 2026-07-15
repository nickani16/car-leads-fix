import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPPORT_CATEGORIES, SUPPORT_PRIORITIES, SUPPORT_STATUSES, type SupportCategory, type SupportMessage, type SupportPriority, type SupportStatus, type SupportTicket, type SupportTicketEvent } from './types'
export { SUPPORT_CATEGORIES, SUPPORT_PRIORITIES, SUPPORT_STATUSES }
export type { SupportCategory, SupportMessage, SupportPriority, SupportStatus, SupportTicket, SupportTicketEvent }

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
    events: (events || []) as SupportTicketEvent[],
  }
}
