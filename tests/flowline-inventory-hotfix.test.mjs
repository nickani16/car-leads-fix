import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const [
  proxySource,
  localizedRouteSource,
  legacyRouteSource,
  companyPortalSource,
  accountLayoutSource,
  dealerAccessSource,
  adminApiSource,
  adminPageSource,
  adminControlsSource,
  pilotEmailSource,
  migrationSource,
  teamRegistrationMigrationSource,
] = await Promise.all([
  readFile('proxy.ts', 'utf8'),
  readFile('app/[market]/[...slug]/page.tsx', 'utf8'),
  readFile('app/business/dashboard/inventory/page.tsx', 'utf8'),
  readFile('lib/company-portal.tsx', 'utf8'),
  readFile('app/konto/layout.tsx', 'utf8'),
  readFile('lib/dealer-import-access.ts', 'utf8'),
  readFile('app/api/admin/business-pilots/[id]/route.ts', 'utf8'),
  readFile('app/admin/business-pilots/[id]/page.tsx', 'utf8'),
  readFile('app/admin/business-pilots/[id]/BusinessPilotAdminControls.tsx', 'utf8'),
  readFile('lib/email/business-pilot.ts', 'utf8'),
  readFile('supabase/migrations/20260802204500_atomic_business_pilot_activation.sql', 'utf8'),
  readFile('supabase/migrations/20260802211500_atomic_business_pilot_team_member_registration.sql', 'utf8'),
])

test('inventory routes use the localized company account path as canonical', () => {
  assert.match(proxySource, /segments\.slice\(1\)\.join\('\/'\) === 'business\/dashboard\/inventory'/)
  assert.match(proxySource, /url\.pathname = `\/\$\{pathMarket\}\/account\/company\/inventory`/)
  assert.match(proxySource, /pathname === '\/business\/dashboard\/inventory'/)
  assert.match(proxySource, /pathname === '\/account\/company\/inventory'/)
  assert.match(localizedRouteSource, /permanentRedirect\(`\/\$\{marketCode\}\/account\/company\/inventory`\)/)
  assert.match(legacyRouteSource, /permanentRedirect\(localizePublicHref\(locale, '\/account\/company\/inventory'\)\)/)
})

test('company login preserves the exact localized inventory destination', () => {
  assert.match(accountLayoutSource, /requestHeaders\.get\('x-autorell-pathname'\)/)
  assert.match(accountLayoutSource, /\?next=\$\{encodeURIComponent\(returnTo\)\}/)
  assert.match(companyPortalSource, /requestHeaders\.get\('x-autorell-pathname'\)/)
  assert.match(companyPortalSource, /\?next=\$\{encodeURIComponent\(returnTo\)\}/)
  assert.match(companyPortalSource, /pilot\?\.status === 'pilot_active'/)
  assert.match(companyPortalSource, /\['owner', 'admin', 'manager'\]\.includes\(inventoryRole\)/)
  assert.match(companyPortalSource, /item\.key !== 'inventory' \|\| context\.inventoryImportEnabled/)
})

test('inventory access requires an active free pilot and remains tenant-scoped', () => {
  assert.match(dealerAccessSource, /pilot\?\.status !== 'pilot_active'/)
  assert.match(dealerAccessSource, /pilot\.is_free !== true/)
  assert.match(dealerAccessSource, /pilot\.automatic_conversion_enabled !== false/)
  assert.match(dealerAccessSource, /profile\?\.company_id !== scope\.companyId/)
  assert.match(dealerAccessSource, /organizationId: scope\.companyId/)
  assert.doesNotMatch(dealerAccessSource, /stripe|subscription/i)
})

test('pilot activation is one service-role-only database transaction', () => {
  assert.match(migrationSource, /^begin;/)
  assert.match(migrationSource, /create or replace function public\.activate_business_pilot_application/)
  assert.match(migrationSource, /security definer\s+set search_path = ''/)
  for (const table of [
    'marketplace_companies',
    'marketplace_profiles',
    'marketplace_company_members',
    'business_pilot_applications',
    'business_pilot_programs',
    'feature_flag_overrides',
  ]) assert.match(migrationSource, new RegExp(`public\\.${table}`), table)
  for (const flag of [
    'business_pilot_program',
    'dealer_inventory_import',
    'dealer_website_import',
    'dealer_inventory_sync',
  ]) assert.match(migrationSource, new RegExp(`'${flag}'`), flag)
  assert.match(migrationSource, /pilot_program_id,[\s\S]+null,[\s\S]+Organization-specific access/)
  assert.match(migrationSource, /is_free = true/)
  assert.match(migrationSource, /automatic_conversion_enabled = false/)
  assert.match(migrationSource, /revoke all on function public\.activate_business_pilot_application/)
  assert.match(migrationSource, /grant execute on function public\.activate_business_pilot_application[\s\S]+to service_role/)
  assert.match(migrationSource, /commit;\s*$/)
  assert.doesNotMatch(migrationSource, /business_subscriptions|stripe/i)
})

test('existing company owners keep the legal registration while pilot contacts become team members', () => {
  assert.match(teamRegistrationMigrationSource, /rename to activate_business_pilot_application_v1/)
  assert.match(teamRegistrationMigrationSource, /v_member_registration := 'TEAM-'/)
  assert.match(teamRegistrationMigrationSource, /user_id <> v_contact_user_id/)
  assert.match(teamRegistrationMigrationSource, /public\.activate_business_pilot_application_v1/)
  assert.match(teamRegistrationMigrationSource, /revoke all on function public\.activate_business_pilot_application_v1/)
  assert.match(teamRegistrationMigrationSource, /grant execute on function public\.activate_business_pilot_application[\s\S]+to service_role/)
})

test('admin activation, status visibility and direct inventory link are wired', () => {
  assert.match(adminApiSource, /admin\.rpc\('activate_business_pilot_application'/)
  assert.match(adminApiSource, /action === 'activate_pilot' \|\| action === 'pilot_active'/)
  assert.match(adminControlsSource, /Godkänn och starta pilot/)
  assert.match(adminPageSource, /Öppna företagets lageranslutning/)
  assert.match(adminPageSource, /Kopplade användare/)
  assert.match(adminPageSource, /Lagerimportåtkomst/)
  assert.match(adminPageSource, /requiredInventoryFlags\.every/)
})

test('pilot-start emails link directly to inventory in every supported language', () => {
  assert.match(pilotEmailSource, /input\.kind === 'pilot_active' \? '\/account\/company\/inventory'/)
  assert.equal((pilotEmailSource.match(/^  [a-z]{2}: .*openInventory:/gm) || []).length, 10)
})
