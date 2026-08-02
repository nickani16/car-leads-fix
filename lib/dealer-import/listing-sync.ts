import 'server-only'

import crypto from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { processMarketplaceImage, type ProcessedMarketplaceImage } from '@/lib/marketplace/image-processing'
import { safeFetchBuffer, validateOutboundUrl } from '@/lib/dealer-import/safe-fetch'
import type { ParsedVehicle } from '@/lib/dealer-import/vehicle-parser'

const supportedCategories = new Set(['cars', 'vans', 'motorcycles', 'motorhomes', 'caravans', 'trucks', 'agriculture', 'construction', 'electric-bikes'])
const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

type ImportSource = {
  id: string
  organization_id: string
  pilot_program_id: string | null
  location_id?: string | null
  source_type: string
  verified_domain: string | null
  configuration: Record<string, unknown> | null
}

type ListingContext = {
  sellerUserId: string
  sellerName: string
  countryCode: string
  location: {
    id: string | null
    name: string | null
    countryCode: string | null
    region: string | null
    municipality: string | null
    city: string | null
    postalCode: string | null
    address: string | null
    latitude: number | null
    longitude: number | null
  }
  expiresAt: string
}

type StoredImage = {
  sourceUrl: string
  hash: string
  cardUrl: string
  listingUrl: string
  fullscreenUrl: string
  cardPath: string
  listingPath: string
  fullscreenPath: string
  width: number
  height: number
  listingBytes: number
  fullscreenBytes: number
  filename: string
}

