import assert from 'node:assert/strict'
import { XMLValidator } from 'fast-xml-parser'

const baseUrl = new URL(process.argv[2] || 'https://www.autorell.com')
const indexPath = process.env.SITEMAP_AUDIT_INDEX_PATH || '/sitemap.xml'
const expectedMarket = process.env.SITEMAP_AUDIT_EXPECTED_MARKET || ''
const userAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const maxUrlsPerSitemap = 50_000
const maxUncompressedBytes = 50 * 1024 * 1024
const concurrency = Number(process.env.SITEMAP_AUDIT_CONCURRENCY || 6)
const checkGlobalDuplicates = process.env.SITEMAP_AUDIT_GLOBAL_DUPLICATES === '1'
const globalLocations = checkGlobalDuplicates ? new Set() : null
const globalDuplicateUrls = []

const indexResponse = await fetchText(new URL(indexPath, baseUrl))
assert.equal(indexResponse.status, 200, `Sitemap index returned ${indexResponse.status}`)
assert.match(indexResponse.contentType, /(?:application|text)\/xml/i)
assert.equal(XMLValidator.validate(indexResponse.body), true, 'Sitemap index is not valid XML')
assert.match(indexResponse.body, /<sitemapindex\s+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/)

const childUrls = extract(indexResponse.body, 'loc')
assert.equal(new Set(childUrls).size, childUrls.length, 'Sitemap index contains duplicate child URLs')
if (expectedMarket) {
  assert.ok(childUrls.length, `Sitemap index contains no ${expectedMarket} child sitemaps`)
  assert.ok(
    childUrls.every((url) => marketFromSitemapUrl(url) === expectedMarket),
    `Sitemap index contains child sitemaps outside market ${expectedMarket}`,
  )
}

const indexLastmods = extract(indexResponse.body, 'lastmod')
const results = await mapWithConcurrency(childUrls, concurrency, auditChild)
const failures = results.filter((result) => result.errors.length)

const totalsByMarket = new Map()
const totalsByFamily = new Map()
const totalsByMarketAndFamily = new Map()
let totalUrls = 0
let totalBytes = 0

for (const result of results) {
  totalUrls += result.urlCount
  totalBytes += result.bytes
  addTotal(totalsByMarket, result.market, result.urlCount)
  addTotal(totalsByFamily, result.family, result.urlCount)
  addTotal(totalsByMarketAndFamily, `${result.market}:${result.family}`, result.urlCount)
}

if (globalDuplicateUrls.length) failures.push({
  url: '(all child sitemaps)',
  errors: [`${globalDuplicateUrls.length} duplicate URL occurrences across sitemap shards`, ...globalDuplicateUrls.slice(0, 20)],
})

console.log(JSON.stringify({
  baseUrl: baseUrl.origin,
  index: {
    url: new URL(indexPath, baseUrl).toString(),
    status: indexResponse.status,
    contentType: indexResponse.contentType,
    bytes: indexResponse.bytes,
    childSitemaps: childUrls.length,
    distinctLastmods: [...new Set(indexLastmods)],
  },
  totalUrls,
  totalUncompressedBytes: totalBytes,
  totalsByMarket: Object.fromEntries([...totalsByMarket].sort()),
  totalsByFamily: Object.fromEntries([...totalsByFamily].sort()),
  totalsByMarketAndFamily: marketFamilyMatrix(totalsByMarketAndFamily),
  globalDuplicateCheck: {
    enabled: checkGlobalDuplicates,
    uniqueUrls: globalLocations?.size,
    duplicateOccurrences: globalDuplicateUrls.length,
  },
  failures,
  largestSitemaps: [...results]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 10)
    .map(({ url, bytes, urlCount }) => ({ url, bytes, urlCount })),
}, null, 2))

if (failures.length) process.exitCode = 1

