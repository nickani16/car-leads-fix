import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import {
  requireSuperAdminRoute,
  writeAdminAuditLog,
} from '@/lib/admin-route-auth'
import { listingPackageDetails } from '@/lib/marketplace-pricing'

const actions = new Set([
  'approve',
  'pause',
  'flag',
  'mark_suspicious',
  'unpublish',
  'delete',
  'reject',
  'request_info',
  'close_account',
  'reopen_account',
])

export async function PATCH(
  request: Request,
  context: RouteContext<'/api/admin/marketplace-listings/[id]'>,
) {
  const auth = await requireSuperAdminRoute()
  if ('error' in auth) return auth.error

  const { id } = await context.params
  const body = (await request.json()) as {
    action?: string
    reason?: string
  }
  const action = String(body.action || '')
  if (!actions.has(action)) {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  }

  const { adminClient, user } = auth
  const { data: before, error: beforeError } = await adminClient
    .from('marketplace_listings')
    .select('id,seller_user_id,status,review_status,risk_score,risk_flags,title,package_id,published_at,expires_at,boost_status,boost_purchase_id,premium_badge_expires_at')
    .eq('id', id)
    .maybeSingle()

  if (beforeError || !before) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  const listingPatch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (action === 'approve') {
    listingPatch.review_status = 'approved'
    if (before.status === 'pending_review') {
      const packageId = String(before.package_id || 'free_7d') as keyof typeof listingPackageDetails
      const details = listingPackageDetails[packageId] || listingPackageDetails.free_7d
      const now = new Date()
      const expiresAt = new Date(now.getTime() + details.durationDays * 86_400_000)
      listingPatch.status = 'published'
      listingPatch.published_at = now.toISOString()
      listingPatch.expires_at = expiresAt.toISOString()
      if (packageId === 'premium_30d') {
        listingPatch.premium_badge_expires_at = expiresAt.toISOString()
        listingPatch.boost_status = 'active'
        listingPatch.boost_started_at = now.toISOString()
        listingPatch.boost_expires_at = new Date(now.getTime() + 7 * 86_400_000).toISOString()
      }
    }
  }
  if (action === 'pause' || action === 'unpublish') {
    listingPatch.status = 'paused'
  }
  if (action === 'flag' || action === 'request_info' || action === 'mark_suspicious') {
    listingPatch.review_status = 'flagged'
    const flags = Array.isArray(before.risk_flags) ? before.risk_flags : []
    listingPatch.risk_flags = Array.from(
      new Set([...flags, action === 'mark_suspicious' ? 'admin_suspicious' : action]),
    )
  }
  if (action === 'reject') {
    listingPatch.status = 'rejected'
    listingPatch.review_status = 'rejected'
  }
  if (action === 'delete') {
    listingPatch.status = 'rejected'
    listingPatch.review_status = 'rejected'
    listingPatch.archived = true
    listingPatch.removed_by_admin = true
    listingPatch.deleted_at = new Date().toISOString()
  }

  let listingError = null
  if (Object.keys(listingPatch).length > 1) {
    let { error } = await adminClient
      .from('marketplace_listings')
      .update(listingPatch)
      .eq('id', id)
    if (error && 'message' in error && String(error.message).includes('column')) {
      const fallbackPatch = { ...listingPatch }
      delete fallbackPatch.archived
      delete fallbackPatch.removed_by_admin
      delete fallbackPatch.deleted_at
      const fallback = await adminClient
        .from('marketplace_listings')
        .update(fallbackPatch)
        .eq('id', id)
      error = fallback.error
    }
    listingError = error
  }
  if (listingError) {
    return NextResponse.json({ error: listingError.message }, { status: 400 })
  }

  if (action === 'close_account' || action === 'reopen_account') {
    const { error } = await adminClient
      .from('marketplace_profiles')
      .update({
        risk_status: action === 'close_account' ? 'blocked' : 'standard',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', before.seller_user_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await adminClient.from('marketplace_listing_events').insert({
    listing_id: id,
    actor_user_id: user.id,
    actor_role: 'admin',
    event_type: action,
    from_status: before.status,
    to_status: listingPatch.status ? String(listingPatch.status) : before.status,
    from_review_status: before.review_status,
    to_review_status: listingPatch.review_status
      ? String(listingPatch.review_status)
      : before.review_status,
    metadata: { reason: body.reason || null },
  })

  await writeAdminAuditLog({
    adminClient,
    actorUserId: user.id,
    action: `marketplace_listing_${action}`,
    targetType: 'marketplace_listing',
    targetId: id,
    reason: body.reason || null,
    beforeData: before,
    afterData: { ...before, ...listingPatch },
  })

  revalidateTag('marketplace-listings', 'max')

  return NextResponse.json({ success: true })
}
