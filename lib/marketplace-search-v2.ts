import 'server-only'

import { marketplacePublicSelect, normalizeMarketplaceCategory } from './marketplace'
import { sanitizePublicListingSellerName } from './public-seller'
import {
  marketplaceLocations,
  marketplaceMunicipalitySearchTerms,
  marketplaceRegionMunicipalitySearchTerms,
  marketplaceSearchLocationTermsForQuery,
} from './marketplace-locations'
import { createAdminClient } from './supabase/admin'

export type MarketplaceSort =
  | 'published'
  | 'price-asc'
  | 'price-desc'
  | 'year-desc'
  | 'mileage-asc'

export type MarketplaceSearchInput = {
  category?: string | null
  categories?: string | string[] | null
  country?: string | null
  countryCode?: string | null
  countries?: string | string[] | null
  markets?: string | string[] | null
  q?: string | null
  make?: string | null
  model?: string | null
  city?: string | null
  municipality?: string | null
  county?: string | null
  region?: string | null
  minPrice?: string | number | null
  maxPrice?: string | number | null
  minYear?: string | number | null
  maxYear?: string | number | null
  maxMileage?: string | number | null
  fuel?: string | null
  fuelType?: string | null
  gearbox?: string | null
  bodyType?: string | null
  sellerType?: string | null
  condition?: string | null
  color?: string | null
  equipment?: string | null
  fourWheelDrive?: string | boolean | null
  leasingPossible?: string | boolean | null
  verifiedOnly?: string | boolean | null
  mode?: string | null
  page?: string | number | null
  sort?: string | null
  cursor?: string | null
  limit?: string | number | null
}

export type MarketplaceSearchResult = {
  items: Array<Record<string, unknown>>
  facets: {
    makes: string[]
    models: string[]
    fuels: string[]
    gearboxes: string[]
    bodyTypes: string[]
  }
  nextCursor: string | null
  totalEstimate: number | null
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  limit: number
  hasNext: boolean
}

const MAX_PAGE_SIZE = 48
const DEFAULT_PAGE_SIZE = 24
const MIN_FULLTEXT_QUERY_LENGTH = 2

type MarketplaceSearchCursor = {
  sort: MarketplaceSort
  id: string
  publishedAt: string | null
  priority?: number | null
  price?: number | null
  modelYear?: number | null
  mileageKm?: number | null
}

type MarketplaceSearchRow = Record<string, unknown> & {
  id?: string | null
  published_at?: string | null
  priority?: number | string | null
  price?: number | string | null
  model_year?: number | string | null
  mileage_km?: number | string | null
  seller_name?: string | null
  seller_type?: string | null
}

export async function searchMarketplaceListings(input: MarketplaceSearchInput): Promise<MarketplaceSearchResult> {
  const admin = createAdminClient()
  const filters = normalizeMarketplaceSearchInput(input)

  let query = admin
    .from('marketplace_listings')
    .select(marketplacePublicSelect, { count: 'exact' })

  query = applyMarketplaceListingFilters(query, filters)
  if (filters.verifiedOnly) {
    const verifiedSellerIds = await getVerifiedMarketplaceSellerIds()
    if (!verifiedSellerIds.length) {
      return emptyMarketplaceSearchResult(filters)
    }
    query = query.in('seller_user_id', verifiedSellerIds)
  }

  if (filters.sort === 'price-asc' || filters.sort === 'price-desc') query = query.not('price', 'is', null)
  if (filters.sort === 'year-desc') query = query.not('model_year', 'is', null)
  if (filters.sort === 'mileage-asc') query = query.not('mileage_km', 'is', null)

  const from = (filters.page - 1) * filters.limit
  const to = from + filters.limit - 1
  query = applyCursor(query, filters.cursor)
  query = applySort(query, filters.sort).range(from, to)

  const { data, error, count } = await query
  if (error) {
    throw new Error(error.message)
  }

  const rows = (data || []) as MarketplaceSearchRow[]
  const items = rows.map(sanitizePublicListingSellerName)
  const facets = emptyMarketplaceFacets()
  const totalCount = count || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.limit))
  const hasNext = filters.page < totalPages
  const lastItem = items[items.length - 1] || null

  return {
    items,
    facets,
    nextCursor: hasNext && lastItem ? encodeCursor(cursorFromRow(lastItem, filters.sort)) : null,
    totalEstimate: totalCount,
    totalCount,
    page: filters.page,
    pageSize: filters.limit,
    totalPages,
    limit: filters.limit,
    hasNext,
  }
}

