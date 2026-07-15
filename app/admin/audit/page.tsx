import { requireAdminPermission } from '@/lib/admin-auth'
import {
  AdminEmpty,
  AdminFilters,
  AdminPageHeader,
  AdminPagination,
  AdminTable,
  Badge,
  FilterSelect,
} from '../AdminUI'
import {
  type AdminSearchParams,
  formatDate,
  getPage,
  getParam,
  pageRange,
  queryToUrlSearchParams,
} from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default async function AdminAuditPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const params = await searchParams
  const q = getParam(params, 'q')
  const role = getParam(params, 'role')
  const page = getPage(params)
  const { from, to } = pageRange(page)
  const { adminClient } = await requireAdminPermission('audit.read')

  let query = adminClient
    .from('admin_audit_log')
    .select('id,actor_user_id,actor_role,action,target_type,target_id,reason,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (role) query = query.eq('actor_role', role)
  if (q) {
    const escaped = q.replace(/[%_,]/g, '')
    query = query.or(`action.ilike.%${escaped}%,target_type.ilike.%${escaped}%,target_id.ilike.%${escaped}%,reason.ilike.%${escaped}%`)
  }

  const { data: entries, count, error } = await query
  const urlQuery = queryToUrlSearchParams(params)

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader
        eyebrow="Spårbarhet"
        title="Audit-logg"
        description="Skrivskyddad historik över känsliga administrativa åtgärder. Vanliga administratörer kan aldrig redigera eller radera poster här."
      />
      <AdminFilters search={q} searchPlaceholder="Sök åtgärd, resurs, ID eller anledning">
        <FilterSelect name="role" value={role} label="Roll" options={[
          { value: 'super_admin', label: 'Super Admin' },
          { value: 'operations_admin', label: 'Operations Admin' },
          { value: 'moderator', label: 'Moderator' },
          { value: 'support_admin', label: 'Support Admin' },
          { value: 'finance_admin', label: 'Finance Admin' },
          { value: 'content_editor', label: 'Content Editor' },
        ]} />
      </AdminFilters>

      {error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">Audit-loggen kunde inte laddas: {error.message}</div>
      ) : !entries?.length ? (
        <AdminEmpty text="Inga auditposter matchar filtret." />
      ) : (
        <>
          <AdminTable columns={['Tid', 'Åtgärd', 'Resurs', 'Aktör', 'Roll', 'Anledning']}>
            {entries.map((entry) => (
              <tr key={entry.id} className="align-top hover:bg-[#f8fafc]">
                <td className="whitespace-nowrap px-4 py-4 text-[#667085]">{formatDate(entry.created_at)}</td>
                <td className="px-4 py-4 font-bold text-[#101828]">{String(entry.action).replaceAll('_', ' ')}</td>
                <td className="px-4 py-4 text-[#475467]"><p>{entry.target_type}</p><p className="mt-1 max-w-[220px] truncate font-mono text-[11px] text-[#98a2b3]">{entry.target_id || '—'}</p></td>
                <td className="px-4 py-4 font-mono text-[11px] text-[#667085]">{entry.actor_user_id || 'system'}</td>
                <td className="px-4 py-4"><Badge label={entry.actor_role} tone="blue" /></td>
                <td className="max-w-sm px-4 py-4 text-[#475467]">{entry.reason || 'Ingen anledning registrerad'}</td>
              </tr>
            ))}
          </AdminTable>
          <AdminPagination page={page} hasNext={(count || 0) > to + 1} basePath="/admin/audit" query={urlQuery} />
        </>
      )}
    </main>
  )
}
