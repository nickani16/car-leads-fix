import { notFound, redirect } from 'next/navigation'
import BusinessMarketplaceHome from '@/app/components/BusinessMarketplaceHome'
import { HelpCenterArticlePage, HelpCenterCategory } from '@/app/components/HelpCenterPages'
import PricingPage from '@/app/components/PricingPage'
import AppDownloadPage, { generateAppDownloadMetadata } from '@/app/components/AppDownloadPage'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'
import FaqPageClient from '@/app/vanliga-fragor/FaqPageClient'
import BusinessPage from '@/app/foretag/page'
import BusinessPilotPage, { generateMetadata as generateBusinessPilotMetadata } from '@/app/business/pilot/page'
import InventoryImportPage, { generateMetadata as generateInventoryImportMetadata } from '@/app/business/inventory-import/page'
import ListingDetailPage, { generateListingMetadata } from '@/app/listings/[slug]/ListingDetailPage'
import { renderNewListingPage } from '@/app/konto/annonser/ny/page'
import AccountListingsPage from '@/app/konto/annonser/page'
import ListingCreatedPage from '@/app/account/listings/created/page'
import AccountSavedListingsPage from '@/app/account/saved-listings/page'
import SavedListingsPage from '@/app/sparade/page'
import AccountSavedSearchesPage from '@/app/account/saved-searches/page'
import PrivateProfilePage from '@/app/account/profile/page'
import PrivateSettingsPage from '@/app/account/settings/page'
import PrivateSupportPage from '@/app/account/support/page'
import { normalizeBillingMarket } from '@/lib/billing/product-catalog'
import { getEuBuyerMarket } from '@/lib/eu-buyer-markets'
import type { PublicLocale } from '@/lib/public-i18n'
import BusinessSubscriptionPage from '@/app/konto/business/subscription/page'
import BusinessSubscriptionCancelPage from '@/app/konto/business/subscription/cancel/page'
import BusinessStatusPage from '@/app/konto/business/status/page'
import PaymentsPage from '@/app/konto/betalningar/page'
import CompanyOverviewPage from '@/app/account/company/page'
import CompanyImportPage from '@/app/account/company/import/page'
import CompanyInventoryPage from '@/app/account/company/inventory/page'
import CompanyAnalyticsPage from '@/app/account/company/analytics/page'
import CompanyLocationsPage from '@/app/account/company/locations/page'
import CompanyTeamPage from '@/app/account/company/team/page'
import AcceptCompanyTeamInvitationPage from '@/app/account/company/team/accept/page'
import CompanyProfilePage from '@/app/account/company/profile/page'
import CompanySettingsPage from '@/app/account/company/settings/page'
import CompanySupportPage from '@/app/account/company/support/page'
import RegisterPage from '@/app/registrera/page'
import {
  buildGeoMarketplaceHref,
  isGeoLandingCandidate,
  resolveGeoLandingRoute,
} from '@/lib/seo-geo-landings'
import { getHelpCenterArticle, getHelpCenterCategory } from '@/lib/help-center'

const removedPublicPages = new Set([
  'sell-vehicle',
  'partners',
  'careers',
  'press',
  'how-selling-works',
  'compare-vehicles',
  'payments',
  'buying-guide',
  'vehicle-history',
  'shipping-delivery',
  'dealer-solutions',
])

const localizedListingSegments = new Set([
  'annons',
  'anzeige',
  'advertentie',
  'annonce',
  'anuncio',
  'annuncio',
  'ogloszenie',
  'ilmoitus',
])

function localizedListingParams({
  market,
  slug,
}: {
  market: string
  slug: string[]
}) {
  const [segment, id, readableSlug] = slug
  if (!localizedListingSegments.has(segment) || !id || !readableSlug || slug.length !== 3) {
    return null
  }
  return Promise.resolve({ market, slug: `${readableSlug}-${id}` })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ market: string; slug: string[] }>
}) {
  const { market, slug } = await params
  if (slug.join('/') === 'app') {
    const locale = resolveMarketLocale(market)
    if (locale) return generateAppDownloadMetadata(locale)
  }
  if (slug.join('/') === 'business/pilot') {
    return generateBusinessPilotMetadata()
  }
  if (slug.join('/') === 'business/inventory-import') {
    return generateInventoryImportMetadata()
  }
  if (slug.join('/') === 'safety-tips') {
    return generatePublicInfoMetadata('safety-tips')()
  }
  const listingParams = localizedListingParams({ market, slug })
  if (listingParams) {
    return generateListingMetadata({ params: listingParams })
  }

  const [categorySlug, ...segments] = slug
  const landing = await resolveGeoLandingRoute(market, categorySlug, segments)
  if (landing) {
    return { robots: { index: false, follow: true } }
  }

  return {}
}

