import { notFound } from 'next/navigation'
import BusinessMarketplaceHome from '@/app/components/BusinessMarketplaceHome'
import PricingPage from '@/app/components/PricingPage'
import { renderNewListingPage } from '@/app/konto/annonser/ny/page'
import { normalizeBillingMarket } from '@/lib/billing/product-catalog'
import { getEuBuyerMarket } from '@/lib/eu-buyer-markets'
import type { PublicLocale } from '@/lib/public-i18n'

export default async function LocalizedMarketPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string; slug: string[] }>
  searchParams: Promise<{ category?: string }>
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
