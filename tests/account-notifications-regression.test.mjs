import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const route = readFileSync(new URL('../app/api/account/notifications/route.ts', import.meta.url), 'utf8')
const messagesRoute = readFileSync(new URL('../app/api/account/messages/route.ts', import.meta.url), 'utf8')

test('account notification reads and bulk mutations are scoped to the authenticated user', () => {
  assert.match(route, /supabase\.auth\.getUser\(\)/)
  assert.equal((route.match(/\.eq\('recipient_user_id', user\.id\)/g) || []).length, 3)
  assert.equal((route.match(/\.contains\('channels', \['in_app'\]\)/g) || []).length, 3)
  assert.match(route, /export async function PATCH\(\)/)
  assert.match(route, /export async function DELETE\(\)/)
  assert.match(route, /'Cache-Control': 'private, no-store, max-age=0'/)
})

test('new marketplace messages create an in-app notification and keep email delivery', () => {
  assert.match(messagesRoute, /event_type: 'marketplace_message'/)
  assert.match(messagesRoute, /channels: \['in_app'\]/)
  assert.match(messagesRoute, /dedupe_key: `marketplace-message-\$\{messageId\}`/)
  assert.match(messagesRoute, /new Resend\(resendKey\)/)
  assert.match(messagesRoute, /localizedAccountUrl\(messagePath, locale\)/)
  for (const locale of ['sv', 'en', 'de', 'fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']) {
    assert.match(messagesRoute, new RegExp(`\\n  ${locale}: \\{`))
  }
})
