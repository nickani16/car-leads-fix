import { NextResponse } from 'next/server'
import { requireAdminRoute } from '@/lib/admin-route-auth'

type RequestBody = {
  legalName?: string
  registrationNumber?: string
  vatNumber?: string
  registeredAddress?: string
  countryCode?: string
  email?: string
}

export async function POST(request: Request) {
  const auth = await requireAdminRoute('system.manage')
  if ('error' in auth) return auth.error
  const body = (await request.json()) as RequestBody
  const { data, error } = await auth.adminClient.rpc(
    'update_platform_legal_entity',
    {
      p_legal_name: body.legalName?.trim() || '',
      p_registration_number: body.registrationNumber?.trim() || '',
      p_vat_number: body.vatNumber?.trim() || null,
      p_registered_address: body.registeredAddress?.trim() || '',
      p_country_code: body.countryCode?.trim().toUpperCase() || '',
      p_email: body.email?.trim().toLowerCase() || null,
      p_actor_role: auth.primaryRole,
    }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, result: data })
}
