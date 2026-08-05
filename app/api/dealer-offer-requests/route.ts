import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { processMarketplaceImage, type ProcessedMarketplaceImage } from '@/lib/marketplace/image-processing'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 300

const imageFields = [
  ['front', 'Framifrån'],
  ['rear', 'Bakifrån'],
  ['leftSide', 'Vänster sida'],
  ['rightSide', 'Höger sida'],
  ['interior', 'Interiör'],
  ['odometer', 'Mätarställning'],
  ['damage', 'Eventuella skador'],
] as const

export async function POST(request: Request) {
  return handlePost(request).catch((fatalError) => {
    console.error('dealer offer request failed', fatalError)
    return NextResponse.json({ error: 'Förfrågan kunde inte skickas just nu.' }, { status: 500 })
  })
}

async function handlePost(request: Request) {
  const limit = checkRateLimit({
    key: `dealer-offer:${getClientIp(request)}`,
    limit: 6,
    windowMs: 10 * 60 * 1000,
  })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Ogiltig förfrågan.' }, { status: 400 })
  }

  const payload = parsePayload(form)
  const error = validatePayload(payload)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const reference = `DOR-${Date.now().toString(36).toUpperCase()}`
  const admin = createAdminClient()
  const { data: lead, error: insertError } = await admin
    .from('dealer_vehicle_leads')
    .insert({
      reference,
      vin: payload.vin || null,
      make: payload.make,
      model: payload.model,
      model_year: Number(payload.modelYear),
      details: payload.otherNotes || payload.damageDescription || null,
      contact_name: `${payload.firstName} ${payload.lastName}`.trim(),
      contact_email: payload.email,
      contact_phone: payload.phone,
      mileage_km: Number(payload.mileageKm),
      fuel_type: payload.fuelType,
      transmission: payload.transmission,
      body_type: payload.bodyType,
      color: payload.color,
      engine_power: payload.enginePower || null,
      previous_owners: payload.previousOwners ? Number(payload.previousOwners) : null,
      key_count: payload.keyCount,
      service_book: payload.serviceBook,
      last_service: payload.lastService || null,
      summer_tires: payload.summerTires,
      winter_tires: payload.winterTires,
      inspected: payload.inspected,
      drivable: payload.drivable,
      finance_status: payload.financeStatus,
      visible_damage: payload.visibleDamage,
      damage_description: payload.damageDescription || null,
      cosmetic_damage: payload.cosmeticDamage,
      accident_history: payload.accidentHistory,
      warning_lights: payload.warningLights,
      technical_problems: payload.technicalProblems,
      engine_transmission_problems: payload.engineTransmissionProblems,
      rust: payload.rust,
      serviced_by_schedule: payload.servicedBySchedule,
      smoke_free: payload.smokeFree,
      interior_damage: payload.interiorDamage,
      other_notes: payload.otherNotes || null,
      first_name: payload.firstName,
      last_name: payload.lastName,
      postal_code: payload.postalCode,
      city: payload.city,
      preferred_contact: payload.preferredContact,
      privacy_accepted: payload.privacyAccepted,
      status: 'new',
      source_path: safeReferer(request),
    })
    .select('id,reference')
    .single()

  if (insertError || !lead) {
    console.error('dealer_vehicle_leads insert failed', insertError)
    return NextResponse.json({ error: 'Förfrågan kunde inte skickas just nu.' }, { status: 500 })
  }

  const uploadedImages: UploadedDealerImage[] = []
  try {
    for (const [key, label] of imageFields) {
      const file = form.get(`image_${key}`)
      if (file instanceof File && file.size > 0) {
        uploadedImages.push(await uploadDealerImage(admin, file, lead.id, key, label, uploadedImages.length))
      }
    }
    if (uploadedImages.length) {
      const { error: imageError } = await admin.from('dealer_vehicle_lead_images').insert(uploadedImages.map((image) => ({
        lead_id: lead.id,
        image_type: image.imageType,
        label: image.label,
        position: image.position,
        webp_url: image.webpUrl,
        avif_url: image.avifUrl,
        storage_webp_path: image.storageWebpPath,
        storage_avif_path: image.storageAvifPath,
        width: image.width,
        height: image.height,
        original_filename: image.originalFilename,
      })))
      if (imageError) throw imageError
    }
  } catch (uploadError) {
    console.error('dealer lead image upload failed', uploadError)
    await cleanupUploadedImages(admin, uploadedImages)
    await admin.from('dealer_vehicle_leads').delete().eq('id', lead.id)
    return NextResponse.json({ error: imageUploadErrorMessage(uploadError) }, { status: 400 })
  }

  return NextResponse.json({ success: true, reference: lead.reference })
}

