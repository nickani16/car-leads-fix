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
const globalStyles = readFileSync(
  new URL('../app/globals.css', import.meta.url),
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

test('market selector search uses a dedicated class that overrides global mobile input styles', () => {
  assert.match(
    footerSource,
    /placeholder=\{dialogCopy\.search\} className="market-selector-search /,
  )
  assert.match(
    globalStyles,
    /input\.market-selector-search\s*\{[^}]*-webkit-text-fill-color:\s*#101828\s*!important;[^}]*font-size:\s*13px\s*!important;/s,
  )
  assert.match(
    globalStyles,
    /input\.market-selector-search::placeholder,\s*input\.market-selector-search::-webkit-input-placeholder\s*\{[^}]*color:\s*#667085\s*!important;[^}]*-webkit-text-fill-color:\s*#667085\s*!important;[^}]*font-size:\s*13px\s*!important;[^}]*opacity:\s*1\s*!important;/s,
  )
})
