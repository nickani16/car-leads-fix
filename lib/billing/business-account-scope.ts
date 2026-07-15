import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

type AdminClient = ReturnType<typeof createAdminClient>

export type BusinessAccountScope = {
  profile: {
    user_id: string
    account_type: string | null
    company_id: string | null
    business_verification_status?: string | null
    business_onboarding_status?: string | null
  } | null
  companyId: string | null
  subscriptionUserId: string
  listingOwnerUserIds: string[]
}

export async function resolveBusinessAccountScope(
  userId: string,
  admin: AdminClient = createAdminClient(),
): Promise<BusinessAccountScope> {
  const { data: profile, error: profileError } = await admin
    .from('marketplace_profiles')
    .select('user_id,account_type,company_id,business_verification_status,business_onboarding_status')
    .eq('user_id', userId)
    .maybeSingle()

  if (profileError) throw profileError

  if (!profile || profile.account_type !== 'business' || !profile.company_id) {
    return {
      profile: profile
        ? {
            user_id: String(profile.user_id),
            account_type: profile.account_type || null,
            company_id: profile.company_id || null,
            business_verification_status: profile.business_verification_status || null,
            business_onboarding_status: profile.business_onboarding_status || null,
          }
        : null,
      companyId: profile?.company_id || null,
      subscriptionUserId: userId,
      listingOwnerUserIds: [userId],
    }
  }

  const { data: company, error: companyError } = await admin
    .from('marketplace_companies')
    .select('id,created_by')
    .eq('id', profile.company_id)
    .maybeSingle()

  if (companyError) throw companyError

  const companyId = String(profile.company_id)
  const subscriptionUserId = String(company?.created_by || userId)
  const { data: members, error: membersError } = await admin
    .from('marketplace_company_members')
    .select('user_id')
    .eq('company_id', companyId)

  if (membersError) throw membersError

  const listingOwnerUserIds = Array.from(new Set([
    subscriptionUserId,
    userId,
    ...(members || []).map((member) => String(member.user_id)).filter(Boolean),
  ]))

  return {
    profile: {
      user_id: String(profile.user_id),
      account_type: profile.account_type || null,
      company_id: companyId,
      business_verification_status: profile.business_verification_status || null,
      business_onboarding_status: profile.business_onboarding_status || null,
    },
    companyId,
    subscriptionUserId,
    listingOwnerUserIds,
  }
}
