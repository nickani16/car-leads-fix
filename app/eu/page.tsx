import BuyerMarketPage from '../components/BuyerMarketPage'
import { headers } from 'next/headers'
import {
  getPublicAlternates,
  isPublicLanguage,
  translatePublic,
  type PublicLanguage,
} from '@/lib/public-i18n'

export async function generateMetadata() {
  const headerStore = await headers()
  const requested = headerStore.get('x-autorell-language') || 'en'
  const locale: PublicLanguage = isPublicLanguage(requested) ? requested : 'en'

  const title = `${translatePublic(
    locale,
    'Swedish vehicle sourcing for European dealers',
  )} | Autorell`
  const description = translatePublic(
    locale,
    'Autorell tests Swedish vehicles anonymously across its European buyer network, purchases selected vehicles itself and resells them to the confirmed professional buyer.',
  )
  const canonical = `https://www.autorell.com/${locale}`

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: getPublicAlternates('/'),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Autorell',
      locale,
      type: 'website' as const,
    },
  }
}

export default async function EuropeanVehiclePage() {
  const headerStore = await headers()
  const requested = headerStore.get('x-autorell-language') || 'en'
  const locale: PublicLanguage = isPublicLanguage(requested) ? requested : 'en'
  return <BuyerMarketPage locale={locale} />
}
