import AdminResourcePage from '../../AdminResourcePage'
import type { AdminSearchParams } from '../../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminFinanceCasesPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="payments.read"
      table="admin_finance_cases"
      select="id,payment_order_id,case_type,status,amount_minor,currency,reason,decision_reason,created_at,updated_at"
      title="Ekonomiärenden"
      eyebrow="Ekonomi"
      description="Separat beslutslogg för återbetalningar, krediter, abonnemangsjusteringar och avvikelsegranskning."
      basePath="/admin/payments/cases"
      searchColumns={['case_type', 'reason', 'decision_reason']}
      statusOptions={[
        { value: 'open', label: 'Öppen' },
        { value: 'approved', label: 'Godkänd' },
        { value: 'rejected', label: 'Avslagen' },
        { value: 'executed', label: 'Utförd' },
        { value: 'closed', label: 'Stängd' },
      ]}
      columns={[
        { key: 'case_type', label: 'Typ' },
        { key: 'payment_order_id', label: 'Betalning' },
        { key: 'amount_minor', label: 'Belopp', format: 'money' },
        { key: 'reason', label: 'Motivering' },
        { key: 'status', label: 'Status', format: 'status' },
        { key: 'created_at', label: 'Skapad', format: 'date' },
      ]}
      emptyText="Inga ekonomiärenden matchar filtret."
    />
  )
}
