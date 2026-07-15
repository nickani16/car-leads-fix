import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import BusinessPlanChooser from './BusinessPlanChooser'

export default async function BusinessSubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const admin = createAdminClient()
  const { data: profile } = await admin.from('marketplace_profiles').select('account_type,business_onboarding_status').eq('user_id', user.id).maybeSingle()
  if (profile?.account_type !== 'business') redirect('/account')
  if (profile.business_onboarding_status === 'under_review') redirect('/account/business/status?state=under_review')
  const { data: subscription } = await admin
    .from('business_subscriptions')
    .select('product_key,plan_key,status,payment_status,active_listing_limit,next_billing_at,current_period_end')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (
    <BusinessPlanChooser
      currentPlan={subscription?.plan_key || null}
      currentStatus={subscription?.status || null}
      paymentStatus={subscription?.payment_status || null}
      currentProductKey={subscription?.product_key || null}
      activeListingLimit={subscription?.active_listing_limit || null}
      nextBillingAt={subscription?.next_billing_at || subscription?.current_period_end || null}
    />
  )
}
