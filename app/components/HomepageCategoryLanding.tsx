import type { Metadata } from 'next'
import { headers } from 'next/headers'
import BusinessMarketplaceHome from './BusinessMarketplaceHome'
import { getEuCountryName } from '@/lib/eu-countries'
import { countryForLocale } from '@/lib/market-locale'
import { createSeoMetadata, getMarketHomeSeo } from '@/lib/market-seo'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import { getHomepageCategorySeo } from '@/lib/homepage-category-config'
import { homepageCategoryPath } from '@/lib/homepage-category-routes'
import {
  getPublicLanguageAlternates,
  publicUrlForLocale,
} from '@/lib/public-seo'
import {
  isPublicLanguage,
  type PublicLocale,
} from '@/lib/public-i18n'

type HomepageCategoryContext = {
  locale: PublicLocale
  marketCode: string
}

export async function resolveHomepageCategoryContext(
  overrides: Partial<HomepageCategoryContext> = {},
): Promise<HomepageCategoryContext> {
  if (overrides.locale && overrides.marketCode) {
    return { locale: overrides.locale, marketCode: overrides.marketCode.toUpperCase() }
  }

  const requestHeaders = await headers()
  const requestedLanguage = requestHeaders.get('x-autorell-language') || ''
  const requestedMarket = (overrides.marketCode || requestHeaders.get('x-autorell-market') || '').toUpperCase()
  const locale = overrides.locale || localeFromRequest(requestedLanguage, requestedMarket)
  return {
    locale,
    marketCode: requestedMarket || countryForLocale(locale) || 'EU',
  }
}

export async function buildHomepageCategoryMetadata({
  category,
  locale,
  marketCode,
}: {
  category: MarketplaceCategorySlug
  locale?: PublicLocale
  marketCode?: string
}): Promise<Metadata> {
  const context = await resolveHomepageCategoryContext({ locale, marketCode })
  const categoryPath = homepageCategoryPath(category)
  const canonical = publicUrlForLocale(context.locale, categoryPath)
  const marketLabel = context.marketCode === 'EU'
    ? 'Europe'
    : getEuCountryName(context.marketCode, context.locale)

  return createSeoMetadata({
    seo: {
      ...getMarketHomeSeo(context.marketCode.toLowerCase()),
      ...getHomepageCategorySeo(context.locale, category, marketLabel),
    },
    canonical,
    alternates: {
      languages: getPublicLanguageAlternates(categoryPath),
    },
  })
}

export function createHomepageCategoryMetadata(category: MarketplaceCategorySlug) {
  return () => buildHomepageCategoryMetadata({ category })
}

export default async function HomepageCategoryLanding({
  category,
  locale,
  marketCode,
}: {
  category: MarketplaceCategorySlug
  locale?: PublicLocale
  marketCode?: string
}) {
  const context = await resolveHomepageCategoryContext({ locale, marketCode })
  return (
    <BusinessMarketplaceHome
      locale={context.locale}
      marketCode={context.marketCode}
      initialCategory={category}
    />
  )
}

function localeFromRequest(language: string, marketCode: string): PublicLocale {
  if (marketCode === 'SE' || language === 'sv') return 'sv'
  if (marketCode === 'DE' || language === 'de') return 'de'
  if (marketCode === 'AT') return 'at'
  if (marketCode === 'BE') return 'be'
  return isPublicLanguage(language) ? language : 'en'
}
