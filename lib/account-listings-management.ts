import type { createAdminClient } from '@/lib/supabase/admin'

export const accountListingTabs = [
  'all', 'active', 'payment', 'review', 'draft', 'paused', 'expired', 'sold', 'deleted',
] as const
export type AccountListingTab = (typeof accountListingTabs)[number]

export const accountListingSorts = [
  'updated_desc', 'created_desc', 'created_asc', 'price_asc', 'price_desc',
  'views_desc', 'favorites_desc', 'expires_asc',
] as const
export type AccountListingSort = (typeof accountListingSorts)[number]

export type AccountListingFilters = {
  status: AccountListingTab
  query: string
  category: string
  country: string
  package: string
  marketing: 'all' | 'active' | 'none'
  sellerType: 'all' | 'private' | 'business'
  sort: AccountListingSort
  page: number
  pageSize: number
}

export type ManagedListing = {
  id: string
  title: string
  status: string
  review_status: string
  risk_flags: string[]
  category: string
  make: string | null
  model: string | null
  registration_reference: string | null
  vin: string | null
  chassis_number: string | null
  price: number
  currency: string
  images: string[]
  seller_type: string
  country_code: string
  package_id: string
  listing_number: number | string | null
  reference_number: string | null
  created_at: string
  updated_at: string
  published_at: string | null
  expires_at: string | null
  last_refreshed_at: string | null
  boost_started_at: string | null
  boost_expires_at: string | null
  boost_status: string
  featured_started_at: string | null
  featured_expires_at: string | null
  featured_status: string
  view_count: number
  favorite_count: number
}

