import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import PublicHeader from '@/app/components/PublicHeader'
import VehicleSearchExperience, {
  type VehicleSearchListing,
} from '@/app/components/VehicleSearchExperience'
import {
  displayCurrencyForMarket,
  formatMarketplacePriceDisplay,
  getMarketplaceExchangeRates,
} from '@/lib/currency-rates'
import { euCountryCodes, getEuCountryName } from '@/lib/eu-countries'
import {
  getMarketplaceCategory,
  isLeasingMarketplaceCategory,
  marketplaceCategories,
  marketplaceCategoryAliases,
  marketplaceLanguage,
  normalizeMarketplaceCategory,
} from '@/lib/marketplace'
import {
  getMarketplaceSellerPublicProfiles,
  getPublishedMarketplaceCategoryListings,
} from '@/lib/marketplace-public-data'
import { searchMarketplaceListings } from '@/lib/marketplace-search-v2'
import {
  isPublicLanguage,
  localizePublicHref,
  stripLocalePrefix,
  translatePublic,
  type PublicLocale,
} from '@/lib/public-i18n'
import { getPublicLanguageAlternates, publicHostForLocale } from '@/lib/public-seo'
import {
  normalizeSearchBounds,
  parseMarketplaceSearchState,
  resolveMarketplaceGeoArea,
} from '@/lib/marketplace-search-state'
import {
  resolveStaticMarketplaceGeoArea,
  resolveStaticMarketplaceGeoAreaBySlug,
} from '@/lib/marketplace-geo'
import {
  applyMarketplaceSearchModeParams,
  getMarketplaceSearchSeo,
  resolveMarketplaceSearchMode,
} from '@/lib/marketplace-search-seo'
import {
  getSeoCategoryPath,
  resolveGeoLandingRoute,
  type GeoLandingRoute,
} from '@/lib/seo-geo-landings'

type MarketplaceCategoryPageProps = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  seoLanding?: GeoLandingRoute | null
}

