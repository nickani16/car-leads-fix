import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BusinessMarketplaceHome from '@/app/components/BusinessMarketplaceHome'
import {
  euBuyerMarkets,
  getEuBuyerHubAlternates,
  getEuBuyerMarket,
} from '@/lib/eu-buyer-markets'
import { createSeoMetadata, getMarketHomeSeo } from '@/lib/market-seo'
import { type PublicLocale } from '@/lib/public-i18n'

type MarketPageProps = {
  params: Promise<{ market: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return [
    { market: 'se' },
    ...euBuyerMarkets.map((market) => ({ market: market.code })),
  ]
}

export async function generateMetadata({
  params,
}: MarketPageProps): Promise<Metadata> {
  const { market: marketCode } = await params

  if (marketCode === 'se' || marketCode === 'de') {
    return createSeoMetadata({
      seo: getMarketHomeSeo(marketCode),
      canonical: `https://www.autorell.com/${marketCode}`,
    })
  }

  const market = getEuBuyerMarket(marketCode)
  if (!market) return {}

  const canonical = `https://www.autorell.com/${market.code}`
  return createSeoMetadata({
    seo: getMarketHomeSeo(market.code),
    canonical,
    alternates: { canonical, languages: getEuBuyerHubAlternates() },
  })
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { market: marketCode } = await params
  if (marketCode === 'se') {
    return <BusinessMarketplaceHome locale="sv" marketCode="SE" />
  }
  if (marketCode === 'de') {
    return <BusinessMarketplaceHome locale="de" marketCode="DE" />
  }
  const market = getEuBuyerMarket(marketCode)
  if (!market) notFound()
  return (
    <BusinessMarketplaceHome
      locale={marketLocale(market.code, market.language)}
      marketCode={market.code}
    />
  )
}

function marketLocale(code: string, language: string): PublicLocale {
  if (code === 'at') return 'at'
  if (code === 'be') return 'be'
  return language as PublicLocale
}
