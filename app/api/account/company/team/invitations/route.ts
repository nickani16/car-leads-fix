import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import {
  createTeamInvitationToken,
  getCompanyTeamOverview,
  normalizeTeamRole,
  sendCompanyTeamInvitationEmail,
} from '@/lib/business-team'
import { resolveBusinessAccountScope } from '@/lib/billing/business-account-scope'

function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'You need to sign in.' }, { status: 401 })

    const limit = checkRateLimit({
      key: `company-team-invite:${getClientIp(request)}:${user.id}`,
      limit: 12,
      windowMs: 60 * 60 * 1000,
    })
    if (limit.limited) {
      return NextResponse.json(
        { error: 'Too many invitations in a short time. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
      )
    }

    const body = (await request.json()) as Record<string, unknown>
    const email = normalizeEmail(body.email)
    const role = normalizeTeamRole(body.role) || 'staff'
    if (!validEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }
    if (email === user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'You are already connected to the company.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('marketplace_profiles')
      .select('account_type,company_id,company_name,display_name,email,locale,country_code')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile || profile.account_type !== 'business' || !profile.company_id) {
      return NextResponse.json({ error: 'Only business accounts can invite team members.' }, { status: 403 })
    }

    const scope = await resolveBusinessAccountScope(user.id, admin)
    const { data: subscription } = await admin
      .from('business_subscriptions')
      .select('plan_key,status')
      .eq('user_id', scope.subscriptionUserId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const planKey = String(subscription?.plan_key || 'free').toLowerCase()
    if (!['growth', 'professional', 'enterprise'].includes(planKey)) {
      return NextResponse.json({ error: 'Team accounts are included from Growth.' }, { status: 403 })
    }
    if (!['active', 'trialing'].includes(String(subscription?.status || ''))) {
      return NextResponse.json({ error: 'The plan must be active before team members can be invited.' }, { status: 403 })
    }

    const now = new Date().toISOString()
    await admin
      .from('marketplace_company_invitations')
      .update({ status: 'expired', updated_at: now })
      .eq('company_id', profile.company_id)
      .eq('status', 'pending')
      .lt('expires_at', now)

    const { data: pendingInvitations } = await admin
      .from('marketplace_company_invitations')
      .select('id')
      .eq('company_id', profile.company_id)
      .ilike('email', email)
      .eq('status', 'pending')
      .gt('expires_at', now)
      .order('created_at', { ascending: false })

    const activeInvitation = pendingInvitations?.[0] || null
    const duplicateInvitationIds = (pendingInvitations || []).slice(1).map((invite) => String(invite.id)).filter(Boolean)
    if (duplicateInvitationIds.length) {
      await admin
        .from('marketplace_company_invitations')
        .update({ status: 'expired', updated_at: now })
        .in('id', duplicateInvitationIds)
    }

    const team = await getCompanyTeamOverview(admin, String(profile.company_id), planKey)
    if (!activeInvitation && team.remainingSeats <= 0) {
      return NextResponse.json({ error: 'The team limit for the plan has been reached.' }, { status: 409 })
    }
    if (team.members.some((member) => member.email.toLowerCase() === email)) {
      return NextResponse.json({ error: 'That user is already connected to the company.' }, { status: 409 })
    }

    const { data: existingProfile } = await admin
      .from('marketplace_profiles')
      .select('user_id,company_id')
      .ilike('email', email)
      .maybeSingle()
    if (existingProfile?.company_id === profile.company_id) {
      return NextResponse.json({ error: 'That user is already connected to the company.' }, { status: 409 })
    }

    const { token, tokenHash } = createTeamInvitationToken()
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    const invitationPayload = {
        company_id: profile.company_id,
        email,
        role,
        token_hash: tokenHash,
        invited_by: user.id,
        expires_at: expiresAt,
        email_status: 'pending',
        email_error: null,
        provider_message_id: null,
        updated_at: now,
      }

    const invitationQuery = activeInvitation
      ? admin
          .from('marketplace_company_invitations')
          .update(invitationPayload)
          .eq('id', activeInvitation.id)
      : admin
          .from('marketplace_company_invitations')
          .insert(invitationPayload)

    const { data: invitation, error } = await invitationQuery
      .select('id')
      .single()

    if (error || !invitation) {
      const duplicate = error?.code === '23505' || error?.message?.toLowerCase().includes('duplicate')
      return NextResponse.json(
        { error: duplicate ? 'That email address is already a member or has an active invitation.' : 'Invitation could not be sent.' },
        { status: duplicate ? 409 : 500 },
      )
    }

    await sendCompanyTeamInvitationEmail(admin, {
      invitationId: invitation.id,
      to: email,
      companyName: String(profile.company_name || 'Autorell company'),
      inviterName: String(profile.display_name || profile.email || 'Autorell'),
      role,
      token,
      locale: profile.locale,
      countryCode: profile.country_code,
    })

    return NextResponse.json({ success: true, invitationId: invitation.id, expiresAt })
  } catch (error) {
    console.error('[company-team-invite] failed', error)
    return NextResponse.json({ error: 'Invitation could not be sent.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'You need to sign in.' }, { status: 401 })

    const limit = checkRateLimit({
      key: `company-team-invite-delete:${getClientIp(request)}:${user.id}`,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    })
    if (limit.limited) {
      return NextResponse.json(
        { error: 'Too many team changes in a short time. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
      )
    }

    const body = (await request.json()) as Record<string, unknown>
    const invitationId = String(body.invitationId || '').trim()
    const email = normalizeEmail(body.email)

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('marketplace_profiles')
      .select('account_type,company_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile || profile.account_type !== 'business' || !profile.company_id) {
      return NextResponse.json({ error: 'Only business accounts can manage invitations.' }, { status: 403 })
    }

    const { data: company } = await admin
      .from('marketplace_companies')
      .select('id,created_by')
      .eq('id', profile.company_id)
      .maybeSingle()
    if (!company) return NextResponse.json({ error: 'The company could not be found.' }, { status: 404 })

    const { data: currentMember } = await admin
      .from('marketplace_company_members')
      .select('role')
      .eq('company_id', profile.company_id)
      .eq('user_id', user.id)
      .maybeSingle()
    const currentRole = String(currentMember?.role || '').toLowerCase()
    const canManage = String(company.created_by || '') === user.id || ['owner', 'admin', 'manager'].includes(currentRole)
    if (!canManage) {
      return NextResponse.json({ error: 'You do not have permission to remove invitations.' }, { status: 403 })
    }

    let query = admin
      .from('marketplace_company_invitations')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq('company_id', profile.company_id)
      .eq('status', 'pending')

    if (invitationId) query = query.eq('id', invitationId)
    else if (email) query = query.ilike('email', email)
    else return NextResponse.json({ error: 'Choose an invitation.' }, { status: 400 })

    const { data: revoked, error } = await query.select('id').limit(1).maybeSingle()
    if (error) throw error
    if (!revoked) return NextResponse.json({ error: 'The invitation was not found.' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[company-team-invite] remove failed', error)
    return NextResponse.json({ error: 'The invitation could not be removed.' }, { status: 500 })
  }
}