function normalizeMarketplaceSearchInput(input: MarketplaceSearchInput) {
  const categories = normalizeCategoryFilters(input.categories ?? input.category)
  const sort = normalizeSort(input.sort)
  const cursor = decodeCursor(input.cursor, sort)

  return {
    categories,
    markets: normalizeCountryFilters(input.markets ?? input.countries ?? input.countryCode ?? input.country),
    q: clean(input.q).slice(0, 80),
    make: clean(input.make).slice(0, 80),
    model: clean(input.model).slice(0, 80),
    city: clean(input.city).slice(0, 80),
    municipality: clean(input.municipality).slice(0, 80),
    county: clean(input.county || input.region).slice(0, 80),
    fuelType: clean(input.fuelType || input.fuel).slice(0, 80),
    gearbox: clean(input.gearbox).slice(0, 80),
    bodyType: clean(input.bodyType).slice(0, 80),
    sellerType: clean(input.sellerType).slice(0, 24),
    condition: clean(input.condition).slice(0, 80),
    color: clean(input.color).slice(0, 80),
    equipment: clean(input.equipment).slice(0, 80),
    fourWheelDrive: truthy(input.fourWheelDrive),
    leasingPossible: truthy(input.leasingPossible) || clean(input.mode) === 'leasing',
    verifiedOnly: truthy(input.verifiedOnly),
    minPrice: positiveNumber(input.minPrice),
    maxPrice: positiveNumber(input.maxPrice),
    minYear: positiveNumber(input.minYear),
    maxYear: positiveNumber(input.maxYear),
    maxMileage: positiveNumber(input.maxMileage),
    sort,
    cursor,
    page: clampInt(input.page, 1, 10_000, 1),
    limit: clampInt(input.limit, 1, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE),
  }
}

function emptyMarketplaceSearchResult(filters: ReturnType<typeof normalizeMarketplaceSearchInput>): MarketplaceSearchResult {
  return {
    items: [],
    facets: emptyMarketplaceFacets(),
    nextCursor: null,
    totalEstimate: 0,
    totalCount: 0,
    page: filters.page,
    pageSize: filters.limit,
    totalPages: 1,
    limit: filters.limit,
    hasNext: false,
  }
}

async function getVerifiedMarketplaceSellerIds() {
  const { data } = await createAdminClient()
    .from('marketplace_profiles')
    .select('user_id,account_type,identity_status,business_verification_status')
    .limit(10_000)

  return (data || [])
    .filter((profile) => {
      const businessVerified =
        profile.account_type === 'business' &&
        ['verified', 'vat_validated'].includes(String(profile.business_verification_status || ''))
      const privateVerified =
        profile.account_type !== 'business' &&
        ['verified', 'basic_checked'].includes(String(profile.identity_status || ''))
      return businessVerified || privateVerified
    })
    .map((profile) => profile.user_id)
    .filter((id): id is string => typeof id === 'string' && Boolean(id))
}

