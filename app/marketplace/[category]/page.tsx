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
  return marketplaceCategories.map(({ slug }) => ({ category: slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category: requestedCategory } = await params
  const category = getMarketplaceCategory(requestedCategory)
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
  const canonical = `${host}/marketplace/${category.slug}`
  const title =
    locale === 'sv'
      ? `${label} till salu i Europa | Autorell`
      : locale === 'de'
        ? `${label} in Europa kaufen | Autorell`
        : `${label} · ${translatePublic(locale, "Europe's vehicle marketplace")} | Autorell`
  const description =
    locale === 'sv'
      ? `Sök och jämför ${label.toLowerCase()} från privatpersoner och företag i hela EU. Filtrera på plats, märke, modell, skick och relevanta fordonsdata.`
      : locale === 'de'
        ? `${label} von privaten und gewerblichen Verkäufern in der EU suchen und vergleichen. Nach Standort, Marke, Modell, Zustand und relevanten Fahrzeugdaten filtern.`
        : translatePublic(
            locale,
            'One connected marketplace for private sellers and businesses. Find the right vehicle, reach more buyers and trade with greater confidence across borders.',
          )

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
  if (marketplaceCategoryAliases[requestedCategory]) {
    permanentRedirect(`/marketplace/${marketplaceCategoryAliases[requestedCategory]}`)
  }
  if (!marketplaceCategories.some(({ slug }) => slug === requestedCategory)) {
    notFound()
  }

  const category = getMarketplaceCategory(requestedCategory)
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
    normalizeMarketplaceCategory(requestedCategory),
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
