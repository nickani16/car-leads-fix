import 'server-only'

import { marketplacePublicSelect, type MarketplaceCategorySlug } from './marketplace'
import { createAdminClient } from './supabase/admin'

type SupabaseAdminClient = ReturnType<typeof createAdminClient>

export type InsightListingRow = {
  id: string
  seller_user_id?: string | null
  listing_number?: string | number | null
  reference_number?: string | null
  status?: string | null
  category: MarketplaceCategorySlug
  title: string
  description?: string | null
  make: string | null
  model: string | null
  variant?: string | null
  model_year: number | string | null
  mileage_km: number | string | null
  operating_hours?: number | string | null
  fuel_type?: string | null
  gearbox?: string | null
  body_type?: string | null
  condition?: string | null
  country_code: string
  country?: string | null
  city: string | null
  municipality?: string | null
  address?: string | null
  latitude?: number | string | null
  longitude?: number | string | null
  price: number | string | null
  currency: string | null
  images?: string[] | null
  seller_name?: string | null
  seller_type?: string | null
  offer_type?: string | null
  lease_data?: Record<string, unknown> | null
  structured_data?: Record<string, unknown> | null
  original_price?: number | string | null
  edited_at?: string | null
  last_price_change_at?: string | null
  created_at?: string | null
  published_at?: string | null
  sold_at?: string | null
  expires_at?: string | null
}

export type MarketPriceInsight = {
  sampleSize: number
  currentPrice: number | null
  medianPrice: number | null
  lowPrice: number | null
  highPrice: number | null
  currency: string | null
  differencePercent: number | null
  position: 'below' | 'fair' | 'above' | 'unknown'
  matchingCriteria: string[]
}

export type ListingHistoryItem = {
  key: string
  type: 'published' | 'updated' | 'price' | 'sold' | 'event'
  labelKey: 'published' | 'updated' | 'priceChanged' | 'sold' | 'reviewed'
  description?: string
  date: string
}

export type SellerInsights = {
  listingCount: number
  activeListings: number
  totalViews: number
  totalFavorites: number
  totalEnquiries: number
  topListings: Array<{
    id: string
    title: string
    views: number
    favorites: number
  }>
  categories: Array<{ key: string; count: number }>
  markets: Array<{ key: string; count: number }>
}

const contactEventTypes = new Set([
  'conversation_started',
  'message_sent',
  'seller_contacted',
  'phone_revealed',
  'contact_form_submitted',
  'whatsapp_clicked',
])

const MARKET_PRICE_STATUS_THRESHOLD_PERCENT = 5

export async function getListingMarketInsights(
  admin: SupabaseAdminClient,
  listing: InsightListingRow,
): Promise<MarketPriceInsight> {
  const fallback = emptyMarketInsight(listing)
  const currentPrice = toNumber(listing.price)
  if (!currentPrice || !listing.currency || !listing.category) return fallback

  const rows = await fetchComparableRows(admin, listing, true)
    .then((result) => result.length >= 5 ? result : fetchComparableRows(admin, listing, false))
    .catch(() => [])
  const prices = rows
    .map((row) => toNumber(row.price))
    .filter((value): value is number => Boolean(value && value > 0))
    .sort((left, right) => left - right)

  if (prices.length < 3) return { ...fallback, sampleSize: prices.length }

  const medianPrice = median(prices)
  const lowPrice = percentile(prices, 0.25)
  const highPrice = percentile(prices, 0.75)
  const differencePercent = medianPrice
    ? Math.round(((currentPrice - medianPrice) / medianPrice) * 100)
    : null
  const position =
    differencePercent === null
      ? 'unknown'
      : differencePercent <= -MARKET_PRICE_STATUS_THRESHOLD_PERCENT
        ? 'below'
        : differencePercent >= MARKET_PRICE_STATUS_THRESHOLD_PERCENT
          ? 'above'
          : 'fair'

  return {
    sampleSize: prices.length,
    currentPrice,
    medianPrice,
    lowPrice,
    highPrice,
    currency: listing.currency,
    differencePercent,
    position,
    matchingCriteria: [
      listing.make,
      listing.model,
      listing.model_year ? String(listing.model_year) : null,
      listing.country_code,
    ].filter(Boolean) as string[],
  }
}

