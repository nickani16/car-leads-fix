import BusinessMarketplaceHome from '../components/BusinessMarketplaceHome'
import { headers } from 'next/headers'
import { createSeoMetadata, getMarketHomeSeo } from '@/lib/market-seo'
import {
  isPublicLanguage,
  type PublicLanguage,
} from '@/lib/public-i18n'

export async function generateMetadata() {
  const headerStore = await headers()
  const requested = headerStore.get('x-autorell-language') || 'en'
  const locale: PublicLanguage = isPublicLanguage(requested) ? requested : 'en'
  const canonical =
    locale === 'en'
      ? 'https://www.autorell.com/'
      : `https://www.autorell.com/${locale}`

  return createSeoMetadata({
    seo: getMarketHomeSeo(locale),
    canonical,
  })
}

export default async function EuropeanVehiclePage() {
  const headerStore = await headers()
  const requested = headerStore.get('x-autorell-language') || 'en'
  const locale: PublicLanguage = isPublicLanguage(requested) ? requested : 'en'
  return <BusinessMarketplaceHome locale={locale} />
}
