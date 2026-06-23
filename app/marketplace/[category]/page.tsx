import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import MarketplaceCategoryBrowser, {
  type MarketplaceListing,
} from '@/app/components/MarketplaceCategoryBrowser'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import {
  formatMarketplacePrice,
  getMarketplaceCategory,
  marketplaceCategories,
  marketplaceCategoryAliases,
  marketplaceLanguage,
  marketplacePublicSelect,
  normalizeMarketplaceCategory,
} from '@/lib/marketplace'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  isPublicLanguage,
  translatePublic,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { getCategoryLanding } from '@/lib/category-landings'

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
  const hostname = (
    requestHeaders.get('host') ||
    requestHeaders.get('x-forwarded-host') ||
    ''
  ).toLowerCase()
  const requestedLanguage = requestHeaders.get('x-autorell-language')
  const locale: PublicLocale =
    requestedLanguage && isPublicLanguage(requestedLanguage)
      ? requestedLanguage
      : hostname.includes('autorell.de')
        ? 'de'
        : hostname.includes('autorell.com')
          ? 'en'
          : 'sv'
  const language = marketplaceLanguage(locale)
  const label =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? category.labels[language]
      : translatePublic(locale, category.labels.en)
  const host = hostname.includes('autorell.de')
    ? 'https://www.autorell.de'
    : hostname.includes('autorell.com')
      ? 'https://www.autorell.com'
      : 'https://www.autorell.se'
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
  const hostname = (
    requestHeaders.get('host') ||
    requestHeaders.get('x-forwarded-host') ||
    ''
  ).toLowerCase()
  const requestedLanguage = requestHeaders.get('x-autorell-language')
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const locale: PublicLocale =
    requestedLanguage && isPublicLanguage(requestedLanguage)
      ? requestedLanguage
      : hostname.includes('autorell.de')
        ? 'de'
        : hostname.includes('autorell.com')
          ? 'en'
          : 'sv'
  const language = marketplaceLanguage(locale)

  const { data } = await createAdminClient()
    .from('marketplace_listings')
    .select(marketplacePublicSelect)
    .eq('status', 'published')
    .eq('category', normalizeMarketplaceCategory(requestedCategory))
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(120)

  const listings: MarketplaceListing[] = (data || []).map((listing) => ({
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
    condition: listing.condition,
    equipment: listing.equipment,
    country: listing.country_code,
    priceLabel: formatMarketplacePrice(
      Number(listing.price),
      listing.currency,
      locale,
    ),
    priceValue: Number(listing.price),
    imageAvailable: Boolean(listing.images?.[0]),
    imageUrl: listing.images?.[0] || null,
    sellerName: listing.seller_name,
    sellerIsTrader: listing.seller_type === 'business',
    messagingEnabled: true,
  }))

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
          heroImage: getCategoryLanding(category.slug).heroImage,
          heroPosition: getCategoryLanding(category.slug).heroPosition,
        }}
        listings={listings}
        locale={locale}
      />
      <PublicFooter locale={locale} />
    </main>
  )
}
