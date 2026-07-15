import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const api = readFileSync(new URL('../app/api/saved-searches/route.ts', import.meta.url), 'utf8')
const client = readFileSync(new URL('../app/components/SavedSearchesClient.tsx', import.meta.url), 'utf8')
const migration = readFileSync(new URL('../supabase/migrations/20260715223000_saved_search_notification_preferences.sql', import.meta.url), 'utf8')

test('saved searches expose owned notification preferences', () => {
  assert.match(migration, /add column if not exists notification_frequency text not null default 'off'/)
  assert.match(migration, /check \(notification_frequency in \('off', 'daily', 'instant'\)\)/)
  assert.match(migration, /where notification_frequency <> 'off'/)
  assert.match(api, /SAVED_SEARCH_SELECT[\s\S]*notification_frequency/)
  assert.match(api, /const NOTIFICATION_FREQUENCIES = new Set\(\['off', 'daily', 'instant'\]\)/)
  assert.match(api, /export async function PATCH/)
  assert.match(api, /\.eq\('user_id', user\.id\)[\s\S]*\.eq\('id', id\)/)
  assert.match(api, /notification_frequency: cleanNotificationFrequency\(body\.notificationFrequency\)/)
  assert.match(client, /updateFrequency\(search\.id/)
  assert.match(client, /<option value="off">/)
  assert.match(client, /<option value="daily">/)
  assert.match(client, /<option value="instant">/)
  assert.match(client, /translatePublicObject\(locale, en\)/)
})
