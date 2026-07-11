import 'server-only'
import { unstable_cache } from 'next/cache'
import {
  marketplacePublicSelect,
  type MarketplaceCategorySlug,
} from './marketplace'
import { sanitizePublicListingSellerName } from './public-seller'
import { createAdminClient } from './supabase/admin'

const publicListingTtl = 300

export const publicSearchListingSelect =
  'id,category,title,make,model,variant,body_type,fuel_type,model_year,mileage_km,city,country_code,country,address,latitude,longitude,price,currency'

export const getPublishedMarketplaceListings = unstable_cache(
  async (limit = 24) => {
    const { data } = await createAdminClient()
      .from('marketplace_listings')
      .select(marketplacePublicSelect)
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .is('sold_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(limit)

    return (data || []).map(sanitizePublicListingSellerName)
  },
  ['published-marketplace-listings'],
  { revalidate: publicListingTtl, tags: ['marketplace-listings'] },
)

export const getPublishedMarketplaceHomeListings = unstable_cache(
  async (
    countryCode: string | null,
    sort: 'top' | 'latest',
    limit = 8,
  ) => {
    let query = createAdminClient()
      .from('marketplace_listings')
      .select(marketplacePublicSelect)
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .is('sold_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    const normalizedCountry = (countryCode || '').toUpperCase()
    if (normalizedCountry && normalizedCountry !== 'EU') {
      query = query.eq('country_code', normalizedCountry)
    }

    if (sort === 'top') {
      query = query.order('priority', { ascending: false })
    }

    const { data } = await query
      .order('published_at', { ascending: false })
      .limit(limit)

    return (data || []).map(sanitizePublicListingSellerName)
  },
  ['published-marketplace-home-listings'],
  { revalidate: publicListingTtl, tags: ['marketplace-listings'] },
)

export const getPublishedMarketplaceCategoryListings = unstable_cache(
  async (category: MarketplaceCategorySlug | 'vehicles', limit = 120) => {
    let query = createAdminClient()
      .from('marketplace_listings')
      .select(marketplacePublicSelect)
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .is('sold_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(limit)

    if (category !== 'vehicles') {
      query = query.eq('category', category)
    }

    const { data } = await query

    return (data || []).map(sanitizePublicListingSellerName)
  },
  ['published-marketplace-category-listings'],
  { revalidate: publicListingTtl, tags: ['marketplace-listings'] },
)

export const getPublishedMarketplaceListingById = unstable_cache(
  async (id: string) => {
    const { data } = await createAdminClient()
      .from('marketplace_listings')
      .select(marketplacePublicSelect)
      .eq('id', id)
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .is('sold_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .maybeSingle()

    return data ? sanitizePublicListingSellerName(data) : null
  },
  ['published-marketplace-listing-by-id'],
  { revalidate: publicListingTtl, tags: ['marketplace-listings'] },
)

export const getMarketplaceListingForPublicDetail = unstable_cache(
  async (id: string) => {
    const { data } = await createAdminClient()
      .from('marketplace_listings')
      .select(marketplacePublicSelect)
      .eq('id', id)
      .in('status', ['published', 'sold'])
      .maybeSingle()

    if (!data) return null

    const status = String(data.status || '')
    const isExpiredPublished =
      status === 'published' &&
      data.expires_at &&
      new Date(data.expires_at).getTime() <= Date.now()

    return isExpiredPublished ? null : sanitizePublicListingSellerName(data)
  },
  ['public-marketplace-listing-detail-by-id'],
  { revalidate: publicListingTtl, tags: ['marketplace-listings'] },
)

export const getPublishedMarketplaceListingCount = unstable_cache(
  async (countryCode: string | null) => {
    return withCountTimeout(async () => {
      let query = createAdminClient()
        .from('marketplace_listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .is('sold_at', null)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

      const normalizedCountry = (countryCode || '').toUpperCase()
      if (normalizedCountry && normalizedCountry !== 'EU') {
        query = query.eq('country_code', normalizedCountry)
      }

      const { count } = await query
      return count ?? null
    })
  },
  ['published-marketplace-listing-count'],
  { revalidate: publicListingTtl, tags: ['marketplace-listings'] },
)

async function withCountTimeout(run: () => Promise<number | null>) {
  try {
    return await Promise.race([
      run(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3_000)),
    ])
  } catch {
    return null
  }
}

export const getPublicSearchListings = unstable_cache(
  async (limit = 250) => {
    const { data } = await createAdminClient()
      .from('marketplace_listings')
      .select(publicSearchListingSelect)
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .is('sold_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(limit)

    return data || []
  },
  ['public-search-listings'],
  { revalidate: publicListingTtl, tags: ['marketplace-listings'] },
)

export async function getMarketplaceSellerTrustByUserIds(userIds: string[]) {
  const ids = [...new Set(userIds.filter(Boolean))]
  if (!ids.length) return new Map<string, 'verified' | 'unverified'>()

  const { data } = await createAdminClient()
    .from('marketplace_profiles')
    .select('user_id,account_type,identity_status,business_verification_status')
    .in('user_id', ids)

  const trust = new Map<string, 'verified' | 'unverified'>()
  for (const profile of data || []) {
    const businessVerified =
      profile.account_type === 'business' &&
      ['verified', 'vat_validated'].includes(String(profile.business_verification_status || ''))
    const privateVerified =
      profile.account_type !== 'business' &&
      ['verified', 'basic_checked'].includes(String(profile.identity_status || ''))
    trust.set(profile.user_id, businessVerified || privateVerified ? 'verified' : 'unverified')
  }
  return trust
}

export async function getMarketplaceSellerPublicProfiles(userIds: string[]) {
  const ids = [...new Set(userIds.filter(Boolean))]
  if (!ids.length) {
    return new Map<string, { logoUrl: string | null; trust: 'verified' | 'unverified'; ratingAverage: number | null; ratingCount: number }>()
  }

  const { data } = await createAdminClient()
    .from('marketplace_profiles')
    .select('user_id,account_type,identity_status,business_verification_status,logo_url')
    .in('user_id', ids)

  const { data: reviewData } = await createAdminClient()
    .from('marketplace_reviews')
    .select('reviewee_id,rating')
    .in('reviewee_id', ids)
    .eq('status', 'visible')

  const reviewStats = new Map<string, { total: number; count: number }>()
  for (const review of reviewData || []) {
    const rating = Number(review.rating)
    if (!Number.isFinite(rating)) continue
    const current = reviewStats.get(review.reviewee_id) || { total: 0, count: 0 }
    current.total += rating
    current.count += 1
    reviewStats.set(review.reviewee_id, current)
  }

  const profiles = new Map<string, { logoUrl: string | null; trust: 'verified' | 'unverified'; ratingAverage: number | null; ratingCount: number }>()
  for (const profile of data || []) {
    const businessVerified =
      profile.account_type === 'business' &&
      ['verified', 'vat_validated'].includes(String(profile.business_verification_status || ''))
    const privateVerified =
      profile.account_type !== 'business' &&
      ['verified', 'basic_checked'].includes(String(profile.identity_status || ''))
    const stats = reviewStats.get(profile.user_id)
    profiles.set(profile.user_id, {
      logoUrl: typeof profile.logo_url === 'string' && profile.logo_url ? profile.logo_url : null,
      trust: businessVerified || privateVerified ? 'verified' : 'unverified',
      ratingAverage: stats?.count ? Math.round((stats.total / stats.count) * 10) / 10 : null,
      ratingCount: stats?.count || 0,
    })
  }
  return profiles
}
