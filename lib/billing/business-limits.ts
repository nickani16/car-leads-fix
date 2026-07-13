import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export const BUSINESS_PLAN_LIMITS = {
  starter: 25,
  growth: 100,
  professional: 500,
} as const

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing'])
const WARNING_SUBSCRIPTION_STATUSES = new Set(['past_due', 'unpaid'])

export type BusinessPublicationLimitResult =
  | { allowed: true; limit: number; activeCount: number; planKey: string; status: string }
  | { allowed: false; limit: number | null; activeCount: number; planKey: string | null; status: string | null; reason: string }

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
