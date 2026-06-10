import type { Metadata } from 'next'
import BuyerMarketPage from '../components/BuyerMarketPage'

export const metadata: Metadata = {
  title: 'Swedish vehicles for European dealers | Autorell',
  description:
    'Selected Swedish vehicles, structured data and 24-hour bidding for verified European dealers.',
}

export default function EuropeanVehiclePage() {
  return <BuyerMarketPage locale="en" />
}
