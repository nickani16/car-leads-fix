import { NextRequest } from 'next/server'
import { getClientIp, checkRateLimit, rateLimitJson } from '@/lib/rate-limit'
import { searchPublicEntries } from '@/lib/search/listing-search'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const rate = checkRateLimit({
    key: `public-search:${ip}`,
    limit: 120,
    windowMs: 60_000,
  })
  if (rate.limited) return rateLimitJson(rate.retryAfter)

  const locale = request.nextUrl.searchParams.get('locale') || 'en'
  const query = request.nextUrl.searchParams.get('q') || ''
  const limit = Number(request.nextUrl.searchParams.get('limit') || 10)
  const results = await searchPublicEntries({ locale, query, limit })

  return Response.json(results, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=1800',
    },
  })
}
