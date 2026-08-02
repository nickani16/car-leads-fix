import 'server-only'

import crypto from 'node:crypto'
import { resolveTxt } from 'node:dns/promises'
import { load } from 'cheerio'
import { XMLParser } from 'fast-xml-parser'
import robotsParser from 'robots-parser'
import { safeFetchText, validateOutboundUrl } from '@/lib/dealer-import/safe-fetch'
import { parseVehicleHtml, type ParsedVehicle } from '@/lib/dealer-import/vehicle-parser'

const USER_AGENT = 'AutorellInventoryBot/1.0'
const MAX_DISCOVERED_URLS = 500
const MAX_SITEMAP_FILES = 10
const MAX_PARSED_PAGES_PER_RUN = 25

export type DealerWebsiteSource = {
  website_url: string | null
  inventory_url: string | null
  verified_domain: string | null
  inventory_limit: number | null
  configuration: unknown
}

export type DealerWebsiteAnalysis = {
  sourceAvailable: boolean
  discoveryComplete: boolean
  sitemapFound: boolean
  sitemapCount: number
  discoveredUrls: string[]
  parsed: Array<{ sourceUrl: string; vehicle: ParsedVehicle }>
  failedUrls: Array<{ url: string; code: string }>
  warnings: string[]
  nextOffset: number
  hasMore: boolean
}

type DealerWebsiteAnalysisOptions = {
  discoveredUrls?: string[]
  offset?: number
  sitemapFound?: boolean
  sitemapCount?: number
  batchSize?: number
}

export async function verifyDealerWebsite(
  source: DealerWebsiteSource,
  verification: { method: string; domain: string; token_hash: string | null },
) {
  const domain = verification.domain.toLowerCase()
  const allowedHosts = sourceAllowedHosts(source)
  if (!allowedHosts.has(domain) || !verification.token_hash) return { verified: false, evidence: { code: 'VERIFICATION_CONFIGURATION_INVALID' } }

  try {
    if (verification.method === 'dns') {
      const records = await resolveTxt(`_autorell-verification.${domain}`)
      const values = records.map((parts) => parts.join('').trim())
      const matched = values.some((value) => tokenMatches(value, verification.token_hash!))
      return { verified: matched, evidence: { method: 'dns', record_count: values.length } }
    }
    if (verification.method === 'html_file') {
      const result = await safeFetchText(`https://${domain}/.well-known/autorell-verification.txt`, {
        allowedHosts,
        maxBytes: 16 * 1024,
        timeoutMs: 8_000,
        maxRedirects: 2,
        acceptedContentTypes: ['text/plain', 'application/octet-stream'],
      })
      const value = result.text.trim().slice(0, 500)
      return { verified: result.status >= 200 && result.status < 300 && tokenMatches(value, verification.token_hash), evidence: { method: 'html_file', status: result.status } }
    }
    if (verification.method === 'meta_tag') {
      const root = source.website_url || `https://${domain}/`
      const result = await safeFetchText(root, {
        allowedHosts,
        maxBytes: 2 * 1024 * 1024,
        timeoutMs: 10_000,
        maxRedirects: 2,
        acceptedContentTypes: ['text/html', 'application/xhtml+xml', 'text/plain'],
      })
      const $ = load(result.text)
      const value = $('meta[name="autorell-site-verification"]').first().attr('content')?.trim() || ''
      return { verified: result.status >= 200 && result.status < 300 && tokenMatches(value, verification.token_hash), evidence: { method: 'meta_tag', status: result.status } }
    }
    return { verified: false, evidence: { code: 'MANUAL_ADMIN_REVIEW_REQUIRED' } }
  } catch (error) {
    return { verified: false, evidence: { code: errorCode(error) } }
  }
}

