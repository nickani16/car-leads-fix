import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Inte inloggad.' }, { status: 401 })

    const limit = checkRateLimit({
      key: `company-billing-recipient:${getClientIp(request)}:${user.id}`,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    })
    if (limit.limited) {
      return NextResponse.json(
        { error: 'For manga andringar pa kort tid. Forsok igen senare.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
      )
    }

    const body = (await request.json()) as Record<string, unknown>
    const targetUserId = String(body.userId || '').trim()
    const enabled = Boolean(body.enabled)
    if (!targetUserId) {
      return NextResponse.json({ error: 'Teammedlem saknas.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('marketplace_profiles')
      .select('account_type,company_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile || profile.account_type !== 'business' || !profile.company_id) {
      return NextResponse.json({ error: 'Endast foretagskonton kan andra fakturamottagare.' }, { status: 403 })
    }

    const { data: company } = await admin
      .from('marketplace_companies')
      .select('created_by')
      .eq('id', profile.company_id)
      .maybeSingle()

    const { data: currentMember } = await admin
      .from('marketplace_company_members')
      .select('role')
      .eq('company_id', profile.company_id)
      .eq('user_id', user.id)
      .maybeSingle()

    const currentRole = String(currentMember?.role || '').toLowerCase()
    const canManage = String(company?.created_by || '') === user.id || ['owner', 'admin', 'manager'].includes(currentRole)
    if (!canManage) {
      return NextResponse.json({ error: 'Du saknar behorighet att andra fakturamottagare.' }, { status: 403 })
    }

    const { data: targetMember } = await admin
      .from('marketplace_company_members')
      .select('user_id')
      .eq('company_id', profile.company_id)
      .eq('user_id', targetUserId)
      .maybeSingle()

    if (!targetMember) {
      return NextResponse.json({ error: 'Teammedlemmen finns inte pa foretaget.' }, { status: 404 })
    }

    const { error } = await admin
      .from('marketplace_company_members')
      .update({
        billing_notifications_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', profile.company_id)
      .eq('user_id', targetUserId)

    if (error) {
      return NextResponse.json({ error: 'Fakturamottagaren kunde inte sparas.' }, { status: 400 })
    }

    return NextResponse.json({ success: true, enabled })
  } catch (error) {
    console.error('[company-billing-recipient] failed', error)
    return NextResponse.json({ error: 'Fakturamottagaren kunde inte sparas.' }, { status: 500 })
  }
}
