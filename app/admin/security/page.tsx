import AdminResourcePage from '../AdminResourcePage'
import AdminOperationForm from '../AdminOperationForm'
import type { AdminSearchParams } from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminSecurityPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="security.read"
      table="security_events"
      select="id,event_type,severity,ip_masked,country_code,region,risk_score,occurred_at,expires_at"
      title="Säkerhet"
      eyebrow="Risk & åtkomst"
      description="Riskhändelser med maskerad nätverksinformation, poängsättning och tidsbegränsad retention. Full IP exponeras inte i listvyn."
      basePath="/admin/security"
      searchColumns={['event_type', 'ip_masked', 'country_code']}
      statusColumn="severity"
      statusOptions={[
        { value: 'low', label: 'Låg' },
        { value: 'medium', label: 'Medel' },
        { value: 'high', label: 'Hög' },
        { value: 'critical', label: 'Kritisk' },
      ]}
      columns={[
        { key: 'event_type', label: 'Händelse' },
        { key: 'severity', label: 'Allvarlighet', format: 'status' },
        { key: 'ip_masked', label: 'Nätverk' },
        { key: 'country_code', label: 'Land' },
        { key: 'risk_score', label: 'Riskpoäng' },
        { key: 'occurred_at', label: 'Tidpunkt', format: 'date' },
      ]}
      orderBy="occurred_at"
      emptyText="Inga säkerhetshändelser matchar filtret."
      toolbar={<AdminOperationForm mode="security" />}
      toolbarPermission="security.manage"
    />
  )
}
