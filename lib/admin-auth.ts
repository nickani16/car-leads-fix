import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAllowedAdminEmail } from '@/lib/admin-allowlist'

export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/se')
  }

  if (!isAllowedAdminEmail(user.email)) {
    redirect('/se')
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role,is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!adminUser) {
    redirect('/se')
  }

  return {
    user,
    adminUser,
    adminClient: createAdminClient(),
  }
}

export async function requireSuperAdmin() {
  const auth = await requireAdmin()

  if (auth.adminUser.role !== 'super_admin') {
    redirect('/admin?status=super-admin-required')
  }

  return auth
}
