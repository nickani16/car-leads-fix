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
  const locale: PublicLocale =
    requestedLanguage === 'sv' || requestedLanguage === 'de'
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
  const canonical = filter
    ? `${host}/marketplace/${category.slug}?filter=${encodeURIComponent(filter)}`
    : `${host}/marketplace/${category.slug}`
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
  const automaticCountry =
    marketCode && euCountryCodes.has(marketCode.toUpperCase())
      ? marketCode.toUpperCase()
      : requestedLanguage === 'sv'
        ? 'SE'
        : requestedLanguage === 'de'
          ? 'DE'
          : ''
  const defaultCountry =
    requestedCountry ||
    automaticCountry
  const locale: PublicLocale =
    requestedLanguage === 'sv' || requestedLanguage === 'de'
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
        sellerLogoUrl: sellerProfile?.logoUrl || null,
        sellerTrust: sellerProfile?.trust || 'unverified',
        sellerName: listing.seller_name,
        sellerIsTrader: listing.seller_type === 'business',
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
        initialCategory={requestedCategory === 'vehicles' ? 'all' : category.slug}
        initialQuery={getSearchParam(resolvedSearchParams, 'q') || getSearchParam(resolvedSearchParams, 'filter')}
        initialMake={getSearchParam(resolvedSearchParams, 'make')}
        initialModel={getSearchParam(resolvedSearchParams, 'model')}
        initialMinPrice={getSearchParam(resolvedSearchParams, 'minPrice')}
        initialMaxPrice={getSearchParam(resolvedSearchParams, 'maxPrice')}
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

function getMarketplaceSeoCopy(
  slug: string,
  label: string,
  locale: PublicLocale,
  filter?: string,
) {
  void slug
  const normalizedFilter = normalizeFilterLabel(filter)
  const lowerLabel = label.toLowerCase()

  if (locale === 'sv') {
    if (normalizedFilter === 'used') {
      return {
        title: `Begagnade och nya ${lowerLabel} till salu | Autorell`,
        description: trimMeta(`Jämför begagnade och nya ${lowerLabel} från privatpersoner och företag i Europa. Filtrera snabbt på land, märke och modell.`),
      }
    }
    if (normalizedFilter === 'new') {
      return {
        title: `Nya ${lowerLabel} till salu | Autorell`,
        description: trimMeta(`Hitta nya ${lowerLabel} till salu i Europa. Sök bland företag och privata säljare med tydliga filter.`),
      }
    }

    return {
      title: `${label} till salu | Köp begagnat och nytt | Autorell`,
      description: trimMeta(`Sök ${lowerLabel} till salu i Europa. Jämför nya och begagnade annonser från privatpersoner och företag.`),
    }
  }

  if (locale === 'de') {
    if (normalizedFilter === 'used') {
      return {
        title: `Gebrauchte und neue ${lowerLabel} kaufen | Autorell`,
        description: trimMeta(`Gebrauchte und neue ${lowerLabel} in Europa vergleichen. Filtern nach Land, Marke und Modell.`),
      }
    }
    if (normalizedFilter === 'new') {
      return {
        title: `Neue ${lowerLabel} kaufen | Autorell`,
        description: trimMeta(`Neue ${lowerLabel} in Europa finden. Angebote von privaten und gewerblichen Verkäufern vergleichen.`),
      }
    }

    return {
      title: `${label} kaufen | Neu und gebraucht | Autorell`,
      description: trimMeta(`${label} in Europa suchen und vergleichen. Angebote von privaten und gewerblichen Verkäufern finden.`),
    }
  }

  if (normalizedFilter === 'used') {
    return {
      title: `Used and new ${lowerLabel} for sale | Autorell`,
      description: trimMeta(`Compare used and new ${lowerLabel} across Europe from private and business sellers. Filter by country, make and model.`),
    }
  }
  if (normalizedFilter === 'new') {
    return {
      title: `New ${lowerLabel} for sale | Autorell`,
      description: trimMeta(`Find new ${lowerLabel} for sale across Europe from private and business sellers with fast filters.`),
    }
  }

  return {
    title: `${label} for sale | Used and new | Autorell`,
    description: trimMeta(`Search ${lowerLabel} for sale across Europe. Compare used and new listings from private and business sellers.`),
  }
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

function trimMeta(description: string) {
  return description.length > 150
    ? `${description.slice(0, 147).trimEnd()}...`
    : description
}