export async function getSimilarListings(
  admin: SupabaseAdminClient,
  listing: InsightListingRow,
  limit = 4,
): Promise<InsightListingRow[]> {
  try {
    const { data, error } = await admin
      .from('marketplace_listings')
      .select(marketplacePublicSelect)
      .eq('status', 'published')
      .eq('category', listing.category)
      .neq('id', listing.id)
      .not('published_at', 'is', null)
      .is('sold_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .limit(80)

    if (error || !data) return []
    return (data as InsightListingRow[])
      .map((candidate) => ({
        candidate,
        score: similarScore(listing, candidate),
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, limit)
      .map((entry) => entry.candidate)
  } catch {
    return []
  }
}

export async function getListingHistory(
  admin: SupabaseAdminClient,
  listing: InsightListingRow,
): Promise<ListingHistoryItem[]> {
  const [eventsResult, priceResult] = await Promise.allSettled([
    admin
      .from('marketplace_listing_events')
      .select('event_type,metadata,created_at')
      .eq('listing_id', listing.id)
      .order('created_at', { ascending: false })
      .limit(30),
    admin
      .from('marketplace_listing_price_history')
      .select('old_price,new_price,currency,created_at')
      .eq('listing_id', listing.id)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const history: ListingHistoryItem[] = []
  if (listing.published_at || listing.created_at) {
    history.push({
      key: 'published',
      type: 'published',
      labelKey: 'published',
      date: String(listing.published_at || listing.created_at),
    })
  }
  if (listing.edited_at) {
    history.push({
      key: 'edited',
      type: 'updated',
      labelKey: 'updated',
      date: listing.edited_at,
    })
  }
  if (listing.sold_at) {
    history.push({
      key: 'sold',
      type: 'sold',
      labelKey: 'sold',
      date: listing.sold_at,
    })
  }

  if (priceResult.status === 'fulfilled' && !priceResult.value.error) {
    for (const row of (priceResult.value.data || []) as Array<Record<string, unknown>>) {
      const newPrice = toNumber(row.new_price)
      const oldPrice = toNumber(row.old_price)
      const currency = typeof row.currency === 'string' ? row.currency : listing.currency || ''
      history.push({
        key: `price-${String(row.created_at)}`,
        type: 'price',
        labelKey: 'priceChanged',
        description: oldPrice && newPrice ? `${formatNumber(oldPrice)} -> ${formatNumber(newPrice)} ${currency}` : undefined,
        date: String(row.created_at),
      })
    }
  }

  if (eventsResult.status === 'fulfilled' && !eventsResult.value.error) {
    for (const row of (eventsResult.value.data || []) as Array<Record<string, unknown>>) {
      const eventType = String(row.event_type || '')
      if (!eventType || eventType === 'listing_view') continue
      if (eventType.includes('price')) continue
      const labelKey = eventType.includes('review') ? 'reviewed' : 'updated'
      history.push({
        key: `event-${eventType}-${String(row.created_at)}`,
        type: 'event',
        labelKey,
        date: String(row.created_at),
      })
    }
  }

  return dedupeHistory(history)
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 8)
}

export async function getSellerInsights(
  admin: SupabaseAdminClient,
  ownerIds: string[],
): Promise<SellerInsights> {
  if (!ownerIds.length) return emptySellerInsights()
  try {
    const { data: listings, error } = await admin
      .from('marketplace_listings')
      .select('id,title,status,category,country_code')
      .in('seller_user_id', ownerIds)
      .neq('status', 'deleted')
      .limit(500)

    if (error || !listings?.length) return emptySellerInsights()
    const listingRows = listings as Array<{ id: string; title: string | null; status: string | null; category: string | null; country_code: string | null }>
    const listingIds = listingRows.map((row) => row.id)
    const [eventsResult, savedResult] = await Promise.allSettled([
      admin
        .from('marketplace_listing_events')
        .select('listing_id,event_type')
        .in('listing_id', listingIds)
        .limit(10000),
      admin
        .from('marketplace_saved_listings')
        .select('listing_id')
        .in('listing_id', listingIds)
        .limit(10000),
    ])

    const views = new Map<string, number>()
    const enquiries = new Map<string, number>()
    if (eventsResult.status === 'fulfilled' && !eventsResult.value.error) {
      for (const event of (eventsResult.value.data || []) as Array<{ listing_id: string | null; event_type: string | null }>) {
        if (!event.listing_id) continue
        if (event.event_type === 'listing_view') {
          views.set(event.listing_id, (views.get(event.listing_id) || 0) + 1)
        } else if (event.event_type && contactEventTypes.has(event.event_type)) {
          enquiries.set(event.listing_id, (enquiries.get(event.listing_id) || 0) + 1)
        }
      }
    }

    const favorites = new Map<string, number>()
    if (savedResult.status === 'fulfilled' && !savedResult.value.error) {
      for (const saved of (savedResult.value.data || []) as Array<{ listing_id: string | null }>) {
        if (saved.listing_id) favorites.set(saved.listing_id, (favorites.get(saved.listing_id) || 0) + 1)
      }
    }

    return {
      listingCount: listingRows.length,
      activeListings: listingRows.filter((row) => row.status === 'published').length,
      totalViews: sumMap(views),
      totalFavorites: sumMap(favorites),
      totalEnquiries: sumMap(enquiries),
      topListings: listingRows
        .map((row) => ({
          id: row.id,
          title: row.title || row.id.slice(0, 8),
          views: views.get(row.id) || 0,
          favorites: favorites.get(row.id) || 0,
        }))
        .sort((left, right) => (right.views + right.favorites) - (left.views + left.favorites))
        .slice(0, 5),
      categories: countBy(listingRows.map((row) => row.category || 'unknown')),
      markets: countBy(listingRows.map((row) => row.country_code || 'EU')),
    }
  } catch {
    return emptySellerInsights()
  }
}

async function fetchComparableRows(
  admin: SupabaseAdminClient,
  listing: InsightListingRow,
  strict: boolean,
) {
  let query = admin
    .from('marketplace_listings')
    .select('id,category,make,model,model_year,mileage_km,price,currency,country_code,offer_type,published_at')
    .eq('status', 'published')
    .eq('category', listing.category)
    .eq('currency', listing.currency || '')
    .neq('id', listing.id)
    .not('price', 'is', null)
    .not('published_at', 'is', null)
    .is('sold_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .limit(80)

  if (listing.offer_type) query = query.eq('offer_type', listing.offer_type)
  if (strict && listing.make) query = query.eq('make', listing.make)
  if (strict && listing.model) query = query.eq('model', listing.model)

  const { data, error } = await query
  if (error) return []
  return (data || []) as InsightListingRow[]
}

function emptyMarketInsight(listing: InsightListingRow): MarketPriceInsight {
  return {
    sampleSize: 0,
    currentPrice: toNumber(listing.price),
    medianPrice: null,
    lowPrice: null,
    highPrice: null,
    currency: listing.currency || null,
    differencePercent: null,
    position: 'unknown',
    matchingCriteria: [],
  }
}

function emptySellerInsights(): SellerInsights {
  return {
    listingCount: 0,
    activeListings: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalEnquiries: 0,
    topListings: [],
    categories: [],
    markets: [],
  }
}

function similarScore(source: InsightListingRow, candidate: InsightListingRow) {
  let score = 0
  if (sameText(source.make, candidate.make)) score += 50
  if (sameText(source.model, candidate.model)) score += 35
  if (source.country_code && source.country_code === candidate.country_code) score += 15
  score += numberCloseness(toNumber(source.model_year), toNumber(candidate.model_year), 10)
  score += numberCloseness(toNumber(source.mileage_km), toNumber(candidate.mileage_km), 100000)
  score += numberCloseness(toNumber(source.price), toNumber(candidate.price), Math.max(toNumber(source.price) || 1, 1))
  return score
}

function numberCloseness(left: number | null, right: number | null, maxDistance: number) {
  if (left === null || right === null || maxDistance <= 0) return 0
  const distance = Math.min(Math.abs(left - right), maxDistance)
  return Math.round((1 - distance / maxDistance) * 10)
}

function sameText(left: unknown, right: unknown) {
  return typeof left === 'string' && typeof right === 'string' && left.trim().toLowerCase() === right.trim().toLowerCase()
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function median(values: number[]) {
  if (!values.length) return null
  const middle = Math.floor(values.length / 2)
  return values.length % 2 ? values[middle] : Math.round((values[middle - 1] + values[middle]) / 2)
}

function percentile(values: number[], percentileValue: number) {
  if (!values.length) return null
  const index = Math.max(0, Math.min(values.length - 1, Math.round((values.length - 1) * percentileValue)))
  return values[index]
}

function dedupeHistory(items: ListingHistoryItem[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const fingerprint = `${item.labelKey}-${item.date.slice(0, 10)}-${item.description || ''}`
    if (seen.has(fingerprint)) return false
    seen.add(fingerprint)
    return true
  })
}

function countBy(values: string[]) {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1))
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((left, right) => right.count - left.count)
}

function sumMap(map: Map<string, number>) {
  return [...map.values()].reduce((sum, value) => sum + value, 0)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(value)
}
