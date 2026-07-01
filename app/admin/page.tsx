import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import {
  AdminPageHeader,
  AdminStatCard,
  AdminTable,
  Badge,
} from './AdminUI'
import { categoryLabel, formatDate, formatNumber, statusTone } from './admin-helpers'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const { adminClient } = await requireAdmin()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    listings,
    users,
    companies,
    privateUsers,
    newToday,
    reports,
    support,
    latestListings,
  ] = await Promise.all([
    adminClient.from('marketplace_listings').select('id', { count: 'exact', head: true }),
    adminClient.from('marketplace_profiles').select('user_id', { count: 'exact', head: true }),
    adminClient
      .from('marketplace_profiles')
      .select('user_id', { count: 'exact', head: true })
      .eq('account_type', 'business'),
    adminClient
      .from('marketplace_profiles')
      .select('user_id', { count: 'exact', head: true })
      .eq('account_type', 'private'),
    adminClient
      .from('marketplace_listings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
    adminClient
      .from('marketplace_reports')
      .select('id', { count: 'exact', head: true })
      .in('status', ['new', 'reviewing', 'in_progress']),
    adminClient
      .from('admin_support_cases')
      .select('id', { count: 'exact', head: true })
      .in('status', ['new', 'in_progress', 'waiting_customer']),
    adminClient
      .from('marketplace_listings')
      .select('id,title,category,status,review_status,country_code,city,created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Autorell admin"
        title="Kontrollcenter"
        description="Överblick över användare, företag, annonser, rapporter och supportärenden. Annonser publiceras utan manuell kö, men kan granskas, flaggas och tas bort härifrån."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Annonser" value={formatNumber(listings.count)} helper="Alla statusar" />
        <AdminStatCard label="Användare" value={formatNumber(users.count)} helper="Registrerade konton" />
        <AdminStatCard label="Företag" value={formatNumber(companies.count)} helper="Business-konton" />
        <AdminStatCard label="Privatpersoner" value={formatNumber(privateUsers.count)} helper="Privata konton" />
        <AdminStatCard label="Nya annonser idag" value={formatNumber(newToday.count)} helper="Skapade sedan midnatt" />
        <AdminStatCard label="Rapporterade annonser" value={formatNumber(reports.count)} helper="Öppna rapporter" />
        <AdminStatCard label="Support väntar" value={formatNumber(support.count)} helper="Aktiva ärenden" />
        <AdminStatCard label="Moderering" value="Live" helper="Efterhandskontroll" />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Senaste annonser</h2>
          <Link href="/admin/listings" className="text-sm font-bold text-[#0866ff]">
            Visa alla
          </Link>
        </div>
        <AdminTable columns={['Annons', 'Kategori', 'Plats', 'Status', 'Skapad']}>
          {(latestListings.data || []).map((listing) => (
            <tr key={listing.id} className="hover:bg-[#f8fafc]">
              <td className="px-4 py-4">
                <Link href={`/admin/listings/${listing.id}`} className="font-bold text-[#101828] hover:text-[#0866ff]">
                  {listing.title}
                </Link>
              </td>
              <td className="px-4 py-4 text-[#475467]">{categoryLabel(listing.category)}</td>
              <td className="px-4 py-4 text-[#475467]">
                {listing.city || 'Saknas'}, {listing.country_code || '--'}
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Badge label={listing.status || 'okänd'} tone={statusTone(listing.status)} />
                  <Badge label={listing.review_status || 'ej satt'} tone={statusTone(listing.review_status)} />
                </div>
              </td>
              <td className="px-4 py-4 text-[#667085]">{formatDate(listing.created_at)}</td>
            </tr>
          ))}
        </AdminTable>
      </section>
    </main>
  )
}