export function generateStaticParams() {
  return [{ category: 'vehicles' }, ...marketplaceCategories.map(({ slug }) => ({ category: slug }))]
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const { category: requestedCategory } = await params
  const resolvedSearchParams = await searchParams
  const explicitCategory = getExplicitMarketplaceCategory(resolvedSearchParams)
  const metadataMode = getSearchMode(resolvedSearchParams)
  const requestedMetadataCategory = explicitCategory || requestedCategory
  const metadataCategory = metadataMode === 'leasing' && requestedMetadataCategory !== 'vehicles' && !isLeasingMarketplaceCategory(requestedMetadataCategory)
    ? 'cars'
    : requestedMetadataCategory
  const category = metadataCategory === 'vehicles'
    ? getAggregateMarketplaceCategory()
    : getMarketplaceCategory(metadataCategory)
  const requestHeaders = await headers()
  const requestedLanguage = requestHeaders.get('x-autorell-language')
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const locale: PublicLocale =
    marketCode?.toUpperCase() === 'AT'
      ? 'at'
      : marketCode?.toUpperCase() === 'BE'
        ? 'be'
        : requestedLanguage === 'sv' || requestedLanguage === 'de'
          ? requestedLanguage
          : requestedLanguage && isPublicLanguage(requestedLanguage)
            ? requestedLanguage
            : 'en'
  const host = publicHostForLocale(locale)
  const filter = getSearchParam(resolvedSearchParams, 'filter')
  const metadataMarkets = getSearchParamList(resolvedSearchParams, 'markets')
  const metadataCountry = getSearchParam(resolvedSearchParams, 'country').toUpperCase()
  if (!metadataMarkets.length && metadataCountry) metadataMarkets.push(metadataCountry)
  const metadataSearch = parseMarketplaceSearchState(getSearchParam(resolvedSearchParams, 'q') || filter, {
    markets: metadataMarkets,
  })
  const metadataGeoValue =
    getSearchParam(resolvedSearchParams, 'geoAreaId') ||
    getSearchParam(resolvedSearchParams, 'geoPlaceCode')
  const metadataLocationHint =
    getSearchParam(resolvedSearchParams, 'chips') ||
    getSearchParam(resolvedSearchParams, 'city') ||
    getSearchParam(resolvedSearchParams, 'municipality') ||
    getSearchParam(resolvedSearchParams, 'region')
  const metadataGeoArea =
    resolveMarketplaceGeoArea(metadataGeoValue) ||
    resolveStaticMarketplaceGeoArea(metadataGeoValue) ||
    (marketCode && metadataLocationHint
      ? resolveStaticMarketplaceGeoAreaBySlug(marketCode, metadataLocationHint)
      : null) ||
    metadataSearch.geoArea
  const metadataMake = getSearchParam(resolvedSearchParams, 'make') || metadataSearch.make
  const metadataModel = getSearchParam(resolvedSearchParams, 'model') || (metadataMake ? metadataSearch.query : '')
  const metadataFreeText = metadataMake ? '' : metadataSearch.query || getSearchParam(resolvedSearchParams, 'q')
  const metadataCondition = getSearchParam(resolvedSearchParams, 'condition') || filter
  const pathname = requestHeaders.get('x-autorell-pathname')
  const metadataUsesPageMarket = usesPageMarket(metadataMarkets, marketCode)
  const localizedCategoryPath = category.slug !== 'vehicles' && marketCode && metadataMode !== 'all' && metadataUsesPageMarket
    ? getSeoCategoryPath(marketCode.toLowerCase(), category.slug, metadataMode === 'leasing')
    : null
  const canonicalPath = localizedCategoryPath || pathname || `/marketplace/${category.slug}`
  const canResolveCanonicalLanding = !metadataFreeText && !metadataCondition && (
    !metadataLocationHint || Boolean(metadataGeoArea)
  )
  const canonicalLanding = localizedCategoryPath && marketCode && metadataMode !== 'all' && canResolveCanonicalLanding
    ? await resolveCanonicalSeoLanding({
        market: marketCode.toLowerCase(),
        categoryPath: localizedCategoryPath,
        make: metadataMake,
        model: metadataModel,
        place: metadataGeoArea,
      })
    : null
  const seo = canonicalLanding
    ? { title: canonicalLanding.title, description: canonicalLanding.description }
    : getMarketplaceSearchSeo({
        locale,
        category: category.slug,
        allVehicles: category.slug === 'vehicles',
        mode: metadataMode,
        make: metadataMake,
        model: metadataModel,
        freeText: metadataFreeText,
        place:
          metadataGeoArea?.name ||
          metadataLocationHint ||
          getMetadataMarketName(metadataMarkets, marketCode, locale),
        condition: metadataCondition,
      })
  const marketplaceSeo = resolveMarketplaceSeoCanonical(
    resolvedSearchParams,
    canonicalPath,
    canonicalLanding?.canonicalPath,
    host,
  )
  const canonical = marketplaceSeo.canonical || (
    filter
      ? `${host}${canonicalPath}?filter=${encodeURIComponent(filter)}`
      : `${host}${canonicalPath}`
  )
  const { title, description } = seo
  const canonicalUrl = new URL(canonical)
  const alternatePath = `${stripLocalePrefix(canonicalUrl.pathname)}${canonicalUrl.search}`

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: canonicalLanding ? undefined : getPublicLanguageAlternates(alternatePath),
    },
    robots: marketplaceSeo.robots,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Autorell',
      type: 'website',
    },
  }
}

export default function MarketplaceCategoryPage(
  props: Omit<MarketplaceCategoryPageProps, 'seoLanding'>,
) {
  return renderMarketplaceCategoryPage(props as MarketplaceCategoryPageProps)
}

