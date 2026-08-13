import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const marketplacePageSource = readFileSync(
  new URL('../app/marketplace/[category]/page.tsx', import.meta.url),
  'utf8',
)
const vehicleSearchSource = readFileSync(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)

test('marketplace category changes navigate to the matching localized route', () => {
  assert.match(vehicleSearchSource, /import \{ useRouter \} from 'next\/navigation'/)
  assert.match(vehicleSearchSource, /syncCategoryRoute = false/)
  assert.match(vehicleSearchSource, /categoryRouteSyncArmedRef = useRef\(false\)/)
  assert.match(vehicleSearchSource, /categoryRouteSyncArmedRef\.current = true/)
  assert.match(vehicleSearchSource, /localizePublicHref\(locale, `\/marketplace\/\$\{routeCategory\}`\)/)
  assert.match(vehicleSearchSource, /router\.replace\(nextUrl, \{ scroll: false \}\)/)
  assert.match(vehicleSearchSource, /browserSearchParams\.delete\('categories'\)/)
})

test('legacy path and category query mismatches redirect before rendering', () => {
  assert.match(marketplacePageSource, /getExplicitMarketplaceCategory\(resolvedSearchParams\)/)
  assert.match(marketplacePageSource, /explicitCategory !== requestedCategory/)
  assert.match(marketplacePageSource, /permanentRedirect\(getMarketplaceCategoryRedirectHref/)
  assert.match(marketplacePageSource, /localizePublicHref\(locale, `\/marketplace\/\$\{category\}`\)/)
  assert.match(marketplacePageSource, /if \(key === 'categories'/)
})

test('metadata follows an explicit category while an old URL is being canonicalized', () => {
  assert.match(marketplacePageSource, /const metadataCategory = explicitCategory \|\| requestedCategory/)
  assert.match(marketplacePageSource, /getMarketplaceCategory\(metadataCategory\)/)
  assert.match(marketplacePageSource, /syncCategoryRoute=\{!seoLanding\}/)
})
