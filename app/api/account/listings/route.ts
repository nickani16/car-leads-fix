import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  getCategoryPricing,
  listingPackageDetails,
} from '@/lib/marketplace-pricing'
import {
  currencyForCountry,
  isSupportedCurrency,
  normalizeMarketplaceCategory,
} from '@/lib/marketplace'
import {
  categoryTechnicalFields,
  listingColorOptions,
} from '@/lib/listing-form-options'
import {
  equipmentLabel,
  equipmentOptionByKey,
  normalizeEquipmentKeys,
} from '@/lib/listing-equipment'
import { validatePostalCode } from '@/lib/postal-code-validation'
import { euCountryCodes } from '@/lib/eu-countries'
import { geocodeListingLocation, parseCoordinate } from '@/lib/geocoding'
import { processMarketplaceImage, type ProcessedMarketplaceImage } from '@/lib/marketplace/image-processing'
import {
  lowPriceThreshold,
  MARKETPLACE_PRIVACY_VERSION,
  MARKETPLACE_PURCHASE_TERMS_VERSION,
  MARKETPLACE_TERMS_VERSION,
  normalizeIdentifier,
  sellerListingConfirmationKeys,
  validateRequiredIdentifiers,
  type ListingIdentifierInput,
} from '@/lib/marketplace-security'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'

const MAX_IMAGES = 20
const MAX_IMAGE_SIZE = 25 * 1024 * 1024
type UploadedMarketplaceImage = {
  avifUrl: string
  webpUrl: string
  storageAvifPath: string
  storageWebpPath: string
  width: number | null
  height: number | null
  avifSizeBytes: number
  webpSizeBytes: number
  originalFilename: string
}

function text(form: FormData, key: string) {
  return String(form.get(key) || '').trim()
}

function numberOrNull(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null
}

function collectStructuredTechnicalData(
  form: FormData,
  category: ReturnType<typeof normalizeMarketplaceCategory>,
) {
  const technicalData: Record<string, string | number | string[]> = {}
  const fields = categoryTechnicalFields[category] || []

  for (const field of fields) {
    const rawValue = text(form, field.name)
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
        return {
          error: `${field.label} har ett ogiltigt värde.`,
          technicalData,
        }
      }
      technicalData[field.name] =
        field.name === 'engineLiters' ? Math.round(value * 10) / 10 : Math.round(value)
      continue
    }

    const allowedValues = new Set((field.options || []).map((option) => option.value))
    if (allowedValues.size && !allowedValues.has(rawValue)) {
      return {
        error: `${field.label} har ett ogiltigt val.`,
        technicalData,
      }
    }
    technicalData[field.name] = rawValue
  }

  const equipmentKeys = parseEquipmentKeys(form)
  if (equipmentKeys.length) technicalData.equipment_keys = equipmentKeys

  return { error: '', technicalData }
}

function parseEquipmentKeys(form: FormData) {
  const raw = text(form, 'equipmentKeys')
  if (!raw) return []
  try {
    return normalizeEquipmentKeys(JSON.parse(raw))
  } catch {
    return normalizeEquipmentKeys(raw)
  }
}

function equipmentTextFromKeys(keys: string[]) {
  return keys
    .map((key) => equipmentOptionByKey.get(key))
    .filter((option): option is NonNullable<typeof option> => Boolean(option))
    .map((option) => equipmentLabel(option, 'sv'))
    .join(', ')
}

function riskSeverity(score: number) {
  if (score >= 80) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}

async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  userId: string,
  index: number,
): Promise<UploadedMarketplaceImage> {
  const processed = await processMarketplaceImage(file)
  const stem = `${crypto.randomUUID()}-${index}-${processed.baseName}`
  const storageAvifPath = `${userId}/${stem}.avif`
  const storageWebpPath = `${userId}/${stem}.webp`

  await uploadProcessedVariant(supabase, storageAvifPath, processed.avif, 'image/avif')
  await uploadProcessedVariant(supabase, storageWebpPath, processed.webp, 'image/webp')

  const avifUrl = publicStorageUrl(supabase, storageAvifPath)
  const webpUrl = publicStorageUrl(supabase, storageWebpPath)

  return {
    avifUrl,
    webpUrl,
    storageAvifPath,
    storageWebpPath,
    width: processed.width,
    height: processed.height,
    avifSizeBytes: processed.avifSizeBytes,
    webpSizeBytes: processed.webpSizeBytes,
    originalFilename: processed.originalFilename,
  }
}

