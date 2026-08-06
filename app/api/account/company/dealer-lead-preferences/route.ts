import { NextResponse } from 'next/server'
import { normalizeDealerLeadCountryCodes, normalizeEmail, dealerPlanCanReceiveLeads, dealerSubscriptionIsActive } from '@/lib/dealer-leads/access'
import { resolveBusinessAccountScope } from '@/lib/billing/business-account-scope'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const admin = createAdminClient()
  const scope = await resolveBusinessAccountScope(user.id, admin)
  const [{ data: profile }, { data: subscription }] = await Promise.all([
    admin.from('marketplace_profiles').select('account_type,company_id,country_code,email').eq('user_id', user.id).maybeSingle(),
    admin.from('business_subscriptions').select('plan_key,status,manually_activated,free_period_ends_at').eq('user_id', scope.subscriptionUserId).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
  ])
  if (profile?.account_type !== 'business' || !dealerPlanCanReceiveLeads(subscription?.plan_key) || !dealerSubscriptionIsActive(subscription)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  const mode = body.mode === 'all' || body.mode === 'selected' || body.mode === 'home' ? body.mode : null
  if (!mode) return NextResponse.json({ error: 'INVALID_SCOPE' }, { status: 400 })
  const homeCountry = normalizeDealerLeadCountryCodes([profile.country_code])
  const selected = normalizeDealerLeadCountryCodes(body.countryCodes)
  const countryCodes = mode === 'home' ? homeCountry : mode === 'selected' ? selected : []
  if (mode !== 'all' && !countryCodes.length) return NextResponse.json({ error: 'COUNTRY_REQUIRED' }, { status: 400 })

  const notificationEmail = normalizeEmail(body.notificationEmail) || normalizeEmail(profile.email)
  if (body.emailEnabled !== false && !notificationEmail) return NextResponse.json({ error: 'EMAIL_REQUIRED' }, { status: 400 })

  const { error } = await admin.from('dealer_lead_notification_preferences').upsert({
    user_id: user.id,
    company_id: profile.company_id,
    email_enabled: body.emailEnabled !== false,
    notification_email: notificationEmail,
    all_countries: mode === 'all',
    country_codes: countryCodes,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  if (error) {
    console.error('dealer lead preferences update failed', error)
    return NextResponse.json({ error: 'SAVE_FAILED' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
