import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'
import { sendBusinessApprovalEmail } from '@/lib/email/admin-notifications'

const statuses = new Set(['under_review', 'more_information_required', 'approved', 'rejected'])
const companyStatusByRequestStatus: Record<string, string> = {
  under_review: 'under_review',
  more_information_required: 'pending_review',
  approved: 'verified',
  rejected: 'rejected',
}
const profileStatusByRequestStatus: Record<string, string> = {
  under_review: 'needs_review',
  more_information_required: 'needs_review',
  approved: 'verified',
  rejected: 'rejected',
}
const onboardingStatusByRequestStatus: Record<string, string> = {
  under_review: 'under_review',
  more_information_required: 'under_review',
  approved: 'subscription_pending',
  rejected: 'suspended',
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute('companies.verify')
  if ('error' in auth) return auth.error
  const { id } = await context.params
  const body = (await request.json()) as { action?: string; reason?: string }
  const status = String(body.action || '')
  const reason = String(body.reason || '').trim()
  if (!statuses.has(status)) return NextResponse.json({ error: 'Ogiltig åtgärd.' }, { status: 400 })
  if (status !== 'under_review' && reason.length < 8) {
    return NextResponse.json({ error: 'Ange en intern anledning på minst 8 tecken.' }, { status: 400 })
  }
  const { data: before } = await auth.adminClient.from('business_verification_requests').select('*').eq('id', id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Verifieringen hittades inte.' }, { status: 404 })
  if (['approved', 'rejected', 'revoked'].includes(String(before.status))) {
    return NextResponse.json({ error: 'Slutbehandlade verifieringar är låsta.' }, { status: 409 })
  }
  const decided = ['approved', 'rejected'].includes(status)
  const patch = {
    status,
    assigned_to: before.assigned_to || auth.user.id,
    decided_by: decided ? auth.user.id : null,
    decision_reason: reason || null,
    decided_at: decided ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }
  const { error } = await auth.adminClient.from('business_verification_requests').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const now = patch.updated_at
  const { data: company } = await auth.adminClient
    .from('marketplace_companies')
    .select('id,name,contact_email,country_code,created_by')
    .eq('id', before.company_id)
    .maybeSingle()
  const { data: profile } = await auth.adminClient
    .from('marketplace_profiles')
    .select('user_id,email,locale,country_code,company_name,legal_name')
    .eq('company_id', before.company_id)
    .maybeSingle()

  await auth.adminClient
    .from('marketplace_companies')
    .update({
      verification_status: companyStatusByRequestStatus[status],
      verification_note: reason || null,
      verified_at: status === 'approved' ? now : null,
      verified_by: status === 'approved' ? auth.user.id : null,
      updated_at: now,
    })
    .eq('id', before.company_id)

  if (profile?.user_id) {
    await auth.adminClient
      .from('marketplace_profiles')
      .update({
        business_verification_status: profileStatusByRequestStatus[status],
        business_onboarding_status: onboardingStatusByRequestStatus[status],
        company_verification_note: reason || null,
        verification_updated_at: now,
        updated_at: now,
      })
      .eq('user_id', profile.user_id)
  }

  if (status === 'approved') {
    void sendBusinessApprovalEmail({
      email: profile?.email || company?.contact_email || null,
      locale: profile?.locale || profile?.country_code || company?.country_code || 'en',
      companyName: profile?.company_name || profile?.legal_name || company?.name || 'Autorell business account',
    }).catch((emailError) => {
      console.error('[business-approval-email] failed from verification queue', { requestId: id, error: emailError })
    })
  }

  await auth.adminClient
    .from('admin_notifications')
    .update({
      status: decided ? 'closed' : 'assigned',
      closed_at: decided ? now : null,
      assigned_to: auth.user.id,
      updated_at: now,
    })
    .eq('notification_type', 'company_application')
    .or(`resource_id.eq.${id},resource_id.eq.${before.company_id},created_by_event.eq.company_application:${before.company_id}`)

  await auth.adminClient.from('business_verification_events').insert({
    request_id: id,
    actor_user_id: auth.user.id,
    event_type: `status_${status}`,
    from_status: before.status,
    to_status: status,
    reason: reason || null,
  })
  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'companies.verify',
    action: `business_verification_${status}`,
    targetType: 'business_verification_request',
    targetId: id,
    reason: reason || null,
    beforeData: before,
    afterData: { ...before, ...patch },
  })
  return NextResponse.json({ success: true })
}