export async function analyzeDealerWebsite(
  source: DealerWebsiteSource,
  options: DealerWebsiteAnalysisOptions = {},
): Promise<DealerWebsiteAnalysis> {
  const startUrl = source.inventory_url || source.website_url
  if (!startUrl) throw new Error('WEBSITE_SOURCE_URL_MISSING')
  const allowedHosts = sourceAllowedHosts(source)
  const root = validateOutboundUrl(source.website_url || startUrl, allowedHosts)
  const origin = root.origin
  const warnings: string[] = []
  const failedUrls: Array<{ url: string; code: string }> = []

  const robotsUrl = new URL('/robots.txt', origin).toString()
  let robotsText = ''
  try {
    const robotsResult = await safeFetchText(robotsUrl, { allowedHosts, maxBytes: 512 * 1024, timeoutMs: 8_000, maxRedirects: 2, acceptedContentTypes: ['text/plain', 'text/html'] })
    if (robotsResult.status >= 200 && robotsResult.status < 300) robotsText = robotsResult.text
  } catch (error) {
    warnings.push(errorCode(error))
  }
  const robots = robotsParser(robotsUrl, robotsText)
  if (robots.isAllowed(startUrl, USER_AGENT) === false) throw new Error('ROBOTS_DISALLOWS_INVENTORY_SOURCE')

  let sourceAvailable = false
  let seedHtml = ''
  try {
    const seedResult = await safeFetchText(startUrl, { allowedHosts, maxBytes: 2 * 1024 * 1024, timeoutMs: 10_000, maxRedirects: 3, acceptedContentTypes: ['text/html', 'application/xhtml+xml', 'text/plain'] })
    sourceAvailable = seedResult.status >= 200 && seedResult.status < 300
    if (sourceAvailable) seedHtml = seedResult.text
    else failedUrls.push({ url: startUrl, code: `HTTP_${seedResult.status}` })
  } catch (error) {
    failedUrls.push({ url: startUrl, code: errorCode(error) })
  }
  if (!sourceAvailable) return { sourceAvailable, discoveryComplete: false, sitemapFound: false, sitemapCount: 0, discoveredUrls: [], parsed: [], failedUrls, warnings, nextOffset: 0, hasMore: false }

  const sitemapSeeds = new Set<string>([
    ...robots.getSitemaps().map((value) => absoluteAllowedUrl(value, origin, allowedHosts)).filter((value): value is string => Boolean(value)),
    new URL('/sitemap.xml', origin).toString(),
  ])
  if (seedHtml) {
    const $ = load(seedHtml)
    $('link[rel="sitemap"]').each((_index, element) => {
      const href = $(element).attr('href')
      const value = href ? absoluteAllowedUrl(href, origin, allowedHosts) : null
      if (value) sitemapSeeds.add(value)
    })
  }

  let sitemapFound = Boolean(options.sitemapFound)
  let sitemapCount = Math.max(0, Number(options.sitemapCount || 0))
  let candidateValues: string[]
  if (Array.isArray(options.discoveredUrls)) {
    candidateValues = options.discoveredUrls.flatMap((value) => {
      const url = absoluteAllowedUrl(value, origin, allowedHosts)
      return url && isLikelyVehicleUrl(url) ? [url] : []
    })
  } else {
    const sitemapResult = await discoverSitemapUrls([...sitemapSeeds], allowedHosts, robots)
    sitemapFound = sitemapResult.successfulSitemaps > 0
    sitemapCount = sitemapResult.successfulSitemaps
    const candidates = new Set(sitemapResult.urls.filter((url) => isLikelyVehicleUrl(url)))
    if (!candidates.size && seedHtml) {
      for (const link of discoverLinks(seedHtml, startUrl, allowedHosts)) {
        if (isLikelyVehicleUrl(link) && robots.isAllowed(link, USER_AGENT) !== false) candidates.add(link)
        if (candidates.size >= MAX_DISCOVERED_URLS) break
      }
    }
    candidateValues = [...candidates]
  }

  const maximum = Math.min(Number(source.inventory_limit || MAX_DISCOVERED_URLS), MAX_DISCOVERED_URLS)
  const discoveredUrls = [...new Set(candidateValues)].slice(0, maximum)
  const offset = Math.max(0, Math.min(Math.floor(Number(options.offset || 0)), discoveredUrls.length))
  const batchSize = Math.max(1, Math.min(Math.floor(Number(options.batchSize || MAX_PARSED_PAGES_PER_RUN)), MAX_PARSED_PAGES_PER_RUN))
  const batchUrls = discoveredUrls.slice(offset, offset + batchSize)
  const parsed: Array<{ sourceUrl: string; vehicle: ParsedVehicle }> = []
  const pageResults = await mapWithConcurrency(batchUrls, 2, async (url) => {
    if (robots.isAllowed(url, USER_AGENT) === false) {
      return { url, failure: 'ROBOTS_DISALLOWS_VEHICLE_PAGE' }
    }
    try {
      const page = await safeFetchText(url, { allowedHosts, maxBytes: 2 * 1024 * 1024, timeoutMs: 10_000, maxRedirects: 3, acceptedContentTypes: ['text/html', 'application/xhtml+xml', 'text/plain'] })
      if (page.status < 200 || page.status >= 300) return { url, failure: `HTTP_${page.status}` }
      const vehicle = parseVehicleHtml(page.text, page.url)
      return vehicle ? { url, vehicle } : { url, failure: 'VEHICLE_DATA_NOT_FOUND' }
    } catch (error) {
      return { url, failure: errorCode(error) }
    }
  })
  for (const result of pageResults) {
    if (result.vehicle) parsed.push({ sourceUrl: result.url, vehicle: result.vehicle })
    else if (result.failure) failedUrls.push({ url: result.url, code: result.failure })
  }
  const nextOffset = Math.min(offset + batchUrls.length, discoveredUrls.length)
  const hasMore = nextOffset < discoveredUrls.length

  return {
    sourceAvailable,
    discoveryComplete:
      sitemapFound &&
      !hasMore &&
      !failedUrls.some((failure) => discoveredUrls.includes(failure.url)),
    sitemapFound,
    sitemapCount,
    discoveredUrls,
    parsed,
    failedUrls: failedUrls.slice(0, 500),
    warnings,
    nextOffset,
    hasMore,
  }
}

