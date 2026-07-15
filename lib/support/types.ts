export const SUPPORT_STATUSES = ['new', 'assigned', 'in_progress', 'waiting_for_customer', 'escalated', 'resolved', 'closed', 'reopened'] as const
export const SUPPORT_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const
export const SUPPORT_CATEGORIES = ['listing', 'account', 'payment', 'business_account', 'report_listing', 'fraud', 'gdpr', 'technical', 'other'] as const

export type SupportStatus = (typeof SUPPORT_STATUSES)[number]
export type SupportPriority = (typeof SUPPORT_PRIORITIES)[number]
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number]
export type SupportTicket = {
  id: string; user_id: string | null; listing_id: string | null; company_id: string | null; payment_order_id: string | null
  chat_session_id: string | null; assigned_to: string | null; customer_name: string | null; customer_email: string | null
  customer_phone: string | null; customer_country: string | null; market: string | null; subject: string; category: SupportCategory
  priority: SupportPriority; status: SupportStatus; customer_language: string | null; ai_summary: string | null
  ai_risk_level: string | null; ai_recommended_action: string | null; created_at: string; updated_at: string; closed_at: string | null
  escalated_at: string | null; first_response_at: string | null; resolved_at: string | null; reopened_at: string | null; last_message_at: string | null
}
export type SupportMessage = { id: string; ticket_id: string; author_id: string | null; author_type: 'customer' | 'support' | 'ai' | 'system'; message: string; is_internal: boolean; original_language: string | null; translated_message: string | null; created_at: string }
export type SupportTicketEvent = { id: string; ticket_id: string; actor_id: string | null; event_type: string; event_data: Record<string, unknown>; created_at: string }
