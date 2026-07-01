type RateLimitBucket = {
  count: number
  resetAt: number
}

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

declare global {
  var __autorellRateLimitBuckets: Map<string, RateLimitBucket> | undefined
}

const buckets =
  globalThis.__autorellRateLimitBuckets ||
  (globalThis.__autorellRateLimitBuckets = new Map<string, RateLimitBucket>())

export function getClientIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false, remaining: Math.max(limit - 1, 0), retryAfter: 0 }
  }

  if (current.count >= limit) {
    return {
      limited: true,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    }
  }

  current.count += 1
  return {
    limited: false,
    remaining: Math.max(limit - current.count, 0),
    retryAfter: Math.ceil((current.resetAt - now) / 1000),
  }
}

export function rateLimitJson(retryAfter: number) {
  return Response.json(
    { error: 'Too many requests. Please try again shortly.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.max(retryAfter, 1)) },
    },
  )
}
