import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = (await request.json()) as {
    damageEnglish?: string
    equipmentEnglish?: string
  }

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

  const { data: lead } = await adminClient
    .from('leads')
    .select('damage_description,equipment')
    .eq('id', id)
    .maybeSingle()

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
  }

  const damageEnglish = body.damageEnglish?.trim() || null
  const equipmentEnglish = body.equipmentEnglish?.trim() || null

  if (lead.damage_description?.trim() && !damageEnglish) {
    return NextResponse.json(
      { error: 'An English damage description is required.' },
      { status: 400 }
    )
  }

  if (lead.equipment?.trim() && !equipmentEnglish) {
    return NextResponse.json(
      { error: 'An English equipment description is required.' },
      { status: 400 }
    )
  }

  const { error } = await adminClient
    .from('leads')
    .update({
      damage_description_en: damageEnglish,
      equipment_en: equipmentEnglish,
      translation_reviewed_at: new Date().toISOString(),
      translation_reviewed_by: user.id,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const { data: deal } = await adminClient
    .from('deals')
    .select('id,status')
    .eq('lead_id', id)
    .maybeSingle()

  if (
    deal &&
    ['seller_accepted', 'contracts_pending', 'contracts_ready'].includes(
      deal.status
    )
  ) {
    const { error: refreshError } = await adminClient.rpc(
      'refresh_contract_documents',
      { p_deal_id: deal.id }
    )

    if (refreshError) {
      return NextResponse.json(
        {
          error: `Translation saved, but contract drafts could not be regenerated: ${refreshError.message}`,
        },
        { status: 400 }
      )
    }
  }

  return NextResponse.json({ success: true })
}
