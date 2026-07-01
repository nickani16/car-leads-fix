import 'server-only'

import {
  marketplaceCategories,
  marketplaceLanguage,
} from '@/lib/marketplace'
import { categoryLandingPath } from '@/lib/category-landings'
import {
  isPublicLanguage,
  localizePublicHref,
  translatePublic,
  type PublicLocale,
} from '@/lib/public-i18n'
import { createAdminClient } from '@/lib/supabase/admin'

export type PublicSearchEntry = {
  href: string
  title: string
  description: string
  keywords: string
  type: 'page' | 'category' | 'listing'
}

export type ListingSearchProvider =
  | 'supabase'
  | 'meilisearch'
  | 'typesense'
  | 'algolia'
  | 'opensearch'

export type PublicSearchInput = {
  locale?: string | null
  query?: string | null
  market?: string | null
  limit?: number
  provider?: ListingSearchProvider
}

const listingSearchSelect =
  'id,category,title,make,model,variant,body_type,fuel_type,model_year,mileage_km,city,country_code,price,currency'

const pageEntries = {
  sv: [
    ['/', 'Startsida', 'Europas marknadsplats for fordon'],
    ['/salj-fordon', 'Lagg upp annons', 'Salj som privatperson eller foretag'],
    ['/foretag', 'For foretag', 'Foretagskonto, lager och marketplace-losningar'],
    ['/registrera', 'Skapa konto', 'Privatkonto eller foretagskonto'],
    ['/vanliga-fragor', 'Vanliga fragor', 'Hjalp om annonser, konton och sakerhet'],
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
    ['/', 'Startseite', 'Europas Marktplatz fur Fahrzeuge'],
    ['/salj-fordon', 'Anzeige erstellen', 'Privat oder gewerblich verkaufen'],
    ['/foretag', 'Fur Unternehmen', 'Unternehmenskonto, Bestand und Marktplatzlosungen'],
    ['/registrera', 'Konto erstellen', 'Privat- oder Unternehmenskonto'],
    ['/faq', 'FAQ', 'Hilfe zu Anzeigen, Konten und Sicherheit'],
    ['/kontakt', 'Kontakt', 'Autorell kontaktieren'],
  ],
} as const

export function normalizePublicSearchLocale(value?: string | null): PublicLocale {
  if (value === 'sv' || value === 'de' || isPublicLanguage(value || '')) {
    return value as PublicLocale
  }
  return 'en'
}

export async function searchPublicEntries(input: PublicSearchInput) {
  const locale = normalizePublicSearchLocale(input.locale)
  const language = marketplaceLanguage(locale)
  const query = String(input.query || '').trim().replace(/\s+/g, ' ').slice(0, 80)
  const limit = Math.min(Math.max(Math.round(Number(input.limit) || 10), 1), 20)

  return searchWithSupabase({ locale, language, query, limit })
}

async function searchWithSupabase({
  locale,
  language,
  query,
  limit,
}: {
  locale: PublicLocale
  language: keyof typeof pageEntries
  query: string
  limit: number
}) {
  const staticEntries = buildStaticEntries(locale, language)
  if (query.length < 2) return staticEntries.slice(0, limit)

  const terms = query.replace(/[%_,]/g, '').split(/\s+/).filter(Boolean).slice(0, 3)
  const ilike = terms
    .flatMap((term) => [
      `title.ilike.%${term}%`,
      `make.ilike.%${term}%`,
      `model.ilike.%${term}%`,
      `variant.ilike.%${term}%`,
      `city.ilike.%${term}%`,
    ])
    .join(',')

  const request = createAdminClient()
    .from('marketplace_listings')
    .select(listingSearchSelect)
    .eq('status', 'published')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(Math.max(1, limit))

  const { data } = ilike ? await request.or(ilike) : await request
  const listings: PublicSearchEntry[] = (data || []).map((listing) => ({
    href: localizePublicHref(locale, `/marketplace/${listing.category}?q=${encodeURIComponent(listing.title)}`),
    title: listing.title,
    description: `${listing.city}, ${listing.country_code} - ${listing.price} ${listing.currency}`,
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

  return rankEntries([...listings, ...staticEntries], query).slice(0, limit)
}

function buildStaticEntries(locale: PublicLocale, language: keyof typeof pageEntries) {
  const pages: PublicSearchEntry[] = pageEntries[language].map(
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

  const categories: PublicSearchEntry[] = marketplaceCategories.map((category) => ({
    href: localizePublicHref(locale, categoryLandingPath(category.slug)),
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

  return [...categories, ...pages]
}

function rankEntries(entries: PublicSearchEntry[], query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  return entries
    .map((item) => {
      const title = item.title.toLowerCase()
      const haystack = `${title} ${item.description} ${item.keywords}`.toLowerCase()
      const score = terms.reduce(
        (total, term) =>
          total +
          (title.startsWith(term) ? 8 : 0) +
          (title.includes(term) ? 4 : 0) +
          (haystack.includes(term) ? 1 : -8),
        item.type === 'listing' ? 2 : 0,
      )
      return { item, score }
    })
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
}

