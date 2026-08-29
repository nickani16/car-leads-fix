import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const compact = JSON.parse(
  readFileSync(new URL('lib/generated-public-client-translations.json', root), 'utf8'),
)
const full = JSON.parse(
  readFileSync(new URL('lib/generated-public-translations.json', root), 'utf8'),
)

test('the public shell uses the compact client dictionary', () => {
  const clientEntryPoints = [
    'app/components/PublicHeader.tsx',
    'app/components/PublicFooter.tsx',
    'app/components/CookieConsent.tsx',
    'app/components/HomeHeroVehicleSearch.tsx',
    'app/components/AuthModal.tsx',
    'app/components/EmailCodeAuth.tsx',
    'lib/category-landings.ts',
    'lib/listing-display.ts',
  ]

  for (const file of clientEntryPoints) {
    const source = readFileSync(new URL(file, root), 'utf8')
    assert.doesNotMatch(source, /(?:@\/lib|\.)\/public-i18n['"]/)
  }
})

test('the compact dictionary stays small and matches the server translations', () => {
  const compactSize = statSync(
    new URL('lib/generated-public-client-translations.json', root),
  ).size
  assert.ok(compactSize < 400_000, `compact dictionary is ${compactSize} bytes`)

  const locales = ['fr', 'es', 'it', 'pl', 'nl', 'fi', 'da']
  assert.deepEqual(Object.keys(compact), locales)
  for (const locale of locales) {
    assert.ok(Object.keys(compact[locale]).length > 600)
    for (const [key, value] of Object.entries(compact[locale])) {
      assert.equal(value, full[locale][key])
    }
  }
})

test('only the mobile hero is an eager high-priority request', () => {
  const source = readFileSync(
    new URL('app/components/BusinessMarketplaceHome.tsx', root),
    'utf8',
  )
  const mobile = source.match(
    /src="\/autorell-home-mobile-market-hero\.webp"[\s\S]*?\/>/,
  )?.[0]
  const desktop = source.match(
    /src="\/autorell-home-desktop-market-hero\.webp"[\s\S]*?\/>/,
  )?.[0]

  assert.match(mobile || '', /fetchPriority="high"/)
  assert.doesNotMatch(mobile || '', /\bpriority\b/)
  assert.match(desktop || '', /loading="lazy"/)
  assert.doesNotMatch(desktop || '', /\bpriority\b|fetchPriority="high"/)
})
