import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEALER_TERMS_VERSION } from '@/lib/legal'

type BidRequest = {
  leadId?: string
  amount?: number
  termsAccepted?: boolean
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BidRequest
    const leadId = body.leadId?.trim() || ''
    const amount = Number(body.amount)

    if (!uuidPattern.test(leadId)) {
      return NextResponse.json({ error: 'Invalid vehicle.' }, { status: 400 })
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
      return NextResponse.json(
        { error: 'Enter a valid bid amount.' },
        { status: 400 }
      )
    }

    if (!body.termsAccepted) {
      return NextResponse.json(
        { error: 'Confirm the binding bid terms before submitting.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Your session has expired. Please sign in again.' },
        { status: 401 }
      )
    }

    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || null
    const userAgent = request.headers.get('user-agent')

    const { data, error } = await supabase.rpc('place_dealer_bid', {
      p_lead_id: leadId,
      p_amount: amount,
      p_terms_version: DEALER_TERMS_VERSION,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    })

    if (error) {
      const message = error.message || 'Your bid could not be submitted.'
      const status =
        message.includes('not approved') || message.includes('not authenticated')
          ? 403
          : message.includes('closed') ||
              message.includes('higher') ||
              message.includes('valid bid')
            ? 409
            : 400

      return NextResponse.json({ error: message }, { status })
    }

    const bid = Array.isArray(data) ? data[0] : data

    return NextResponse.json({ success: true, bid })
  } catch (error) {
    console.error('Bid route error:', error)
    return NextResponse.json(
      { error: 'Your bid could not be submitted. Please try again.' },
      { status: 500 }
    )
  }
}
