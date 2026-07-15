import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const permissions = read('lib/admin/permissions.ts')
const context = read('lib/admin/context.ts')
const routeAuth = read('lib/admin-route-auth.ts')
const shell = read('app/admin/AdminShell.tsx')
const proxy = read('proxy.ts')
const userRoute = read('app/api/admin/users/[id]/route.ts')
const listingRoute = read('app/api/admin/marketplace-listings/[id]/route.ts')
const reportRoute = read('app/api/admin/reports/[id]/route.ts')
const staffRoute = read('app/api/admin/staff/[id]/route.ts')
const migration = read('supabase/migrations/20260713213000_admin_rbac_foundation.sql')

test('phase one defines the requested specialist roles and fine-grained permissions', () => {
  for (const role of [
    'super_admin',
    'operations_admin',
    'moderator',
    'support_admin',
    'finance_admin',
    'content_editor',
    'analyst',
  ]) {
    assert.match(permissions, new RegExp(`'${role}'`))
    assert.match(migration, new RegExp(`'${role}'`))
  }

  assert.match(permissions, /analyst: \['dashboard\.view', 'analytics\.read'\]/)
  assert.doesNotMatch(permissions, /analyst:[\s\S]{0,120}users\.manage/)
  assert.doesNotMatch(permissions, /content_editor:[\s\S]{0,250}security\.read/)
  assert.doesNotMatch(permissions, /support_admin:[\s\S]{0,250}administrators\.manage/)
})

test('authorization is server-controlled and legacy access is only a migration bridge', () => {
  assert.match(context, /supabase\.auth\.getUser\(\)/)
  assert.match(context, /user_admin_roles/)
  assert.match(context, /admin_role_permissions/)
  assert.match(context, /readLegacyAccess/)
  assert.match(context, /isAllowedAdminEmail/)
  assert.match(routeAuth, /status: 401/)
  assert.match(routeAuth, /status: 403/)
  assert.match(routeAuth, /contextHasPermission/)
})

test('admin pages and APIs require an aal2 MFA session', () => {
  const pageAuth = read('lib/admin-auth.ts')
  const routeAuth = read('lib/admin-route-auth.ts')
  const mfaPage = read('app/admin/mfa/AdminMfaSetup.tsx')

  assert.match(pageAuth, /assuranceLevel !== 'aal2'/)
  assert.match(pageAuth, /redirect\('\/login\?next=\/admin'\)/)
  assert.doesNotMatch(pageAuth, /redirect\('\/se'\)/)
  assert.match(pageAuth, /redirect\('\/admin\/mfa'\)/)
  assert.match(routeAuth, /MFA_REQUIRED/)
  assert.match(mfaPage, /auth\.mfa\.enroll/)
  assert.match(mfaPage, /auth\.mfa\.challenge/)
  assert.match(mfaPage, /auth\.mfa\.verify/)
})

test('admin routes bypass market redirects so admin auth can run', () => {
  assert.match(proxy, /const isAdminRoute = pathname === '\/admin' \|\| pathname\.startsWith\('\/admin\/'\)/)
  assert.match(proxy, /!isAccountRoute &&\s*!isAdminRoute &&/)
})

test('sensitive routes enforce exact permissions instead of a shared super-admin boolean', () => {
  assert.match(userRoute, /companies\.verify/)
  assert.match(userRoute, /users\.delete/)
  assert.match(userRoute, /users\.manage/)
  assert.match(listingRoute, /listings\.delete/)
  assert.match(listingRoute, /moderation\.manage/)
  assert.match(reportRoute, /requireAdminRoute\('reports\.manage'\)/)
})

test('staff password mutation is rejected and onboarding uses an email invitation', () => {
  assert.match(staffRoute, /Administratörer får inte sätta eller återställa användarlösenord/)
  assert.doesNotMatch(staffRoute, /updateUserById\([\s\S]*password:/)
  assert.match(read('app/api/admin/staff/route.ts'), /inviteUserByEmail/)
})

test('admin navigation is permission-filtered and responsive', () => {
  assert.match(shell, /navigationForPermissions\(permissions\)/)
  assert.match(shell, /aria-label="Öppna adminmeny"/)
  assert.match(shell, /Fäll ihop navigation/)
  assert.match(shell, /RBAC aktiv/)
})

test('RBAC tables are RLS protected and audit is append-only for service role', () => {
  for (const table of [
    'admin_roles',
    'admin_permissions',
    'admin_role_permissions',
    'user_admin_roles',
    'admin_notes',
    'admin_saved_views',
  ]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'))
    assert.match(migration, new RegExp(`revoke all on table public\\.${table} from anon, authenticated`, 'i'))
  }
  assert.match(migration, /revoke all on table public\.admin_audit_log from service_role/i)
  assert.match(migration, /grant select, insert on table public\.admin_audit_log to service_role/i)
  assert.doesNotMatch(migration, /grant[^;]*update[^;]*admin_audit_log[^;]*service_role/i)
})
