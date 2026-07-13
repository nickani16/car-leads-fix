import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Sign in to contact the seller.' },
      { status: 401 },
    )
  }

  const { listingId } = (await request.json()) as { listingId?: string }
  if (!listingId) {
    return NextResponse.json({ error: 'Listing is missing.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('id,seller_user_id,status,expires_at')
    .eq('id', listingId)
    .maybeSingle()

  if (
    !listing?.seller_user_id ||
    listing.status !== 'published' ||
    (listing.expires_at && new Date(listing.expires_at) <= new Date())
  ) {
    return NextResponse.json(
      { error: 'This seller cannot receive messages yet.' },
      { status: 409 },
    )
  }
  if (listing.seller_user_id === user.id) {
    return NextResponse.json(
      { error: 'You cannot message your own listing.' },
      { status: 409 },
    )
  }

  const participants = {
    listing_id: listing.id,
    buyer_user_id: user.id,
    seller_user_id: listing.seller_user_id,
  }
  const { data: existing, error: existingError } = await admin
    .from('marketplace_conversations')
    .select('id')
    .match(participants)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 })
  }
  if (existing?.id) {
    return NextResponse.json({ id: existing.id })
  }

  const { data, error } = await admin
    .from('marketplace_conversations')
    .insert(participants)
    .select('id')
    .single()

  if (!error) return NextResponse.json({ id: data.id })

  const { data: racedConversation } = await admin
    .from('marketplace_conversations')
    .select('id')
    .match(participants)
    .maybeSingle()

  return racedConversation?.id
    ? NextResponse.json({ id: racedConversation.id })
    : NextResponse.json({ error: error.message }, { status: 400 })
}