export function isLikelyVehicleUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl)
    const path = decodeURIComponent(url.pathname).toLowerCase()
    if (/\.(jpg|jpeg|png|webp|avif|svg|pdf|zip|css|js)$/i.test(path)) return false
    if (/\/(search|kontakt|contact|about|om-oss|privacy|terms|login|news|blog)(\/|$)/.test(path)) return false
    const positive = /(vehicle|vehicles|car|cars|auto|autos|bil|bilar|fahrzeug|voiture|coche|wagen|samochod|ajoneuvo|inventory|stock|used|occasion|gebraucht|begagnad|vaihtoauto)/.test(path)
    const identifier = /\d{3,}|[a-f0-9]{8}-[a-f0-9-]{8,}/i.test(path)
    return positive && identifier
  } catch { return false }
}

async function discoverSitemapUrls(initial: string[], allowedHosts: ReadonlySet<string>, robots: ReturnType<typeof robotsParser>) {
  const parser = new XMLParser({ ignoreAttributes: true, processEntities: false, maxNestedTags: 100, trimValues: true })
  const queue = [...new Set(initial)]
  const seen = new Set<string>()
  const urls = new Set<string>()
  let successfulSitemaps = 0

  while (queue.length && seen.size < MAX_SITEMAP_FILES && urls.size < MAX_DISCOVERED_URLS) {
    const sitemapUrl = queue.shift()!
    if (seen.has(sitemapUrl) || robots.isAllowed(sitemapUrl, USER_AGENT) === false) continue
    seen.add(sitemapUrl)
    try {
      const response = await safeFetchText(sitemapUrl, { allowedHosts, maxBytes: 3 * 1024 * 1024, timeoutMs: 10_000, maxRedirects: 3, acceptedContentTypes: ['application/xml', 'text/xml', 'text/plain', 'application/octet-stream'] })
      if (response.status < 200 || response.status >= 300) continue
      const document = parser.parse(response.text) as Record<string, unknown>
      successfulSitemaps += 1
      for (const entry of arrayify(asRecord(document.urlset)?.url)) {
        const loc = String(asRecord(entry)?.loc || '').trim()
        const value = absoluteAllowedUrl(loc, sitemapUrl, allowedHosts)
        if (value && robots.isAllowed(value, USER_AGENT) !== false) urls.add(value)
        if (urls.size >= MAX_DISCOVERED_URLS) break
      }
      for (const entry of arrayify(asRecord(document.sitemapindex)?.sitemap)) {
        const loc = String(asRecord(entry)?.loc || '').trim()
        const value = absoluteAllowedUrl(loc, sitemapUrl, allowedHosts)
        if (value && !seen.has(value) && queue.length + seen.size < MAX_SITEMAP_FILES) queue.push(value)
      }
    } catch { /* A failed optional sitemap is not a failed source. */ }
  }
  return { urls: [...urls], successfulSitemaps }
}

function discoverLinks(html: string, baseUrl: string, allowedHosts: ReadonlySet<string>) {
  const $ = load(html)
  const links = new Set<string>()
  $('a[href]').slice(0, 5000).each((_index, element) => {
    const href = $(element).attr('href')
    const value = href ? absoluteAllowedUrl(href, baseUrl, allowedHosts) : null
    if (value) links.add(value)
  })
  return [...links]
}

export function sourceAllowedHosts(source: DealerWebsiteSource) {
  const hosts = new Set<string>()
  const verifiedDomain = source.verified_domain?.trim().toLowerCase() || ''
  const addHost = (value: string) => {
    const host = value.trim().toLowerCase()
    if (!host) return
    if (!verifiedDomain || host === verifiedDomain || host.endsWith(`.${verifiedDomain}`)) hosts.add(host)
  }
  for (const value of [source.website_url, source.inventory_url]) {
    if (!value) continue
    try { addHost(new URL(value).hostname) } catch { /* Source validation reports malformed URLs earlier. */ }
  }
  const configuration = asRecord(source.configuration)
  for (const value of arrayify(configuration?.allowed_subdomains)) {
    if (typeof value === 'string') addHost(value)
  }
  if (verifiedDomain) hosts.add(verifiedDomain)
  return hosts
}

function absoluteAllowedUrl(value: string, base: string, allowedHosts: ReadonlySet<string>) {
  try { return validateOutboundUrl(new URL(value, base).toString(), allowedHosts).toString() } catch { return null }
}

function tokenMatches(value: string, expectedHash: string) {
  const actual = crypto.createHash('sha256').update(value).digest()
  const expected = Buffer.from(expectedHash, 'hex')
  return expected.length === actual.length && crypto.timingSafeEqual(actual, expected)
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function arrayify(value: unknown): unknown[] {
  return value == null ? [] : Array.isArray(value) ? value : [value]
}

async function mapWithConcurrency<T, R>(values: T[], concurrency: number, mapper: (value: T) => Promise<R>) {
  const results = new Array<R>(values.length)
  let cursor = 0
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(values[index])
    }
  }))
  return results
}

function errorCode(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /^[A-Z0-9_]+$/.test(message) ? message : 'IMPORT_REQUEST_FAILED'
}
