import type { Metadata } from 'next'
import { headers } from 'next/headers'
import BusinessMarketplaceHome from './components/BusinessMarketplaceHome'
import { createSeoMetadata, getMarketHomeSeo } from '@/lib/market-seo'
import { getPublicLanguageAlternates, publicUrlForLocale } from '@/lib/public-seo'
import { getHomepageCategorySeo } from '@/lib/homepage-category-config'
import { getAuthSeoCopy } from '@/lib/auth-copy'

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getRootMarket() {
  const requestHeaders = await headers()
  const requestedLanguage = requestHeaders.get('x-autorell-language')
  if (requestedLanguage === 'sv' || requestedLanguage === 'de' || requestedLanguage === 'en') {
    return requestedLanguage
  }
  return 'en'
}

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const market = await getRootMarket()
  const query = await searchParams
  const auth = Array.isArray(query.auth) ? query.auth[0] : query.auth
  if (auth === 'login' || auth === 'register') {
    const seo = getAuthSeoCopy(market, auth)
    return {
      title: { absolute: seo.title },
      description: seo.description,
      robots: { index: false, follow: true },
    }
  }
  const languages = getPublicLanguageAlternates('/')

  if (market === 'de') {
    return createSeoMetadata({
      seo: {
        ...getMarketHomeSeo('de'),
        ...getHomepageCategorySeo('de', 'cars', 'Deutschland'),
      },
      canonical: publicUrlForLocale('de'),
      alternates: { languages },
    })
  }

  if (market === 'en') {
    return createSeoMetadata({
      seo: {
        ...getMarketHomeSeo('eu'),
        ...getHomepageCategorySeo('en', 'cars', 'Europe'),
      },
      canonical: 'https://www.autorell.com',
      alternates: { languages },
    })
  }

  return createSeoMetadata({
    seo: {
      ...getMarketHomeSeo('se'),
      ...getHomepageCategorySeo('sv', 'cars', 'Sverige'),
    },
    canonical: publicUrlForLocale('sv'),
    alternates: { languages },
  })
}

export default async function HomePage() {
  const market = await getRootMarket()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined

  return <BusinessMarketplaceHome locale={market} marketCode={marketCode} />
}
