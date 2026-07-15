import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export const BUSINESS_PLAN_LIMITS = {
  free: 5,
  starter: 25,
  growth: 100,
  professional: 500,
} as const

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing'])
const WARNING_SUBSCRIPTION_STATUSES = new Set(['past_due', 'unpaid'])

export type BusinessPublicationLimitResult =
  | { allowed: true; limit: number; activeCount: number; planKey: string; status: string }
  | { allowed: false; limit: number | null; activeCount: number; planKey: string | null; status: string | null; reason: string }

export type BusinessListingQuotaReservation =
  | {
      allowed: true
      reservationKey: string
      limit: number
      used: number
      remaining: number
      planKey: string
      status: string
      periodStart: string
      periodEnd: string
    }
  | {
      allowed: false
      reason: string
      limit: number | null
      used: number
      remaining: number
      planKey: string | null
      status: string | null
      periodStart: string | null
      periodEnd: string | null
    }

function normalizeQuotaReservation(value: unknown): BusinessListingQuotaReservation {
  const row = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  if (row.allowed === true) {
    return {
      allowed: true,
      reservationKey: String(row.reservationKey || ''),
      limit: Number(row.limit || 0),
      used: Number(row.used || 0),
      remaining: Number(row.remaining || 0),
      planKey: String(row.planKey || ''),
      status: String(row.status || ''),
      periodStart: String(row.periodStart || ''),
      periodEnd: String(row.periodEnd || ''),
    }
  }

  return {
    allowed: false,
    reason: String(row.reason || 'quota_reservation_failed'),
    limit: Number.isFinite(Number(row.limit)) ? Number(row.limit) : null,
    used: Number(row.used || 0),
    remaining: Number(row.remaining || 0),
    planKey: row.planKey ? String(row.planKey) : null,
    status: row.status ? String(row.status) : null,
    periodStart: row.periodStart ? String(row.periodStart) : null,
    periodEnd: row.periodEnd ? String(row.periodEnd) : null,
  }
}

export async function reserveBusinessListingQuota(userId: string): Promise<BusinessListingQuotaReservation> {
  const reservationKey = crypto.randomUUID()
  const { data, error } = await createAdminClient().rpc('reserve_business_listing_quota', {
    p_user_id: userId,
    p_reservation_key: reservationKey,
  })

  if (error) throw error
  return normalizeQuotaReservation(data)
}

export async function attachBusinessListingQuotaReservation(reservationKey: string, listingId: string): Promise<void> {
  const { error } = await createAdminClient().rpc('attach_business_listing_quota_reservation', {
    p_reservation_key: reservationKey,
    p_listing_id: listingId,
  })

  if (error) throw error
}

export async function releaseBusinessListingQuotaReservation(reservationKey: string): Promise<void> {
  const { error } = await createAdminClient().rpc('release_business_listing_quota_reservation', {
    p_reservation_key: reservationKey,
  })

  if (error) throw error
}

export async function checkBusinessListingPublicationLimit(userId: string): Promise<BusinessPublicationLimitResult> {
  const admin = createAdminClient()
  const { data: subscription, error: subscriptionError } = await admin
    .from('business_subscriptions')
    .select('plan_key,status,active_listing_limit,grace_period_ends_at,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subscriptionError) throw subscriptionError
  if (!subscription) {
    return { allowed: false, limit: null, activeCount: 0, planKey: null, status: null, reason: 'missing_subscription' }
  }

  const planKey = String(subscription.plan_key || '')
  const configuredLimit = Number(subscription.active_listing_limit)
  const fallbackLimit = BUSINESS_PLAN_LIMITS[planKey as keyof typeof BUSINESS_PLAN_LIMITS] || null
  const limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : fallbackLimit
  if (!limit) {
    return { allowed: false, limit: null, activeCount: 0, planKey, status: subscription.status, reason: 'invalid_plan_limit' }
  }

  const status = String(subscription.status || '')
  const graceEndsAt = subscription.grace_period_ends_at ? new Date(subscription.grace_period_ends_at).getTime() : null
  const inGrace = WARNING_SUBSCRIPTION_STATUSES.has(status) && graceEndsAt !== null && graceEndsAt > Date.now()
  if (!ACTIVE_SUBSCRIPTION_STATUSES.has(status) && !inGrace) {
    return { allowed: false, limit, activeCount: 0, planKey, status, reason: 'subscription_not_active' }
  }

  const { count, error: countError } = await admin
    .from('marketplace_listings')
    .select('id', { count: 'exact', head: true })
    .eq('seller_user_id', userId)
    .eq('status', 'published')
    .is('sold_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  if (countError) throw countError
  const activeCount = count || 0
  if (activeCount >= limit) {
    return { allowed: false, limit, activeCount, planKey, status, reason: 'active_listing_limit_reached' }
  }

  return { allowed: true, limit, activeCount, planKey, status }
}
