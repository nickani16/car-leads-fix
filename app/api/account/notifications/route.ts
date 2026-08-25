import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const noStoreHeaders = { 'Cache-Control': 'private, no-store, max-age=0' }

async function authenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await authenticatedUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401, headers: noStoreHeaders })

  const { data, error } = await createAdminClient()
    .from('notifications')
    .select('id,title,body,event_type,read_at,created_at,action_url')
    .eq('recipient_user_id', user.id)
    .contains('channels', ['in_app'])
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: 'Notifications could not be loaded.' }, { status: 500, headers: noStoreHeaders })

  const notifications = data || []
  return NextResponse.json({
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read_at).length,
  }, { headers: noStoreHeaders })
}

export async function PATCH() {
  const user = await authenticatedUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401, headers: noStoreHeaders })

  const { error } = await createAdminClient()
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_user_id', user.id)
    .contains('channels', ['in_app'])
    .is('read_at', null)

  return error
    ? NextResponse.json({ error: 'Notifications could not be updated.' }, { status: 500, headers: noStoreHeaders })
    : NextResponse.json({ success: true }, { headers: noStoreHeaders })
}

export async function DELETE() {
  const user = await authenticatedUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401, headers: noStoreHeaders })

  const { error } = await createAdminClient()
    .from('notifications')
    .delete()
    .eq('recipient_user_id', user.id)
    .contains('channels', ['in_app'])

  return error
    ? NextResponse.json({ error: 'Notifications could not be removed.' }, { status: 500, headers: noStoreHeaders })
    : NextResponse.json({ success: true }, { headers: noStoreHeaders })
}