async function uploadProcessedVariant(
  supabase: SupabaseClient,
  path: string,
  body: ProcessedMarketplaceImage['avif'],
  contentType: 'image/avif' | 'image/webp',
) {
  const { error } = await supabase.storage
    .from('marketplace-listings')
    .upload(path, body, {
      cacheControl: '31536000',
      contentType,
      upsert: false,
    })
  if (error) throw error
}

function publicStorageUrl(supabase: SupabaseClient, path: string) {
  const { data } = supabase.storage.from('marketplace-listings').getPublicUrl(path)
  if (!data.publicUrl) throw new Error('Image URL failed')
  return data.publicUrl
}

async function insertListingImageRows(
  supabase: SupabaseClient,
  listingId: string,
  sellerUserId: string,
  images: UploadedMarketplaceImage[],
  expiresAt: string | null,
) {
  try {
    const { error } = await supabase.from('marketplace_listing_images').insert(
      images.map((image, index) => ({
        listing_id: listingId,
        seller_user_id: sellerUserId,
        position: index,
        avif_url: image.avifUrl,
        webp_url: image.webpUrl,
        storage_avif_path: image.storageAvifPath,
        storage_webp_path: image.storageWebpPath,
        width: image.width,
        height: image.height,
        avif_size_bytes: image.avifSizeBytes,
        webp_size_bytes: image.webpSizeBytes,
        original_filename: image.originalFilename,
        expires_at: expiresAt,
        purge_after: expiresAt
          ? new Date(new Date(expiresAt).getTime() + 30 * 86400000).toISOString()
          : null,
      })),
    )
    if (error) {
      console.warn('Listing image metadata was not stored', error)
    }
  } catch (error) {
    console.warn('Listing image metadata was not stored', error)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Sign in to create a listing.' },
        { status: 401 },
      )
    }
    const createLimit = checkRateLimit({
      key: `create-listing:${user.id}:${getClientIp(request)}`,
      limit: 8,
      windowMs: 60 * 60 * 1000,
    })
    if (createLimit.limited) return rateLimitJson(createLimit.retryAfter)

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('marketplace_profiles')
      .select(`
        user_id,
        account_type,
        first_name,
        last_name,
        birth_date,
        address_line_1,
        postal_code,
        city,
        country_code,
        phone,
        company_name,
        registration_number,
        vat_number,
        display_name,
        identity_status,
        business_verification_status,
        risk_status,
        created_at
      `)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!profile) {
      return NextResponse.json(
        { error: 'Complete your account profile first.' },
        { status: 403 },
      )
    }
    if (profile.risk_status === 'blocked' || profile.risk_status === 'restricted') {
      return NextResponse.json(
        { error: 'Kontot är begränsat. Kontakta support innan du publicerar.' },
        { status: 403 },
      )
    }
    if (
      profile.account_type === 'business' &&
      profile.business_verification_status === 'rejected'
    ) {
      return NextResponse.json(
        { error: 'Företaget behöver granskas av Autorell innan nya annonser kan publiceras.' },
        { status: 403 },
      )
    }
    if (
      !profile.first_name ||
      !profile.last_name ||
      (profile.account_type === 'private' && !profile.birth_date) ||
      !profile.address_line_1 ||
      !profile.postal_code ||
      !profile.city ||
      (profile.account_type === 'business' &&
        (!profile.company_name || !(profile.registration_number || profile.vat_number) || !profile.phone)) ||
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
      return NextResponse.json(
        { error: 'Choose a valid listing package.' },
        { status: 400 },
      )
    }
    if (form.get('listingTerms') !== 'on') {
      return NextResponse.json(
        { error: 'Accept the listing and payment terms.' },
        { status: 400 },
      )
    }
    const missingConfirmation = sellerListingConfirmationKeys.find(
      (key) => form.get(key) !== 'on',
    )
    if (missingConfirmation) {
      return NextResponse.json(
        { error: 'Alla säljarbekräftelser måste godkännas innan annonsen kan skapas.' },
        { status: 400 },
      )
    }

    const make = text(form, 'make')
    const model = text(form, 'model')
    const sellerNote = text(form, 'sellerNote')
    const description =
      sellerNote ||
      `Strukturerad Autorell-annons: ${make} ${model}.`
    const city = text(form, 'city')
    const municipality = text(form, 'municipality')
    const address = text(form, 'addressLine1')
    const postalCode = text(form, 'postalCode')
    const requestedListingCountry = text(form, 'sellerCountryCode').toUpperCase()
    const listingCountryCode = euCountryCodes.has(requestedListingCountry)
      ? requestedListingCountry
      : profile.country_code
    if (postalCode && !validatePostalCode(postalCode, listingCountryCode)) {
      return NextResponse.json(
        { error: 'Postnumret verkar inte vara giltigt för valt land.' },
        { status: 400 },
      )
    }
    const price = Number(text(form, 'price'))
    const colorChoice = text(form, 'colorChoice')
    const color =
      colorChoice === 'other'
        ? 'Annan färg'
        : colorChoice
    const knownColorValues = new Set(listingColorOptions.map((item) => item.value))
    if (!colorChoice || (!knownColorValues.has(colorChoice) && colorChoice !== 'other')) {
      return NextResponse.json(
        { error: 'Välj en giltig färg.' },
        { status: 400 },
      )
    }
    const requestedCurrency = text(form, 'currency').toUpperCase()
    const currency = isSupportedCurrency(requestedCurrency)
      ? requestedCurrency
      : currencyForCountry(listingCountryCode)
    const modelYear = Number(text(form, 'modelYear'))
    const mileage = Number(text(form, 'mileage'))
    const identifiers: ListingIdentifierInput = {
      registrationNumber:
        normalizeIdentifier(text(form, 'registrationNumber') || text(form, 'registration')),
      vin: normalizeIdentifier(text(form, 'vin')),
      chassisNumber: normalizeIdentifier(text(form, 'chassisNumber')),
      serialNumber: normalizeIdentifier(text(form, 'serialNumber')),
      frameNumber: normalizeIdentifier(text(form, 'frameNumber')),
      batterySerialNumber: normalizeIdentifier(text(form, 'batterySerialNumber')),
      totalWeightKg: numberOrNull(text(form, 'totalWeightKg')),
      axleConfiguration: text(form, 'axleConfiguration'),
      machineType: text(form, 'machineType'),
      agricultureObjectType: text(form, 'agricultureObjectType') || 'tractor',
    }
    const identifierValidation = validateRequiredIdentifiers(category, identifiers)
    if (!identifierValidation.valid) {
      return NextResponse.json(
        { error: identifierValidation.message },
        { status: 400 },
      )
    }
    const { error: technicalError, technicalData } =
      collectStructuredTechnicalData(form, category)
    if (technicalError) {
      return NextResponse.json({ error: technicalError }, { status: 400 })
    }
    const equipmentKeys = parseEquipmentKeys(form)
    const equipmentText = equipmentTextFromKeys(equipmentKeys)
    const phoneVisibility =
      profile.account_type === 'business'
        ? 'public'
        : text(form, 'phoneVisibility') === 'public'
          ? 'public'
          : 'registered_only'
    if (
      category === 'agriculture' &&
      identifiers.agricultureObjectType !== 'implement' &&
      !Number(text(form, 'operatingHours'))
    ) {
      return NextResponse.json(
        { error: 'Drifttimmar krävs för traktorer.' },
        { status: 400 },
      )
    }
    if (
      !make ||
      !model ||
      !Number.isInteger(modelYear) ||
      !city ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        { error: 'Complete vehicle, price and location.' },
        { status: 400 },
      )
    }

    const files = form
      .getAll('images')
      .filter(
        (item): item is File => item instanceof File && item.size > 0,
      )
    if (
      !files.length ||
      files.length > MAX_IMAGES ||
      files.some(
        (file) => !file.type.startsWith('image/') || file.size > MAX_IMAGE_SIZE,
      )
    ) {
      return NextResponse.json(
        { error: 'Upload 1-20 images, maximum 25 MB each.' },
        { status: 400 },
      )
    }
    const serialPlateFile = form.get('serialPlateImage')
    if (
      serialPlateFile instanceof File &&
      serialPlateFile.size > 0 &&
      (!serialPlateFile.type.startsWith('image/') ||
        serialPlateFile.size > MAX_IMAGE_SIZE)
    ) {
      return NextResponse.json(
        { error: 'Ladda upp en giltig bild på serienummerskylten.' },
        { status: 400 },
      )
    }

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const [{ count: recentListings }, { count: samePhoneProfiles }] =
      await Promise.all([
        admin
          .from('marketplace_listings')
          .select('id', { count: 'exact', head: true })
          .eq('seller_user_id', user.id)
          .gte('created_at', since24h),
        admin
          .from('marketplace_profiles')
          .select('user_id', { count: 'exact', head: true })
          .eq('phone', profile.phone),
      ])
    const riskFlags: string[] = []
    if (
      !identifiers.vin &&
      ['cars', 'vans', 'motorcycles', 'motorhomes', 'caravans', 'trucks'].includes(category)
    ) {
      riskFlags.push('missing_vin')
    }
    if (
      !identifiers.serialNumber &&
      ['agriculture', 'construction'].includes(category)
    ) {
      riskFlags.push('missing_serial_number')
    }
    if (price < lowPriceThreshold(category)) riskFlags.push('unusually_low_price')
    if (
      profile.created_at &&
      Date.now() - new Date(profile.created_at).getTime() < 7 * 86400000
    ) {
      riskFlags.push('new_user')
    }
    if ((recentListings || 0) >= 5) riskFlags.push('many_listings_short_time')
    if ((samePhoneProfiles || 0) > 1) {
      riskFlags.push('same_phone_multiple_accounts')
    }
    if (profile.risk_status && profile.risk_status !== 'standard') {
      riskFlags.push(`profile_${profile.risk_status}`)
    }
    const riskScore = Math.min(
      100,
      riskFlags.reduce((score, flag) => {
        if (flag === 'unusually_low_price') return score + 30
        if (flag === 'many_listings_short_time') return score + 25
        if (flag === 'same_phone_multiple_accounts') return score + 25
        if (flag === 'new_user') return score + 15
        if (flag.startsWith('profile_')) return score + 35
        return score + 20
      }, 0),
    )
    const reviewStatus = riskScore >= 50 ? 'flagged' : 'approved'
    const geocoded = await geocodeListingLocation({
      address,
      city,
      municipality,
      country: listingCountryCode,
    })
    const latitude = geocoded?.latitude ?? parseCoordinate(text(form, 'latitude'))
    const longitude = geocoded?.longitude ?? parseCoordinate(text(form, 'longitude'))

    const uploadedImages = await Promise.all(
      files.map((file, index) => uploadImage(admin, file, user.id, index)),
    )
    const serialPlateImage =
      serialPlateFile instanceof File && serialPlateFile.size > 0
        ? await uploadImage(admin, serialPlateFile, user.id, files.length + 1)
        : null
    const images = uploadedImages.map((image) => image.webpUrl)
    const duration =
      listingPackageDetails[packageId as keyof typeof listingPackageDetails]
        .durationDays
    const startsAt = packageId === 'free_7d' ? new Date() : null
    const endsAt = startsAt
      ? new Date(startsAt.getTime() + duration * 86400000)
      : null

    const { data: listing, error } = await admin
      .from('marketplace_listings')
      .insert({
        seller_user_id: user.id,
        category,
        title: `${make} ${model} ${text(form, 'variant')}`.trim(),
        description,
        make,
        model,
        variant: text(form, 'variant') || null,
        registration_reference: identifiers.registrationNumber || null,
        model_year: Number.isInteger(modelYear) ? modelYear : null,
        mileage_km: Number.isFinite(mileage)
          ? Math.max(0, Math.round(mileage))
          : null,
        operating_hours: Number(text(form, 'operatingHours')) || null,
        body_type: text(form, 'bodyType') || category,
        fuel_type: text(form, 'fuelType') || null,
        gearbox: text(form, 'gearbox') || null,
        color,
        condition: text(form, 'condition'),
        known_faults: text(form, 'damageStatus') || null,
        equipment: equipmentText || null,
        service_history: text(form, 'serviceHistory') || null,
        country_code: listingCountryCode,
        country: listingCountryCode,
        city,
        municipality: municipality || null,
        address: address || null,
        latitude,
        longitude,
        postal_code: postalCode || null,
        price,
        currency,
        images,
        seller_name:
          profile.account_type === 'business'
            ? profile.company_name
            : profile.display_name,
        seller_type: profile.account_type,
        phone_visibility: phoneVisibility,
        status: packageId === 'free_7d' ? 'published' : 'pending_payment',
        review_status: reviewStatus,
        risk_score: riskScore,
        risk_flags: riskFlags,
        package_id: packageId,
        priority:
          listingPackageDetails[packageId as keyof typeof listingPackageDetails]
            .priority,
        published_at: startsAt?.toISOString() || null,
        expires_at: endsAt?.toISOString() || null,
        vin: identifiers.vin || null,
        chassis_number: identifiers.chassisNumber || identifiers.vin || null,
        serial_number: identifiers.serialNumber || null,
        frame_number: identifiers.frameNumber || null,
        battery_serial_number: identifiers.batterySerialNumber || null,
        total_weight_kg: identifiers.totalWeightKg,
        axle_configuration: identifiers.axleConfiguration || null,
        machine_type: identifiers.machineType || null,
      })
      .select('id,status,review_status,reference_number,listing_number')
      .single()

    if (error || !listing) throw error

    await insertListingImageRows(admin, listing.id, user.id, uploadedImages, endsAt?.toISOString() || null)

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null
    const userAgent = request.headers.get('user-agent')?.slice(0, 1000) || null
    await Promise.all([
      admin.from('marketplace_listing_identifiers').insert({
        listing_id: listing.id,
        seller_user_id: user.id,
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
          agriculture_object_type: identifiers.agricultureObjectType,
          address_line_1: address || null,
          location: {
            address: address || null,
            city,
            municipality: municipality || null,
            country: listingCountryCode,
            latitude,
            longitude,
            geocoding_provider: process.env.GEOCODING_PROVIDER || process.env.MAP_GEOCODING_PROVIDER || null,
          },
          color_choice: colorChoice,
          seller_note_original: sellerNote || null,
          technical_data: technicalData,
          image_variants: uploadedImages.map((image, index) => ({
            position: index,
            avifUrl: image.avifUrl,
            webpUrl: image.webpUrl,
            storageAvifPath: image.storageAvifPath,
            storageWebpPath: image.storageWebpPath,
            width: image.width,
            height: image.height,
            avifSizeBytes: image.avifSizeBytes,
            webpSizeBytes: image.webpSizeBytes,
          })),
        },
      }),
      admin.from('marketplace_legal_acceptances').insert(
        sellerListingConfirmationKeys.map((key) => ({
          user_id: user.id,
          listing_id: listing.id,
          acceptance_scope:
            key === 'privacy_policy'
              ? 'privacy'
              : key === 'purchase_terms'
                ? 'purchase'
                : 'listing',
          acceptance_key: key,
          accepted: true,
          terms_version:
            key === 'privacy_policy'
              ? MARKETPLACE_PRIVACY_VERSION
              : key === 'purchase_terms'
                ? MARKETPLACE_PURCHASE_TERMS_VERSION
                : MARKETPLACE_TERMS_VERSION,
          ip_address: ipAddress,
          user_agent: userAgent,
          metadata: { reference_number: listing.reference_number },
        })),
      ),
      admin.from('marketplace_listing_events').insert({
        listing_id: listing.id,
        actor_user_id: user.id,
        actor_role: 'seller',
        event_type: 'listing_created',
        to_status: listing.status,
        to_review_status: listing.review_status,
        metadata: {
          reference_number: listing.reference_number,
          listing_number: listing.listing_number,
          package_id: packageId,
        },
      }),
      riskFlags.length
        ? admin.from('marketplace_listing_risk_events').insert(
            riskFlags.map((flag) => ({
              listing_id: listing.id,
              seller_user_id: user.id,
              risk_key: flag,
              severity: riskSeverity(riskScore),
              score: riskScore,
              details: { category, price, currency },
            })),
          )
        : Promise.resolve({ error: null }),
      serialPlateImage
        ? admin.from('marketplace_listing_documents').insert({
            listing_id: listing.id,
            seller_user_id: user.id,
            document_type: 'serial_plate',
            file_url: serialPlateImage.avifUrl,
            storage_path: serialPlateImage.storageAvifPath,
            metadata: {
              uploaded_from: 'listing_form',
              webp_url: serialPlateImage.webpUrl,
              storage_webp_path: serialPlateImage.storageWebpPath,
            },
          })
        : Promise.resolve({ error: null }),
    ])

    return NextResponse.json({
      success: true,
      listingId: listing.id,
      referenceNumber: listing.reference_number,
      requiresPayment: packageId !== 'free_7d',
      packageId,
    })
  } catch (error) {
    console.error('Marketplace listing creation failed', error)
    return NextResponse.json(
      { error: 'The listing could not be created.' },
      { status: 500 },
    )
  }
}
