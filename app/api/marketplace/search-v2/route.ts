import { NextRequest } from 'next/server'
import { searchMarketplaceListings, type MarketplaceSearchInput } from '@/lib/marketplace-search-v2'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const rate = checkRateLimit({
    key: `marketplace-search-v2:${getClientIp(request)}`,
    limit: 240,
    windowMs: 60_000,
  })
  if (rate.limited) return rateLimitJson(rate.retryAfter)

  const input = searchParamsToInput(request.nextUrl.searchParams)

  try {
    const result = await searchMarketplaceListings(input)
    return Response.json(result, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=30, s-maxage=120, stale-while-revalidate=600',
      },
    })
  } catch {
    return Response.json(
      { error: 'Marketplace search is not available yet.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}

function searchParamsToInput(searchParams: URLSearchParams): MarketplaceSearchInput {
  const input = Object.fromEntries(searchParams.entries()) as MarketplaceSearchInput
  const markets = searchParams.getAll('markets')
  const categories = searchParams.getAll('categories')
  if (markets.length > 1) input.markets = markets.join(',')
  if (categories.length > 1) input.categories = categories.join(',')
  return input
}
