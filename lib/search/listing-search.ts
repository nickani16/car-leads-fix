import 'server-only'

import {
  categorySearchPath,
  formatMarketplacePrice,
  marketplaceCategories,
  marketplaceLanguage,
} from '@/lib/marketplace'
import { buildListingPath } from '@/lib/listing-url'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  isPublicLanguage,
  localizePublicHref,
  translatePublic,
  type PublicLocale,
} from '@/lib/public-i18n'

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
  limit?: number
  provider?: ListingSearchProvider
}

type PublicSearchCacheEntry = {
  expiresAt: number
  results: PublicSearchEntry[]
}

const listingSearchSelect =
  'id,category,title,make,model,variant,body_type,fuel_type,model_year,mileage_km,city,country_code,price,currency'
const PUBLIC_SEARCH_CACHE_TTL_MS = 60_000
const MIN_DATABASE_QUERY_LENGTH = 3
const MAX_SEARCH_TERMS = 3

declare global {
  var __autorellPublicSearchCache: Map<string, PublicSearchCacheEntry> | undefined
}

const publicSearchCache =
  globalThis.__autorellPublicSearchCache ||
  (globalThis.__autorellPublicSearchCache = new Map<string, PublicSearchCacheEntry>())

const pageEntries = {
  sv: [
    ['/', 'Startsida', 'Europas marknadsplats for fordon'],
    ['/sell-vehicle', 'Lagg upp annons', 'Salj som privatperson eller foretag'],
    ['/business', 'For foretag', 'Foretagskonto, lager och marketplace-losningar'],
    ['/register', 'Skapa konto', 'Privatkonto eller foretagskonto'],
    ['/vanliga-fragor', 'Vanliga fragor', 'Hjalp om annonser, konton och sakerhet'],
    ['/contact', 'Kontakt', 'Kontakta Autorell'],
  ],
  en: [
    ['/', 'Home', "Europe's vehicle marketplace"],
    ['/sell-vehicle', 'Create listing', 'Sell as a private person or business'],
    ['/business', 'For business', 'Business accounts, inventory and marketplace solutions'],
    ['/register', 'Create account', 'Private or business account'],
    ['/faq', 'FAQ', 'Help with listings, accounts and safety'],
    ['/contact', 'Contact', 'Contact Autorell'],
  ],
  de: [
    ['/', 'Startseite', 'Europas Marktplatz fur Fahrzeuge'],
    ['/sell-vehicle', 'Anzeige erstellen', 'Privat oder gewerblich verkaufen'],
    ['/business', 'Fur Unternehmen', 'Unternehmenskonto, Bestand und Marktplatzlosungen'],
    ['/register', 'Konto erstellen', 'Privat- oder Unternehmenskonto'],
    ['/faq', 'FAQ', 'Hilfe zu Anzeigen, Konten und Sicherheit'],
    ['/contact', 'Kontakt', 'Autorell kontaktieren'],
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
  const query = normalizeQuery(input.query)
  const limit = clampLimit(input.limit)
  const provider = input.provider || 'supabase'
  const cacheKey = `${provider}:${locale}:${query.toLocaleLowerCase('en-US')}:${limit}`
  const cached = publicSearchCache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) return cached.results

  const results = await searchWithSupabase({ locale, language, query, limit })
  publicSearchCache.set(cacheKey, {
    expiresAt: Date.now() + PUBLIC_SEARCH_CACHE_TTL_MS,
    results,
  })

  return results
}

function normalizeQuery(value?: string | null) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 60)
}

function clampLimit(value?: number) {
  if (!Number.isFinite(value)) return 10
  return Math.min(Math.max(Math.round(Number(value)), 1), 10)
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

  if (query.length < MIN_DATABASE_QUERY_LENGTH) return staticEntries.slice(0, limit)

  const listingLimit = Math.max(1, limit - Math.min(staticEntries.length, 4))
  const escaped = query.replace(/[%_,]/g, '').trim()
  const terms = escaped
    .split(/\s+/)
    .filter((term) => term.length >= 2)
    .slice(0, MAX_SEARCH_TERMS)

  if (!terms.length) return rankEntries(staticEntries, query).slice(0, limit)

  const ilike = terms.length
    ? terms
        .flatMap((term) => [
          `title.ilike.%${term}%`,
          `make.ilike.%${term}%`,
          `model.ilike.%${term}%`,
          `variant.ilike.%${term}%`,
          `city.ilike.%${term}%`,
        ])
        .join(',')
    : ''

  const request = createAdminClient()
    .from('marketplace_listings')
    .select(listingSearchSelect)
    .eq('status', 'published')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(listingLimit)

  const { data } = ilike ? await request.or(ilike) : await request
  const listings = (data || []).map((listing) => {
    const price = formatMarketplacePrice(Number(listing.price), listing.currency, locale)
    return {
      href: localizePublicHref(locale, buildListingPath(listing)),
      title: listing.title,
      description: `${listing.city}, ${listing.country_code} - ${price}`,
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
      type: 'listing' as const,
    }
  })

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
    href: localizePublicHref(locale, categorySearchPath(category.slug)),
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
  const normalized = query.toLowerCase()
  const terms = normalized.split(/\s+/).filter(Boolean)

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
