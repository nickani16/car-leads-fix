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
import { getAuthApiCopy } from '@/lib/auth-copy'
import { localeFromRequest } from '@/lib/auth-locale'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import {
  acceptCompanyTeamInvitationForUser,
  CompanyTeamInvitationError,
  tokenFromCompanyTeamAcceptPath,
} from '@/lib/company-team-acceptance'

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

function accountDestination(requested: string, accountType?: string | null) {
  const firstSegment = requested.split('?')[0]?.split('/').filter(Boolean)[0]
  const prefix = firstSegment && marketPathPrefixes.has(firstSegment) ? `/${firstSegment}` : ''
  const requestedPath = requested.split('?')[0] || ''
  if (requestedPath.includes('/company/team/accept')) return requested
  if (requestedPath.includes('/account/company')) return requested
  return accountType === 'business' ? `${prefix}/account/company` : `${prefix}/account`
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string
      code?: string
      locale?: string
      next?: string
      purpose?: string
    }
    const locale = localeFromRequest(request, body.locale)
    const copy = getAuthApiCopy(locale)
    const email = normalizeEmail(body.email)
    const code = String(body.code || '').replace(/\D/g, '').slice(0, 6)
    if (!isValidEmail(email) || code.length !== 6) {
      return NextResponse.json({ error: copy.codeError }, { status: 400 })
    }

    const verifyLimit = checkRateLimit({
      key: `email-code-verify:${getClientIp(request)}:${email}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    })
    if (verifyLimit.limited) {
      return NextResponse.json(
        { error: copy.tooManyAttempts },
        {
          status: 429,
          headers: { 'Retry-After': String(verifyLimit.retryAfter) },
        },
      )
    }

    const admin = createAdminClient()
    let { data: challenge, error: challengeError } = await admin
      .from('auth_email_codes')
      .select('id,code_hash,attempts,expires_at,redirect_path')
      .eq('email_hash', emailHash(email))
      .is('consumed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (challengeError?.code === 'PGRST204' || challengeError?.code === '42703') {
      const fallback = await admin
        .from('auth_email_codes')
        .select('id,code_hash,attempts,expires_at')
        .eq('email_hash', emailHash(email))
        .is('consumed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      challenge = fallback.data ? { ...fallback.data, redirect_path: null } : null
      challengeError = fallback.error
    }
    if (challengeError) throw challengeError

    async function consumeChallenge() {
      const { data: consumedChallenge, error: consumeError } = await admin
        .from('auth_email_codes')
        .update({ consumed_at: new Date().toISOString() })
        .eq('id', challenge!.id)
        .is('consumed_at', null)
        .select('id')
        .maybeSingle()
      if (consumeError) throw consumeError
      return Boolean(consumedChallenge)
    }

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
      return NextResponse.json({ error: copy.codeError }, { status: 401 })
    }

    const isEmailVerification = body.purpose === 'email_verification' || challenge.redirect_path === 'email_verification'
    if (isEmailVerification) {
      const supabase = await createClient()
      const { data: sessionUser, error: userError } = await supabase.auth.getUser()
      if (userError || !sessionUser.user) {
        return NextResponse.json({ error: copy.codeError }, { status: 401 })
      }
      if (normalizeEmail(sessionUser.user.email) !== email) {
        return NextResponse.json({ error: copy.codeError }, { status: 403 })
      }

      const now = new Date().toISOString()
      const [{ data: profile }, authUpdate] = await Promise.all([
        admin
          .from('marketplace_profiles')
          .select('account_type,identity_status')
          .eq('user_id', sessionUser.user.id)
          .maybeSingle(),
        admin.auth.admin.updateUserById(sessionUser.user.id, {
          email_confirm: true,
        }),
      ])
      if (authUpdate.error) throw authUpdate.error

      if (
        profile?.account_type === 'private' &&
        !['verified', 'format_validated'].includes(String(profile.identity_status || ''))
      ) {
        const { error: profileError } = await admin
          .from('marketplace_profiles')
          .update({
            identity_status: 'format_validated',
            verified_at: now,
            verification_updated_at: now,
          })
          .eq('user_id', sessionUser.user.id)
        if (profileError) throw profileError
      }

      if (!(await consumeChallenge())) {
        return NextResponse.json({ error: copy.usedCode }, { status: 401 })
      }

      return NextResponse.json({ success: true, emailVerified: true })
    }

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

    if (!(await consumeChallenge())) {
      return NextResponse.json({ error: copy.usedCode }, { status: 401 })
    }

    const [{ data: profile }, { data: adminUser }, { data: invitation }] = await Promise.all([
      admin
        .from('marketplace_profiles')
        .select('user_id,account_type,identity_status')
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

    if (
      profile?.account_type === 'private' &&
      !['verified', 'format_validated'].includes(String(profile.identity_status || ''))
    ) {
      const now = new Date().toISOString()
      await admin
        .from('marketplace_profiles')
        .update({
          identity_status: 'format_validated',
          verified_at: now,
          verification_updated_at: now,
        })
        .eq('user_id', data.user.id)
    }

    const requested = safeAuthDestination(body.next)
    const invitationToken = tokenFromCompanyTeamAcceptPath(requested)
    if (invitationToken) {
      const accepted = await acceptCompanyTeamInvitationForUser(admin, {
        token: invitationToken,
        userId: data.user.id,
        userEmail: data.user.email,
        destinationHint: requested,
      })
      return NextResponse.json({
        success: true,
        destination: accepted.destination,
        newAccount: false,
      })
    }

    const { data: companyInvitation } = !profile
      ? await admin
          .from('marketplace_company_invitations')
          .select('id')
          .ilike('email', email)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null }
    const adminRole = invitation?.role_key
    const destination = adminRole === 'support_admin'
      ? '/admin/support'
      : invitation || adminUser
        ? '/admin'
        : companyInvitation && requested.includes('/company/team/accept')
          ? requested
        : profile
          ? accountDestination(requested, profile.account_type)
          : onboardingDestination(requested)

    return NextResponse.json({ success: true, destination, newAccount: !profile && !adminUser })
  } catch (error) {
    if (error instanceof CompanyTeamInvitationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Email code verification failed', error)
    const locale = localeFromRequest(request)
    const copy = getAuthApiCopy(locale)
    return NextResponse.json(
      { error: copy.codeError },
      { status: 500 },
    )
  }
}
