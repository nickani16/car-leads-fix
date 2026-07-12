import { headers } from 'next/headers'
import { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'
import LocalizedPricingPage from '@/app/components/PricingPage'
import { normalizeBillingMarket } from '@/lib/billing/product-catalog'
import type { PublicLocale } from '@/lib/public-i18n'

export const generateMetadata = generatePublicInfoMetadata('pricing')

export default async function PricingPage() {
  const headerStore = await headers()
  const locale = (headerStore.get('x-autorell-language') || 'en') as PublicLocale
  const market = normalizeBillingMarket(headerStore.get('x-autorell-market'))
  return <LocalizedPricingPage locale={locale} market={market} marketCode={market.toUpperCase()} />
}
