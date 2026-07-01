import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'
import { searchPublicEntries } from '@/lib/search/listing-search'

export async function GET(request: Request) {
  const limit = checkRateLimit({
    key: `public-search:${getClientIp(request)}`,
    limit: 120,
    windowMs: 60 * 1000,
  })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'sv'
  const market = searchParams.get('market') || undefined
  const query = searchParams.get('q') || undefined
  const requestedLimit = Number(searchParams.get('limit'))

  const results = await searchPublicEntries({
    locale,
    market,
    query,
    limit: Number.isFinite(requestedLimit) ? requestedLimit : 10,
  })

  return NextResponse.json(results, {
    headers: {
      'Cache-Control': query
        ? 'private, max-age=30'
        : 'public, s-maxage=600, stale-while-revalidate=1800',
    },
  })
}
