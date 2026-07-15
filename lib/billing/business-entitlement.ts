import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { BUSINESS_PLAN_LIMITS } from '@/lib/billing/business-limits'
import { resolveBusinessAccountScope } from '@/lib/billing/business-account-scope'

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing'])
const RESERVED_LISTING_STATUSES = ['published', 'pending_review', 'paused'] as const

export type BusinessListingEntitlement = {
  allowed: true
  accountType: 'business'
  planKey: string
  subscriptionStatus: string
  activeListingLimit: number
  activeListingCount: number
  reservedStatuses: readonly string[]
  manuallyActivated: boolean
  freePeriodEndsAt: string | null
  subscriptionUserId: string
  listingOwnerUserIds: string[]
}

export type BusinessListingEntitlementFailure = {
  allowed: false
  code: 'BUSINESS_SUBSCRIPTION_REQUIRED' | 'BUSINESS_LISTING_LIMIT_REACHED'
  reason: string
  accountType: string | null
  planKey: string | null
  subscriptionStatus: string | null
  activeListingLimit: number | null
  activeListingCount: number
  reservedStatuses: readonly string[]
  subscriptionUserId: string | null
  listingOwnerUserIds: string[]
}

export async function requireBusinessListingEntitlement(
  userId: string,
): Promise<BusinessListingEntitlement | BusinessListingEntitlementFailure> {
  const admin = createAdminClient()
  const scope = await resolveBusinessAccountScope(userId, admin)
  const { data: subscription, error: subscriptionError } = await admin
    .from('business_subscriptions')
    .select('plan_key,status,active_listing_limit,manually_activated,free_period_ends_at,temporary_quota,updated_at')
    .eq('user_id', scope.subscriptionUserId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subscriptionError) throw subscriptionError

  if (!scope.profile || scope.profile.account_type !== 'business') {
    return {
      allowed: true,
      accountType: 'business',
      planKey: 'private',
      subscriptionStatus: 'not_required',
      activeListingLimit: Number.MAX_SAFE_INTEGER,
      activeListingCount: 0,
      reservedStatuses: RESERVED_LISTING_STATUSES,
      manuallyActivated: false,
      freePeriodEndsAt: null,
      subscriptionUserId: userId,
      listingOwnerUserIds: [userId],
    }
  }

  const planKey = subscription?.plan_key ? String(subscription.plan_key) : null
  const status = subscription?.status ? String(subscription.status) : null
  const manuallyActivated = subscription?.manually_activated === true
  const freePeriodEndsAt = subscription?.free_period_ends_at ? String(subscription.free_period_ends_at) : null
  const freePeriodActive = Boolean(freePeriodEndsAt && new Date(freePeriodEndsAt).getTime() > Date.now())
  const onboarding = String(scope.profile.business_onboarding_status || '')
  const verified = ['verified', 'vat_validated'].includes(String(scope.profile.business_verification_status || ''))
  const planLimit = Number(subscription?.active_listing_limit)
  const fallbackLimit = planKey ? BUSINESS_PLAN_LIMITS[planKey as keyof typeof BUSINESS_PLAN_LIMITS] : null
  const extraQuota = Number(subscription?.temporary_quota)
  const limit = Number.isFinite(planLimit) && planLimit > 0
    ? planLimit
    : fallbackLimit && fallbackLimit > 0
      ? fallbackLimit
      : null
  const activeListingCount = await countReservedListings(admin, scope.listingOwnerUserIds)
  const activeSubscription = Boolean(subscription && (ACTIVE_SUBSCRIPTION_STATUSES.has(status || '') || manuallyActivated || freePeriodActive))
  const onboardingAllowsListings = onboarding === 'active'

  if (!subscription || !verified || !onboardingAllowsListings || !activeSubscription || !limit) {
    return {
      allowed: false,
      code: 'BUSINESS_SUBSCRIPTION_REQUIRED',
      reason: 'Business account requires an approved and active subscription, free period, or manual activation.',
      accountType: 'business',
      planKey,
      subscriptionStatus: status,
      activeListingLimit: limit,
      activeListingCount,
      reservedStatuses: RESERVED_LISTING_STATUSES,
      subscriptionUserId: scope.subscriptionUserId,
      listingOwnerUserIds: scope.listingOwnerUserIds,
    }
  }

  const effectiveLimit = limit + (Number.isFinite(extraQuota) && extraQuota > 0 ? extraQuota : 0)
  if (activeListingCount >= effectiveLimit) {
    return {
      allowed: false,
      code: 'BUSINESS_LISTING_LIMIT_REACHED',
      reason: 'Business subscription active listing limit reached.',
      accountType: 'business',
      planKey,
      subscriptionStatus: status,
      activeListingLimit: effectiveLimit,
      activeListingCount,
      reservedStatuses: RESERVED_LISTING_STATUSES,
      subscriptionUserId: scope.subscriptionUserId,
      listingOwnerUserIds: scope.listingOwnerUserIds,
    }
  }

  return {
    allowed: true,
    accountType: 'business',
    planKey: planKey || 'enterprise',
    subscriptionStatus: status || 'active',
    activeListingLimit: effectiveLimit,
    activeListingCount,
    reservedStatuses: RESERVED_LISTING_STATUSES,
    manuallyActivated,
    freePeriodEndsAt,
    subscriptionUserId: scope.subscriptionUserId,
    listingOwnerUserIds: scope.listingOwnerUserIds,
  }
}

async function countReservedListings(admin: ReturnType<typeof createAdminClient>, userIds: string[]) {
  const { count, error } = await admin
    .from('marketplace_listings')
    .select('id', { count: 'exact', head: true })
    .in('seller_user_id', userIds.length ? userIds : [''])
    .in('status', [...RESERVED_LISTING_STATUSES])
  if (error) throw error
  return count || 0
}
