import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import MarketplaceCategoryBrowser, {
  type MarketplaceListing,
} from '@/app/components/MarketplaceCategoryBrowser'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import {
  getMarketplaceCategory,
  marketplaceCategories,
  marketplaceCategoryAliases,
  marketplaceLanguage,
  normalizeMarketplaceCategory,
} from '@/lib/marketplace'
import {
  displayCurrencyForMarket,
  formatMarketplacePriceDisplay,
} from '@/lib/currency-rates'
import {
  getMarketplaceSellerTrustByUserIds,
  getPublishedMarketplaceCategoryListings,
} from '@/lib/marketplace-public-data'
import {
  isPublicLanguage,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { euCountryCodes } from '@/lib/eu-countries'

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
  const rawFilter = resolvedSearchParams.filter
  const filter = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter
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
}: {
  params: Promise<{ category: string }>
}) {
  const { category: requestedCategory } = await params
  if (requestedCategory === 'all' || requestedCategory === 'all-vehicles' || requestedCategory === 'alla-fordon') {
    permanentRedirect('/marketplace/vehicles')
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
  const defaultCountry =
    marketCode && euCountryCodes.has(marketCode.toUpperCase())
      ? marketCode.toUpperCase()
      : requestedLanguage === 'sv'
        ? 'SE'
        : requestedLanguage === 'de'
          ? 'DE'
      : ''
  const locale: PublicLocale =
    requestedLanguage === 'sv' || requestedLanguage === 'de'
      ? requestedLanguage
      : requestedLanguage && isPublicLanguage(requestedLanguage)
      ? requestedLanguage
      : 'en'
  const language = marketplaceLanguage(locale)
  const displayCurrency = displayCurrencyForMarket(marketCode)

  const data = await getPublishedMarketplaceCategoryListings(
    requestedCategory === 'vehicles' ? 'vehicles' : normalizeMarketplaceCategory(requestedCategory),
    120,
  )
  const sellerTrust = await getMarketplaceSellerTrustByUserIds(
    (data || []).map((listing) => listing.seller_user_id).filter(Boolean),
  )

  const listings: MarketplaceListing[] = await Promise.all(
    (data || []).map(async (listing) => {
      const price = await formatMarketplacePriceDisplay({
        amount: Number(listing.price),
        currency: listing.currency,
        locale,
        targetCurrency: displayCurrency,
      })
      return {
        id: listing.id,
        category: listing.category,
        make: listing.make || '',
        model: listing.model || '',
        title: listing.title,
        year: listing.model_year ? String(listing.model_year) : null,
        mileageKm: listing.mileage_km,
        operatingHours: listing.operating_hours,
        fuelType: listing.fuel_type,
        gearbox: listing.gearbox,
        bodyType: listing.body_type,
        color: listing.color,
        condition: listing.condition,
        equipment: listing.equipment,
        country: listing.country_code,
        city: listing.city,
        municipality: listing.municipality,
        priceLabel: price.label,
        priceValue: Number(listing.price),
        imageAvailable: Boolean(listing.images?.[0]),
        imageUrl: listing.images?.[0] || null,
        imageUrls: Array.isArray(listing.images) ? listing.images.filter(Boolean) : [],
        sellerName: listing.seller_name,
        sellerIsTrader: listing.seller_type === 'business',
        sellerTrust: sellerTrust.get(listing.seller_user_id || '') || 'unverified',
        messagingEnabled: true,
      }
    }),
  )

  const label =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? category.labels[language]
      : translatePublic(locale, category.labels.en)
  const singular =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? category.singular[language]
      : translatePublic(locale, category.singular.en)
  const description =
    language === 'sv'
      ? `${label} från privatpersoner och företag i hela Europeiska unionen.`
      : language === 'de'
        ? `${label} von privaten und gewerblichen Verkäufern in der gesamten Europäischen Union.`
        : `${label} from private and business sellers across the European Union.`

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f8fb] text-[#101828]">
      <PublicHeader
        locale={locale}
        marketCode={marketCode}
        marketplaceChannel={{ label, slug: category.slug }}
      />
      <MarketplaceCategoryBrowser
        category={{
          slug: category.slug,
          label,
          singular,
          description,
          filters:
            language === 'sv'
              ? ['Nya', 'Begagnade', 'El', 'Hybrid', 'Pris', 'Miltal']
              : language === 'de'
                ? ['Neu', 'Gebraucht', 'Elektro', 'Hybrid', 'Preis', 'Kilometer']
                : locale === 'en'
                  ? ['New', 'Used', 'Electric', 'Hybrid', 'Price', 'Mileage']
                  : translatePublicObject(locale, ['New', 'Used', 'Electric', 'Hybrid', 'Price', 'Mileage']),
        }}
        listings={listings}
        locale={locale}
        defaultCountry={defaultCountry}
      />
      <PublicFooter locale={locale} />
    </main>
  )
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
