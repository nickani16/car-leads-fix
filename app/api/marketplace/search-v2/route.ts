import { NextRequest } from 'next/server'
import {
  displayCurrencyForMarket,
  formatMarketplacePriceDisplay,
} from '@/lib/currency-rates'
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

const SEARCH_CACHE_TTL_MS = 5_000
const SEARCH_CACHE_MAX_ENTRIES = 1_000
const SEARCH_TIMEOUT_MS = 1_800

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  const cacheKey = marketplaceSearchCacheKey(request)
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
  if (input.minPrice || input.maxPrice) {
    input.minPrice = ''
    input.maxPrice = ''
  }

  try {
    const cached = marketplaceSearchCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return new Response(cached.body, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Autorell-Search-Cache': 'hit',
        },
      })
    }

    const searchController = new AbortController()
    const searchTimeout = setTimeout(() => searchController.abort(), SEARCH_TIMEOUT_MS)
    let result: Awaited<ReturnType<typeof searchMarketplaceListings>>
    try {
      result = await searchMarketplaceListings(input, {
        signal: searchController.signal,
      })
    } finally {
      clearTimeout(searchTimeout)
    }
    const locale = normalizeLocale(request.nextUrl.searchParams.get('locale'))
    const displayCurrency = displayCurrencyForMarket(
      request.nextUrl.searchParams.get('displayMarket'),
    )
    const items = await Promise.all(
      result.items.map(async (item) => {
        const price = await formatSearchResultPrice(item, locale, displayCurrency)
        return {
          ...item,
          price_label: price?.label || null,
          display_price_value: price?.displayAmount ?? null,
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
        'Cache-Control': 'no-store',
        'X-Autorell-Search-Cache': 'miss',
      },
    })
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      route: '/api/marketplace/search-v2',
      msg: 'Marketplace search v2 failed',
      error: error instanceof Error ? error.message : String(error),
      ms: Date.now() - startedAt,
    }))
    const body = JSON.stringify(emptySearchResult(Number(input.limit) || 48))
    return new Response(body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Autorell-Search-Fallback':
          input.geoFilterMode === 'strict' && input.geoAreaId ? 'geo-empty' : 'unavailable',
      },
    })
  }
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

async function formatSearchResultPrice(
  item: Record<string, unknown>,
  locale: PublicLocale,
  displayCurrency: string,
) {
  const amount = Number(item.price)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return formatMarketplacePriceDisplay({
    amount,
    currency: String(item.currency || 'EUR'),
    locale,
    targetCurrency: displayCurrency,
  })
}

function emptySearchResult(limit: number) {
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
