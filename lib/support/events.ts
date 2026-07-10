import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function logSupportEvent({
  admin,
  ticketId,
  actorId,
  eventType,
  eventData,
}: {
  admin: SupabaseClient
  ticketId: string
  actorId?: string | null
  eventType: string
  eventData?: Record<string, unknown>
}) {
  const { error } = await admin.from('support_ticket_events').insert({
    ticket_id: ticketId,
    actor_id: actorId || null,
    event_type: eventType,
    event_data: eventData || {},
  })

  if (error) {
    console.error('support event failed', error)
  }
}
