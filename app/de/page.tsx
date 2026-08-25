import type { Metadata } from 'next'
import BusinessMarketplaceHome from '../components/BusinessMarketplaceHome'
import { createSeoMetadata, getMarketHomeSeo } from '@/lib/market-seo'
import { getPublicLanguageAlternates, publicUrlForLocale } from '@/lib/public-seo'
import { getAuthSeoCopy } from '@/lib/auth-copy'

type GermanVehiclePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: GermanVehiclePageProps): Promise<Metadata> {
  const query = await searchParams
  const auth = Array.isArray(query.auth) ? query.auth[0] : query.auth
  if (auth === 'login' || auth === 'register') {
    const seo = getAuthSeoCopy('de', auth)
    return {
      title: { absolute: seo.title },
      description: seo.description,
      robots: { index: false, follow: true },
    }
  }

  return createSeoMetadata({
    seo: getMarketHomeSeo('de'),
    canonical: publicUrlForLocale('de'),
    alternates: { languages: getPublicLanguageAlternates('/') },
  })
}

export default function GermanVehiclePage() {
  return <BusinessMarketplaceHome locale="de" />
}
