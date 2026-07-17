import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const vercelConfig = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))

test('production cron config does not include removed notifications job', () => {
  const paths = Array.isArray(vercelConfig.crons)
    ? vercelConfig.crons.map((cron) => cron.path)
    : []

  assert.deepEqual(paths, ['/api/cron/business-billing'])
  assert.doesNotMatch(JSON.stringify(vercelConfig), /\/api\/cron\/notifications/)
})
