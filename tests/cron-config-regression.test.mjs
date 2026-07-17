import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const vercelConfig = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const retiredNotificationsCron = readFileSync(new URL('../app/api/cron/notifications/route.ts', import.meta.url), 'utf8')

test('production cron config does not include removed notifications job', () => {
  const paths = Array.isArray(vercelConfig.crons)
    ? vercelConfig.crons.map((cron) => cron.path)
    : []

  assert.deepEqual(paths, ['/api/cron/business-billing'])
  assert.doesNotMatch(JSON.stringify(vercelConfig), /\/api\/cron\/notifications/)
})

test('retired notifications cron endpoint is auth protected and side-effect free', () => {
  assert.match(retiredNotificationsCron, /process\.env\.CRON_SECRET/)
  assert.match(retiredNotificationsCron, /request\.headers\.get\('authorization'\) !== `Bearer \$\{cronSecret\}`/)
  assert.match(retiredNotificationsCron, /status: 204/)
  assert.match(retiredNotificationsCron, /notifications-retired/)
  assert.doesNotMatch(retiredNotificationsCron, /createAdminClient|send[A-Z]|\.from\(/)
})
