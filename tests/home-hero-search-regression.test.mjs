import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const homeSearchSource = readFileSync(
  new URL('../app/components/HomeHeroVehicleSearch.tsx', import.meta.url),
  'utf8',
)
const placeholderSource = readFileSync(
  new URL('../app/components/HomeSearchAnimatedPlaceholder.tsx', import.meta.url),
  'utf8',
)
const homeSource = readFileSync(
  new URL('../app/components/BusinessMarketplaceHome.tsx', import.meta.url),
  'utf8',
)
const translations = JSON.parse(
  readFileSync(new URL('../lib/generated-public-translations.json', import.meta.url), 'utf8'),
)

test('homepage search keeps category-specific filters and the real count API', () => {
  for (const category of [
    'cars',
    'vans',
    'trucks',
    'motorcycles',
    'construction',
    'motorhomes',
    'caravans',
    'agriculture',
    'electric-bikes',
  ]) {
    assert.match(homeSearchSource, new RegExp(`(?:slug: |  )'${category}'`))
  }

  assert.match(homeSearchSource, /categoryLayouts/)
  assert.match(homeSearchSource, /isLeasingMarketplaceCategory/)
  assert.match(homeSearchSource, /\/api\/marketplace\/search-v2/)
  assert.match(homeSearchSource, /AbortController/)
  assert.match(homeSearchSource, /payload\.totalCount/)
  assert.match(homeSearchSource, /countError/)
  assert.match(homeSearchSource, /params\.set\('mode', intent\)/)
  assert.match(homeSearchSource, /setNonEmptyParam\(params, 'q', queryValue\)/)
  assert.match(homeSearchSource, /params\.set\('municipality', locationValue\)/)
})

test('homepage search panels and placeholder retain their accessibility behavior', () => {
  assert.match(homeSearchSource, /aria-controls="home-search-category-menu"/)
  assert.match(homeSearchSource, /aria-controls="home-search-more-filters"/)
  assert.match(homeSearchSource, /event\.key === 'Escape'/)
  assert.match(homeSearchSource, /aria-modal="true"/)
  assert.match(homeSearchSource, /moreFiltersCloseRef\.current\?\.focus\(\)/)
  assert.match(placeholderSource, /prefers-reduced-motion/)
  assert.match(placeholderSource, /const \[deleting, setDeleting\] = useState\(false\)/)
  assert.match(placeholderSource, /deleting \? DELETE_DELAY_MS : TYPE_DELAY_MS/)
  assert.match(placeholderSource, /setDeleting\(true\)/)
  assert.match(placeholderSource, /setDeleting\(false\)/)
  assert.match(homeSearchSource, /categoryExamples/)
  assert.match(homeSearchSource, /t\.categoryExamples[\s\S]*\[category\]/)
  assert.match(homeSearchSource, /category,\s*\n\s*active: searchFocused/)
  assert.doesNotMatch(homeSearchSource, /<HomeSearchAnimatedPlaceholder examples=\{t\.examples\}/)
  assert.doesNotMatch(homeSearchSource, /Sparkles/)
  assert.doesNotMatch(homeSearchSource, /Volvo V70 diesel/)
})

test('homepage search uses the supplied hero image and translated public copy', () => {
  assert.match(homeSource, /\/autorell-home-search-hero\.webp/)
  assert.match(homeSource, /\/autorell-home-desktop-market-hero\.png/)
  assert.match(homeSource, /heroHeading: 'Europas största bilmarknad'/)
  assert.doesNotMatch(homeSource, /\/autorell-home-hero-street-cars\.jpg/)
  assert.equal(
    existsSync(new URL('../public/autorell-home-search-hero.webp', import.meta.url)),
    true,
  )
  assert.equal(
    existsSync(new URL('../public/autorell-home-desktop-market-hero.png', import.meta.url)),
    true,
  )

  for (const locale of ['fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.ok(translations[locale]?.['Find the right vehicle. One simpler search.'])
    assert.ok(translations[locale]?.['More search filters'])
    assert.ok(translations[locale]?.['Two people sharing a moment inside a car'])
  }
})
