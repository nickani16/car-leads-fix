import { NextResponse } from 'next/server'
import { getOptionalUser } from '@/lib/support/permissions'
import { getChatMessages, getOrCreateChatSession } from '@/lib/support/chat'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const body = (await request.json()) as {
    anonymous_session_id?: string
    locale?: string
    country?: string
  }
  const anonymousSessionId = String(body.anonymous_session_id || '').slice(0, 120)
  if (!anonymousSessionId) {
    return NextResponse.json({ error: 'anonymous_session_id is required.' }, { status: 400 })
  }

  const user = await getOptionalUser()
  const session = await getOrCreateChatSession({
    userId: user?.id,
    anonymousSessionId,
    locale: body.locale,
    country: body.country,
  })
  const admin = createAdminClient()
  const messages = await getChatMessages(admin, session.id)

  return NextResponse.json({ session, messages })
}
