import type { Metadata } from 'next'
import EuBuyerPage, {
  generateMetadata as generateEuBuyerMetadata,
} from '@/app/eu-buyer/[market]/[city]/page'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'

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
  const { market } = await params
  return generateEuBuyerMetadata({
    params: Promise.resolve({ market, city: 'index' }),
  })
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { market } = await params
  return EuBuyerPage({
    params: Promise.resolve({ market, city: 'index' }),
  })
}