async function renderMarketplaceCategoryPage({
  params,
  searchParams,
  seoLanding = null,
}: MarketplaceCategoryPageProps) {
  const { category: requestedCategory } = await params
  const resolvedSearchParams = await searchParams
  if (requestedCategory === 'all' || requestedCategory === 'all-vehicles' || requestedCategory === 'alla-fordon') {
    permanentRedirect('/marketplace')
  }
  if (marketplaceCategoryAliases[requestedCategory]) {
    permanentRedirect(`/marketplace/${marketplaceCategoryAliases[requestedCategory]}`)
  }
  if (requestedCategory !== 'vehicles' && !marketplaceCategories.some(({ slug }) => slug === requestedCategory)) {
    notFound()
  }

  const category = requestedCategory === 'vehicles'
    ? getAggregateMarketplaceCategory()
    : getMarketplaceCategory(requestedCategory)
  const requestHeaders = await headers()
  const requestedLanguage = requestHeaders.get('x-autorell-language')
  const marketCode = seoLanding?.countryCode || requestHeaders.get('x-autorell-market') || undefined
  const requestedCountry = getSearchParam(resolvedSearchParams, 'country').toUpperCase()
  const requestedMarkets = getSearchParamList(resolvedSearchParams, 'markets')
    .map((value) => value.toUpperCase())
    .filter((value) => value === 'EU' || euCountryCodes.has(value))
  const requestedCategories = getSearchParamList(resolvedSearchParams, 'categories')
  const automaticCountry =
    marketCode && euCountryCodes.has(marketCode.toUpperCase())
      ? marketCode.toUpperCase()
      : requestedLanguage === 'sv'
        ? 'SE'
        : requestedLanguage === 'de'
          ? 'DE'
          : ''
  const defaultCountry =
    requestedMarkets.find((value) => value !== 'EU') ||
    requestedCountry ||
    automaticCountry
  const locale: PublicLocale = seoLanding?.locale || (
    marketCode?.toUpperCase() === 'AT'
      ? 'at'
      : marketCode?.toUpperCase() === 'BE'
        ? 'be'
        : requestedLanguage === 'sv' || requestedLanguage === 'de'
          ? requestedLanguage
          : requestedLanguage && isPublicLanguage(requestedLanguage)
            ? requestedLanguage
            : 'en'
  )
  const explicitCategory = getExplicitMarketplaceCategory(resolvedSearchParams)
  const requestedMode = getSearchMode(resolvedSearchParams)
  const routeCategory = explicitCategory || requestedCategory
  const normalizedRouteCategory = requestedMode === 'leasing' && !isLeasingMarketplaceCategory(routeCategory)
    ? 'cars'
    : routeCategory
  if (!seoLanding && (explicitCategory || normalizedRouteCategory !== requestedCategory)) {
    permanentRedirect(getMarketplaceCategoryRedirectHref(locale, normalizedRouteCategory, resolvedSearchParams))
  }
  if (!seoLanding) {
    const normalizedModeHref = getMarketplaceModeRedirectHref(locale, requestedCategory, resolvedSearchParams)
    if (normalizedModeHref) permanentRedirect(normalizedModeHref)
  }
  const language = marketplaceLanguage(locale)
  const label =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? category.labels[language]
      : translatePublic(locale, category.labels.en)
  const displayCurrency = displayCurrencyForMarket(marketCode || defaultCountry)
  const initialMarkets = requestedMarkets.length ? requestedMarkets : requestedCountry ? [requestedCountry] : []
  const initialQuery = getSearchParam(resolvedSearchParams, 'q') || getSearchParam(resolvedSearchParams, 'filter')
  const parsedInitialSearch = parseMarketplaceSearchState(initialQuery, {
    markets: initialMarkets,
  })
  const initialGeoArea =
    seoLanding?.place || resolveMarketplaceGeoArea(
      getSearchParam(resolvedSearchParams, 'geoAreaId') ||
      getSearchParam(resolvedSearchParams, 'geoPlaceCode'),
    ) || parsedInitialSearch.geoArea
  const initialGeoBounds = normalizeSearchBounds({
    north: getSearchParam(resolvedSearchParams, 'north'),
    east: getSearchParam(resolvedSearchParams, 'east'),
    south: getSearchParam(resolvedSearchParams, 'south'),
    west: getSearchParam(resolvedSearchParams, 'west'),
  }) || initialGeoArea?.bounds || null
  const initialSearchChips = getSearchParamList(resolvedSearchParams, 'chips')
  if (!initialSearchChips.length && initialGeoArea) {
    initialSearchChips.push(initialGeoArea.name)
  }
  const initialMaxPrice =
    getSearchParam(resolvedSearchParams, 'maxPrice') ||
    (parsedInitialSearch.maxPrice ? String(parsedInitialSearch.maxPrice) : '')

  const fetchedData = seoLanding
    ? await getSeoLandingListings(seoLanding)
    : await getPublishedMarketplaceCategoryListings(
        requestedCategory === 'vehicles' ? 'vehicles' : normalizeMarketplaceCategory(requestedCategory),
        requestedCategory === 'vehicles' ? 360 : 240,
      )
  const data = preferMarketplaceCountry(fetchedData || [], automaticCountry)
  const sellerProfiles = await getMarketplaceSellerPublicProfiles(
    (data || []).map((listing) => listing.seller_user_id).filter(Boolean),
  )
  const exchangeRates = (data || []).some((listing) => listing.currency !== displayCurrency)
    ? await getMarketplaceExchangeRates()
    : undefined

  const listings: VehicleSearchListing[] = await Promise.all(
    (data || []).map(async (listing) => {
      const sellerProfile = sellerProfiles.get(listing.seller_user_id || '')
      const price = await formatMarketplacePriceDisplay({
        amount: Number(listing.price),
        currency: listing.currency,
        locale,
        targetCurrency: displayCurrency,
        exchangeRates,
      })

      return {
        id: listing.id,
        category: listing.category,
        title: listing.title,
        make: listing.make || '',
        model: listing.model || '',
        year: listing.model_year ? String(listing.model_year) : null,
        mileageKm: listing.mileage_km,
        operatingHours: listing.operating_hours,
        fuelType: listing.fuel_type,
        gearbox: listing.gearbox,
        bodyType: listing.body_type,
        country: listing.country_code,
        region: listing.municipality || listing.city || '',
        city: listing.city,
        municipality: listing.municipality,
        latitude: typeof listing.latitude === 'number' ? listing.latitude : null,
        longitude: typeof listing.longitude === 'number' ? listing.longitude : null,
        priceLabel: price.label,
        priceValue: Number(listing.price),
        displayPriceValue: price.displayAmount,
        imageUrl: listing.images?.[0] || null,
        imageUrls: (listing.images || []).filter((image: unknown): image is string => typeof image === 'string' && Boolean(image)),
        sellerLogoUrl: sellerProfile?.logoUrl || null,
        sellerTrust: sellerProfile?.trust || 'unverified',
        sellerName: listing.seller_name,
        sellerIsTrader: listing.seller_type === 'business',
        sellerRatingAverage: sellerProfile?.ratingAverage ?? null,
        sellerRatingCount: sellerProfile?.ratingCount ?? 0,
        condition: listing.condition,
        color: listing.color,
        equipment: listing.equipment,
        description: listing.description,
        offerType: normalizeListingOfferType(listing.offer_type),
        leaseData: listing.lease_data && typeof listing.lease_data === 'object' && !Array.isArray(listing.lease_data)
          ? listing.lease_data as Record<string, unknown>
          : null,
        insuranceOffers: Array.isArray(listing.insurance_offers)
          ? listing.insurance_offers as VehicleSearchListing['insuranceOffers']
          : null,
      }
    }),
  )

  return (
    <>
      <PublicHeader
        locale={locale}
        marketCode={marketCode}
        marketplaceMode={requestedMode}
        marketplaceResultsPage
        marketplaceChannel={{
          label,
          slug: requestedCategory === 'vehicles' ? 'vehicles' : category.slug,
        }}
      />
      <VehicleSearchExperience
        listings={listings}
        locale={locale}
        defaultCountry={defaultCountry}
        automaticCountry={automaticCountry}
        initialMarkets={initialMarkets}
        initialCategories={requestedCategories}
        initialCategory={requestedCategory === 'vehicles' ? 'all' : category.slug}
        initialQuery={initialQuery}
        initialSearchChips={initialSearchChips}
        initialMake={getSearchParam(resolvedSearchParams, 'make') || parsedInitialSearch.make}
        initialModel={getSearchParam(resolvedSearchParams, 'model')}
        initialRegion={seoLanding ? '' : getSearchParam(resolvedSearchParams, 'region') || getSearchParam(resolvedSearchParams, 'county') || initialGeoArea?.region || ''}
        initialCity={seoLanding ? '' : getSearchParam(resolvedSearchParams, 'city') || initialGeoArea?.locality || ''}
        initialMunicipality={seoLanding ? '' : getSearchParam(resolvedSearchParams, 'municipality') || initialGeoArea?.municipality || ''}
        initialGeoAreaId={initialGeoArea?.id || ''}
        initialGeoBounds={initialGeoBounds}
        initialGeoFilterMode={initialGeoArea ? 'strict' : 'legacy'}
        initialMinPrice={getSearchParam(resolvedSearchParams, 'minPrice')}
        initialMaxPrice={initialMaxPrice}
        initialMode={getSearchMode(resolvedSearchParams)}
        initialModeExplicit={
          hasSearchParam(resolvedSearchParams, 'mode') ||
          hasSearchParam(resolvedSearchParams, 'intent') ||
          hasSearchParam(resolvedSearchParams, 'offerType') ||
          getBooleanSearchParam(resolvedSearchParams, 'leasingPossible')
        }
        initialMinYear={getSearchParam(resolvedSearchParams, 'minYear')}
        initialMaxYear={getSearchParam(resolvedSearchParams, 'maxYear')}
        initialMinMileage={getSearchParam(resolvedSearchParams, 'minMileage')}
        initialMaxMileage={getSearchParam(resolvedSearchParams, 'maxMileage')}
        initialMinOperatingHours={getSearchParam(resolvedSearchParams, 'minOperatingHours')}
        initialMaxOperatingHours={getSearchParam(resolvedSearchParams, 'maxOperatingHours')}
        initialFuel={getSearchParam(resolvedSearchParams, 'fuel')}
        initialGearbox={getSearchParam(resolvedSearchParams, 'gearbox')}
        initialBodyType={getSearchParam(resolvedSearchParams, 'bodyType')}
        initialCondition={getSearchParam(resolvedSearchParams, 'condition')}
        initialColor={getSearchParam(resolvedSearchParams, 'color')}
        initialSellerType={getSearchParam(resolvedSearchParams, 'sellerType') || 'all'}
        initialVerifiedOnly={getBooleanSearchParam(resolvedSearchParams, 'verifiedOnly')}
        initialFourWheelDrive={getBooleanSearchParam(resolvedSearchParams, 'fourWheelDrive')}
        initialLeasingPossible={getBooleanSearchParam(resolvedSearchParams, 'leasingPossible')}
        initialEquipmentQuery={getSearchParam(resolvedSearchParams, 'equipment')}
        initialSortBy={getSearchParam(resolvedSearchParams, 'sort') || 'published'}
        initialPage={Math.max(1, Number.parseInt(getSearchParam(resolvedSearchParams, 'page') || '1', 10) || 1)}
        seoLanding={seoLanding ? {
          h1: seoLanding.h1,
          description: seoLanding.description,
          zeroResultsText: seoLanding.zeroResultsText,
          breadcrumbs: seoLanding.breadcrumbs,
          relatedLinks: seoLanding.relatedLinks,
        } : undefined}
        preserveCanonicalUrl={Boolean(seoLanding)}
        syncCategoryRoute={!seoLanding}
      />
    </>
  )
}

