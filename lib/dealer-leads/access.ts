import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

export const DEALER_LEAD_COUNTRY_CODES = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'PL', 'AT', 'DK', 'FI'] as const
export type DealerLeadCountryCode = (typeof DEALER_LEAD_COUNTRY_CODES)[number]

export type DealerLeadPreferences = {
  userId: string
  companyId: string | null
  emailEnabled: boolean
  notificationEmail: string | null
  allCountries: boolean
  countryCodes: DealerLeadCountryCode[]
  lastSeenAt: string | null
}

const ELIGIBLE_PLANS = new Set(['growth', 'professional', 'enterprise'])
const ACTIVE_STATUSES = new Set(['active', 'trialing'])

export type DealerLeadSubscription = {
  plan_key?: unknown
  status?: unknown
  manually_activated?: unknown
  free_period_ends_at?: unknown
  dealer_lead_access_starts_at?: unknown
}

export function normalizeDealerLeadCountryCode(value: unknown): DealerLeadCountryCode | null {
  const code = String(value || '').trim().toUpperCase()
  return DEALER_LEAD_COUNTRY_CODES.includes(code as DealerLeadCountryCode)
    ? code as DealerLeadCountryCode
    : null
}

export function normalizeDealerLeadCountryCodes(values: unknown): DealerLeadCountryCode[] {
  if (!Array.isArray(values)) return []
  return [...new Set(values.map(normalizeDealerLeadCountryCode).filter(Boolean))] as DealerLeadCountryCode[]
}

export function dealerPlanCanReceiveLeads(planKey: unknown) {
  return ELIGIBLE_PLANS.has(String(planKey || '').trim().toLowerCase())
}

export function dealerSubscriptionIsActive(subscription: DealerLeadSubscription | null | undefined) {
  if (!subscription) return false
  if (ACTIVE_STATUSES.has(String(subscription.status || '').toLowerCase())) return true
  if (subscription.manually_activated === true) return true
  const freeUntil = String(subscription.free_period_ends_at || '')
  return Boolean(freeUntil && new Date(freeUntil).getTime() > Date.now())
}

export function dealerLeadAccessStartsAt(subscription: DealerLeadSubscription | null | undefined) {
  if (!subscription || !dealerPlanCanReceiveLeads(subscription.plan_key) || !dealerSubscriptionIsActive(subscription)) {
    return null
  }
  const timestamp = normalizeTimestamp(subscription.dealer_lead_access_starts_at)
  if (!timestamp || new Date(timestamp).getTime() > Date.now()) return null
  return timestamp
}

export function dealerLeadWasCreatedDuringAccess(
  subscription: DealerLeadSubscription | null | undefined,
  leadCreatedAt: unknown,
) {
  const accessStartsAt = dealerLeadAccessStartsAt(subscription)
  const leadTimestamp = normalizeTimestamp(leadCreatedAt)
  return Boolean(accessStartsAt && leadTimestamp && new Date(leadTimestamp).getTime() >= new Date(accessStartsAt).getTime())
}

export function resolveDealerLeadCountryScope(
  preferences: Pick<DealerLeadPreferences, 'allCountries' | 'countryCodes'>,
  homeCountry: unknown,
): DealerLeadCountryCode[] {
  if (preferences.allCountries) return [...DEALER_LEAD_COUNTRY_CODES]
  if (preferences.countryCodes.length) return preferences.countryCodes
  const normalizedHome = normalizeDealerLeadCountryCode(homeCountry)
  return normalizedHome ? [normalizedHome] : []
}

export async function getDealerLeadPreferences(
  admin: SupabaseClient,
  input: {
    userId: string
    companyId?: string | null
    homeCountry?: string | null
    profileEmail?: string | null
  },
): Promise<DealerLeadPreferences> {
  const { data, error } = await admin
    .from('dealer_lead_notification_preferences')
    .select('user_id,company_id,email_enabled,notification_email,all_countries,country_codes,last_seen_at')
    .eq('user_id', input.userId)
    .maybeSingle()

  if (error && error.code !== '42P01' && error.code !== '42703') throw error

  return {
    userId: input.userId,
    companyId: data?.company_id || input.companyId || null,
    emailEnabled: data?.email_enabled !== false,
    notificationEmail: normalizeEmail(data?.notification_email) || normalizeEmail(input.profileEmail),
    allCountries: data?.all_countries === true,
    countryCodes: data
      ? normalizeDealerLeadCountryCodes(data.country_codes)
      : normalizeDealerLeadCountryCodes([input.homeCountry]),
    lastSeenAt: data?.last_seen_at || null,
  }
}

export async function countUnreadDealerLeads(
  admin: SupabaseClient,
  input: {
    preferences: DealerLeadPreferences
    accessStartsAt: string
    homeCountry?: string | null
    companyId?: string | null
  },
) {
  const countries = resolveDealerLeadCountryScope(input.preferences, input.homeCountry)
  const accessStartsAt = normalizeTimestamp(input.accessStartsAt)
  if (!countries.length || !accessStartsAt) return 0

  const lastSeenAt = normalizeTimestamp(input.preferences.lastSeenAt)
  const hasSeenDuringAccess = Boolean(
    lastSeenAt && new Date(lastSeenAt).getTime() >= new Date(accessStartsAt).getTime(),
  )
  const pageSize = 250
  let offset = 0
  let visibleCount = 0

  while (visibleCount < 100) {
    let query = admin
      .from('dealer_vehicle_leads')
      .select('id')
      .in('source_country_code', countries)
      .gte('created_at', accessStartsAt)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)
    if (hasSeenDuringAccess) query = query.gt('created_at', lastSeenAt!)
    const { data, error } = await query
    if (error && error.code !== '42P01' && error.code !== '42703') throw error

    const leadIds = (data || []).map((lead) => String(lead.id)).filter(Boolean)
    if (!leadIds.length) break
    if (!input.companyId) {
      visibleCount += leadIds.length
    } else {
      const { data: hiddenContacts, error: contactError } = await admin
        .from('dealer_vehicle_lead_company_contacts')
        .select('lead_id')
        .eq('company_id', input.companyId)
        .in('lead_id', leadIds)
        .lte('hide_after', new Date().toISOString())
      if (contactError && contactError.code !== '42P01') throw contactError
      const hiddenLeadIds = new Set((hiddenContacts || []).map((contact) => String(contact.lead_id)))
      visibleCount += leadIds.filter((leadId) => !hiddenLeadIds.has(leadId)).length
    }

    if (leadIds.length < pageSize) break
    offset += pageSize
  }

  return Math.min(visibleCount, 100)
}

export function normalizeEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

function normalizeTimestamp(value: unknown) {
  const timestamp = String(value || '').trim()
  const milliseconds = timestamp ? new Date(timestamp).getTime() : Number.NaN
  return Number.isFinite(milliseconds) ? new Date(milliseconds).toISOString() : null
}
