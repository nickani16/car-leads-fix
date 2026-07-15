import { NextResponse } from 'next/server'
import {
  requireSuperAdminRoute,
  writeAdminAuditLog,
} from '@/lib/admin-route-auth'
import { sendBusinessApprovalEmail } from '@/lib/admin-notifications'

const actions = new Set([
  'suspend',
  'activate',
  'delete',
  'company_verified',
  'company_rejected',
  'company_pending_review',
])

const profileAuditSelect = `
  user_id,
  account_type,
  email,
  phone,
  country_code,
  locale,
  first_name,
  last_name,
  display_name,
  company_name,
  legal_name,
  company_id,
  registration_number,
  vat_number,
  business_verification_status,
  business_onboarding_status,
  company_verification_note,
  verification_updated_at,
  risk_status,
  suspended,
  deleted_at,
  removed_by_admin,
  updated_at
`

export async function PATCH(
  request: Request,
  context: RouteContext<'/api/admin/users/[id]'>,
) {
  const auth = await requireSuperAdminRoute()
  if ('error' in auth) return auth.error

  const { id } = await context.params
  const body = (await request.json()) as { action?: string; reason?: string }
  const action = String(body.action || '')
  if (!actions.has(action)) {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  }

  const { adminClient, user } = auth
  let { data: before, error: beforeError } = await adminClient
    .from('marketplace_profiles')
    .select(profileAuditSelect)
    .eq('user_id', id)
    .maybeSingle()

  // Company links and older admin notifications may carry company_id rather than user_id.
  // Resolve the canonical profile first; all subsequent writes use before.user_id.
  if (!before && !beforeError) {
    const fallback = await adminClient
      .from('marketplace_profiles')
      .select(profileAuditSelect)
      .eq('company_id', id)
      .maybeSingle()
    before = fallback.data
    beforeError = fallback.error
  }

  if (beforeError || !before) {
    return NextResponse.json({ error: 'User profile not found.' }, { status: 404 })
  }

  const now = new Date().toISOString()
  const patch: Record<string, unknown> = { updated_at: now }
  if (action === 'activate') {
    patch.risk_status = 'standard'
    patch.suspended = false
  }
  if (action === 'suspend') {
    patch.risk_status = 'restricted'
    patch.suspended = true
  }
  if (action === 'delete') {
    patch.risk_status = 'blocked'
    patch.suspended = true
    patch.deleted_at = now
    patch.removed_by_admin = true
  }
  if (action === 'company_verified') {
    patch.business_verification_status = 'verified'
    patch.company_verification_note = body.reason || null
    patch.verification_updated_at = now
    patch.business_onboarding_status = 'subscription_pending'
  }
  if (action === 'company_rejected') {
    patch.business_verification_status = 'rejected'
    patch.company_verification_note = body.reason || null
    patch.verification_updated_at = now
    patch.business_onboarding_status = 'suspended'
  }
  if (action === 'company_pending_review') {
    patch.business_verification_status = 'needs_review'
    patch.company_verification_note = body.reason || null
    patch.verification_updated_at = now
    patch.business_onboarding_status = 'under_review'
  }

  const userId = before.user_id
  let { error } = await adminClient
    .from('marketplace_profiles')
    .update(patch)
    .eq('user_id', userId)

  if (error && String(error.message).includes('column')) {
    const fallbackPatch: Record<string, unknown> = {
      updated_at: now,
      risk_status: action === 'activate' ? 'standard' : action === 'suspend' ? 'restricted' : 'blocked',
    }
    const fallback = await adminClient
      .from('marketplace_profiles')
      .update(fallbackPatch)
      .eq('user_id', userId)
    error = fallback.error
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (
    before.account_type === 'business' &&
    before.company_id &&
    action.startsWith('company_')
  ) {
    const status =
      action === 'company_verified'
        ? 'verified'
        : action === 'company_rejected'
          ? 'rejected'
          : 'pending_review'
    await adminClient
      .from('marketplace_companies')
      .update({
        verification_status: status,
        verification_note: body.reason || null,
        verified_at: status === 'verified' ? now : null,
        verified_by: status === 'verified' ? user.id : null,
        updated_at: now,
      })
      .eq('id', before.company_id)
  }

  if (before.account_type === 'business' && action === 'company_verified') {
    void sendBusinessApprovalEmail({
      email: before.email,
      locale: before.locale || before.country_code || 'en',
      companyName: before.company_name || before.legal_name || 'Autorell business account',
    }).catch((error) => {
      console.error('[business-approval-email] failed', { userId, error })
    })
  }

  if (action === 'delete' || action === 'suspend') {
    await adminClient
      .from('marketplace_listings')
      .update({ status: 'paused', updated_at: now })
      .eq('seller_user_id', userId)
      .eq('status', 'published')
  }

  await writeAdminAuditLog({
    adminClient,
    actorUserId: user.id,
    action: `marketplace_user_${action}`,
    targetType: 'marketplace_profile',
    targetId: userId,
    reason: body.reason || null,
    beforeData: before,
    afterData: { ...before, ...patch },
  })

  return NextResponse.json({ success: true })
}
