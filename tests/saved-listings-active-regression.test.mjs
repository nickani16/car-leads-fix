import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const savedListingsApi = readFileSync(new URL('../app/api/saved-listings/route.ts', import.meta.url), 'utf8')
const accountPage = readFileSync(new URL('../app/konto/page.tsx', import.meta.url), 'utf8')

test('saved listings API counts only visible active listings', () => {
  assert.match(savedListingsApi, /\.eq\('status', 'published'\)/)
  assert.match(savedListingsApi, /\.not\('published_at', 'is', null\)/)
  assert.match(savedListingsApi, /\.is\('sold_at', null\)/)
  assert.match(savedListingsApi, /expires_at\.is\.null,expires_at\.gt\./)
  assert.match(savedListingsApi, /const filteredIds = ids\.filter\(\(id\) => activeIds\.has\(id\)\)/)
  assert.match(savedListingsApi, /listingIds: filteredIds/)
})

test('saved listings API removes stale saved rows and blocks saving inactive listings', () => {
  assert.match(savedListingsApi, /const staleAccountIds = accountIds\.filter\(\(id\) => ids\.includes\(id\) && !activeIds\.has\(id\)\)/)
  assert.match(savedListingsApi, /\.from\('marketplace_saved_listings'\)[\s\S]*\.delete\(\)[\s\S]*\.in\('listing_id', staleAccountIds\)/)
  assert.match(savedListingsApi, /if \(!listing\.data\)/)
  assert.match(savedListingsApi, /Listing is not available/)
})

test('account overview saved listing count ignores removed or sold listings', () => {
  assert.match(accountPage, /countActiveSavedListings\(admin, user\.id\)/)
  assert.match(accountPage, /async function countActiveSavedListings/)
  assert.match(accountPage, /\.from\('marketplace_listings'\)[\s\S]*\.eq\('status', 'published'\)[\s\S]*\.is\('sold_at', null\)/)
  assert.match(accountPage, /return activeIds\.size/)
})
