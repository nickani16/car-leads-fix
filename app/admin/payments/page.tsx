import AdminResourcePage from '../AdminResourcePage'
import AdminOperationForm from '../AdminOperationForm'
import type { AdminSearchParams } from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminPaymentsPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="payments.read"
      table="payment_orders"
      select="id,product_key,market,currency,amount_minor,status,failure_reason,created_at,paid_at"
      title="Betalningar"
      eyebrow="Ekonomi"
      description="Transaktioner, betalstatus och avvikelser samlade i en revisionssäker vy. Stripe-identiteter visas inte i listvyn."
      basePath="/admin/payments"
      searchColumns={['product_key', 'failure_reason']}
      statusOptions={[
        { value: 'created', label: 'Skapad' },
        { value: 'pending', label: 'Väntar' },
        { value: 'paid', label: 'Betald' },
        { value: 'fulfilled', label: 'Levererad' },
        { value: 'failed', label: 'Misslyckad' },
        { value: 'refunded', label: 'Återbetald' },
      ]}
      columns={[
        { key: 'product_key', label: 'Produkt' },
        { key: 'market', label: 'Marknad' },
        { key: 'amount_minor', label: 'Belopp', format: 'money' },
        { key: 'status', label: 'Status', format: 'status' },
        { key: 'failure_reason', label: 'Avvikelse' },
        { key: 'created_at', label: 'Skapad', format: 'date' },
      ]}
      emptyText="Inga betalningar matchar filtret."
      toolbar={<AdminOperationForm mode="finance" />}
      toolbarPermission="payments.manage"
    />
  )
}