export default async function LocalizedMarketPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string; slug: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { market: marketCode, slug } = await params
  const normalizedMarket = normalizeBillingMarket(marketCode)
  const locale = resolveMarketLocale(marketCode)
  if (!locale) notFound()

  const slugPath = slug.join('/')
  if (removedPublicPages.has(slugPath)) {
    notFound()
  }

  if (slugPath === 'app') {
    return <AppDownloadPage locale={locale} marketCode={normalizedMarket.toUpperCase()} />
  }

  if (slugPath === 'safety-tips') {
    return <PublicInfoPage page="safety-tips" />
  }

  const helpCenterRoute = resolveHelpCenterRoute(slug)
  if (helpCenterRoute) {
    if (helpCenterRoute.type === 'home') {
      return (
        <main className="overflow-x-hidden bg-white text-[#101828]">
          <PublicHeader locale={locale} marketCode={normalizedMarket.toUpperCase()} />
          <section className="border-b border-[#dfe6f2] bg-white">
            <div className="mx-auto w-full max-w-[var(--autorell-page-max)] px-5 py-10 sm:px-8 sm:py-14">
              <FaqPageClient locale={locale} />
            </div>
          </section>
          <PublicFooter locale={locale} />
        </main>
      )
    }
    if (helpCenterRoute.type === 'category') {
      return (
        <main className="overflow-x-hidden bg-white text-[#101828]">
          <PublicHeader locale={locale} marketCode={normalizedMarket.toUpperCase()} />
          <HelpCenterCategory locale={locale} marketCode={normalizedMarket.toUpperCase()} categorySlug={helpCenterRoute.categorySlug} />
          <PublicFooter locale={locale} />
        </main>
      )
    }
    return (
      <main className="overflow-x-hidden bg-white text-[#101828]">
        <PublicHeader locale={locale} marketCode={normalizedMarket.toUpperCase()} />
        <HelpCenterArticlePage
          locale={locale}
          marketCode={normalizedMarket.toUpperCase()}
          categorySlug={helpCenterRoute.categorySlug}
          articleSlug={helpCenterRoute.articleSlug}
        />
        <PublicFooter locale={locale} />
      </main>
    )
  }

  const listingParams = localizedListingParams({ market: marketCode, slug })
  if (listingParams) {
    return <ListingDetailPage params={listingParams} />
  }

  const [categorySlug, ...geoSegments] = slug
  const geoLanding = await resolveGeoLandingRoute(marketCode, categorySlug, geoSegments)
  if (geoLanding) {
    redirect(buildGeoMarketplaceHref(geoLanding))
  }
  if (isGeoLandingCandidate(marketCode, categorySlug, geoSegments)) {
    notFound()
  }

  if (slugPath === 'login') {
    const query = await searchParams
    const rawNext = Array.isArray(query.next) ? query.next[0] : query.next
    const next = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.startsWith('/api/')
      ? rawNext
      : ''
    const loginParams = new URLSearchParams({ auth: 'login' })
    if (next) loginParams.set('next', next)
    redirect(`/${marketCode}?${loginParams.toString()}`)
  }

  if (slugPath === 'register' || slugPath === 'registrera') {
    return <RegisterPage searchParams={searchParams} />
  }

  if (slugPath === 'forgot-password') {
    redirect(`/${marketCode}?auth=forgot-password`)
  }

  if (slugPath === 'reset-password') {
    redirect(`/${marketCode}?auth=reset-password`)
  }

  if (slugPath === 'account/listings/new' || slugPath === 'konto/annonser/ny') {
    return renderNewListingPage({
      searchParams,
      marketCodeOverride: normalizedMarket.toUpperCase(),
      localeOverride: locale,
    })
  }

  if (slugPath === 'account/business/subscription' || slugPath === 'konto/business/subscription') {
    return <BusinessSubscriptionPage />
  }

  if (slugPath === 'account/business/subscription/cancel' || slugPath === 'konto/business/subscription/avsluta') {
    return <BusinessSubscriptionCancelPage />
  }

  if (slugPath === 'account/company') {
    return <CompanyOverviewPage />
  }

  if (slugPath === 'account/listings' || slugPath === 'konto/annonser' || slugPath === 'account/company/listings') {
    return <AccountListingsPage searchParams={searchParams} />
  }

  if (slugPath === 'account/listings/created' || slugPath === 'konto/annonser/klar') {
    return <ListingCreatedPage searchParams={searchParams} />
  }

  if (slugPath === 'account/company/listings/create') {
    return renderNewListingPage({
      searchParams,
      marketCodeOverride: normalizedMarket.toUpperCase(),
      localeOverride: locale,
    })
  }

  if (slugPath === 'account/company/import') {
    return <CompanyImportPage />
  }

  if (slugPath === 'account/company/inventory' || slugPath === 'business/dashboard/inventory') {
    return <CompanyInventoryPage />
  }

  if (slugPath === 'account/company/analytics') {
    return <CompanyAnalyticsPage />
  }

  if (slugPath === 'account/company/locations') {
    return <CompanyLocationsPage />
  }

  if (slugPath === 'account/company/team') {
    return <CompanyTeamPage />
  }

  if (slugPath === 'account/company/team/accept') {
    return <AcceptCompanyTeamInvitationPage searchParams={searchParams} />
  }

  if (slugPath === 'company/team/accept') {
    return <AcceptCompanyTeamInvitationPage searchParams={searchParams} />
  }

  if (slugPath === 'account/company/subscription') {
    return <BusinessSubscriptionPage />
  }

  if (slugPath === 'account/company/subscription/cancel') {
    return <BusinessSubscriptionCancelPage />
  }

  if (slugPath === 'account/company/profile') {
    return <CompanyProfilePage />
  }

  if (slugPath === 'account/company/settings') {
    return <CompanySettingsPage />
  }

  if (slugPath === 'account/company/support') {
    return <CompanySupportPage />
  }

  if (slugPath === 'account/business/status' || slugPath === 'konto/business/status') {
    return <BusinessStatusPage />
  }

  if (slugPath === 'account/payments' || slugPath === 'konto/betalningar') {
    return <PaymentsPage />
  }

  if (slugPath === 'account/saved-listings') {
    return <AccountSavedListingsPage />
  }

  if (slugPath === 'saved' || slugPath === 'sparade') {
    return <SavedListingsPage />
  }

  if (slugPath === 'account/saved-searches' || slugPath === 'saved-searches') {
    return <AccountSavedSearchesPage />
  }

  if (slugPath === 'account/profile') {
    return <PrivateProfilePage />
  }

  if (slugPath === 'account/settings') {
    return <PrivateSettingsPage />
  }

  if (slugPath === 'account/support') {
    return <PrivateSupportPage />
  }

  if (slugPath === 'pricing') {
    return <PricingPage locale={locale} market={normalizedMarket} marketCode={normalizedMarket.toUpperCase()} />
  }

  if (slugPath === 'business') {
    return <BusinessPage />
  }

  if (slugPath === 'business/pilot') {
    return <BusinessPilotPage />
  }

  if (slugPath === 'business/inventory-import') {
    return <InventoryImportPage />
  }

  return <BusinessMarketplaceHome locale={locale} marketCode={normalizedMarket.toUpperCase()} />
}

function resolveMarketLocale(code: string): PublicLocale | null {
  if (code === 'se') return 'sv'
  if (code === 'de') return 'de'
  if (code === 'dk') return 'da'
  const market = getEuBuyerMarket(code)
  if (!market) return null
  return marketLocale(market.code, market.language)
}

function resolveHelpCenterRoute(slug: string[]) {
  const [root, categorySlug, articleSlug] = slug
  if (root !== 'help-center' && root !== 'hjalpcenter' && root !== 'vanliga-fragor') return null
  if (!categorySlug) return { type: 'home' as const }
  const category = getHelpCenterCategory(categorySlug)
  if (!category) return null
  if (!articleSlug) return { type: 'category' as const, categorySlug: category.slug }
  const article = getHelpCenterArticle(category.slug, articleSlug)
  if (!article) return null
  return { type: 'article' as const, categorySlug: category.slug, articleSlug: article.slug }
}

function marketLocale(code: string, language: string): PublicLocale {
  if (code === 'at') return 'at'
  if (code === 'be') return 'be'
  return language as PublicLocale
}
