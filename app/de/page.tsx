import BusinessMarketplaceHome from '../components/BusinessMarketplaceHome'
import { createSeoMetadata, getMarketHomeSeo } from '@/lib/market-seo'

export const metadata = createSeoMetadata({
  seo: getMarketHomeSeo('de'),
  canonical: 'https://www.autorell.com/de',
})

export default function GermanVehiclePage() {
  return <BusinessMarketplaceHome locale="de" />
}