async function getSeoLandingListings(landing: GeoLandingRoute) {
  try {
    const result = await searchMarketplaceListings({
      categories: landing.category,
      markets: landing.countryCode,
      make: landing.make,
      model: landing.model,
      geoAreaId: landing.place?.id,
      geoFilterMode: landing.place ? 'strict' : 'legacy',
      mode: landing.leasing ? 'leasing' : 'sale',
      offerType: landing.leasing ? 'lease' : 'sale',
      limit: 48,
    })
    return result.items as Awaited<ReturnType<typeof getPublishedMarketplaceCategoryListings>>
  } catch {
    return [] as Awaited<ReturnType<typeof getPublishedMarketplaceCategoryListings>>
  }
}

function getSearchParam(
  params: { [key: string]: string | string[] | undefined },
  key: string,
) {
  const value = params[key]
  return Array.isArray(value) ? value[0] || '' : value || ''
}

function hasSearchParam(
  params: { [key: string]: string | string[] | undefined },
  key: string,
) {
  const value = params[key]
  return Array.isArray(value) ? value.some((item) => String(item || '').trim()) : Boolean(String(value || '').trim())
}

function normalizeListingOfferType(value: unknown): VehicleSearchListing['offerType'] {
  return value === 'lease' || value === 'sale_and_lease' || value === 'sale' ? value : null
}

