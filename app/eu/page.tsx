import BuyerMarketPage from '../components/BuyerMarketPage'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'Swedish vehicles for European dealers | Autorell',
  description:
    'Selected Swedish vehicles, structured data and 24-hour bidding for verified European dealers.',
  path: '/',
  locale: 'en',
})

export default function EuropeanVehiclePage() {
  return <BuyerMarketPage locale="en" />
}
