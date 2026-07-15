import { NextResponse } from 'next/server'
import { COMPANY_IMPORT_MAX_FILE_SIZE, parseCompanyListingImportCsv } from '@/lib/company-listing-import'
import { planAllows } from '@/lib/company-portal'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireBusinessListingEntitlement } from '@/lib/billing/business-entitlement'

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

    const preview = parseCompanyListingImportCsv(await file.text())
    return NextResponse.json({
      ...preview,
      quota: access.quota,
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
  if (!planAllows(entitlement.planKey, 'growth')) {
    return { allowed: false as const, status: 403, error: 'Bulk import requires Growth, Professional or Enterprise.' }
  }

  return {
    allowed: true as const,
    profile,
    entitlement,
    quota: {
      planKey: entitlement.planKey,
      limit: entitlement.activeListingLimit,
      used: entitlement.activeListingCount,
      remaining: Math.max(0, entitlement.activeListingLimit - entitlement.activeListingCount),
    },
  }
}
