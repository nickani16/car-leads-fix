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

export function dealerSubscriptionIsActive(subscription: {
  status?: unknown
  manually_activated?: unknown
  free_period_ends_at?: unknown
} | null | undefined) {
  if (!subscription) return false
  if (ACTIVE_STATUSES.has(String(subscription.status || '').toLowerCase())) return true
  if (subscription.manually_activated === true) return true
  const freeUntil = String(subscription.free_period_ends_at || '')
  return Boolean(freeUntil && new Date(freeUntil).getTime() > Date.now())
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
    homeCountry?: string | null
  },
) {
  const countries = resolveDealerLeadCountryScope(input.preferences, input.homeCountry)
  if (!countries.length) return 0

  let query = admin
    .from('dealer_vehicle_leads')
    .select('id', { count: 'exact', head: true })
    .in('source_country_code', countries)

  if (input.preferences.lastSeenAt) query = query.gt('created_at', input.preferences.lastSeenAt)
  const { count, error } = await query
  if (error && error.code !== '42P01' && error.code !== '42703') throw error
  return count || 0
}

export function normalizeEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}
