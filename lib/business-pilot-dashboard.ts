import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

export type PilotPeriodResult = {
  days: 7 | 30 | 90
  views: number
  visits: number
  websiteClicks: number
  phoneClicks: number
  enquiries: number
  publishedVehicles: number
  topListings: Array<{ id: string; title: string; views: number }>
  countries: Array<{ code: string; views: number }>
}

export async function loadBusinessPilotDashboard(admin: SupabaseClient, input: { organizationId: string; ownerUserId?: string | null }) {
  const { data: listings } = await admin.from('marketplace_listings').select('id,title,status').eq('imported_organization_id', input.organizationId).neq('status', 'deleted').limit(1000)
  const listingRows = listings || []
  const listingIds = listingRows.map((listing) => String(listing.id))
  const empty = [7, 30, 90].map((days) => emptyPeriod(days as 7 | 30 | 90, listingRows.filter((listing) => listing.status === 'published').length))
  if (!listingIds.length) return { periods: empty, contactName: await contactName(admin, input.ownerUserId) }

  const since90 = dateDaysAgo(90)
  const listingIdBatches = chunks(listingIds, 100)
  const [dailyBatches, eventBatches] = await Promise.all([
    Promise.all(listingIdBatches.map((ids) => admin.from('marketplace_listing_analytics_daily').select('listing_id,metric_date,views,unique_views,search_clicks,enquiries,phone_reveals,website_clicks').in('listing_id', ids).gte('metric_date', since90.slice(0, 10)).limit(20000))),
    Promise.all(listingIdBatches.map((ids) => admin.from('marketplace_listing_events').select('listing_id,created_at,metadata').in('listing_id', ids).eq('event_type', 'listing_view').gte('created_at', since90).limit(20000))),
  ])
  const daily = dailyBatches.flatMap((batch) => batch.data || [])
  const events = eventBatches.flatMap((batch) => batch.data || [])
  const titleById = new Map(listingRows.map((listing) => [String(listing.id), String(listing.title || 'Vehicle')]))
  const publishedVehicles = listingRows.filter((listing) => listing.status === 'published').length
  const periods = ([7, 30, 90] as const).map((days) => {
    const since = dateDaysAgo(days)
    const dailyRows = (daily || []).filter((row) => String(row.metric_date) >= since.slice(0, 10))
    const eventRows = (events || []).filter((row) => String(row.created_at) >= since)
    const listingViews = new Map<string, number>()
    for (const row of dailyRows) listingViews.set(String(row.listing_id), (listingViews.get(String(row.listing_id)) || 0) + Number(row.views || 0))
    const countries = new Map<string, number>()
    for (const row of eventRows) {
      const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata as Record<string, unknown> : {}
      const code = /^[A-Z]{2}$/.test(String(metadata.country_code || '')) ? String(metadata.country_code) : 'EU'
      countries.set(code, (countries.get(code) || 0) + 1)
    }
    return {
      days,
      views: sum(dailyRows, 'views'),
      visits: sum(dailyRows, 'unique_views') || sum(dailyRows, 'search_clicks'),
      websiteClicks: sum(dailyRows, 'website_clicks'),
      phoneClicks: sum(dailyRows, 'phone_reveals'),
      enquiries: sum(dailyRows, 'enquiries'),
      publishedVehicles,
      topListings: [...listingViews.entries()].map(([id, views]) => ({ id, title: titleById.get(id) || id.slice(0, 8), views })).sort((a, b) => b.views - a.views).slice(0, 5),
      countries: [...countries.entries()].map(([code, views]) => ({ code, views })).sort((a, b) => b.views - a.views).slice(0, 10),
    }
  })
  return { periods, contactName: await contactName(admin, input.ownerUserId) }
}

async function contactName(admin: SupabaseClient, userId?: string | null) {
  if (!userId) return 'Autorell Business'
  const { data } = await admin.from('support_agent_profiles').select('display_name').eq('user_id', userId).eq('is_active', true).maybeSingle()
  return String(data?.display_name || 'Autorell Business')
}

function emptyPeriod(days: 7 | 30 | 90, publishedVehicles: number): PilotPeriodResult { return { days, views: 0, visits: 0, websiteClicks: 0, phoneClicks: 0, enquiries: 0, publishedVehicles, topListings: [], countries: [] } }
function dateDaysAgo(days: number) { return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString() }
function sum(rows: Array<Record<string, unknown>>, key: string) { return rows.reduce((total, row) => total + Number(row[key] || 0), 0) }
function chunks<T>(values: T[], size: number) { return Array.from({ length: Math.ceil(values.length / size) }, (_value, index) => values.slice(index * size, (index + 1) * size)) }
