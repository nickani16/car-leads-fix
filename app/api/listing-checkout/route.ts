import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { hashSellerAccessToken } from '@/lib/seller-access'
import {
  isListingPackage,
  listingPackages,
} from '@/lib/listing-packages'

export async function POST(request: Request) {
  try {
    const { token, packageId } = (await request.json()) as {
      token?: string
      packageId?: string
    }

    if (!token || !isListingPackage(packageId)) {
      return NextResponse.json(
        { error: 'Ogiltigt paket eller åtkomstlänk.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(
        'id,email,make,model,auction_ends_at,auction_closed_at,auction_outcome'
      )
      .eq('seller_access_token_hash', hashSellerAccessToken(token))
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Säljarvyn kunde inte verifieras.' },
        { status: 404 }
      )
    }

    const auctionEnded =
      lead.auction_closed_at ||
      (lead.auction_ends_at &&
        new Date(lead.auction_ends_at).getTime() <= Date.now())

    if (!auctionEnded) {
      return NextResponse.json(
        {
          error:
            'Det kostnadsfria 24-timmarsfönstret måste avslutas först.',
        },
        { status: 409 }
      )
    }

    const { data: activeDeal } = await supabase
      .from('deals')
      .select('id,status')
      .eq('lead_id', lead.id)
      .not('status', 'in', '("cancelled","completed")')
      .maybeSingle()

    if (activeDeal) {
      return NextResponse.json(
        {
          error:
            'Bilen har redan en pågående affär och kan inte förlängas just nu.',
        },
        { status: 409 }
      )
    }

    const selectedPackage = listingPackages[packageId]
    const { data: order, error: orderError } = await supabase
      .from('seller_listing_orders')
      .insert({
        lead_id: lead.id,
        package: packageId,
        amount_cents: selectedPackage.amountCents,
      })
      .select('id')
      .single()

    if (orderError || !order) throw orderError

    const origin = new URL(request.url).origin
    const sellerUrl = `${origin}/saljarportal/${encodeURIComponent(token)}`
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: lead.email || undefined,
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
        sellerTokenHash: hashSellerAccessToken(token),
      },
      success_url: `${sellerUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${sellerUrl}?payment=cancelled`,
      locale: 'sv',
    })

    const { error: sessionUpdateError } = await supabase
      .from('seller_listing_orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id)

    if (sessionUpdateError) throw sessionUpdateError

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Listing checkout error:', error)
    return NextResponse.json(
      { error: 'Betalningen kunde inte startas. Försök igen.' },
      { status: 500 }
    )
  }
}
