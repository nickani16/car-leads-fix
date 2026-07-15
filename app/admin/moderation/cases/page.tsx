import AdminEntityActions from '../../AdminEntityActions'
import AdminResourcePage from '../../AdminResourcePage'
import type { AdminSearchParams } from '../../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminModerationCasesPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="moderation.read"
      table="moderation_cases"
      select="id,listing_id,case_type,source,severity,priority,status,sla_due_at,created_at,updated_at"
      title="Modereringsärenden"
      eyebrow="Trust & safety"
      description="Spårbara ärenden för automatiska signaler, rapporter och manuella utredningar med SLA och beslutshistorik."
      basePath="/admin/moderation/cases"
      searchColumns={['case_type', 'source']}
      statusOptions={[
        { value: 'open', label: 'Öppen' },
        { value: 'assigned', label: 'Tilldelad' },
        { value: 'awaiting_information', label: 'Väntar information' },
        { value: 'action_taken', label: 'Åtgärdad' },
        { value: 'rejected', label: 'Avslagen' },
        { value: 'closed', label: 'Stängd' },
      ]}
      columns={[
        { key: 'case_type', label: 'Ärendetyp' },
        { key: 'source', label: 'Källa' },
        { key: 'severity', label: 'Allvarlighet', format: 'status' },
        { key: 'priority', label: 'Prioritet' },
        { key: 'status', label: 'Status', format: 'status' },
        { key: 'sla_due_at', label: 'SLA', format: 'date' },
      ]}
      actions={(row) => (
        <AdminEntityActions endpoint={`/api/admin/moderation-cases/${String(row.id)}`} actions={[
          { action: 'awaiting_information', label: 'Begär info', requiresReason: true },
          { action: 'action_taken', label: 'Åtgärdad', requiresReason: true },
          { action: 'close', label: 'Stäng', tone: 'danger', requiresReason: true },
        ]} />
      )}
      actionsPermission="moderation.manage"
      emptyText="Inga modereringsärenden matchar filtret."
    />
  )
}
