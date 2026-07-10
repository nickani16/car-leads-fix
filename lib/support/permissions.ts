import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAllowedAdminEmail } from '@/lib/admin-allowlist'

export async function getOptionalUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user || null
  } catch {
    return null
  }
}

export async function requireSupportAdminRoute() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Not authenticated.' }, { status: 401 }) }
  }

  if (!isAllowedAdminEmail(user.email)) {
    return { error: NextResponse.json({ error: 'Support access required.' }, { status: 403 }) }
  }

  const adminClient = createAdminClient()
  const { data: adminUser } = await adminClient
    .from('admin_users')
    .select('role,is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!adminUser) {
    return { error: NextResponse.json({ error: 'Support access required.' }, { status: 403 }) }
  }

  return { user, adminUser, adminClient }
}
