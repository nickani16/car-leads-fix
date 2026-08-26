import assert from 'node:assert/strict'
import * as cheerio from 'cheerio'

const markets = (process.env.SEO_AUDIT_MARKETS || 'fr,es,nl,dk')
  .split(',')
  .map((market) => market.trim())
  .filter(Boolean)
const families = ['geo', 'geo-makes', 'geo-models']
const userAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

const samples = []
for (const market of markets) {
  for (const family of families) {
    const sitemapUrl = `${originForMarket(market)}/sitemaps/${family}-${market}-1.xml`
    const response = await fetch(sitemapUrl, { headers: { 'user-agent': userAgent } })
    assert.equal(response.status, 200, `${sitemapUrl} returned ${response.status}`)
    const locations = extractLocations(await response.text())
    assert.ok(locations.length, `${sitemapUrl} contains no URLs`)
    for (const index of [...new Set([0, Math.floor(locations.length / 2), locations.length - 1])]) {
      samples.push({ market, family, sitemapUrl, url: locations[index] })
    }
  }
}

function originForMarket(market) {
  if (market === 'se') return 'https://www.autorell.se'
  if (market === 'de') return 'https://www.autorell.de'
  return 'https://www.autorell.com'
}

const results = await mapWithConcurrency(samples, 4, auditPage)
console.log(JSON.stringify({
  auditedPages: results.length,
  failures: results.filter((result) => result.errors.length),
  pages: results,
}, null, 2))
if (results.some((result) => result.errors.length)) process.exitCode = 1

async function auditPage(sample) {
  const response = await fetch(sample.url, {
    redirect: 'manual',
    headers: { 'user-agent': userAgent, accept: 'text/html,application/xhtml+xml' },
  })
  const html = await response.text()
  const $ = cheerio.load(html)
  const title = normalize($('title').first().text())
  const description = normalize($('meta[name="description"]').attr('content'))
  const robots = normalize($('meta[name="robots"]').attr('content')).toLowerCase()
  const googlebot = normalize($('meta[name="googlebot"]').attr('content')).toLowerCase()
  const canonical = $('link[rel="canonical"]').attr('href') || ''
  const hreflang = $('link[rel="alternate"][hreflang]').map((_, element) => ({
    language: $(element).attr('hreflang') || '',
    href: $(element).attr('href') || '',
  })).get()
  const language = $('html').attr('lang') || ''
  const visibleBody = $('body').clone()
  visibleBody.find('script,style,noscript,svg').remove()
  const visibleText = normalize(visibleBody.text())
  const errors = []

  if (response.status !== 200) errors.push(`HTTP ${response.status}`)
  if (response.headers.has('location')) errors.push(`redirect to ${response.headers.get('location')}`)
  if (!/^text\/html/i.test(response.headers.get('content-type') || '')) errors.push('wrong content-type')
  if (!title) errors.push('missing title')
  if (!description) errors.push('missing description')
  if (title.length > 65) errors.push(`title too long: ${title.length}`)
  if (description.length < 50 || description.length > 160) errors.push(`description length: ${description.length}`)
  if (/\s(?:a|de|en|for|i|in|of|oder|eller|o|or|ou|til|w) \| Autorell$/i.test(title)) {
    errors.push('title ends with a dangling connector')
  }
  if (/noindex/.test(robots) || /noindex/.test(googlebot)) errors.push('noindex')
  if (canonical !== sample.url) errors.push(`canonical mismatch: ${canonical}`)
  if (visibleText.length < 500) errors.push(`thin server-rendered body: ${visibleText.length} chars`)

  return {
    ...sample,
    status: response.status,
    bytes: Buffer.byteLength(html),
    language,
    title,
    description,
    robots,
    googlebot,
    canonical,
    hreflangCount: hreflang.length,
    hasXDefault: hreflang.some((entry) => entry.language === 'x-default'),
    visibleTextLength: visibleText.length,
    zeroResultsText: findZeroResultsText(visibleText),
    errors,
  }
}

function findZeroResultsText(text) {
  const patterns = [
    /Aucune annonce[^.]{0,160}/i,
    /No hay anuncios[^.]{0,160}/i,
    /Momenteel geen advertenties[^.]{0,160}/i,
    /Ingen annoncer[^.]{0,160}/i,
    /Ei ilmoituksia[^.]{0,160}/i,
    /Nessun annuncio[^.]{0,160}/i,
    /Obecnie brak ogłoszeń[^.]{0,160}/i,
    /Derzeit keine Anzeigen[^.]{0,160}/i,
    /Inga annonser[^.]{0,160}/i,
  ]
  return patterns.map((pattern) => text.match(pattern)?.[0]).find(Boolean) || ''
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

function normalize(value = '') {
  return value.replace(/\s+/g, ' ').trim()
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}
