import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const publicFooter = readFileSync(new URL('../app/components/PublicFooter.tsx', import.meta.url), 'utf8')
const marketplace = readFileSync(new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url), 'utf8')

test('footer menu headings and links use the requested charcoal color', () => {
  assert.match(publicFooter, /text-\[#2a2a37\]">\{title\}<\/h3>/)
  assert.match(publicFooter, /text-\[#2a2a37\]">[\s\S]*?links\.map/)
  assert.match(marketplace, /text-\[#2a2a37\]">\{column\.title\}<\/p>/)
  assert.match(marketplace, /text-\[#2a2a37\]">[\s\S]*?column\.links\.map/)
})
