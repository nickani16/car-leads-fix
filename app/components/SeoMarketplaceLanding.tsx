import PublicHeader from '@/app/components/PublicHeader'
import VehicleSearchExperience from '@/app/components/VehicleSearchExperience'
import { getMarketplaceCategory, marketplaceLanguage } from '@/lib/marketplace'
import { translatePublic } from '@/lib/public-i18n'
import type { GeoLandingRoute } from '@/lib/seo-geo-landings'

export default function SeoMarketplaceLanding({ landing }: { landing: GeoLandingRoute }) {
  const category = getMarketplaceCategory(landing.category)
  const language = marketplaceLanguage(landing.locale)
  const label = landing.locale === 'sv' || landing.locale === 'de' || landing.locale === 'en'
    ? category.labels[language]
    : translatePublic(landing.locale, category.labels.en)

  return (
    <>
      <PublicHeader
        locale={landing.locale}
        marketCode={landing.countryCode}
        marketplaceMode={landing.leasing ? 'leasing' : 'sale'}
        marketplaceResultsPage
        marketplaceChannel={{ label, slug: category.slug }}
      />
      <VehicleSearchExperience
        listings={[]}
        locale={landing.locale}
        defaultCountry={landing.countryCode}
        automaticCountry={landing.countryCode}
        initialMarkets={[landing.countryCode]}
        initialCategories={[landing.category]}
        initialCategory={landing.category}
        initialSearchChips={landing.place ? [landing.place.name] : []}
        initialMake={landing.make || ''}
        initialModel={landing.model || ''}
        initialGeoAreaId={landing.place?.id || ''}
        initialGeoBounds={landing.place?.bounds || null}
        initialGeoFilterMode={landing.place ? 'strict' : 'legacy'}
        initialMode={landing.leasing ? 'leasing' : 'sale'}
        initialModeExplicit
        seoLanding={{
          h1: landing.h1,
          description: landing.description,
          zeroResultsText: landing.zeroResultsText,
          breadcrumbs: landing.breadcrumbs,
          relatedLinks: landing.relatedLinks,
        }}
        preserveCanonicalUrl
        syncCategoryRoute={false}
      />
    </>
  )
}
