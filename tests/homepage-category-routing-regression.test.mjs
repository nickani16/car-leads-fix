import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

const routeSource = read('../lib/homepage-category-routes.ts')
const landingSource = read('../app/components/HomepageCategoryLanding.tsx')
const homeSource = read('../app/components/BusinessMarketplaceHome.tsx')
const searchSource = read('../app/components/HomeHeroVehicleSearch.tsx')
const providerSource = read('../app/components/HomeCategoryProvider.tsx')
const preferenceSource = read('../app/components/preferred-home-category.ts')
const headerSource = read('../app/components/PublicHeader.tsx')
const footerSource = read('../app/components/PublicFooter.tsx')
const localizedCatchallSource = read('../app/[market]/[...slug]/page.tsx')
const sitemapSource = read('../app/sitemaps/[name]/route.ts')
const proxySource = read('../proxy.ts')

const categoryPaths = {
  cars: '/',
  vans: '/vans',
  trucks: '/trucks',
  motorcycles: '/motorcycles',
  construction: '/construction',
  motorhomes: '/motorhomes',
  caravans: '/caravans',
  agriculture: '/agriculture',
  'electric-bikes': '/electric-bikes',
}

test('every homepage vehicle category has one stable indexable path', () => {
  for (const [category, path] of Object.entries(categoryPaths)) {
    assert.ok(routeSource.includes(`'${category}': '${path}'`) || routeSource.includes(`${category}: '${path}'`))
    if (category === 'cars') continue
    const page = new URL(`../app${path}/page.tsx`, import.meta.url)
    assert.equal(existsSync(page), true, `Missing category page ${path}`)
    const pageSource = read(`../app${path}/page.tsx`)
    assert.ok(pageSource.includes(`category="${category}"`))
    assert.ok(pageSource.includes(`createHomepageCategoryMetadata('${category}')`))
  }
})

test('category tabs navigate to their landing URL while retaining shared homepage state', () => {
  assert.match(searchSource, /<Link[\s\S]*href=\{homepageCategoryHref\(locale, slug\)\}[\s\S]*role="tab"/)
  assert.match(searchSource, /onClick=\{\(\) => selectCategory\(slug\)\}/)
  assert.match(homeSource, /initialCategory\?: MarketplaceCategorySlug/)
  assert.match(homeSource, /key=\{initialCategory\}/)
  assert.match(homeSource, /initialCategory=\{initialCategory\}/)
})

test('category landings expose localized canonical and language alternate metadata', () => {
  assert.match(landingSource, /getHomepageCategorySeo\(context\.locale, category, marketLabel\)/)
  assert.match(landingSource, /publicUrlForLocale\(context\.locale, categoryPath\)/)
  assert.match(landingSource, /getPublicLanguageAlternates\(categoryPath\)/)
  assert.match(localizedCatchallSource, /homepageCategoryFromPath\(`\/\$\{slugPath\}`\)/)
  assert.match(localizedCatchallSource, /<HomepageCategoryLanding[\s\S]*locale=\{locale\}[\s\S]*marketCode=\{normalizedMarket\.toUpperCase\(\)\}/)
  assert.match(sitemapSource, /\.\.\.homepageCategoryIndexPaths/)
  assert.ok(landingSource.indexOf("marketCode === 'AT'") < landingSource.indexOf("language === 'de'"))
  assert.match(landingSource, /marketCode === 'BE'\) return 'be'/)
  assert.match(landingSource, /marketCode === 'DK'\) return 'da'/)
})

test('logo and home links retain the visitor selected vehicle category', () => {
  assert.match(preferenceSource, /PREFERRED_HOME_CATEGORY_KEY = 'autorell:preferred-home-category'/)
  assert.match(preferenceSource, /window\.localStorage\.getItem\(PREFERRED_HOME_CATEGORY_KEY\)/)
  assert.match(preferenceSource, /window\.localStorage\.setItem\(PREFERRED_HOME_CATEGORY_KEY, category\)/)
  assert.match(providerSource, /rememberPreferredHomeCategory\(activeCategory\)/)
  assert.match(headerSource, /const homeHref = usePreferredHomeHref\(locale\)/)
  assert.match(footerSource, /const homeHref = usePreferredHomeHref\(locale\)/)
})

test('legacy category paths permanently redirect to canonical landing paths', () => {
  assert.match(localizedCatchallSource, /cars: 'cars'/)
  assert.match(localizedCatchallSource, /farm: 'agriculture'/)
  assert.match(localizedCatchallSource, /plant: 'construction'/)
  assert.match(localizedCatchallSource, /permanentRedirect\(homepageCategoryHref\(locale, legacyHomepageCategory\)\)/)
  assert.doesNotMatch(proxySource, /\['\/vans', '\/marketplace\/vans'\]/)
  assert.doesNotMatch(proxySource, /\['\/trucks', '\/marketplace\/trucks'\]/)
  assert.match(proxySource, /\['\/van', '\/vans'\]/)
  assert.match(proxySource, /\['\/farm', '\/agriculture'\]/)
  assert.match(proxySource, /HOMEPAGE_CATEGORY_SEGMENTS\.has\(segments\[1\]/)
  assert.match(proxySource, /HOMEPAGE_CATEGORY_SEGMENTS\.has\(englishSegments\[0\]/)
})
