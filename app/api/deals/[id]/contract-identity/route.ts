import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type RequestBody = {
  legalName?: string
  registeredAddress?: string
  countryCode?: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = (await request.json()) as RequestBody
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
  if (!actorRole) {
    return NextResponse.json(
      { error: 'Sales or admin access required.' },
      { status: 403 }
    )
  }

  const { data, error } = await adminClient.rpc(
    'update_seller_contract_identity',
    {
      p_deal_id: id,
      p_legal_name: body.legalName?.trim() || '',
      p_registered_address: body.registeredAddress?.trim() || '',
      p_country_code: body.countryCode?.trim().toUpperCase() || '',
      p_actor_user_id: user.id,
      p_actor_role: actorRole,
    }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, result: data })
}
