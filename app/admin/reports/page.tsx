import Link from 'next/link'
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

export default async function AdminReportsPage({
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
    .from('marketplace_reports')
    .select('id,listing_id,category,details,contact_email,status,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (q) {
    const escaped = q.replace(/[%_,]/g, '')
    query = query.or(`category.ilike.%${escaped}%,details.ilike.%${escaped}%,contact_email.ilike.%${escaped}%`)
  }

  const { data: reports, count } = await query
  const urlQuery = queryToUrlSearchParams(params)

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Trust & safety"
        title="Rapporter"
        description="Granska misstänkta annonser, missbruk, bedrägeriförsök och felaktiga uppgifter."
      />
      <AdminFilters search={q} searchPlaceholder="Sök rapport, e-post eller beskrivning">
        <FilterSelect
          name="status"
          value={status}
          label="Status"
          options={[
            { value: 'new', label: 'Ny' },
            { value: 'reviewing', label: 'Granskas' },
            { value: 'actioned', label: 'Åtgärdad' },
            { value: 'closed', label: 'Stängd' },
          ]}
        />
      </AdminFilters>

      {!reports?.length ? (
        <AdminEmpty text="Inga rapporter matchar filtret." />
      ) : (
        <>
          <AdminTable columns={['Rapport', 'Annons', 'Kontakt', 'Status', 'Skapad', 'Actions']}>
            {reports.map((report) => (
              <tr key={report.id} className="align-top hover:bg-[#f8fafc]">
                <td className="px-4 py-4">
                  <p className="font-bold">{report.category}</p>
                  <p className="mt-1 max-w-xl text-sm text-[#475467]">{report.details}</p>
                </td>
                <td className="px-4 py-4">
                  {report.listing_id ? (
                    <Link href={`/admin/listings/${report.listing_id}`} className="font-bold text-[#0866ff]">
                      Öppna annons
                    </Link>
                  ) : (
                    <span className="text-[#667085]">Saknas</span>
                  )}
                </td>
                <td className="px-4 py-4 text-[#475467]">{report.contact_email || 'Saknas'}</td>
                <td className="px-4 py-4">
                  <Badge label={report.status || 'new'} tone={statusTone(report.status || 'new')} />
                </td>
                <td className="px-4 py-4 text-[#667085]">{formatDate(report.created_at)}</td>
                <td className="px-4 py-4">
                  <AdminEntityActions
                    endpoint={`/api/admin/reports/${report.id}`}
                    actions={[
                      { action: 'reviewing', label: 'Granska' },
                      { action: 'actioned', label: 'Åtgärdad', requiresReason: true },
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
            basePath="/admin/reports"
            query={urlQuery}
          />
        </>
      )}
    </main>
  )
}
