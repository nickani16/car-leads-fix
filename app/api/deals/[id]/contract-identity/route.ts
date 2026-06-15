import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type RequestBody = {
  seller?: PartyBody
  buyer?: PartyBody
}

type PartyBody = {
  legalName?: string
  email?: string
  phone?: string
  registrationNumber?: string
  vatNumber?: string
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
  const { data: staffUser } = await adminClient
    .from('staff_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'sales')
    .eq('is_active', true)
    .maybeSingle()

  if (!staffUser) {
    return NextResponse.json(
      { error: 'Active sales access required.' },
      { status: 403 }
    )
  }

  const { data, error } = await adminClient.rpc(
    'update_contract_party_details',
    {
      p_deal_id: id,
      p_actor_user_id: user.id,
      p_seller_legal_name: body.seller?.legalName?.trim() || '',
      p_seller_email: body.seller?.email?.trim() || '',
      p_seller_phone: body.seller?.phone?.trim() || '',
      p_seller_registration_number:
        body.seller?.registrationNumber?.trim() || '',
      p_seller_registered_address:
        body.seller?.registeredAddress?.trim() || '',
      p_seller_country_code:
        body.seller?.countryCode?.trim().toUpperCase() || '',
      p_buyer_legal_name: body.buyer?.legalName?.trim() || '',
      p_buyer_email: body.buyer?.email?.trim() || '',
      p_buyer_phone: body.buyer?.phone?.trim() || '',
      p_buyer_registration_number:
        body.buyer?.registrationNumber?.trim() || '',
      p_buyer_vat_number: body.buyer?.vatNumber?.trim() || '',
      p_buyer_registered_address:
        body.buyer?.registeredAddress?.trim() || '',
      p_buyer_country_code:
        body.buyer?.countryCode?.trim().toUpperCase() || '',
    }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, result: data })
}
