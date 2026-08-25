import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { emailHash, normalizeEmail } from '@/lib/email-code-auth'

type AuthEmailUser = {
  email?: string | null
  email_confirmed_at?: string | null
}

export function hasConfirmedSupabaseEmail(
  user: AuthEmailUser | null | undefined,
  email: string | null | undefined,
) {
  const normalizedEmail = normalizeEmail(email)
  return Boolean(
    normalizedEmail &&
      user?.email_confirmed_at &&
      normalizeEmail(user.email) === normalizedEmail,
  )
}

export async function hasVerifiedAccountEmail(
  email: string | null | undefined,
  user: AuthEmailUser | null | undefined,
) {
  return hasConfirmedSupabaseEmail(user, email) || (await hasVerifiedEmailCode(email))
}

export async function hasVerifiedEmailCode(email: string | null | undefined) {
  const normalized = normalizeEmail(email)
  if (!normalized) return false

  const admin = createAdminClient()
  const scoped = await admin
    .from('auth_email_codes')
    .select('id', { count: 'exact', head: true })
    .eq('email_hash', emailHash(normalized))
    .eq('redirect_path', 'email_verification')
    .not('consumed_at', 'is', null)

  if (scoped.error?.code !== 'PGRST204') {
    return Boolean(scoped.count)
  }

  const fallback = await admin
    .from('auth_email_codes')
    .select('id', { count: 'exact', head: true })
    .eq('email_hash', emailHash(normalized))
    .not('consumed_at', 'is', null)

  return Boolean(fallback.count)
}
