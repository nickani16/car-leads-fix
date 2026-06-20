import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import InternationalMarketPage from '@/app/components/InternationalMarketPage'
import {
  euBuyerMarkets,
  getEuBuyerCopy,
  getEuBuyerHreflang,
  getEuBuyerHubAlternates,
  getEuBuyerMarket,
} from '@/lib/eu-buyer-markets'

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

  const copy = getEuBuyerCopy(market.language)
  const title = market.homeTitle || copy.countryTitle(market.countryLocal)
  const canonical = `https://www.autorell.com/${market.code}`

  return {
    title: { absolute: `${title} | Autorell` },
    description: copy.intro,
    alternates: {
      canonical,
      languages: getEuBuyerHubAlternates(),
    },
    openGraph: {
      title,
      description: copy.intro,
      url: canonical,
      siteName: 'Autorell',
      locale: getEuBuyerHreflang(market).replace('-', '_'),
      type: 'website',
    },
  }
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { market } = await params
  if (!getEuBuyerMarket(market)) notFound()

  return <InternationalMarketPage marketCode={market} />
}
