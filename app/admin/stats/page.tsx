import { requireAdminPermission } from '@/lib/admin-auth'
import { marketplaceCategories } from '@/lib/marketplace'
import { AdminPageHeader, AdminStatCard, AdminTable, Badge } from '../AdminUI'
import { categoryLabel, formatNumber, statusTone } from '../admin-helpers'

export const dynamic = 'force-dynamic'

type CountResult = {
  count: number | null
}

function readCount(result: CountResult) {
  return result.count || 0
}

export default async function AdminStatsPage() {
  const { adminClient } = await requireAdminPermission('analytics.read')
  const [
    listingsTotalResult,
    businessResult,
    privateResult,
    blockedResult,
    openReportsResult,
    paidOrdersResult,
    activeSubscriptionsResult,
    newsletterSubscribersResult,
    openSupportResult,
    highRiskEventsResult,
    categoryRows,
  ] = await Promise.all([
    adminClient.from('marketplace_listings').select('id', { count: 'estimated', head: true }),
    adminClient
      .from('marketplace_profiles')
      .select('user_id', { count: 'estimated', head: true })
      .eq('account_type', 'business'),
    adminClient
      .from('marketplace_profiles')
      .select('user_id', { count: 'estimated', head: true })
      .eq('account_type', 'private'),
    adminClient
      .from('marketplace_profiles')
      .select('user_id', { count: 'estimated', head: true })
      .eq('risk_status', 'blocked'),
    adminClient
      .from('marketplace_reports')
      .select('id', { count: 'estimated', head: true })
      .in('status', ['new', 'reviewing']),
    adminClient.from('payment_orders').select('id', { count: 'estimated', head: true }).in('status', ['paid', 'fulfilled']),
    adminClient.from('business_subscriptions').select('id', { count: 'estimated', head: true }).in('status', ['active', 'trialing']),
    adminClient.from('newsletter_subscribers').select('id', { count: 'estimated', head: true }).eq('status', 'subscribed'),
    adminClient.from('support_tickets').select('id', { count: 'estimated', head: true }).in('status', ['open', 'waiting_internal']),
    adminClient.from('security_events').select('id', { count: 'estimated', head: true }).in('severity', ['high', 'critical']),
    Promise.all(
      marketplaceCategories.map(async (category) => {
        const [totalResult, publishedResult, flaggedResult] = await Promise.all([
          adminClient
            .from('marketplace_listings')
            .select('id', { count: 'estimated', head: true })
            .eq('category', category.slug),
          adminClient
            .from('marketplace_listings')
            .select('id', { count: 'estimated', head: true })
            .eq('category', category.slug)
            .eq('status', 'published'),
          adminClient
            .from('marketplace_listings')
            .select('id', { count: 'estimated', head: true })
            .eq('category', category.slug)
            .in('status', ['paused', 'rejected']),
        ])

        return {
          category: category.slug,
          total: readCount(totalResult),
          published: readCount(publishedResult),
          flagged: readCount(flaggedResult),
        }
      }),
    ),
  ])

  const listingsTotal = readCount(listingsTotalResult)
  const business = readCount(businessResult)
  const privateCount = readCount(privateResult)
  const blocked = readCount(blockedResult)
  const openReports = readCount(openReportsResult)
  const paidOrders = readCount(paidOrdersResult)
  const activeSubscriptions = readCount(activeSubscriptionsResult)
  const newsletterSubscribers = readCount(newsletterSubscribersResult)
  const openSupport = readCount(openSupportResult)
  const highRiskEvents = readCount(highRiskEventsResult)
  const visibleCategoryRows = categoryRows.filter(
    (row) => row.total > 0 || row.published > 0 || row.flagged > 0,
  )

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Data"
        title="Statistik"
        description="Snabb operativ statistik för Autorells marketplace. Inga tunga diagram, bara beslutsbar överblick."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Totala annonser" value={formatNumber(listingsTotal)} />
        <AdminStatCard label="Företag" value={formatNumber(business)} />
        <AdminStatCard label="Privatpersoner" value={formatNumber(privateCount)} />
        <AdminStatCard label="Öppna rapporter" value={formatNumber(openReports)} />
        <AdminStatCard label="Spärrade konton" value={formatNumber(blocked)} />
        <AdminStatCard label="Betalda order" value={formatNumber(paidOrders)} />
        <AdminStatCard label="Aktiva abonnemang" value={formatNumber(activeSubscriptions)} />
        <AdminStatCard label="Nyhetsbrevsprenumeranter" value={formatNumber(newsletterSubscribers)} />
        <AdminStatCard label="Öppna supportärenden" value={formatNumber(openSupport)} />
        <AdminStatCard label="Högriskhändelser" value={formatNumber(highRiskEvents)} />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-black">Annonser per kategori</h2>
        <AdminTable columns={['Kategori', 'Totalt', 'Publicerade', 'Pausade/avvisade']}>
          {visibleCategoryRows.map((row) => (
            <tr key={row.category} className="hover:bg-[#f8fafc]">
              <td className="px-4 py-4 font-bold">{categoryLabel(row.category)}</td>
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