async function auditChild(url, index) {
  const response = await fetchText(new URL(url))
  const errors = []
  const bytes = response.bytes
  let locations = []

  if (response.status !== 200) errors.push(`HTTP ${response.status}`)
  if (response.redirected) errors.push(`redirected to ${response.finalUrl}`)
  if (!/(?:application|text)\/xml/i.test(response.contentType)) errors.push(`content-type ${response.contentType || '(missing)'}`)
  if (bytes > maxUncompressedBytes) errors.push(`${bytes} bytes exceeds 50 MB`)

  const xmlValidation = XMLValidator.validate(response.body)
  if (xmlValidation !== true) {
    errors.push(`invalid XML: ${xmlValidation.err?.msg || 'unknown error'}`)
  } else {
    if (!/<urlset\s+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(response.body)) {
      errors.push('missing sitemap urlset namespace')
    }
    locations = extract(response.body, 'loc')
  }

  if (locations.length > maxUrlsPerSitemap) errors.push(`${locations.length} URLs exceeds 50,000`)
  if (new Set(locations).size !== locations.length) errors.push('duplicate URLs inside sitemap')

  if (globalLocations) {
    for (const location of locations) {
      if (globalLocations.has(location)) globalDuplicateUrls.push(location)
      else globalLocations.add(location)
    }
  }

  const expectedOrigin = expectedOriginForSitemap(url)
  for (const location of locations) {
    let parsed
    try {
      parsed = new URL(location)
    } catch {
      errors.push(`invalid URL: ${location}`)
      continue
    }
    if (parsed.protocol !== 'https:') errors.push(`non-HTTPS URL: ${location}`)
    if (parsed.origin !== expectedOrigin) errors.push(`wrong origin: ${location}`)
  }

  if ((index + 1) % 25 === 0 || index + 1 === childUrls.length) {
    console.error(`Audited ${index + 1}/${childUrls.length} child sitemaps`)
  }

  return {
    url,
    market: marketFromSitemapUrl(url),
    family: familyFromSitemapUrl(url),
    status: response.status,
    contentType: response.contentType,
    bytes,
    urlCount: locations.length,
    errors: [...new Set(errors)].slice(0, 20),
  }
}

async function fetchText(url, attempt = 1) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': userAgent, accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1' },
  })
  if ((response.status === 429 || response.status >= 500) && attempt < 4) {
    await new Promise((resolve) => setTimeout(resolve, attempt * 750))
    return fetchText(url, attempt + 1)
  }
  const body = await response.text()
  return {
    status: response.status,
    redirected: response.redirected,
    finalUrl: response.url,
    contentType: response.headers.get('content-type') || '',
    bytes: Buffer.byteLength(body),
    body,
  }
}

function extract(xml, tag) {
  return [...xml.matchAll(new RegExp(`<${tag}>(.*?)<\\/${tag}>`, 'g'))]
    .map((match) => decodeXml(match[1].trim()))
}

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
}

function marketFromSitemapUrl(url) {
  const name = new URL(url).pathname.split('/').at(-1)?.replace(/\.xml$/i, '') || ''
  return name.match(/(?:^|-)(se|de|es|fr|it|nl|be|pl|at|dk|fi)(?:-|$)/)?.[1] || 'unknown'
}

function familyFromSitemapUrl(url) {
  const name = new URL(url).pathname.split('/').at(-1)?.replace(/\.xml$/i, '') || ''
  if (/^geo-models-/.test(name)) return 'geo-models'
  if (/^geo-makes-/.test(name)) return 'geo-makes'
  if (/^geo-/.test(name)) return 'geo'
  if (/^listings-/.test(name)) return 'listings'
  return name.split('-')[0] || 'unknown'
}

function expectedOriginForSitemap(url) {
  const market = marketFromSitemapUrl(url)
  if (market === 'se') return 'https://www.autorell.se'
  if (market === 'de') return 'https://www.autorell.de'
  return 'https://www.autorell.com'
}

function addTotal(map, key, value) {
  map.set(key, (map.get(key) || 0) + value)
}

function marketFamilyMatrix(totals) {
  const matrix = {}
  for (const [key, value] of [...totals].sort()) {
    const [market, family] = key.split(':')
    matrix[market] ||= {}
    matrix[market][family] = value
  }
  return matrix
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}
