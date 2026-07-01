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
  return [
    { market: 'se' },
    ...euBuyerMarkets.map((market) => ({ market: market.code })),
  ]
}

export async function generateMetadata({
  params,
}: MarketPageProps): Promise<Metadata> {
  const { market: marketCode } = await params
  if (marketCode === 'se') {
    return {
      title: { absolute: 'Europas marknadsplats för fordon | Autorell' },
      description:
        'Köp och sälj bilar, transportbilar, motorcyklar, fritidsfordon och maskiner över hela Europa.',
      alternates: { canonical: 'https://www.autorell.com/se' },
    }
  }
  if (marketCode === 'de') {
    return {
      title: { absolute: 'Europas Marktplatz für Fahrzeuge | Autorell' },
      description:
        'Fahrzeuge und Maschinen in ganz Europa kaufen und verkaufen.',
      alternates: { canonical: 'https://www.autorell.com/de' },
    }
  }
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
      locale={market.language as PublicLocale}
      marketCode={market.code}
    />
  )
}
