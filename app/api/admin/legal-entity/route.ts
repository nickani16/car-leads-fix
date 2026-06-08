import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type RequestBody = {
  legalName?: string
  registrationNumber?: string
  vatNumber?: string
  registeredAddress?: string
  countryCode?: string
  email?: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const adminClient = createAdminClient()
  const { data: adminUser } = await adminClient
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  }

  const { data, error } = await adminClient.rpc(
    'update_platform_legal_entity',
    {
      p_legal_name: body.legalName?.trim() || '',
      p_registration_number: body.registrationNumber?.trim() || '',
      p_vat_number: body.vatNumber?.trim() || null,
      p_registered_address: body.registeredAddress?.trim() || '',
      p_country_code: body.countryCode?.trim().toUpperCase() || '',
      p_email: body.email?.trim().toLowerCase() || null,
      p_actor_role: adminUser.role,
    }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, result: data })
}
