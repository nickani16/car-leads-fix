import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import InternationalMarketPage from '@/app/components/InternationalMarketPage'
import LocalizedCustomerSite from '@/app/components/LocalizedCustomerSite'
import { euBuyerMarkets, getEuBuyerMarket } from '@/lib/eu-buyer-markets'
import {
  getInternationalSite,
  internationalPageKeys,
  isInternationalPageKey,
} from '@/lib/international-public-site'
import {
  customerLocales,
  customerPageKeys,
  getCustomerAlternates,
  getCustomerCopy,
  isCustomerLocale,
  isCustomerPageKey,
} from '@/lib/customer-i18n'

type LocalizedPageProps = {
  params: Promise<{ market: string; slug: string[] }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return [
    ...euBuyerMarkets
      .filter((market) => !isCustomerLocale(market.code))
      .flatMap((market) =>
        internationalPageKeys.map((page) => ({
          market: market.code,
          slug: [page],
        })),
      ),
    ...customerLocales.flatMap((locale) =>
      customerPageKeys.map((page) => ({
        market: locale,
        slug: [page],
      })),
    ),
  ]
}

export async function generateMetadata({
  params,
}: LocalizedPageProps): Promise<Metadata> {
  const { market: marketCode, slug } = await params
  const page = slug[0]

  if (
    isCustomerLocale(marketCode) &&
    slug.length === 1 &&
    isCustomerPageKey(page)
  ) {
    const copy = getCustomerCopy(marketCode)
    const [title, description] = copy.pages[page]
    const canonical = `https://www.autorell.com/${marketCode}/${page}`

    return {
      title: { absolute: `${title} | Autorell` },
      description,
      alternates: {
        canonical,
        languages: getCustomerAlternates(page),
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: 'Autorell',
        locale: marketCode,
        type: 'website',
      },
    }
  }

  const site = getInternationalSite(marketCode)

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
    isCustomerLocale(market) &&
    slug.length === 1 &&
    isCustomerPageKey(page)
  ) {
    return <LocalizedCustomerSite locale={market} page={page} />
  }

  if (
    !getEuBuyerMarket(market) ||
    slug.length !== 1 ||
    !isInternationalPageKey(page)
  ) {
    notFound()
  }

  return <InternationalMarketPage marketCode={market} page={page} />
}
