import BuyerMarketPage from '../components/BuyerMarketPage'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'Inspected Swedish Vehicles for European Dealers | Autorell',
  description:
    'Source Swedish vehicles through B2B bidding with buyer funds secured, on-site inspection, contracts, export documents and coordinated collection.',
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
