import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type SellerDecisionRequest = {
  decision?: 'accepted' | 'declined'
  notes?: string
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: 'Invalid deal.' }, { status: 400 })
  }

  const body = (await request.json()) as SellerDecisionRequest
  if (body.decision !== 'accepted' && body.decision !== 'declined') {
    return NextResponse.json(
      { error: 'Choose accepted or declined.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const adminClient = createAdminClient()
  const [{ data: adminUser }, { data: staffUser }] = await Promise.all([
    adminClient
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle(),
    adminClient
      .from('staff_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'sales')
      .eq('is_active', true)
      .maybeSingle(),
  ])

  const actorRole = adminUser?.role || staffUser?.role
  if (!actorRole || !['admin', 'super_admin', 'sales'].includes(actorRole)) {
    return NextResponse.json(
      { error: 'Sales or admin access required.' },
      { status: 403 }
    )
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || null
  const userAgent = request.headers.get('user-agent')

  const { data, error } = await adminClient.rpc('record_seller_decision', {
    p_deal_id: id,
    p_decision: body.decision,
    p_notes: body.notes?.trim() || null,
    p_actor_user_id: user.id,
    p_actor_role: actorRole,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
  })

  if (error) {
    return NextResponse.json(
      { error: error.message || 'Seller decision could not be recorded.' },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, result: data })
}
