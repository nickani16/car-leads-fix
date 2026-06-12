import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { fulfillListingCheckout } from '@/lib/listing-packages'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook is not configured.' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error('Invalid Stripe webhook signature:', error)
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      await fulfillListingCheckout(event.data.object)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook fulfillment error:', error)
    return NextResponse.json(
      { error: 'Webhook fulfillment failed.' },
      { status: 500 }
    )
  }
}
