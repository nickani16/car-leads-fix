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

  const input = Object.fromEntries(request.nextUrl.searchParams.entries()) as MarketplaceSearchInput
  const markets = request.nextUrl.searchParams.getAll('markets')
  const countries = request.nextUrl.searchParams.getAll('countries')
  const categories = request.nextUrl.searchParams.getAll('categories')
  if (markets.length > 1) input.markets = markets
  if (countries.length > 1) input.countries = countries
  if (categories.length > 1) input.categories = categories

  try {
    const result = await withTimeout(
      searchMarketplaceListings(input),
      15_000,
      'Marketplace search timed out.',
    )
    return Response.json(result, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=30, s-maxage=120, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Marketplace search v2 failed', error)
    return Response.json(
      { error: 'Marketplace search is not available yet.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs)
    }),
  ])
}
