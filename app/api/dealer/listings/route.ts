import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { canonicalVehicleValue } from '@/lib/vehicle-translation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const MAX_IMAGES = 20
const MAX_IMAGE_SIZE = 12 * 1024 * 1024

function text(form: FormData, key: string) {
  return String(form.get(key) || '').trim()
}

function boolean(form: FormData, key: string) {
  return form.getAll(key).some((value) => String(value) === 'true')
}

async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  dealerId: string,
  index: number
) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
  const path = `dealer-listings/${dealerId}/${crypto.randomUUID()}-${index}-${safeName}`
  const { error } = await supabase.storage.from('leads').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })

  if (error) throw error

  const { data, error: urlError } = await supabase.storage
    .from('leads')
    .createSignedUrl(path, 60 * 60 * 24 * 30)

  if (urlError || !data?.signedUrl) {
    throw urlError || new Error('Could not create image URL')
  }

  return data.signedUrl
}

export async function POST(request: Request) {
  try {
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
      .select(
        'id,user_id,status,email,phone,country_code,country,company_name'
      )
      .eq('user_id', user.id)
      .maybeSingle()

    if (!dealer || dealer.status !== 'approved') {
      return NextResponse.json(
        { error: 'An approved dealer account is required.' },
        { status: 403 }
      )
    }

    const form = await request.formData()
    const sellerTargetPrice = Number(text(form, 'sellerTargetPrice'))
    const modelYear = Number(text(form, 'modelYear'))
    const mileageKm = Number(text(form, 'mileageKm'))
    const originCountry = (
      text(form, 'originCountry') ||
      dealer.country_code ||
      'SE'
    ).toUpperCase()

    const required = {
      reg: text(form, 'reg').toUpperCase(),
      make: text(form, 'make'),
      model: text(form, 'model'),
      body_type: canonicalVehicleValue(text(form, 'bodyType')),
      fuel_type: canonicalVehicleValue(text(form, 'fuelType')),
      gearbox: canonicalVehicleValue(text(form, 'gearbox')),
      drivetrain: canonicalVehicleValue(text(form, 'drivetrain')),
      pickup_city: text(form, 'pickupCity'),
      pickup_postal_code: text(form, 'pickupPostalCode'),
    }

    if (
      Object.values(required).some((value) => !value) ||
      !Number.isInteger(modelYear) ||
      modelYear < 1990 ||
      modelYear > new Date().getFullYear() + 1 ||
      !Number.isFinite(mileageKm) ||
      mileageKm < 0 ||
      mileageKm > 2_000_000 ||
      !Number.isFinite(sellerTargetPrice) ||
      sellerTargetPrice <= 0 ||
      originCountry !== 'SE'
    ) {
      return NextResponse.json(
        {
          error:
            'Complete the required information. Autorell currently purchases stock located in Sweden.',
        },
        { status: 400 }
      )
    }

    const files = form
      .getAll('images')
      .filter((item): item is File => item instanceof File && item.size > 0)

    if (
      files.length > MAX_IMAGES ||
      files.some(
        (file) =>
          !file.type.startsWith('image/') || file.size > MAX_IMAGE_SIZE
      )
    ) {
      return NextResponse.json(
        { error: 'Upload up to 20 images, maximum 12 MB per image.' },
        { status: 400 }
      )
    }

    const images = await Promise.all(
      files.map((file, index) => uploadImage(admin, file, dealer.id, index))
    )

    const { data: inserted, error } = await admin
      .from('leads')
      .insert({
        ...required,
        seller_dealer_id: dealer.id,
        submission_type: 'dealer_marketplace',
        phone: dealer.phone,
        email: dealer.email,
        source: originCountry,
        origin_country: originCountry,
        status: 'Pending review',
        sale_format: 'auction',
        seller_target_price: sellerTargetPrice,
        reserve_price: null,
        buy_now_price: null,
        model_year: modelYear,
        miles: String(Math.round(mileageKm / 10)),
        variant: text(form, 'variant') || null,
        vin: text(form, 'vin').toUpperCase() || null,
        first_registration: text(form, 'firstRegistration') || null,
        power_hp: text(form, 'powerHp')
          ? Number(text(form, 'powerHp'))
          : null,
        engine_size: text(form, 'engineSize') || null,
        color: text(form, 'color') || null,
        owners: text(form, 'owners') || null,
        service: canonicalVehicleValue(text(form, 'service')) || null,
        inspection_valid_until:
          text(form, 'inspectionValidUntil') || null,
        keys_count: text(form, 'keysCount') || null,
        damage: canonicalVehicleValue(text(form, 'damage')) || null,
        damage_description: text(form, 'damageDescription') || null,
        equipment: text(form, 'equipment') || null,
        warnings: canonicalVehicleValue(text(form, 'warnings')) || null,
        tires: canonicalVehicleValue(text(form, 'tires')) || null,
        tireset: canonicalVehicleValue(text(form, 'tireset')) || null,
        towbar: canonicalVehicleValue(text(form, 'towbar')) || null,
        is_driveable: boolean(form, 'isDriveable'),
        has_engine_transmission_issues: boolean(
          form,
          'hasEngineTransmissionIssues'
        ),
        has_fluid_leaks: boolean(form, 'hasFluidLeaks'),
        has_serious_collision_damage: boolean(
          form,
          'hasSeriousCollisionDamage'
        ),
        finance_status: text(form, 'financeStatus') || 'owned_outright',
        finance_review_status:
          text(form, 'financeStatus') === 'owned_outright'
            ? 'not_required'
            : 'needs_review',
        images,
        auction_starts_at: null,
        auction_ends_at: null,
        auction_closed_at: null,
        auction_outcome: null,
        listing_plan: 'free_24h',
      })
      .select('id')
      .single()

    if (error || !inserted) {
      console.error('Dealer listing insert failed', error)
      return NextResponse.json(
        { error: 'The vehicle could not be submitted.' },
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
          event_type: 'dealer_vehicle_submitted',
          title: 'Dealer vehicle awaiting review',
          body: `${dealer.company_name || dealer.email} submitted ${required.make} ${required.model} (${required.reg}).`,
          lead_id: inserted.id,
          channels: ['in_app'],
          dedupe_key: `dealer_vehicle_submitted:${administrator.user_id}:${inserted.id}`,
        }))
      )
    }

    return NextResponse.json({ success: true, leadId: inserted.id })
  } catch (error) {
    console.error('Dealer listing route failed', error)
    return NextResponse.json(
      { error: 'The vehicle could not be submitted.' },
      { status: 500 }
    )
  }
}
