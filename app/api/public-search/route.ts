import { NextRequest } from 'next/server'
import {
  marketplaceCategories,
  marketplaceLanguage,
  marketplacePublicSelect,
} from '@/lib/marketplace'
import { categoryLandingPath } from '@/lib/category-landings'
import {
  isPublicLanguage,
  localizePublicHref,
  translatePublic,
  type PublicLocale,
} from '@/lib/public-i18n'
import { createAdminClient } from '@/lib/supabase/admin'

type SearchEntry = {
  href: string
  title: string
  description: string
  keywords: string
  type: 'page' | 'category' | 'listing'
}

const pageEntries = {
  sv: [
    ['/', 'Startsida', 'Europas marknadsplats för fordon'],
    ['/salj-fordon', 'Lägg upp annons', 'Sälj som privatperson eller företag'],
    ['/foretag', 'För företag', 'Företagskonto, lager och marketplace-lösningar'],
    ['/registrera', 'Skapa konto', 'Privatkonto eller företagskonto'],
    ['/vanliga-fragor', 'Vanliga frågor', 'Hjälp om annonser, konton och säkerhet'],
    ['/kontakt', 'Kontakt', 'Kontakta Autorell'],
  ],
  en: [
    ['/', 'Home', "Europe's vehicle marketplace"],
    ['/salj-fordon', 'Create listing', 'Sell as a private person or business'],
    ['/foretag', 'For business', 'Business accounts, inventory and marketplace solutions'],
    ['/registrera', 'Create account', 'Private or business account'],
    ['/faq', 'FAQ', 'Help with listings, accounts and safety'],
    ['/contact', 'Contact', 'Contact Autorell'],
  ],
  de: [
    ['/', 'Startseite', 'Europas Marktplatz für Fahrzeuge'],
    ['/salj-fordon', 'Anzeige erstellen', 'Privat oder gewerblich verkaufen'],
    ['/foretag', 'Für Unternehmen', 'Unternehmenskonto, Bestand und Marktplatzlösungen'],
    ['/registrera', 'Konto erstellen', 'Privat- oder Unternehmenskonto'],
    ['/faq', 'FAQ', 'Hilfe zu Anzeigen, Konten und Sicherheit'],
    ['/kontakt', 'Kontakt', 'Autorell kontaktieren'],
  ],
} as const

export async function GET(request: NextRequest) {
  const requestedLocale = request.nextUrl.searchParams.get('locale') || 'en'
  const locale: PublicLocale =
    requestedLocale === 'sv' ||
    requestedLocale === 'de' ||
    isPublicLanguage(requestedLocale)
      ? requestedLocale
      : 'en'
  const language = marketplaceLanguage(locale)

  const pages: SearchEntry[] = pageEntries[language].map(
    ([href, title, description]) => ({
      href: localizePublicHref(locale, href),
      title:
        locale === 'sv' || locale === 'de' || locale === 'en'
          ? title
          : translatePublic(locale, title),
      description:
        locale === 'sv' || locale === 'de' || locale === 'en'
          ? description
          : translatePublic(locale, description),
      keywords: `${title} ${description} marketplace vehicle fordon fahrzeug account konto annons listing`,
      type: 'page',
    }),
  )

  const categories: SearchEntry[] = marketplaceCategories.map((category) => ({
    href: categoryLandingPath(category.slug),
    title:
      locale === 'sv' || locale === 'de' || locale === 'en'
        ? category.labels[language]
        : translatePublic(locale, category.labels.en),
    description:
      language === 'sv'
        ? 'Annonser i hela EU'
        : language === 'de'
          ? 'Anzeigen in der gesamten EU'
          : locale === 'en'
            ? 'Listings across the EU'
            : translatePublic(locale, 'Vehicles from private and business sellers across Europe.'),
    keywords: category.keywords.join(' '),
    type: 'category',
  }))

  const { data } = await createAdminClient()
    .from('marketplace_listings')
    .select(marketplacePublicSelect)
    .eq('status', 'published')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(250)

  const listings: SearchEntry[] = (data || []).map((listing) => ({
    href: `/marketplace/${listing.category}?q=${encodeURIComponent(listing.title)}`,
    title: listing.title,
    description: `${listing.city}, ${listing.country_code} · ${listing.price} ${listing.currency}`,
    keywords: [
      listing.id,
      listing.category,
      listing.make,
      listing.model,
      listing.variant,
      listing.body_type,
      listing.fuel_type,
      listing.model_year,
      listing.mileage_km,
      listing.city,
      listing.country_code,
      listing.price,
      listing.currency,
    ]
      .filter(Boolean)
      .join(' '),
    type: 'listing',
  }))

  return Response.json([...listings, ...categories, ...pages], {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=300',
    },
  })
}
