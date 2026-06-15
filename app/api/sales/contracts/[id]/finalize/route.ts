import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    'finalize_contract_version_for_signature',
    {
      p_document_id: id,
      p_actor_user_id: user.id,
    }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, result: data })
}
