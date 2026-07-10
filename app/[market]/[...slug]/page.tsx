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
  return <BusinessMarketplaceHome locale={marketLocale(market.code, market.language)} marketCode={market.code} />
}

function marketLocale(code: string, language: string): PublicLocale {
  if (code === 'at') return 'at'
  if (code === 'be') return 'be'
  return language as PublicLocale
}
