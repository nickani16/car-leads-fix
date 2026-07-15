import { BarChart3, Eye, Heart, MessageCircle } from 'lucide-react'
import { CompanyPortalShell, LockedFeature, getCompanyPortalContext, planAllows } from '@/lib/company-portal'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

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
  return (
    <CompanyPortalShell context={context} active="analytics" title={copy.title} description={copy.description}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label={copy.views} value={summary.totalViews} icon={Eye} />
        <Metric label={copy.favourites} value={summary.totalFavorites} icon={Heart} />
        <Metric label={copy.enquiries} value={0} icon={MessageCircle} />
        <Metric label={copy.activeListings} value={summary.counts.active} icon={BarChart3} />
      </div>
      <div className="mt-6 rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
        <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.emptyTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.emptyText}</p>
      </div>
    </CompanyPortalShell>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Eye }) {
  return <div className="rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)]"><Icon className="h-5 w-5 text-[#0866ff]" /><p className="mt-4 text-sm font-semibold text-[#667085]">{label}</p><p className="mt-1 text-3xl font-semibold tracking-[-.05em] text-[#101828]">{value.toLocaleString()}</p></div>
}
