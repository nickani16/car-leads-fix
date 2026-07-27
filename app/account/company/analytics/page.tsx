import { BarChart3, Eye, Heart, MessageCircle } from 'lucide-react'
import { CompanyPortalShell, LockedFeature, getCompanyPortalContext, planAllows } from '@/lib/company-portal'
import { getSellerInsights } from '@/lib/marketplace-insights'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { createAdminClient } from '@/lib/supabase/admin'

const baseCopy = {
  title: 'Company analytics',
  description: 'Track listing performance by period, category, market and team member without showing fabricated data.',
  lockedText: 'Analytics is available from Growth because it aggregates company activity across listings and team workflows.',
  views: 'Listing views',
  favourites: 'Favourites',
  enquiries: 'Enquiries',
  activeListings: 'Active listings',
  emptyTitle: 'More analytics are being prepared',
  emptyText: 'The current view uses real listing counters. Period filters, best-performing listings and team breakdowns can be layered on without changing the route structure.',
  topListings: 'Top listings',
  categoryMix: 'Category mix',
  marketMix: 'Markets',
  noInsights: 'No activity has been recorded yet.',
}

export default async function CompanyAnalyticsPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = translatePublicObject(context.locale, baseCopy)
  const plan = String(context.subscription?.plan_key || 'free')
  if (!planAllows(plan, 'growth')) {
    return (
      <CompanyPortalShell context={context} active="analytics" title={copy.title} description={copy.description}>
        <LockedFeature locale={context.locale} requiredPlan="Growth" text={copy.lockedText} />
      </CompanyPortalShell>
    )
  }
  const summary = context.listingSummary
  const insights = await getSellerInsights(createAdminClient(), context.listingOwnerUserIds)
  return (
    <CompanyPortalShell context={context} active="analytics" title={copy.title} description={copy.description}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label={copy.views} value={insights.totalViews || summary.totalViews} icon={Eye} />
        <Metric label={copy.favourites} value={insights.totalFavorites || summary.totalFavorites} icon={Heart} />
        <Metric label={copy.enquiries} value={insights.totalEnquiries} icon={MessageCircle} />
        <Metric label={copy.activeListings} value={summary.counts.active} icon={BarChart3} />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-6">
          <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.topListings}</h2>
          <div className="mt-4 grid gap-2">
            {insights.topListings.length ? insights.topListings.map((listing) => (
              <div key={listing.id} className="grid gap-3 rounded-[12px] border border-[#edf1f6] px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                <p className="truncate text-sm font-semibold text-[#101828]">{listing.title}</p>
                <p className="text-xs font-medium text-[#667085]">{copy.views}: {listing.views.toLocaleString()}</p>
                <p className="text-xs font-medium text-[#667085]">{copy.favourites}: {listing.favorites.toLocaleString()}</p>
              </div>
            )) : (
              <p className="rounded-[12px] border border-[#edf1f6] px-4 py-3 text-sm font-medium text-[#667085]">{copy.noInsights}</p>
            )}
          </div>
        </section>
        <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-6">
          <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.categoryMix}</h2>
          <Breakdown rows={insights.categories} emptyText={copy.noInsights} />
          <h2 className="mt-6 text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.marketMix}</h2>
          <Breakdown rows={insights.markets} emptyText={copy.noInsights} />
        </section>
      </div>
    </CompanyPortalShell>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Eye }) {
  return <div className="rounded-[16px] border border-[#d9e2ef] bg-white p-5"><Icon className="h-5 w-5 text-[#0866ff]" /><p className="mt-4 text-sm font-semibold text-[#667085]">{label}</p><p className="mt-1 text-3xl font-semibold tracking-[-.05em] text-[#101828]">{value.toLocaleString()}</p></div>
}

function Breakdown({ rows, emptyText }: { rows: Array<{ key: string; count: number }>; emptyText: string }) {
  if (!rows.length) return <p className="mt-3 text-sm font-medium text-[#667085]">{emptyText}</p>
  const max = Math.max(...rows.map((row) => row.count), 1)
  return (
    <div className="mt-3 grid gap-2">
      {rows.slice(0, 6).map((row) => (
        <div key={row.key} className="grid gap-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-[#101828]">{row.key}</span>
            <span className="font-medium text-[#667085]">{row.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#edf4ff]">
            <div className="h-full rounded-full bg-[#0866ff]" style={{ width: `${Math.max(8, Math.round((row.count / max) * 100))}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
