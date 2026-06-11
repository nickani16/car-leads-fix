import BuyerMarketPage from '../components/BuyerMarketPage'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'Swedish Car Auctions for European Dealers | Autorell',
  description:
    'Source selected Swedish vehicles through structured data, online dealer auctions and a digital cross-border buying platform built for European car dealers.',
  path: '/',
  locale: 'en',
  keywords: [
    'Swedish car auctions',
    'vehicles from Sweden',
    'European dealer marketplace',
    'B2B car auctions',
    'car sourcing platform',
    'wholesale vehicles Europe',
    'dealer vehicle auctions',
  ],
})

export default function EuropeanVehiclePage() {
  return <BuyerMarketPage locale="en" />
}
