import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync(new URL('../app/konto/annonser/page.tsx', import.meta.url), 'utf8')
const filters = readFileSync(new URL('../app/konto/annonser/ListingsFilters.tsx', import.meta.url), 'utf8')
const manageApi = readFileSync(new URL('../app/api/account/listings/manage/route.ts', import.meta.url), 'utf8')
const bulkApi = readFileSync(new URL('../app/api/account/listings/bulk/route.ts', import.meta.url), 'utf8')
const checkout = readFileSync(new URL('../app/api/account/listing-checkout/route.ts', import.meta.url), 'utf8')
const imageUpload = readFileSync(new URL('../app/api/account/listings/[id]/images/route.ts', import.meta.url), 'utf8')
const listingAction = readFileSync(new URL('../app/api/account/listings/[id]/route.ts', import.meta.url), 'utf8')
const listingRefresh = readFileSync(new URL('../app/api/account/listings/[id]/refresh/route.ts', import.meta.url), 'utf8')
const editListingPage = readFileSync(new URL('../app/account/listings/[id]/edit/page.tsx', import.meta.url), 'utf8')
const fulfillment = readFileSync(new URL('../lib/billing/fulfillment.ts', import.meta.url), 'utf8')
const accountListingManagement = readFileSync(new URL('../lib/account-listings-management.ts', import.meta.url), 'utf8')
const migration = readFileSync(new URL('../supabase/migrations/20260713194500_account_listing_management.sql', import.meta.url), 'utf8')

test('listing management uses server-side filtering, aggregate counts and pagination', () => {
  assert.match(page, /resolveBusinessAccountScope\(user\.id, admin\)/)
  assert.match(page, /getManagedListings\(admin, listingOwnerUserIds, filters\)/)
  assert.match(manageApi, /resolveBusinessAccountScope\(user\.id, admin\)/)
  assert.match(manageApi, /getManagedListings\(admin, listingOwnerUserIds, filters\)/)
  assert.match(accountListingManagement, /userId: string \| string\[\]/)
  assert.match(accountListingManagement, /getManagedListingsForOwners\(admin, ownerIds, filters\)/)
  assert.match(accountListingManagement, /\.in\('seller_user_id', ownerIds\)/)
  assert.match(manageApi, /'Cache-Control': 'private, no-store'/)
  assert.match(migration, /row_number\(\) over/i)
  assert.match(migration, /row_number_value > \(normalized\.requested_page - 1\)/i)
  assert.match(migration, /'totalCount', \(select count\(\*\) from filtered\)/i)
  assert.match(migration, /marketplace_listing_events/)
  assert.match(migration, /marketplace_saved_listings/)
  assert.match(migration, /gin_trgm_ops/)
})

test('tabs, debounced search and filters use URL state', () => {
  assert.match(filters, /role="tablist"/)
  assert.match(filters, /role="tab"/)
  assert.match(filters, /ArrowRight/)
  assert.match(filters, /setTimeout[\s\S]*350/)
  assert.match(filters, /router\.push/)
  assert.match(filters, /pageSize/)
  assert.match(page, /role="tabpanel"/)
})

test('bulk operations are business-only and atomic in a service-role RPC', () => {
  assert.match(bulkApi, /account_type !== 'business'/)
  assert.match(bulkApi, /resolveBusinessAccountScope\(user\.id, admin\)/)
  assert.match(bulkApi, /\.in\('seller_user_id', scope\.listingOwnerUserIds\)/)
  assert.match(bulkApi, /idsByOwner/)
  assert.match(bulkApi, /bulk_manage_owned_listings/)
  assert.match(migration, /for update;/)
  assert.match(migration, /v_owned_count <> v_expected_count/)
  assert.match(migration, /v_valid_count <> v_expected_count/)
  assert.match(migration, /listing_bulk_/)
  assert.match(migration, /revoke all on function public\.bulk_manage_owned_listings[\s\S]*authenticated/)
})

test('checkout and webhook fulfillment enforce refresh cooldown and idempotency', () => {
  assert.match(checkout, /addon\.refresh_single/)
  assert.match(checkout, /last_refreshed_at/)
  assert.match(checkout, /24 \* 60 \* 60 \* 1000/)
  assert.match(fulfillment, /fulfill_listing_refresh_purchase/)
  assert.match(migration, /on conflict \(payment_order_id\)[\s\S]*do nothing/)
  assert.match(migration, /last_refreshed_at > now\(\) - p_cooldown/)
})

test('service-role management functions cannot be called by browser roles', () => {
  for (const fn of ['account_listing_management', 'account_listing_summary', 'bulk_manage_owned_listings']) {
    assert.match(migration, new RegExp(`revoke all on function public\\.${fn}[\\s\\S]*authenticated`))
  }
})

test('missing-image CTA has an owner-checked bounded upload path', () => {
  assert.match(imageUpload, /supabase\.auth\.getUser\(\)/)
  assert.match(imageUpload, /resolveBusinessAccountScope\(user\.id, admin\)/)
  assert.match(imageUpload, /scope\?\.listingOwnerUserIds\.includes\(String\(listing\.seller_user_id\)\)/)
  assert.match(imageUpload, /const listingOwnerId = String\(listing\.seller_user_id\)/)
  assert.match(imageUpload, /seller_user_id: listingOwnerId/)
  assert.match(imageUpload, /existingImages\.length \+ files\.length > 20/)
  assert.match(imageUpload, /processMarketplaceImage\(file\)/)
  assert.match(page, /copy\.addImages/)
})

test('company team members can manage listings inside their company scope', () => {
  assert.match(editListingPage, /resolveBusinessAccountScope\(user\.id, admin\)/)
  assert.match(editListingPage, /scope\?\.listingOwnerUserIds\.includes\(String\(listing\.seller_user_id\)\)/)
  assert.match(listingAction, /resolveBusinessAccountScope\(user\.id, admin\)/)
  assert.match(listingAction, /scope\?\.listingOwnerUserIds\.includes\(String\(listing\.seller_user_id\)\)/)
  assert.match(listingAction, /\.eq\('seller_user_id', listing\.seller_user_id\)/)
  assert.match(listingRefresh, /resolveBusinessAccountScope\(user\.id, admin\)/)
  assert.match(listingRefresh, /scope\?\.listingOwnerUserIds\.includes\(String\(listing\.seller_user_id\)\)/)
  assert.match(listingRefresh, /p_owner_id: listing\.seller_user_id/)
})
