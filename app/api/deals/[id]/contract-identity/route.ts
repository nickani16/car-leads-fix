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

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const countryCodePattern = /^[A-Z]{2}$/

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: 'Invalid deal.' }, { status: 400 })
  }

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json(
      { error: 'Invalid contract details.' },
      { status: 400 }
    )
  }

  const sellerCountry = body.seller?.countryCode?.trim().toUpperCase() || ''
  const buyerCountry = body.buyer?.countryCode?.trim().toUpperCase() || ''
  if (
    !body.seller?.legalName?.trim() ||
    !body.seller.email?.trim() ||
    !body.seller.registeredAddress?.trim() ||
    !body.buyer?.legalName?.trim() ||
    !body.buyer.email?.trim() ||
    !body.buyer.vatNumber?.trim() ||
    !body.buyer.registeredAddress?.trim()
  ) {
    return NextResponse.json(
      { error: 'Complete all required seller and buyer fields.' },
      { status: 400 }
    )
  }
  if (
    !countryCodePattern.test(sellerCountry) ||
    !countryCodePattern.test(buyerCountry)
  ) {
    return NextResponse.json(
      { error: 'Use a valid two-letter country code, for example SE.' },
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
      p_seller_country_code: sellerCountry,
      p_buyer_legal_name: body.buyer?.legalName?.trim() || '',
      p_buyer_email: body.buyer?.email?.trim() || '',
      p_buyer_phone: body.buyer?.phone?.trim() || '',
      p_buyer_registration_number:
        body.buyer?.registrationNumber?.trim() || '',
      p_buyer_vat_number: body.buyer?.vatNumber?.trim() || '',
      p_buyer_registered_address:
        body.buyer?.registeredAddress?.trim() || '',
      p_buyer_country_code: buyerCountry,
    }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, result: data })
}
