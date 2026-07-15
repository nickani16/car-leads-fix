import Link from 'next/link'
import { AlertTriangle, BarChart3, CreditCard, FileText, Plus, Users } from 'lucide-react'
import {
  CompanyPortalShell,
  formatCompanyDate,
  getCompanyPortalContext,
} from '@/lib/company-portal'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

const baseCopy = {
  title: 'Company overview',
  description: 'A focused overview of your company activity, subscription and actions that need attention on Autorell.',
  activeListings: 'Active listings',
  listingLimit: 'Listing limit',
  pendingReview: 'Under review',
  drafts: 'Drafts',
  sold: 'Sold',
  views: 'Views',
  favourites: 'Favourites',
  currentPlan: 'Current plan',
  nextBilling: 'Next billing',
  teamSeats: 'Team seats',
  actionNeeded: 'Action needed',
  noWarnings: 'No urgent actions right now.',
  createListing: 'Create listing',
  importListings: 'Import listings',
  manageTeam: 'Manage team',
  viewAnalytics: 'View analytics',
  manageSubscription: 'Manage subscription',
  updateProfile: 'Update company profile',
}

export default async function CompanyOverviewPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = translatePublicObject(context.locale, baseCopy)
  const summary = context.listingSummary
  const limit = context.subscription?.active_listing_limit || 0
  const plan = context.subscription?.plan_key || 'Free'
  const warnings = [
    summary.failedPayments > 0 ? `${summary.failedPayments} payment issue${summary.failedPayments === 1 ? '' : 's'}` : '',
    summary.missingImages > 0 ? `${summary.missingImages} listing${summary.missingImages === 1 ? '' : 's'} missing images` : '',
    summary.expiringSoon > 0 ? `${summary.expiringSoon} listing${summary.expiringSoon === 1 ? '' : 's'} expiring soon` : '',
    context.subscription?.payment_status === 'failed' || context.subscription?.status === 'past_due' ? 'Subscription payment needs attention' : '',
  ].filter(Boolean)

  return (
    <CompanyPortalShell context={context} active="overview" title={copy.title} description={copy.description}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label={copy.activeListings} value={summary.counts.active} icon={FileText} />
        <Metric label={copy.listingLimit} value={limit || '-'} icon={CreditCard} />
        <Metric label={copy.pendingReview} value={summary.counts.review} icon={AlertTriangle} />
        <Metric label={copy.drafts} value={summary.counts.draft} icon={FileText} />
        <Metric label={copy.sold} value={summary.counts.sold} icon={FileText} />
        <Metric label={copy.views} value={summary.totalViews} icon={BarChart3} />
        <Metric label={copy.favourites} value={summary.totalFavorites} icon={BarChart3} />
        <Metric label={copy.teamSeats} value={teamSeatText(String(plan).toLowerCase())} icon={Users} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <h2 className="text-lg font-semibold tracking-[-.025em] text-[#101828]">{copy.actionNeeded}</h2>
          {warnings.length ? (
            <div className="mt-4 grid gap-2">
              {warnings.map((warning) => (
                <div key={warning} className="rounded-[12px] border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#9a3412]">
                  {warning}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#667085]">{copy.noWarnings}</p>
          )}
        </section>

        <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <h2 className="text-lg font-semibold tracking-[-.025em] text-[#101828]">{copy.currentPlan}</h2>
          <p className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#101828]">{capitalize(String(plan))}</p>
          <p className="mt-1 text-sm text-[#667085]">{copy.nextBilling}: {formatCompanyDate(context.subscription?.next_billing_at || context.subscription?.current_period_end, context.locale)}</p>
        </section>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Shortcut href="/account/company/listings/create" label={copy.createListing} icon={Plus} locale={context.locale} primary />
        <Shortcut href="/account/company/import" label={copy.importListings} icon={FileText} locale={context.locale} />
        <Shortcut href="/account/company/team" label={copy.manageTeam} icon={Users} locale={context.locale} />
        <Shortcut href="/account/company/analytics" label={copy.viewAnalytics} icon={BarChart3} locale={context.locale} />
        <Shortcut href="/account/company/subscription" label={copy.manageSubscription} icon={CreditCard} locale={context.locale} />
        <Shortcut href="/account/company/profile" label={copy.updateProfile} icon={FileText} locale={context.locale} />
      </section>
    </CompanyPortalShell>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: number | string; icon: typeof FileText }) {
  return (
    <div className="rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-[#667085]">{label}</p>
        <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#eef5ff] text-[#0866ff]"><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-[-.05em] text-[#101828]">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  )
}

function Shortcut({ href, label, icon: Icon, locale, primary = false }: { href: string; label: string; icon: typeof FileText; locale: PublicLocale; primary?: boolean }) {
  return (
    <Link href={localizePublicHref(locale, href)} className={`flex min-h-14 items-center gap-3 rounded-[14px] border px-4 text-sm font-bold transition ${primary ? 'border-[#0866ff] bg-[#0866ff] text-white' : 'border-[#d9e2ef] bg-white text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]'}`}>
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}

function teamSeatText(plan: string) {
  if (plan === 'professional') return '50+'
  if (plan === 'growth') return '10'
  if (plan === 'starter') return '1'
  if (plan === 'enterprise') return 'Custom'
  return '1'
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
