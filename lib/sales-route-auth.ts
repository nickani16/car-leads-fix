import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function requireSalesRoute() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Not authenticated.' }, { status: 401 }),
    }
  }

  const adminClient = createAdminClient()
  const { data: staffUser } = await adminClient
    .from('staff_users')
    .select('user_id,role,display_name,email')
    .eq('user_id', user.id)
    .eq('role', 'sales')
    .eq('is_active', true)
    .maybeSingle()

  if (!staffUser) {
    return {
      error: NextResponse.json(
        { error: 'Active sales access required.' },
        { status: 403 }
      ),
    }
  }

  return { user, staffUser, adminClient }
}
