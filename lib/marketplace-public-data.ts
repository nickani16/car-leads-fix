import 'server-only'
import { unstable_cache } from 'next/cache'
import {
  marketplacePublicSelect,
  type MarketplaceCategorySlug,
} from './marketplace'
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
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(limit)

    return data || []
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

    return data || []
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
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(limit)

    if (category !== 'vehicles') {
      query = query.eq('category', category)
    }

    const { data } = await query

    return data || []
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
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .maybeSingle()

    return data || null
  },
  ['published-marketplace-listing-by-id'],
  { revalidate: publicListingTtl, tags: ['marketplace-listings'] },
)

export const getPublicSearchListings = unstable_cache(
  async (limit = 250) => {
    const { data } = await createAdminClient()
      .from('marketplace_listings')
      .select(publicSearchListingSelect)
      .eq('status', 'published')
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
    trust.set(profile.user_id, businessVerified ? 'verified' : 'unverified')
  }
  return trust
}

export async function getMarketplaceSellerPublicProfiles(userIds: string[]) {
  const ids = [...new Set(userIds.filter(Boolean))]
  if (!ids.length) {
    return new Map<string, { logoUrl: string | null; trust: 'verified' | 'unverified' }>()
  }

  const { data } = await createAdminClient()
    .from('marketplace_profiles')
    .select('user_id,account_type,identity_status,business_verification_status,logo_url')
    .in('user_id', ids)

  const profiles = new Map<string, { logoUrl: string | null; trust: 'verified' | 'unverified' }>()
  for (const profile of data || []) {
    const businessVerified =
      profile.account_type === 'business' &&
      ['verified', 'vat_validated'].includes(String(profile.business_verification_status || ''))
    profiles.set(profile.user_id, {
      logoUrl: typeof profile.logo_url === 'string' && profile.logo_url ? profile.logo_url : null,
      trust: businessVerified ? 'verified' : 'unverified',
    })
  }
  return profiles
}
