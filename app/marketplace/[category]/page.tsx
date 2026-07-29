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
import { euCountryCodes } from '@/lib/eu-countries'
import {
  getMarketplaceCategory,
  marketplaceCategories,
  marketplaceCategoryAliases,
  marketplaceLanguage,
  normalizeMarketplaceCategory,
} from '@/lib/marketplace'
import {
  getMarketplaceSellerPublicProfiles,
  getPublishedMarketplaceCategoryListings,
} from '@/lib/marketplace-public-data'
import {
  isPublicLanguage,
  translatePublic,
  type PublicLocale,
} from '@/lib/public-i18n'
import { cleanSeoText } from '@/lib/market-seo'
import {
  normalizeSearchBounds,
  parseMarketplaceSearchState,
  resolveMarketplaceGeoArea,
} from '@/lib/marketplace-search-state'

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
  const category = requestedCategory === 'vehicles'
    ? getAggregateMarketplaceCategory()
    : getMarketplaceCategory(requestedCategory)
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
  const language = marketplaceLanguage(locale)
  const label =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? category.labels[language]
      : translatePublic(locale, category.labels.en)
  const host = 'https://www.autorell.com'
  const filter = getSearchParam(resolvedSearchParams, 'filter')
  const metadataMarkets = getSearchParamList(resolvedSearchParams, 'markets')
  const metadataSearch = parseMarketplaceSearchState(getSearchParam(resolvedSearchParams, 'q') || filter, {
    markets: metadataMarkets,
  })
  const metadataGeoArea =
    resolveMarketplaceGeoArea(
      getSearchParam(resolvedSearchParams, 'geoAreaId') ||
      getSearchParam(resolvedSearchParams, 'geoPlaceCode'),
    ) || metadataSearch.geoArea
  const seo = metadataGeoArea
    ? getGeoMarketplaceSeoCopy(category.slug, label, locale, metadataGeoArea.name, metadataSearch.make)
    : getMarketplaceSeoCopy(category.slug, label, locale, metadataSearch.make || filter)
  const pathname = requestHeaders.get('x-autorell-pathname')
  const canonicalPath = pathname || `/marketplace/${category.slug}`
  const marketplaceSeo = resolveMarketplaceSeoCanonical(
    resolvedSearchParams,
    canonicalPath,
  )
  const canonical = marketplaceSeo.canonical || (
    filter
      ? `${host}${canonicalPath}?filter=${encodeURIComponent(filter)}`
      : `${host}${canonicalPath}`
  )
  const { title, description } = seo

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
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

export default async function MarketplaceCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
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
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
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
  const language = marketplaceLanguage(locale)
  const label =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? category.labels[language]
      : translatePublic(locale, category.labels.en)
  const displayCurrency = displayCurrencyForMarket(marketCode || defaultCountry)
  const initialMarkets = requestedMarkets.length ? requestedMarkets : requestedCountry ? [requestedCountry] : []
  const initialQuery = getSearchParam(resolvedSearchParams, 'q') || getSearchParam(resolvedSearchParams, 'filter')
  const parsedInitialSearch = parseMarketplaceSearchState(initialQuery, {
    markets: initialMarkets.length ? initialMarkets : [defaultCountry].filter(Boolean),
  })
  const initialGeoArea =
    resolveMarketplaceGeoArea(
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

  const data = await getPublishedMarketplaceCategoryListings(
    requestedCategory === 'vehicles' ? 'vehicles' : normalizeMarketplaceCategory(requestedCategory),
    requestedCategory === 'vehicles' ? 360 : 240,
  )
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
        offerType: normalizeListingOfferType(listing.offer_type),
        leaseData: listing.lease_data && typeof listing.lease_data === 'object' && !Array.isArray(listing.lease_data)
          ? listing.lease_data as Record<string, unknown>
          : null,
      }
    }),
  )

  return (
    <>
      <PublicHeader
        locale={locale}
        marketCode={marketCode}
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
        initialRegion={getSearchParam(resolvedSearchParams, 'region') || getSearchParam(resolvedSearchParams, 'county') || initialGeoArea?.region || ''}
        initialCity={getSearchParam(resolvedSearchParams, 'city') || initialGeoArea?.locality || ''}
        initialMunicipality={getSearchParam(resolvedSearchParams, 'municipality') || initialGeoArea?.municipality || ''}
        initialGeoAreaId={initialGeoArea?.id || ''}
        initialGeoBounds={initialGeoBounds}
        initialGeoFilterMode={initialGeoArea ? 'strict' : 'legacy'}
        initialMinPrice={getSearchParam(resolvedSearchParams, 'minPrice')}
        initialMaxPrice={initialMaxPrice}
        initialMode={getSearchMode(resolvedSearchParams)}
        initialModeExplicit={hasSearchParam(resolvedSearchParams, 'mode') || hasSearchParam(resolvedSearchParams, 'intent')}
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
      />
    </>
  )
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
  const value = (getSearchParam(params, 'mode') || getSearchParam(params, 'intent')).toLowerCase()
  if (value === 'sale' || value === 'leasing') return value
  return 'all'
}

