import { NextResponse } from 'next/server'
import { COMPANY_IMPORT_MAX_FILE_SIZE, parseCompanyListingImportCsv } from '@/lib/company-listing-import'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireBusinessListingEntitlement } from '@/lib/billing/business-entitlement'
import { companyImportLimitsForPlan } from '@/lib/company-import-limits'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const access = await getImportAccess(user.id)
    if (!access.allowed) return NextResponse.json(access, { status: access.status })

    const form = await request.formData()
    const file = form.get('csv')
    if (!(file instanceof File)) return NextResponse.json({ error: 'CSV file is required.' }, { status: 400 })
    if (file.size > COMPANY_IMPORT_MAX_FILE_SIZE) return NextResponse.json({ error: 'CSV file is too large.' }, { status: 413 })

    const branches = await loadCompanyBranches(access.profile.company_id)
    const preview = parseCompanyListingImportCsv(await file.text(), { branches, maxRows: access.importLimits.maxRows })
    return NextResponse.json({
      ...preview,
      quota: access.quota,
      importLimits: access.importLimits,
    })
  } catch (error) {
    console.error('Company import preview failed', error)
    return NextResponse.json({ error: 'Could not validate import file.' }, { status: 500 })
  }
}

async function getImportAccess(userId: string) {
  const admin = createAdminClient()
  const [{ data: profile }, entitlement] = await Promise.all([
    admin
      .from('marketplace_profiles')
      .select('account_type,company_id,company_name,country_code')
      .eq('user_id', userId)
      .maybeSingle(),
    requireBusinessListingEntitlement(userId),
  ])

  if (profile?.account_type !== 'business') {
    return { allowed: false as const, status: 403, error: 'Business account is required.' }
  }
  if (!entitlement.allowed) {
    return { allowed: false as const, status: 403, error: entitlement.code, code: entitlement.code }
  }
  const importLimits = companyImportLimitsForPlan(entitlement.planKey)
  return {
    allowed: true as const,
    profile,
    entitlement,
    importLimits,
    quota: {
      planKey: entitlement.planKey,
      limit: entitlement.activeListingLimit,
      used: entitlement.activeListingCount,
      remaining: Math.max(0, entitlement.activeListingLimit - entitlement.activeListingCount),
    },
  }
}

async function loadCompanyBranches(companyId: string | null | undefined) {
  if (!companyId) return []
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('marketplace_company_locations')
      .select('id,name,country_code,region,municipality,city,postal_code,address_line_1,contact_email,contact_phone,is_active')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .limit(250)
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}