export async function loadDealerListingContext(admin: SupabaseClient, source: ImportSource): Promise<ListingContext> {
  const [{ data: company }, { data: ownerMember }, { data: profile }, { data: pilot }] = await Promise.all([
    admin.from('marketplace_companies').select('id,name,country_code').eq('id', source.organization_id).maybeSingle(),
    admin.from('marketplace_company_members').select('user_id,role').eq('company_id', source.organization_id).in('role', ['owner', 'admin', 'manager']).order('created_at').limit(1).maybeSingle(),
    admin.from('marketplace_profiles').select('user_id').eq('company_id', source.organization_id).eq('account_type', 'business').order('created_at').limit(1).maybeSingle(),
    source.pilot_program_id
      ? admin.from('business_pilot_programs').select('planned_end_date').eq('id', source.pilot_program_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])
  if (!company) throw new Error('IMPORT_ORGANIZATION_NOT_FOUND')
  const sellerUserId = String(ownerMember?.user_id || profile?.user_id || '')
  if (!sellerUserId) throw new Error('IMPORT_ORGANIZATION_SELLER_REQUIRED')

  let locationQuery = admin.from('marketplace_company_locations').select('id,name,country_code,region,municipality,city,postal_code,address_line_1,latitude,longitude').eq('company_id', source.organization_id).eq('is_active', true)
  locationQuery = source.location_id ? locationQuery.eq('id', source.location_id) : locationQuery.order('is_primary', { ascending: false }).order('created_at').limit(1)
  const { data: location } = await locationQuery.limit(1).maybeSingle()
  const pilotEnd = pilot?.planned_end_date ? new Date(`${pilot.planned_end_date}T23:59:59.999Z`) : null
  const fallbackEnd = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
  const expiresAt = pilotEnd && pilotEnd.getTime() > Date.now() ? pilotEnd.toISOString() : fallbackEnd.toISOString()

  return {
    sellerUserId,
    sellerName: String(company.name || 'Autorell dealer'),
    countryCode: normalizeCountryCode(company.country_code) || 'SE',
    location: {
      id: location?.id ? String(location.id) : null,
      name: location?.name ? String(location.name) : null,
      countryCode: normalizeCountryCode(location?.country_code),
      region: optionalText(location?.region),
      municipality: optionalText(location?.municipality),
      city: optionalText(location?.city),
      postalCode: optionalText(location?.postal_code),
      address: optionalText(location?.address_line_1),
      latitude: finiteNumber(location?.latitude),
      longitude: finiteNumber(location?.longitude),
    },
    expiresAt,
  }
}

export async function synchronizeImportedVehicle(admin: SupabaseClient, input: {
  source: ImportSource
  context: ListingContext
  itemId: string
  sourceUrl: string
  vehicle: ParsedVehicle
  change: 'created' | 'updated' | 'unchanged'
}) {
  const { source, context, vehicle } = input
  const { data: item, error: itemError } = await admin.from('dealer_import_items').select('id,vehicle_id,duplicate_of_item_id,sync_status,warnings,imported_image_paths,image_hashes').eq('id', input.itemId).eq('source_id', source.id).maybeSingle()
  if (itemError || !item) throw itemError || new Error('IMPORT_ITEM_NOT_FOUND')
  let existingListingId = item.vehicle_id ? String(item.vehicle_id) : ''
  if (!existingListingId) {
    const { data: existingListing, error: existingListingError } = await admin.from('marketplace_listings').select('id').eq('import_item_id', item.id).maybeSingle()
    if (existingListingError) throw existingListingError
    existingListingId = existingListing?.id ? String(existingListing.id) : ''
  }

  if (item.duplicate_of_item_id && !existingListingId) {
    const { data: canonicalItem, error: canonicalError } = await admin
      .from('dealer_import_items')
      .select('vehicle_id,sync_status')
      .eq('id', item.duplicate_of_item_id)
      .eq('organization_id', source.organization_id)
      .maybeSingle()
    if (canonicalError) throw canonicalError
    existingListingId = canonicalItem?.vehicle_id ? String(canonicalItem.vehicle_id) : ''
    if (!existingListingId) {
      const warnings = Array.isArray(item.warnings) ? item.warnings.map(String) : []
      const { error } = await admin.from('dealer_import_items').update({
        sync_status: 'import_review',
        warnings: [...new Set([...warnings, 'DUPLICATE_CANONICAL_LISTING_PENDING'])],
        last_synced_at: new Date().toISOString(),
      }).eq('id', item.id)
      if (error) throw error
      return { status: 'duplicate_pending' as const, listingId: null, imagesImported: 0 }
    }
  }

  if (item.duplicate_of_item_id && existingListingId) {
    const { error } = await admin.from('dealer_import_items').update({ vehicle_id: existingListingId, sync_status: 'active', source_status: vehicle.sourceStatus, last_synced_at: new Date().toISOString() }).eq('id', item.id)
    if (error) throw error
    return { status: 'duplicate' as const, listingId: existingListingId, imagesImported: 0 }
  }

  if (vehicle.sourceStatus === 'sold') {
    if (existingListingId) {
      const { error } = await admin.from('marketplace_listings').update({ status: 'sold', import_status: 'sold', updated_at: new Date().toISOString() }).eq('id', existingListingId).eq('import_item_id', item.id)
      if (error) throw error
    }
    const { error } = await admin.from('dealer_import_items').update({ vehicle_id: existingListingId || null, sync_status: 'sold', source_status: 'sold', last_synced_at: new Date().toISOString() }).eq('id', item.id)
    if (error) throw error
    return { status: 'sold' as const, listingId: existingListingId || null, imagesImported: 0 }
  }

  if (!isSafeForAutomaticPublication(vehicle)) {
    const { error } = await admin.from('dealer_import_items').update({ vehicle_id: existingListingId || null, sync_status: 'import_review', last_synced_at: new Date().toISOString() }).eq('id', item.id)
    if (error) throw error
    return { status: 'review' as const, listingId: existingListingId || null, imagesImported: 0 }
  }

  const existingImages = parseStoredImages(item.imported_image_paths)
  const imageUrlsUnchanged = existingImages.length > 0 && sameUrls(existingImages.map((image) => image.sourceUrl), vehicle.originalImageUrls)
  let importedImages = existingImages
  let imagesReplaced = false
  const uploadedNow: StoredImage[] = []
  if (!imageUrlsUnchanged && vehicle.originalImageUrls.length) {
    const result = await importDealerImages(admin, { source, itemId: String(item.id), sellerUserId: context.sellerUserId, urls: vehicle.originalImageUrls })
    if (result.images.length) {
      importedImages = result.images
      uploadedNow.push(...result.images)
      imagesReplaced = true
    }
  }
  if (!importedImages.length && !existingListingId) {
    await admin.from('dealer_import_items').update({ sync_status: 'import_review', warnings: [...new Set([...vehicle.warnings, 'IMAGE_IMPORT_REQUIRED'])] }).eq('id', item.id)
    return { status: 'review' as const, listingId: null, imagesImported: 0 }
  }

  const now = new Date().toISOString()
  const listingValues = toListingValues(input, importedImages, now)
  let listingId = existingListingId
  if (!listingId) {
    const { data: listing, error } = await admin.from('marketplace_listings').insert(listingValues).select('id').single()
    if (error || !listing) {
      await cleanupStoredImages(admin, uploadedNow)
      throw error || new Error('IMPORTED_LISTING_CREATE_FAILED')
    }
    listingId = String(listing.id)
    await writeListingSideEffects(admin, { listingId, source, context, itemId: String(item.id), vehicle, images: importedImages, eventType: 'dealer_import_listing_created' })
  } else {
    const patch = { ...listingValues }
    delete (patch as Record<string, unknown>).seller_user_id
    delete (patch as Record<string, unknown>).package_id
    delete (patch as Record<string, unknown>).published_at
    const { error } = await admin.from('marketplace_listings').update(patch).eq('id', listingId).eq('import_item_id', item.id)
    if (error) {
      await cleanupStoredImages(admin, uploadedNow)
      throw error
    }
    if (imagesReplaced) {
      await replaceListingImageRows(admin, listingId, context.sellerUserId, importedImages)
      await cleanupStoredImages(admin, existingImages)
    }
    await admin.from('marketplace_listing_events').insert({ listing_id: listingId, actor_user_id: context.sellerUserId, actor_role: 'system', event_type: input.change === 'unchanged' ? 'dealer_import_listing_reactivated' : 'dealer_import_listing_updated', to_status: 'published', to_review_status: 'approved', metadata: { import_source_id: source.id, import_item_id: item.id } })
  }

  const { error: linkError } = await admin.from('dealer_import_items').update({
    vehicle_id: listingId,
    sync_status: 'active',
    source_status: 'present',
    imported_image_paths: importedImages,
    image_hashes: importedImages.map((image) => image.hash),
    last_synced_at: now,
  }).eq('id', item.id)
  if (linkError) throw linkError
  return { status: existingListingId ? input.change === 'unchanged' ? 'unchanged' as const : 'updated' as const : 'created' as const, listingId, imagesImported: uploadedNow.length }
}

function toListingValues(input: { source: ImportSource; context: ListingContext; itemId: string; sourceUrl: string; vehicle: ParsedVehicle }, images: StoredImage[], now: string) {
  const payload = input.vehicle.normalizedPayload
  const categoryValue = String(payload.category || 'cars')
  const category = supportedCategories.has(categoryValue) ? categoryValue : 'cars'
  const countryCode = normalizeCountryCode(payload.country_code) || input.context.location.countryCode || input.context.countryCode
  const city = optionalText(payload.city) || input.context.location.city || 'Unknown'
  const equipment = Array.isArray(payload.equipment) ? payload.equipment.map(String).filter(Boolean).join(', ').slice(0, 8000) : optionalText(payload.equipment)
  return {
    seller_user_id: input.context.sellerUserId,
    category,
    title: requiredText(payload.title, 240),
    description: optionalText(payload.description)?.slice(0, 10000) || requiredText(payload.title, 240),
    make: requiredText(payload.make, 100),
    model: requiredText(payload.model, 140),
    variant: optionalText(payload.variant)?.slice(0, 160) || null,
    model_year: integerInRange(payload.model_year, 1900, new Date().getUTCFullYear() + 2),
    mileage_km: nonNegativeInteger(payload.mileage_km),
    body_type: optionalText(payload.body_type)?.slice(0, 100) || category,
    fuel_type: optionalText(payload.fuel)?.slice(0, 80) || null,
    gearbox: optionalText(payload.transmission)?.slice(0, 80) || null,
    color: optionalText(payload.color)?.slice(0, 80) || null,
    condition: 'used',
    equipment,
    country_code: countryCode,
    country: countryCode,
    city,
    municipality: input.context.location.municipality,
    address: input.context.location.address,
    postal_code: input.context.location.postalCode,
    latitude: input.context.location.latitude,
    longitude: input.context.location.longitude,
    price: nonNegativeInteger(payload.price),
    currency: normalizeCurrency(payload.currency, countryCode),
    images: images.map((image) => image.cardUrl),
    seller_name: input.context.sellerName,
    seller_type: 'business',
    phone_visibility: 'public',
    status: 'published',
    review_status: 'approved',
    risk_score: 0,
    risk_flags: [],
    package_id: 'free_7d',
    priority: 0,
    published_at: now,
    expires_at: input.context.expiresAt,
    structured_data: {
      import_source: 'dealer_inventory',
      source_type: input.source.source_type,
      source_external_id: input.vehicle.sourceExternalId,
      canonical_source_url: input.vehicle.canonicalUrl,
      first_registration_date: payload.first_registration_date || null,
      drivetrain: payload.drivetrain || null,
      power_kw: payload.power_kw || null,
      doors: payload.doors || null,
      seats: payload.seats || null,
      location_id: input.context.location.id,
      location_name: input.context.location.name,
      source_published_at: payload.source_published_at || null,
      source_updated_at: payload.source_updated_at || null,
      original_values: payload.original_values || {},
    },
    import_source_id: input.source.id,
    import_item_id: input.itemId,
    imported_organization_id: input.source.organization_id,
    pilot_program_id: input.source.pilot_program_id,
    import_status: 'active',
    is_automatically_imported: true,
    source_original_url: input.sourceUrl,
    updated_at: now,
  }
}

async function importDealerImages(admin: SupabaseClient, input: { source: ImportSource; itemId: string; sellerUserId: string; urls: string[] }) {
  const hashes = new Set<string>()
  const candidates = input.urls.slice(0, 10).map((sourceUrl, index) => ({ sourceUrl, index }))
  const results = await mapWithConcurrency(candidates, 2, async ({ sourceUrl, index }) => {
    try {
      const parsed = validateOutboundUrl(sourceUrl)
      const allowedHosts = allowedImageHosts(input.source, parsed.hostname)
      const response = await safeFetchBuffer(parsed.toString(), { maxBytes: 25 * 1024 * 1024, timeoutMs: 12_000, maxRedirects: 2, allowedHosts, acceptedContentTypes: supportedImageTypes, acceptHeader: 'image/avif,image/webp,image/png,image/jpeg' })
      if (response.status < 200 || response.status >= 300) throw new Error(`IMAGE_HTTP_${response.status}`)
      if (!supportedImageTypes.includes(response.contentType)) throw new Error('UNSUPPORTED_IMAGE_TYPE')
      const hash = crypto.createHash('sha256').update(response.body).digest('hex')
      if (hashes.has(hash)) return null
      hashes.add(hash)
      const extension = response.contentType === 'image/jpeg' ? 'jpg' : response.contentType.split('/')[1]
      const filename = `dealer-image-${index + 1}.${extension}`
      const file = new File([new Uint8Array(response.body)], filename, { type: response.contentType })
      const processed = await processMarketplaceImage(file)
      return uploadProcessedImage(admin, { processed, sourceUrl, hash, sellerUserId: input.sellerUserId, sourceId: input.source.id, itemId: input.itemId, index })
    } catch (error) {
      console.warn('[dealer-import] image skipped', { sourceId: input.source.id, itemId: input.itemId, sourceUrl, code: error instanceof Error ? error.message : String(error) })
      return null
    }
  })
  const images = results.filter((image): image is StoredImage => image !== null)
  return { images }
}

async function uploadProcessedImage(admin: SupabaseClient, input: { processed: ProcessedMarketplaceImage; sourceUrl: string; hash: string; sellerUserId: string; sourceId: string; itemId: string; index: number }): Promise<StoredImage> {
  const stem = `${input.sellerUserId}/dealer-import/${input.sourceId}/${input.itemId}/${input.index + 1}-${input.hash.slice(0, 20)}`
  const cardPath = `${stem}/card.webp`
  const listingPath = `${stem}/listing.webp`
  const fullscreenPath = `${stem}/fullscreen.avif`
  const variants = [[cardPath, input.processed.card], [listingPath, input.processed.listing], [fullscreenPath, input.processed.fullscreen]] as const
  const uploaded: string[] = []
  try {
    for (const [path, variant] of variants) {
      const { error } = await admin.storage.from('marketplace-listings').upload(path, variant.body, { cacheControl: '31536000', contentType: variant.contentType, upsert: true })
      if (error) throw error
      uploaded.push(path)
    }
  } catch (error) {
    if (uploaded.length) await admin.storage.from('marketplace-listings').remove(uploaded)
    throw error
  }
  const publicUrl = (path: string) => admin.storage.from('marketplace-listings').getPublicUrl(path).data.publicUrl
  return {
    sourceUrl: input.sourceUrl,
    hash: input.hash,
    cardUrl: publicUrl(cardPath),
    listingUrl: publicUrl(listingPath),
    fullscreenUrl: publicUrl(fullscreenPath),
    cardPath,
    listingPath,
    fullscreenPath,
    width: input.processed.listing.width,
    height: input.processed.listing.height,
    listingBytes: input.processed.listing.sizeBytes,
    fullscreenBytes: input.processed.fullscreen.sizeBytes,
    filename: input.processed.originalFilename,
  }
}

async function writeListingSideEffects(admin: SupabaseClient, input: { listingId: string; source: ImportSource; context: ListingContext; itemId: string; vehicle: ParsedVehicle; images: StoredImage[]; eventType: string }) {
  const [imageRows, identifiers, event] = await Promise.all([
    replaceListingImageRows(admin, input.listingId, input.context.sellerUserId, input.images),
    admin.from('marketplace_listing_identifiers').insert({ listing_id: input.listingId, seller_user_id: input.context.sellerUserId, category: String(input.vehicle.normalizedPayload.category || 'cars'), metadata: { import_source: 'dealer_inventory', import_source_id: input.source.id, import_item_id: input.itemId, source_external_id: input.vehicle.sourceExternalId, vin_fingerprint: input.vehicle.vinFingerprint, registration_fingerprint: input.vehicle.registrationFingerprint, original_image_urls: input.vehicle.originalImageUrls } }),
    admin.from('marketplace_listing_events').insert({ listing_id: input.listingId, actor_user_id: input.context.sellerUserId, actor_role: 'system', event_type: input.eventType, to_status: 'published', to_review_status: 'approved', metadata: { import_source_id: input.source.id, import_item_id: input.itemId, pilot_program_id: input.source.pilot_program_id } }),
  ])
  if (imageRows.error) console.warn('[dealer-import] image metadata failed', { listingId: input.listingId, error: imageRows.error.message })
  if (identifiers.error) console.warn('[dealer-import] identifier metadata failed', { listingId: input.listingId, error: identifiers.error.message })
  if (event.error) console.warn('[dealer-import] listing event failed', { listingId: input.listingId, error: event.error.message })
}

async function replaceListingImageRows(admin: SupabaseClient, listingId: string, sellerUserId: string, images: StoredImage[]) {
  const { error: deleteError } = await admin.from('marketplace_listing_images').delete().eq('listing_id', listingId)
  if (deleteError) return { error: deleteError }
  if (!images.length) return { error: null }
  return admin.from('marketplace_listing_images').insert(images.map((image, position) => ({ listing_id: listingId, seller_user_id: sellerUserId, position, avif_url: image.fullscreenUrl, webp_url: image.listingUrl, storage_avif_path: image.fullscreenPath, storage_webp_path: image.listingPath, width: image.width, height: image.height, avif_size_bytes: image.fullscreenBytes, webp_size_bytes: image.listingBytes, original_filename: image.filename, expires_at: null, purge_after: null })))
}

async function cleanupStoredImages(admin: SupabaseClient, images: StoredImage[]) {
  const paths = images.flatMap((image) => [image.cardPath, image.listingPath, image.fullscreenPath]).filter(Boolean)
  if (paths.length) await admin.storage.from('marketplace-listings').remove(paths)
}

function isSafeForAutomaticPublication(vehicle: ParsedVehicle) {
  const blockedWarnings = new Set(['MAKE_MISSING', 'MODEL_MISSING', 'PRICE_MISSING', 'MODEL_YEAR_MISSING', 'LOW_PARSE_CONFIDENCE'])
  return vehicle.parseConfidence >= 0.82 && !vehicle.warnings.some((warning) => blockedWarnings.has(warning))
}

function allowedImageHosts(source: ImportSource, initialHost: string) {
  const hosts = new Set([initialHost.toLowerCase()])
  const configured = source.configuration?.allowed_image_hosts
  if (Array.isArray(configured)) for (const value of configured) {
    const host = normalizeHost(String(value))
    if (host) hosts.add(host)
  }
  return hosts
}

function parseStoredImages(value: unknown): StoredImage[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return []
    const item = entry as Record<string, unknown>
    if (!item.sourceUrl || !item.cardUrl || !item.cardPath) return []
    return [{ sourceUrl: String(item.sourceUrl), hash: String(item.hash || ''), cardUrl: String(item.cardUrl), listingUrl: String(item.listingUrl || ''), fullscreenUrl: String(item.fullscreenUrl || ''), cardPath: String(item.cardPath), listingPath: String(item.listingPath || ''), fullscreenPath: String(item.fullscreenPath || ''), width: Number(item.width || 0), height: Number(item.height || 0), listingBytes: Number(item.listingBytes || 0), fullscreenBytes: Number(item.fullscreenBytes || 0), filename: String(item.filename || 'dealer-image') }]
  })
}

