import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getCategoryPricing, listingPackageDetails } from '@/lib/marketplace-pricing'

const MAX_IMAGES = 20
const MAX_IMAGE_SIZE = 12 * 1024 * 1024

function text(form: FormData, key: string) {
  return String(form.get(key) || '').trim()
}

async function uploadImage(supabase: SupabaseClient, file: File, userId: string, index: number) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
  const path = `marketplace-listings/${userId}/${crypto.randomUUID()}-${index}-${safeName}`
  const { error } = await supabase.storage.from('leads').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error
  const { data, error: urlError } = await supabase.storage.from('leads').createSignedUrl(path, 60 * 60 * 24 * 30)
  if (urlError || !data?.signedUrl) throw urlError || new Error('Image URL failed')
  return data.signedUrl
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sign in to create a listing.' }, { status: 401 })
    const admin = createAdminClient()
    const { data: profile } = await admin.from('marketplace_profiles').select('*').eq('user_id', user.id).maybeSingle()
    if (!profile) return NextResponse.json({ error: 'Complete your account profile first.' }, { status: 403 })
    if (
      profile.risk_status === 'blocked' ||
      profile.risk_status === 'restricted'
    ) {
      return NextResponse.json(
        { error: 'Kontot är begränsat. Kontakta support innan du publicerar.' },
        { status: 403 },
      )
    }
    if (
      !profile.first_name ||
      !profile.last_name ||
      !profile.birth_date ||
      !profile.address_line_1 ||
      !profile.postal_code ||
      !profile.city ||
      (profile.account_type === 'private' && profile.identity_status === 'pending')
    ) {
      return NextResponse.json(
        { error: 'Komplettera och kontrollera din konto- och adressprofil först.' },
        { status: 403 },
      )
    }

    const form = await request.formData()
    const category = getCategoryPricing(text(form, 'category')).slug
    const packageId = text(form, 'packageId')
    if (!(packageId in listingPackageDetails)) {
      return NextResponse.json({ error: 'Choose a valid listing package.' }, { status: 400 })
    }
    if (form.get('listingTerms') !== 'on') {
      return NextResponse.json({ error: 'Accept the listing and payment terms.' }, { status: 400 })
    }
    const make = text(form, 'make')
    const model = text(form, 'model')
    const description = text(form, 'description')
    const city = text(form, 'city')
    const price = Number(text(form, 'price'))
    const modelYear = Number(text(form, 'modelYear'))
    const mileage = Number(text(form, 'mileage'))
    if (!make || !model || description.length < 20 || !city || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Complete vehicle, price, location and description.' }, { status: 400 })
    }

    const files = form.getAll('images').filter((item): item is File => item instanceof File && item.size > 0)
    if (!files.length || files.length > MAX_IMAGES || files.some((file) => !file.type.startsWith('image/') || file.size > MAX_IMAGE_SIZE)) {
      return NextResponse.json({ error: 'Upload 1–20 images, maximum 12 MB each.' }, { status: 400 })
    }
    const images = await Promise.all(files.map((file, index) => uploadImage(admin, file, user.id, index)))
    const duration = listingPackageDetails[packageId as keyof typeof listingPackageDetails].durationDays
    const startsAt = packageId === 'free_7d' ? new Date() : null
    const endsAt = startsAt ? new Date(startsAt.getTime() + duration * 86400000) : null

    const { data: lead, error } = await admin.from('leads').insert({
      reg: text(form, 'registration') || `EU-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      seller_user_id: user.id,
      seller_public_name: profile.account_type === 'business' ? profile.company_name : profile.display_name,
      seller_is_trader: profile.account_type === 'business',
      seller_dealer_id: null,
      vehicle_category: category,
      supplier_vehicle_category: category,
      submission_type: 'dealer_marketplace',
      supplier_type: profile.account_type === 'business' ? 'public_business' : 'private',
      supplier_company_name: profile.company_name,
      supplier_registration_number: profile.registration_number,
      supplier_contact_name: profile.display_name,
      email: profile.email,
      phone: profile.phone,
      origin_country: profile.country_code,
      source: profile.country_code,
      pickup_city: city,
      pickup_postal_code: text(form, 'postalCode') || null,
      make,
      model,
      variant: text(form, 'variant') || null,
      model_year: Number.isInteger(modelYear) ? modelYear : null,
      miles: Number.isFinite(mileage) ? String(Math.max(0, Math.round(mileage / 10))) : null,
      body_type: text(form, 'bodyType') || category,
      fuel_type: text(form, 'fuelType') || null,
      gearbox: text(form, 'gearbox') || null,
      color: text(form, 'color') || null,
      damage: text(form, 'condition') || 'declared',
      damage_description: text(form, 'knownFaults') || description,
      equipment: text(form, 'equipment') || null,
      service: text(form, 'serviceHistory') || null,
      images,
      sale_format: 'marketplace',
      buy_now_price: price,
      seller_target_price: price,
      status: packageId === 'free_7d' ? 'Pending review' : 'Pending payment',
      listing_plan: packageId,
      listing_priority: listingPackageDetails[packageId as keyof typeof listingPackageDetails].priority,
      auction_starts_at: startsAt?.toISOString() || null,
      auction_ends_at: endsAt?.toISOString() || null,
      auction_closed_at: null,
    }).select('id').single()

    if (error || !lead) throw error
    return NextResponse.json({ success: true, leadId: lead.id, requiresPayment: packageId !== 'free_7d', packageId })
  } catch (error) {
    console.error('Marketplace listing creation failed', error)
    return NextResponse.json({ error: 'The listing could not be created.' }, { status: 500 })
  }
}
