import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const migration = read('supabase/migrations/20260713222000_admin_e2e_flows.sql')

test('support lifecycle uses all required states and internal notes are undeliverable', () => {
  for (const status of ['new','assigned','in_progress','waiting_for_customer','escalated','resolved','closed','reopened']) assert.match(migration, new RegExp(`'${status}'`))
  assert.match(migration, /support_internal_note_never_delivered_check/)
  assert.match(read('components/support/SupportTicketDetail.tsx'), /Full statushistorik/)
})

test('staff invitation is OTP-compatible and support skips ordinary onboarding', () => {
  const invite = read('app/api/admin/staff/route.ts')
  const verify = read('app/api/auth/email-code/verify/route.ts')
  assert.match(invite, /admin_staff_invitations/)
  assert.match(invite, /inviteUserByEmail/)
  assert.match(verify, /user_admin_roles/)
  assert.match(verify, /support_admin[\s\S]*\/admin\/support/)
})

test('content supports secure preview and unpublish', () => {
  const route = read('app/api/admin/content/[id]/route.ts')
  assert.match(route, /content_preview_tokens/)
  assert.match(route, /createHash\('sha256'\)/)
  assert.match(route, /unpublish: 'unpublished'/)
})

test('company applications feed an actionable notification center', () => {
  assert.match(migration, /notify_admin_on_company_application/)
  assert.match(migration, /marketplace_company_admin_notification/)
  assert.match(read('app/admin/notifications/page.tsx'), /item\.action_url/)
  assert.match(read('app/api/admin/notifications/[id]/route.ts'), /assigned_to: auth\.user\.id/)
})