function sameUrls(left: string[], right: string[]) { return left.length === right.length && left.every((value, index) => value === right[index]) }
async function mapWithConcurrency<T, R>(values: T[], concurrency: number, mapper: (value: T) => Promise<R>) { const results = new Array<R>(values.length); let cursor = 0; await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, async () => { while (cursor < values.length) { const index = cursor; cursor += 1; results[index] = await mapper(values[index]) } })); return results }
function normalizeHost(value: string) { try { return new URL(value.includes('://') ? value : `https://${value}`).hostname.toLowerCase() } catch { return '' } }
function normalizeCountryCode(value: unknown) { const text = String(value || '').trim().toUpperCase(); return /^[A-Z]{2}$/.test(text) ? text : '' }
function normalizeCurrency(value: unknown, countryCode: string) { const text = String(value || '').trim().toUpperCase(); if (/^[A-Z]{3}$/.test(text)) return text; return countryCode === 'SE' ? 'SEK' : countryCode === 'DK' ? 'DKK' : countryCode === 'PL' ? 'PLN' : 'EUR' }
function optionalText(value: unknown) { const text = String(value || '').trim(); return text || null }
function requiredText(value: unknown, max: number) { const text = String(value || '').trim().slice(0, max); if (!text) throw new Error('IMPORTED_LISTING_REQUIRED_FIELD_MISSING'); return text }
function finiteNumber(value: unknown) { const number = Number(value); return Number.isFinite(number) ? number : null }
function nonNegativeInteger(value: unknown) { const number = Number(value); return Number.isFinite(number) && number >= 0 ? Math.round(number) : null }
function integerInRange(value: unknown, min: number, max: number) { const number = Number(value); return Number.isInteger(number) && number >= min && number <= max ? number : null }
