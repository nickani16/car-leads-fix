import { notFound } from 'next/navigation'
import { CompanyPortalShell, formatCompanyDate, getCompanyPortalContext } from '@/lib/company-portal'
import { createAdminClient } from '@/lib/supabase/admin'
import { getInventoryImportCopy } from '@/lib/inventory-import-i18n'
import type { PublicLocale } from '@/lib/public-i18n'
import InventorySourcesClient, { type InventorySourceView } from './InventorySourcesClient'
import PilotDashboard from './PilotDashboard'
import { loadBusinessPilotDashboard } from '@/lib/business-pilot-dashboard'
import { getPilotDashboardCopy } from '@/lib/pilot-dashboard-i18n'

export const dynamic = 'force-dynamic'

export default async function CompanyInventoryPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const organizationId = context.profile.company_id
  if (!organizationId || !context.inventoryImportEnabled) notFound()

  const copy = getInventoryImportCopy(context.locale)
  const { sources, pilot, locationCount } = await loadInventoryOverview(organizationId)
  const admin = createAdminClient()
  const dashboard = pilot ? await loadBusinessPilotDashboard(admin, { organizationId, ownerUserId: pilot.internal_owner_user_id }) : null
  const { count: commercialRequestCount } = pilot ? await admin.from('business_pilot_commercial_requests').select('id', { count: 'exact', head: true }).eq('program_id', pilot.id).in('status', ['submitted', 'contacted']) : { count: 0 }
  const activeSources = sources.filter((source) => source.sync_status === 'active').length
  const imported = sources.reduce((sum, source) => sum + Number(source.imported_count || 0), 0)
  const published = sources.reduce((sum, source) => sum + Number(source.published_count || 0), 0)
  const review = sources.reduce((sum, source) => sum + Number(source.review_count || 0), 0)
  const errors = sources.reduce((sum, source) => sum + Number(source.error_count || 0), 0)
  const lastSuccess = sources.map((source) => source.last_success_at).filter(Boolean).sort().at(-1) || null
  const nextSync = sources.map((source) => source.next_sync_at).filter(Boolean).sort().at(0) || null
  const metrics = [activeSources, imported, published, review, errors, formatCompanyDate(lastSuccess, context.locale), formatCompanyDate(nextSync, context.locale), locationCount]

  return (
    <CompanyPortalShell context={context} active="inventory" title={copy.portal.title} description={copy.portal.description}>
      {pilot && dashboard ? <PilotDashboard copy={getPilotDashboardCopy(context.locale)} pilot={{ status: String(pilot.status), startDate: formatCompanyDate(pilot.start_date, context.locale), endDate: formatCompanyDate(pilot.planned_end_date, context.locale), daysRemaining: daysRemaining(pilot.planned_end_date), contactName: dashboard.contactName }} periods={dashboard.periods} commercialRequested={Boolean(commercialRequestCount)} /> : null}
      <InventorySourcesClient copy={copy} sources={sources} metrics={metrics} pilot={{ active: Boolean(pilot && ['onboarding', 'pilot_active', 'pilot_paused'].includes(String(pilot.status))), startDate: pilot?.start_date || null, plannedEndDate: pilot?.planned_end_date || null }} />
    </CompanyPortalShell>
  )
}

async function loadInventoryOverview(organizationId: string): Promise<{ sources: InventorySourceView[]; pilot: { id: string; status: string | null; start_date: string | null; planned_end_date: string | null; internal_owner_user_id: string | null } | null; locationCount: number }> {
  try {
    const admin = createAdminClient()
    const [sourcesResult, pilotResult, locationsResult] = await Promise.all([
      admin.from('dealer_import_sources').select('id,name,source_type,website_url,inventory_url,feed_url,verified_domain,verification_status,sync_status,sync_interval_hours,discovered_count,imported_count,published_count,review_count,error_count,last_success_at,next_sync_at,last_error').eq('organization_id', organizationId).is('deleted_at', null).order('created_at', { ascending: false }),
      admin.from('business_pilot_programs').select('id,status,start_date,planned_end_date,internal_owner_user_id').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      admin.from('marketplace_company_locations').select('id', { count: 'exact', head: true }).eq('company_id', organizationId).eq('is_active', true),
    ])
    return { sources: (sourcesResult.data || []) as InventorySourceView[], pilot: pilotResult.data || null, locationCount: locationsResult.count || 0 }
  } catch {
    return { sources: [], pilot: null, locationCount: 0 }
  }
}

function daysRemaining(value: string | null) {
  if (!value) return 0
  const end = new Date(`${value}T23:59:59.999Z`).getTime()
  return Math.max(0, Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000)))
}
