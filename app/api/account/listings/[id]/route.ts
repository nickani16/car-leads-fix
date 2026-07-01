import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAllowedAdminEmail } from '@/lib/admin-allowlist'
import {
  equipmentLabel,
  equipmentOptionByKey,
  normalizeEquipmentKeys,
} from '@/lib/listing-equipment'

const actions = new Set(['mark_sold', 'update_listing'])

function clean(value: unknown) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizePrice(value: unknown) {
  const price = Number(value)
  return Number.isFinite(price) && price > 0 ? Math.round(price) : null
}

function equipmentTextFromKeys(keys: string[]) {
  return keys
    .map((key) => equipmentOptionByKey.get(key))
    .filter((option): option is NonNullable<typeof option> => Boolean(option))
    .map((option) => equipmentLabel(option, 'sv'))
    .join(', ')
}

export async function PATCH(
  request: Request,
  context: RouteContext<'/api/account/listings/[id]'>,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const { id } = await context.params
  const body = (await request.json()) as {
    action?: string
    buyerUserId?: string
    price?: number | string
    city?: string
    description?: string
    equipmentKeys?: string[]
    phoneVisibility?: string
  }
  const action = String(body.action || '')
  if (!actions.has(action)) {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('id,seller_user_id,status,review_status,title,price,currency,description,city,seller_type,phone_visibility')
    .eq('id', id)
    .maybeSingle()

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  const isOwner = listing.seller_user_id === user.id
  const isAdmin = await isActiveAdmin(admin, user.id, user.email)
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  if (action === 'update_listing') {
    if (['sold', 'rejected', 'expired'].includes(listing.status)) {
      return NextResponse.json(
        { error: 'This listing cannot be edited.' },
        { status: 409 },
      )
    }

    const nextPrice = normalizePrice(body.price)
    const city = clean(body.city)
    const description = String(body.description || '').trim().slice(0, 5000)
    const equipmentKeys = normalizeEquipmentKeys(body.equipmentKeys || [])
    const phoneVisibility =
      listing.seller_type === 'business'
        ? 'public'
        : body.phoneVisibility === 'public'
          ? 'public'
          : 'registered_only'
    if (!nextPrice || !city) {
      return NextResponse.json(
        { error: 'Pris och ort krävs.' },
        { status: 400 },
      )
    }

    const now = new Date().toISOString()
    const oldPrice = Number(listing.price)
    const priceChanged = oldPrice !== nextPrice
    const patch: Record<string, unknown> = {
      price: nextPrice,
      city,
      description: description || listing.description,
      equipment: equipmentTextFromKeys(equipmentKeys) || null,
      phone_visibility: phoneVisibility,
      updated_at: now,
    }
    if (priceChanged) {
      patch.updated_at = now
    }

    const { error } = await admin
      .from('marketplace_listings')
      .update(patch)
      .eq('id', listing.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await Promise.all([
      admin.from('marketplace_listing_events').insert({
        listing_id: listing.id,
        actor_user_id: user.id,
        actor_role: isOwner ? 'seller' : 'admin',
        event_type: priceChanged ? 'listing_price_and_details_updated' : 'listing_details_updated',
        from_status: listing.status,
        to_status: listing.status,
        from_review_status: listing.review_status,
        to_review_status: listing.review_status,
        metadata: {
          old_price: oldPrice,
          new_price: nextPrice,
          currency: listing.currency,
          equipment_keys: equipmentKeys,
          phone_visibility: phoneVisibility,
        },
      }),
      priceChanged
        ? admin.from('marketplace_listing_price_history').insert({
            listing_id: listing.id,
            seller_user_id: listing.seller_user_id,
            old_price: oldPrice,
            new_price: nextPrice,
            currency: listing.currency,
          })
        : Promise.resolve({ error: null }),
    ])

    revalidateTag('marketplace-listings', 'max')
    return NextResponse.json({ success: true })
  }

  if (['rejected', 'expired'].includes(listing.status)) {
    return NextResponse.json(
      { error: 'This listing cannot be marked as sold.' },
      { status: 409 },
    )
  }

  const soldToUserId = body.buyerUserId || null
  if (soldToUserId) {
    const { data: conversation } = await admin
      .from('marketplace_conversations')
      .select('id')
      .eq('listing_id', listing.id)
      .eq('seller_user_id', user.id)
      .eq('buyer_user_id', soldToUserId)
      .maybeSingle()
    if (!conversation) {
      return NextResponse.json(
        { error: 'The selected buyer is not linked to this listing.' },
        { status: 400 },
      )
    }
  }

  const now = new Date().toISOString()
  const { error } = await admin
    .from('marketplace_listings')
    .update({
      status: 'sold',
      sold_at: now,
      sold_to_user_id: soldToUserId,
      updated_at: now,
    })
    .eq('id', listing.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await admin.from('marketplace_listing_events').insert({
    listing_id: listing.id,
    actor_user_id: user.id,
    actor_role: isOwner ? 'seller' : 'admin',
    event_type: 'marked_sold',
    from_status: listing.status,
    to_status: 'sold',
    from_review_status: listing.review_status,
    to_review_status: listing.review_status,
    metadata: { sold_to_user_id: soldToUserId },
  })

  revalidateTag('marketplace-listings', 'max')

  return NextResponse.json({ success: true })
}

async function isActiveAdmin(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  email?: string | null,
) {
  if (!isAllowedAdminEmail(email)) return false

  const { data } = await admin
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  return Boolean(data)
}
