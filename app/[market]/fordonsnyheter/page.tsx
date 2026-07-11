import { notFound } from 'next/navigation'
import VehicleNewsPage from '@/app/components/VehicleNewsPage'
import { euBuyerMarkets, getEuBuyerMarket } from '@/lib/eu-buyer-markets'
import type { PublicLocale } from '@/lib/public-i18n'

type LocalizedVehicleNewsPageProps = {
  params: Promise<{ market: string }>
}

export function generateStaticParams() {
  return [
    { market: 'se' },
    { market: 'de' },
    ...euBuyerMarkets.map((market) => ({ market: market.code })),
  ]
}

export default async function LocalizedVehicleNewsPage({ params }: LocalizedVehicleNewsPageProps) {
  const { market: marketCode } = await params
  if (marketCode === 'se') return <VehicleNewsPage locale="sv" marketCode="SE" />
  if (marketCode === 'de') return <VehicleNewsPage locale="de" marketCode="DE" />

  const market = getEuBuyerMarket(marketCode)
  if (!market) notFound()

  return (
    <VehicleNewsPage
      locale={marketLocale(market.code, market.language)}
      marketCode={market.code.toUpperCase()}
    />
  )
}

function marketLocale(code: string, language: string): PublicLocale {
  if (code === 'at') return 'at'
  if (code === 'be') return 'be'
  return language as PublicLocale
}