function getMarketplaceSeoCopy(
  slug: string,
  label: string,
  locale: PublicLocale,
  filter?: string,
) {
  const normalizedFilter = normalizeFilterLabel(filter)
  const lowerLabel = label.toLocaleLowerCase()
  const allVehicles = slug === 'vehicles'
  const names = {
    sv: allVehicles ? 'Fordon' : label,
    de: allVehicles ? 'Fahrzeuge' : label,
    en: allVehicles ? 'Vehicles' : label,
    fr: allVehicles ? 'Véhicules' : label,
    es: allVehicles ? 'Vehículos' : label,
    it: allVehicles ? 'Veicoli' : label,
    pl: allVehicles ? 'Pojazdy' : label,
    nl: allVehicles ? 'Voertuigen' : label,
    da: allVehicles ? 'Køretøjer' : label,
    fi: allVehicles ? 'Ajoneuvot' : label,
  } as Partial<Record<PublicLocale, string>>
  const name = names[locale] || label
  const lowerName = name.toLocaleLowerCase()
  const copy = getMarketplaceSeoTemplates(locale, name, lowerName, lowerLabel)
  const title =
    normalizedFilter === 'used'
      ? copy.usedTitle
      : normalizedFilter === 'new'
        ? copy.newTitle
        : copy.baseTitle

  return {
    title: cleanSeoText(title, 65),
    description: cleanSeoText(copy.description, 150),
  }
}

function getGeoMarketplaceSeoCopy(
  slug: string,
  label: string,
  locale: PublicLocale,
  place: string,
  make?: string,
) {
  const allVehicles = slug === 'vehicles'
  const subject = make || (allVehicles ? getLocalizedVehicleName(locale) : label)
  const lowerSubject = subject.toLocaleLowerCase()
  const templates = {
    sv: {
      title: `${subject} till salu i ${place} | Autorell`,
      description: `Se ${lowerSubject} till salu i ${place}. J\u00e4mf\u00f6r annonser fr\u00e5n privata s\u00e4ljare och f\u00f6retag p\u00e5 Autorell.`,
    },
    de: {
      title: `${subject} kaufen in ${place} | Autorell`,
      description: `${subject} in ${place} suchen und vergleichen. Finden Sie Angebote von privaten und gewerblichen Verk\u00e4ufern auf Autorell.`,
    },
    fr: {
      title: `${subject} \u00e0 vendre \u00e0 ${place} | Autorell`,
      description: `Recherchez ${lowerSubject} \u00e0 vendre \u00e0 ${place}. Comparez les annonces de particuliers et professionnels sur Autorell.`,
    },
    es: {
      title: `${subject} en venta en ${place} | Autorell`,
      description: `Busca ${lowerSubject} en venta en ${place}. Compara anuncios de particulares y empresas en Autorell.`,
    },
    it: {
      title: `${subject} in vendita a ${place} | Autorell`,
      description: `Cerca ${lowerSubject} in vendita a ${place}. Confronta annunci di privati e aziende su Autorell.`,
    },
    pl: {
      title: `${subject} na sprzeda\u017c w ${place} | Autorell`,
      description: `Szukaj ${lowerSubject} na sprzeda\u017c w ${place}. Por\u00f3wnuj og\u0142oszenia prywatne i firmowe w Autorell.`,
    },
    nl: {
      title: `${subject} te koop in ${place} | Autorell`,
      description: `Zoek ${lowerSubject} te koop in ${place}. Vergelijk advertenties van particuliere en zakelijke verkopers op Autorell.`,
    },
    da: {
      title: `${subject} til salg i ${place} | Autorell`,
      description: `S\u00f8g ${lowerSubject} til salg i ${place}. Sammenlign annoncer fra private og virksomheder p\u00e5 Autorell.`,
    },
    fi: {
      title: `${subject} myynniss\u00e4 paikassa ${place} | Autorell`,
      description: `Etsi ${lowerSubject} myynniss\u00e4 paikassa ${place}. Vertaa yksityisten ja yritysten ilmoituksia Autorellissa.`,
    },
    en: {
      title: `${subject} for sale in ${place} | Autorell`,
      description: `Search ${lowerSubject} for sale in ${place}. Compare listings from private and business sellers on Autorell.`,
    },
  } as Partial<Record<PublicLocale, { title: string; description: string }>>
  const copy = templates[locale] || templates.en!
  return {
    title: cleanSeoText(copy.title, 65),
    description: cleanSeoText(copy.description, 150),
  }
}

function getLocalizedVehicleName(locale: PublicLocale) {
  return ({
    sv: 'Fordon',
    de: 'Fahrzeuge',
    fr: 'V\u00e9hicules',
    es: 'Veh\u00edculos',
    it: 'Veicoli',
    pl: 'Pojazdy',
    nl: 'Voertuigen',
    da: 'K\u00f8ret\u00f8jer',
    fi: 'Ajoneuvot',
    en: 'Vehicles',
  } as Partial<Record<PublicLocale, string>>)[locale] || 'Vehicles'
}

