import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listingPackages } from '@/lib/listing-packages'
import { getStripe } from '@/lib/stripe'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { action, saleFormat, buyNowPrice, reservePrice } =
    (await request.json()) as {
    action?: 'approve' | 'reject'
    saleFormat?: 'auction' | 'marketplace'
    buyNowPrice?: number | null
    reservePrice?: number | null
  }

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid review action.' }, { status: 400 })
  }

  let selectedSaleFormat =
    saleFormat === 'marketplace' ? 'marketplace' : 'auction'
  const selectedBuyNowPrice = Number(buyNowPrice)
  const selectedReservePrice = Number(reservePrice)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const adminClient = createAdminClient()
  const { data: adminUser } = await adminClient
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  }

  const { data: lead, error: leadError } = await adminClient
    .from('leads')
    .select('id,status,listing_plan,submission_type,seller_dealer_id')
    .eq('id', id)
    .single()

  if (leadError || !lead) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
  }

  if (
    lead.submission_type === 'private_bid' ||
    (!lead.submission_type && !lead.seller_dealer_id)
  ) {
    selectedSaleFormat = 'auction'
  }

  if (
    action === 'approve' &&
    selectedSaleFormat === 'marketplace' &&
    (!Number.isFinite(selectedBuyNowPrice) || selectedBuyNowPrice <= 0)
  ) {
    return NextResponse.json(
      { error: 'Enter a valid marketplace price.' },
      { status: 400 }
    )
  }

  if (action === 'reject') {
    const { data: paidOrder } = await adminClient
      .from('seller_listing_orders')
      .select('id,stripe_payment_intent_id')
      .eq('lead_id', id)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (paidOrder?.stripe_payment_intent_id) {
      try {
        await getStripe().refunds.create(
          {
            payment_intent: paidOrder.stripe_payment_intent_id,
            metadata: {
              leadId: id,
              reason: 'vehicle_rejected_during_review',
            },
          },
          { idempotencyKey: `review-rejection-${paidOrder.id}` }
        )
      } catch (error) {
        console.error('Listing package refund failed:', error)
        return NextResponse.json(
          {
            error:
              'Refund failed. The vehicle has not been rejected yet. Try again.',
          },
          { status: 502 }
        )
      }

      await adminClient
        .from('seller_listing_orders')
        .update({ status: 'refunded' })
        .eq('id', paidOrder.id)
    }

    await adminClient
      .from('seller_listing_orders')
      .update({ status: 'cancelled' })
      .eq('lead_id', id)
      .eq('status', 'pending')

    const { error } = await adminClient
      .from('leads')
      .update({
        status: 'Rejected',
        auction_starts_at: null,
        auction_ends_at: null,
        auction_closed_at: new Date().toISOString(),
        auction_outcome: 'rejected',
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, status: 'Rejected' })
  }

  const durationDays =
    lead.listing_plan === 'extended_7d'
      ? listingPackages.extended_7d.durationDays
      : lead.listing_plan === 'premium_30d'
        ? listingPackages.premium_30d.durationDays
        : 1
  const startsAt = new Date()
  const endsAt = new Date(
    startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000
  )
  const { count: dealerReach } = await adminClient
    .from('dealers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { error: updateError } = await adminClient
    .from('leads')
    .update({
      status: 'Active',
      sale_format: selectedSaleFormat,
      buy_now_price:
        selectedSaleFormat === 'marketplace' ? selectedBuyNowPrice : null,
      reserve_price:
        selectedSaleFormat === 'auction' &&
        Number.isFinite(selectedReservePrice) &&
        selectedReservePrice > 0
          ? selectedReservePrice
          : null,
      auction_starts_at: startsAt.toISOString(),
      auction_ends_at: endsAt.toISOString(),
      auction_closed_at: null,
      auction_outcome: null,
      dealer_reach_snapshot: dealerReach || 0,
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  await adminClient
    .from('seller_listing_orders')
    .update({
      activated_at: startsAt.toISOString(),
      expires_at: endsAt.toISOString(),
      dealer_reach_snapshot: dealerReach || 0,
    })
    .eq('lead_id', id)
    .eq('status', 'paid')
    .is('activated_at', null)

  return NextResponse.json({ success: true, status: 'Active' })
}
