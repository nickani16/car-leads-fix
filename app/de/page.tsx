import BusinessMarketplaceHome from '../components/BusinessMarketplaceHome'
import { createSeoMetadata, getMarketHomeSeo } from '@/lib/market-seo'
import { getPublicLanguageAlternates, publicUrlForLocale } from '@/lib/public-seo'

export const metadata = createSeoMetadata({
  seo: getMarketHomeSeo('de'),
  canonical: publicUrlForLocale('de'),
  alternates: { languages: getPublicLanguageAlternates('/') },
})

export default function GermanVehiclePage() {
  return <BusinessMarketplaceHome locale="de" />
}
