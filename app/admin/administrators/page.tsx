import { ShieldCheck, UsersRound } from 'lucide-react'
import { requireAdminPermission } from '@/lib/admin-auth'
import {
  ADMIN_ROLES,
  ADMIN_ROLE_LABELS,
  normalizeAdminRole,
  permissionCountForRole,
  type AdminRole,
} from '@/lib/admin/permissions'
import { AdminPageHeader, AdminTable, Badge, DetailCard } from '../AdminUI'
import { formatDate } from '../admin-helpers'
import StaffInvitationForm from './StaffInvitationForm'

export const dynamic = 'force-dynamic'

export default async function AdminAdministratorsPage() {
  const { adminClient, permissions, accessSource } = await requireAdminPermission('administrators.read')
  const assignmentsResult = await adminClient
    .from('user_admin_roles')
    .select('id,user_id,role_key,is_active,expires_at,created_at')
    .order('created_at', { ascending: false })

  const legacyResult = assignmentsResult.error
    ? await adminClient.from('admin_users').select('id,user_id,role,is_active,created_at').order('created_at', { ascending: false })
    : { data: [] }

  const assignments = assignmentsResult.error
    ? (legacyResult.data || []).map((entry) => ({
        id: entry.id,
        user_id: entry.user_id,
        role_key: normalizeAdminRole(entry.role) || 'operations_admin',
        is_active: entry.is_active,
        expires_at: null,
        created_at: entry.created_at,
      }))
    : assignmentsResult.data || []

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader
        eyebrow="Access control"
        title="Administratörer och roller"
        description="Serverstyrd rollmatris med minsta privilegium. Rolländringar förblir avstängda tills RBAC-migrationen och rollgränstesterna har godkänts."
      />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#dce3ee] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-[#0866ff]"><ShieldCheck className="h-5 w-5" /></span>
          <div>
            <p className="font-bold">{accessSource === 'rbac' ? 'RBAC är aktivt' : 'Legacy-kompatibilitet är aktiv'}</p>
            <p className="mt-1 text-xs text-[#667085]">{assignments.length} aktiva eller historiska tilldelningar hittades.</p>
          </div>
        </div>
        <Badge label={permissions.includes('administrators.manage') ? 'Super Admin' : 'Endast läsning'} tone={permissions.includes('administrators.manage') ? 'green' : 'gray'} />
      </div>

      {permissions.includes('administrators.manage') ? <StaffInvitationForm /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ADMIN_ROLES.map((role) => (
          <article key={role} className="rounded-2xl border border-[#dce3ee] bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-[#101828]">{ADMIN_ROLE_LABELS[role]}</p>
            <p className="mt-2 text-xs leading-5 text-[#667085]">{roleDescription(role)}</p>
            <p className="mt-4 text-xs font-bold text-[#0866ff]">{permissionCountForRole(role)} permissions</p>
          </article>
        ))}
      </section>

      <div className="mt-7">
        <DetailCard title="Aktuella tilldelningar">
          {!assignments.length ? (
            <p className="text-sm text-[#667085]">Inga administratörstilldelningar hittades.</p>
          ) : (
            <AdminTable columns={['Användar-ID', 'Roll', 'Status', 'Gäller till', 'Tilldelad']}>
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-[#f8fafc]">
                  <td className="px-4 py-4 font-mono text-xs text-[#475467]">{assignment.user_id}</td>
                  <td className="px-4 py-4"><Badge label={ADMIN_ROLE_LABELS[assignment.role_key as AdminRole] || assignment.role_key} tone="blue" /></td>
                  <td className="px-4 py-4"><Badge label={assignment.is_active ? 'Aktiv' : 'Inaktiv'} tone={assignment.is_active ? 'green' : 'gray'} /></td>
                  <td className="px-4 py-4 text-[#667085]">{assignment.expires_at ? formatDate(assignment.expires_at) : 'Tills vidare'}</td>
                  <td className="px-4 py-4 text-[#667085]">{formatDate(assignment.created_at)}</td>
                </tr>
              ))}
            </AdminTable>
          )}
        </DetailCard>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <UsersRound className="mt-0.5 h-5 w-5 shrink-0" />
        <p>Admins får inte läsa eller sätta användarlösenord. Det äldre lösenordsverktyget tas ur drift i denna patch; framtida onboarding ska använda inbjudan och MFA.</p>
      </div>
    </main>
  )
}

function roleDescription(role: AdminRole) {
  const descriptions: Record<AdminRole, string> = {
    super_admin: 'Full kontroll, systemkonfiguration och rolladministration.',
    operations_admin: 'Daglig drift för användare, företag, annonser och support.',
    moderator: 'Moderering, rapporter och relevant användarhistorik.',
    support_admin: 'Supportärenden och begränsade kontoåtgärder.',
    finance_admin: 'Betalningar, abonnemang och ekonomiska ärenden.',
    content_editor: 'Innehåll, media och nyhetsbrev.',
    analyst: 'Read-only statistik och rapportering.',
  }
  return descriptions[role]
}
