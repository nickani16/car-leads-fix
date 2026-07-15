import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { MARKETPLACE_PRIVACY_VERSION, MARKETPLACE_TERMS_VERSION } from '@/lib/marketplace-security'
import { getCompanyTeamOverview, hashTeamInvitationToken } from '@/lib/business-team'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sign in with the email address that received the invitation.' }, { status: 401 })

    const body = (await request.json()) as Record<string, unknown>
    const token = String(body.token || '').trim()
    if (token.length < 24) return NextResponse.json({ error: 'The invitation is invalid.' }, { status: 400 })

    const admin = createAdminClient()
    const tokenHash = hashTeamInvitationToken(token)
    const { data: invitation } = await admin
      .from('marketplace_company_invitations')
      .select('id,company_id,email,role,status,expires_at,invited_by')
      .eq('token_hash', tokenHash)
      .maybeSingle()

    if (!invitation || invitation.status !== 'pending') {
      return NextResponse.json({ error: 'The invitation is no longer active.' }, { status: 404 })
    }
    if (new Date(invitation.expires_at).getTime() < Date.now()) {
      await admin
        .from('marketplace_company_invitations')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', invitation.id)
      return NextResponse.json({ error: 'The invitation has expired.' }, { status: 410 })
    }

    const invitedEmail = String(invitation.email || '').toLowerCase()
    if (String(user.email || '').toLowerCase() !== invitedEmail) {
      return NextResponse.json({ error: 'You must sign in with the same email address that received the invitation.' }, { status: 403 })
    }

    const [{ data: profile }, { data: company }, { data: ownerSubscription }] = await Promise.all([
      admin
        .from('marketplace_profiles')
        .select('account_type,company_id,email')
        .eq('user_id', user.id)
        .maybeSingle(),
      admin
        .from('marketplace_companies')
        .select('id,name,registration_number,vat_number,country_code,website_url,phone,address_line_1,address_line_2,postal_code,city,region')
        .eq('id', invitation.company_id)
        .maybeSingle(),
      admin
        .from('business_subscriptions')
        .select('plan_key,status')
        .eq('user_id', invitation.invited_by)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    if (!company) return NextResponse.json({ error: 'The company could not be found.' }, { status: 404 })
    if (profile?.company_id && profile.company_id !== invitation.company_id) {
      return NextResponse.json({ error: 'This account is already connected to another company.' }, { status: 409 })
    }

    const team = await getCompanyTeamOverview(admin, String(invitation.company_id), ownerSubscription?.plan_key)
    const alreadyMember = team.members.some((member) => member.userId === user.id)
    if (!alreadyMember && team.remainingSeats <= 0) {
      return NextResponse.json({ error: 'The team seat limit for this plan has been reached.' }, { status: 409 })
    }

    const now = new Date().toISOString()
    const { error: memberError } = await admin
      .from('marketplace_company_members')
      .upsert({
        company_id: invitation.company_id,
        user_id: user.id,
        role: invitation.role,
        invited_by: invitation.invited_by,
        updated_at: now,
      }, { onConflict: 'company_id,user_id' })
    if (memberError) throw memberError

    const displayName = user.email?.split('@')[0] || invitedEmail
    const profilePayload = {
      account_type: 'business',
      display_name: displayName,
      legal_name: displayName,
      email: invitedEmail,
      phone: company.phone || '+0000000000',
      company_id: company.id,
      company_name: company.name,
      registration_number: company.registration_number || company.vat_number || 'TEAM-MEMBER',
      vat_number: company.vat_number,
      country_code: company.country_code,
      website_url: company.website_url,
      address_line_1: company.address_line_1,
      address_line_2: company.address_line_2,
      registered_address: [company.address_line_1, company.address_line_2].filter(Boolean).join(', '),
      postal_code: company.postal_code,
      city: company.city,
      region: company.region,
      business_verification_status: 'verified',
      business_onboarding_status: 'active',
      identity_status: 'verified',
      risk_status: 'standard',
      locale: company.country_code === 'SE' ? 'sv' : 'en',
      terms_version: MARKETPLACE_TERMS_VERSION,
      privacy_version: MARKETPLACE_PRIVACY_VERSION,
      verified_at: now,
      updated_at: now,
    }
    const { error: profileError } = profile
      ? await admin
          .from('marketplace_profiles')
          .update(profilePayload)
          .eq('user_id', user.id)
      : await admin
          .from('marketplace_profiles')
          .insert({
            user_id: user.id,
            ...profilePayload,
          })
    if (profileError) throw profileError

    await admin
      .from('marketplace_company_invitations')
      .update({
        status: 'accepted',
        accepted_by: user.id,
        accepted_at: now,
        updated_at: now,
      })
      .eq('id', invitation.id)

    return NextResponse.json({ success: true, destination: '/account/company' })
  } catch (error) {
    console.error('[company-team-accept] failed', error)
    return NextResponse.json({ error: 'The invitation could not be accepted.' }, { status: 500 })
  }
}
