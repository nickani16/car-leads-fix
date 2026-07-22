import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('vehicle news is database-driven, market-prefixed and safely previewed', () => {
  const data = read('lib/content/vehicle-news.ts')
  const proxy = read('proxy.ts')
  const legacy = read('app/[market]/fordonsnyheter/page.tsx')
  const article = read('app/[market]/vehicle-news/[slug]/page.tsx')
  const home = read('app/components/BusinessMarketplaceHome.tsx')
  const archive = read('app/components/VehicleNewsSearch.tsx')
  assert.match(data, /from\('content_posts'\)/)
  assert.match(data, /eq\('status', 'published'\)/)
  assert.match(data, /lte\('published_at'/)
  assert.match(data, /content_preview_tokens/)
  assert.match(data, /fallbackArticles/)
  assert.match(data, /sell-trucks-on-autorell/)
  assert.match(data, /sell-car-privately-online/)
  assert.match(data, /sell-tractors-and-farm-machinery/)
  assert.match(data, /category-trucks-hero\.jpg/)
  assert.match(data, /category-cars-hero-family\.webp/)
  assert.match(data, /category-agriculture-hero\.jpg/)
  assert.match(home, /getVehicleNews\(/)
  assert.match(home, /vehicleNews\.articles\.slice\(0, 3\)/)
  assert.match(archive, /initialCategory/)
  assert.match(archive, /Senaste fordonsguiderna/)
  assert.match(proxy, /segments\[1\] === 'vehicle-news'/)
  assert.match(legacy, /permanentRedirect/)
  assert.match(article, /index: false, follow: false, noarchive: true/)
})

test('media upload validates file signatures and creates five server-side variants', () => {
  const route = read('app/api/admin/media/route.ts')
  const processor = read('lib/content/media-processing.ts')
  assert.match(route, /requireAdminRoute\('media\.manage'\)/)
  assert.match(route, /writeAdminAuditLog/)
  assert.match(route, /storage\.from\(BUCKET\)\.upload/)
  assert.match(processor, /IMAGE_SIGNATURE_MISMATCH/)
  for (const variant of ['thumbnail', 'newsCard', 'mobile', 'article', 'social']) {
    assert.match(processor, new RegExp(`\\b${variant}\\b`))
  }
})

test('missing admin schema degrades to real operational sources without raw schema errors', () => {
  const media = read('app/admin/media/page.tsx')
  const system = read('app/admin/system/page.tsx')
  assert.match(media, /marketplace_listing_images/)
  assert.match(system, /stripe_webhook_events/)
  assert.doesNotMatch(media, /Datakällan är inte tillgänglig ännu/)
  assert.doesNotMatch(system, /Datakällan är inte tillgänglig ännu/)
})

test('super admin receives current and future permissions while MFA and audit remain required', () => {
  const permissions = read('lib/admin/permissions.ts')
  const context = read('lib/admin/context.ts')
  const migration = read('supabase/migrations/20260713221000_admin_control_center_real_flows.sql')
  const shell = read('app/admin/AdminShell.tsx')
  assert.match(permissions, /'platform\.super_admin'/)
  assert.match(context, /roles\.includes\('super_admin'\) \? \[\.\.\.ADMIN_PERMISSIONS\]/)
  assert.match(migration, /grant_new_permission_to_super_admin/)
  assert.match(migration, /Explicit full-platform authority; MFA and audit remain mandatory/)
  assert.match(shell, /God Mode/)
})
