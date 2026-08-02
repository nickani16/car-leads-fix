import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AppComingSoonPage from '@/app/components/AppComingSoonPage'
import { getAppDownloadCopy } from '@/lib/app-download'
import { euBuyerMarkets, getEuBuyerMarket } from '@/lib/eu-buyer-markets'
import type { PublicLocale } from '@/lib/public-i18n'

type LocalizedAppPageProps = {
  params: Promise<{ market: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return [
    { market: 'se' },
    { market: 'de' },
    ...euBuyerMarkets.map((market) => ({ market: market.code })),
  ]
}

export async function generateMetadata({
  params,
}: LocalizedAppPageProps): Promise<Metadata> {
  const { market } = await params
  const locale = resolveMarketLocale(market)
  if (!locale) return {}
  const copy = getAppDownloadCopy(locale)
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    alternates: {
      canonical: `https://www.autorell.com/${market}/app`,
    },
  }
}

export default async function LocalizedAppPage({ params }: LocalizedAppPageProps) {
  const { market } = await params
  const locale = resolveMarketLocale(market)
  if (!locale) notFound()

  return <AppComingSoonPage locale={locale} marketCode={market.toUpperCase()} />
}

function resolveMarketLocale(code: string): PublicLocale | null {
  if (code === 'se') return 'sv'
  if (code === 'de') return 'de'
  if (code === 'dk') return 'da'
  const market = getEuBuyerMarket(code)
  if (!market) return null
  if (market.code === 'at') return 'at'
  if (market.code === 'be') return 'be'
  if (isKnownPublicLocale(market.language)) return market.language
  return 'en'
}

function isKnownPublicLocale(value: string): value is PublicLocale {
  return [
    'sv',
    'de',
    'en',
    'at',
    'be',
    'fr',
    'es',
    'it',
    'pl',
    'nl',
    'fi',
    'da',
  ].includes(value)
}
