import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import WhyChooseAutorellPage, {
  generateWhyChooseAutorellMetadataForMarket,
} from '@/app/components/WhyChooseAutorellPage'
import { normalizeBillingMarket } from '@/lib/billing/product-catalog'
import { getEuBuyerMarket } from '@/lib/eu-buyer-markets'
import type { PublicLocale } from '@/lib/public-i18n'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ market: string }> }): Promise<Metadata> {
  const { market } = await params
  const locale = resolveMarketLocale(market)
  if (!locale) return {}
  return generateWhyChooseAutorellMetadataForMarket(locale, normalizeBillingMarket(market).toUpperCase())
}

export default async function LocalizedSellCarPage({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params
  const locale = resolveMarketLocale(market)
  if (!locale) notFound()
  return <WhyChooseAutorellPage localeOverride={locale} marketCodeOverride={normalizeBillingMarket(market).toUpperCase()} />
}

function resolveMarketLocale(code: string): PublicLocale | null {
  if (code === 'se') return 'sv'
  if (code === 'de') return 'de'
  if (code === 'dk') return 'da'
  const market = getEuBuyerMarket(code)
  if (!market) return null
  if (market.code === 'at') return 'at'
  if (market.code === 'be') return 'be'
  return market.language as PublicLocale
}
