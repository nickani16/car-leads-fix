import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const geoLandingSource = readFileSync(new URL('../lib/seo-geo-landings.ts', import.meta.url), 'utf8')
const marketplaceGeoSource = readFileSync(new URL('../lib/marketplace-geo.ts', import.meta.url), 'utf8')
const marketplacePageSource = readFileSync(new URL('../app/marketplace/[category]/page.tsx', import.meta.url), 'utf8')
const vehicleSearchSource = readFileSync(new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url), 'utf8')
const publicHeaderSource = readFileSync(new URL('../app/components/PublicHeader.tsx', import.meta.url), 'utf8')
const seoRouteSource = readFileSync(new URL('../app/seo/[market]/[...slug]/page.tsx', import.meta.url), 'utf8')
const sitemapIndexSource = readFileSync(new URL('../app/sitemap.xml/route.ts', import.meta.url), 'utf8')
const sitemapShardSource = readFileSync(new URL('../app/sitemaps/[name]/route.ts', import.meta.url), 'utf8')
const sitemapUtilsSource = readFileSync(new URL('../lib/sitemap-utils.ts', import.meta.url), 'utf8')
const robotsSource = readFileSync(new URL('../app/robots.txt/route.ts', import.meta.url), 'utf8')

const markets = ['se', 'de', 'fr', 'it', 'es', 'nl', 'be', 'pl', 'at', 'dk', 'fi']

test('SEO route state is centralized for all eleven active markets', () => {
  for (const market of markets) {
    assert.match(geoLandingSource, new RegExp(`\\b${market}:`), `${market} is missing from SEO route config`)
    assert.ok(sitemapUtilsSource.includes(`'${market}'`), `${market} is missing from sitemap config`)
  }
  assert.match(geoLandingSource, /resolveStaticMarketplaceGeoAreaBySlug/)
  assert.match(geoLandingSource, /brandSuggestionsForCategory/)
  assert.match(geoLandingSource, /category-make-model-location/)
  assert.match(geoLandingSource, /buildSeoMarketplaceSearchParams/)
  assert.match(geoLandingSource, /shouldIncludeInSitemap/)
  assert.match(geoLandingSource, /localizeSeoPlace/)
  assert.match(geoLandingSource, /title: fitSeoTitle\(`\$\{copy\.h1\} \| Autorell`\)/)
  assert.match(geoLandingSource, /if \(cleaned\.length <= 60\) return cleaned/)
  assert.doesNotMatch(geoLandingSource, /cleanSeoText\(`\$\{copy\.h1\} \| Autorell`, 60\)/)
  assert.match(geoLandingSource, /fitSeoDescription/)
  assert.match(geoLandingSource, /place\.name === '\\u00c5land'/)
  assert.match(geoLandingSource, /name: 'Ahvenanmaa'/)
  for (const localizedLead of [
    'Utforska utbudet:',
    'D\\u00e9couvrez les annonces :',
    'Scopri gli annunci:',
    'Explora los anuncios:',
    'Bekijk het aanbod:',
    'Sprawd\\u017a oferty:',
    'Se udvalget:',
    'Tutustu tarjontaan:',
  ]) {
    assert.ok(geoLandingSource.includes(localizedLead), `${localizedLead} is missing from localized metadata`)
  }
  assert.doesNotMatch(geoLandingSource, /Zobacz aktualne og\\u0142oszenia \$\{subject\}/)
  assert.doesNotMatch(geoLandingSource, /Katso kohteen \$\{subject\}/)
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
  assert.match(marketplacePageSource, /marketplaceResultsPage/)
  assert.match(marketplacePageSource, /preserveCanonicalUrl=\{Boolean\(seoLanding\)\}/)
  assert.match(publicHeaderSource, /marketplaceResultsPage \|\|/)
  assert.match(vehicleSearchSource, /seoLanding\?\.zeroResultsText/)
  assert.doesNotMatch(vehicleSearchSource, /params\.set\('markets', safeAutomaticCountry\)/)
  assert.match(vehicleSearchSource, /params\.set\('displayMarket', safeAutomaticCountry/)
  assert.doesNotMatch(vehicleSearchSource, /seo-marketplace-heading/)
  assert.doesNotMatch(vehicleSearchSource, /seoLanding\.relatedLinks\.map/)
  assert.doesNotMatch(vehicleSearchSource, /seoLanding\.breadcrumbs\.map/)
})

test('SEO landing metadata remains indexable without rendering the legacy visible text block', () => {
  assert.match(seoRouteSource, /generateMetadata/)
  assert.match(seoRouteSource, /landing\.title/)
  assert.match(seoRouteSource, /landing\.description/)
  assert.match(seoRouteSource, /alternates: \{ canonical \}/)
  assert.match(seoRouteSource, /BreadcrumbList/)
  assert.match(seoRouteSource, /CollectionPage/)
  assert.match(sitemapShardSource, /buildSeoMarketplacePath/)
  assert.doesNotMatch(vehicleSearchSource, /aria-label=\{translatePublic\(locale, 'Related searches'\)\}/)
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
