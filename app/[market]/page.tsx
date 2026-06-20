import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import InternationalMarketPage from '@/app/components/InternationalMarketPage'
import LocalizedCustomerSite from '@/app/components/LocalizedCustomerSite'
import {
  euBuyerMarkets,
  getEuBuyerCopy,
  getEuBuyerHreflang,
  getEuBuyerHubAlternates,
  getEuBuyerMarket,
} from '@/lib/eu-buyer-markets'
import {
  customerLocales,
  getCustomerAlternates,
  getCustomerCopy,
  isCustomerLocale,
} from '@/lib/customer-i18n'

type MarketPageProps = {
  params: Promise<{ market: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return Array.from(
    new Set([
      ...euBuyerMarkets.map((market) => market.code),
      ...customerLocales,
    ]),
  ).map((market) => ({ market }))
}

export async function generateMetadata({
  params,
}: MarketPageProps): Promise<Metadata> {
  const { market: marketCode } = await params
  if (isCustomerLocale(marketCode)) {
    const copy = getCustomerCopy(marketCode)
    const canonical = `https://www.autorell.com/${marketCode}`

    return {
      title: { absolute: `${copy.hero[1]} | Autorell` },
      description: copy.hero[2],
      alternates: {
        canonical,
        languages: getCustomerAlternates(''),
      },
      openGraph: {
        title: copy.hero[1],
        description: copy.hero[2],
        url: canonical,
        siteName: 'Autorell',
        locale: marketCode,
        type: 'website',
      },
    }
  }

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
  if (isCustomerLocale(market)) {
    return <LocalizedCustomerSite locale={market} />
  }

  if (!getEuBuyerMarket(market)) notFound()

  return <InternationalMarketPage marketCode={market} />
}
