import { requireAdmin } from '@/lib/admin-auth'
import { AdminPageHeader, AdminStatCard, AdminTable, Badge } from '../AdminUI'
import { categoryLabel, formatNumber, statusTone } from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default async function AdminStatsPage() {
  const { adminClient } = await requireAdmin()
  const [{ data: listings }, { data: profiles }, { data: reports }] = await Promise.all([
    adminClient.from('marketplace_listings').select('category,status,country_code,created_at'),
    adminClient.from('marketplace_profiles').select('account_type,country_code,risk_status,created_at'),
    adminClient.from('marketplace_reports').select('status,category,created_at'),
  ])

  const listingRows = new Map<string, { total: number; published: number; flagged: number }>()
  ;(listings || []).forEach((listing) => {
    const key = listing.category || 'unknown'
    const row = listingRows.get(key) || { total: 0, published: 0, flagged: 0 }
    row.total += 1
    if (listing.status === 'published') row.published += 1
    if (listing.status === 'paused' || listing.status === 'rejected') row.flagged += 1
    listingRows.set(key, row)
  })

  const business = (profiles || []).filter((profile) => profile.account_type === 'business').length
  const privateCount = (profiles || []).filter((profile) => profile.account_type === 'private').length
  const blocked = (profiles || []).filter((profile) => profile.risk_status === 'blocked').length
  const openReports = (reports || []).filter((report) => ['new', 'reviewing'].includes(report.status || '')).length

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Data"
        title="Statistik"
        description="Snabb operativ statistik för Autorells marketplace. Inga tunga diagram, bara beslutsbar överblick."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Totala annonser" value={formatNumber(listings?.length || 0)} />
        <AdminStatCard label="Företag" value={formatNumber(business)} />
        <AdminStatCard label="Privatpersoner" value={formatNumber(privateCount)} />
        <AdminStatCard label="Öppna rapporter" value={formatNumber(openReports)} />
        <AdminStatCard label="Spärrade konton" value={formatNumber(blocked)} />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-black">Annonser per kategori</h2>
        <AdminTable columns={['Kategori', 'Totalt', 'Publicerade', 'Pausade/avvisade']}>
          {Array.from(listingRows.entries()).map(([category, row]) => (
            <tr key={category} className="hover:bg-[#f8fafc]">
              <td className="px-4 py-4 font-bold">{categoryLabel(category)}</td>
              <td className="px-4 py-4">{formatNumber(row.total)}</td>
              <td className="px-4 py-4">
                <Badge label={formatNumber(row.published)} tone={statusTone('published')} />
              </td>
              <td className="px-4 py-4">
                <Badge label={formatNumber(row.flagged)} tone={row.flagged ? 'amber' : 'gray'} />
              </td>
            </tr>
          ))}
        </AdminTable>
      </section>
    </main>
  )
}
