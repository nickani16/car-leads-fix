import { NextResponse } from 'next/server'
import {
  requireSuperAdminRoute,
  writeAdminAuditLog,
} from '@/lib/admin-route-auth'

const actions = new Set(['approve', 'hide', 'remove'])

const reviewAuditSelect = `
  id,
  listing_id,
  reviewer_id,
  reviewee_id,
  reviewer_role,
  rating,
  comment,
  status,
  moderation_note,
  moderated_by,
  moderated_at,
  created_at,
  updated_at
`

export async function PATCH(
  request: Request,
  context: RouteContext<'/api/admin/reviews/[id]'>,
) {
  const auth = await requireSuperAdminRoute()
  if ('error' in auth) return auth.error

  const { id } = await context.params
  const body = (await request.json()) as {
    action?: string
    note?: string
  }
  const action = String(body.action || '')
  if (!actions.has(action)) {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  }

  const { adminClient, user } = auth
  const { data: before } = await adminClient
    .from('marketplace_reviews')
    .select(reviewAuditSelect)
    .eq('id', id)
    .maybeSingle()

  if (!before) {
    return NextResponse.json({ error: 'Review not found.' }, { status: 404 })
  }

  const status =
    action === 'approve' ? 'visible' : action === 'hide' ? 'hidden' : 'removed'
  const patch = {
    status,
    moderated_by: user.id,
    moderated_at: new Date().toISOString(),
    moderation_note: String(body.note || '').trim() || null,
  }

  const { error } = await adminClient
    .from('marketplace_reviews')
    .update(patch)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await writeAdminAuditLog({
    adminClient,
    actorUserId: user.id,
    action: `marketplace_review_${action}`,
    targetType: 'marketplace_review',
    targetId: id,
    reason: body.note || null,
    beforeData: before,
    afterData: { ...before, ...patch },
  })

  return NextResponse.json({ success: true })
}