export type ManagedListingResult = {
  items: ManagedListing[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export type AccountListingSummary = {
  counts: Record<AccountListingTab, number>
  totalViews: number
  totalFavorites: number
  missingImages: number
  firstMissingImageId: string | null
  flagged: number
  expiringSoon: number
  failedPayments: number
  categories: string[]
  countries: string[]
}

type SearchParamsLike = Record<string, string | string[] | undefined> | URLSearchParams
type ListingQueryBuilder = {
  eq: (column: string, value: unknown) => ListingQueryBuilder
  in: (column: string, values: unknown[]) => ListingQueryBuilder
  or: (filters: string) => ListingQueryBuilder
  order: (column: string, options?: Record<string, unknown>) => ListingQueryBuilder
  range: (from: number, to: number) => Promise<{ data: unknown[] | null; error: unknown; count: number | null }>
}

export function parseAccountListingFilters(
  source: SearchParamsLike,
  accountType: string | null | undefined,
): AccountListingFilters {
  const get = (key: string) => {
    if (source instanceof URLSearchParams) return source.get(key) || ''
    const value = source[key]
    return Array.isArray(value) ? value[0] || '' : value || ''
  }
  const requestedStatus = get('status')
  const requestedSort = get('sort')
  const requestedMarketing = get('marketing')
  const requestedSellerType = get('sellerType')
  const requestedPageSize = Number(get('pageSize'))
  const allowedPageSizes = accountType === 'business' ? [25, 50, 100] : [25]

  return {
    status: accountListingTabs.includes(requestedStatus as AccountListingTab)
      ? requestedStatus as AccountListingTab
      : 'all',
    query: get('query').trim().slice(0, 120),
    category: safeFilterValue(get('category')),
    country: safeFilterValue(get('country')).toLowerCase(),
    package: safeFilterValue(get('package')),
    marketing: ['active', 'none'].includes(requestedMarketing)
      ? requestedMarketing as 'active' | 'none'
      : 'all',
    sellerType: ['private', 'business'].includes(requestedSellerType)
      ? requestedSellerType as 'private' | 'business'
      : 'all',
    sort: accountListingSorts.includes(requestedSort as AccountListingSort)
      ? requestedSort as AccountListingSort
      : 'updated_desc',
    page: clampInteger(Number(get('page')), 1, 1_000_000, 1),
    pageSize: allowedPageSizes.includes(requestedPageSize) ? requestedPageSize : 25,
  }
}

export async function getManagedListings(
  admin: ReturnType<typeof createAdminClient>,
  userId: string | string[],
  filters: AccountListingFilters,
) {
  const ownerIds = normalizeOwnerIds(userId)
  if (ownerIds.length !== 1) return getManagedListingsForOwners(admin, ownerIds, filters)

  const { data, error } = await admin.rpc('account_listing_management', {
    p_user_id: ownerIds[0],
    p_status: filters.status,
    p_query: filters.query,
    p_category: filters.category,
    p_country: filters.country,
    p_package: filters.package,
    p_marketing: filters.marketing,
    p_seller_type: filters.sellerType,
    p_sort: filters.sort,
    p_page: filters.page,
    p_page_size: filters.pageSize,
  })
  if (error) throw error
  return normalizeListingResult(data, filters)
}

export async function getAccountListingSummary(
  admin: ReturnType<typeof createAdminClient>,
  userId: string | string[],
) {
  const ownerIds = normalizeOwnerIds(userId)
  if (ownerIds.length !== 1) return getAccountListingSummaryForOwners(admin, ownerIds)

  const { data, error } = await admin.rpc('account_listing_summary', { p_user_id: ownerIds[0] })
  if (error) throw error
  return normalizeSummary(data)
}

async function getManagedListingsForOwners(
  admin: ReturnType<typeof createAdminClient>,
  ownerIds: string[],
  filters: AccountListingFilters,
) {
  let query = admin
    .from('marketplace_listings')
    .select('id,title,status,review_status,risk_flags,category,make,model,registration_reference,vin,chassis_number,price,currency,images,seller_type,country_code,package_id,listing_number,reference_number,created_at,updated_at,published_at,expires_at,last_refreshed_at,boost_started_at,boost_expires_at,boost_status,featured_started_at,featured_expires_at,featured_status', { count: 'exact' })
    .in('seller_user_id', ownerIds) as unknown as ListingQueryBuilder

  query = applyListingFilters(query, filters)
  query = applyListingSort(query, filters)
  const from = (filters.page - 1) * filters.pageSize
  const to = from + filters.pageSize - 1
  const { data, error, count } = await query.range(from, to)
  if (error) throw error

  const items = await attachListingActivityCounts(admin, (data || []) as Array<Record<string, unknown>>)
  const totalCount = count || 0
  const totalPages = totalCount ? Math.ceil(totalCount / filters.pageSize) : 0
  return normalizeListingResult({
    items,
    totalCount,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages,
    hasNext: filters.page < totalPages,
    hasPrevious: filters.page > 1,
  }, filters)
}

async function getAccountListingSummaryForOwners(
  admin: ReturnType<typeof createAdminClient>,
  ownerIds: string[],
) {
  const { data, error } = await admin
    .from('marketplace_listings')
    .select('id,status,review_status,images,expires_at,category,country_code')
    .in('seller_user_id', ownerIds)
  if (error) throw error

  const listings = (data || []) as Array<Record<string, unknown>>
  const listingIds = listings.map((listing) => String(listing.id)).filter(Boolean)
  const [viewCount, favoriteCount, failedPayments] = await Promise.all([
    countListingEvents(admin, listingIds, 'listing_view'),
    countSavedListings(admin, listingIds),
    countFailedListingPayments(admin, listingIds),
  ])
  const now = Date.now()
  const threeDays = now + 3 * 86400000
  const counts = Object.fromEntries(accountListingTabs.map((key) => [key, 0])) as Record<AccountListingTab, number>
  for (const listing of listings) {
    const status = String(listing.status || '')
    counts.all += 1
    if (status === 'published') counts.active += 1
    if (status === 'pending_payment') counts.payment += 1
    if (status === 'pending_review' || status === 'rejected') counts.review += 1
    if (status === 'draft') counts.draft += 1
    if (status === 'paused') counts.paused += 1
    if (status === 'expired') counts.expired += 1
    if (status === 'sold') counts.sold += 1
    if (status === 'deleted' || status === 'removed') counts.deleted += 1
  }

  return {
    counts,
    totalViews: viewCount,
    totalFavorites: favoriteCount,
    missingImages: listings.filter((listing) => !Array.isArray(listing.images) || listing.images.length === 0).length,
    firstMissingImageId: String(listings.find((listing) => !Array.isArray(listing.images) || listing.images.length === 0)?.id || '') || null,
    flagged: listings.filter((listing) => ['flagged', 'rejected'].includes(String(listing.review_status || '')) || listing.status === 'rejected').length,
    expiringSoon: listings.filter((listing) => {
      const expiresAt = listing.expires_at ? new Date(String(listing.expires_at)).getTime() : 0
      return listing.status === 'published' && expiresAt > now && expiresAt <= threeDays
    }).length,
    failedPayments,
    categories: [...new Set(listings.map((listing) => String(listing.category || '')).filter(Boolean))].sort(),
    countries: [...new Set(listings.map((listing) => String(listing.country_code || '')).filter(Boolean))].sort(),
  }
}

async function attachListingActivityCounts(
  admin: ReturnType<typeof createAdminClient>,
  listings: Array<Record<string, unknown>>,
) {
  const listingIds = listings.map((listing) => String(listing.id)).filter(Boolean)
  if (!listingIds.length) return listings
  const [{ data: events }, { data: saved }] = await Promise.all([
    admin
      .from('marketplace_listing_events')
      .select('listing_id')
      .in('listing_id', listingIds)
      .eq('event_type', 'listing_view'),
    admin
      .from('marketplace_saved_listings')
      .select('listing_id')
      .in('listing_id', listingIds),
  ])
  const views = countByListing(events || [])
  const favorites = countByListing(saved || [])
  return listings.map((listing) => ({
    ...listing,
    view_count: views.get(String(listing.id)) || 0,
    favorite_count: favorites.get(String(listing.id)) || 0,
  }))
}

async function countListingEvents(admin: ReturnType<typeof createAdminClient>, listingIds: string[], eventType: string) {
  if (!listingIds.length) return 0
  const { count, error } = await admin
    .from('marketplace_listing_events')
    .select('id', { count: 'exact', head: true })
    .in('listing_id', listingIds)
    .eq('event_type', eventType)
  if (error) throw error
  return count || 0
}

async function countSavedListings(admin: ReturnType<typeof createAdminClient>, listingIds: string[]) {
  if (!listingIds.length) return 0
  const { count, error } = await admin
    .from('marketplace_saved_listings')
    .select('user_id', { count: 'exact', head: true })
    .in('listing_id', listingIds)
  if (error) throw error
  return count || 0
}

async function countFailedListingPayments(admin: ReturnType<typeof createAdminClient>, listingIds: string[]) {
  if (!listingIds.length) return 0
  const { count, error } = await admin
    .from('payment_orders')
    .select('listing_id', { count: 'exact', head: true })
    .in('listing_id', listingIds)
    .eq('status', 'failed')
  if (error) throw error
  return count || 0
}

function applyListingFilters(
  query: ListingQueryBuilder,
  filters: AccountListingFilters,
) {
  if (filters.status === 'active') query = query.eq('status', 'published')
  if (filters.status === 'payment') query = query.eq('status', 'pending_payment')
  if (filters.status === 'review') query = query.in('status', ['pending_review', 'rejected'])
  if (filters.status === 'draft') query = query.eq('status', 'draft')
  if (filters.status === 'paused') query = query.eq('status', 'paused')
  if (filters.status === 'expired') query = query.eq('status', 'expired')
  if (filters.status === 'sold') query = query.eq('status', 'sold')
  if (filters.status === 'deleted') query = query.in('status', ['deleted', 'removed'])
  if (filters.category !== 'all') query = query.eq('category', filters.category)
  if (filters.country !== 'all') query = query.eq('country_code', filters.country.toUpperCase())
  if (filters.package !== 'all') query = query.eq('package_id', filters.package)
  if (filters.sellerType !== 'all') query = query.eq('seller_type', filters.sellerType)
  if (filters.marketing === 'active') {
    query = query.or(`boost_status.eq.active,featured_status.eq.active`)
  } else if (filters.marketing === 'none') {
    query = query.or(`boost_status.is.null,boost_status.neq.active`)
  }
  if (filters.query) {
    const value = filters.query.replace(/[%_,]/g, ' ')
    query = query.or(`title.ilike.%${value}%,make.ilike.%${value}%,model.ilike.%${value}%,registration_reference.ilike.%${value}%,vin.ilike.%${value}%,chassis_number.ilike.%${value}%,reference_number.ilike.%${value}%`)
  }
  return query
}

function applyListingSort(query: ListingQueryBuilder, filters: AccountListingFilters) {
  if (filters.sort === 'created_asc') return query.order('created_at', { ascending: true }).order('id', { ascending: false })
  if (filters.sort === 'created_desc') return query.order('created_at', { ascending: false }).order('id', { ascending: false })
  if (filters.sort === 'price_asc') return query.order('price', { ascending: true }).order('updated_at', { ascending: false })
  if (filters.sort === 'price_desc') return query.order('price', { ascending: false }).order('updated_at', { ascending: false })
  if (filters.sort === 'expires_asc') return query.order('expires_at', { ascending: true, nullsFirst: false }).order('updated_at', { ascending: false })
  return query.order('updated_at', { ascending: false }).order('id', { ascending: false })
}

function countByListing(rows: Array<{ listing_id?: unknown }>) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const id = String(row.listing_id || '')
    if (!id) continue
    counts.set(id, (counts.get(id) || 0) + 1)
  }
  return counts
}

