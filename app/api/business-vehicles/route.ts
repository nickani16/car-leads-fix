import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { canonicalVehicleValue } from '@/lib/vehicle-translation'

const MAX_IMAGES = 20
const MAX_IMAGE_SIZE = 12 * 1024 * 1024
const text = (form: FormData, key: string) => String(form.get(key) || '').trim()

async function uploadImage(supabase: SupabaseClient, file: File, index: number) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
  const path = `public-business/${crypto.randomUUID()}-${index}-${safeName}`
  const { error } = await supabase.storage.from('leads').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error
  const { data } = await supabase.storage.from('leads').createSignedUrl(path, 60 * 60 * 24 * 30)
  if (!data?.signedUrl) throw new Error('Could not create image URL')
  return data.signedUrl
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const companyName = text(form, 'companyName')
    const registrationNumber = text(form, 'registrationNumber')
    const contactName = text(form, 'contactName')
    const email = text(form, 'email')
    const phone = text(form, 'phone')
    const modelYear = Number(text(form, 'modelYear'))
    const mileageKm = Number(text(form, 'mileageKm'))
    const sellerTargetPrice = Number(text(form, 'sellerTargetPrice'))
    const required = {
      reg: text(form, 'reg').toUpperCase(),
      make: text(form, 'make'),
      model: text(form, 'model'),
      fuel_type: canonicalVehicleValue(text(form, 'fuelType')),
      gearbox: canonicalVehicleValue(text(form, 'gearbox')),
      pickup_city: text(form, 'pickupCity'),
      pickup_postal_code: text(form, 'pickupPostalCode'),
    }

    if (
      !companyName || !registrationNumber || !contactName ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^\+?[0-9\s()-]{7,20}$/.test(phone) ||
      Object.values(required).some((value) => !value) ||
      !Number.isInteger(modelYear) || modelYear < 1990 ||
      !Number.isFinite(mileageKm) || mileageKm < 0 ||
      !Number.isFinite(sellerTargetPrice) || sellerTargetPrice <= 0
    ) {
      return NextResponse.json({ error: 'Complete all required company and vehicle details.' }, { status: 400 })
    }

    const files = form.getAll('images').filter((item): item is File => item instanceof File && item.size > 0)
    if (files.length > MAX_IMAGES || files.some((file) => !file.type.startsWith('image/') || file.size > MAX_IMAGE_SIZE)) {
      return NextResponse.json({ error: 'Upload up to 20 images, maximum 12 MB each.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const images = await Promise.all(files.map((file, index) => uploadImage(admin, file, index)))
    const { data: inserted, error } = await admin.from('leads').insert({
      ...required,
      model_year: modelYear,
      miles: String(Math.round(mileageKm / 10)),
      seller_target_price: sellerTargetPrice,
      variant: text(form, 'variant') || null,
      vin: text(form, 'vin').toUpperCase() || null,
      damage_description: text(form, 'details') || null,
      phone,
      email,
      source: 'SE',
      origin_country: 'SE',
      status: 'Pending review',
      submission_type: 'dealer_marketplace',
      supplier_type: 'public_business',
      supplier_company_name: companyName,
      supplier_registration_number: registrationNumber,
      supplier_contact_name: contactName,
      supplier_vehicle_category: text(form, 'vehicleCategory'),
      sale_format: 'auction',
      images,
      auction_starts_at: null,
      auction_ends_at: null,
      auction_closed_at: null,
      listing_plan: 'free_24h',
    }).select('id').single()
    if (error || !inserted) throw error || new Error('Insert failed')

    return NextResponse.json({ success: true, leadId: inserted.id })
  } catch (error) {
    console.error('Public business vehicle submission failed', error)
    return NextResponse.json({ error: 'The vehicle could not be submitted.' }, { status: 500 })
  }
}
