import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const configSource = readFileSync(
  new URL('../lib/homepage-category-config.ts', import.meta.url),
  'utf8',
)
const homeSource = readFileSync(
  new URL('../app/components/BusinessMarketplaceHome.tsx', import.meta.url),
  'utf8',
)
const providerSource = readFileSync(
  new URL('../app/components/HomeCategoryProvider.tsx', import.meta.url),
  'utf8',
)
const listingSwitcherSource = readFileSync(
  new URL('../app/components/HomeListingCategorySwitcher.tsx', import.meta.url),
  'utf8',
)
const discoverySource = readFileSync(
  new URL('../app/components/HomeCategoryDiscovery.tsx', import.meta.url),
  'utf8',
)

const categories = [
  'cars',
  'vans',
  'trucks',
  'motorcycles',
  'construction',
  'motorhomes',
  'caravans',
  'agriculture',
  'electric-bikes',
]

test('all canonical marketplace categories have one central homepage definition', () => {
  for (const category of categories) {
    assert.match(configSource, new RegExp(`(?:^|\\n)  ['\"]?${category}['\"]?: \\{`))
  }

  assert.match(configSource, /Record<MarketplaceCategorySlug, HomepageCategoryDefinition>/)
  assert.match(configSource, /getHomepageCategoryPresentations/)
  assert.match(configSource, /homepageMarketplaceHref/)
})

test('homepage cards use stored listing values rather than invented filter aliases', () => {
  for (const value of [
    'Halvkombi',
    'Elbil',
    'Skåpbil',
    'Eltransport',
    'Dragbil',
    'Lastväxlare',
    'Cross / enduro',
    'Helintegrerad',
    'Familjevagn',
    'Skördetröska',
    'Grävmaskin',
    'Speedbike',
  ]) {
    assert.match(configSource, new RegExp(`type\\('[^']+', '${value.replace('/', '\\/')}'`))
  }

  assert.match(configSource, /filters: \{ fuel: 'El' \}/)
  assert.doesNotMatch(configSource, /filterValue: 'electric'/)
  assert.doesNotMatch(configSource, /type\([^\n]+, 'tractor unit',/)
  assert.doesNotMatch(configSource, /type\([^\n]+, 'sports car',/)
})

test('category labels and SEO are explicit for every public locale', () => {
  assert.match(configSource, /type Label = Record<PublicLocale, string>/)
  assert.match(configSource, /at: de, be: nl/)
  for (const locale of ['sv', 'en', 'de', 'at', 'be', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(configSource, new RegExp(`\\n  ${locale}: \\{ latest:`))
    assert.match(configSource, new RegExp(`\\n  ${locale}: [a-z]+SeoCopy,`))
  }
  assert.match(configSource, /seoCopyByLocale\[locale\]\[category\]/)
  assert.match(configSource, /clampSeo\(fillSeoMarket\(copy\.title, contextualMarketLabel\), 65\)/)
  assert.match(configSource, /clampSeo\(fillSeoMarket\(copy\.description, contextualMarketLabel\), 155\)/)
  assert.match(configSource, /locale === 'pl'.*normalizedMarket === 'polska'.*'Polsce'/)
  assert.match(configSource, /locale === 'fi'.*normalizedMarket === 'suomi'.*'Suomessa'/)
  assert.doesNotMatch(configSource, /markkinalta \{m\}|markkinalla \{m\}/)
  assert.doesNotMatch(configSource, /const seoTemplates/)
  assert.match(configSource, /'Crew van': label\('Dubbelhytt', 'Crew van'/)
  assert.match(configSource, /'Box van': label\('Volymskåp', 'Box van'/)
})

test('shared category state swaps only the active homepage content', () => {
  assert.match(homeSource, /<HomeCategoryProvider[\s\S]*metadataByCategory=\{metadataByCategory\}[\s\S]*initialCategory=\{initialCategory\}/)
  assert.match(homeSource, /<HomeBrowseByTypeSwitcher/)
  assert.match(homeSource, /<HomePopularBrandsSwitcher/)
  assert.match(homeSource, /<HomeListingCategorySwitcher categories=\{homeListingCategories\}>/)
  assert.match(providerSource, /useState<MarketplaceCategorySlug>\(initialCategory\)/)
  assert.match(providerSource, /document\.title = metadata\.title/)
  assert.match(listingSwitcherSource, /childArray\[activeIndex\] \?\? null/)
  assert.doesNotMatch(listingSwitcherSource, /display:\s*none|hidden/)
  assert.match(discoverySource, /presentations\[activeCategory\] \|\| presentations\.cars/)
  assert.doesNotMatch(homeSource, /<HomeVehicleCategoryRailsSwitcher/)
})

test('new category discovery and sell images exist locally', () => {
  const paths = new Set(
    [...configSource.matchAll(/['"](\/homepage-discovery\/(?:types|sell)\/[^'"]+)['"]/g)]
      .map((match) => match[1]),
  )

  assert.equal(paths.size, 80)
  assert.doesNotMatch(configSource, /type\([^\n]+\/category-types\//)
  for (const path of paths) {
    assert.equal(
      existsSync(new URL(`../public${path}`, import.meta.url)),
      true,
      `Missing homepage category asset: ${path}`,
    )
  }
})

test('discovery, brands, and selling render before listing feeds', () => {
  const browseIndex = homeSource.indexOf('<HomeBrowseByTypeSwitcher')
  const brandsIndex = homeSource.indexOf('<HomePopularBrandsSwitcher')
  const sellIndex = homeSource.indexOf('<HomeSellOptionsSection')
  const popularIndex = homeSource.indexOf('?.popular')

  assert.ok(browseIndex > -1)
  assert.ok(browseIndex < brandsIndex)
  assert.ok(brandsIndex < sellIndex)
  assert.ok(sellIndex < popularIndex)
  assert.doesNotMatch(homeSource, /\?\.top|\?\.latest/)
})

test('homepage has one localized popular-searches listing feed', () => {
  assert.match(homeSource, /getPublishedMarketplaceHomeListingGroups\(localMarketCode, homeListingCategories, 17\)/)
  assert.doesNotMatch(homeSource, /getPublishedMarketplaceHomeListings\(localMarketCode, 'top'/)
  assert.match(configSource, /sv: \{ latest: 'Populära sökningar'/)
  assert.match(configSource, /en: \{ latest: 'Popular searches'/)
  assert.match(configSource, /de: \{ latest: 'Beliebte Suchanfragen'/)
})

test('new discovery remains swipeable and uses generated transparent assets', () => {
  assert.match(discoverySource, /snap-x snap-mandatory/)
  assert.match(discoverySource, /overflow-x-auto/)
  assert.match(discoverySource, /data-discovery-item/)
  assert.match(configSource, /\/homepage-discovery\/types\/cars-hatchback\.webp/)
  assert.match(configSource, /\/homepage-discovery\/types\/construction-excavator\.webp/)
  assert.match(configSource, /\/homepage-discovery\/sell\/electric-bikes\.webp/)
})

test('non-car brands use the intentional fallback instead of invented logos', () => {
  assert.match(configSource, /function brandPlaceholders/)
  assert.match(configSource, /brands: brandPlaceholders\(\['Mercedes-Benz'/)
  assert.doesNotMatch(configSource, /vehicle-brand-logos\/vans\//)
  assert.doesNotMatch(configSource, /vehicle-brand-logos\/trucks\//)
})
