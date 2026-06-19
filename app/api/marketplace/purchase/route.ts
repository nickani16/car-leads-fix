import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEALER_TERMS_VERSION } from '@/lib/legal'
import { createAdminClient } from '@/lib/supabase/admin'
import { trackConversion } from '@/lib/conversion-tracking'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      leadId?: string
      termsAccepted?: boolean
    }
    const leadId = body.leadId?.trim() || ''

    if (!uuidPattern.test(leadId)) {
      return NextResponse.json({ error: 'Invalid vehicle.' }, { status: 400 })
    }
    if (!body.termsAccepted) {
      return NextResponse.json(
        { error: 'Confirm the binding purchase terms before continuing.' },
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

    const { data, error } = await supabase.rpc(
      'purchase_marketplace_vehicle',
      {
        p_lead_id: leadId,
        p_terms_version: DEALER_TERMS_VERSION,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
      }
    )

    if (error) {
      const message = error.message || 'The vehicle could not be purchased.'
      const status =
        message.includes('not approved') || message.includes('not authenticated')
          ? 403
          : message.includes('already') ||
              message.includes('unavailable') ||
              message.includes('expired')
            ? 409
            : 400
      return NextResponse.json({ error: message }, { status })
    }

    const result = Array.isArray(data) ? data[0] : data
    const dealerResult = await createAdminClient()
      .from('dealers')
      .select('id,country_code')
      .eq('user_id', user.id)
      .maybeSingle()

    await trackConversion(request, {
      eventName: 'bid_submitted',
      countryCode: dealerResult.data?.country_code || null,
      userId: user.id,
      dealerId: dealerResult.data?.id || null,
      leadId,
      value: Number(result?.amount || 0),
      currency: 'EUR',
      dedupeKey: `marketplace-purchase:${result?.deal_id || leadId}`,
      metadata: { saleFormat: 'marketplace', purchaseType: 'buy_now' },
    })

    return NextResponse.json({ success: true, purchase: result })
  } catch (error) {
    console.error('Marketplace purchase route error:', error)
    return NextResponse.json(
      { error: 'The vehicle could not be purchased. Please try again.' },
      { status: 500 }
    )
  }
}
