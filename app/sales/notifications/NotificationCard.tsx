'use client'

import { useRouter } from 'next/navigation'
import { Bell, CheckCircle2, Clock3, MailWarning } from 'lucide-react'
import { Badge } from '@/app/admin/AdminUI'

const date = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default function NotificationCard({
  notification,
}: {
  notification: {
    id: string
    title: string
    body: string
    status: string
    channels: string[]
    deal_id: string | null
    action_url: string | null
    created_at: string
  }
}) {
  const router = useRouter()

  async function open() {
    const response = await fetch(
      `/api/sales/notifications/${notification.id}/read`,
      { method: 'POST' }
    )
    const result = (await response.json().catch(() => ({}))) as {
      href?: string
    }
    router.push(
      result.href ||
        notification.action_url ||
        (notification.deal_id
          ? `/sales?deal=${notification.deal_id}`
          : '/sales')
    )
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={open}
      className={`flex w-full gap-4 rounded-[18px] border p-5 text-left transition hover:border-[#8dbdd8] ${
        notification.status === 'read'
          ? 'border-[#deddd7] bg-white'
          : 'border-[#b9dced] bg-[#f2faff]'
      }`}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eaf6fc] text-[#52768a]">
        {notification.status === 'read' || notification.status === 'sent' ? (
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
          {date.format(new Date(notification.created_at))} /{' '}
          {(notification.channels || []).join(' + ')}
        </p>
      </div>
    </button>
  )
}
