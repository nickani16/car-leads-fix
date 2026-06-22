import BusinessMarketplaceHome from '../components/BusinessMarketplaceHome'
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
    "Europe's marketplace for vehicles",
  )} | Autorell`
  const description = translatePublic(
    locale,
    'Buy and sell cars, vans, motorcycles, leisure vehicles and machinery across Europe — for private sellers and businesses.',
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
  return <BusinessMarketplaceHome locale={locale} />
}
