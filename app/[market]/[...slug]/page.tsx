import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import InternationalMarketPage from '@/app/components/InternationalMarketPage'
import { euBuyerMarkets, getEuBuyerMarket } from '@/lib/eu-buyer-markets'
import {
  getInternationalSite,
  internationalPageKeys,
  isInternationalPageKey,
} from '@/lib/international-public-site'

type LocalizedPageProps = {
  params: Promise<{ market: string; slug: string[] }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return euBuyerMarkets.flatMap((market) =>
    internationalPageKeys.map((page) => ({
      market: market.code,
      slug: [page],
    })),
  )
}

export async function generateMetadata({
  params,
}: LocalizedPageProps): Promise<Metadata> {
  const { market: marketCode, slug } = await params
  const site = getInternationalSite(marketCode)
  const page = slug[0]

  if (!site || slug.length !== 1 || !isInternationalPageKey(page)) return {}

  const label = page === 'how-it-works'
    ? site.navigation.process
    : page === 'dealer-benefits'
      ? site.navigation.benefits
      : site.navigation[page]
  const canonical = `https://www.autorell.com/${marketCode}/${page}`

  return {
    title: { absolute: `${label} | Autorell ${site.market.countryLocal}` },
    description: site.copy.intro,
    alternates: { canonical },
    openGraph: {
      title: label,
      description: site.copy.intro,
      url: canonical,
      siteName: 'Autorell',
      type: 'website',
    },
  }
}

export default async function LocalizedPage({ params }: LocalizedPageProps) {
  const { market, slug } = await params
  const page = slug[0]

  if (
    !getEuBuyerMarket(market) ||
    slug.length !== 1 ||
    !isInternationalPageKey(page)
  ) {
    notFound()
  }

  return <InternationalMarketPage marketCode={market} page={page} />
}
