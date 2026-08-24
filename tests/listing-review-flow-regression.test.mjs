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

test('vehicle identifiers stay optional and do not trigger moderation', () => {
  const createListing = read('app/api/account/listings/route.ts')
  const reviewResolution = read('lib/listing-review-resolution.ts')

  assert.doesNotMatch(createListing, /riskFlags\.push\('missing_vin'\)/)
  assert.doesNotMatch(createListing, /riskFlags\.push\('missing_serial_number'\)/)
  assert.match(reviewResolution, /informationalIdentifierFlags = new Set\(\[[\s\S]*'missing_vin'[\s\S]*'missing_serial_number'/)
  assert.match(reviewResolution, /filter\(\(flag\) => !informationalIdentifierFlags\.has\(flag\)\)/)
})

test('editing a resolved review publishes the listing and closes its moderation case', () => {
  const updateListing = read('app/api/account/listings/[id]/route.ts')

  assert.match(updateListing, /publishAfterReview = listing\.status === 'pending_review' && reviewResolved/)
  assert.match(updateListing, /status: 'published',[\s\S]*published_at: now,[\s\S]*expires_at: expiresAt/)
  assert.match(updateListing, /review_status: nextReviewStatus/)
  assert.match(updateListing, /registration_reference: identifiers\.registrationNumber \|\| null/)
  assert.match(updateListing, /vin: identifiers\.vin \|\| null/)
  assert.match(updateListing, /from\('moderation_cases'\)[\s\S]*status: 'closed'/)
})

test('review attention uses singular grammar and opens the affected listing status', () => {
  const listingsPage = read('app/konto/annonser/page.tsx')
  const listingActions = read('app/konto/annonser/ListingStatusActions.tsx')

  assert.match(listingsPage, /sv: 'annons behöver granskas eller åtgärdas'/)
  assert.match(listingsPage, /review=1&listing=\$\{encodeURIComponent\(summary\.firstFlaggedListingId\)\}/)
  assert.match(listingsPage, /autoOpenReview=\{query\.review === '1' && query\.listing === listing\.id\}/)
  assert.match(listingActions, /autoOpenReview[\s\S]*reviewDialogRef\.current\?\.showModal\(\)/)
})
