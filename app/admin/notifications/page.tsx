import Link from 'next/link'
import { requireAdminPermission } from '@/lib/admin-auth'
import { AdminPageHeader, AdminTable, Badge } from '../AdminUI'
import { formatDate, statusTone } from '../admin-helpers'
import NotificationActions from './NotificationActions'

export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  const { adminClient } = await requireAdminPermission('dashboard.view')
  const { data } = await adminClient.from('admin_notifications').select('*').order('created_at', { ascending: false }).limit(100)
  return <main className="px-4 py-7 sm:px-6 lg:px-8">
    <AdminPageHeader eyebrow="Operativt" title="Notiscenter" description="Direktlänkar till händelser som kräver läsning, tilldelning eller åtgärd." />
    <AdminTable columns={['Notis', 'Prioritet', 'Status', 'Skapad', 'Åtgärd']}>
      {(data || []).map((item) => <tr key={item.id}>
        <td className="px-4 py-4"><Link href={item.action_url || '#'} className="font-bold text-[#101828] hover:text-[#0866ff]">{item.title}</Link><p className="mt-1 text-xs text-[#667085]">{item.body}</p></td>
        <td className="px-4 py-4"><Badge label={item.priority} tone={item.priority === 'critical' ? 'red' : item.priority === 'high' ? 'amber' : 'gray'} /></td>
        <td className="px-4 py-4"><Badge label={item.status} tone={statusTone(item.status)} /></td>
        <td className="px-4 py-4 text-[#667085]">{formatDate(item.created_at)}</td>
        <td className="px-4 py-4"><NotificationActions id={item.id} read={item.status !== 'unread'} assigned={Boolean(item.assigned_to)} /></td>
      </tr>)}
    </AdminTable>
  </main>
}