function getMarketplaceSeoTemplates(
  locale: PublicLocale,
  name: string,
  lowerName: string,
  lowerLabel: string,
) {
  const templates = {
    sv: {
      baseTitle: `${name} till salu | Begagnat och nytt | Autorell`,
      newTitle: `Nya ${lowerName} till salu | Autorell`,
      usedTitle: `Begagnade ${lowerName} till salu | Autorell`,
      description: `Sök ${lowerLabel} till salu. Jämför nya och begagnade annonser från privatpersoner och företag på Autorell.`,
    },
    de: {
      baseTitle: `${name} kaufen | Neu und gebraucht | Autorell`,
      newTitle: `Neue ${lowerName} kaufen | Autorell`,
      usedTitle: `Gebrauchte ${lowerName} kaufen | Autorell`,
      description: `${name} suchen und vergleichen. Finden Sie neue und gebrauchte Angebote von privaten und gewerblichen Verkäufern.`,
    },
    en: {
      baseTitle: `${name} for sale | Used and new | Autorell`,
      newTitle: `New ${lowerName} for sale | Autorell`,
      usedTitle: `Used ${lowerName} for sale | Autorell`,
      description: `Search ${lowerLabel} for sale. Compare used and new listings from private and business sellers on Autorell.`,
    },
    fr: {
      baseTitle: `${name} à vendre | Neuf et occasion | Autorell`,
      newTitle: `${name} neufs à vendre | Autorell`,
      usedTitle: `${name} d'occasion à vendre | Autorell`,
      description: `Recherchez ${lowerLabel} à vendre. Comparez annonces neuves et d'occasion de particuliers et professionnels sur Autorell.`,
    },
    es: {
      baseTitle: `${name} en venta | Nuevos y usados | Autorell`,
      newTitle: `${name} nuevos en venta | Autorell`,
      usedTitle: `${name} usados en venta | Autorell`,
      description: `Busca ${lowerLabel} en venta. Compara anuncios nuevos y usados de particulares y empresas en Autorell.`,
    },
    it: {
      baseTitle: `${name} in vendita | Nuovi e usati | Autorell`,
      newTitle: `${name} nuovi in vendita | Autorell`,
      usedTitle: `${name} usati in vendita | Autorell`,
      description: `Cerca ${lowerLabel} in vendita. Confronta annunci nuovi e usati di privati e aziende su Autorell.`,
    },
    pl: {
      baseTitle: `${name} na sprzedaż | Nowe i używane | Autorell`,
      newTitle: `Nowe ${lowerName} na sprzedaż | Autorell`,
      usedTitle: `Używane ${lowerName} na sprzedaż | Autorell`,
      description: `Szukaj ${lowerLabel} na sprzedaż. Porównuj nowe i używane ogłoszenia prywatne i firmowe w Autorell.`,
    },
    nl: {
      baseTitle: `${name} te koop | Nieuw en gebruikt | Autorell`,
      newTitle: `Nieuwe ${lowerName} te koop | Autorell`,
      usedTitle: `Gebruikte ${lowerName} te koop | Autorell`,
      description: `Zoek ${lowerLabel} te koop. Vergelijk nieuwe en gebruikte advertenties van particuliere en zakelijke verkopers.`,
    },
    da: {
      baseTitle: `${name} til salg | Nye og brugte | Autorell`,
      newTitle: `Nye ${lowerName} til salg | Autorell`,
      usedTitle: `Brugte ${lowerName} til salg | Autorell`,
      description: `Søg ${lowerLabel} til salg. Sammenlign nye og brugte annoncer fra private og virksomheder på Autorell.`,
    },
    fi: {
      baseTitle: `${name} myynnissä | Uudet ja käytetyt | Autorell`,
      newTitle: `Uudet ${lowerName} myynnissä | Autorell`,
      usedTitle: `Käytetyt ${lowerName} myynnissä | Autorell`,
      description: `Etsi ${lowerLabel} myynnissä. Vertaa uusia ja käytettyjä ilmoituksia yksityisiltä ja yrityksiltä Autorellissa.`,
    },
  } as Partial<Record<PublicLocale, {
    baseTitle: string
    newTitle: string
    usedTitle: string
    description: string
  }>>

  return templates[locale] || templates.en!
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

function normalizeFilterLabel(filter?: string) {
  const value = (filter || '').toLowerCase()
  if (value.includes('begagn') || value.includes('used') || value.includes('gebraucht')) {
    return 'used'
  }
  if (value.includes('nya') || value.includes('new') || value.includes('neu')) {
    return 'new'
  }
  return ''
}

function resolveMarketplaceSeoCanonical(
  params: { [key: string]: string | string[] | undefined },
  fallbackPath: string,
) {
  const host = 'https://www.autorell.com'
  const meaningfulParams = canonicalSearchParams(params)
  if (!meaningfulParams.size) {
    return {
      canonical: `${host}${fallbackPath}`,
      robots: { index: true, follow: true },
    }
  }

  const selfCanonical = `${host}${fallbackPath}?${meaningfulParams.toString()}`

  return {
    canonical: selfCanonical,
    robots: {
      index: true,
      follow: true,
    },
  }
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


