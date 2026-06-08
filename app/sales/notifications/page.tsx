import { Bell, CheckCircle2, Clock3, MailWarning } from 'lucide-react'
import { requireSales } from '@/lib/sales-auth'
import { AdminEmpty, AdminPageHeader, Badge } from '@/app/admin/AdminUI'

const date = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default async function SalesNotificationsPage() {
  const { staffUser, adminClient } = await requireSales()
  const { data } = await adminClient
    .from('notifications')
    .select('id,event_type,title,body,status,channels,deal_id,lead_id,created_at,sent_at')
    .eq('recipient_user_id', staffUser.user_id)
    .order('created_at', { ascending: false })
    .limit(100)

  const notifications = data || []

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Sales inbox"
        title="Notifications"
        description="Winning bids and seller follow-up tasks appear here and are also delivered by email."
      />

      <div className="space-y-3">
        {notifications.length ? (
          notifications.map((notification) => (
            <article
              key={notification.id}
              className="flex gap-4 rounded-[18px] border border-[#deddd7] bg-white p-5"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eaf6fc] text-[#52768a]">
                {notification.status === 'sent' || notification.status === 'read' ? (
                  <CheckCircle2 size={18} />
                ) : notification.status === 'failed' ? (
                  <MailWarning size={18} />
                ) : notification.status === 'processing' ? (
                  <Clock3 size={18} />
                ) : (
                  <Bell size={18} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{notification.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-[#62686c]">
                      {notification.body}
                    </p>
                  </div>
                  <Badge
                    label={notification.status}
                    tone={notification.status === 'failed' ? 'red' : 'gray'}
                  />
                </div>
                <p className="mt-3 text-xs text-[#858a8c]">
                  {date.format(new Date(notification.created_at))} ·{' '}
                  {(notification.channels || []).join(' + ')}
                </p>
              </div>
            </article>
          ))
        ) : (
          <AdminEmpty text="No sales notifications yet." />
        )}
      </div>
    </main>
  )
}
