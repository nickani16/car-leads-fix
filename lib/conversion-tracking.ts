import { createAdminClient } from '@/lib/supabase/admin'

export type ConversionEventName =
  | 'account_created'
  | 'listing_created'
  | 'listing_contacted'
  | 'contact_submitted'
  | 'whatsapp_clicked'

type ConversionEvent = {
  eventName: ConversionEventName
  countryCode?: string | null
  userId?: string | null
  listingId?: string | null
  value?: number | null
  currency?: string | null
  dedupeKey?: string | null
  metadata?: Record<string, unknown>
  pageUrl?: string | null
}

function hostnameFromRequest(request: Request) {
  return (
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    ''
  )
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase()
}

function safeUrl(value: string | null | undefined) {
  if (!value) return null

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return url
  } catch {
    return null
  }
}

function countryFromPath(pathname: string) {
  const marketCode = pathname.split('/').filter(Boolean)[0]
  return /^[a-z]{2}$/.test(marketCode || '')
    ? marketCode.toUpperCase()
    : null
}

function countryFromHostname(hostname: string) {
  if (hostname.endsWith('autorell.se')) return 'SE'
  if (hostname.endsWith('autorell.de')) return 'DE'
  return null
}

function clean(value: string | null | undefined, maxLength = 180) {
  return value?.trim().slice(0, maxLength) || null
}

export async function trackConversion(
  request: Request,
  event: ConversionEvent,
) {
  try {
    const hostname = hostnameFromRequest(request)
    const referer = safeUrl(request.headers.get('referer'))
    const pageUrl = safeUrl(event.pageUrl) || referer
    const countryCode =
      clean(event.countryCode, 2)?.toUpperCase() ||
      clean(request.headers.get('x-vercel-ip-country'), 2)?.toUpperCase() ||
      (pageUrl ? countryFromPath(pageUrl.pathname) : null) ||
      countryFromHostname(hostname) ||
      'EU'
    const referrerUrl = safeUrl(pageUrl?.searchParams.get('referrer'))
    const source =
      clean(pageUrl?.searchParams.get('utm_source')) ||
      clean(referrerUrl?.hostname) ||
      'direct'

    const { error } = await createAdminClient()
      .from('conversion_events')
      .insert({
        event_name: event.eventName,
        country_code: countryCode,
        market_domain: hostname || pageUrl?.hostname || null,
        page_path: clean(pageUrl?.pathname, 300),
        source,
        medium: clean(pageUrl?.searchParams.get('utm_medium')),
        campaign: clean(pageUrl?.searchParams.get('utm_campaign')),
        referrer: clean(referrerUrl?.toString(), 500),
        user_id: event.userId || null,
        value: event.value ?? null,
        currency: clean(event.currency, 3)?.toUpperCase() || null,
        dedupe_key: clean(event.dedupeKey, 240),
        metadata: {
          ...(event.metadata || {}),
          ...(event.listingId ? { listingId: event.listingId } : {}),
        },
      })

    if (error && error.code !== '23505') {
      console.error('Conversion tracking error:', error)
    }
  } catch (error) {
    console.error('Conversion tracking unavailable:', error)
  }
}
