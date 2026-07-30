import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  COMPANY_IMPORT_MAX_FILE_SIZE,
  parseCompanyListingImportCsv,
  type CompanyImportPreviewRow,
} from '@/lib/company-listing-import'
import {
  attachBusinessListingQuotaReservation,
  releaseBusinessListingQuotaReservation,
  reserveBusinessListingQuota,
} from '@/lib/billing/business-limits'
import { requireBusinessListingEntitlement } from '@/lib/billing/business-entitlement'
import { processMarketplaceImage, type ProcessedMarketplaceImage } from '@/lib/marketplace/image-processing'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 300

type UploadedImportImage = {
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
  sourceUrl: string
}

export async function POST(request: Request) {
  const createdListingIds: string[] = []
  let openReservationKey: string | null = null
  const uploadedForOpenListing: UploadedImportImage[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const access = await getImportAccess(user.id)
    if (!access.allowed) return NextResponse.json(access, { status: access.status })

    const form = await request.formData()
    const file = form.get('csv')
    if (!(file instanceof File)) return NextResponse.json({ error: 'CSV file is required.' }, { status: 400 })
    if (file.size > COMPANY_IMPORT_MAX_FILE_SIZE) return NextResponse.json({ error: 'CSV file is too large.' }, { status: 413 })

    const branches = await loadCompanyBranches(access.profile.company_id)
    const preview = parseCompanyListingImportCsv(await file.text(), { branches })
    if (preview.errors.length || preview.invalidRows || !preview.validRows) {
      return NextResponse.json({ error: 'Fix validation errors before importing.', ...preview }, { status: 422 })
    }
    if (preview.validRows > access.quota.remaining) {
      return NextResponse.json({
        error: 'Not enough listing quota for this import period.',
        quota: access.quota,
        requestedRows: preview.validRows,
      }, { status: 403 })
    }

    const admin = createAdminClient()
    for (const row of preview.rows) {
      const reservation = await reserveBusinessListingQuota(user.id)
      if (!reservation.allowed) {
        return NextResponse.json({
          error: 'Listing quota reached during import.',
          quota: reservation,
          createdListingIds,
        }, { status: 403 })
      }
      openReservationKey = reservation.reservationKey
      uploadedForOpenListing.length = 0
      uploadedForOpenListing.push(...await importRemoteImages(admin, row, user.id))

      const { data: listing, error } = await admin
        .from('marketplace_listings')
        .insert(toListingInsert(row, user.id, access.profile.company_name || 'Autorell', branches, uploadedForOpenListing))
        .select('id,status,review_status,reference_number,listing_number')
        .single()

      if (error || !listing) {
        await cleanupImportedImages(admin, uploadedForOpenListing)
        throw error || new Error('Listing insert failed')
      }
      await attachBusinessListingQuotaReservation(openReservationKey, listing.id)
      openReservationKey = null
      createdListingIds.push(listing.id)

      await Promise.all([
        uploadedForOpenListing.length
          ? admin.from('marketplace_listing_images').insert(uploadedForOpenListing.map((image, index) => ({
              listing_id: listing.id,
              seller_user_id: user.id,
              position: index,
              avif_url: image.fullscreenUrl,
              webp_url: image.listingUrl,
              storage_avif_path: image.fullscreenPath,
              storage_webp_path: image.listingPath,
              width: image.width,
              height: image.height,
              avif_size_bytes: image.fullscreenBytes,
              webp_size_bytes: image.listingBytes,
              original_filename: image.filename,
              expires_at: null,
              purge_after: null,
            })))
          : Promise.resolve({ error: null }),
        admin.from('marketplace_listing_identifiers').insert({
          listing_id: listing.id,
          seller_user_id: user.id,
          category: row.data.category,
          registration_number: row.data.registrationReference,
          metadata: {
            import_source: 'company_csv',
            import_row_number: row.rowNumber,
            reference_number: row.data.referenceNumber,
            image_urls: row.data.imageUrls,
            imported_images: uploadedForOpenListing.map((image) => ({
              source_url: image.sourceUrl,
              card_url: image.cardUrl,
            })),
          },
        }),
        admin.from('marketplace_listing_events').insert({
          listing_id: listing.id,
          actor_user_id: user.id,
          actor_role: 'seller',
          event_type: 'company_import_draft_created',
          to_status: 'draft',
          to_review_status: 'approved',
          metadata: {
            import_row_number: row.rowNumber,
            reference_number: row.data.referenceNumber,
            listing_number: listing.listing_number,
            quota_period_end: reservation.periodEnd,
          },
        }),
      ])
      uploadedForOpenListing.length = 0
    }

    revalidateTag('marketplace-listings', 'max')
    return NextResponse.json({
      success: true,
      created: createdListingIds.length,
      listingIds: createdListingIds,
    })
  } catch (error) {
    if (openReservationKey) {
      await releaseBusinessListingQuotaReservation(openReservationKey).catch(() => undefined)
    }
    await cleanupImportedImages(createAdminClient(), uploadedForOpenListing).catch(() => undefined)
    console.error('Company import failed', error)
    return NextResponse.json({
      error: 'Could not import listings.',
      createdListingIds,
    }, { status: 500 })
  }
}