function parsePayload(form: FormData) {
  return {
    vin: normalizeVin(text(form, 'vin')),
    make: text(form, 'make', 100),
    model: text(form, 'model', 100),
    modelYear: text(form, 'modelYear', 4),
    mileageKm: text(form, 'mileageKm', 10),
    fuelType: text(form, 'fuelType', 40),
    transmission: text(form, 'transmission', 40),
    bodyType: text(form, 'bodyType', 60),
    color: text(form, 'color', 60),
    enginePower: text(form, 'enginePower', 40),
    previousOwners: text(form, 'previousOwners', 4),
    keyCount: text(form, 'keyCount', 20),
    serviceBook: text(form, 'serviceBook', 20),
    lastService: text(form, 'lastService', 100),
    summerTires: text(form, 'summerTires', 10),
    winterTires: text(form, 'winterTires', 10),
    inspected: text(form, 'inspected', 10),
    drivable: text(form, 'drivable', 10),
    financeStatus: text(form, 'financeStatus', 20),
    visibleDamage: text(form, 'visibleDamage', 10),
    damageDescription: text(form, 'damageDescription', 1200),
    cosmeticDamage: text(form, 'cosmeticDamage', 10),
    accidentHistory: text(form, 'accidentHistory', 20),
    warningLights: text(form, 'warningLights', 10),
    technicalProblems: text(form, 'technicalProblems', 10),
    engineTransmissionProblems: text(form, 'engineTransmissionProblems', 10),
    rust: text(form, 'rust', 10),
    servicedBySchedule: text(form, 'servicedBySchedule', 20),
    smokeFree: text(form, 'smokeFree', 10),
    interiorDamage: text(form, 'interiorDamage', 10),
    otherNotes: text(form, 'otherNotes', 2200),
    firstName: text(form, 'firstName', 80),
    lastName: text(form, 'lastName', 80),
    email: text(form, 'email', 180).toLowerCase(),
    phone: text(form, 'phone', 60),
    postalCode: text(form, 'postalCode', 30),
    city: text(form, 'city', 100),
    preferredContact: text(form, 'preferredContact', 20),
    privacyAccepted: text(form, 'privacyAccepted') === 'true',
  }
}

function validatePayload(payload: ReturnType<typeof parsePayload>) {
  if (payload.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(payload.vin)) return 'VIN ska vara exakt 17 tecken och får inte innehålla I, O eller Q.'
  if (!payload.make || !payload.model || !/^\d{4}$/.test(payload.modelYear)) return 'Ange märke, modell och årsmodell.'
  if (!positiveInteger(payload.mileageKm)) return 'Ange mätarställning i kilometer.'
  const requiredDetails = ['fuelType', 'transmission', 'bodyType', 'color', 'keyCount', 'serviceBook', 'summerTires', 'winterTires', 'inspected', 'drivable', 'financeStatus'] as const
  if (requiredDetails.some((key) => !payload[key])) return 'Fyll i bilens uppgifter.'
  const requiredCondition = ['visibleDamage', 'cosmeticDamage', 'accidentHistory', 'warningLights', 'technicalProblems', 'engineTransmissionProblems', 'rust', 'servicedBySchedule', 'smokeFree', 'interiorDamage'] as const
  if (requiredCondition.some((key) => !payload[key])) return 'Fyll i bilens skick.'
  if (payload.visibleDamage === 'Ja' && payload.damageDescription.length < 3) return 'Beskriv skadorna.'
  if (!payload.firstName || !payload.lastName || !isValidEmail(payload.email) || payload.phone.length < 6 || !payload.postalCode || !payload.city || !payload.preferredContact) return 'Fyll i kontaktuppgifter.'
  if (!payload.privacyAccepted) return 'Godkänn integritetspolicy och villkor.'
  return ''
}

type UploadedDealerImage = {
  imageType: string
  label: string
  position: number
  webpUrl: string
  avifUrl: string
  storageWebpPath: string
  storageAvifPath: string
  width: number
  height: number
  originalFilename: string
}

async function uploadDealerImage(supabase: SupabaseClient, file: File, leadId: string, imageType: string, label: string, position: number): Promise<UploadedDealerImage> {
  const processed = await processMarketplaceImage(file)
  const imageId = crypto.randomUUID()
  const stem = `dealer-leads/${leadId}/${imageId}-${processed.baseName}`
  const webpPath = `${stem}/listing.webp`
  const avifPath = `${stem}/fullscreen.avif`
  await uploadVariant(supabase, webpPath, processed.listing)
  await uploadVariant(supabase, avifPath, processed.fullscreen)
  return {
    imageType,
    label,
    position,
    webpUrl: publicStorageUrl(supabase, webpPath),
    avifUrl: publicStorageUrl(supabase, avifPath),
    storageWebpPath: webpPath,
    storageAvifPath: avifPath,
    width: processed.listing.width,
    height: processed.listing.height,
    originalFilename: processed.originalFilename,
  }
}

async function uploadVariant(supabase: SupabaseClient, path: string, variant: ProcessedMarketplaceImage['listing']) {
  const { error } = await supabase.storage.from('marketplace-listings').upload(path, variant.body, {
    cacheControl: '31536000',
    contentType: variant.contentType,
    upsert: false,
  })
  if (error) throw error
}

function publicStorageUrl(supabase: SupabaseClient, path: string) {
  const { data } = supabase.storage.from('marketplace-listings').getPublicUrl(path)
  if (!data.publicUrl) throw new Error('Image URL failed')
  return data.publicUrl
}

async function cleanupUploadedImages(supabase: SupabaseClient, images: UploadedDealerImage[]) {
  const paths = images.flatMap((image) => [image.storageWebpPath, image.storageAvifPath])
  if (paths.length) await supabase.storage.from('marketplace-listings').remove(paths)
}

function text(form: FormData, key: string, maxLength = 2200) {
  return String(form.get(key) || '').replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, maxLength)
}

function normalizeVin(value: string) {
  return value.replace(/\s+/g, '').toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '')
}

function positiveInteger(value: string) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function imageUploadErrorMessage(error: unknown) {
  const code = error instanceof Error ? error.message : ''
  if (code === 'HEIC_NOT_SUPPORTED') return 'HEIC/HEIF stöds inte ännu. Välj JPG, PNG, WebP eller AVIF.'
  if (code === 'IMAGE_SIZE_INVALID') return 'En bild är tom eller större än 25 MB.'
  if (code === 'UNSUPPORTED_IMAGE_TYPE' || code === 'IMAGE_SIGNATURE_MISMATCH') return 'En bild har ett format som inte stöds.'
  return 'Bilderna kunde inte laddas upp. Försök igen.'
}

function safeReferer(request: Request) {
  const referer = request.headers.get('referer') || ''
  try {
    const url = new URL(referer)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}
