import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileImage,
  FileText,
  Heart,
  Megaphone,
  Pencil,
  Plus,
  ReceiptText,
  ShieldCheck,
  Tag,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'
import { listingLifecycle } from '@/lib/listing-lifecycle'
import {
  billingProductCatalog,
  formatMoneyMinor,
  getProductAmount,
  legacyListingPackageToProductKey,
  normalizeBillingMarket,
  type BillingProduct,
} from '@/lib/billing/product-catalog'
import {
  getAccountListingSummary,
  getManagedListings,
  parseAccountListingFilters,
  type AccountListingFilters,
  type AccountListingSummary,
  type ManagedListing,
} from '@/lib/account-listings-management'
import ListingStatusActions, { type MarketingOption, type PackageOption } from './ListingStatusActions'
import ListingsFilters from './ListingsFilters'
import BulkListingActions from './BulkListingActions'
import { requireBusinessListingEntitlement } from '@/lib/billing/business-entitlement'
import { resolveBusinessAccountScope } from '@/lib/billing/business-account-scope'

export const generateMetadata = generateAccountMetadata('listings')

type BillingPriceRow = {
  product_key: string
  market: string
  currency: 'sek' | 'eur' | 'dkk' | 'pln'
  amount_minor: number
}

export default async function AccountListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const renderedAt = new Date().getTime()
  const locale = await getRequestLocale()
  const copy = listingPageCopy(locale)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/'))

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('account_type')
    .eq('user_id', user.id)
    .maybeSingle()
  const accountType = profile?.account_type || 'private'
  let listingOwnerUserIds = [user.id]
  if (accountType === 'business') {
    const entitlement = await requireBusinessListingEntitlement(user.id)
    if (!entitlement.allowed && entitlement.code === 'BUSINESS_SUBSCRIPTION_REQUIRED') {
      redirect('/account/business/subscription')
    }
    const scope = await resolveBusinessAccountScope(user.id, admin)
    listingOwnerUserIds = scope.listingOwnerUserIds
  }
  const filters = parseAccountListingFilters(query, accountType)

  let result
  let summary
  try {
    ;[result, summary] = await Promise.all([
      getManagedListings(admin, listingOwnerUserIds, filters),
      getAccountListingSummary(admin, listingOwnerUserIds),
    ])
  } catch (error) {
    console.error('[account-listings] Management query failed', { userId: user.id, error })
    throw new Error(copy.loadError)
  }

  if (result.totalPages > 0 && filters.page > result.totalPages) {
    const params = paramsFromFilters(filters)
    params.set('page', String(result.totalPages))
    redirect(`${localizePublicHref(locale, '/account/listings')}?${params.toString()}`)
  }

  const markets = [...new Set(result.items.map((listing) => normalizeBillingMarket(listing.country_code)))]
  const productKeys = billingProductCatalog
    .filter((product) => product.kind === 'listing_package' || product.kind === 'addon')
    .map((product) => product.productKey)
  const { data: activePriceData, error: activePriceError } = markets.length
    ? await admin
        .from('billing_product_prices')
        .select('product_key,market,currency,amount_minor')
        .in('market', markets)
        .in('product_key', productKeys)
        .eq('active', true)
        .lte('effective_from', new Date().toISOString())
        .or(`effective_to.is.null,effective_to.gt.${new Date().toISOString()}`)
    : { data: [], error: null }
  if (activePriceError) console.error('[account-listings] Active billing prices unavailable', activePriceError)
  const priceMap = new Map(
    ((activePriceData || []) as BillingPriceRow[]).map((price) => [
      `${price.market}:${price.product_key}`,
      price,
    ]),
  )

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="mx-auto max-w-[var(--autorell-page-max)] px-4 py-6 sm:px-8 lg:py-9">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">{copy.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em] text-[#101828] sm:text-4xl">{copy.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">{copy.intro}</p>
          </div>
          <Link href={localizePublicHref(locale, '/account/listings/new')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0866ff] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(8,102,255,.2)] outline-none transition hover:bg-[#075be3] focus-visible:ring-4 focus-visible:ring-[#0866ff]/30">
            <Plus className="h-4 w-4" />{copy.create}
          </Link>
        </header>

        {query.payment === 'cancelled' ? <StatusNotice tone="warning" title={copy.paymentCancelledTitle} text={copy.paymentCancelledText} /> : null}
        {query.payment === 'processing' ? <StatusNotice tone="info" title={copy.paymentProcessingTitle} text={copy.paymentProcessingText} /> : null}

        <CompactSummary summary={summary} locale={locale} />
        <AttentionSection summary={summary} locale={locale} />

        <ListingsFilters
          key={`${filters.query}:${filters.status}:${filters.pageSize}`}
          filters={filters}
          counts={summary.counts}
          categories={summary.categories}
          countries={summary.countries}
          accountType={accountType}
          locale={locale}
        />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#667085]"><span className="font-semibold text-[#344054]">{result.totalCount.toLocaleString(locale)}</span> {copy.results}</p>
          {result.totalPages > 0 ? <p className="text-sm text-[#667085]">{copy.page} {result.page} {copy.of} {result.totalPages}</p> : null}
        </div>

        {accountType === 'business' && result.items.some((listing) => canBulkManage(listing.status)) ? <BulkListingActions pageItemCount={result.items.filter((listing) => canBulkManage(listing.status)).length} locale={locale} /> : null}

        <section id="listing-results" role="tabpanel" aria-labelledby={`listing-tab-${filters.status}`} className="mt-4 grid gap-3">
          {result.items.length ? result.items.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              locale={locale}
              accountType={accountType}
              packages={packageOptions(listing, locale, priceMap)}
              marketing={marketingOptions(listing, locale, priceMap)}
              autoOpen={query.choosePackage === '1' && query.listing === listing.id}
              renderedAt={renderedAt}
            />
          )) : <EmptyState filters={filters} locale={locale} />}
        </section>

        {result.totalPages > 1 ? <Pagination filters={filters} currentPage={result.page} totalPages={result.totalPages} locale={locale} /> : null}
      </div>
    </main>
  )
}

