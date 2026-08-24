import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('flagged listings enter the moderation queue and cases close with the decision', () => {
  const createListing = read('app/api/account/listings/route.ts')
  const moderationPage = read('app/admin/moderation/page.tsx')
  const moderationAction = read('app/api/admin/marketplace-listings/[id]/route.ts')

  assert.match(createListing, /reviewStatus === 'flagged'[\s\S]*from\('moderation_cases'\)\.insert/)
  assert.match(createListing, /case_type: 'listing_risk_review'/)
  assert.match(moderationPage, /queue = getParam\(params, 'queue'\) \|\| 'actionable'/)
  assert.match(moderationPage, /\.in\('review_status', \['pending_review', 'flagged'\]\)/)
  assert.match(moderationAction, /from\('moderation_cases'\)[\s\S]*\.eq\('listing_id', id\)/)
})

test('listing review status explains unique checks and uses a centered dialog', () => {
  const notice = read('lib/listing-review-notice.ts')
  const actions = read('app/konto/annonser/ListingStatusActions.tsx')
  const filters = read('app/konto/annonser/ListingsFilters.tsx')

  for (const locale of ['sv', 'en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'fi', 'da']) {
    assert.match(notice, new RegExp(`\\b${locale}: \\{`))
  }
  assert.match(notice, /Array\.from\(new Set\(/)
  assert.match(notice, /missing_vin/)
  assert.match(notice, /same_phone_multiple_accounts/)
  assert.match(actions, /fixed inset-0 m-auto/)
  assert.match(actions, /reviewMessage\.reasons\.map/)
  assert.match(actions, /reviewMessage\.nextStep/)
  assert.match(filters, /placeholder:font-normal placeholder:text-\[#98a2b3\]/)
})

test('editing identifiers removes resolved missing-identifier risk flags', () => {
  const updateListing = read('app/api/account/listings/[id]/route.ts')
  assert.match(updateListing, /flag === 'missing_vin' && identifiers\.vin/)
  assert.match(updateListing, /flag === 'missing_serial_number' && identifiers\.serialNumber/)
  assert.match(updateListing, /patch\.risk_score = listingRiskScore\(nextRiskFlags\)/)
})
