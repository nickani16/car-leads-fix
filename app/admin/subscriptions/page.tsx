import AdminResourcePage from '../AdminResourcePage'
import type { AdminSearchParams } from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminSubscriptionsPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="subscriptions.read"
      table="business_subscriptions"
      select="id,product_key,plan_key,market,currency,status,active_listing_limit,cancel_at_period_end,current_period_end,payment_warning_at,created_at"
      title="Abonnemang & paket"
      eyebrow="Ekonomi"
      description="Aktiva planer, kapacitet, uppsägningar och betalningsvarningar för företagskonton."
      basePath="/admin/subscriptions"
      searchColumns={['product_key', 'plan_key']}
      statusOptions={[
        { value: 'active', label: 'Aktiv' },
        { value: 'trialing', label: 'Provperiod' },
        { value: 'past_due', label: 'Förfallen' },
        { value: 'paused', label: 'Pausad' },
        { value: 'canceled', label: 'Avslutad' },
        { value: 'incomplete', label: 'Ofullständig' },
      ]}
      columns={[
        { key: 'plan_key', label: 'Plan' },
        { key: 'market', label: 'Marknad' },
        { key: 'status', label: 'Status', format: 'status' },
        { key: 'active_listing_limit', label: 'Annonsgräns' },
        { key: 'cancel_at_period_end', label: 'Avslutas', format: 'boolean' },
        { key: 'current_period_end', label: 'Periodslut', format: 'date' },
      ]}
      emptyText="Inga abonnemang matchar filtret."
    />
  )
}
