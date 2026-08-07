import BusinessMarketplaceHome from '../components/BusinessMarketplaceHome'
import { createSeoMetadata, getMarketHomeSeo } from '@/lib/market-seo'
import { getPublicLanguageAlternates } from '@/lib/public-seo'

export const metadata = createSeoMetadata({
  seo: getMarketHomeSeo('de'),
  canonical: 'https://www.autorell.com/de',
  alternates: { languages: getPublicLanguageAlternates('/') },
})

export default function GermanVehiclePage() {
  return <BusinessMarketplaceHome locale="de" />
}
