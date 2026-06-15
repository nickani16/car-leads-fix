import { requireSales } from '@/lib/sales-auth'
import { AdminEmpty, AdminPageHeader } from '@/app/admin/AdminUI'
import NotificationCard from './NotificationCard'

export default async function SalesNotificationsPage() {
  const { staffUser, adminClient } = await requireSales()
  const { data } = await adminClient
    .from('notifications')
    .select(
      'id,event_type,title,body,status,channels,deal_id,lead_id,action_url,created_at,sent_at'
    )
    .eq('recipient_user_id', staffUser.user_id)
    .order('created_at', { ascending: false })
    .limit(100)

  const notifications = data || []

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Sales inbox"
        title="Notifications"
        description="Open a notification to mark it as read and go directly to the relevant transaction."
      />

      <div className="space-y-3">
        {notifications.length ? (
          notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))
        ) : (
          <AdminEmpty text="No sales notifications yet." />
        )}
      </div>
    </main>
  )
}
