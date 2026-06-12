import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { leadId } = (await request.json()) as { leadId?: string }
  if (!leadId) {
    return NextResponse.json({ error: 'Missing vehicle.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: dealer } = await admin
    .from('dealers')
    .select('id,status')
    .eq('user_id', user.id)
    .single()

  if (!dealer || dealer.status !== 'approved') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await admin.from('vehicle_listing_views').upsert(
    {
      lead_id: leadId,
      dealer_id: dealer.id,
      viewed_on: new Date().toISOString().slice(0, 10),
      viewed_at: new Date().toISOString(),
    },
    { onConflict: 'lead_id,dealer_id,viewed_on' }
  )

  if (error) {
    console.error('Vehicle view tracking error:', error)
    return NextResponse.json({ error: 'Could not track view.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
