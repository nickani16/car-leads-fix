import { notFound } from 'next/navigation'
import BusinessMarketplaceHome from '@/app/components/BusinessMarketplaceHome'
import { getEuBuyerMarket } from '@/lib/eu-buyer-markets'
import type { PublicLocale } from '@/lib/public-i18n'

export default async function LocalizedMarketPage({
  params,
}: {
  params: Promise<{ market: string; slug: string[] }>
}) {
  const { market: marketCode } = await params
  const market = getEuBuyerMarket(marketCode)
  if (!market) notFound()
  return <BusinessMarketplaceHome locale={market.language as PublicLocale} />
}
