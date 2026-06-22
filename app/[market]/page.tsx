import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BusinessMarketplaceHome from '@/app/components/BusinessMarketplaceHome'
import {
  euBuyerMarkets,
  getEuBuyerHreflang,
  getEuBuyerHubAlternates,
  getEuBuyerMarket,
} from '@/lib/eu-buyer-markets'
import { translatePublic, type PublicLocale } from '@/lib/public-i18n'

type MarketPageProps = {
  params: Promise<{ market: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return euBuyerMarkets.map((market) => ({ market: market.code }))
}

export async function generateMetadata({
  params,
}: MarketPageProps): Promise<Metadata> {
  const { market: marketCode } = await params
  const market = getEuBuyerMarket(marketCode)
  if (!market) return {}
  const canonical = `https://www.autorell.com/${market.code}`
  const title = `${market.countryLocal} · ${translatePublic(
    market.language,
    "Europe's vehicle marketplace",
  )} | Autorell`
  const description = translatePublic(
    market.language,
    'One connected marketplace for private sellers and businesses. Find the right vehicle, reach more buyers and trade with greater confidence across borders.',
  )
  return {
    title: { absolute: title },
    description,
    alternates: { canonical, languages: getEuBuyerHubAlternates() },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Autorell',
      locale: getEuBuyerHreflang(market).replace('-', '_'),
      type: 'website',
    },
  }
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { market: marketCode } = await params
  const market = getEuBuyerMarket(marketCode)
  if (!market) notFound()
  return (
    <BusinessMarketplaceHome
      locale={market.language as PublicLocale}
      marketCode={market.code}
    />
  )
}