function normalizeOwnerIds(value: string | string[]) {
  return Array.from(new Set((Array.isArray(value) ? value : [value]).map((id) => String(id || '')).filter(Boolean)))
}

function normalizeListingResult(value: unknown, filters: AccountListingFilters): ManagedListingResult {
  const data = isRecord(value) ? value : {}
  const items = Array.isArray(data.items)
    ? data.items.filter(isRecord).map((item) => ({
        ...item,
        price: finiteNumber(item.price),
        view_count: finiteNumber(item.view_count),
        favorite_count: finiteNumber(item.favorite_count),
        images: Array.isArray(item.images) ? item.images.filter((image): image is string => typeof image === 'string') : [],
        risk_flags: Array.isArray(item.risk_flags) ? item.risk_flags.filter((flag): flag is string => typeof flag === 'string') : [],
      })) as ManagedListing[]
    : []
  const totalCount = finiteNumber(data.totalCount)
  const pageSize = finiteNumber(data.pageSize) || filters.pageSize
  const page = finiteNumber(data.page) || filters.page
  const totalPages = finiteNumber(data.totalPages)
  return {
    items,
    totalCount,
    page,
    pageSize,
    totalPages,
    hasNext: Boolean(data.hasNext),
    hasPrevious: Boolean(data.hasPrevious),
  }
}

