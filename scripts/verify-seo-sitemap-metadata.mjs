import assert from 'node:assert/strict'
import * as cheerio from 'cheerio'

const baseUrl = new URL(process.argv[2] || process.env.SEO_BASE_URL || 'http://127.0.0.1:3000')
const canonicalOrigin = 'https://www.autorell.com'
const canonicalOrigins = {
  se: 'https://www.autorell.se',
  de: 'https://www.autorell.de',
}
const defaultMarkets = ['se', 'de', 'fr', 'it', 'es', 'nl', 'be', 'pl', 'at', 'dk', 'fi']
const markets = process.env.SEO_MARKETS?.split(',').map((market) => market.trim()).filter(Boolean) || defaultMarkets
const sitemapFamilies = [
  (market) => `categories-${market}.xml`,
  (market) => `brands-${market}.xml`,
  (market) => `models-${market}.xml`,
  (market) => `geo-${market}-1.xml`,
  (market) => `geo-makes-${market}-1.xml`,
  (market) => `geo-models-${market}-1.xml`,
]

const sitemapChecks = markets.flatMap((market) =>
  sitemapFamilies.map((nameForMarket) => ({ market, sitemap: nameForMarket(market) })),
)

const landingUrls = []
for (const { market, sitemap } of sitemapChecks) {
  const response = await fetch(new URL(`/sitemaps/${sitemap}`, baseUrl))
  assert.equal(response.status, 200, `${sitemap} returned ${response.status}`)
  const locations = extractLocations(await response.text())
  assert.ok(locations.length, `${sitemap} contains no URLs`)
  landingUrls.push({ market, sitemap, canonicalUrl: locations[0] })
}

landingUrls.push({
  market: 'at',
  sitemap: 'reported-route',
  canonicalUrl: `${canonicalOrigin}/at/transporter/rohr-im-kremstal`,
})

const results = await mapWithConcurrency(landingUrls, 8, verifyLanding)
for (const result of results) {
  console.log(
    `${result.market.padEnd(2)} ${result.sitemap.padEnd(24)} ${result.title} ` +
    `(title ${result.titleLength}, description ${result.descriptionLength})`,
  )
}
console.log(`Verified ${results.length} rendered SEO landings across ${markets.length} markets.`)

async function verifyLanding({ market, sitemap, canonicalUrl }) {
  const canonical = new URL(canonicalUrl)
  const expectedOrigin = canonicalOrigins[market] || canonicalOrigin
  assert.equal(canonical.origin, expectedOrigin, `${sitemap} contains a non-canonical origin`)
  assert.equal(canonical.search, '', `${sitemap} contains a query URL: ${canonicalUrl}`)

  const isLocal = ['127.0.0.1', 'localhost'].includes(baseUrl.hostname)
  const canonicalPath = canonical.pathname.startsWith(`/${market}/`)
    ? canonical.pathname.slice(market.length + 1)
    : canonical.pathname
  const requestPath = isLocal
    ? `/seo/${market}${canonicalPath}`
    : `${canonical.pathname}${canonical.search}`
  const requestUrl = new URL(requestPath, baseUrl)
  const response = await fetch(requestUrl, {
    redirect: 'manual',
    headers: isLocal ? { 'x-autorell-internal-seo': '1' } : undefined,
  })
  assert.equal(response.status, 200, `${canonical.pathname} returned ${response.status}`)

  const $ = cheerio.load(await response.text())
  const title = normalizeText($('title').first().text())
  const description = normalizeText($('meta[name="description"]').attr('content'))
  const canonicalHref = $('link[rel="canonical"]').attr('href')
  assert.ok(title.endsWith(' | Autorell'), `${canonical.pathname} is missing the Autorell title suffix`)
  assert.ok(title.length <= 60, `${canonical.pathname} title exceeds 60 characters`)
  assert.equal(canonicalHref, canonicalUrl, `${canonical.pathname} has the wrong canonical`)
  assert.ok(description.length >= 60, `${canonical.pathname} has an incomplete description`)
  assert.ok(description.length <= 155, `${canonical.pathname} description exceeds 155 characters`)

  return {
    market,
    sitemap,
    title,
    titleLength: title.length,
    descriptionLength: description.length,
  }
}

function extractLocations(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decodeXml(match[1]))
}

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
}

function normalizeText(value = '') {
  return value.replace(/\s+/g, ' ').trim()
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(items[index])
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}
