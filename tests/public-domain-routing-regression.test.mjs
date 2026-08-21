import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8')
const publicSeo = readFileSync(new URL('../lib/public-seo.ts', import.meta.url), 'utf8')
const sitemapUtils = readFileSync(new URL('../lib/sitemap-utils.ts', import.meta.url), 'utf8')
const sitemapIndex = readFileSync(new URL('../app/sitemap.xml/route.ts', import.meta.url), 'utf8')
const sitemapRoute = readFileSync(new URL('../app/sitemaps/[name]/route.ts', import.meta.url), 'utf8')
const footer = readFileSync(new URL('../app/components/PublicFooter.tsx', import.meta.url), 'utf8')
const header = readFileSync(new URL('../app/components/PublicHeader.tsx', import.meta.url), 'utf8')
const publicInfoPage = readFileSync(new URL('../app/components/PublicInfoPage.tsx', import.meta.url), 'utf8')
const seoLandingData = readFileSync(new URL('../lib/seo-landing-data.ts', import.meta.url), 'utf8')
const listingUrl = readFileSync(new URL('../lib/listing-url.ts', import.meta.url), 'utf8')
const listingDetail = readFileSync(new URL('../app/listings/[slug]/ListingDetailPage.tsx', import.meta.url), 'utf8')

test('Swedish and German markets use their own canonical domains', () => {
  assert.match(proxy, /sv: 'www\.autorell\.se'/)
  assert.match(proxy, /de: 'www\.autorell\.de'/)
  assert.match(proxy, /'autorell\.se': 'www\.autorell\.se'/)
  assert.match(proxy, /'autorell\.de': 'www\.autorell\.de'/)
  assert.match(publicSeo, /locale === 'sv'.*https:\/\/www\.autorell\.se/)
  assert.match(publicSeo, /locale === 'de'.*https:\/\/www\.autorell\.de/)
  assert.match(publicSeo, /locale === 'sv' \|\| locale === 'de' \? '' : localePathPrefix\(locale\)/)
  assert.doesNotMatch(publicSeo, /autorell\.se\/se/)
  assert.doesNotMatch(publicSeo, /autorell\.de\/de/)
})

test('market switching never nests another market below the Swedish or German domain', () => {
  assert.match(footer, /normalizedCode === 'SE'.*https:\/\/www\.autorell\.se\//s)
  assert.match(footer, /normalizedCode === 'DE'.*https:\/\/www\.autorell\.de\//s)
  assert.match(footer, /https:\/\/www\.autorell\.com\/\$\{normalizedCode\.toLowerCase\(\)\}/)
  assert.match(proxy, /EU_BUYER_MARKET_CODES\.has\(requestedPrefix\)/)
  assert.match(proxy, /requestedPrefix === 'de'[\s\S]*MARKET_HOSTS\.en/)
})

test('country-domain account and advertising links have no duplicate market prefix', () => {
  assert.match(
    header,
    /activeMarketCode === 'eu' \|\| activeMarketCode === 'se' \|\| activeMarketCode === 'de'/,
  )
  assert.match(header, /localizePublicHref\(locale, '\/account\/listings\/new'\)/)
})

test('country-domain listing pages compare and redirect against root paths', () => {
  assert.match(listingUrl, /normalizedHost === 'autorell\.se'.*\? '\/se'/s)
  assert.match(listingUrl, /normalizedHost === 'autorell\.de'.*\? '\/de'/s)
  assert.match(listingUrl, /path\.slice\(countryPrefix\.length\)/)
  assert.match(listingDetail, /const canonicalRequestPath = listingPathForHostname/)
  assert.match(listingDetail, /normalizePathname\(canonicalRequestPath\)/)
  assert.match(listingDetail, /permanentRedirect\(canonicalRequestPath\)/)
})

test('an explicit market selection is handled before country-domain routing', () => {
  const marketSelection = proxy.indexOf(
    'if (methodCanRedirect && isMarketSelection(selectedMarket))',
  )
  const countryDomainRouting = proxy.indexOf(
    'const countryDomainPrefix = countryDomainMarketPrefix(hostname)',
  )

  assert.ok(marketSelection > 0)
  assert.ok(countryDomainRouting > marketSelection)
})

test('domain sitemap indexes and shards cannot mix markets', () => {
  assert.match(sitemapUtils, /sitemapMarketsForRequest/)
  assert.match(sitemapUtils, /return \['se'\]/)
  assert.match(sitemapUtils, /return \['de'\]/)
  assert.match(sitemapIndex, /sitemapHostForRequest\(request\)/)
  assert.match(sitemapRoute, /sitemapMarketsForRequest\(request\)\.includes\(requestedMarket\)/)
  assert.match(sitemapRoute, /sitemapHostForMarket\(market\)/)
})

test('shared public pages and structured data use the market domain helper', () => {
  assert.match(publicInfoPage, /const canonical = publicUrlForLocale\(locale, canonicalPath\)/)
  assert.match(seoLandingData, /item: publicUrlForPath\(item\.href\)/)
  assert.match(seoLandingData, /url: publicUrlForPath\(listing\.href\)/)
})

test('regular mobile footer can scroll above the fixed bottom navigation', () => {
  assert.match(footer, /--autorell-mobile-footer-reserve,4\.75rem/)
  assert.match(header, /--autorell-mobile-footer-reserve/)
  assert.match(header, /mobileNavVisible \? '5\.5rem' : '4\.75rem'/)
  assert.match(header, /document\.documentElement\.scrollHeight - 160/)
  assert.match(footer, /min-\[1120px\]:pb-7/)
})
