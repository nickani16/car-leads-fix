import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveBusinessAccountScope } from '@/lib/billing/business-account-scope'
import { isBusinessFeatureEnabled } from '@/lib/business-feature-flags'

export async function getDealerImportAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false as const, status: 401, error: 'UNAUTHORIZED' }

  const admin = createAdminClient()
  const scope = await resolveBusinessAccountScope(user.id, admin)
  if (scope.profile?.account_type !== 'business' || !scope.companyId) {
    return { allowed: false as const, status: 403, error: 'BUSINESS_ACCOUNT_REQUIRED' }
  }

  const [{ data: company }, { data: member }, { data: profile }, { data: pilot }] = await Promise.all([
    admin.from('marketplace_companies').select('id,created_by,country_code,name').eq('id', scope.companyId).maybeSingle(),
    admin.from('marketplace_company_members').select('role').eq('company_id', scope.companyId).eq('user_id', user.id).maybeSingle(),
    admin.from('marketplace_profiles').select('company_id,country_code,locale').eq('user_id', user.id).maybeSingle(),
    admin.from('business_pilot_programs').select('id,status,organization_id,start_date,planned_end_date,terms_accepted_at').eq('organization_id', scope.companyId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  if (!company || profile?.company_id !== scope.companyId) {
    return { allowed: false as const, status: 403, error: 'COMPANY_ACCESS_DENIED' }
  }

  const enabled = await isBusinessFeatureEnabled('dealer_inventory_import', {
    organizationId: scope.companyId,
    pilotProgramId: pilot?.id || null,
    marketCode: profile?.country_code || company.country_code,
  })
  if (!enabled) return { allowed: false as const, status: 404, error: 'FEATURE_DISABLED' }

  const role = company.created_by === user.id ? 'owner' : String(member?.role || 'viewer')
  return {
    allowed: true as const,
    user,
    admin,
    organizationId: scope.companyId,
    company,
    profile,
    pilot: pilot || null,
    role,
    canManage: ['owner', 'admin', 'manager'].includes(role),
  }
}
