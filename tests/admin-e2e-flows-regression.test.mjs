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

test('newsletter test delivery stays private and has web and unsubscribe flows', () => {
  const testRoute = read('app/api/admin/newsletters/[id]/test/route.ts')
  const deliveryMigration = read('supabase/migrations/20260714044025_admin_delivery_flows.sql')
  assert.match(testRoute, /is_test: true/)
  assert.match(testRoute, /public: false/)
  assert.doesNotMatch(testRoute, /newsletter_campaigns[^;]*update\([^)]*status/) // campaign status is never changed
  assert.match(testRoute, /newsletter_preview_tokens/)
  assert.match(read('app/api/newsletter/unsubscribe/route.ts'), /status: 'unsubscribed'/)
  assert.match(deliveryMigration, /newsletter_preview_tokens/)
})

test('support and company notifications have outbound delivery while internal notes remain isolated', () => {
  const support = read('app/api/admin/support/tickets/[id]/route.ts')
  const registration = read('app/api/account/register/route.ts')
  assert.match(support, /isInternal[\s\S]*delivery_status: isInternal \? 'not_applicable' : 'queued'/)
  assert.match(support, /new Resend/)
  assert.match(registration, /sendAdminNotificationEmail/)
})

test('CMS drafts can select media from the real media library', () => {
  const form = read('app/admin/AdminDraftForm.tsx')
  const contentRoute = read('app/api/admin/content/route.ts')
  assert.match(read('app/api/admin/media/route.ts'), /export async function GET/)
  assert.match(form, /hero_media_id/)
  assert.match(form, /hero_file/)
  assert.match(form, /content_blocks/)
  assert.match(form, /H\{level\}/)
  assert.match(contentRoute, /parseContentBlocks/)
  assert.match(contentRoute, /content_post_media/)
  assert.match(contentRoute, /content_post_versions/)
  assert.match(contentRoute, /reading_time_minutes/)
  assert.match(read('app/[market]/vehicle-news/[slug]/page.tsx'), /ArticleBodyBlock/)
})

test('admin MFA recovers interrupted enrollment and normalizes the QR source', () => {
  const setup = read('app/admin/mfa/AdminMfaSetup.tsx')
  assert.match(setup, /factors\.data\.all\.filter/)
  assert.match(setup, /item\.factor_type === 'totp'/)
  assert.match(setup, /if \(unenrolled\.error\) throw unenrolled\.error/)
  assert.match(setup, /qr_code\.trimEnd\(\)/)
})
