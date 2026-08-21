import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BusinessMarketplaceHome from '@/app/components/BusinessMarketplaceHome'
import {
  euBuyerMarkets,
  getEuBuyerMarket,
} from '@/lib/eu-buyer-markets'
import { createSeoMetadata, getMarketHomeSeo } from '@/lib/market-seo'
import { type PublicLocale } from '@/lib/public-i18n'
import { getPublicLanguageAlternates, publicUrlForLocale } from '@/lib/public-seo'
import { getHomepageCategorySeo } from '@/lib/homepage-category-config'

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
  const languages = getPublicLanguageAlternates('/')

  if (marketCode === 'se' || marketCode === 'de') {
    const locale = marketCode === 'se' ? 'sv' : 'de'
    const marketLabel = marketCode === 'se' ? 'Sverige' : 'Deutschland'
    return createSeoMetadata({
      seo: {
        ...getMarketHomeSeo(marketCode),
        ...getHomepageCategorySeo(locale, 'cars', marketLabel),
      },
      canonical: publicUrlForLocale(marketCode === 'se' ? 'sv' : 'de'),
      alternates: { languages },
    })
  }

  const market = getEuBuyerMarket(marketCode)
  if (!market) return {}

  const canonical = `https://www.autorell.com/${market.code}`
  const locale = marketLocale(market.code, market.language)
  return createSeoMetadata({
    seo: {
      ...getMarketHomeSeo(market.code),
      ...getHomepageCategorySeo(locale, 'cars', market.countryLocal || market.country),
    },
    canonical,
    alternates: { languages },
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