function toListingInsert(row: CompanyImportPreviewRow, userId: string, sellerName: string, branches: Awaited<ReturnType<typeof loadCompanyBranches>>, images: UploadedImportImage[]) {
  const branch = row.data.branchName
    ? branches.find((item) => normalizeBranchKey(item.name) === normalizeBranchKey(row.data.branchName))
    : null
  return {
    seller_user_id: userId,
    category: row.data.category,
    title: row.data.title,
    description: row.data.description,
    make: row.data.make,
    model: row.data.model,
    registration_reference: row.data.registrationReference,
    model_year: row.data.modelYear,
    mileage_km: row.data.mileageKm,
    body_type: row.data.category,
    condition: 'used',
    country_code: branch?.country_code || row.data.countryCode,
    country: branch?.country_code || row.data.countryCode,
    city: branch?.city || row.data.city,
    municipality: branch?.municipality || row.data.municipality,
    price: row.data.price,
    currency: row.data.currency,
    images: images.map((image) => image.cardUrl),
    seller_name: sellerName,
    seller_type: 'business',
    phone_visibility: 'public',
    status: 'draft',
    review_status: 'approved',
    risk_score: 0,
    risk_flags: [],
    package_id: 'free_7d',
    priority: 0,
    address: branch?.address_line_1 || null,
    postal_code: branch?.postal_code || null,
    structured_data: {
      import_source: 'company_csv',
      branch_name: branch?.name || row.data.branchName || null,
      branch_id: branch?.id || null,
      image_import_count: images.length,
    },
  }
}

