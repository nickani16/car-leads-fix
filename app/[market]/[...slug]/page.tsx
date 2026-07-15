import { notFound } from 'next/navigation'
import BusinessMarketplaceHome from '@/app/components/BusinessMarketplaceHome'
import PricingPage from '@/app/components/PricingPage'
import { renderNewListingPage } from '@/app/konto/annonser/ny/page'
import AccountListingsPage from '@/app/konto/annonser/page'
import AccountSavedListingsPage from '@/app/account/saved-listings/page'
import AccountSavedSearchesPage from '@/app/account/saved-searches/page'
import { normalizeBillingMarket } from '@/lib/billing/product-catalog'
import { getEuBuyerMarket } from '@/lib/eu-buyer-markets'
import type { PublicLocale } from '@/lib/public-i18n'
import BusinessSubscriptionPage from '@/app/konto/business/subscription/page'
import BusinessSubscriptionCancelPage from '@/app/konto/business/subscription/cancel/page'
import BusinessStatusPage from '@/app/konto/business/status/page'
import PaymentsPage from '@/app/konto/betalningar/page'
import CompanyOverviewPage from '@/app/account/company/page'
import CompanyImportPage from '@/app/account/company/import/page'
import CompanyAnalyticsPage from '@/app/account/company/analytics/page'
import CompanyTeamPage from '@/app/account/company/team/page'
import AcceptCompanyTeamInvitationPage from '@/app/account/company/team/accept/page'
import CompanyProfilePage from '@/app/account/company/profile/page'
import CompanySettingsPage from '@/app/account/company/settings/page'
import CompanySupportPage from '@/app/account/company/support/page'

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
  if (slugPath === 'account/listings/new' || slugPath === 'konto/annonser/ny') {
    return renderNewListingPage({
      searchParams,
      marketCodeOverride: normalizedMarket.toUpperCase(),
      localeOverride: locale,
    })
  }

  if (slugPath === 'account/business/subscription' || slugPath === 'konto/business/subscription') {
    return <BusinessSubscriptionPage localeOverride={locale} marketOverride={normalizedMarket} />
  }

  if (slugPath === 'account/business/subscription/cancel' || slugPath === 'konto/business/subscription/avsluta') {
    return <BusinessSubscriptionCancelPage localeOverride={locale} marketOverride={normalizedMarket} />
  }

  if (slugPath === 'account/company') {
    return <CompanyOverviewPage localeOverride={locale} />
  }

  if (slugPath === 'account/company/listings') {
    return <AccountListingsPage searchParams={searchParams} />
  }

  if (slugPath === 'account/company/listings/create') {
    return renderNewListingPage({
      searchParams,
      marketCodeOverride: normalizedMarket.toUpperCase(),
      localeOverride: locale,
    })
  }

  if (slugPath === 'account/company/import') {
    return <CompanyImportPage localeOverride={locale} />
  }

  if (slugPath === 'account/company/analytics') {
    return <CompanyAnalyticsPage localeOverride={locale} />
  }

  if (slugPath === 'account/company/team') {
    return <CompanyTeamPage localeOverride={locale} />
  }

  if (slugPath === 'account/company/team/accept') {
    return <AcceptCompanyTeamInvitationPage searchParams={searchParams} />
  }

  if (slugPath === 'company/team/accept') {
    return <AcceptCompanyTeamInvitationPage searchParams={searchParams} />
  }

  if (slugPath === 'account/company/subscription') {
    return <BusinessSubscriptionPage localeOverride={locale} marketOverride={normalizedMarket} />
  }

  if (slugPath === 'account/company/subscription/cancel') {
    return <BusinessSubscriptionCancelPage localeOverride={locale} marketOverride={normalizedMarket} />
  }

  if (slugPath === 'account/company/profile') {
    return <CompanyProfilePage localeOverride={locale} />
  }

  if (slugPath === 'account/company/settings') {
    return <CompanySettingsPage localeOverride={locale} />
  }

  if (slugPath === 'account/company/support') {
    return <CompanySupportPage localeOverride={locale} />
  }

  if (slugPath === 'account/business/status' || slugPath === 'konto/business/status') {
    return <BusinessStatusPage />
  }

  if (slugPath === 'account/payments' || slugPath === 'konto/betalningar') {
    return <PaymentsPage />
  }

  if (slugPath === 'account/saved-listings' || slugPath === 'saved' || slugPath === 'sparade') {
    return <AccountSavedListingsPage />
  }

  if (slugPath === 'account/saved-searches' || slugPath === 'saved-searches') {
    return <AccountSavedSearchesPage />
  }

  if (slugPath === 'pricing') {
    return <PricingPage locale={locale} market={normalizedMarket} marketCode={normalizedMarket.toUpperCase()} />
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

function marketLocale(code: string, language: string): PublicLocale {
  if (code === 'at') return 'at'
  if (code === 'be') return 'be'
  return language as PublicLocale
}
