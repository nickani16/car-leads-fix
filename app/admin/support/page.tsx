import { requireAdmin } from '@/lib/admin-auth'
import AdminEntityActions from '../AdminEntityActions'
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
  AdminSearchParams,
  formatDate,
  getPage,
  getParam,
  pageRange,
  queryToUrlSearchParams,
  statusTone,
} from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: AdminSearchParams
}) {
  const params = await searchParams
  const q = getParam(params, 'q')
  const status = getParam(params, 'status')
  const page = getPage(params)
  const { from, to } = pageRange(page)
  const { adminClient } = await requireAdmin()

  let query = adminClient
    .from('admin_support_cases')
    .select('id,subject,status,priority,customer_email,category,description,created_at,updated_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (q) {
    const escaped = q.replace(/[%_,]/g, '')
    query = query.or(`subject.ilike.%${escaped}%,customer_email.ilike.%${escaped}%,category.ilike.%${escaped}%,description.ilike.%${escaped}%`)
  }

  const { data: cases, count } = await query
  const urlQuery = queryToUrlSearchParams(params)

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Kundsupport"
        title="Support"
        description="Öppna ärenden, ändra status och koppla ärenden till användare eller annonser."
      />
      <AdminFilters search={q} searchPlaceholder="Sök ämne, kund, kategori eller beskrivning">
        <FilterSelect
          name="status"
          value={status}
          label="Status"
          options={[
            { value: 'new', label: 'Nytt' },
            { value: 'in_progress', label: 'Pågående' },
            { value: 'waiting_customer', label: 'Väntar på kund' },
            { value: 'resolved', label: 'Löst' },
            { value: 'closed', label: 'Stängt' },
          ]}
        />
      </AdminFilters>

      {!cases?.length ? (
        <AdminEmpty text="Inga supportärenden hittades. Kör Supabase-migrationen för supporttabellen om detta är första versionen av adminpanelen." />
      ) : (
        <>
          <AdminTable columns={['Ärende', 'Kund', 'Prioritet', 'Status', 'Uppdaterad', 'Actions']}>
            {cases.map((supportCase) => (
              <tr key={supportCase.id} className="align-top hover:bg-[#f8fafc]">
                <td className="px-4 py-4">
                  <p className="font-bold">{supportCase.subject}</p>
                  <p className="mt-1 max-w-xl text-sm text-[#475467]">{supportCase.description}</p>
                </td>
                <td className="px-4 py-4 text-[#475467]">{supportCase.customer_email || 'Saknas'}</td>
                <td className="px-4 py-4">
                  <Badge label={supportCase.priority || 'normal'} tone="gray" />
                </td>
                <td className="px-4 py-4">
                  <Badge label={supportCase.status || 'new'} tone={statusTone(supportCase.status || 'new')} />
                </td>
                <td className="px-4 py-4 text-[#667085]">{formatDate(supportCase.updated_at || supportCase.created_at)}</td>
                <td className="px-4 py-4">
                  <AdminEntityActions
                    endpoint={`/api/admin/support/${supportCase.id}`}
                    actions={[
                      { action: 'in_progress', label: 'Pågående' },
                      { action: 'waiting_customer', label: 'Väntar kund' },
                      { action: 'resolved', label: 'Löst', requiresReason: true },
                      { action: 'closed', label: 'Stäng', requiresReason: true },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </AdminTable>
          <AdminPagination
            page={page}
            hasNext={(count || 0) > to + 1}
            basePath="/admin/support"
            query={urlQuery}
          />
        </>
      )}
    </main>
  )
}
