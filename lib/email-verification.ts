import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { emailHash, normalizeEmail } from '@/lib/email-code-auth'

export async function hasVerifiedEmailCode(email: string | null | undefined) {
  const normalized = normalizeEmail(email)
  if (!normalized) return false

  const { count } = await createAdminClient()
    .from('auth_email_codes')
    .select('id', { count: 'exact', head: true })
    .eq('email_hash', emailHash(normalized))
    .eq('redirect_path', 'email_verification')
    .not('consumed_at', 'is', null)

  return Boolean(count)
}
