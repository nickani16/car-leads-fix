import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8')
const listingDetailPage = readFileSync(new URL('../app/listings/[slug]/ListingDetailPage.tsx', import.meta.url), 'utf8')

test('proxy stays routing-only and does not query listing state', () => {
  assert.match(proxy, /export function proxy\(request: NextRequest\)/)
  assert.doesNotMatch(proxy, /export async function proxy/)
  assert.doesNotMatch(proxy, /marketplace_listings/)
  assert.doesNotMatch(proxy, /getListingPublicLifecycleState/)
  assert.doesNotMatch(proxy, /responseForPermanentlyRemovedListing/)
  assert.doesNotMatch(proxy, /await fetch\(/)
})

test('removed public listing fallback lives in the listing route', () => {
  assert.match(listingDetailPage, /isPermanentlyRemovedPublicListing/)
  assert.match(listingDetailPage, /\.from\('marketplace_listings'\)/)
  assert.match(listingDetailPage, /removed_by_admin/)
  assert.match(listingDetailPage, /<RemovedListingPage locale=\{locale\} \/>/)
  assert.match(listingDetailPage, /robots: \{ index: false, follow: false \}/)
})
