import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAllowedAdminEmail } from '@/lib/admin-allowlist'
import { geocodeListingLocation, parseCoordinate } from '@/lib/geocoding'
import { normalizeMarketplaceCategory } from '@/lib/marketplace'
import { categoryTechnicalFields } from '@/lib/listing-form-options'
import {
  equipmentLabel,
  equipmentOptionByKey,
  normalizeEquipmentKeys,
} from '@/lib/listing-equipment'
import {
  normalizeIdentifier,
  validateRequiredIdentifiers,
  type ListingIdentifierInput,
} from '@/lib/marketplace-security'
import { requireBusinessListingEntitlement } from '@/lib/billing/business-entitlement'
import { resolveBusinessAccountScope } from '@/lib/billing/business-account-scope'

const actions = new Set([
  'mark_sold', 'update_listing', 'pause', 'resume', 'unpublish', 'delete', 'relist', 'duplicate',
])
const decimalTechnicalFieldNames = new Set(['engineLiters', 'cargoVolumeM3'])

function clean(value: unknown) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizePrice(value: unknown) {
  const price = Number(value)
  return Number.isFinite(price) && price > 0 ? Math.round(price) : null
}

function numberOrNull(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null
}

function cleanTechnicalInput(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function collectStructuredTechnicalData(
  input: Record<string, unknown>,
  category: ReturnType<typeof normalizeMarketplaceCategory>,
) {
  const technicalData: Record<string, string | number> = {}
  const fields = categoryTechnicalFields[category] || []

  for (const field of fields) {
    const rawValue = clean(input[field.name])
    if (!rawValue) {
      if (field.required) {
        return {
          error: `Välj ${field.label.toLowerCase()} innan du fortsätter.`,
          technicalData,
        }
      }
      continue
    }

    if (field.kind === 'number') {
      const value = Number(rawValue)
      if (
        !Number.isFinite(value) ||
        (field.min !== undefined && value < field.min) ||
        (field.max !== undefined && value > field.max)
      ) {
        return { error: `${field.label} har ett ogiltigt värde.`, technicalData }
      }
      technicalData[field.name] =
        decimalTechnicalFieldNames.has(field.name) ? Math.round(value * 10) / 10 : Math.round(value)
      continue
    }

    const allowedValues = new Set((field.options || []).map((option) => option.value))
    if (allowedValues.size && !allowedValues.has(rawValue)) {
      return { error: `${field.label} har ett ogiltigt val.`, technicalData }
    }
    technicalData[field.name] = rawValue
  }

  return { error: '', technicalData }
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
    address?: string
    postalCode?: string
    country?: string
    latitude?: number | string | null
    longitude?: number | string | null
    description?: string
    equipmentKeys?: string[]
    phoneVisibility?: string
    mileage?: number | string
    operatingHours?: number | string
    technicalData?: Record<string, unknown>
    identifiers?: Partial<Record<keyof ListingIdentifierInput, string | number | null>>
  }
  const action = String(body.action || '')
  if (!actions.has(action)) {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('id,seller_user_id,status,review_status,title,price,currency,description,city,country_code,country,address,postal_code,latitude,longitude,seller_type,phone_visibility,category')
    .eq('id', id)
    .maybeSingle()

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  const scope = listing.seller_type === 'business'
    ? await resolveBusinessAccountScope(user.id, admin)
    : null
  const isOwner = listing.seller_user_id === user.id || Boolean(scope?.listingOwnerUserIds.includes(String(listing.seller_user_id)))
  const isAdmin = await isActiveAdmin(admin, user.id, user.email)
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  if (isOwner && listing.seller_type === 'business' && ['duplicate', 'pause', 'resume', 'relist', 'update_listing'].includes(action)) {
    const entitlement = await requireBusinessListingEntitlement(user.id)
    if (!entitlement.allowed) {
      return NextResponse.json(
        {
          error: entitlement.code,
          code: entitlement.code,
          redirectTo: '/account/business/subscription',
          activeListingCount: entitlement.activeListingCount,
          activeListingLimit: entitlement.activeListingLimit,
        },
        { status: 403 },
      )
    }
  }

  if (action === 'duplicate') {
    const { data: source, error: sourceError } = await admin
      .from('marketplace_listings')
      .select('category,title,description,make,model,variant,registration_reference,model_year,mileage_km,operating_hours,fuel_type,gearbox,body_type,color,condition,known_faults,service_history,equipment,country_code,country,city,municipality,address,latitude,longitude,postal_code,price,currency,images,seller_name,seller_type,phone_visibility,vin,chassis_number,serial_number,frame_number,battery_serial_number,total_weight_kg,axle_configuration,machine_type,review_status,risk_score,risk_flags')
      .eq('id', listing.id)
      .single()
    if (sourceError || !source) return NextResponse.json({ error: 'Annonsen kunde inte dupliceras.' }, { status: 400 })
    const { data: duplicate, error } = await admin
      .from('marketplace_listings')
      .insert({
        ...source,
        seller_user_id: listing.seller_user_id,
        title: `${source.title} (kopia)`,
        status: 'draft',
        package_id: 'free_7d',
        priority: 0,
        published_at: null,
        expires_at: null,
      })
      .select('id')
      .single()
    if (error || !duplicate) return NextResponse.json({ error: error?.message || 'Annonsen kunde inte dupliceras.' }, { status: 400 })
    return NextResponse.json({ success: true, listingId: duplicate.id, status: 'draft' })
  }

  if (['pause', 'resume', 'unpublish', 'delete', 'relist'].includes(action)) {
    const transitions: Record<string, { allowed: string[]; status: string; patch?: Record<string, unknown> }> = {
      pause: { allowed: ['published'], status: 'paused' },
      resume: { allowed: ['paused'], status: 'published' },
      unpublish: { allowed: ['pending_review', 'published'], status: 'draft', patch: { published_at: null, expires_at: null } },
      delete: { allowed: ['draft', 'pending_payment', 'pending_review', 'paused', 'expired', 'sold', 'rejected'], status: 'deleted' },
      relist: { allowed: ['sold', 'expired', 'deleted', 'removed'], status: 'draft', patch: { sold_at: null, sold_to_user_id: null, published_at: null, expires_at: null } },
    }
    const transition = transitions[action]
    if (!transition.allowed.includes(listing.status)) {
      return NextResponse.json({ error: 'Åtgärden är inte tillgänglig för annonsens nuvarande status.' }, { status: 409 })
    }
    const now = new Date().toISOString()
    const { error } = await admin
      .from('marketplace_listings')
      .update({ status: transition.status, ...transition.patch, updated_at: now })
      .eq('id', listing.id)
      .eq('status', listing.status)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    await admin.from('marketplace_listing_events').insert({
      listing_id: listing.id,
      actor_user_id: user.id,
      actor_role: isOwner ? 'seller' : 'admin',
      event_type: `listing_${action}`,
      from_status: listing.status,
      to_status: transition.status,
      from_review_status: listing.review_status,
      to_review_status: listing.review_status,
    })
    revalidateTag('marketplace-listings', 'max')
    return NextResponse.json({ success: true, status: transition.status })
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
    const address = clean(body.address)
    const postalCode = clean(body.postalCode) || listing.postal_code
    const country = clean(body.country) || listing.country || listing.country_code
    const description = String(body.description || '').trim().slice(0, 5000)
    const equipmentKeys = normalizeEquipmentKeys(body.equipmentKeys || [])
    const category = normalizeMarketplaceCategory(listing.category)
    const technicalInput = cleanTechnicalInput(body.technicalData)
    const identifiers: ListingIdentifierInput = {
      registrationNumber: normalizeIdentifier(String(body.identifiers?.registrationNumber || '')),
      vin: normalizeIdentifier(String(body.identifiers?.vin || '')),
      chassisNumber: normalizeIdentifier(String(body.identifiers?.chassisNumber || '')),
      serialNumber: normalizeIdentifier(String(body.identifiers?.serialNumber || '')),
      frameNumber: normalizeIdentifier(String(body.identifiers?.frameNumber || '')),
      batterySerialNumber: normalizeIdentifier(String(body.identifiers?.batterySerialNumber || '')),
      totalWeightKg: numberOrNull(body.identifiers?.totalWeightKg),
      axleConfiguration: clean(body.identifiers?.axleConfiguration),
      machineType: clean(body.identifiers?.machineType),
      agricultureObjectType: clean(body.identifiers?.agricultureObjectType) || 'tractor',
    }
    const identifierValidation = validateRequiredIdentifiers(category, identifiers)
    if (!identifierValidation.valid) {
      return NextResponse.json(
        { error: identifierValidation.message },
        { status: 400 },
      )
    }
    const { error: technicalError, technicalData } =
      collectStructuredTechnicalData(technicalInput, category)
    if (technicalError) {
      return NextResponse.json({ error: technicalError }, { status: 400 })
    }
    if (
      ['agriculture', 'construction'].includes(category) &&
      !Number(body.operatingHours)
    ) {
      return NextResponse.json(
        { error: 'Drifttimmar krävs för maskiner.' },
        { status: 400 },
      )
    }
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
    const geocoded = await geocodeListingLocation({
      address,
      postalCode,
      city,
      country,
      countryCode: listing.country_code,
    })
    const latitude = geocoded?.latitude ?? parseCoordinate(body.latitude) ?? listing.latitude
    const longitude = geocoded?.longitude ?? parseCoordinate(body.longitude) ?? listing.longitude
    const patch: Record<string, unknown> = {
      price: nextPrice,
      city,
      country,
      address: address || null,
      latitude,
      longitude,
      description: description || listing.description,
      equipment: equipmentTextFromKeys(equipmentKeys) || null,
      phone_visibility: phoneVisibility,
      updated_at: now,
      mileage_km: Number.isFinite(Number(body.mileage))
        ? Math.max(0, Math.round(Number(body.mileage)))
        : null,
      operating_hours: Number(body.operatingHours) || null,
      body_type: technicalInput.bodyType ? clean(technicalInput.bodyType) : category,
      fuel_type: technicalInput.fuelType ? clean(technicalInput.fuelType) : null,
      gearbox: technicalInput.gearbox ? clean(technicalInput.gearbox) : null,
      condition: technicalInput.condition ? clean(technicalInput.condition) : null,
      known_faults: technicalInput.damageStatus ? clean(technicalInput.damageStatus) : null,
      service_history: technicalInput.serviceHistory ? clean(technicalInput.serviceHistory) : null,
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

    const { data: identifierRow } = await admin
      .from('marketplace_listing_identifiers')
      .select('id,metadata')
      .eq('listing_id', listing.id)
      .maybeSingle()
    const metadata =
      identifierRow?.metadata && typeof identifierRow.metadata === 'object' && !Array.isArray(identifierRow.metadata)
        ? (identifierRow.metadata as Record<string, unknown>)
        : {}
    const identifierPatch = {
      seller_user_id: listing.seller_user_id,
      category,
      registration_number: identifiers.registrationNumber || null,
      vin: identifiers.vin || null,
      chassis_number: identifiers.chassisNumber || identifiers.vin || null,
      serial_number: identifiers.serialNumber || null,
      frame_number: identifiers.frameNumber || null,
      battery_serial_number: identifiers.batterySerialNumber || null,
      total_weight_kg: identifiers.totalWeightKg,
      axle_configuration: identifiers.axleConfiguration || null,
      machine_type: identifiers.machineType || null,
      metadata: {
        ...metadata,
        agriculture_object_type: identifiers.agricultureObjectType,
        technical_data: technicalData,
      },
    }
    const identifierResult = identifierRow
      ? await admin
          .from('marketplace_listing_identifiers')
          .update(identifierPatch)
          .eq('id', identifierRow.id)
      : await admin
          .from('marketplace_listing_identifiers')
          .insert({
            ...identifierPatch,
            listing_id: listing.id,
          })
    if (identifierResult.error) {
      return NextResponse.json(
        { error: identifierResult.error.message },
        { status: 400 },
      )
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
      .eq('seller_user_id', listing.seller_user_id)
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
