import AdminEntityActions from '../../AdminEntityActions'
import AdminResourcePage from '../../AdminResourcePage'
import type { AdminSearchParams } from '../../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminVerificationPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="companies.read"
      table="business_verification_requests"
      select="id,company_id,status,risk_flags,submitted_at,decided_at,decision_reason,updated_at"
      title="Företagsverifiering"
      eyebrow="Business"
      description="Verifieringskö med risksignaler, ansvarig handläggare och fullständig beslutshistorik."
      basePath="/admin/companies/verification"
      searchColumns={['decision_reason']}
      statusOptions={[
        { value: 'submitted', label: 'Inskickad' },
        { value: 'under_review', label: 'Granskas' },
        { value: 'more_information_required', label: 'Mer information krävs' },
        { value: 'approved', label: 'Godkänd' },
        { value: 'rejected', label: 'Avslagen' },
        { value: 'suspended', label: 'Suspenderad' },
      ]}
      columns={[
        { key: 'company_id', label: 'Företag' },
        { key: 'risk_flags', label: 'Risksignaler' },
        { key: 'status', label: 'Status', format: 'status' },
        { key: 'decision_reason', label: 'Beslutsgrund' },
        { key: 'submitted_at', label: 'Inskickad', format: 'date' },
      ]}
      actions={(row) => (
        <AdminEntityActions endpoint={`/api/admin/verifications/${String(row.id)}`} actions={[
          { action: 'under_review', label: 'Starta granskning' },
          { action: 'more_information_required', label: 'Begär info', requiresReason: true },
          { action: 'approved', label: 'Godkänn', requiresReason: true },
          { action: 'rejected', label: 'Avslå', tone: 'danger', requiresReason: true },
        ]} />
      )}
      actionsPermission="companies.verify"
      emptyText="Inga verifieringsärenden matchar filtret."
    />
  )
}
