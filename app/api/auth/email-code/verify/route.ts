import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  emailHash,
  isValidEmail,
  matchesCode,
  normalizeEmail,
  safeAuthDestination,
} from '@/lib/email-code-auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const marketPathPrefixes = new Set([
  'se',
  'de',
  'fr',
  'es',
  'it',
  'pl',
  'nl',
  'pt',
  'fi',
  'dk',
  'cz',
  'ro',
  'bg',
  'hr',
  'gr',
  'hu',
  'sk',
  'si',
  'ee',
  'lv',
  'lt',
])

function onboardingDestination(requested: string) {
  const firstSegment = requested.split('?')[0]?.split('/').filter(Boolean)[0]
  const accountType = requested.includes('account=business') ? '&account=business' : ''
  return firstSegment && marketPathPrefixes.has(firstSegment)
    ? `/${firstSegment}/register?onboarding=1${accountType}`
    : `/register?onboarding=1${accountType}`
}

function accountDestination(requested: string) {
  const firstSegment = requested.split('?')[0]?.split('/').filter(Boolean)[0]
  return firstSegment && marketPathPrefixes.has(firstSegment)
    ? `/${firstSegment}/account`
    : '/account'
}

export async function POST(request: Request) {
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

    const verifyLimit = checkRateLimit({
      key: `email-code-verify:${getClientIp(request)}:${email}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    })
    if (verifyLimit.limited) {
      return NextResponse.json(
        { error: 'För många försök. Vänta en stund och försök igen.' },
        {
          status: 429,
          headers: { 'Retry-After': String(verifyLimit.retryAfter) },
        },
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

    const [{ data: profile }, { data: adminUser }, { data: invitation }] = await Promise.all([
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
      admin
        .from('admin_staff_invitations')
        .select('id,role_key,display_name,invited_by,expires_at')
        .ilike('email', email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    if (invitation) {
      const now = new Date().toISOString()
      const { error: roleError } = await admin.from('user_admin_roles').upsert({
        user_id: data.user.id,
        role_key: invitation.role_key,
        is_active: true,
        assigned_by: invitation.invited_by,
        assignment_reason: 'Accepted staff email-code invitation',
        starts_at: now,
        updated_at: now,
      }, { onConflict: 'user_id,role_key' })
      if (roleError) throw roleError
      if (invitation.role_key === 'support_admin') {
        await admin.from('support_agent_profiles').upsert({
          user_id: data.user.id,
          display_name: invitation.display_name,
          role: 'support',
          is_active: true,
          updated_at: now,
        })
      }
      await admin.from('admin_staff_invitations').update({
        status: 'accepted', accepted_by: data.user.id, accepted_at: now, updated_at: now,
      }).eq('id', invitation.id)
    }

    const requested = safeAuthDestination(body.next)
    const adminRole = invitation?.role_key
    const destination = adminRole === 'support_admin'
      ? '/admin/support'
      : invitation || adminUser
        ? '/admin'
        : profile
          ? accountDestination(requested)
          : onboardingDestination(requested)

    return NextResponse.json({ success: true, destination, newAccount: !profile && !adminUser })
  } catch (error) {
    console.error('Email code verification failed', error)
    return NextResponse.json(
      { error: 'Inloggningen kunde inte slutföras. Begär en ny kod.' },
      { status: 500 },
    )
  }
}
