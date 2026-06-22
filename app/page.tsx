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
    title: 'B2B marketplace för fordon och maskiner | Autorell',
    description:
      'Autorell är en B2B marketplace där verifierade företag listar fordon, maskiner och mobilitetsprodukter för professionella köpare.',
    path: '/',
  })
}

export default async function HomePage() {
  const market = await getRootMarket()

  if (market === 'de') return <BuyerMarketPage locale="de" />
  if (market === 'en') return <BuyerMarketPage locale="en" />
  return <BusinessMarketplaceHome />
}
