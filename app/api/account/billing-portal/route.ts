import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const limit = checkRateLimit({
    key: `billing-portal:${user.id}:${getClientIp(request)}`,
    limit: 6,
    windowMs: 10 * 60 * 1000,
  })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  const admin = createAdminClient()
  const { data: subscription, error } = await admin
    .from('business_subscriptions')
    .select('stripe_customer_id,status')
    .eq('user_id', user.id)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    return NextResponse.json({ error: 'Could not load subscription.' }, { status: 500 })
  }
  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: 'No Stripe customer is connected to this business account.' }, { status: 404 })
  }

  const origin = new URL(request.url).origin
  const portal = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${origin}/account`,
  })

  return NextResponse.json({ url: portal.url })
}
