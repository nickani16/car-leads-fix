import { NextRequest } from 'next/server'
import {
  displayCurrencyForMarket,
  formatMarketplacePriceDisplay,
} from '@/lib/currency-rates'
import { resolveListingMapLocation } from '@/lib/listing-map-location'
import { searchMarketplaceListings, type MarketplaceSearchInput } from '@/lib/marketplace-search-v2'
import { isPublicLanguage, type PublicLocale } from '@/lib/public-i18n'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SearchCacheEntry = {
  expiresAt: number
  body: string
}

declare global {
  var __autorellMarketplaceSearchCache: Map<string, SearchCacheEntry> | undefined
}

const marketplaceSearchCache =
  globalThis.__autorellMarketplaceSearchCache ||
  (globalThis.__autorellMarketplaceSearchCache = new Map<string, SearchCacheEntry>())

const SEARCH_CACHE_TTL_MS = 60_000
const SEARCH_CACHE_MAX_ENTRIES = 1_000

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  const rate = checkRateLimit({
    key: `marketplace-search-v2:${getClientIp(request)}`,
    limit: 180,
    windowMs: 60_000,
  })
  if (rate.limited) return rateLimitJson(rate.retryAfter)

  const input = Object.fromEntries(request.nextUrl.searchParams.entries()) as MarketplaceSearchInput
  const markets = request.nextUrl.searchParams.getAll('markets')
  const countries = request.nextUrl.searchParams.getAll('countries')
  const categories = request.nextUrl.searchParams.getAll('categories')
  if (markets.length > 1) input.markets = markets
  if (countries.length > 1) input.countries = countries
  if (categories.length > 1) input.categories = categories
  input.limit = String(Math.min(Math.max(Number(input.limit || 48), 1), 48))

  try {
    const cacheKey = marketplaceSearchCacheKey(request)
    const cached = marketplaceSearchCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return new Response(cached.body, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
          'X-Autorell-Search-Cache': 'hit',
        },
      })
    }

    const result = await withTimeout(
      searchMarketplaceListings(input),
      15_000,
      'Marketplace search timed out.',
    )
    const locale = normalizeLocale(request.nextUrl.searchParams.get('locale'))
    const displayCurrency = displayCurrencyForMarket(
      request.nextUrl.searchParams.get('displayMarket'),
    )
    const items = await Promise.all(
      result.items.map(async (item) => {
        const [priceLabel, mapLocation] = await Promise.all([
          formatSearchResultPriceLabel(item, locale, displayCurrency),
          resolveSearchResultMapLocation(item),
        ])
        return {
          ...item,
          latitude: mapLocation?.latitude ?? item.latitude,
          longitude: mapLocation?.longitude ?? item.longitude,
          map_location_source: mapLocation?.source ?? null,
          price_label: priceLabel,
        }
      }),
    )
    const body = JSON.stringify({
      ...result,
      items,
    })
    setMarketplaceSearchCache(cacheKey, body)
    const durationMs = Date.now() - startedAt
    if (durationMs > 1000) {
      console.warn(JSON.stringify({
        level: 'warning',
        route: '/api/marketplace/search-v2',
        msg: 'slow marketplace search',
        ms: durationMs,
        cache: 'miss',
        totalCount: result.totalCount,
      }))
    }
    return new Response(body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
        'X-Autorell-Search-Cache': 'miss',
      },
    })
  } catch (error) {
    if (input.geoFilterMode === 'strict' && input.geoAreaId) {
      const body = JSON.stringify(emptyStrictGeoSearchResult(Number(input.limit) || 48))
      return new Response(body, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
          'X-Autorell-Search-Cache': 'geo-empty-fallback',
        },
      })
    }
    console.error(JSON.stringify({
      level: 'error',
      route: '/api/marketplace/search-v2',
      msg: 'Marketplace search v2 failed',
      error: error instanceof Error ? error.message : String(error),
      ms: Date.now() - startedAt,
    }))
    return Response.json(
      { error: 'Marketplace search is not available yet.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}

async function resolveSearchResultMapLocation(item: Record<string, unknown>) {
  try {
    return await withTimeout(
      resolveListingMapLocation({
        id: String(item.id || 'marketplace-search-result'),
        address: stringOrNull(item.address),
        postalCode: stringOrNull(item.postal_code),
        city: stringOrNull(item.city),
        country: stringOrNull(item.country),
        countryCode: stringOrNull(item.country_code),
        latitude: typeof item.latitude === 'number' || typeof item.latitude === 'string' ? item.latitude : null,
        longitude: typeof item.longitude === 'number' || typeof item.longitude === 'string' ? item.longitude : null,
      }),
      1_200,
      'Marketplace map geocoding timed out.',
    )
  } catch {
    return null
  }
}

function stringOrNull(value: unknown) {
  const text = String(value || '').trim()
  return text || null
}

function marketplaceSearchCacheKey(request: NextRequest) {
  const params = new URLSearchParams()
  const entries = Array.from(request.nextUrl.searchParams.entries())
    .filter(([key]) => key !== 'cursor')
    .sort(([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue),
    )
  for (const [key, value] of entries) params.append(key, value)
  return params.toString()
}

function setMarketplaceSearchCache(key: string, body: string) {
  if (marketplaceSearchCache.size >= SEARCH_CACHE_MAX_ENTRIES) {
    const firstKey = marketplaceSearchCache.keys().next().value
    if (firstKey) marketplaceSearchCache.delete(firstKey)
  }
  marketplaceSearchCache.set(key, {
    body,
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
  })
}

function normalizeLocale(value: string | null): PublicLocale {
  if (value === 'sv' || value === 'de') return value
  if (value && isPublicLanguage(value)) return value
  return 'en'
}

async function formatSearchResultPriceLabel(
  item: Record<string, unknown>,
  locale: PublicLocale,
  displayCurrency: string,
) {
  const amount = Number(item.price)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return (
    await formatMarketplacePriceDisplay({
      amount,
      currency: String(item.currency || 'EUR'),
      locale,
      targetCurrency: displayCurrency,
    })
  ).label
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs)
    }),
  ])
}

function emptyStrictGeoSearchResult(limit: number) {
  return {
    items: [],
    facets: {
      makes: [],
      models: [],
      regions: [],
      municipalities: [],
      fuels: [],
      gearboxes: [],
      bodyTypes: [],
      technical: {},
    },
    nextCursor: null,
    totalEstimate: 0,
    totalCount: 0,
    page: 1,
    pageSize: limit,
    totalPages: 1,
    limit,
    hasNext: false,
  }
}
