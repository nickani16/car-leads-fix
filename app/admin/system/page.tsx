import AdminEntityActions from '../AdminEntityActions'
import AdminResourcePage from '../AdminResourcePage'
import type { AdminSearchParams } from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminSystemPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="system.read"
      table="system_alerts"
      select="id,source,severity,title,detail,status,created_at,acknowledged_at,resolved_at"
      title="Systemstatus"
      eyebrow="Plattform"
      description="Operativa larm från betalningar, databas, integrationer och bakgrundsjobb med tydligt ägarskap."
      basePath="/admin/system"
      searchColumns={['source', 'title', 'detail']}
      statusOptions={[
        { value: 'open', label: 'Öppen' },
        { value: 'acknowledged', label: 'Bekräftad' },
        { value: 'resolved', label: 'Löst' },
      ]}
      columns={[
        { key: 'source', label: 'Källa' },
        { key: 'severity', label: 'Allvarlighet', format: 'status' },
        { key: 'title', label: 'Larm' },
        { key: 'status', label: 'Status', format: 'status' },
        { key: 'created_at', label: 'Skapad', format: 'date' },
      ]}
      actions={(row) => (
        <AdminEntityActions
          endpoint={`/api/admin/system-alerts/${String(row.id)}`}
          actions={[
            { action: 'acknowledge', label: 'Bekräfta' },
            { action: 'resolve', label: 'Markera löst', requiresReason: true },
          ]}
        />
      )}
      actionsPermission="system.manage"
      emptyText="Inga systemlarm matchar filtret."
    />
  )
}