function getSearchParamList(
  params: { [key: string]: string | string[] | undefined },
  key: string,
) {
  const value = params[key]
  const values = Array.isArray(value) ? value : [value]
  return values
    .flatMap((item) => String(item || '').split(','))
    .map((item) => item.trim())
    .filter(Boolean)
}

function getExplicitMarketplaceCategory(
  params: { [key: string]: string | string[] | undefined },
) {
  const category = getSearchParamList(params, 'categories')[0]
  if (!category) return ''
  const normalized = marketplaceCategoryAliases[category] || category
  return marketplaceCategories.some(({ slug }) => slug === normalized) ? normalized : ''
}

function getMarketplaceCategoryRedirectHref(
  locale: PublicLocale,
  category: string,
  params: { [key: string]: string | string[] | undefined },
) {
  const mode = getSearchMode(params)
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (
      key === 'categories' ||
      key === 'mode' ||
      key === 'offerType' ||
      key === 'intent' ||
      (key === 'leasingPossible' && mode === 'leasing') ||
      value === undefined
    ) return
    const values = Array.isArray(value) ? value : [value]
    values.forEach((item) => query.append(key, item))
  })
  applyMarketplaceSearchModeParams(query, mode)
  const pathname = localizePublicHref(locale, `/marketplace/${category}`)
  return query.size ? `${pathname}?${query.toString()}` : pathname
}

