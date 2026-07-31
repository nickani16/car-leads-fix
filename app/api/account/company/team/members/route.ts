import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'You need to sign in.' }, { status: 401 })

    const limit = checkRateLimit({
      key: `company-team-member-delete:${getClientIp(request)}:${user.id}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    })
    if (limit.limited) {
      return NextResponse.json(
        { error: 'Too many team changes in a short time. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
      )
    }

    const body = (await request.json()) as Record<string, unknown>
    const targetUserId = String(body.userId || '').trim()
    if (!targetUserId) {
      return NextResponse.json({ error: 'Choose a team member.' }, { status: 400 })
    }
    if (targetUserId === user.id) {
      return NextResponse.json({ error: 'You cannot remove your own access here.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('marketplace_profiles')
      .select('account_type,company_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile || profile.account_type !== 'business' || !profile.company_id) {
      return NextResponse.json({ error: 'Only business accounts can manage team members.' }, { status: 403 })
    }

    const { data: company } = await admin
      .from('marketplace_companies')
      .select('id,created_by')
      .eq('id', profile.company_id)
      .maybeSingle()

    if (!company) return NextResponse.json({ error: 'The company could not be found.' }, { status: 404 })
    if (String(company.created_by || '') === targetUserId) {
      return NextResponse.json({ error: 'The company owner cannot be removed from the team.' }, { status: 400 })
    }

    const { data: currentMember } = await admin
      .from('marketplace_company_members')
      .select('role')
      .eq('company_id', profile.company_id)
      .eq('user_id', user.id)
      .maybeSingle()

    const currentRole = String(currentMember?.role || '').toLowerCase()
    const canManage = String(company.created_by || '') === user.id || ['owner', 'admin', 'manager'].includes(currentRole)
    if (!canManage) {
      return NextResponse.json({ error: 'You do not have permission to remove team members.' }, { status: 403 })
    }

    const { data: targetMember } = await admin
      .from('marketplace_company_members')
      .select('user_id')
      .eq('company_id', profile.company_id)
      .eq('user_id', targetUserId)
      .maybeSingle()

    if (!targetMember) {
      return NextResponse.json({ error: 'The team member was not found.' }, { status: 404 })
    }

    const { error: deleteError } = await admin
      .from('marketplace_company_members')
      .delete()
      .eq('company_id', profile.company_id)
      .eq('user_id', targetUserId)
    if (deleteError) throw deleteError

    const { error: profileError } = await admin
      .from('marketplace_profiles')
      .update({
        account_type: 'private',
        company_id: null,
        company_name: null,
        registration_number: null,
        vat_number: null,
        business_verification_status: null,
        business_onboarding_status: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', targetUserId)
      .eq('company_id', profile.company_id)
    if (profileError) throw profileError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[company-team-members] remove failed', error)
    return NextResponse.json({ error: 'The team member could not be removed.' }, { status: 500 })
  }
}
