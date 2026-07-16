import { NextRequest } from 'next/server'
import { getClientIp, checkRateLimit, rateLimitJson } from '@/lib/rate-limit'
import { searchPublicEntries } from '@/lib/search/listing-search'

const PUBLIC_SEARCH_MIN_QUERY_LENGTH = 2

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const rate = checkRateLimit({
    key: `public-search:${ip}`,
    limit: 90,
    windowMs: 60_000,
  })
  if (rate.limited) return rateLimitJson(rate.retryAfter)

  const locale = request.nextUrl.searchParams.get('locale') || 'en'
  const query = normalizePublicSearchQuery(request.nextUrl.searchParams.get('q') || '')
  if (query.length < PUBLIC_SEARCH_MIN_QUERY_LENGTH) {
    return Response.json([], {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=1800',
      },
    })
  }
  const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get('limit') || 8), 1), 8)
  const market = request.nextUrl.searchParams.get('market') || ''
  const results = await searchPublicEntries({ locale, query, limit, market })
  const body = JSON.stringify(results)

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=1800',
    },
  })
}

function normalizePublicSearchQuery(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}
