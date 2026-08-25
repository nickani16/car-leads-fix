import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { sendAdminNotificationEmail } from '@/lib/email/admin-notifications'

type QueueCompanyApplicationReviewInput = {
  admin: SupabaseClient
  companyId: string
  submittedBy: string
  companyName: string
  countryCode: string
  origin: string
  riskFlags?: string[]
}

const ACTIVE_REVIEW_STATUSES = ['submitted', 'under_review', 'more_information_required']

export async function queueCompanyApplicationReview({
  admin,
  companyId,
  submittedBy,
  companyName,
  countryCode,
  origin,
  riskFlags = [],
}: QueueCompanyApplicationReviewInput) {
  const now = new Date().toISOString()
  const { data: existingRequest } = await admin
    .from('business_verification_requests')
    .select('id,status')
    .eq('company_id', companyId)
    .in('status', ACTIVE_REVIEW_STATUSES)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let requestId = existingRequest?.id || null
  if (!requestId) {
    const { data: request, error } = await admin
      .from('business_verification_requests')
      .insert({
        company_id: companyId,
        status: 'submitted',
        risk_flags: riskFlags,
        submitted_by: submittedBy,
        submitted_at: now,
        updated_at: now,
      })
      .select('id')
      .single()
    if (error) throw error
    requestId = request.id
  }

  const actionUrl = requestId
    ? `/admin/companies/verification?status=submitted&request=${requestId}`
    : `/admin/companies/verification?company=${companyId}`

  const notificationPayload = {
    notification_type: 'company_application',
    title: 'Ny företagsansökan',
    body: `${companyName} (${countryCode}) väntar på granskning.`,
    priority: 'high',
    resource_type: 'business_verification_request',
    resource_id: requestId || companyId,
    action_url: actionUrl,
    created_by_event: `company_application:${companyId}`,
    metadata: {
      company_id: companyId,
      request_id: requestId,
      country_code: countryCode,
      risk_flags: riskFlags,
    },
    updated_at: now,
  }

  const { data: existingNotification } = await admin
    .from('admin_notifications')
    .select('id')
    .eq('notification_type', 'company_application')
    .or(`created_by_event.eq.company_application:${companyId},resource_id.eq.${companyId},resource_id.eq.${requestId || companyId}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingNotification?.id) {
    await admin
      .from('admin_notifications')
      .update(notificationPayload)
      .eq('id', existingNotification.id)
  } else {
    await admin.from('admin_notifications').insert(notificationPayload)
  }

  await sendAdminNotificationEmail({
    admin,
    notificationType: 'company_application',
    title: 'Ny företagsansökan',
    body: `${companyName} (${countryCode}) väntar på granskning. Autorell ska ge besked inom 24 timmar.`,
    actionUrl,
    origin,
  })

  return { requestId }
}
