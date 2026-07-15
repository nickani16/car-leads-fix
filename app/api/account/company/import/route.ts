import { NextResponse } from 'next/server'
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
import { planAllows } from '@/lib/company-portal'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const createdListingIds: string[] = []
  let openReservationKey: string | null = null

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

    const preview = parseCompanyListingImportCsv(await file.text())
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

      const { data: listing, error } = await admin
        .from('marketplace_listings')
        .insert(toListingInsert(row, user.id, access.profile.company_name || 'Autorell'))
        .select('id,status,review_status,reference_number,listing_number')
        .single()

      if (error || !listing) throw error || new Error('Listing insert failed')
      await attachBusinessListingQuotaReservation(openReservationKey, listing.id)
      openReservationKey = null
      createdListingIds.push(listing.id)

      await Promise.all([
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
    }

    return NextResponse.json({
      success: true,
      created: createdListingIds.length,
      listingIds: createdListingIds,
    })
  } catch (error) {
    if (openReservationKey) {
      await releaseBusinessListingQuotaReservation(openReservationKey).catch(() => undefined)
    }
    console.error('Company import failed', error)
    return NextResponse.json({
      error: 'Could not import listings.',
      createdListingIds,
    }, { status: 500 })
  }
}

function toListingInsert(row: CompanyImportPreviewRow, userId: string, sellerName: string) {
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
    country_code: row.data.countryCode,
    country: row.data.countryCode,
    city: row.data.city,
    municipality: row.data.municipality,
    price: row.data.price,
    currency: row.data.currency,
    images: [],
    seller_name: sellerName,
    seller_type: 'business',
    phone_visibility: 'public',
    status: 'draft',
    review_status: 'approved',
    risk_score: 0,
    risk_flags: [],
    package_id: 'free_7d',
    priority: 0,
  }
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
  if (!planAllows(entitlement.planKey, 'growth')) {
    return { allowed: false as const, status: 403, error: 'Bulk import requires Growth, Professional or Enterprise.' }
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
