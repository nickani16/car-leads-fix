import Link from 'next/link'
import { AlertTriangle, BarChart3, Building2, CreditCard, FileText, Plus, ShieldCheck, TrendingUp, Users } from 'lucide-react'
import {
  CompanyPortalShell,
  formatCompanyDate,
  getCompanyPortalContext,
} from '@/lib/company-portal'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('company-overview')

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
  enquiries: 'Enquiries',
  utilisation: 'Utilisation',
  currentPlan: 'Current plan',
  nextBilling: 'Next billing',
  teamSeats: 'Team seats',
  verification: 'Verification',
  verified: 'Verified',
  pending: 'Pending review',
  businessReadyTitle: 'Ready for dealer outreach',
  businessReadyText: 'Your company account can list inventory, measure reach and build a public footprint before upgrading to a larger plan.',
  actionNeeded: 'Action needed',
  noWarnings: 'No urgent actions right now.',
  paymentIssueSingular: 'payment issue',
  paymentIssuePlural: 'payment issues',
  listingSingular: 'listing',
  listingPlural: 'listings',
  missingImagesSuffix: 'missing images',
  expiringSoonSuffix: 'expiring soon',
  needsReviewSuffix: 'need review or action',
  subscriptionPaymentNeedsAttention: 'Subscription payment needs attention',
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
  const utilisation = limit ? Math.round((summary.counts.active / limit) * 100) : 0
  const verified = ['verified', 'vat_validated'].includes(String(context.profile.business_verification_status || ''))
  const warnings = [
    summary.failedPayments > 0 ? `${summary.failedPayments} ${summary.failedPayments === 1 ? copy.paymentIssueSingular : copy.paymentIssuePlural}` : '',
    summary.missingImages > 0 ? `${summary.missingImages} ${summary.missingImages === 1 ? copy.listingSingular : copy.listingPlural} ${copy.missingImagesSuffix}` : '',
    summary.expiringSoon > 0 ? `${summary.expiringSoon} ${summary.expiringSoon === 1 ? copy.listingSingular : copy.listingPlural} ${copy.expiringSoonSuffix}` : '',
    summary.flagged > 0 ? `${summary.flagged} ${summary.flagged === 1 ? copy.listingSingular : copy.listingPlural} ${copy.needsReviewSuffix}` : '',
    context.subscription?.payment_status === 'failed' || ['past_due', 'unpaid'].includes(String(context.subscription?.status || '')) ? copy.subscriptionPaymentNeedsAttention : '',
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
        <Metric label={copy.utilisation} value={`${utilisation}%`} icon={TrendingUp} />
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
          <div className="mt-4 rounded-[12px] border border-[#e4ebf5] bg-[#f8fbff] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#667085]">{copy.verification}</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-bold text-[#101828]">
              <ShieldCheck className={`h-4 w-4 ${verified ? 'text-[#079455]' : 'text-[#0866ff]'}`} />
              {verified ? copy.verified : copy.pending}
            </p>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-[16px] border border-[#b9cff7] bg-[#f7fbff] p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
        <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-white text-[#0866ff]">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.businessReadyTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-[#5f6b7a]">{copy.businessReadyText}</p>
          </div>
          <Link href={localizePublicHref(context.locale, '/account/company/analytics')} className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#0866ff] px-4 text-sm font-bold text-white">
            {copy.viewAnalytics}
          </Link>
        </div>
      </section>

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
