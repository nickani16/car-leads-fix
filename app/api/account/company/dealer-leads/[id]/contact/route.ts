import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { resolveBusinessAccountScope } from '@/lib/billing/business-account-scope'
import {
  dealerLeadAccessStartsAt,
  getDealerLeadPreferences,
  normalizeDealerLeadCountryCode,
  resolveDealerLeadCountryScope,
} from '@/lib/dealer-leads/access'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const CONTACT_METHODS = new Set(['phone', 'email', 'message', 'other'])
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: leadId } = await context.params
  if (!UUID_PATTERN.test(leadId)) {
    return NextResponse.json({ error: 'INVALID_LEAD' }, { status: 400 })
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || typeof body.contacted !== 'boolean') {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const admin = createAdminClient()
  const scope = await resolveBusinessAccountScope(user.id, admin)
  const [{ data: profile }, { data: subscription }] = await Promise.all([
    admin
      .from('marketplace_profiles')
      .select('account_type,company_id,country_code,email,display_name,first_name,last_name')
      .eq('user_id', user.id)
      .maybeSingle(),
    admin
      .from('business_subscriptions')
      .select('plan_key,status,manually_activated,free_period_ends_at,dealer_lead_access_starts_at')
      .eq('user_id', scope.subscriptionUserId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])
  const companyId = scope.companyId
  const accessStartsAt = dealerLeadAccessStartsAt(subscription)
  if (
    profile?.account_type !== 'business' ||
    !companyId ||
    profile.company_id !== companyId ||
    !accessStartsAt
  ) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const homeCountry = normalizeDealerLeadCountryCode(profile.country_code)
  const preferences = await getDealerLeadPreferences(admin, {
    userId: user.id,
    companyId,
    homeCountry,
    profileEmail: profile.email,
  })
  const countries = resolveDealerLeadCountryScope(preferences, homeCountry)
  if (!countries.length) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const { data: lead, error: leadError } = await admin
    .from('dealer_vehicle_leads')
    .select('id')
    .eq('id', leadId)
    .in('source_country_code', countries)
    .gte('created_at', accessStartsAt)
    .maybeSingle()
  if (leadError) {
    console.error('dealer lead contact eligibility failed', leadError)
    return NextResponse.json({ error: 'SAVE_FAILED' }, { status: 500 })
  }
  if (!lead) return NextResponse.json({ error: 'LEAD_NOT_FOUND' }, { status: 404 })

  if (!body.contacted) {
    const { error } = await admin
      .from('dealer_vehicle_lead_company_contacts')
      .delete()
      .eq('lead_id', leadId)
      .eq('company_id', companyId)
    if (error) {
      console.error('dealer lead contact delete failed', error)
      return NextResponse.json({ error: 'SAVE_FAILED' }, { status: 500 })
    }
    revalidatePath('/account/company/dealer-offers')
    return NextResponse.json({ success: true, contact: null })
  }

  const existing = await getExistingContact(admin, leadId, companyId)
  if (existing) return NextResponse.json({ success: true, contact: serializeContact(existing) })

  const contactedAt = new Date()
  const contactedByName = String(
    profile.display_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    profile.email ||
    user.email ||
    'Team member',
  ).trim().slice(0, 160)
  const contactMethod = CONTACT_METHODS.has(String(body.method || ''))
    ? String(body.method)
    : 'other'
  const payload = {
    lead_id: leadId,
    company_id: companyId,
    contacted_by_user_id: user.id,
    contacted_by_name: contactedByName,
    contacted_by_email: String(profile.email || user.email || '').trim().toLowerCase() || null,
    contact_method: contactMethod,
    contacted_at: contactedAt.toISOString(),
    hide_after: new Date(contactedAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    updated_at: contactedAt.toISOString(),
  }
  const { data: inserted, error: insertError } = await admin
    .from('dealer_vehicle_lead_company_contacts')
    .insert(payload)
    .select('contacted_by_name,contact_method,contacted_at,hide_after')
    .maybeSingle()

  if (insertError && insertError.code !== '23505') {
    console.error('dealer lead contact insert failed', insertError)
    return NextResponse.json({ error: 'SAVE_FAILED' }, { status: 500 })
  }

  const contact = inserted || await getExistingContact(admin, leadId, companyId)
  if (!contact) return NextResponse.json({ error: 'SAVE_FAILED' }, { status: 500 })

  revalidatePath('/account/company/dealer-offers')
  return NextResponse.json({ success: true, contact: serializeContact(contact) })
}

type AdminClient = ReturnType<typeof createAdminClient>

async function getExistingContact(admin: AdminClient, leadId: string, companyId: string) {
  const { data, error } = await admin
    .from('dealer_vehicle_lead_company_contacts')
    .select('contacted_by_name,contact_method,contacted_at,hide_after')
    .eq('lead_id', leadId)
    .eq('company_id', companyId)
    .maybeSingle()
  if (error) {
    console.error('dealer lead contact lookup failed', error)
    return null
  }
  return data
}

function serializeContact(contact: {
  contacted_by_name: string
  contact_method: string
  contacted_at: string
  hide_after: string
}) {
  return {
    contactedByName: contact.contacted_by_name,
    method: contact.contact_method,
    contactedAt: contact.contacted_at,
    hideAfter: contact.hide_after,
  }
}
