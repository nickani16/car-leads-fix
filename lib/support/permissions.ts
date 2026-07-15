import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { requireAdminRoute } from '@/lib/admin-route-auth'

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
  return requireAdminRoute('support.manage')
}
