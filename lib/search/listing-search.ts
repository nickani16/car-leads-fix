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
  type: 'page' | 'category' | 'listing' | 'place' | 'make-model' | 'vehicle-query'
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
  market?: string | null
}

type PublicSearchCacheEntry = {
  expiresAt: number
  results: PublicSearchEntry[]
}

type PublicSearchListingRow = {
  id?: string | number | null
  category?: string | null
  title?: string | null
  make?: string | null
  model?: string | null
  variant?: string | null
  body_type?: string | null
  fuel_type?: string | null
  model_year?: string | number | null
  mileage_km?: string | number | null
  city?: string | null
  municipality?: string | null
  country_code?: string | null
  price?: string | number | null
  currency?: string | null
}

const listingSearchSelect =
  'id,category,title,make,model,variant,body_type,fuel_type,model_year,mileage_km,city,municipality,country_code,price,currency'
const PUBLIC_SEARCH_CACHE_TTL_MS = 60_000
const MIN_DATABASE_QUERY_LENGTH = 2
const MAX_SEARCH_TERMS = 3
const locationStopWords = new Set([
  'i',
  'in',
  'im',
  'auf',
  'kommun',
  'commune',
  'municipality',
  'city',
  'stad',
  'ort',
])

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
  const market = normalizeMarket(input.market)
  const cacheKey = `${provider}:${locale}:${market || 'EU'}:${query.toLocaleLowerCase('en-US')}:${limit}`
  const cached = publicSearchCache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) return cached.results

  const results = await searchWithSupabase({ locale, language, query, limit, market })
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

function normalizeMarket(value?: string | null) {
  const normalized = String(value || '').trim().toUpperCase()
  return /^[A-Z]{2}$/.test(normalized) ? normalized : ''
}

async function searchWithSupabase({
  locale,
  language,
  query,
  limit,
  market,
}: {
  locale: PublicLocale
  language: keyof typeof pageEntries
  query: string
  limit: number
  market: string
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

  let request = createAdminClient()
    .from('marketplace_listings')
    .select(listingSearchSelect)
    .eq('status', 'published')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(Math.max(listingLimit, 18))

  if (market) request = request.eq('country_code', market)

  const { data } = ilike ? await request.or(ilike) : await request
  const rows = (data || []) as PublicSearchListingRow[]
  const smartEntries = buildSmartVehicleEntries(rows, query, locale, language)
  const listings = rows.map((listing) => {
    const price = formatMarketplacePrice(Number(listing.price || 0), listing.currency || 'EUR', locale)
    const listingPathSource = {
      ...listing,
      id: String(listing.id || ''),
    }
    return {
      href: localizePublicHref(locale, buildListingPath(listingPathSource)),
      title: listing.title || '',
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
        listing.municipality,
        listing.country_code,
        listing.price,
        listing.currency,
      ]
        .filter(Boolean)
        .join(' '),
      type: 'listing' as const,
    }
  })

  return rankEntries([...smartEntries, ...listings, ...staticEntries], query).slice(0, limit)
}

function buildSmartVehicleEntries(
  rows: PublicSearchListingRow[],
  query: string,
  locale: PublicLocale,
  language: keyof typeof pageEntries,
) {
  const normalizedQuery = normalizeForMatch(query)
  const rawTerms = normalizedQuery.split(' ').filter(Boolean)
  const locationTerms = rawTerms.filter((term) => !locationStopWords.has(term))
  const category = detectCategory(normalizedQuery)
  const entries: PublicSearchEntry[] = []
  const seen = new Set<string>()

  function add(entry: PublicSearchEntry) {
    const key = `${entry.type}:${entry.href}:${entry.title}`.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    entries.push(entry)
  }

  rows.forEach((listing) => {
    const countryCode = String(listing.country_code || '').toUpperCase()
    const listingCategory = String(listing.category || '')
    const categorySlug = category || listingCategory
    const categoryMeta = marketplaceCategories.find((item) => item.slug === categorySlug)
    const categoryLabel = categoryMeta
      ? categoryMeta.labels[language]
      : String(listing.category || '')
    const placeCandidates = [
      { value: String(listing.municipality || ''), param: 'municipality', suffix: language === 'sv' ? ' kommun' : '' },
      { value: String(listing.city || ''), param: 'city', suffix: '' },
    ].filter((place) => place.value.trim())
    const make = String(listing.make || '').trim()
    const model = String(listing.model || '').trim()
    const makeModel = [make, model].filter(Boolean).join(' ')

    placeCandidates.forEach((place) => {
      const normalizedPlace = normalizeForMatch(place.value)
      const placeMatches = locationTerms.some((term) => normalizedPlace.includes(term))
      if (!placeMatches) return

      if (categoryMeta && (!category || listingCategory === category)) {
        const params = new URLSearchParams()
        params.set('categories', categoryMeta.slug)
        if (countryCode) params.set('markets', countryCode)
        params.set(place.param, place.value)
        add({
          href: localizePublicHref(locale, `/marketplace?${params.toString()}`),
          title: `${categoryLabel} ${language === 'de' ? 'in' : 'i'} ${titleCase(place.value)}${place.suffix}`,
          description: countryCode || '',
          keywords: `${categoryLabel} ${place.value} ${countryCode}`,
          type: 'vehicle-query',
        })
      }

      if (make && normalizeForMatch(makeModel || make).split(' ').some((term) => rawTerms.includes(term))) {
        const params = new URLSearchParams()
        if (countryCode) params.set('markets', countryCode)
        params.set('make', make)
        if (model && normalizeForMatch(model).split(' ').some((term) => rawTerms.includes(term))) params.set('model', model)
        params.set(place.param, place.value)
        add({
          href: localizePublicHref(locale, `/marketplace?${params.toString()}`),
          title: `${makeModel || make} ${language === 'de' ? 'in' : 'i'} ${titleCase(place.value)}`,
          description: categoryLabel,
          keywords: `${make} ${model} ${place.value} ${categoryLabel}`,
          type: 'make-model',
        })
      }

      const params = new URLSearchParams()
      if (countryCode) params.set('markets', countryCode)
      params.set(place.param, place.value)
      add({
        href: localizePublicHref(locale, `/marketplace?${params.toString()}`),
        title: `${titleCase(place.value)}${place.suffix}`,
        description: countryCode || '',
        keywords: `${place.value} ${countryCode}`,
        type: 'place',
      })
    })
  })

  return entries
}

function detectCategory(normalizedQuery: string) {
  return marketplaceCategories.find((category) =>
    [
      category.slug,
      category.labels.sv,
      category.labels.en,
      category.labels.de,
      category.singular.sv,
      category.singular.en,
      category.singular.de,
      ...category.keywords,
    ].some((value) => normalizeForMatch(value).split(' ').some((term) => normalizedQuery.includes(term))),
  )?.slug
}

function normalizeForMatch(value: string) {
  return String(value || '')
    .toLocaleLowerCase('sv-SE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCase(value: string) {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .map((part) =>
      part
        .split('-')
        .map((piece) => (piece ? piece.charAt(0).toLocaleUpperCase('sv-SE') + piece.slice(1).toLocaleLowerCase('sv-SE') : piece))
        .join('-'),
    )
    .join(' ')
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
