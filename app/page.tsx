import type { Metadata } from 'next'
import { headers } from 'next/headers'
import BuyerMarketPage from './components/BuyerMarketPage'
import BusinessMarketplaceHome from './components/BusinessMarketplaceHome'
import { createPublicMetadata } from '@/lib/public-seo'

async function getRootMarket() {
  const requestHeaders = await headers()
  const hostname = (
    requestHeaders.get('host') ||
    requestHeaders.get('x-forwarded-host') ||
    ''
  )
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase()

  if (hostname.endsWith('autorell.de')) return 'de'
  if (hostname.endsWith('autorell.com')) return 'en'
  return 'sv'
}

export async function generateMetadata(): Promise<Metadata> {
  const market = await getRootMarket()

  if (market === 'de') {
    return createPublicMetadata({
      title: 'B2B Marktplatz für Fahrzeuge und Maschinen | Autorell',
      description:
        'Autorell entwickelt einen B2B-Marktplatz für gewerbliche Anbieter und professionelle Käufer in mehreren Fahrzeug- und Maschinenkategorien.',
      path: '/',
      locale: 'de',
    })
  }

  if (market === 'en') {
    return createPublicMetadata({
      title: 'B2B marketplace for vehicles and machinery | Autorell',
      description:
        'Autorell is a B2B marketplace where verified companies list vehicles, machinery and mobility products for professional buyers.',
      path: '/',
      locale: 'en',
    })
  }

  return createPublicMetadata({
    title: 'Köp och sälj alla typer av fordon i Europa | Autorell',
    description:
      'Sök, jämför, köp och sälj bilar, transportbilar, motorcyklar, fritidsfordon och maskiner på Autorells europeiska fordonsmarknad.',
    path: '/',
  })
}

export default async function HomePage() {
  const market = await getRootMarket()

  if (market === 'de') return <BuyerMarketPage locale="de" />
  if (market === 'en') return <BuyerMarketPage locale="en" />
  return <BusinessMarketplaceHome />
}
