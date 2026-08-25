import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'

loadEnvFile('.env.local')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const batchSize = Number(process.env.BACKFILL_MAP_BATCH_SIZE || 500)
const dryRun = process.argv.includes('--dry-run')

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase admin environment variables')
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

const results = {
  scanned: 0,
  eligible: 0,
  updated: 0,
  unchanged: 0,
  skipped: 0,
  failed: 0,
}

for (let from = 0; ; from += batchSize) {
  const to = from + batchSize - 1
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('id,title,address,postal_code,city,country,country_code,latitude,longitude,status,sold_at')
    .eq('status', 'published')
    .is('sold_at', null)
    .not('address', 'is', null)
    .not('city', 'is', null)
    .range(from, to)

  if (error) throw error
  if (!data?.length) break

  results.scanned += data.length
  const rows = data.filter((listing) => hasFullStreetAddress(listing))
  results.eligible += rows.length

  for (const listing of rows) {
    await backfillListing(listing)
  }

  if (data.length < batchSize) break
}

console.log(JSON.stringify(results, null, 2))

async function backfillListing(listing) {
  const query = buildLocationQuery([
    listing.address,
    listing.postal_code,
    listing.city,
    listing.country || listing.country_code,
  ])
  if (!query) {
    results.skipped += 1
    return
  }

  const geocoded = await geocodeAddress(query)
  if (!geocoded) {
    results.failed += 1
    console.warn(`geocode failed ${listing.id}: ${query}`)
    return
  }

  if (
    sameCoordinate(geocoded.latitude, Number(listing.latitude)) &&
    sameCoordinate(geocoded.longitude, Number(listing.longitude))
  ) {
    results.unchanged += 1
    return
  }

  if (dryRun) {
    results.updated += 1
    console.log(`dry-run update ${listing.id}: ${listing.latitude},${listing.longitude} -> ${geocoded.latitude},${geocoded.longitude} (${query})`)
    return
  }

  const { error: updateError } = await supabase
    .from('marketplace_listings')
    .update({
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listing.id)

  if (updateError) {
    results.failed += 1
    console.warn(`update failed ${listing.id}: ${updateError.message}`)
    return
  }

  results.updated += 1
  console.log(`updated ${listing.id}: ${geocoded.latitude},${geocoded.longitude} (${query})`)
}

function loadEnvFile(path) {
  if (!existsSync(path)) return
  const content = readFileSync(path, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
}

function hasFullStreetAddress(input) {
  const address = String(input.address || '').trim()
  return Boolean(
    address &&
      /\d/.test(address) &&
      String(input.city || '').trim() &&
      (String(input.country || '').trim() || String(input.country_code || '').trim()),
  )
}

function buildLocationQuery(parts) {
  return parts.map((part) => String(part || '').trim()).filter(Boolean).join(', ')
}

async function geocodeAddress(query) {
  const endpoint = process.env.GEOCODING_API_URL || process.env.MAP_GEOCODING_API_URL
  const url = endpoint ? configuredGeocodingUrl(endpoint, query) : nominatimUrl(query)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8_000)
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Autorell marketplace map coordinate backfill',
      },
      signal: controller.signal,
    })
    if (!response.ok) return null
    return readFirstCoordinate(await response.json())
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function configuredGeocodingUrl(endpoint, query) {
  const url = new URL(endpoint)
  if (!url.searchParams.has('q') && !url.searchParams.has('query')) url.searchParams.set('q', query)
  if (!url.searchParams.has('format')) url.searchParams.set('format', 'json')
  if (!url.searchParams.has('limit')) url.searchParams.set('limit', '1')
  return url
}

function nominatimUrl(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('addressdetails', '0')
  return url
}

function readFirstCoordinate(payload) {
  const candidate = Array.isArray(payload) ? payload[0] : payload
  if (!candidate || typeof candidate !== 'object') return null
  const latitude = Number(candidate.lat)
  const longitude = Number(candidate.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null
  return { latitude, longitude }
}

function sameCoordinate(left, right) {
  return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 0.00005
}
