import AdminResourcePage from '../AdminResourcePage'
import type { AdminSearchParams } from '../admin-helpers'
import AdminSubscriptionActions from './AdminSubscriptionActions'

export const dynamic = 'force-dynamic'

export default function AdminSubscriptionsPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="subscriptions.read"
      table="business_subscriptions"
      select="id,user_id,product_key,plan_key,market,currency,status,payment_status,manually_activated,active_listing_limit,cancel_at_period_end,current_period_end,payment_warning_at,grace_period_ends_at,created_at,updated_at"
      title="Abonnemang & paket"
      eyebrow="Ekonomi"
      description="Aktiva planer, kapacitet, uppsägningar och betalningsvarningar för företagskonton. Obetald faktura spärrar bara annonsskapande, inte företagets sparade data."
      basePath="/admin/subscriptions"
      searchColumns={['product_key', 'plan_key']}
      statusOptions={[
        { value: 'active', label: 'Aktiv' },
        { value: 'trialing', label: 'Provperiod' },
        { value: 'past_due', label: 'Förfallen' },
        { value: 'unpaid', label: 'Obetald' },
        { value: 'paused', label: 'Pausad' },
        { value: 'canceled', label: 'Avslutad' },
        { value: 'incomplete', label: 'Ofullständig' },
      ]}
      columns={[
        { key: 'plan_key', label: 'Plan' },
        { key: 'market', label: 'Marknad' },
        { key: 'status', label: 'Status', format: 'status' },
        { key: 'payment_status', label: 'Betalning', format: 'status' },
        { key: 'manually_activated', label: 'Adminöppnad', format: 'boolean' },
        { key: 'active_listing_limit', label: 'Annonsgräns' },
        { key: 'cancel_at_period_end', label: 'Avslutas', format: 'boolean' },
        { key: 'payment_warning_at', label: 'Varning skickad', format: 'date' },
        { key: 'grace_period_ends_at', label: 'Spärr från', format: 'date' },
        { key: 'current_period_end', label: 'Periodslut', format: 'date' },
        { key: 'updated_at', label: 'Uppdaterad', format: 'date' },
      ]}
      emptyText="Inga abonnemang matchar filtret."
      actions={(row) => (
        <AdminSubscriptionActions
          id={String(row.id)}
          status={String(row.status || '')}
          manuallyActivated={row.manually_activated === true}
        />
      )}
      actionsPermission="subscriptions.manage"
    />
  )
}
