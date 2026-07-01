import 'server-only'
import { unstable_cache } from 'next/cache'
import {
  marketplacePublicSelect,
  type MarketplaceCategorySlug,
} from './marketplace'
import { createAdminClient } from './supabase/admin'

const publicListingTtl = 300

export const publicSearchListingSelect =
  'id,category,title,make,model,variant,body_type,fuel_type,model_year,mileage_km,city,country_code,price,currency'

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

export const getPublishedMarketplaceCategoryListings = unstable_cache(
  async (category: MarketplaceCategorySlug, limit = 120) => {
    const { data } = await createAdminClient()
      .from('marketplace_listings')
      .select(marketplacePublicSelect)
      .eq('status', 'published')
      .eq('category', category)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(limit)

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
