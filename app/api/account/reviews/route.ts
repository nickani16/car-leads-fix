import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function rating(value: unknown) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const body = (await request.json()) as {
    listingId?: string
    revieweeId?: string
    rating?: number
    communicationRating?: number
    paymentRating?: number
    accuracyRating?: number
    recommends?: boolean
    comment?: string
  }

  const overallRating = rating(body.rating)
  if (!body.listingId || !body.revieweeId || !overallRating) {
    return NextResponse.json(
      { error: 'Choose a listing, person and rating.' },
      { status: 400 },
    )
  }

  const comment = String(body.comment || '').trim()
  if (comment.length > 1200) {
    return NextResponse.json(
      { error: 'Review text is too long.' },
      { status: 400 },
    )
  }

  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('id,seller_user_id,status,title')
    .eq('id', body.listingId)
    .maybeSingle()

  if (!listing || listing.status !== 'sold') {
    return NextResponse.json(
      { error: 'Reviews open after the listing is marked as sold.' },
      { status: 409 },
    )
  }

  const { data: conversation } = await admin
    .from('marketplace_conversations')
    .select('id,buyer_user_id,seller_user_id')
    .eq('listing_id', listing.id)
    .or(`buyer_user_id.eq.${user.id},seller_user_id.eq.${user.id}`)
    .or(`buyer_user_id.eq.${body.revieweeId},seller_user_id.eq.${body.revieweeId}`)
    .maybeSingle()

  if (
    !conversation ||
    conversation.seller_user_id !== listing.seller_user_id ||
    ![conversation.buyer_user_id, conversation.seller_user_id].includes(user.id) ||
    ![conversation.buyer_user_id, conversation.seller_user_id].includes(body.revieweeId) ||
    user.id === body.revieweeId
  ) {
    return NextResponse.json(
      { error: 'This review is not linked to a completed marketplace conversation.' },
      { status: 403 },
    )
  }

  const reviewerRole =
    user.id === conversation.buyer_user_id ? 'buyer' : 'seller'

  const { error } = await admin.from('marketplace_reviews').insert({
    buyer_id: conversation.buyer_user_id,
    seller_id: conversation.seller_user_id,
    listing_id: listing.id,
    reviewer_id: user.id,
    reviewee_id: body.revieweeId,
    reviewer_role: reviewerRole,
    rating: overallRating,
    communication_rating: rating(body.communicationRating),
    payment_rating: rating(body.paymentRating),
    accuracy_rating: rating(body.accuracyRating),
    recommends: body.recommends !== false,
    comment: comment || null,
    status: 'pending_review',
  })

  if (error) {
    const duplicate = error.code === '23505'
    return NextResponse.json(
      {
        error: duplicate
          ? 'You have already reviewed this marketplace deal.'
          : error.message,
      },
      { status: duplicate ? 409 : 400 },
    )
  }

  await admin.from('marketplace_listing_events').insert({
    listing_id: listing.id,
    actor_user_id: user.id,
    actor_role: reviewerRole === 'seller' ? 'seller' : 'system',
    event_type: 'review_submitted',
    metadata: { reviewee_id: body.revieweeId, reviewer_role: reviewerRole },
  })

  return NextResponse.json({ success: true })
}