function normalizeSummary(value: unknown): AccountListingSummary {
  const data = isRecord(value) ? value : {}
  const rawCounts = isRecord(data.counts) ? data.counts : {}
  const counts = Object.fromEntries(
    accountListingTabs.map((key) => [key, finiteNumber(rawCounts[key])]),
  ) as Record<AccountListingTab, number>
  return {
    counts,
    totalViews: finiteNumber(data.totalViews),
    totalFavorites: finiteNumber(data.totalFavorites),
    missingImages: finiteNumber(data.missingImages),
    firstMissingImageId: typeof data.firstMissingImageId === 'string' ? data.firstMissingImageId : null,
    flagged: finiteNumber(data.flagged),
    expiringSoon: finiteNumber(data.expiringSoon),
    failedPayments: finiteNumber(data.failedPayments),
    categories: Array.isArray(data.categories) ? data.categories.filter((item): item is string => typeof item === 'string') : [],
    countries: Array.isArray(data.countries) ? data.countries.filter((item): item is string => typeof item === 'string') : [],
  }
}

function safeFilterValue(value: string) {
  const clean = value.trim().slice(0, 80)
  return clean && /^[a-zA-Z0-9_-]+$/.test(clean) ? clean : 'all'
}

function clampInteger(value: number, min: number, max: number, fallback: number) {
  return Number.isInteger(value) ? Math.min(max, Math.max(min, value)) : fallback
}

function finiteNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
