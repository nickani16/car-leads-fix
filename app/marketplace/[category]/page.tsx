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
  const seo = getMarketplaceSeoCopy(category.slug, label, locale, filter)
  const pathname = requestHeaders.get('x-autorell-pathname')
  const canonicalPath = pathname || `/marketplace/${category.slug}`
  const canonical = filter
    ? `${host}${canonicalPath}?filter=${encodeURIComponent(filter)}`
    : `${host}${canonicalPath}`
  const { title, description } = seo

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
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

  const data = await getPublishedMarketplaceCategoryListings(
    requestedCategory === 'vehicles' ? 'vehicles' : normalizeMarketplaceCategory(requestedCategory),
    requestedCategory === 'vehicles' ? 360 : 240,
  )
  const sellerProfiles = await getMarketplaceSellerPublicProfiles(
    (data || []).map((listing) => listing.seller_user_id).filter(Boolean),
  )

  const listings: VehicleSearchListing[] = await Promise.all(
    (data || []).map(async (listing) => {
      const sellerProfile = sellerProfiles.get(listing.seller_user_id || '')
      const price = await formatMarketplacePriceDisplay({
        amount: Number(listing.price),
        currency: listing.currency,
        locale,
        targetCurrency: displayCurrency,
      })

      return {
        id: listing.id,
        category: listing.category,
        title: listing.title,
        make: listing.make || '',
        model: listing.model || '',
        year: listing.model_year ? String(listing.model_year) : null,
        mileageKm: listing.mileage_km,
        fuelType: listing.fuel_type,
        gearbox: listing.gearbox,
        bodyType: listing.body_type,
        country: listing.country_code,
        city: listing.city,
        municipality: listing.municipality,
        latitude: typeof listing.latitude === 'number' ? listing.latitude : null,
        longitude: typeof listing.longitude === 'number' ? listing.longitude : null,
        priceLabel: price.label,
        priceValue: Number(listing.price),
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
        initialMarkets={requestedMarkets.length ? requestedMarkets : requestedCountry ? [requestedCountry] : []}
        initialCategories={requestedCategories}
        initialCategory={requestedCategory === 'vehicles' ? 'all' : category.slug}
        initialQuery={getSearchParam(resolvedSearchParams, 'q') || getSearchParam(resolvedSearchParams, 'filter')}
        initialMake={getSearchParam(resolvedSearchParams, 'make')}
        initialModel={getSearchParam(resolvedSearchParams, 'model')}
        initialCity={getSearchParam(resolvedSearchParams, 'city')}
        initialMunicipality={getSearchParam(resolvedSearchParams, 'municipality')}
        initialMinPrice={getSearchParam(resolvedSearchParams, 'minPrice')}
        initialMaxPrice={getSearchParam(resolvedSearchParams, 'maxPrice')}
        initialMode={getSearchMode(resolvedSearchParams)}
        initialMinYear={getSearchParam(resolvedSearchParams, 'minYear')}
        initialMaxYear={getSearchParam(resolvedSearchParams, 'maxYear')}
        initialMaxMileage={getSearchParam(resolvedSearchParams, 'maxMileage')}
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
  return value === 'leasing' ? 'leasing' : 'sale'
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


