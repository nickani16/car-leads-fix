import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { isBusinessFeatureEnabled } from '@/lib/business-feature-flags'
import { sendBusinessPilotEmail } from '@/lib/email/business-pilot'

export async function sendEndingPilotNotifications() {
  const admin = createAdminClient()
  const today = new Date()
  const end = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
  const fromDate = today.toISOString().slice(0, 10)
  const toDate = end.toISOString().slice(0, 10)
  const { data, error } = await admin.from('business_pilot_programs').select('id,application_id,organization_id,planned_end_date').eq('status', 'pilot_active').gte('planned_end_date', fromDate).lte('planned_end_date', toDate).limit(200)
  if (error) throw error
  let sent = 0
  for (const program of data || []) {
    if (!await isBusinessFeatureEnabled('business_pilot_program', { organizationId: program.organization_id, pilotProgramId: program.id })) continue
    const { data: application } = await admin.from('business_pilot_applications').select('id,contact_email,company_name,locale,country_code').eq('id', program.application_id).maybeSingle()
    if (!application) continue
    const result = await sendBusinessPilotEmail(admin, { applicationId: application.id, kind: 'pilot_ending_soon', recipientEmail: application.contact_email, companyName: application.company_name, locale: application.locale, countryCode: application.country_code, note: program.planned_end_date ? String(program.planned_end_date) : null })
    if (result.delivered) sent += 1
  }
  return sent
}