async function importRemoteImages(admin: SupabaseClient, row: CompanyImportPreviewRow, userId: string) {
  const uploaded: UploadedImportImage[] = []
  for (const [index, url] of row.data.imageUrls.slice(0, 3).entries()) {
    try {
      const file = await fetchRemoteImageFile(url, row, index)
      uploaded.push(await uploadImportedImage(admin, file, userId, row.rowNumber, index, url))
    } catch (error) {
      console.warn('[company-import] Remote image skipped', {
        rowNumber: row.rowNumber,
        url,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
  return uploaded
}

async function fetchRemoteImageFile(url: string, row: CompanyImportPreviewRow, index: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    if (!response.ok) throw new Error(`IMAGE_FETCH_${response.status}`)
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(contentType)) {
      throw new Error('UNSUPPORTED_REMOTE_IMAGE_TYPE')
    }
    const blob = await response.blob()
    if (!blob.size || blob.size > 25 * 1024 * 1024) throw new Error('REMOTE_IMAGE_SIZE_INVALID')
    const extension = contentType === 'image/jpeg'
      ? 'jpg'
      : contentType === 'image/png'
        ? 'png'
        : contentType === 'image/avif'
          ? 'avif'
          : 'webp'
    const name = `${row.data.referenceNumber || `row-${row.rowNumber}`}-image-${index + 1}.${extension}`
    return new File([blob], name, { type: contentType })
  } finally {
    clearTimeout(timeout)
  }
}

async function uploadImportedImage(
  supabase: SupabaseClient,
  file: File,
  userId: string,
  rowNumber: number,
  index: number,
  sourceUrl: string,
): Promise<UploadedImportImage> {
  const processed = await processMarketplaceImage(file)
  const stem = `${userId}/company-import-${crypto.randomUUID()}-${rowNumber}-${index}-${processed.baseName}`
  const cardPath = `${stem}/card.webp`
  const listingPath = `${stem}/listing.webp`
  const fullscreenPath = `${stem}/fullscreen.avif`
  const variants = [[cardPath, processed.card], [listingPath, processed.listing], [fullscreenPath, processed.fullscreen]] as const
  const results = await Promise.allSettled(variants.map(([path, variant]) => uploadImportVariant(supabase, path, variant)))
  const failed = results.find((result) => result.status === 'rejected')
  if (failed?.status === 'rejected') {
    await supabase.storage.from('marketplace-listings').remove(variants.flatMap(([path], i) => results[i]?.status === 'fulfilled' ? [path] : []))
    throw failed.reason
  }
  const publicUrl = (path: string) => supabase.storage.from('marketplace-listings').getPublicUrl(path).data.publicUrl
  return {
    cardUrl: publicUrl(cardPath),
    listingUrl: publicUrl(listingPath),
    fullscreenUrl: publicUrl(fullscreenPath),
    cardPath,
    listingPath,
    fullscreenPath,
    width: processed.listing.width,
    height: processed.listing.height,
    listingBytes: processed.listing.sizeBytes,
    fullscreenBytes: processed.fullscreen.sizeBytes,
    filename: processed.originalFilename,
    sourceUrl,
  }
}

async function uploadImportVariant(supabase: SupabaseClient, path: string, variant: ProcessedMarketplaceImage['card']) {
  const { error } = await supabase.storage.from('marketplace-listings').upload(path, variant.body, {
    cacheControl: '31536000',
    contentType: variant.contentType,
    upsert: false,
  })
  if (error) throw error
}

async function cleanupImportedImages(supabase: SupabaseClient, images: UploadedImportImage[]) {
  const paths = images.flatMap((image) => [image.cardPath, image.listingPath, image.fullscreenPath])
  if (paths.length) await supabase.storage.from('marketplace-listings').remove(paths)
}

async function getImportAccess(userId: string) {
  const admin = createAdminClient()
  const [{ data: profile }, entitlement] = await Promise.all([
    admin
      .from('marketplace_profiles')
      .select('account_type,company_id,company_name,country_code')
      .eq('user_id', userId)
      .maybeSingle(),
    requireBusinessListingEntitlement(userId),
  ])

  if (profile?.account_type !== 'business') {
    return { allowed: false as const, status: 403, error: 'Business account is required.' }
  }
  if (!entitlement.allowed) {
    return { allowed: false as const, status: 403, error: entitlement.code, code: entitlement.code }
  }
  return {
    allowed: true as const,
    profile,
    entitlement,
    quota: {
      planKey: entitlement.planKey,
      limit: entitlement.activeListingLimit,
      used: entitlement.activeListingCount,
      remaining: Math.max(0, entitlement.activeListingLimit - entitlement.activeListingCount),
    },
  }
}

async function loadCompanyBranches(companyId: string | null | undefined) {
  if (!companyId) return []
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('marketplace_company_locations')
      .select('id,name,country_code,region,municipality,city,postal_code,address_line_1,contact_email,contact_phone,is_active')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .limit(250)
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

function normalizeBranchKey(value: string | null | undefined) {
  return String(value || '').trim().toLowerCase()
}
