import { NextResponse } from 'next/server'
import { canonicalVehicleValue } from '@/lib/vehicle-translation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function text(value: unknown) {
  return String(value || '').trim()
}

function optionalText(value: unknown) {
  return text(value) || null
}

export async function PATCH(
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
    const { data: dealer } = await admin
      .from('dealers')
      .select('id,status,email,company_name')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!dealer || dealer.status !== 'approved') {
      return NextResponse.json(
        { error: 'An approved dealer account is required.' },
        { status: 403 }
      )
    }

    const payload = (await request.json()) as Record<string, unknown>
    const modelYear = Number(payload.modelYear)
    const mileageKm = Number(payload.mileageKm)
    const sellerTargetPrice = Number(payload.sellerTargetPrice)
    const originCountry = text(payload.originCountry).toUpperCase()
    const required = {
      reg: text(payload.reg).toUpperCase(),
      make: text(payload.make),
      model: text(payload.model),
      body_type: canonicalVehicleValue(text(payload.bodyType)),
      fuel_type: canonicalVehicleValue(text(payload.fuelType)),
      gearbox: canonicalVehicleValue(text(payload.gearbox)),
      drivetrain: canonicalVehicleValue(text(payload.drivetrain)),
      pickup_city: text(payload.pickupCity),
      pickup_postal_code: text(payload.pickupPostalCode),
    }

    if (
      Object.values(required).some((value) => !value) ||
      !Number.isInteger(modelYear) ||
      modelYear < 2018 ||
      modelYear > new Date().getFullYear() + 1 ||
      !Number.isFinite(mileageKm) ||
      mileageKm < 0 ||
      mileageKm > 10_000 ||
      !Number.isFinite(sellerTargetPrice) ||
      sellerTargetPrice <= 0 ||
      originCountry !== 'SE'
    ) {
      return NextResponse.json(
        {
          error:
            'Vehicles must be located in Sweden, be model year 2018 or newer and have no more than 10,000 km.',
        },
        { status: 400 }
      )
    }

    const { data: listing } = await admin
      .from('leads')
      .select('id,status,seller_dealer_id,submission_type')
      .eq('id', id)
      .maybeSingle()
    if (
      !listing ||
      listing.seller_dealer_id !== dealer.id ||
      listing.submission_type !== 'dealer_marketplace'
    ) {
      return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 })
    }

    const [{ count: bidCount }, { count: dealCount }] = await Promise.all([
      admin
        .from('bids')
        .select('id', { count: 'exact', head: true })
        .eq('lead_id', id),
      admin
        .from('deals')
        .select('id', { count: 'exact', head: true })
        .eq('lead_id', id),
    ])
    if ((bidCount || 0) > 0 || (dealCount || 0) > 0) {
      return NextResponse.json(
        {
          error:
            'This vehicle can no longer be edited because bidding or a transaction has started. Contact Autorell support.',
        },
        { status: 409 }
      )
    }

    const financeStatus = text(payload.financeStatus) || 'owned_outright'
    const { error: updateError } = await admin
      .from('leads')
      .update({
        ...required,
        status: 'Pending review',
        seller_target_price: sellerTargetPrice,
        autorell_purchase_price: null,
        reserve_price: null,
        buy_now_price: null,
        sale_format: 'auction',
        model_year: modelYear,
        miles: String(Math.round(mileageKm / 10)),
        variant: optionalText(payload.variant),
        vin: optionalText(payload.vin)?.toUpperCase() || null,
        first_registration: optionalText(payload.firstRegistration),
        power_hp: text(payload.powerHp) ? Number(payload.powerHp) : null,
        engine_size: optionalText(payload.engineSize),
        color: optionalText(payload.color),
        owners: optionalText(payload.owners),
        service: canonicalVehicleValue(text(payload.service)),
        inspection_valid_until: optionalText(payload.inspectionValidUntil),
        keys_count: optionalText(payload.keysCount),
        damage: canonicalVehicleValue(text(payload.damage)),
        damage_description: optionalText(payload.damageDescription),
        damage_description_en: null,
        equipment: optionalText(payload.equipment),
        equipment_en: null,
        warnings: canonicalVehicleValue(text(payload.warnings)),
        tires: canonicalVehicleValue(text(payload.tires)),
        tireset: canonicalVehicleValue(text(payload.tireset)),
        towbar: canonicalVehicleValue(text(payload.towbar)),
        is_driveable: Boolean(payload.isDriveable),
        has_engine_transmission_issues: Boolean(
          payload.hasEngineTransmissionIssues
        ),
        has_fluid_leaks: Boolean(payload.hasFluidLeaks),
        has_serious_collision_damage: Boolean(
          payload.hasSeriousCollisionDamage
        ),
        finance_status: financeStatus,
        finance_review_status:
          financeStatus === 'owned_outright' ? 'not_required' : 'needs_review',
        source: 'SE',
        origin_country: 'SE',
        auction_starts_at: null,
        auction_ends_at: null,
        auction_closed_at: null,
        auction_outcome: null,
        dealer_reach_snapshot: 0,
      })
      .eq('id', id)
      .eq('seller_dealer_id', dealer.id)

    if (updateError) {
      console.error('Dealer listing update failed', updateError)
      return NextResponse.json(
        { error: 'The changes could not be saved.' },
        { status: 400 }
      )
    }

    const { data: admins } = await admin
      .from('admin_users')
      .select('user_id')
      .eq('is_active', true)
    if (admins?.length) {
      await admin.from('notifications').insert(
        admins.map((administrator) => ({
          recipient_user_id: administrator.user_id,
          audience: 'admin',
          event_type: 'dealer_vehicle_edited',
          title: 'Dealer vehicle edited — new review required',
          body: `${dealer.company_name || dealer.email} edited ${required.make} ${required.model} (${required.reg}).`,
          lead_id: id,
          channels: ['in_app'],
          dedupe_key: `dealer_vehicle_edited:${administrator.user_id}:${id}:${Date.now()}`,
        }))
      )
    }

    return NextResponse.json({
      success: true,
      status: 'Pending review',
    })
  } catch (error) {
    console.error('Dealer listing update route failed', error)
    return NextResponse.json(
      { error: 'The changes could not be saved.' },
      { status: 500 }
    )
  }
}
