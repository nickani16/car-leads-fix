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
  userId: string,
  filters: AccountListingFilters,
) {
  const { data, error } = await admin.rpc('account_listing_management', {
    p_user_id: userId,
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
  userId: string,
) {
  const { data, error } = await admin.rpc('account_listing_summary', { p_user_id: userId })
  if (error) throw error
  return normalizeSummary(data)
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
