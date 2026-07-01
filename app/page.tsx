import type { Metadata } from 'next'
import { headers } from 'next/headers'
import BusinessMarketplaceHome from './components/BusinessMarketplaceHome'
import { createPublicMetadata } from '@/lib/public-seo'

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

  if (market === 'de') {
    return createPublicMetadata({
      title: 'Europas Marktplatz für Fahrzeuge | Autorell',
      description:
        'Fahrzeuge und Maschinen in ganz Europa kaufen und verkaufen — für Privatpersonen und Unternehmen.',
      path: '/',
      locale: 'de',
    })
  }

  if (market === 'en') {
    return createPublicMetadata({
      title: "Europe's marketplace for vehicles | Autorell",
      description:
        'Buy and sell cars, vans, motorcycles, leisure vehicles and machinery across Europe — for private sellers and businesses.',
      path: '/',
      locale: 'en',
    })
  }

  return createPublicMetadata({
    title: 'Europas marknadsplats för fordon | Autorell',
    description:
      'Köp och sälj bilar, transportbilar, motorcyklar, fritidsfordon och maskiner över hela Europa — för privatpersoner och företag.',
    path: '/',
  })
}

export default async function HomePage() {
  const market = await getRootMarket()
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined

  return <BusinessMarketplaceHome locale={market} marketCode={marketCode} />
}
