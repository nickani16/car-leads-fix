import BuyerMarketPage from '../components/BuyerMarketPage'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'European Vehicle Sourcing for Dealers | Autorell',
  description:
    'Source selected modern vehicles through structured B2B auctions, verified inspections and cross-border transactions coordinated by Autorell.',
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
    'inspected Swedish vehicles',
    'vehicle export from Sweden',
    'cross-border dealer sourcing',
    'electric vehicles for dealers',
    'modern used cars wholesale',
  ],
})

export default function EuropeanVehiclePage() {
  return <BuyerMarketPage locale="en" />
}
