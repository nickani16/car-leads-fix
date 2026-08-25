import { NextResponse } from 'next/server'
import { getDealerImportAccess } from '@/lib/dealer-import-access'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { sendBusinessPilotEmail } from '@/lib/email/business-pilot'

export async function POST(request: Request) {
  const access = await getDealerImportAccess()
  if (!access.allowed) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.canManage) return NextResponse.json({ error: 'MANAGER_ROLE_REQUIRED' }, { status: 403 })
  if (!access.pilot || !['pilot_active', 'pilot_paused', 'pilot_completed'].includes(String(access.pilot.status))) return NextResponse.json({ error: 'ACTIVE_OR_COMPLETED_PILOT_REQUIRED' }, { status: 409 })
  const rate = checkRateLimit({ key: `pilot-commercial:${access.user.id}:${getClientIp(request)}`, limit: 3, windowMs: 24 * 60 * 60 * 1000 })
  if (rate.limited) return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 })

  const { data: program, error: programError } = await access.admin.from('business_pilot_programs').select('id,application_id').eq('id', access.pilot.id).eq('organization_id', access.organizationId).maybeSingle()
  if (programError || !program) return NextResponse.json({ error: 'PILOT_PROGRAM_NOT_FOUND' }, { status: 404 })
  const locale = String(access.profile?.locale || 'en').slice(0, 10)
  const { data: created, error } = await access.admin.from('business_pilot_commercial_requests').insert({ program_id: program.id, application_id: program.application_id, organization_id: access.organizationId, requested_by: access.user.id, locale, status: 'submitted' }).select('id').single()
  if (error?.code === '23505') return NextResponse.json({ success: true, duplicate: true })
  if (error || !created) return NextResponse.json({ error: 'COMMERCIAL_REQUEST_FAILED' }, { status: 500 })

  const now = new Date().toISOString()
  await Promise.all([
    access.admin.from('business_pilot_application_events').insert({ application_id: program.application_id, actor_user_id: access.user.id, event_type: 'company_commercial_request', note: 'Företaget vill diskutera fortsatt samarbete.', metadata: { request_id: created.id, organization_id: access.organizationId } }),
    access.admin.from('admin_notifications').insert({ notification_type: 'business_pilot_commercial_request', title: `${access.company.name} vill diskutera fortsatt samarbete`, body: 'Företaget har skickat en uttrycklig förfrågan från pilotdashboarden. Inget köp eller abonnemang har skapats.', priority: 'high', status: 'unread', resource_type: 'business_pilot_commercial_request', resource_id: String(created.id), action_url: `/admin/business-pilots/${program.application_id}`, created_by_event: 'company_commercial_request', metadata: { application_id: program.application_id, program_id: program.id, organization_id: access.organizationId }, created_at: now, updated_at: now }),
  ])
  const { data: application } = await access.admin.from('business_pilot_applications').select('contact_email,company_name,locale,country_code').eq('id', program.application_id).maybeSingle()
  if (application) await sendBusinessPilotEmail(access.admin, { applicationId: program.application_id, kind: 'commercial_request', recipientEmail: application.contact_email, companyName: application.company_name, locale: application.locale, countryCode: application.country_code }).catch(() => undefined)
  return NextResponse.json({ success: true, requestId: created.id })
}