function applyMarketplaceListingFilters<T extends {
  eq: (column: string, value: string | boolean) => T
  in: (column: string, values: string[]) => T
  is: (column: string, value: null) => T
  not: (column: string, operator: string, value: unknown) => T
  or: (filters: string) => T
  gte: (column: string, value: number) => T
  lte: (column: string, value: number) => T
  ilike: (column: string, pattern: string) => T
  textSearch: (column: string, query: string, options?: Record<string, unknown>) => T
}>(
  query: T,
  filters: ReturnType<typeof normalizeMarketplaceSearchInput>,
) {
  query = query
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .is('sold_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  query = applyMultiFilter(query, 'category', filters.categories)
  query = applyMultiFilter(query, 'country_code', filters.markets)
  if (filters.make) query = query.eq('make', filters.make)
  if (filters.model) query = query.eq('model', filters.model)
  if (filters.city) query = query.ilike('city', filters.city)
  if (filters.county) {
    const countyTerms = locationFilterCountryScopes(filters.markets).flatMap((country) =>
      marketplaceRegionMunicipalitySearchTerms(country, filters.county),
    )

    if (countyTerms.length) {
      query = query.or(
        countyTerms
          .flatMap((term) => {
            const escaped = escapeIlike(term)
            return [`municipality.ilike.${escaped}`, `city.ilike.${escaped}`]
          })
          .join(','),
      )
    } else {
      const escaped = escapeIlike(filters.county)
      query = query.or(`municipality.ilike.%${escaped}%,city.ilike.%${escaped}%`)
    }
  }
  if (filters.municipality) {
    const municipalityTerms = locationFilterCountryScopes(filters.markets).flatMap((country) =>
      marketplaceMunicipalitySearchTerms(country, filters.municipality),
    )

    if (municipalityTerms.length) {
      query = query.or(
        municipalityTerms
          .flatMap((term) => {
            const escaped = escapeIlike(term)
            return [`municipality.ilike.${escaped}`, `city.ilike.${escaped}`]
          })
          .join(','),
      )
    } else {
      query = query.ilike('municipality', filters.municipality)
    }
  }
  if (filters.fuelType) query = query.eq('fuel_type', filters.fuelType)
  if (filters.gearbox) query = query.eq('gearbox', filters.gearbox)
  if (filters.bodyType) query = query.eq('body_type', filters.bodyType)
  if (filters.condition) query = query.eq('condition', filters.condition)
  if (filters.color) query = query.eq('color', filters.color)
  if (filters.sellerType && filters.sellerType !== 'all') query = query.eq('seller_type', filters.sellerType)
  if (filters.equipment) query = query.ilike('equipment', `%${escapeIlike(filters.equipment)}%`)
  if (filters.fourWheelDrive) query = query.ilike('equipment', '%fyrhjuls%')
  if (filters.leasingPossible) query = query.ilike('equipment', '%leasing%')
  if (filters.minPrice !== null) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice !== null) query = query.lte('price', filters.maxPrice)
  if (filters.minYear !== null) query = query.gte('model_year', filters.minYear)
  if (filters.maxYear !== null) query = query.lte('model_year', filters.maxYear)
  if (filters.maxMileage !== null) query = query.lte('mileage_km', filters.maxMileage)

  if (filters.q.length >= MIN_FULLTEXT_QUERY_LENGTH) {
    const escaped = escapeIlike(filters.q)
    const locationTerms = marketplaceSearchLocationTermsForQuery(
      filters.q,
      locationFilterCountryScopes(filters.markets),
    )
    const locationFilters = locationTerms.municipalities.flatMap((term) => {
      const escapedTerm = escapeIlike(term)
      return [`municipality.ilike.%${escapedTerm}%`, `city.ilike.%${escapedTerm}%`]
    })
    query = query.or(
      [
        `title.ilike.%${escaped}%`,
        `make.ilike.%${escaped}%`,
        `model.ilike.%${escaped}%`,
        `variant.ilike.%${escaped}%`,
        `city.ilike.%${escaped}%`,
        `municipality.ilike.%${escaped}%`,
        `reference_number.ilike.%${escaped}%`,
        ...locationFilters,
      ].join(','),
    )
  } else if (filters.q) {
    const identifierQuery = filters.q.replace(/[%_,]/g, '')
    query = query.or(
      [
        `vin.ilike.%${identifierQuery}%`,
        `chassis_number.ilike.%${identifierQuery}%`,
        `serial_number.ilike.%${identifierQuery}%`,
        `registration_reference.ilike.%${identifierQuery}%`,
        `reference_number.ilike.%${identifierQuery}%`,
      ].join(','),
    )
  }

  return query
}

function splitFilterValues(value: unknown) {
  const values = Array.isArray(value) ? value : [value]
  return values
    .flatMap((item) => String(item || '').split(','))
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeCategoryFilters(value: unknown) {
  return [
    ...new Set(
      splitFilterValues(value)
        .filter((item) => item !== 'all' && item !== 'vehicles')
        .map((item) => normalizeMarketplaceCategory(item)),
    ),
  ]
}

function normalizeCountryFilters(value: unknown) {
  return [
    ...new Set(
      splitFilterValues(value)
        .map((item) => item.toUpperCase())
        .filter((item) => item !== 'EU' && item !== 'ALL')
        .filter((item) => /^[A-Z]{2}$/.test(item)),
    ),
  ]
}

function clean(value: unknown) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function positiveNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null
}

function truthy(value: unknown) {
  if (typeof value === 'boolean') return value
  const normalized = String(value || '').toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

function escapeIlike(value: string) {
  return value.replace(/[%_]/g, '')
}

function locationFilterCountryScopes(markets: string[]) {
  return markets.length ? markets : marketplaceLocations.map((market) => market.countryCode)
}

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.round(parsed), min), max)
}

function normalizeSort(value: unknown): MarketplaceSort {
  if (
    value === 'price-asc' ||
    value === 'price-desc' ||
    value === 'year-desc' ||
    value === 'mileage-asc'
  ) {
    return value
  }
  return 'published'
}

