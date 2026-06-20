import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import {
  isListingPackage,
  listingPackages,
} from '@/lib/listing-packages'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!uuidPattern.test(id)) {
      return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { packageId } = (await request.json().catch(() => ({}))) as {
      packageId?: string
    }
    if (!isListingPackage(packageId)) {
      return NextResponse.json(
        { error: 'Choose a valid marketplace upgrade.' },
        { status: 400 }
      )
    }
    const { data: dealer } = await admin
      .from('dealers')
      .select('id,email,status')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!dealer || dealer.status !== 'approved') {
      return NextResponse.json(
        { error: 'An approved dealer account is required.' },
        { status: 403 }
      )
    }

    const { data: lead } = await admin
      .from('leads')
      .select('id,seller_dealer_id,status')
      .eq('id', id)
      .maybeSingle()
    if (
      !lead ||
      lead.seller_dealer_id !== dealer.id
    ) {
      return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 })
    }

    const { data: paidOrder } = await admin
      .from('seller_listing_orders')
      .select('id')
      .eq('lead_id', id)
      .eq('status', 'paid')
      .limit(1)
      .maybeSingle()

    if (paidOrder) {
      return NextResponse.json(
        { error: 'A marketplace upgrade is already active for this vehicle.' },
        { status: 409 }
      )
    }

    const selectedPackage = listingPackages[packageId]
    const { data: order, error: orderError } = await admin
      .from('seller_listing_orders')
      .insert({
        lead_id: lead.id,
        package: packageId,
        amount_cents: selectedPackage.amountCents,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      throw orderError || new Error('Listing order could not be created')
    }

    const origin = new URL(request.url).origin
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: dealer.email || undefined,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'sek',
            unit_amount: selectedPackage.amountCents,
            product_data: {
              name: selectedPackage.name,
              description: selectedPackage.description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order.id,
        leadId: lead.id,
        package: packageId,
        dealerId: dealer.id,
      },
      success_url: `${origin}/dealer/sales?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dealer/sales?payment=cancelled`,
      locale: 'en',
    })

    await admin
      .from('seller_listing_orders')
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq('id', order.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Dealer listing checkout retry failed', error)
    return NextResponse.json(
      { error: 'The payment could not be started.' },
      { status: 500 }
    )
  }
}
