import { BarChart3, Eye, Gauge, Heart, MessageCircle, MousePointerClick, Target, TrendingUp, type LucideIcon } from 'lucide-react'
import { CompanyPortalShell, getCompanyPortalContext } from '@/lib/company-portal'
import { getSellerInsights } from '@/lib/marketplace-insights'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('company-analytics')

const baseCopy = {
  title: 'Company analytics',
  description: 'Use real listing data to show reach, demand and follow-up quality when you decide where to publish more inventory.',
  views: 'Listing views',
  favourites: 'Favourites',
  enquiries: 'Enquiries',
  activeListings: 'Active listings',
  usage: 'Quota usage',
  leadRate: 'Lead rate',
  saveRate: 'Save rate',
  opportunity: 'Growth signal',
  opportunityText: 'Add more active listings to create a stronger company footprint in marketplace search and Google landing pages.',
  pitchTitle: 'Use this in dealer outreach',
  pitchText: 'These numbers are based on real listing events, saved listings and enquiries. They help a seller see whether Autorell is creating reach before a paid upgrade.',
  topListings: 'Top listings',
  categoryMix: 'Category mix',
  marketMix: 'Markets',
  viewsPerListing: 'Views per listing',
  savesPerListing: 'Saves per listing',
  noInsights: 'No activity has been recorded yet.',
}

export default async function CompanyAnalyticsPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = translatePublicObject(context.locale, baseCopy)
  const summary = context.listingSummary
  const insights = await getSellerInsights(createAdminClient(), context.listingOwnerUserIds)
  const activeLimit = Number(context.subscription?.active_listing_limit || 0)
  const leadRate = rate(insights.totalEnquiries, insights.totalViews)
  const saveRate = rate(insights.totalFavorites || summary.totalFavorites, insights.totalViews || summary.totalViews)
  const quotaUsage = activeLimit > 0 ? Math.round((summary.counts.active / activeLimit) * 100) : 0
  const viewsPerListing = perListing(insights.totalViews || summary.totalViews, Math.max(insights.listingCount, summary.counts.all))
  const savesPerListing = perListing(insights.totalFavorites || summary.totalFavorites, Math.max(insights.listingCount, summary.counts.all))
  return (
    <CompanyPortalShell context={context} active="analytics" title={copy.title} description={copy.description}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label={copy.views} value={insights.totalViews || summary.totalViews} icon={Eye} />
        <Metric label={copy.favourites} value={insights.totalFavorites || summary.totalFavorites} icon={Heart} />
        <Metric label={copy.enquiries} value={insights.totalEnquiries} icon={MessageCircle} />
        <Metric label={copy.activeListings} value={summary.counts.active} icon={BarChart3} />
      </div>
      <section className="mt-6 grid gap-4 lg:grid-cols-4">
        <Signal label={copy.usage} value={`${quotaUsage}%`} detail={`${summary.counts.active}/${activeLimit || '-'}`} icon={Gauge} />
        <Signal label={copy.leadRate} value={`${leadRate}%`} detail={copy.enquiries} icon={Target} />
        <Signal label={copy.saveRate} value={`${saveRate}%`} detail={copy.favourites} icon={MousePointerClick} />
        <Signal label={copy.viewsPerListing} value={String(viewsPerListing)} detail={copy.savesPerListing + ': ' + savesPerListing} icon={TrendingUp} />
      </section>
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
      <section className="mt-6 rounded-[16px] border border-[#b9cff7] bg-[#f7fbff] p-6">
        <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.pitchTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f6b7a]">{copy.pitchText}</p>
        <p className="mt-4 rounded-[12px] border border-[#d9e8ff] bg-white px-4 py-3 text-sm font-semibold text-[#18478f]">{copy.opportunity}: {copy.opportunityText}</p>
      </section>
    </CompanyPortalShell>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return <div className="rounded-[16px] border border-[#d9e2ef] bg-white p-5"><Icon className="h-5 w-5 text-[#0866ff]" /><p className="mt-4 text-sm font-semibold text-[#667085]">{label}</p><p className="mt-1 text-3xl font-semibold tracking-[-.05em] text-[#101828]">{value.toLocaleString()}</p></div>
}

function Signal({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return (
    <div className="rounded-[16px] border border-[#d9e2ef] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#667085]">{label}</p>
        <Icon className="h-5 w-5 text-[#0866ff]" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-[-.05em] text-[#101828]">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[.12em] text-[#7b8798]">{detail}</p>
    </div>
  )
}

function rate(part: number, total: number) {
  if (!total || total <= 0) return 0
  return Math.round((part / total) * 100)
}

function perListing(total: number, listings: number) {
  if (!listings || listings <= 0) return 0
  return Math.round(total / listings)
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
