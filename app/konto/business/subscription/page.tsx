import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRequestLocale } from '@/lib/request-locale'
import { normalizeBillingMarket, type BillingMarket } from '@/lib/billing/product-catalog'
import type { PublicLocale } from '@/lib/public-i18n'
import BusinessPlanChooser from './BusinessPlanChooser'

export default async function BusinessSubscriptionPage({
  localeOverride,
  marketOverride,
}: {
  localeOverride?: PublicLocale
  marketOverride?: BillingMarket
} = {}) {
  const locale = localeOverride || await getRequestLocale()
  const market = marketOverride || normalizeBillingMarket(locale === 'sv' ? 'se' : locale === 'da' ? 'dk' : locale)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const admin = createAdminClient()
  const { data: profile } = await admin.from('marketplace_profiles').select('account_type,business_onboarding_status').eq('user_id', user.id).maybeSingle()
  if (profile?.account_type !== 'business') redirect('/account')
  if (profile.business_onboarding_status === 'under_review') redirect('/account/business/status?state=under_review')
  const { data: subscription } = await admin
    .from('business_subscriptions')
    .select('id,product_key,plan_key,status,payment_status,active_listing_limit,next_billing_at,current_period_end,cancel_at_period_end,cancellation_requested_at,cancellation_effective_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (
    <BusinessPlanChooser
      locale={locale}
      market={market}
      subscriptionId={subscription?.id || null}
      currentPlan={subscription?.plan_key || null}
      currentStatus={subscription?.status || null}
      paymentStatus={subscription?.payment_status || null}
      currentProductKey={subscription?.product_key || null}
      activeListingLimit={subscription?.active_listing_limit || null}
      nextBillingAt={subscription?.next_billing_at || subscription?.current_period_end || null}
      cancelAtPeriodEnd={subscription?.cancel_at_period_end || false}
      cancellationRequestedAt={subscription?.cancellation_requested_at || null}
      cancellationEffectiveAt={subscription?.cancellation_effective_at || null}
    />
  )
}
