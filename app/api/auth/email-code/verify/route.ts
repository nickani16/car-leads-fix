import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'
import {
  emailHash,
  isValidEmail,
  matchesCode,
  normalizeEmail,
  safeAuthDestination,
} from '@/lib/email-code-auth'

export async function POST(request: Request) {
  const verifyLimit = checkRateLimit({
    key: `email-code-verify:${getClientIp(request)}`,
    limit: 30,
    windowMs: 15 * 60 * 1000,
  })
  if (verifyLimit.limited) return rateLimitJson(verifyLimit.retryAfter)

  try {
    const body = (await request.json()) as {
      email?: string
      code?: string
      next?: string
    }
    const email = normalizeEmail(body.email)
    const code = String(body.code || '').replace(/\D/g, '').slice(0, 6)
    if (!isValidEmail(email) || code.length !== 6) {
      return NextResponse.json(
        { error: 'Ange den sexsiffriga koden från mejlet.' },
        { status: 400 },
      )
    }

    const admin = createAdminClient()
    const { data: challenge } = await admin
      .from('auth_email_codes')
      .select('id,code_hash,attempts,expires_at')
      .eq('email_hash', emailHash(email))
      .is('consumed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (
      !challenge ||
      challenge.attempts >= 6 ||
      new Date(challenge.expires_at).getTime() < Date.now() ||
      !matchesCode(challenge.code_hash, email, code)
    ) {
      if (challenge) {
        await admin
          .from('auth_email_codes')
          .update({ attempts: Math.min(challenge.attempts + 1, 10) })
          .eq('id', challenge.id)
      }
      return NextResponse.json(
        { error: 'Koden är felaktig eller har gått ut.' },
        { status: 401 },
      )
    }

    await admin
      .from('auth_email_codes')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', challenge.id)

    let link = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })
    if (link.error || !link.data.properties?.hashed_token) {
      const created = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
      })
      if (created.error) throw created.error
      link = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      })
    }

    const tokenHash = link.data.properties?.hashed_token
    if (link.error || !tokenHash) throw link.error || new Error('Login link could not be generated.')

    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email',
    })
    if (error || !data.user) throw error || new Error('Session could not be created.')

    const [{ data: profile }, { data: adminUser }] = await Promise.all([
      admin
        .from('marketplace_profiles')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle(),
      admin
        .from('admin_users')
        .select('is_active')
        .eq('user_id', data.user.id)
        .eq('is_active', true)
        .maybeSingle(),
    ])

    const requested = safeAuthDestination(body.next)
    const destination = profile
      ? requested.startsWith('/konto')
        ? requested
        : '/konto'
      : adminUser
        ? '/admin'
        : '/registrera?onboarding=1'

    return NextResponse.json({ success: true, destination, newAccount: !profile && !adminUser })
  } catch (error) {
    console.error('Email code verification failed', error)
    return NextResponse.json(
      { error: 'Inloggningen kunde inte slutföras. Begär en ny kod.' },
      { status: 500 },
    )
  }
}
