import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const geoLandingSource = readFileSync(new URL('../lib/seo-geo-landings.ts', import.meta.url), 'utf8')
const marketplaceGeoSource = readFileSync(new URL('../lib/marketplace-geo.ts', import.meta.url), 'utf8')
const marketplacePageSource = readFileSync(new URL('../app/marketplace/[category]/page.tsx', import.meta.url), 'utf8')
const vehicleSearchSource = readFileSync(new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url), 'utf8')
const seoRouteSource = readFileSync(new URL('../app/seo/[market]/[...slug]/page.tsx', import.meta.url), 'utf8')
const sitemapIndexSource = readFileSync(new URL('../app/sitemap.xml/route.ts', import.meta.url), 'utf8')
const sitemapShardSource = readFileSync(new URL('../app/sitemaps/[name]/route.ts', import.meta.url), 'utf8')
const robotsSource = readFileSync(new URL('../app/robots.txt/route.ts', import.meta.url), 'utf8')

const markets = ['se', 'de', 'fr', 'it', 'es', 'nl', 'be', 'pl', 'at', 'dk', 'fi']

test('SEO route state is centralized for all eleven active markets', () => {
  for (const market of markets) {
    assert.match(geoLandingSource, new RegExp(`\\b${market}:`), `${market} is missing from SEO route config`)
    assert.ok(sitemapIndexSource.includes(`'${market}'`), `${market} is missing from sitemap index config`)
  }
  assert.match(geoLandingSource, /resolveStaticMarketplaceGeoAreaBySlug/)
  assert.match(geoLandingSource, /brandSuggestionsForCategory/)
  assert.match(geoLandingSource, /category-make-model-location/)
  assert.match(geoLandingSource, /buildSeoMarketplaceSearchParams/)
  assert.match(geoLandingSource, /shouldIncludeInSitemap/)
  assert.match(geoLandingSource, /BMW: \['X5', '3 Series'/)
  assert.match(geoLandingSource, /Volvo: \['XC60', 'V60'/)
  assert.match(marketplaceGeoSource, /getStaticGeoDataset/)
  assert.match(marketplaceGeoSource, /getStaticMarketplaceGeoAreas/)
})

test('clean SEO URLs render the real Marketplace with server metadata and structured data', () => {
  assert.match(seoRouteSource, /import MarketplaceCategoryPage/)
  assert.match(seoRouteSource, /seoLanding=\{landing\}/)
  assert.match(seoRouteSource, /robots: \{ index: true, follow: true \}/)
  assert.match(seoRouteSource, /alternates: \{ canonical \}/)
  assert.match(seoRouteSource, /CollectionPage/)
  assert.match(seoRouteSource, /BreadcrumbList/)
  assert.match(marketplacePageSource, /searchMarketplaceListings/)
  assert.match(marketplacePageSource, /initialGeoArea/)
  assert.match(marketplacePageSource, /preserveCanonicalUrl=\{Boolean\(seoLanding\)\}/)
  assert.match(vehicleSearchSource, /<h1 id="seo-marketplace-heading"/)
  assert.match(vehicleSearchSource, /seoLanding\?\.zeroResultsText/)
  assert.match(vehicleSearchSource, /params\.set\('markets', safeAutomaticCountry\)/)
})

test('filtered query pages canonicalize to clean SEO paths and stay out of the index', () => {
  assert.match(marketplacePageSource, /resolveCanonicalSeoLanding/)
  assert.match(marketplacePageSource, /canonicalLanding\?\.canonicalPath/)
  assert.match(marketplacePageSource, /index: false/)
  assert.match(marketplacePageSource, /languages: canonicalLanding \? undefined/)
})

test('sitemaps are deterministic, sharded and contain clean canonical paths only', () => {
  for (const prefix of ['categories', 'brands', 'models', 'geo-', 'geo-makes-', 'geo-models-']) {
    assert.ok(sitemapIndexSource.includes(prefix), `${prefix} sitemap family is missing`)
  }
  assert.match(sitemapIndexSource, /Math\.floor\(maxGeoUrlsPerSitemap \/ urlsPerArea\)/)
  assert.match(sitemapShardSource, /getSeoSitemapAreas/)
  assert.match(sitemapShardSource, /shouldIncludeInSitemap/)
  assert.match(sitemapShardSource, /buildSeoMarketplacePath/)
  assert.doesNotMatch(sitemapShardSource, /marketplace\?/)
  assert.match(robotsSource, /Sitemap: \$\{canonicalSitemap\}/)
  assert.doesNotMatch(robotsSource, /Disallow: \/(?:se|de|fr|it|es|nl|be|pl|at|dk|fi)\//)
})
