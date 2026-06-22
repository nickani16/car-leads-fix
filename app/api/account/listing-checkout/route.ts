import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { getListingPrice, type MarketplacePackage } from '@/lib/marketplace-pricing'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const { leadId, packageId } = (await request.json()) as { leadId?: string; packageId?: MarketplacePackage }
  if (!leadId || !packageId || packageId === 'free_7d') return NextResponse.json({ error: 'Invalid checkout.' }, { status: 400 })
  const admin = createAdminClient()
  const [{ data: profile }, { data: lead }] = await Promise.all([
    admin.from('marketplace_profiles').select('account_type,email').eq('user_id', user.id).maybeSingle(),
    admin.from('leads').select('id,seller_user_id,vehicle_category,make,model').eq('id', leadId).maybeSingle(),
  ])
  if (!profile || !lead || lead.seller_user_id !== user.id) return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  const price = getListingPrice(lead.vehicle_category, packageId, profile.account_type)
  const { data: order, error } = await admin.from('seller_listing_orders').insert({
    lead_id: lead.id,
    package: packageId,
    amount_cents: price * 100,
    account_type: profile.account_type,
    vehicle_category: lead.vehicle_category,
  }).select('id').single()
  if (error || !order) return NextResponse.json({ error: error?.message }, { status: 400 })
  const origin = new URL(request.url).origin
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    customer_email: profile.email,
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency: 'sek', unit_amount: price * 100, product_data: { name: `${packageId === 'standard_15d' ? '15 dagar' : 'Premium 30 dagar'} – ${lead.make} ${lead.model}` } }, quantity: 1 }],
    metadata: { orderId: order.id, leadId: lead.id, package: packageId },
    success_url: `${origin}/konto/annonser?payment=success`,
    cancel_url: `${origin}/konto/annonser?payment=cancelled`,
  })
  await admin.from('seller_listing_orders').update({ stripe_checkout_session_id: session.id }).eq('id', order.id)
  return NextResponse.json({ url: session.url })
}
