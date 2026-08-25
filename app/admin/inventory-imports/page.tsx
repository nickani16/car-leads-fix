import Link from 'next/link'
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
  formatNumber,
  getPage,
  getParam,
  pageRange,
  queryToUrlSearchParams,
  statusTone,
} from '../admin-helpers'

export const dynamic = 'force-dynamic'

const countryOptions = [
  ['AT', 'Österrike'], ['BE', 'Belgien'], ['DE', 'Tyskland'], ['DK', 'Danmark'],
  ['ES', 'Spanien'], ['FI', 'Finland'], ['FR', 'Frankrike'], ['IT', 'Italien'],
  ['NL', 'Nederländerna'], ['PL', 'Polen'], ['SE', 'Sverige'],
].map(([value, label]) => ({ value, label }))

export default async function AdminInventoryImportsPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const params = await searchParams
  const q = getParam(params, 'q')
  const status = getParam(params, 'status')
  const verification = getParam(params, 'verification')
  const sourceType = getParam(params, 'sourceType')
  const country = getParam(params, 'country').toUpperCase()
  const page = getPage(params)
  const { from, to } = pageRange(page)
  const { adminClient } = await requireAdminPermission('inventory_imports.read')

  let matchingCompanyIds: string[] | null = null
  if (q || country) {
    let companyQuery = adminClient.from('marketplace_companies').select('id').limit(500)
    if (country) companyQuery = companyQuery.eq('country_code', country)
    if (q) {
      const escaped = q.replace(/[%_,]/g, '')
      companyQuery = companyQuery.or(`name.ilike.%${escaped}%,registration_number.ilike.%${escaped}%,website_url.ilike.%${escaped}%`)
    }
    const { data } = await companyQuery
    matchingCompanyIds = (data || []).map((company) => String(company.id))
  }

  let sources: Array<Record<string, unknown>> = []
  let count = 0
  if (!(country && matchingCompanyIds?.length === 0)) {
    let query = adminClient
      .from('dealer_import_sources')
      .select('id,organization_id,pilot_program_id,name,source_type,website_url,inventory_url,feed_url,verification_status,sync_status,discovered_count,published_count,error_count,last_success_at,next_sync_at,last_error,created_at', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status) query = query.eq('sync_status', status)
    if (verification) query = query.eq('verification_status', verification)
    if (sourceType) query = query.eq('source_type', sourceType)
    if (country && matchingCompanyIds?.length) query = query.in('organization_id', matchingCompanyIds)
    if (q) {
      const escaped = q.replace(/[%_,]/g, '')
      const parts = [
        `name.ilike.%${escaped}%`,
        `website_url.ilike.%${escaped}%`,
        `inventory_url.ilike.%${escaped}%`,
        `feed_url.ilike.%${escaped}%`,
      ]
      if (matchingCompanyIds?.length) parts.push(`organization_id.in.(${matchingCompanyIds.join(',')})`)
      query = query.or(parts.join(','))
    }
    const result = await query
    sources = (result.data || []) as Array<Record<string, unknown>>
    count = result.count || 0
  }

  const companyIds = [...new Set(sources.map((source) => String(source.organization_id)).filter(Boolean))]
  const pilotIds = [...new Set(sources.map((source) => String(source.pilot_program_id || '')).filter(Boolean))]
  const [{ data: companies }, { data: pilots }] = await Promise.all([
    companyIds.length
      ? adminClient.from('marketplace_companies').select('id,name,country_code').in('id', companyIds)
      : Promise.resolve({ data: [] }),
    pilotIds.length
      ? adminClient.from('business_pilot_programs').select('id,status').in('id', pilotIds)
      : Promise.resolve({ data: [] }),
  ])
  const companyById = new Map((companies || []).map((company) => [String(company.id), company]))
  const pilotById = new Map((pilots || []).map((pilot) => [String(pilot.id), String(pilot.status)]))
  const urlQuery = queryToUrlSearchParams(params)

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Dealer operations"
        title="Lagerimporter"
        description="Verifiering, importkvalitet, synkstatus och fel för alla företagsanslutningar. Ingen källa publiceras utan registrerade rättigheter och separat godkännande."
      />

      <AdminFilters search={q} searchPlaceholder="Sök företag, källa, domän eller feed">
        <FilterSelect name="status" value={status} label="Synkstatus" options={[
          { value: 'draft', label: 'Utkast' }, { value: 'analyzing', label: 'Analyserar' },
          { value: 'ready', label: 'Klar' }, { value: 'active', label: 'Aktiv' },
          { value: 'paused', label: 'Pausad' }, { value: 'error', label: 'Fel' },
          { value: 'disabled', label: 'Stoppad' },
        ]} />
        <FilterSelect name="verification" value={verification} label="Verifiering" options={[
          { value: 'unverified', label: 'Ej verifierad' }, { value: 'pending', label: 'Väntar' },
          { value: 'verified', label: 'Verifierad' }, { value: 'failed', label: 'Misslyckad' },
          { value: 'manual_review', label: 'Manuell granskning' },
        ]} />
        <FilterSelect name="sourceType" value={sourceType} label="Metod" options={[
          { value: 'website', label: 'Webbplats' }, { value: 'xml', label: 'XML' },
          { value: 'csv', label: 'CSV' }, { value: 'api', label: 'API' }, { value: 'dms', label: 'DMS' },
        ]} />
        <FilterSelect name="country" value={country} label="Land" options={countryOptions} />
      </AdminFilters>

      {!sources.length ? <AdminEmpty text="Inga lagerimporter matchar filtret." /> : (
        <>
          <div className="mb-3 text-sm text-[#667085]">{formatNumber(count)} importkällor</div>
          <AdminTable columns={['Företag', 'Källa', 'Pilot', 'Verifiering', 'Synk', 'Fordon', 'Senaste / nästa', 'Senaste fel', '']}>
            {sources.map((source) => {
              const company = companyById.get(String(source.organization_id))
              const sourceUrl = String(source.inventory_url || source.feed_url || source.website_url || '')
              return (
                <tr key={String(source.id)} className="align-top hover:bg-[#f8fafc]">
                  <td className="px-4 py-4">
                    <p className="font-bold text-[#101828]">{String(company?.name || source.organization_id)}</p>
                    <p className="mt-1 text-xs text-[#667085]">{String(company?.country_code || '--')}</p>
                  </td>
                  <td className="max-w-[260px] px-4 py-4">
                    <Link href={`/admin/inventory-imports/${String(source.id)}`} className="font-bold text-[#101828] hover:text-[#0866ff]">{String(source.name)}</Link>
                    <p className="mt-1 truncate text-xs text-[#667085]">{String(source.source_type).toUpperCase()} · {sourceUrl || 'Ingen URL'}</p>
                  </td>
                  <td className="px-4 py-4"><Badge label={pilotById.get(String(source.pilot_program_id)) || 'Ingen pilot'} tone={source.pilot_program_id ? 'blue' : 'gray'} /></td>
                  <td className="px-4 py-4"><Badge label={verificationLabel(String(source.verification_status))} tone={statusTone(String(source.verification_status))} /></td>
                  <td className="px-4 py-4"><Badge label={syncLabel(String(source.sync_status))} tone={statusTone(String(source.sync_status))} /></td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#475467]">{formatNumber(Number(source.discovered_count || 0))} hittade<br />{formatNumber(Number(source.published_count || 0))} publicerade<br />{formatNumber(Number(source.error_count || 0))} fel</td>
                  <td className="whitespace-nowrap px-4 py-4 text-xs text-[#475467]">{formatDate(source.last_success_at ? String(source.last_success_at) : null)}<br />{formatDate(source.next_sync_at ? String(source.next_sync_at) : null)}</td>
                  <td className="max-w-[240px] px-4 py-4 text-xs text-red-700"><span className="line-clamp-3">{String(source.last_error || '–')}</span></td>
                  <td className="px-4 py-4"><Link href={`/admin/inventory-imports/${String(source.id)}`} className="inline-flex min-h-9 items-center rounded-[8px] border border-[#d7deea] bg-white px-3 text-xs font-bold text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]">Öppna</Link></td>
                </tr>
              )
            })}
          </AdminTable>
          <AdminPagination page={page} hasNext={sources.length === to - from + 1} basePath="/admin/inventory-imports" query={urlQuery} />
        </>
      )}
    </main>
  )
}

function syncLabel(status: string) {
  return ({ draft: 'Utkast', analyzing: 'Analyserar', ready: 'Klar', active: 'Aktiv', paused: 'Pausad', error: 'Fel', disabled: 'Stoppad', deleted: 'Borttagen' } as Record<string, string>)[status] || status
}

function verificationLabel(status: string) {
  return ({ unverified: 'Ej verifierad', pending: 'Väntar', verified: 'Verifierad', failed: 'Misslyckad', manual_review: 'Manuell granskning' } as Record<string, string>)[status] || status
}
