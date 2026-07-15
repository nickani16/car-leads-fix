import Link from 'next/link'
import {
  AlertTriangle,
  BellRing,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Flag,
  ListChecks,
  ShieldAlert,
  UsersRound,
  Webhook,
} from 'lucide-react'
import { requireAdminPermission } from '@/lib/admin-auth'
import { AdminPageHeader, AdminTable, Badge } from './AdminUI'
import { categoryLabel, formatDate, formatNumber, statusTone } from './admin-helpers'

export const dynamic = 'force-dynamic'

type DashboardSearchParams = Promise<{
  range?: string
  country?: string
  seller?: string
}>

function rangeStart(value: string) {
  const days = value === 'today' ? 0 : value === '30d' ? 30 : 7
  const date = new Date()
  if (days === 0) date.setHours(0, 0, 0, 0)
  else date.setDate(date.getDate() - days)
  return date.toISOString()
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams
}) {
  const { adminClient, permissions, accessSource } = await requireAdminPermission('dashboard.view')
  const params = await searchParams
  const range = ['today', '7d', '30d'].includes(params.range || '') ? params.range! : '7d'
  const country = String(params.country || '').toUpperCase()
  const seller = params.seller === 'private' || params.seller === 'business' ? params.seller : ''
  const from = rangeStart(range)
  const now = new Date()
  const nowIso = now.toISOString()
  const sevenDaysAhead = new Date(now)
  sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7)
  const inSevenDays = sevenDaysAhead.toISOString()
  const canReadListings = permissions.includes('listings.read')
  const canReadModeration = permissions.includes('moderation.read')
  const canReadUsers = permissions.includes('users.read')
  const canReadCompanies = permissions.includes('companies.read')
  const canReadReports = permissions.includes('reports.read')
  const canReadPayments = permissions.includes('payments.read')
  const canReadSubscriptions = permissions.includes('subscriptions.read')
  const canReadSecurity = permissions.includes('security.read')
  const canReadSystem = permissions.includes('system.read')
  const emptyCount = () => Promise.resolve({ count: null, error: null })
  const unreadNotifications = await adminClient
    .from('admin_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'unread')

  function listingCount() {
    let query = adminClient.from('marketplace_listings').select('id', { count: 'exact', head: true })
    if (country) query = query.eq('country_code', country)
    if (seller) query = query.eq('seller_type', seller)
    return query
  }

  const [
    activeListings,
    pendingListings,
    rejectedListings,
    newUsers,
    pendingCompanies,
    openReports,
    failedPayments,
    paidPayments,
    activeSubscriptions,
    expiringListings,
    suspiciousEvents,
    failedWebhooks,
    latestListings,
    latestAudit,
  ] = await Promise.all([
    canReadListings ? listingCount().eq('status', 'published') : emptyCount(),
    canReadModeration ? listingCount().eq('review_status', 'pending_review') : emptyCount(),
    canReadModeration ? listingCount().eq('review_status', 'rejected').gte('updated_at', from) : emptyCount(),
    canReadUsers ? adminClient.from('marketplace_profiles').select('user_id', { count: 'exact', head: true }).gte('created_at', from) : emptyCount(),
    canReadCompanies ? adminClient.from('marketplace_companies').select('id', { count: 'exact', head: true }).in('verification_status', ['pending_review', 'submitted', 'under_review']) : emptyCount(),
    canReadReports ? adminClient.from('marketplace_reports').select('id', { count: 'exact', head: true }).in('status', ['new', 'reviewing', 'investigating']) : emptyCount(),
    canReadPayments ? adminClient.from('payment_orders').select('id', { count: 'exact', head: true }).in('status', ['failed', 'expired']).gte('updated_at', from) : emptyCount(),
    canReadPayments ? adminClient.from('payment_orders').select('id', { count: 'exact', head: true }).in('status', ['paid', 'fulfilled']).gte('updated_at', from) : emptyCount(),
    canReadSubscriptions ? adminClient.from('business_subscriptions').select('id', { count: 'exact', head: true }).in('status', ['active', 'trialing']) : emptyCount(),
    canReadListings ? listingCount().eq('status', 'published').gte('expires_at', nowIso).lte('expires_at', inSevenDays) : emptyCount(),
    canReadModeration || canReadSecurity ? adminClient.from('marketplace_listing_risk_events').select('id', { count: 'exact', head: true }).in('severity', ['high', 'critical']).gte('created_at', from) : emptyCount(),
    canReadSystem ? adminClient.from('stripe_webhook_events').select('stripe_event_id', { count: 'exact', head: true }).eq('processing_status', 'failed').gte('received_at', from) : emptyCount(),
    canReadListings
      ? adminClient.from('marketplace_listings').select('id,title,category,status,review_status,country_code,city,risk_score,created_at').order('created_at', { ascending: false }).limit(7)
      : Promise.resolve({ data: [] }),
    permissions.includes('audit.read')
      ? adminClient.from('admin_audit_log').select('id,action,target_type,target_id,actor_role,created_at').order('created_at', { ascending: false }).limit(6)
      : Promise.resolve({ data: [] }),
  ])

  const metrics = [
    { label: 'Olästa adminnotiser', value: unreadNotifications.count, helper: 'Gemensam operativ kö', href: '/admin/notifications', icon: BellRing, tone: unreadNotifications.count ? 'amber' as const : 'green' as const },
    ...(canReadListings ? [{ label: 'Aktiva annonser', value: activeListings.count, helper: 'Publicerade nu', href: '/admin/listings?status=published', icon: ListChecks, tone: 'blue' as const }] : []),
    ...(canReadModeration ? [{ label: 'Väntar granskning', value: pendingListings.count, helper: 'Moderationskö', href: '/admin/moderation', icon: Clock3, tone: pendingListings.count ? 'amber' as const : 'green' as const }] : []),
    ...(canReadUsers ? [{ label: 'Nya användare', value: newUsers.count, helper: range === 'today' ? 'I dag' : `Senaste ${range.replace('d', '')} dagarna`, href: '/admin/users', icon: UsersRound, tone: 'blue' as const }] : []),
    ...(canReadCompanies ? [{ label: 'Företag att verifiera', value: pendingCompanies.count, helper: 'Manuell kontroll', href: '/admin/companies/verification', icon: Building2, tone: pendingCompanies.count ? 'amber' as const : 'green' as const }] : []),
    ...(canReadReports ? [{ label: 'Öppna rapporter', value: openReports.count, helper: 'Trust & safety', href: '/admin/reports', icon: Flag, tone: openReports.count ? 'red' as const : 'green' as const }] : []),
    ...(canReadPayments ? [{ label: 'Misslyckade betalningar', value: failedPayments.count, helper: 'Valt intervall', href: '#system-status', icon: CircleDollarSign, tone: failedPayments.count ? 'red' as const : 'green' as const }] : []),
    ...(canReadListings ? [{ label: 'Annonser löper ut', value: expiringListings.count, helper: 'Inom sju dagar', href: '/admin/listings?status=published', icon: AlertTriangle, tone: expiringListings.count ? 'amber' as const : 'green' as const }] : []),
    ...(canReadModeration || canReadSecurity ? [{ label: 'Säkerhetssignaler', value: suspiciousEvents.count, helper: 'Hög eller kritisk risk', href: '/admin/moderation?queue=risk', icon: ShieldAlert, tone: suspiciousEvents.count ? 'red' as const : 'green' as const }] : []),
  ]

  const queryError = [
    activeListings,
    pendingListings,
    newUsers,
    pendingCompanies,
    openReports,
    failedPayments,
  ].some((result) => Boolean(result.error))

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <AdminPageHeader
          eyebrow="Operativ överblick"
          title="Kontrollcenter"
          description="Prioriterade köer, betalningssignaler och senaste aktivitet i hela Autorell. Alla värden hämtas serverbaserat."
        />
        <form method="get" className="grid grid-cols-2 gap-2 rounded-2xl border border-[#dce3ee] bg-white p-3 shadow-sm sm:flex">
          <select name="range" defaultValue={range} aria-label="Tidsintervall" className="h-10 rounded-xl border border-[#d7deea] bg-white px-3 text-sm">
            <option value="today">I dag</option>
            <option value="7d">7 dagar</option>
            <option value="30d">30 dagar</option>
          </select>
          <select name="country" defaultValue={country} aria-label="Marknad" className="h-10 rounded-xl border border-[#d7deea] bg-white px-3 text-sm">
            <option value="">Alla marknader</option>
            <option value="SE">Sverige</option>
            <option value="DE">Tyskland</option>
            <option value="DK">Danmark</option>
            <option value="NL">Nederländerna</option>
          </select>
          <select name="seller" defaultValue={seller} aria-label="Säljartyp" className="h-10 rounded-xl border border-[#d7deea] bg-white px-3 text-sm">
            <option value="">Alla säljare</option>
            <option value="private">Privat</option>
            <option value="business">Företag</option>
          </select>
          <button className="h-10 rounded-xl bg-[#0866ff] px-4 text-sm font-bold text-white">Uppdatera</button>
        </form>
      </div>

      {accessSource === 'legacy' ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <LockNotice />
          <div>
            <p className="font-bold">Legacy-åtkomst är aktiv</p>
            <p className="mt-1 leading-6">RBAC-migrationen är förberedd men inte applicerad. Nuvarande super-adminåtkomst bevaras tills produktionsändringen godkänns.</p>
          </div>
        </div>
      ) : null}

      {queryError ? (
        <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          Några dashboardvärden kunde inte hämtas. Inga nollvärden ska tolkas som bekräftad systemstatus innan datakällan svarar.
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, helper, href, icon: Icon, tone }) => (
          <Link key={label} href={href} className="group rounded-2xl border border-[#dce3ee] bg-white p-5 shadow-[0_8px_24px_rgba(16,24,40,.04)] transition hover:-translate-y-0.5 hover:border-[#b8cff5] hover:shadow-[0_14px_34px_rgba(16,24,40,.08)]">
            <div className="flex items-start justify-between gap-3">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone === 'red' ? 'bg-red-50 text-red-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-[#0866ff]'}`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <ArrowRight className="h-4 w-4 text-[#98a2b3] transition group-hover:translate-x-0.5 group-hover:text-[#0866ff]" />
            </div>
            <p className="mt-5 text-3xl font-black tracking-tight text-[#101828]">{formatNumber(value)}</p>
            <p className="mt-2 text-sm font-bold text-[#344054]">{label}</p>
            <p className="mt-1 text-xs text-[#667085]">{helper}</p>
          </Link>
        ))}
      </section>

      <div className="mt-7 grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)]">
        {canReadListings ? <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">Senaste annonser</h2>
              <p className="mt-1 text-xs text-[#667085]">Nya objekt som kan kräva operativ uppföljning.</p>
            </div>
            <Link href="/admin/listings" className="text-sm font-bold text-[#0866ff]">Visa alla</Link>
          </div>
          <AdminTable columns={['Annons', 'Plats', 'Risk', 'Status', 'Skapad']}>
            {(latestListings.data || []).map((listing) => (
              <tr key={listing.id} className="hover:bg-[#f8fafc]">
                <td className="px-4 py-4">
                  <Link href={`/admin/listings/${listing.id}`} className="font-bold text-[#101828] hover:text-[#0866ff]">{listing.title}</Link>
                  <p className="mt-1 text-xs text-[#667085]">{categoryLabel(listing.category)}</p>
                </td>
                <td className="px-4 py-4 text-[#475467]">{listing.city || 'Saknas'}, {listing.country_code || '--'}</td>
                <td className="px-4 py-4"><Badge label={String(listing.risk_score || 0)} tone={Number(listing.risk_score) >= 50 ? 'red' : Number(listing.risk_score) >= 20 ? 'amber' : 'gray'} /></td>
                <td className="px-4 py-4"><div className="flex flex-wrap gap-2"><Badge label={listing.status || 'okänd'} tone={statusTone(listing.status)} /><Badge label={listing.review_status || 'ej satt'} tone={statusTone(listing.review_status)} /></div></td>
                <td className="px-4 py-4 text-[#667085]">{formatDate(listing.created_at)}</td>
              </tr>
            ))}
          </AdminTable>
        </section> : (
          <section className="rounded-2xl border border-[#dce3ee] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black">Rollanpassad överblick</h2>
            <p className="mt-2 text-sm leading-6 text-[#667085]">Den här rollen har inga läsrättigheter till annonser. Dashboarden visar endast de datakällor som rollen uttryckligen får använda.</p>
          </section>
        )}

        <div className="space-y-6">
          <section id="system-status" className="rounded-2xl border border-[#dce3ee] bg-white p-5 shadow-sm">
            <h2 className="text-base font-black">Systemsignaler</h2>
            <div className="mt-4 space-y-3">
              <StatusRow label="Supabase dataåtkomst" ok={!queryError} detail={queryError ? 'Delvis fel' : 'Ansluten'} />
              {canReadSystem ? <StatusRow label="Stripe-webhookar" ok={!failedWebhooks.count} detail={failedWebhooks.count ? `${failedWebhooks.count} fel` : 'Inga fel i intervallet'} /> : null}
              {canReadPayments ? <StatusRow label="Betalningar" ok={!failedPayments.count} detail={`${formatNumber(paidPayments.count)} lyckade`} /> : null}
              {canReadSubscriptions ? <StatusRow label="Företagsabonnemang" ok detail={`${formatNumber(activeSubscriptions.count)} aktiva`} /> : null}
              {permissions.includes('support.read') ? <StatusRow label="Supportdatamodell" ok={false} detail="Ej driftsatt" neutral /> : null}
            </div>
          </section>

          {permissions.includes('audit.read') ? (
            <section className="rounded-2xl border border-[#dce3ee] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-black">Senaste adminaktivitet</h2>
                <Link href="/admin/audit" className="text-xs font-bold text-[#0866ff]">Audit-logg</Link>
              </div>
              <div className="mt-4 space-y-3">
                {(latestAudit.data || []).map((entry) => (
                  <article key={entry.id} className="border-l-2 border-[#dbeafe] pl-3">
                    <p className="text-sm font-bold text-[#344054]">{String(entry.action).replaceAll('_', ' ')}</p>
                    <p className="mt-1 text-xs text-[#667085]">{entry.actor_role} · {formatDate(entry.created_at)}</p>
                  </article>
                ))}
                {!latestAudit.data?.length ? <p className="text-sm text-[#667085]">Ingen aktivitet att visa.</p> : null}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {canReadModeration || canReadSystem ? (
        <p className="mt-7 text-xs text-[#667085]">
          {canReadModeration ? `${formatNumber(rejectedListings.count)} annonser avslogs` : null}
          {canReadModeration && canReadSystem ? ' och ' : null}
          {canReadSystem ? `${formatNumber(failedWebhooks.count)} webhookfel registrerades` : null} under valt intervall.
        </p>
      ) : null}
    </main>
  )
}

function LockNotice() {
  return <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
}

function StatusRow({ label, ok, detail, neutral = false }: { label: string; ok: boolean; detail: string; neutral?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f8fafc] px-3 py-3">
      <span className="flex items-center gap-2 text-sm font-semibold text-[#344054]">
        {neutral ? <Webhook className="h-4 w-4 text-[#98a2b3]" /> : ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
        {label}
      </span>
      <span className="text-right text-xs text-[#667085]">{detail}</span>
    </div>
  )
}
