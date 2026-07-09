import 'server-only'

import { marketplacePublicSelect, normalizeMarketplaceCategory, type MarketplaceCategorySlug } from './marketplace'
import { createAdminClient } from './supabase/admin'

export type MarketplaceSort =
  | 'published'
  | 'price-asc'
  | 'price-desc'
  | 'year-desc'
  | 'mileage-asc'

export type MarketplaceSearchInput = {
  category?: string | null
  country?: string | null
  countryCode?: string | null
  q?: string | null
  make?: string | null
  model?: string | null
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
}

export async function searchMarketplaceListings(input: MarketplaceSearchInput): Promise<MarketplaceSearchResult> {
  const admin = createAdminClient()
  const filters = normalizeMarketplaceSearchInput(input)

  let query = admin
    .from('marketplace_listings')
    .select(marketplacePublicSelect, { count: 'estimated' })
    .eq('status', 'published')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  if (filters.category) query = query.eq('category', filters.category)
  if (filters.country) query = query.eq('country_code', filters.country)
  if (filters.make) query = query.eq('make', filters.make)
  if (filters.model) query = query.eq('model', filters.model)
  if (filters.fuelType) query = query.eq('fuel_type', filters.fuelType)
  if (filters.gearbox) query = query.eq('gearbox', filters.gearbox)
  if (filters.bodyType) query = query.eq('body_type', filters.bodyType)
  if (filters.sellerType && filters.sellerType !== 'all') query = query.eq('seller_type', filters.sellerType)
  if (filters.minPrice !== null) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice !== null) query = query.lte('price', filters.maxPrice)
  if (filters.minYear !== null) query = query.gte('model_year', filters.minYear)
  if (filters.maxYear !== null) query = query.lte('model_year', filters.maxYear)
  if (filters.maxMileage !== null) query = query.lte('mileage_km', filters.maxMileage)

  if (filters.sort === 'price-asc' || filters.sort === 'price-desc') query = query.not('price', 'is', null)
  if (filters.sort === 'year-desc') query = query.not('model_year', 'is', null)
  if (filters.sort === 'mileage-asc') query = query.not('mileage_km', 'is', null)

  if (filters.q.length >= MIN_FULLTEXT_QUERY_LENGTH) {
    query = query.textSearch('search_document', filters.q, {
      type: 'websearch',
      config: 'simple',
    })
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

  query = applyCursor(query, filters.cursor)
  query = applySort(query, filters.sort).limit(filters.limit + 1)

  const { data, error, count } = await query
  if (error) {
    throw new Error(error.message)
  }

  const rows = (data || []) as MarketplaceSearchRow[]
  const items = rows.slice(0, filters.limit)
  const facets = await getMarketplaceFacets(filters)
  const hasNext = rows.length > filters.limit
  const lastItem = items[items.length - 1] || null

  return {
    items,
    facets,
    nextCursor: hasNext && lastItem ? encodeCursor(cursorFromRow(lastItem, filters.sort)) : null,
    totalEstimate: filters.cursor ? null : count,
    limit: filters.limit,
    hasNext,
  }
}

function normalizeMarketplaceSearchInput(input: MarketplaceSearchInput) {
  const categoryValue = clean(input.category)
  const category =
    categoryValue && categoryValue !== 'all' && categoryValue !== 'vehicles'
      ? normalizeMarketplaceCategory(categoryValue)
      : null
  const sort = normalizeSort(input.sort)
  const cursor = decodeCursor(input.cursor, sort)

  return {
    category,
    country: clean(input.countryCode || input.country).toUpperCase(),
    q: clean(input.q).slice(0, 80),
    make: clean(input.make).slice(0, 80),
    model: clean(input.model).slice(0, 80),
    fuelType: clean(input.fuelType || input.fuel).slice(0, 80),
    gearbox: clean(input.gearbox).slice(0, 80),
    bodyType: clean(input.bodyType).slice(0, 80),
    sellerType: clean(input.sellerType).slice(0, 24),
    minPrice: positiveNumber(input.minPrice),
    maxPrice: positiveNumber(input.maxPrice),
    minYear: positiveNumber(input.minYear),
    maxYear: positiveNumber(input.maxYear),
    maxMileage: positiveNumber(input.maxMileage),
    sort,
    cursor,
    limit: clampInt(input.limit, 1, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE),
  }
}

function clean(value: unknown) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function positiveNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null
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

async function getMarketplaceFacets(filters: ReturnType<typeof normalizeMarketplaceSearchInput>) {
  const admin = createAdminClient()
  let query = admin
    .from('marketplace_listings')
    .select('make,model,fuel_type,gearbox,body_type')
    .eq('status', 'published')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .limit(1000)

  if (filters.category) query = query.eq('category', filters.category as MarketplaceCategorySlug)
  if (filters.country) query = query.eq('country_code', filters.country)
  if (filters.q.length >= MIN_FULLTEXT_QUERY_LENGTH) {
    query = query.textSearch('search_document', filters.q, {
      type: 'websearch',
      config: 'simple',
    })
  }

  const { data } = await query
  const rows = data || []

  return {
    makes: uniqueSorted(rows.map((row) => row.make)),
    models: uniqueSorted(rows.map((row) => row.model)),
    fuels: uniqueSorted(rows.map((row) => row.fuel_type)),
    gearboxes: uniqueSorted(rows.map((row) => row.gearbox)),
    bodyTypes: uniqueSorted(rows.map((row) => row.body_type)),
  }
}

function uniqueSorted(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
    a.localeCompare(b, 'sv-SE'),
  )
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
