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
    if (!user) return NextResponse.json({ error: 'Inte inloggad.' }, { status: 401 })

    const limit = checkRateLimit({
      key: `company-team-invite:${getClientIp(request)}:${user.id}`,
      limit: 12,
      windowMs: 60 * 60 * 1000,
    })
    if (limit.limited) {
      return NextResponse.json(
        { error: 'För många inbjudningar på kort tid. Försök igen senare.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
      )
    }

    const body = (await request.json()) as Record<string, unknown>
    const email = normalizeEmail(body.email)
    const role = normalizeTeamRole(body.role) || 'staff'
    if (!validEmail(email)) {
      return NextResponse.json({ error: 'Ange en giltig e-postadress.' }, { status: 400 })
    }
    if (email === user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'Du är redan kopplad till företaget.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('marketplace_profiles')
      .select('account_type,company_id,company_name,display_name,email,locale,country_code')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile || profile.account_type !== 'business' || !profile.company_id) {
      return NextResponse.json({ error: 'Endast företagskonton kan bjuda in teammedlemmar.' }, { status: 403 })
    }

    const { data: subscription } = await admin
      .from('business_subscriptions')
      .select('plan_key,status')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const planKey = String(subscription?.plan_key || 'free').toLowerCase()
    if (!['growth', 'professional', 'enterprise'].includes(planKey)) {
      return NextResponse.json({ error: 'Teamkonton ingår från Growth.' }, { status: 403 })
    }
    if (!['active', 'trialing'].includes(String(subscription?.status || ''))) {
      return NextResponse.json({ error: 'Planen måste vara aktiv innan team kan bjudas in.' }, { status: 403 })
    }

    const team = await getCompanyTeamOverview(admin, String(profile.company_id), planKey)
    if (team.remainingSeats <= 0) {
      return NextResponse.json({ error: 'Teamgränsen för planen är uppnådd.' }, { status: 409 })
    }
    if (team.members.some((member) => member.email.toLowerCase() === email) || team.invitations.some((invite) => invite.email.toLowerCase() === email)) {
      return NextResponse.json({ error: 'Den e-postadressen är redan medlem eller har en aktiv inbjudan.' }, { status: 409 })
    }

    const { data: existingProfile } = await admin
      .from('marketplace_profiles')
      .select('user_id,company_id')
      .ilike('email', email)
      .maybeSingle()
    if (existingProfile?.company_id === profile.company_id) {
      return NextResponse.json({ error: 'Den användaren är redan kopplad till företaget.' }, { status: 409 })
    }

    const { token, tokenHash } = createTeamInvitationToken()
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    const { data: invitation, error } = await admin
      .from('marketplace_company_invitations')
      .insert({
        company_id: profile.company_id,
        email,
        role,
        token_hash: tokenHash,
        invited_by: user.id,
        expires_at: expiresAt,
      })
      .select('id')
      .single()

    if (error || !invitation) {
      const duplicate = error?.code === '23505' || error?.message?.toLowerCase().includes('duplicate')
      return NextResponse.json(
        { error: duplicate ? 'Det finns redan en aktiv inbjudan till den e-postadressen.' : 'Inbjudan kunde inte skapas.' },
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
    return NextResponse.json({ error: 'Inbjudan kunde inte skickas.' }, { status: 500 })
  }
}