function getMarketplaceModeRedirectHref(
  locale: PublicLocale,
  category: string,
  params: { [key: string]: string | string[] | undefined },
) {
  const mode = getSearchMode(params)
  const expectedMode = mode === 'all' ? '' : mode
  const expectedOfferType = mode === 'sale' ? 'sale' : mode === 'leasing' ? 'lease' : ''
  const currentMode = getSearchParam(params, 'mode').toLowerCase()
  const currentOfferType = getSearchParam(params, 'offerType').toLowerCase()
  const hasLegacyIntent = hasSearchParam(params, 'intent')
  const hasRedundantLeasingPossible = mode === 'leasing' && hasSearchParam(params, 'leasingPossible')

  if (
    currentMode === expectedMode &&
    currentOfferType === expectedOfferType &&
    !hasLegacyIntent &&
    !hasRedundantLeasingPossible
  ) {
    return null
  }

  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (
      key === 'mode' ||
      key === 'offerType' ||
      key === 'intent' ||
      (key === 'leasingPossible' && mode === 'leasing') ||
      value === undefined
    ) return
    const values = Array.isArray(value) ? value : [value]
    values.forEach((item) => query.append(key, item))
  })
  applyMarketplaceSearchModeParams(query, mode)

  const pathname = localizePublicHref(locale, `/marketplace/${category}`)
  return query.size ? `${pathname}?${query.toString()}` : pathname
}

function getBooleanSearchParam(
  params: { [key: string]: string | string[] | undefined },
  key: string,
) {
  const value = getSearchParam(params, key).toLowerCase()
  return value === '1' || value === 'true' || value === 'yes'
}

function getSearchMode(
  params: { [key: string]: string | string[] | undefined },
) {
  return resolveMarketplaceSearchMode({
    mode: getSearchParam(params, 'mode'),
    intent: getSearchParam(params, 'intent'),
    offerType: getSearchParam(params, 'offerType'),
    leasingPossible: getSearchParam(params, 'leasingPossible'),
  })
}

