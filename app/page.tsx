import type { Metadata } from 'next'
import { headers } from 'next/headers'
import BusinessMarketplaceHome from './components/BusinessMarketplaceHome'
import { createSeoMetadata, getMarketHomeSeo } from '@/lib/market-seo'
import { getPublicLanguageAlternates } from '@/lib/public-seo'

async function getRootMarket() {
  const requestHeaders = await headers()
  const requestedLanguage = requestHeaders.get('x-autorell-language')
  if (requestedLanguage === 'sv' || requestedLanguage === 'de' || requestedLanguage === 'en') {
    return requestedLanguage
  }
  return 'en'
}

export async function generateMetadata(): Promise<Metadata> {
  const market = await getRootMarket()
  const languages = getPublicLanguageAlternates('/')

  if (market === 'de') {
    return createSeoMetadata({
      seo: getMarketHomeSeo('de'),
      canonical: 'https://www.autorell.com/de',
      alternates: { languages },
    })
  }

  if (market === 'en') {
    return createSeoMetadata({
      seo: getMarketHomeSeo('eu'),
      canonical: 'https://www.autorell.com',
      alternates: { languages },
    })
  }

  return createSeoMetadata({
    seo: getMarketHomeSeo('se'),
    canonical: 'https://www.autorell.com/se',
    alternates: { languages },
  })
}

export default async function HomePage() {
  const market = await getRootMarket()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined

  return <BusinessMarketplaceHome locale={market} marketCode={marketCode} />
}
