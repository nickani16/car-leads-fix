import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import WhyChooseAutorellPage, {
  generateWhyChooseAutorellMetadata,
} from '@/app/components/WhyChooseAutorellPage'
import { normalizeBillingMarket } from '@/lib/billing/product-catalog'
import { getEuBuyerMarket } from '@/lib/eu-buyer-markets'
import type { PublicLocale } from '@/lib/public-i18n'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ market: string }>
}): Promise<Metadata> {
  const { market } = await params
  const locale = resolveMarketLocale(market)
  if (!locale) return {}
  return generateWhyChooseAutorellMetadata(locale)
}

export default async function LocalizedBenefitsPage({
  params,
}: {
  params: Promise<{ market: string }>
}) {
  const { market } = await params
  const locale = resolveMarketLocale(market)
  if (!locale) notFound()
  const normalizedMarket = normalizeBillingMarket(market)
  return (
    <WhyChooseAutorellPage
      localeOverride={locale}
      marketCodeOverride={normalizedMarket.toUpperCase()}
    />
  )
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