function getMetadataMarketName(
  markets: string[],
  marketCode: string | undefined,
  locale: PublicLocale,
) {
  const normalizedMarkets = markets.map((value) => value.toUpperCase())
  if (normalizedMarkets.some((value) => value === 'EU' || value === 'ALL')) {
    return getLocalizedEuropeName(locale)
  }
  const selected = normalizedMarkets
    .filter((value) => euCountryCodes.has(value))
  if (selected.length > 1) return getLocalizedEuropeName(locale)
  const countryCode = selected.length === 1
    ? selected[0]
    : marketCode && euCountryCodes.has(marketCode.toUpperCase())
      ? marketCode.toUpperCase()
      : ''
  return countryCode ? getEuCountryName(countryCode, locale) : ''
}

function usesPageMarket(markets: string[], marketCode: string | undefined) {
  if (!markets.length) return true
  if (!marketCode) return false
  const normalized = [...new Set(markets.map((value) => value.toUpperCase()).filter(Boolean))]
  return normalized.length === 1 && normalized[0] === marketCode.toUpperCase()
}

function preferMarketplaceCountry<T extends { country_code?: string | null }>(listings: T[], countryCode: string) {
  const preferredCountry = countryCode.toUpperCase()
  if (!preferredCountry) return listings
  const local: T[] = []
  const other: T[] = []
  for (const listing of listings) {
    if ((listing.country_code || '').toUpperCase() === preferredCountry) local.push(listing)
    else other.push(listing)
  }
  return [...local, ...other]
}

function getLocalizedEuropeName(locale: PublicLocale) {
  const effectiveLocale = locale === 'at' ? 'de' : locale === 'be' ? 'nl' : locale
  return ({
    sv: 'Europa',
    de: 'Europa',
    en: 'Europe',
    fr: 'Europe',
    es: 'Europa',
    it: 'Europa',
    pl: 'Europa',
    nl: 'Europa',
    da: 'Europa',
    fi: 'Eurooppa',
  } satisfies Record<Exclude<PublicLocale, 'at' | 'be'>, string>)[effectiveLocale]
}

function getAggregateMarketplaceCategory() {
  return {
    slug: 'vehicles',
    labels: {
      sv: 'Alla fordon',
      en: 'All vehicles',
      de: 'Alle Fahrzeuge',
    },
    singular: {
      sv: 'fordon',
      en: 'vehicle',
      de: 'Fahrzeug',
    },
  } as const
}

function resolveMarketplaceSeoCanonical(
  params: { [key: string]: string | string[] | undefined },
  fallbackPath: string,
  cleanSeoPath?: string | null,
  host = 'https://www.autorell.com',
) {
  const meaningfulParams = canonicalSearchParams(params)
  if (!meaningfulParams.size) {
    return {
      canonical: `${host}${fallbackPath}`,
      robots: { index: true, follow: true },
    }
  }

  return {
    canonical: `${host}${cleanSeoPath || fallbackPath}`,
    robots: {
      index: false,
      follow: true,
    },
  }
}

async function resolveCanonicalSeoLanding({
  market,
  categoryPath,
  make,
  model,
  place,
}: {
  market: string
  categoryPath: string
  make: string
  model: string
  place: ReturnType<typeof resolveStaticMarketplaceGeoAreaBySlug> | ReturnType<typeof resolveMarketplaceGeoArea>
}) {
  const categorySlug = categoryPath.split('/').filter(Boolean).at(-1)
  if (!categorySlug) return null
  const segments = [make, model, place?.slug].filter(Boolean) as string[]
  return resolveGeoLandingRoute(market, categorySlug, segments)
}

function canonicalSearchParams(params: { [key: string]: string | string[] | undefined }) {
  const ignored = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'])
  const searchParams = new URLSearchParams()
  for (const key of Object.keys(params).sort()) {
    if (ignored.has(key)) continue
    const value = params[key]
    const values = Array.isArray(value) ? value : [value]
    for (const item of values) {
      if (item) searchParams.append(key, item)
    }
  }
  return searchParams
}


