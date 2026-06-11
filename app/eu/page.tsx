import BuyerMarketPage from '../components/BuyerMarketPage'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'Modern Vehicles for European Car Dealers | Autorell',
  description:
    'Source selected vehicles from 2018 onwards, below 100,000 km, with structured data and digital B2B auctions for professional European dealers.',
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
    'electric vehicles for dealers',
    'modern used cars wholesale',
  ],
})

export default function EuropeanVehiclePage() {
  return <BuyerMarketPage locale="en" />
}
