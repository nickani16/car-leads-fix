import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const proxy = read('proxy.ts')
const adminListingRoute = read('app/api/admin/marketplace-listings/[id]/route.ts')
const lifecycleMigration = read('supabase/migrations/20260713190000_listing_lifecycle_statuses.sql')

test('public listing lifecycle lookup uses the actual marketplace listing schema', () => {
  assert.match(proxy, /select', 'status,published_at,sold_at'/)
  assert.match(proxy, /row\.status === 'deleted' \|\| row\.status === 'removed'/)
  assert.doesNotMatch(proxy, /status,published_at,sold_at,deleted_at,removed_by_admin/)
})

test('admin removal uses the dedicated removed status without nonexistent columns', () => {
  assert.match(adminListingRoute, /if \(action === 'delete'\) \{[\s\S]*listingPatch\.status = 'removed'/)
  assert.doesNotMatch(adminListingRoute, /listingPatch\.(?:deleted_at|removed_by_admin|archived)/)
  assert.doesNotMatch(adminListingRoute, /fallbackPatch/)
  assert.match(lifecycleMigration, /'deleted', 'removed'/)
})
