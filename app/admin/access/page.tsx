import { requireSuperAdmin } from '@/lib/admin-auth'
import { AdminPageHeader, Badge, DetailCard } from '../AdminUI'
import AccessControlPanel from './AccessControlPanel'

export default async function AdminAccessPage() {
  const { adminClient } = await requireSuperAdmin()
  const [{ data: staff }, { data: auditLog }] = await Promise.all([
    adminClient
      .from('staff_users')
      .select(
        'user_id,role,display_name,email,username,is_active,must_change_password,created_at'
      )
      .order('created_at', { ascending: false }),
    adminClient
      .from('admin_audit_log')
      .select(
        'id,action,target_type,target_id,reason,created_at,actor_user_id'
      )
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Super admin"
        title="Access control"
        description="Create staff logins, control access and review every sensitive administrative action."
      />

      <AccessControlPanel initialStaff={staff || []} />

      <div className="mt-7">
        <DetailCard title="Latest admin activity">
          <div className="space-y-3">
            {(auditLog || []).map((entry) => (
              <article
                key={entry.id}
                className="flex flex-col gap-2 rounded-[14px] bg-[#f8f7f3] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {entry.action.replaceAll('_', ' ')}
                  </p>
                  <p className="mt-1 text-xs text-[#72797c]">
                    {entry.target_type} {entry.target_id || ''}
                    {entry.reason ? ` · ${entry.reason}` : ''}
                  </p>
                </div>
                <Badge
                  label={new Date(entry.created_at).toLocaleString('sv-SE')}
                  tone="gray"
                />
              </article>
            ))}
            {!auditLog?.length && (
              <p className="text-sm text-[#72797c]">No admin activity yet.</p>
            )}
          </div>
        </DetailCard>
      </div>
    </main>
  )
}
