import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getCategoryPricing, listingPackageDetails } from '@/lib/marketplace-pricing'
import { currencyForCountry, normalizeMarketplaceCategory } from '@/lib/marketplace'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'

const MAX_IMAGES = 20
const MAX_IMAGE_SIZE = 12 * 1024 * 1024

function text(form: FormData, key: string) {
  return String(form.get(key) || '').trim()
}

async function uploadImage(supabase: SupabaseClient, file: File, userId: string, index: number) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
  const path = `${userId}/${crypto.randomUUID()}-${index}-${safeName}`
  const { error } = await supabase.storage.from('marketplace-listings').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('marketplace-listings').getPublicUrl(path)
  if (!data.publicUrl) throw new Error('Image URL failed')
  return data.publicUrl
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sign in to create a listing.' }, { status: 401 })
    const createLimit = checkRateLimit({
      key: `create-listing:${user.id}:${getClientIp(request)}`,
      limit: 8,
      windowMs: 60 * 60 * 1000,
    })
    if (createLimit.limited) return rateLimitJson(createLimit.retryAfter)
    const admin = createAdminClient()
    const { data: profile } = await admin.from('marketplace_profiles').select('user_id,account_type,first_name,last_name,birth_date,address_line_1,postal_code,city,country_code,phone,company_name,display_name,identity_status,risk_status').eq('user_id', user.id).maybeSingle()
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
    const category = normalizeMarketplaceCategory(
      getCategoryPricing(text(form, 'category')).slug,
    )
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
    const currency =
      text(form, 'currency').toUpperCase() ||
      currencyForCountry(profile.country_code)
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

    const { data: listing, error } = await admin.from('marketplace_listings').insert({
      seller_user_id: user.id,
      category,
      title: `${make} ${model} ${text(form, 'variant')}`.trim(),
      description,
      make,
      model,
      variant: text(form, 'variant') || null,
      registration_reference: text(form, 'registration') || null,
      model_year: Number.isInteger(modelYear) ? modelYear : null,
      mileage_km: Number.isFinite(mileage) ? Math.max(0, Math.round(mileage)) : null,
      operating_hours: Number(text(form, 'operatingHours')) || null,
      body_type: text(form, 'bodyType') || category,
      fuel_type: text(form, 'fuelType') || null,
      gearbox: text(form, 'gearbox') || null,
      color: text(form, 'color') || null,
      condition: text(form, 'condition'),
      known_faults: text(form, 'knownFaults') || null,
      equipment: text(form, 'equipment') || null,
      service_history: text(form, 'serviceHistory') || null,
      country_code: profile.country_code,
      city,
      postal_code: text(form, 'postalCode') || null,
      price,
      currency,
      images,
      seller_name: profile.account_type === 'business' ? profile.company_name : profile.display_name,
      seller_type: profile.account_type,
      status: packageId === 'free_7d' ? 'pending_review' : 'pending_payment',
      package_id: packageId,
      priority: listingPackageDetails[packageId as keyof typeof listingPackageDetails].priority,
      published_at: startsAt?.toISOString() || null,
      expires_at: endsAt?.toISOString() || null,
    }).select('id').single()

    if (error || !listing) throw error
    return NextResponse.json({ success: true, listingId: listing.id, requiresPayment: packageId !== 'free_7d', packageId })
  } catch (error) {
    console.error('Marketplace listing creation failed', error)
    return NextResponse.json({ error: 'The listing could not be created.' }, { status: 500 })
  }
}
