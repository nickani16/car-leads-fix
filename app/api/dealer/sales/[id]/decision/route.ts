import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: 'Invalid deal.' }, { status: 400 })
  }

  const body = (await request.json()) as {
    decision?: 'accepted' | 'declined'
    notes?: string
  }

  if (body.decision !== 'accepted' && body.decision !== 'declined') {
    return NextResponse.json({ error: 'Choose a decision.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  const { data, error } = await supabase.rpc('dealer_record_seller_decision', {
    p_deal_id: id,
    p_decision: body.decision,
    p_notes: body.notes?.trim() || null,
    p_ip_address: forwardedFor?.split(',')[0]?.trim() || null,
    p_user_agent: request.headers.get('user-agent'),
  })

  if (error) {
    return NextResponse.json(
      { error: error.message || 'The decision could not be saved.' },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, result: data })
}
