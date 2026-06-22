import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to contact the seller.' }, { status: 401 })

  const { leadId } = (await request.json()) as { leadId?: string }
  if (!leadId) return NextResponse.json({ error: 'Listing is missing.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: lead } = await admin
    .from('leads')
    .select('id,seller_user_id,status')
    .eq('id', leadId)
    .maybeSingle()

  if (!lead?.seller_user_id || lead.status !== 'Active') {
    return NextResponse.json({ error: 'This seller cannot receive messages yet.' }, { status: 409 })
  }
  if (lead.seller_user_id === user.id) {
    return NextResponse.json({ error: 'You cannot message your own listing.' }, { status: 409 })
  }

  const { data, error } = await admin
    .from('marketplace_conversations')
    .upsert({
      lead_id: lead.id,
      buyer_user_id: user.id,
      seller_user_id: lead.seller_user_id,
      last_message_at: new Date().toISOString(),
    }, { onConflict: 'lead_id,buyer_user_id,seller_user_id' })
    .select('id')
    .single()

  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ id: data.id })
}
