import Link from 'next/link'
import { requireAdminPermission } from '@/lib/admin-auth'
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
  type AdminSearchParams,
  formatDate,
  getPage,
  getParam,
  pageRange,
  queryToUrlSearchParams,
  statusTone,
} from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default async function AdminModerationPage({
  searchParams,
}: {
  searchParams: AdminSearchParams
}) {
  const params = await searchParams
  const q = getParam(params, 'q')
  const queue = getParam(params, 'queue') || 'pending'
  const severity = getParam(params, 'severity')
  const page = getPage(params)
  const { from, to } = pageRange(page)
  const { adminClient, permissions } = await requireAdminPermission('moderation.read')

  let query = adminClient
    .from('marketplace_listings')
    .select('id,title,seller_name,seller_type,country_code,city,status,review_status,risk_score,risk_flags,created_at,updated_at', { count: 'exact' })
    .order('risk_score', { ascending: false })
    .order('created_at', { ascending: true })
    .range(from, to)

  if (queue === 'risk') query = query.gt('risk_score', 0)
  else if (queue === 'flagged') query = query.eq('review_status', 'flagged')
  else if (queue === 'rejected') query = query.eq('review_status', 'rejected')
  else query = query.eq('review_status', 'pending_review')

  if (severity === 'high') query = query.gte('risk_score', 50)
  if (severity === 'medium') query = query.gte('risk_score', 20).lt('risk_score', 50)
  if (severity === 'low') query = query.lt('risk_score', 20)
  if (q) {
    const escaped = q.replace(/[%_,]/g, '')
    query = query.or(`title.ilike.%${escaped}%,seller_name.ilike.%${escaped}%`)
  }

  const { data: listings, count, error } = await query
  const urlQuery = queryToUrlSearchParams(params)

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader
        eyebrow="Trust & safety"
        title="Modereringskö"
        description="Prioriterad serverbaserad kö för väntande, flaggade och riskklassade annonser. Äldsta och mest riskfyllda objekt visas först."
      />
      <div className="mb-5 flex justify-end">
        <Link href="/admin/moderation/cases" className="rounded-[10px] border border-[#d7deea] bg-white px-4 py-2 text-sm font-bold text-[#344054]">
          Visa modereringsärenden
        </Link>
      </div>

      <AdminFilters search={q} searchPlaceholder="Sök annons eller säljare">
        <FilterSelect
          name="queue"
          value={queue}
          label="Kö"
          options={[
            { value: 'pending', label: 'Väntar granskning' },
            { value: 'flagged', label: 'Flaggade' },
            { value: 'risk', label: 'Risksignaler' },
            { value: 'rejected', label: 'Avslagna' },
          ]}
        />
        <FilterSelect
          name="severity"
          value={severity}
          label="Risknivå"
          options={[
            { value: 'high', label: 'Hög (50+)' },
            { value: 'medium', label: 'Medel (20–49)' },
            { value: 'low', label: 'Låg (0–19)' },
          ]}
        />
      </AdminFilters>

      {error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
          Modereringskön kunde inte laddas: {error.message}
        </div>
      ) : !listings?.length ? (
        <AdminEmpty text="Kön är tom för valt filter." />
      ) : (
        <>
          <AdminTable columns={['Annons', 'Säljare', 'Risk', 'Signaler', 'Status', 'Väntat', 'Åtgärd']}>
            {listings.map((listing) => (
              <tr key={listing.id} className="align-top hover:bg-[#f8fafc]">
                <td className="px-4 py-4">
                  <Link href={`/admin/listings/${listing.id}`} className="font-bold text-[#101828] hover:text-[#0866ff]">
                    {listing.title}
                  </Link>
                  <p className="mt-1 text-xs text-[#667085]">{listing.city || 'Saknas'}, {listing.country_code}</p>
                </td>
                <td className="px-4 py-4 text-[#475467]">
                  <p className="font-semibold">{listing.seller_name}</p>
                  <p className="mt-1 text-xs">{listing.seller_type}</p>
                </td>
                <td className="px-4 py-4">
                  <Badge label={String(listing.risk_score || 0)} tone={Number(listing.risk_score) >= 50 ? 'red' : Number(listing.risk_score) >= 20 ? 'amber' : 'gray'} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex max-w-[260px] flex-wrap gap-1.5">
                    {(listing.risk_flags || []).slice(0, 4).map((flag: string) => <Badge key={flag} label={flag.replaceAll('_', ' ')} tone="amber" />)}
                    {!listing.risk_flags?.length ? <span className="text-xs text-[#98a2b3]">Inga automatiska flaggor</span> : null}
                  </div>
                </td>
                <td className="px-4 py-4"><div className="flex flex-wrap gap-2"><Badge label={listing.status} tone={statusTone(listing.status)} /><Badge label={listing.review_status} tone={statusTone(listing.review_status)} /></div></td>
                <td className="px-4 py-4 text-[#667085]">{formatDate(listing.created_at)}</td>
                <td className="px-4 py-4">
                  {permissions.includes('moderation.manage') ? (
                    <AdminEntityActions
                      endpoint={`/api/admin/marketplace-listings/${listing.id}`}
                      actions={[
                        { action: 'approve', label: 'Godkänn' },
                        { action: 'request_info', label: 'Begär info', requiresReason: true },
                        { action: 'reject', label: 'Avslå', tone: 'danger', requiresReason: true },
                      ]}
                    />
                  ) : <span className="text-xs text-[#98a2b3]">Endast läsning</span>}
                </td>
              </tr>
            ))}
          </AdminTable>
          <AdminPagination page={page} hasNext={(count || 0) > to + 1} basePath="/admin/moderation" query={urlQuery} />
        </>
      )}
    </main>
  )
}