function ListingCard({ listing, locale, accountType, packages, marketing, autoOpen, renderedAt }: {
  listing: ManagedListing
  locale: string
  accountType: string
  packages: PackageOption[]
  marketing: MarketingOption[]
  autoOpen: boolean
  renderedAt: number
}) {
  const lifecycle = listingLifecycle(listing.status, listing.review_status)
  const copy = listingPageCopy(locale as PublicLocale)
  const image = listing.images[0]
  const canBulk = accountType === 'business' && canBulkManage(listing.status)
  const reviewMessage = reviewReason(listing, locale)
  const activeBoost = listing.boost_status === 'active' && isFuture(listing.boost_expires_at)
  const activeFeatured = listing.featured_status === 'active' && isFuture(listing.featured_expires_at)

  return (
    <article className="relative overflow-visible rounded-[20px] border border-[#dfe6f1] bg-white shadow-[0_10px_35px_rgba(16,24,40,.045)]">
      <div className="grid gap-0 md:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[190px_minmax(0,1fr)_260px]">
        <div className="relative min-h-[180px] overflow-hidden rounded-t-[19px] bg-[#eef2f6] md:rounded-l-[19px] md:rounded-tr-none">
          {image ? <Image src={image} alt={listing.title} fill sizes="(max-width: 768px) 100vw, 190px" unoptimized className="object-cover" /> : <div className="grid h-full min-h-[180px] place-items-center text-center text-sm text-[#667085]"><span><FileImage className="mx-auto mb-2 h-6 w-6" />{copy.noImage}</span></div>}
          {canBulk ? <label className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-[10px] bg-white/95 shadow-md"><span className="sr-only">{copy.selectListing} {listing.title}</span><input form="bulk-listing-form" type="checkbox" name="listingId" value={listing.id} className="h-4 w-4 rounded accent-[#0866ff]" /></label> : null}
        </div>

        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <LifecycleBadge label={localizedLifecycleLabel(lifecycle.group, listing.status, locale)} tone={lifecycle.tone} />
            {activeBoost ? <PromotionBadge label={copy.topPlacement} /> : null}
            {activeFeatured ? <PromotionBadge label="Featured" /> : null}
          </div>
          <h2 className="mt-3 truncate text-xl font-semibold tracking-[-.025em] text-[#101828]">{listing.title}</h2>
          <p className="mt-1 text-lg font-semibold text-[#101828]">{new Intl.NumberFormat(locale, { style: 'currency', currency: listing.currency, maximumFractionDigits: 0 }).format(listing.price)}</p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#667085]">
            <span className="inline-flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" />{categoryLabel(listing.category, locale)}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(listing.published_at || listing.created_at, locale)}</span>
            {listing.expires_at && ['published', 'expired'].includes(listing.status) ? <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" />{copy.expires} {formatDate(listing.expires_at, locale)}</span> : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#667085]">
            <span className="rounded-[8px] bg-[#f4f6f9] px-2.5 py-1.5">ID: {listing.reference_number || listing.id.slice(0, 8)}</span>
            {listing.listing_number ? <span className="rounded-[8px] bg-[#f4f6f9] px-2.5 py-1.5">{copy.stockNumber}: {listing.listing_number}</span> : null}
            <span className="rounded-[8px] bg-[#f4f6f9] px-2.5 py-1.5">{packageLabel(listing.package_id)}</span>
          </div>

          <div className="mt-4 flex items-center gap-4 border-t border-[#eef2f7] pt-3 text-xs text-[#667085]">
            <span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-[#0866ff]" />{listing.view_count.toLocaleString(locale)} {copy.views}</span>
            <span className="inline-flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-[#0866ff]" />{listing.favorite_count.toLocaleString(locale)} {copy.favorites}</span>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 border-t border-[#eef2f7] bg-[#fbfcff] p-4 sm:flex-row sm:items-center sm:justify-between xl:flex-col xl:items-stretch xl:justify-center xl:border-l xl:border-t-0 xl:rounded-r-[19px]">
          {!['deleted', 'removed'].includes(listing.status) ? <Link href={localizePublicHref(locale as PublicLocale, `/account/listings/${listing.id}/edit`)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[11px] border border-[#cbd7e8] bg-white px-3 text-sm font-semibold text-[#0866ff] outline-none transition hover:bg-[#f2f6ff] focus-visible:ring-4 focus-visible:ring-[#0866ff]/20"><Pencil className="h-4 w-4" />{copy.edit}</Link> : null}
          <ListingStatusActions
            listingId={listing.id}
            status={listing.status}
            packageId={listing.package_id}
            market={listing.country_code.toLowerCase()}
            packages={packages}
            marketingOptions={marketing}
            lastRefreshedAt={listing.last_refreshed_at}
            refreshLocked={Boolean(listing.last_refreshed_at && new Date(listing.last_refreshed_at).getTime() + 24 * 60 * 60 * 1000 > renderedAt)}
            boostStartedAt={listing.boost_started_at}
            boostExpiresAt={listing.boost_expires_at}
            featuredStartedAt={listing.featured_started_at}
            featuredExpiresAt={listing.featured_expires_at}
            reviewMessage={reviewMessage}
            autoOpen={autoOpen}
            locale={locale}
          />
        </div>
      </div>
    </article>
  )
}

function CompactSummary({ summary, locale }: { summary: AccountListingSummary; locale: PublicLocale }) {
  const copy = listingPageCopy(locale)
  const items = [
    { label: copy.active, value: summary.counts.active, href: 'active', icon: CheckCircle2 },
    { label: copy.payment, value: summary.counts.payment, href: 'payment', icon: ReceiptText },
    { label: copy.review, value: summary.counts.review, href: 'review', icon: ShieldCheck },
    { label: copy.sold, value: summary.counts.sold, href: 'sold', icon: FileText },
    { label: copy.totalViews, value: summary.totalViews, icon: Eye },
    { label: copy.totalFavorites, value: summary.totalFavorites, icon: Heart },
  ]
  return <section aria-label={copy.summary} className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">{items.map((item) => {
    const content = <><item.icon className="h-4 w-4 text-[#0866ff]" /><span className="min-w-0"><strong className="block text-lg font-semibold text-[#101828]">{item.value.toLocaleString(locale)}</strong><span className="block truncate text-xs text-[#667085]">{item.label}</span></span></>
    return item.href ? <Link key={item.label} href={`${localizePublicHref(locale, '/account/listings')}?status=${item.href}`} className="flex items-center gap-3 rounded-[14px] border border-[#dfe6f1] bg-white p-3 outline-none transition hover:border-[#aac5ef] focus-visible:ring-4 focus-visible:ring-[#0866ff]/20">{content}</Link> : <div key={item.label} className="flex items-center gap-3 rounded-[14px] border border-[#dfe6f1] bg-white p-3">{content}</div>
  })}</section>
}

function AttentionSection({ summary, locale }: { summary: AccountListingSummary; locale: PublicLocale }) {
  const copy = listingPageCopy(locale)
  const alerts = [
    summary.counts.payment ? { icon: ReceiptText, title: `${summary.counts.payment} ${copy.attentionPayment}`, cta: copy.completePayment, href: '?status=payment' } : null,
    summary.missingImages && summary.firstMissingImageId ? { icon: FileImage, title: `${summary.missingImages} ${copy.attentionImages}`, cta: copy.addImages, href: `/${summary.firstMissingImageId}/edit` } : null,
    summary.expiringSoon ? { icon: CalendarClock, title: `${summary.expiringSoon} ${copy.attentionExpiring}`, cta: copy.renew, href: '?status=active&sort=expires_asc' } : null,
    summary.flagged ? { icon: AlertTriangle, title: `${summary.flagged} ${copy.attentionReview}`, cta: copy.readReason, href: '?status=review' } : null,
    summary.failedPayments ? { icon: ReceiptText, title: `${summary.failedPayments} ${copy.attentionFailed}`, cta: copy.tryAgain, href: '?status=payment' } : null,
  ].filter(Boolean) as Array<{ icon: typeof AlertTriangle; title: string; cta: string; href: string }>
  if (!alerts.length) return null
  return <section className="mt-6 rounded-[18px] border border-[#fed7aa] bg-[#fffaf5] p-4 sm:p-5" aria-labelledby="attention-title"><h2 id="attention-title" className="text-base font-semibold text-[#9a3412]">{copy.needsAttention}</h2><div className="mt-3 grid gap-2 lg:grid-cols-2">{alerts.map((alert) => <Link key={alert.title} href={`${localizePublicHref(locale, '/account/listings')}${alert.href}`} className="flex flex-col items-start gap-2 rounded-[12px] bg-white p-3 text-sm outline-none transition hover:ring-1 hover:ring-[#fdba74] focus-visible:ring-4 focus-visible:ring-[#fb923c]/20 sm:flex-row sm:items-center sm:gap-3"><span className="flex min-w-0 flex-1 items-center gap-3"><alert.icon className="h-4 w-4 shrink-0 text-[#ea580c]" /><span className="font-medium text-[#7c2d12]">{alert.title}</span></span><span className="pl-7 font-semibold text-[#c2410c] sm:shrink-0 sm:pl-0">{alert.cta}</span></Link>)}</div></section>
}

function EmptyState({ filters, locale }: { filters: AccountListingFilters; locale: PublicLocale }) {
  const copy = listingPageCopy(locale)
  const filtered = Boolean(filters.query || filters.category !== 'all' || filters.country !== 'all' || filters.package !== 'all' || filters.marketing !== 'all')
  const statusText: Record<string, string> = {
    active: copy.emptyActive, payment: copy.emptyPayment, review: copy.emptyReview, draft: copy.emptyDraft,
    paused: copy.emptyPaused, expired: copy.emptyExpired, sold: copy.emptySold, deleted: copy.emptyDeleted,
  }
  return <div className="rounded-[20px] border border-dashed border-[#b8c5d8] bg-white px-6 py-12 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-[15px] bg-[#eef5ff] text-[#0866ff]"><FileText className="h-5 w-5" /></span><h2 className="mt-4 text-xl font-semibold text-[#101828]">{filtered ? copy.noSearchResults : statusText[filters.status] || copy.emptyAll}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#667085]">{filtered ? copy.noSearchText : copy.emptyText}</p><Link href={filtered ? localizePublicHref(locale, '/account/listings') : localizePublicHref(locale, '/account/listings/new')} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[#0866ff] px-4 text-sm font-semibold text-white outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/30">{filtered ? copy.clearFilters : copy.create}</Link></div>
}

function Pagination({ filters, currentPage, totalPages, locale }: { filters: AccountListingFilters; currentPage: number; totalPages: number; locale: PublicLocale }) {
  const copy = listingPageCopy(locale)
  const pages = paginationWindow(currentPage, totalPages)
  return <nav aria-label={copy.pagination} className="mt-6 flex flex-wrap items-center justify-center gap-2"><PageLink disabled={currentPage <= 1} filters={filters} page={currentPage - 1} locale={locale}>{copy.previous}</PageLink>{pages.map((page, index) => page === null ? <span key={`gap-${index}`} className="px-1 text-[#98a2b3]">…</span> : <PageLink key={page} filters={filters} page={page} locale={locale} current={page === currentPage}>{page}</PageLink>)}<PageLink disabled={currentPage >= totalPages} filters={filters} page={currentPage + 1} locale={locale}>{copy.next}</PageLink></nav>
}

function PageLink({ filters, page, locale, current, disabled, children }: { filters: AccountListingFilters; page: number; locale: PublicLocale; current?: boolean; disabled?: boolean; children: React.ReactNode }) {
  const className = `inline-flex h-10 min-w-10 items-center justify-center rounded-[11px] border px-3 text-sm font-semibold outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/20 ${current ? 'border-[#0866ff] bg-[#0866ff] text-white' : 'border-[#d7e0ec] bg-white text-[#475467] hover:border-[#9ebcf0] hover:text-[#0866ff]'} ${disabled ? 'pointer-events-none opacity-40' : ''}`
  const params = paramsFromFilters(filters)
  if (page > 1) params.set('page', String(page)); else params.delete('page')
  return <Link aria-current={current ? 'page' : undefined} aria-disabled={disabled} tabIndex={disabled ? -1 : undefined} href={`${localizePublicHref(locale, '/account/listings')}${params.size ? `?${params.toString()}` : ''}`} className={className}>{children}</Link>
}

function StatusNotice({ tone, title, text }: { tone: 'warning' | 'info'; title: string; text: string }) {
  return <div className={`mt-5 rounded-[15px] border px-4 py-3 text-sm leading-6 ${tone === 'warning' ? 'border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]' : 'border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]'}`}><strong className="font-semibold">{title}</strong> {text}</div>
}

function LifecycleBadge({ label, tone }: { label: string; tone: string }) {
  const colors: Record<string, string> = { blue: 'bg-[#eef5ff] text-[#0866ff]', green: 'bg-[#ecfdf3] text-[#027a48]', amber: 'bg-[#fff7ed] text-[#c2410c]', purple: 'bg-[#f5f3ff] text-[#6d28d9]', red: 'bg-[#fef2f2] text-[#b42318]', slate: 'bg-[#f2f4f7] text-[#475467]' }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[.08em] ${colors[tone] || colors.slate}`}>{label}</span>
}

function PromotionBadge({ label }: { label: string }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f3ff] px-2.5 py-1 text-[11px] font-semibold text-[#6d28d9]"><Megaphone className="h-3 w-3" />{label}</span>
}

function packageOptions(listing: ManagedListing, locale: string, prices: Map<string, BillingPriceRow>): PackageOption[] {
  const market = normalizeBillingMarket(listing.country_code)
  const definitions = [
    { id: 'free_7d', title: 'Start', duration: 7, description: locale === 'sv' ? 'En vanlig annons för att komma igång.' : 'A standard listing to get started.' },
    { id: 'standard_15d', title: 'Standard', duration: 15, description: locale === 'sv' ? 'Längre annonstid för en seriös försäljning.' : 'A longer listing period for a serious sale.' },
    { id: 'premium_30d', title: 'Premium', duration: 30, description: locale === 'sv' ? 'Extra synlighet och inkluderad toppplacering.' : 'Extra visibility and included top placement.' },
  ]
  return definitions.map((definition) => {
    const key = legacyListingPackageToProductKey(listing.category, definition.id)
    const product = key ? billingProductCatalog.find((item) => item.productKey === key) : null
    const amount = product ? configuredAmount(product, market, prices) : null
    if (!amount) console.error('[account-listings] Missing package price', { productKey: key, market })
    return { id: definition.id, title: definition.title, duration: `${definition.duration} ${locale === 'sv' ? 'dagar' : 'days'}`, description: definition.description, price: amount ? amount.amountMinor === 0 ? locale === 'sv' ? 'Gratis' : 'Free' : formatMoneyMinor(amount.amountMinor, amount.currency, locale) : locale === 'sv' ? 'Ej tillgängligt' : 'Unavailable', available: Boolean(amount) }
  })
}

function marketingOptions(listing: ManagedListing, locale: string, prices: Map<string, BillingPriceRow>): MarketingOption[] {
  const market = normalizeBillingMarket(listing.country_code)
  return billingProductCatalog.flatMap((product): MarketingOption[] => {
    if (product.kind !== 'addon' || !product.addon) return []
    if (product.addon.startsWith('refresh') && product.addon !== 'refresh_single') return []
    const amount = configuredAmount(product, market, prices)
    if (!amount || amount.amountMinor <= 0) {
      console.error('[account-listings] Missing promotion price', { productKey: product.productKey, market })
      return []
    }
    const type = product.addon.startsWith('refresh') ? 'refresh' : product.addon.startsWith('top_placement') ? 'top' : 'featured'
    const period = type === 'refresh' ? (locale === 'sv' ? '1 direkt lyft' : '1 instant boost') : `${product.durationDays} ${locale === 'sv' ? 'dagar' : 'days'}`
    const title = type === 'refresh' ? (locale === 'sv' ? 'Lyft annons' : 'Boost listing') : type === 'top' ? (locale === 'sv' ? 'Toppplacering' : 'Top placement') : 'Featured'
    const description = type === 'refresh'
      ? (locale === 'sv' ? 'Flyttar upp annonsen bland de senaste resultaten. Ett nytt lyft kan göras efter 24 timmar.' : 'Moves the listing among the newest results. Available again after 24 hours.')
      : type === 'top'
        ? (locale === 'sv' ? 'Ger prioriterad placering högst upp i relevanta sökresultat. Flera toppannonser kan rotera.' : 'Prioritized placement at the top of relevant search results. Multiple top listings may rotate.')
        : (locale === 'sv' ? 'Ger annonskortet en tydlig Featured-markering och exponering i utvalda ytor.' : 'Adds a clear Featured treatment and exposure in selected placements.')
    const detail = type === 'refresh'
      ? (locale === 'sv' ? 'Effekten startar när Stripe-betalningen har verifierats via webhook.' : 'Starts after Stripe payment is verified by webhook.')
      : type === 'top'
        ? `${locale === 'sv' ? 'Gäller annonsens kategori och marknad' : 'Applies to the listing category and market'} · ${listing.country_code.toUpperCase()}`
        : (locale === 'sv' ? 'Skiljer sig från toppplacering: visuell markering och utvald exponering, inte fast topprioritet.' : 'Unlike top placement: visual treatment and selected exposure, not fixed top priority.')
    return [{ productKey: product.productKey, type, title, price: formatMoneyMinor(amount.amountMinor, amount.currency, locale), period, description, detail }]
  })
}

function configuredAmount(product: BillingProduct, market: ReturnType<typeof normalizeBillingMarket>, prices: Map<string, BillingPriceRow>) {
  const configured = prices.get(`${market}:${product.productKey}`)
  if (configured) return { amountMinor: Number(configured.amount_minor), currency: configured.currency }
  return getProductAmount(product, market)
}

function paramsFromFilters(filters: AccountListingFilters) {
  const params = new URLSearchParams()
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.query) params.set('query', filters.query)
  if (filters.category !== 'all') params.set('category', filters.category)
  if (filters.country !== 'all') params.set('country', filters.country)
  if (filters.package !== 'all') params.set('package', filters.package)
  if (filters.marketing !== 'all') params.set('marketing', filters.marketing)
  if (filters.sellerType !== 'all') params.set('sellerType', filters.sellerType)
  if (filters.sort !== 'updated_desc') params.set('sort', filters.sort)
  if (filters.pageSize !== 25) params.set('pageSize', String(filters.pageSize))
  return params
}

function paginationWindow(current: number, total: number) {
  const values = new Set([1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total))
  const sorted = [...values].sort((a, b) => a - b)
  const result: Array<number | null> = []
  sorted.forEach((page, index) => { if (index && page - sorted[index - 1] > 1) result.push(null); result.push(page) })
  return result
}

function reviewReason(listing: ManagedListing, locale: string) {
  if (!listing.risk_flags.length) return null
  const labels: Record<string, [string, string]> = {
    price_outlier: ['Priset avviker tydligt och behöver kontrolleras.', 'The price differs significantly and needs review.'],
    duplicate_identifier: ['Fordonsidentifieraren används redan i en annan annons.', 'The vehicle identifier is already used by another listing.'],
    duplicate_listing: ['Annonsen liknar en befintlig annons och behöver kontrolleras.', 'The listing resembles an existing listing and needs review.'],
  }
  return listing.risk_flags.map((flag) => labels[flag]?.[locale === 'sv' ? 0 : 1] || (locale === 'sv' ? 'Annonsuppgifterna behöver kontrolleras innan publicering.' : 'The listing details need review before publication.')).join(' ')
}

function canBulkManage(status: string) { return ['published', 'paused', 'draft', 'pending_payment', 'expired', 'sold', 'rejected'].includes(status) }
function localizedLifecycleLabel(group: ReturnType<typeof listingLifecycle>['group'], status: string, locale: string) {
  if (locale === 'sv') return listingLifecycle(status).label
  const labels: Record<ReturnType<typeof listingLifecycle>['group'], string> = {
    active: 'Active', review: status === 'rejected' ? 'Action required' : 'In review', payment: 'Awaiting payment',
    draft: 'Draft', paused: 'Paused', sold: 'Sold', expired: 'Expired', deleted: 'Deleted',
  }
  return labels[group]
}
function isFuture(value: string | null) { return Boolean(value && new Date(value).getTime() > Date.now()) }
function formatDate(value: string, locale: string) { return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value)) }
function packageLabel(value: string) { return value === 'premium_30d' ? 'Premium · 30' : value === 'standard_15d' ? 'Standard · 15' : 'Start · 7' }
function categoryLabel(value: string, locale: string) { const labels: Record<string, [string, string]> = { cars: ['Bilar', 'Cars'], vans: ['Transportbilar', 'Vans'], motorcycles: ['Motorcyklar', 'Motorcycles'], motorhomes: ['Husbilar', 'Motorhomes'], caravans: ['Husvagnar', 'Caravans'], trucks: ['Lastbilar', 'Trucks'], agriculture: ['Lantbruk', 'Agriculture'], construction: ['Entreprenad', 'Construction'], 'electric-bikes': ['Elcyklar', 'Electric bikes'], 'e-scooters': ['Elsparkcyklar', 'E-scooters'] }; return labels[value]?.[locale === 'sv' ? 0 : 1] || value }

function listingPageCopy(locale: PublicLocale) {
  const sv = locale === 'sv'
  return {
    eyebrow: sv ? 'Konto · Annonshantering' : 'Account · Listing management', title: sv ? 'Mina annonser' : 'My listings', intro: sv ? 'Sök, filtrera och hantera hela ditt fordonslager utan långa listor eller återvändsgränder.' : 'Search, filter and manage your vehicle inventory without long lists or dead ends.', create: sv ? 'Skapa annons' : 'Create listing',
    summary: sv ? 'Sammanfattning' : 'Summary', active: sv ? 'Aktiva annonser' : 'Active listings', payment: sv ? 'Väntar på betalning' : 'Awaiting payment', review: sv ? 'Under granskning' : 'In review', sold: sv ? 'Sålda' : 'Sold', totalViews: sv ? 'Totala visningar' : 'Total views', totalFavorites: sv ? 'Totala favoriter' : 'Total favorites',
    needsAttention: sv ? 'Behöver din uppmärksamhet' : 'Needs your attention', attentionPayment: sv ? 'annonser väntar på betalning' : 'listings await payment', attentionImages: sv ? 'annonser saknar bilder' : 'listings have no images', attentionExpiring: sv ? 'annonser löper ut inom tre dagar' : 'listings expire within three days', attentionReview: sv ? 'annonser behöver granskas eller åtgärdas' : 'listings need review or action', attentionFailed: sv ? 'annonser har en misslyckad betalning' : 'listings have a failed payment', completePayment: sv ? 'Slutför betalning' : 'Complete payment', addImages: sv ? 'Lägg till bilder' : 'Add images', renew: sv ? 'Förnya' : 'Renew', readReason: sv ? 'Läs orsak' : 'Read reason', tryAgain: sv ? 'Försök igen' : 'Try again',
    results: sv ? 'annonser' : 'listings', page: sv ? 'Sida' : 'Page', of: sv ? 'av' : 'of', noImage: sv ? 'Ingen bild' : 'No image', selectListing: sv ? 'Välj annons' : 'Select listing', expires: sv ? 'Utgår' : 'Expires', stockNumber: sv ? 'Lagernummer' : 'Stock number', views: sv ? 'visningar' : 'views', favorites: sv ? 'favoriter' : 'favorites', edit: sv ? 'Redigera' : 'Edit', topPlacement: sv ? 'Toppplacering' : 'Top placement',
    noSearchResults: sv ? 'Inga annonser matchade din sökning' : 'No listings matched your search', noSearchText: sv ? 'Prova ett annat sökord eller rensa sökning och filter.' : 'Try another search or clear search and filters.', clearFilters: sv ? 'Rensa sökning och filter' : 'Clear search and filters', emptyAll: sv ? 'Du har inga annonser ännu' : 'You have no listings yet', emptyActive: sv ? 'Du har inga aktiva annonser just nu' : 'You have no active listings', emptyPayment: sv ? 'Inga annonser väntar på betalning' : 'No listings await payment', emptyReview: sv ? 'Inga annonser är under granskning' : 'No listings are in review', emptyDraft: sv ? 'Du har inga sparade utkast' : 'You have no saved drafts', emptyPaused: sv ? 'Du har inga pausade annonser' : 'You have no paused listings', emptyExpired: sv ? 'Du har inga utgångna annonser' : 'You have no expired listings', emptySold: sv ? 'Du har inga sålda annonser' : 'You have no sold listings', emptyDeleted: sv ? 'Du har inga borttagna annonser' : 'You have no deleted listings', emptyText: sv ? 'Skapa en annons när du är redo att nå köpare på Autorell.' : 'Create a listing when you are ready to reach buyers on Autorell.',
    pagination: sv ? 'Sidnavigering' : 'Pagination', previous: sv ? 'Föregående' : 'Previous', next: sv ? 'Nästa' : 'Next', paymentCancelledTitle: sv ? 'Betalningen avbröts – inget publicerades.' : 'Payment cancelled — nothing was published.', paymentCancelledText: sv ? 'Annonsen är sparad och kan återupptas nedan.' : 'The listing is saved and can be resumed below.', paymentProcessingTitle: sv ? 'Vi bekräftar betalningen.' : 'We are confirming the payment.', paymentProcessingText: sv ? 'Status uppdateras när den verifierade Stripe-webhooken har behandlats.' : 'Status updates after the verified Stripe webhook is processed.', loadError: sv ? 'Mina annonser kunde inte laddas just nu.' : 'My listings could not be loaded.',
  }
}