function applyMultiFilter<
  T extends {
    eq: (column: string, value: string) => T
    in: (column: string, values: string[]) => T
  },
>(query: T, column: string, values: string[]) {
  if (values.length === 1) return query.eq(column, values[0])
  if (values.length > 1) return query.in(column, values)
  return query
}

function applySort<T extends { order: (column: string, options?: Record<string, unknown>) => T }>(
  query: T,
  sort: MarketplaceSort,
) {
  if (sort === 'price-asc') {
    return query.order('price', { ascending: true, nullsFirst: false }).order('published_at', { ascending: false }).order('id', { ascending: false })
  }
  if (sort === 'price-desc') {
    return query.order('price', { ascending: false, nullsFirst: false }).order('published_at', { ascending: false }).order('id', { ascending: false })
  }
  if (sort === 'year-desc') {
    return query.order('model_year', { ascending: false, nullsFirst: false }).order('published_at', { ascending: false }).order('id', { ascending: false })
  }
  if (sort === 'mileage-asc') {
    return query.order('mileage_km', { ascending: true, nullsFirst: false }).order('published_at', { ascending: false }).order('id', { ascending: false })
  }
  return query.order('priority', { ascending: false }).order('published_at', { ascending: false }).order('id', { ascending: false })
}

function applyCursor<T extends { or: (filters: string) => T }>(
  query: T,
  cursor: MarketplaceSearchCursor | null,
) {
  if (!cursor?.id || !cursor.publishedAt) return query

  if (cursor.sort === 'price-asc' && cursor.price !== null && cursor.price !== undefined) {
    return query.or(keysetOr('price', cursor.price, 'gt', cursor))
  }
  if (cursor.sort === 'price-desc' && cursor.price !== null && cursor.price !== undefined) {
    return query.or(keysetOr('price', cursor.price, 'lt', cursor))
  }
  if (cursor.sort === 'year-desc' && cursor.modelYear !== null && cursor.modelYear !== undefined) {
    return query.or(keysetOr('model_year', cursor.modelYear, 'lt', cursor))
  }
  if (cursor.sort === 'mileage-asc' && cursor.mileageKm !== null && cursor.mileageKm !== undefined) {
    return query.or(keysetOr('mileage_km', cursor.mileageKm, 'gt', cursor))
  }
  if (cursor.priority !== null && cursor.priority !== undefined) {
    return query.or(keysetOr('priority', cursor.priority, 'lt', cursor))
  }

  return query
}

function keysetOr(
  column: string,
  value: number,
  direction: 'gt' | 'lt',
  cursor: MarketplaceSearchCursor,
) {
  const publishedAt = cursor.publishedAt || ''
  return [
    `${column}.${direction}.${value}`,
    `and(${column}.eq.${value},published_at.lt.${publishedAt})`,
    `and(${column}.eq.${value},published_at.eq.${publishedAt},id.lt.${cursor.id})`,
  ].join(',')
}

function cursorFromRow(row: MarketplaceSearchRow, sort: MarketplaceSort): MarketplaceSearchCursor {
  return {
    sort,
    id: String(row.id || ''),
    publishedAt: stringOrNull(row.published_at),
    priority: numberOrNull(row.priority),
    price: numberOrNull(row.price),
    modelYear: numberOrNull(row.model_year),
    mileageKm: numberOrNull(row.mileage_km),
  }
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function stringOrNull(value: unknown) {
  return typeof value === 'string' && value ? value : null
}

function emptyMarketplaceFacets() {
  return {
    makes: [],
    models: [],
    fuels: [],
    gearboxes: [],
    bodyTypes: [],
  }
}

function encodeCursor(value: MarketplaceSearchCursor) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url')
}

function decodeCursor(value: unknown, sort: MarketplaceSort): MarketplaceSearchCursor | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(Buffer.from(String(value), 'base64url').toString('utf8')) as Partial<MarketplaceSearchCursor>
    if (parsed.sort !== sort || typeof parsed.id !== 'string' || !parsed.id) return null
    return {
      sort,
      id: parsed.id,
      publishedAt: stringOrNull(parsed.publishedAt),
      priority: numberOrNull(parsed.priority),
      price: numberOrNull(parsed.price),
      modelYear: numberOrNull(parsed.modelYear),
      mileageKm: numberOrNull(parsed.mileageKm),
    }
  } catch {
    return null
  }
}
