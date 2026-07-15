import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const migration = read('supabase/migrations/20260713220000_admin_control_center_phases_2_6.sql')
const navigation = read('lib/admin/navigation.ts')

test('phases 2-6 admin destinations are permission filtered and enabled', () => {
  for (const route of [
    '/admin/support', '/admin/payments', '/admin/subscriptions', '/admin/content',
    '/admin/newsletters', '/admin/media', '/admin/markets', '/admin/vehicle-data',
    '/admin/security', '/admin/system',
  ]) {
    assert.match(navigation, new RegExp(`${route.replaceAll('/', '\\/')}[^\n]+available: true`))
  }
  assert.match(navigation, /navigationForPermissions/)
})

test('control-center mutations use exact permissions and audit logging', () => {
  const routes = [
    ['app/api/admin/content/route.ts', 'content.manage'],
    ['app/api/admin/content/[id]/route.ts', 'content.manage'],
    ['app/api/admin/newsletters/route.ts', 'newsletters.manage'],
    ['app/api/admin/newsletters/[id]/route.ts', 'newsletters.manage'],
    ['app/api/admin/media/[id]/route.ts', 'media.manage'],
    ['app/api/admin/system-alerts/[id]/route.ts', 'system.manage'],
    ['app/api/admin/finance-cases/route.ts', 'payments.manage'],
    ['app/api/admin/security/ip-blocks/route.ts', 'security.manage'],
    ['app/api/admin/moderation-cases/[id]/route.ts', 'moderation.manage'],
    ['app/api/admin/verifications/[id]/route.ts', 'companies.verify'],
  ]
  for (const [file, permission] of routes) {
    const source = read(file)
    assert.match(source, new RegExp(`requireAdminRoute\\('${permission.replace('.', '\\.')}\\'\\)`))
    assert.match(source, /writeAdminAuditLog/)
  }
})

test('newsletter admin cannot initiate sending', () => {
  const route = read('app/api/admin/newsletters/[id]/route.ts')
  assert.doesNotMatch(route, /status:\s*['"]sending['"]/)
  assert.doesNotMatch(route, /status:\s*['"]sent['"]/)
  assert.match(route, /\['sending', 'sent'\]/)
})

test('security blocks are bounded and audit logs redact the network', () => {
  const route = read('app/api/admin/security/ip-blocks/route.ts')
  assert.match(route, /durationHours > 720/)
  assert.match(route, /ip_network: '\[redacted\]'/)
  assert.match(route, /isIP/)
})

test('phases 2-6 schema is server-only, RLS protected, and evidence is append-only', () => {
  for (const table of [
    'business_verification_requests', 'moderation_cases', 'admin_finance_cases',
    'support_chat_sessions', 'support_tickets', 'content_posts', 'media_assets',
    'newsletter_campaigns', 'security_events', 'ip_blocks', 'system_alerts',
  ]) {
    assert.match(migration, new RegExp(`create table if not exists public\\.${table}`))
  }
  assert.match(migration, /enable row level security/)
  assert.match(migration, /revoke all on table public\.%I from anon, authenticated/)
  assert.match(migration, /subscriber_id bigint references public\.newsletter_subscribers\(id\)/)
  for (const table of ['business_verification_events', 'moderation_actions', 'support_ticket_events', 'security_events']) {
    assert.match(migration, new RegExp(`revoke update, delete on table public\\.${table} from service_role`))
  }
})
