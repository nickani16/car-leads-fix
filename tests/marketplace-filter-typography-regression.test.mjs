import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const experienceSource = readFileSync(
  new URL('../app/components/VehicleSearchExperience.tsx', import.meta.url),
  'utf8',
)
const footerSource = readFileSync(
  new URL('../app/components/PublicFooter.tsx', import.meta.url),
  'utf8',
)

test('marketplace filter surfaces use the intended heading and body weights', () => {
  assert.match(
    experienceSource,
    /<h2 className="min-w-0 text-\[16px\] !font-medium[^>]*>\s*\{title\}/,
  )
  assert.match(
    experienceSource,
    /marketplace-scrollbar max-h-\[calc\(min\(74vh,560px\)-65px\)\][^"\n]*font-normal \[&_\*\]:!font-normal/,
  )
  assert.match(
    experienceSource,
    /<p className="min-w-0 text-\[17px\] font-semibold[^>]*>\{uiText\(locale, 'Filter'/,
  )
  assert.match(
    experienceSource,
    /min-h-0 flex-1 space-y-4[^"\n]*font-normal[^"\n]*\[&_\*\]:!font-normal/,
  )
})

test('market selector search text uses small regular gray typography in Safari', () => {
  assert.match(
    footerSource,
    /placeholder=\{dialogCopy\.search\} className="[^"]*text-\[13px\] font-normal text-\[#667085\][^"]*placeholder:font-normal placeholder:text-\[#667085\] placeholder:opacity-100/,
  )
})
