import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { MARKETPLACE_PRIVACY_VERSION, MARKETPLACE_TERMS_VERSION } from '@/lib/marketplace-security'
import { getCompanyTeamOverview, hashTeamInvitationToken } from '@/lib/business-team'

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

export class CompanyTeamInvitationError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'CompanyTeamInvitationError'
    this.status = status
  }
}

export function tokenFromCompanyTeamAcceptPath(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/api/')) return ''
  const url = new URL(value, 'https://autorell.local')
  if (!url.pathname.includes('/company/team/accept')) return ''
  return String(url.searchParams.get('token') || '').trim()
}

export function localizedCompanyAccountDestination(requested: string | null | undefined) {
  const firstSegment = String(requested || '')
    .split('?')[0]
    ?.split('/')
    .filter(Boolean)[0]
  const prefix = firstSegment && marketPathPrefixes.has(firstSegment) ? `/${firstSegment}` : ''
  return `${prefix}/account/company`
}

type CompanyTeamInvitationRecord = {
  id: string
  company_id: string
  email: string
  role: string
  status: string
  expires_at: string
  invited_by: string
}

async function completeCompanyTeamInvitation(
  admin: SupabaseClient,
  invitation: CompanyTeamInvitationRecord,
  input: {
    userId: string
    userEmail: string | null | undefined
    destinationHint?: string | null
  },
) {
  if (!invitation || invitation.status !== 'pending') {
    throw new CompanyTeamInvitationError('The invitation is no longer active.', 404)
  }
  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    await admin
      .from('marketplace_company_invitations')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('id', invitation.id)
    throw new CompanyTeamInvitationError('The invitation has expired.', 410)
  }

  const invitedEmail = String(invitation.email || '').toLowerCase()
  if (String(input.userEmail || '').toLowerCase() !== invitedEmail) {
    throw new CompanyTeamInvitationError(
      'You must sign in with the same email address that received the invitation.',
      403,
    )
  }

  const [{ data: profile }, { data: company }, { data: ownerSubscription }] = await Promise.all([
    admin
      .from('marketplace_profiles')
      .select('account_type,company_id,email')
      .eq('user_id', input.userId)
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

  if (!company) throw new CompanyTeamInvitationError('The company could not be found.', 404)
  if (profile?.company_id && profile.company_id !== invitation.company_id) {
    throw new CompanyTeamInvitationError('This account is already connected to another company.', 409)
  }

  const team = await getCompanyTeamOverview(admin, String(invitation.company_id), ownerSubscription?.plan_key)
  const alreadyMember = team.members.some((member) => member.userId === input.userId)
  const invitationReservedSeat = team.invitations.some((item) => item.id === invitation.id)
  if (!alreadyMember && team.remainingSeats <= 0 && !invitationReservedSeat) {
    throw new CompanyTeamInvitationError('The team seat limit for this plan has been reached.', 409)
  }

  const now = new Date().toISOString()
  const { error: memberError } = await admin
    .from('marketplace_company_members')
    .upsert({
      company_id: invitation.company_id,
      user_id: input.userId,
      role: invitation.role,
      invited_by: invitation.invited_by,
      updated_at: now,
    }, { onConflict: 'company_id,user_id' })
  if (memberError) throw memberError

  const displayName = input.userEmail?.split('@')[0] || invitedEmail
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
        .eq('user_id', input.userId)
    : await admin
        .from('marketplace_profiles')
        .insert({
          user_id: input.userId,
          ...profilePayload,
        })
  if (profileError) throw profileError

  await admin
    .from('marketplace_company_invitations')
    .update({
      status: 'accepted',
      accepted_by: input.userId,
      accepted_at: now,
      updated_at: now,
    })
    .eq('id', invitation.id)

  return {
    destination: localizedCompanyAccountDestination(input.destinationHint),
  }
}

export async function acceptCompanyTeamInvitationForUser(
  admin: SupabaseClient,
  input: {
    token: string
    userId: string
    userEmail: string | null | undefined
    destinationHint?: string | null
  },
) {
  const token = String(input.token || '').trim()
  if (token.length < 24) {
    throw new CompanyTeamInvitationError('The invitation is invalid.', 400)
  }

  const tokenHash = hashTeamInvitationToken(token)
  const { data: invitation } = await admin
    .from('marketplace_company_invitations')
    .select('id,company_id,email,role,status,expires_at,invited_by')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (!invitation) {
    throw new CompanyTeamInvitationError('The invitation is no longer active.', 404)
  }

  return completeCompanyTeamInvitation(admin, invitation, input)
}

export async function acceptLatestCompanyTeamInvitationForUser(
  admin: SupabaseClient,
  input: {
    userId: string
    userEmail: string | null | undefined
    destinationHint?: string | null
  },
) {
  const email = String(input.userEmail || '').trim().toLowerCase()
  if (!email) return null

  const { data: invitation } = await admin
    .from('marketplace_company_invitations')
    .select('id,company_id,email,role,status,expires_at,invited_by')
    .ilike('email', email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!invitation) return null

  return completeCompanyTeamInvitation(admin, invitation, input)
}
